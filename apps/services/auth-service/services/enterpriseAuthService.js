const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { AuthenticationResult } = require('@azure/msal-node');
const saml2 = require('saml2-js');
const ldap = require('ldapjs');
const db = require('../config/database');

/**
 * Enterprise Authentication Service
 * Supports multiple authentication providers and enterprise SSO
 */
class EnterpriseAuthService {
  constructor() {
    this.providers = {
      azure_ad: new AzureADProvider(),
      okta: new OktaProvider(),
      ping_identity: new PingIdentityProvider(),
      saml: new SAMLProvider(),
      ldap: new LDAPProvider(),
      local: new LocalAuthProvider()
    };
    
    this.jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
    this.jwtExpiresIn = process.env.JWT_EXPIRES_IN || '24h';
  }
  
  /**
   * Authenticate user with specified provider
   */
  async authenticateUser(provider, credentials, tenantConfig = {}) {
    try {
      console.log(`🔐 Authenticating user with provider: ${provider}`);
      
      // Validate provider
      if (!this.providers[provider]) {
        throw new Error(`Unsupported authentication provider: ${provider}`);
      }
      
      // Get tenant-specific configuration
      const providerConfig = await this.getTenantProviderConfig(tenantConfig.tenantId, provider);
      
      // Authenticate with provider
      const authProvider = this.providers[provider];
      const userInfo = await authProvider.authenticate(credentials, providerConfig);
      
      if (!userInfo || !userInfo.email) {
        throw new Error('Authentication failed: Invalid user information');
      }
      
      // Get or create user in local database
      const user = await this.getOrCreateUser(userInfo, tenantConfig.tenantId, provider);
      
      // Map enterprise roles to GRC roles
      const grcRoles = await this.mapEnterpriseRoles(
        userInfo.roles || [],
        tenantConfig.roleMapping || {},
        tenantConfig.tenantId
      );
      
      // Calculate permissions
      const permissions = await this.calculatePermissions(grcRoles, tenantConfig.tenantId);
      
      // Generate JWT token
      const token = this.generateJWT(user, grcRoles, tenantConfig.tenantId);
      
      // Log authentication event
      await this.logAuthenticationEvent(user.id, provider, 'success', tenantConfig.tenantId);
      
      return {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          avatar: user.avatar,
          lastLogin: new Date().toISOString()
        },
        roles: grcRoles,
        permissions,
        token,
        expiresIn: this.jwtExpiresIn,
        provider
      };
      
    } catch (error) {
      console.error(`❌ Authentication failed for provider ${provider}:`, error);
      
      // Log failed authentication
      if (credentials.email) {
        await this.logAuthenticationEvent(null, provider, 'failed', tenantConfig.tenantId, error.message);
      }
      
      throw error;
    }
  }
  
  /**
   * Get tenant-specific provider configuration
   */
  async getTenantProviderConfig(tenantId, provider) {
    try {
      const query = `
        SELECT config 
        FROM tenant_auth_providers 
        WHERE tenant_id = ? AND provider = ? AND is_active = true
      `;
      
      const [rows] = await db.execute(query, [tenantId, provider]);
      
      if (rows.length === 0) {
        // Return default configuration
        return this.getDefaultProviderConfig(provider);
      }
      
      return JSON.parse(rows[0].config);
    } catch (error) {
      console.error('Error getting tenant provider config:', error);
      return this.getDefaultProviderConfig(provider);
    }
  }
  
  /**
   * Get default provider configuration
   */
  getDefaultProviderConfig(provider) {
    const defaultConfigs = {
      azure_ad: {
        clientId: process.env.AZURE_AD_CLIENT_ID,
        clientSecret: process.env.AZURE_AD_CLIENT_SECRET,
        tenantId: process.env.AZURE_AD_TENANT_ID,
        authority: `https://login.microsoftonline.com/${process.env.AZURE_AD_TENANT_ID}`
      },
      okta: {
        domain: process.env.OKTA_DOMAIN,
        clientId: process.env.OKTA_CLIENT_ID,
        clientSecret: process.env.OKTA_CLIENT_SECRET
      },
      saml: {
        entryPoint: process.env.SAML_ENTRY_POINT,
        issuer: process.env.SAML_ISSUER,
        cert: process.env.SAML_CERT
      },
      ldap: {
        url: process.env.LDAP_URL,
        baseDN: process.env.LDAP_BASE_DN,
        bindDN: process.env.LDAP_BIND_DN,
        bindCredentials: process.env.LDAP_BIND_PASSWORD
      }
    };
    
    return defaultConfigs[provider] || {};
  }
  
  /**
   * Get or create user in local database
   */
  async getOrCreateUser(userInfo, tenantId, provider) {
    try {
      // Check if user exists
      const existingUserQuery = `
        SELECT * FROM users 
        WHERE email = ? AND (tenant_id = ? OR tenant_id IS NULL)
      `;
      
      const [existingUsers] = await db.execute(existingUserQuery, [userInfo.email, tenantId]);
      
      if (existingUsers.length > 0) {
        // Update last login and provider info
        const updateQuery = `
          UPDATE users 
          SET last_login = NOW(), auth_provider = ?, provider_user_id = ?
          WHERE id = ?
        `;
        
        await db.execute(updateQuery, [
          provider,
          userInfo.id || userInfo.sub,
          existingUsers[0].id
        ]);
        
        return existingUsers[0];
      }
      
      // Create new user
      const createUserQuery = `
        INSERT INTO users (
          tenant_id, email, name, avatar, auth_provider, provider_user_id,
          created_at, updated_at, last_login, is_active
        ) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW(), NOW(), true)
      `;
      
      const [result] = await db.execute(createUserQuery, [
        tenantId,
        userInfo.email,
        userInfo.name || userInfo.displayName,
        userInfo.avatar || userInfo.picture,
        provider,
        userInfo.id || userInfo.sub
      ]);
      
      // Get the created user
      const [newUser] = await db.execute('SELECT * FROM users WHERE id = ?', [result.insertId]);
      
      return newUser[0];
    } catch (error) {
      console.error('Error getting or creating user:', error);
      throw error;
    }
  }
  
  /**
   * Map enterprise roles to GRC roles
   */
  async mapEnterpriseRoles(enterpriseRoles, roleMapping, tenantId) {
    try {
      const grcRoles = [];
      
      // Apply role mapping
      for (const enterpriseRole of enterpriseRoles) {
        if (roleMapping[enterpriseRole]) {
          grcRoles.push(roleMapping[enterpriseRole]);
        }
      }
      
      // If no roles mapped, assign default role
      if (grcRoles.length === 0) {
        grcRoles.push('user'); // Default role
      }
      
      // Validate roles exist in the system
      const validRoles = await this.validateRoles(grcRoles, tenantId);
      
      return validRoles;
    } catch (error) {
      console.error('Error mapping enterprise roles:', error);
      return ['user']; // Fallback to default role
    }
  }
  
  /**
   * Validate roles exist in the system
   */
  async validateRoles(roles, tenantId) {
    try {
      const placeholders = roles.map(() => '?').join(',');
      const query = `
        SELECT name FROM roles 
        WHERE name IN (${placeholders}) AND (tenant_id = ? OR tenant_id IS NULL)
      `;
      
      const [validRoleRows] = await db.execute(query, [...roles, tenantId]);
      const validRoles = validRoleRows.map(row => row.name);
      
      // If no valid roles found, return default
      return validRoles.length > 0 ? validRoles : ['user'];
    } catch (error) {
      console.error('Error validating roles:', error);
      return ['user'];
    }
  }
  
  /**
   * Calculate permissions based on roles
   */
  async calculatePermissions(roles, tenantId) {
    try {
      const placeholders = roles.map(() => '?').join(',');
      const query = `
        SELECT DISTINCT p.name, p.resource, p.action
        FROM permissions p
        JOIN role_permissions rp ON p.id = rp.permission_id
        JOIN roles r ON rp.role_id = r.id
        WHERE r.name IN (${placeholders}) AND (r.tenant_id = ? OR r.tenant_id IS NULL)
      `;
      
      const [permissionRows] = await db.execute(query, [...roles, tenantId]);
      
      // Group permissions by resource
      const permissions = {};
      permissionRows.forEach(perm => {
        if (!permissions[perm.resource]) {
          permissions[perm.resource] = [];
        }
        permissions[perm.resource].push(perm.action);
      });
      
      return permissions;
    } catch (error) {
      console.error('Error calculating permissions:', error);
      return {};
    }
  }
  
  /**
   * Generate JWT token
   */
  generateJWT(user, roles, tenantId) {
    const payload = {
      userId: user.id,
      email: user.email,
      name: user.name,
      roles,
      tenantId,
      iat: Math.floor(Date.now() / 1000)
    };
    
    return jwt.sign(payload, this.jwtSecret, {
      expiresIn: this.jwtExpiresIn,
      issuer: 'grc-platform',
      audience: 'grc-users'
    });
  }
  
  /**
   * Verify JWT token
   */
  verifyJWT(token) {
    try {
      return jwt.verify(token, this.jwtSecret, {
        issuer: 'grc-platform',
        audience: 'grc-users'
      });
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }
  
  /**
   * Log authentication event
   */
  async logAuthenticationEvent(userId, provider, status, tenantId, errorMessage = null) {
    try {
      const query = `
        INSERT INTO auth_logs (
          user_id, tenant_id, provider, status, error_message, 
          ip_address, user_agent, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
      `;
      
      await db.execute(query, [
        userId,
        tenantId,
        provider,
        status,
        errorMessage,
        null, // IP address would be set by middleware
        null  // User agent would be set by middleware
      ]);
    } catch (error) {
      console.error('Error logging authentication event:', error);
      // Don't throw - logging failures shouldn't break authentication
    }
  }
  
  /**
   * Refresh JWT token
   */
  async refreshToken(oldToken) {
    try {
      // Verify old token (even if expired)
      const decoded = jwt.decode(oldToken);
      
      if (!decoded || !decoded.userId) {
        throw new Error('Invalid token');
      }
      
      // Get current user data
      const [userRows] = await db.execute('SELECT * FROM users WHERE id = ?', [decoded.userId]);
      
      if (userRows.length === 0) {
        throw new Error('User not found');
      }
      
      const user = userRows[0];
      
      // Get current roles
      const roles = await this.getUserRoles(user.id, decoded.tenantId);
      
      // Generate new token
      const newToken = this.generateJWT(user, roles, decoded.tenantId);
      
      return {
        token: newToken,
        expiresIn: this.jwtExpiresIn,
        user: {
          id: user.id,
          email: user.email,
          name: user.name
        }
      };
    } catch (error) {
      console.error('Error refreshing token:', error);
      throw error;
    }
  }
  
  /**
   * Get user roles
   */
  async getUserRoles(userId, tenantId) {
    try {
      const query = `
        SELECT r.name
        FROM roles r
        JOIN user_roles ur ON r.id = ur.role_id
        WHERE ur.user_id = ? AND (r.tenant_id = ? OR r.tenant_id IS NULL)
      `;
      
      const [roleRows] = await db.execute(query, [userId, tenantId]);
      
      return roleRows.map(row => row.name);
    } catch (error) {
      console.error('Error getting user roles:', error);
      return ['user'];
    }
  }
}

/**
 * Azure AD Authentication Provider
 */
class AzureADProvider {
  async authenticate(credentials, config) {
    const { ConfidentialClientApplication } = require('@azure/msal-node');
    
    const clientApp = new ConfidentialClientApplication({
      auth: {
        clientId: config.clientId,
        clientSecret: config.clientSecret,
        authority: config.authority
      }
    });
    
    try {
      const response = await clientApp.acquireTokenByUsernamePassword({
        scopes: ['https://graph.microsoft.com/.default'],
        username: credentials.email,
        password: credentials.password
      });
      
      // Get user info from Microsoft Graph
      const userInfo = await this.getMicrosoftGraphUser(response.accessToken);
      
      return userInfo;
    } catch (error) {
      throw new Error(`Azure AD authentication failed: ${error.message}`);
    }
  }
  
  async getMicrosoftGraphUser(accessToken) {
    const axios = require('axios');
    
    try {
      const response = await axios.get('https://graph.microsoft.com/v1.0/me', {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      
      return {
        id: response.data.id,
        email: response.data.mail || response.data.userPrincipalName,
        name: response.data.displayName,
        avatar: null, // Could fetch from Graph API
        roles: [] // Would need to fetch group memberships
      };
    } catch (error) {
      throw new Error(`Failed to get user info from Microsoft Graph: ${error.message}`);
    }
  }
}

/**
 * LDAP Authentication Provider
 */
class LDAPProvider {
  async authenticate(credentials, config) {
    return new Promise((resolve, reject) => {
      const client = ldap.createClient({
        url: config.url,
        timeout: 5000,
        connectTimeout: 10000
      });
      
      // Bind with service account
      client.bind(config.bindDN, config.bindCredentials, (bindErr) => {
        if (bindErr) {
          client.unbind();
          return reject(new Error(`LDAP bind failed: ${bindErr.message}`));
        }
        
        // Search for user
        const searchFilter = `(mail=${credentials.email})`;
        const searchOptions = {
          scope: 'sub',
          filter: searchFilter,
          attributes: ['cn', 'mail', 'displayName', 'memberOf']
        };
        
        client.search(config.baseDN, searchOptions, (searchErr, searchRes) => {
          if (searchErr) {
            client.unbind();
            return reject(new Error(`LDAP search failed: ${searchErr.message}`));
          }
          
          let userDN = null;
          let userInfo = null;
          
          searchRes.on('searchEntry', (entry) => {
            userDN = entry.objectName;
            userInfo = {
              id: entry.objectName,
              email: entry.object.mail,
              name: entry.object.displayName || entry.object.cn,
              roles: entry.object.memberOf || []
            };
          });
          
          searchRes.on('end', () => {
            if (!userDN) {
              client.unbind();
              return reject(new Error('User not found in LDAP'));
            }
            
            // Authenticate user
            client.bind(userDN, credentials.password, (authErr) => {
              client.unbind();
              
              if (authErr) {
                return reject(new Error('Invalid LDAP credentials'));
              }
              
              resolve(userInfo);
            });
          });
          
          searchRes.on('error', (err) => {
            client.unbind();
            reject(new Error(`LDAP search error: ${err.message}`));
          });
        });
      });
    });
  }
}

/**
 * Local Authentication Provider (username/password)
 */
class LocalAuthProvider {
  async authenticate(credentials, config) {
    try {
      const query = 'SELECT * FROM users WHERE email = ? AND auth_provider = ?';
      const [users] = await db.execute(query, [credentials.email, 'local']);
      
      if (users.length === 0) {
        throw new Error('User not found');
      }
      
      const user = users[0];
      
      // Verify password
      const isValidPassword = await bcrypt.compare(credentials.password, user.password_hash);
      
      if (!isValidPassword) {
        throw new Error('Invalid password');
      }
      
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        roles: [] // Will be fetched separately
      };
    } catch (error) {
      throw new Error(`Local authentication failed: ${error.message}`);
    }
  }
}

/**
 * Placeholder providers (to be implemented based on specific needs)
 */
class OktaProvider {
  async authenticate(credentials, config) {
    throw new Error('Okta provider not yet implemented');
  }
}

class PingIdentityProvider {
  async authenticate(credentials, config) {
    throw new Error('PingIdentity provider not yet implemented');
  }
}

class SAMLProvider {
  async authenticate(credentials, config) {
    throw new Error('SAML provider not yet implemented');
  }
}

module.exports = EnterpriseAuthService;

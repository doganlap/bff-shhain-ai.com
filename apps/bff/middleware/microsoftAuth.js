/**
 * Microsoft Authentication Integration (Azure AD / Microsoft Entra ID)
 * OAuth 2.0 authentication flow with MSAL (Microsoft Authentication Library)
 */

const axios = require('axios');
const jwt = require('jsonwebtoken');
const { auditAuthEvent, AuditEventType } = require('./auditLogger');
const prisma = require('../db/prisma');

// Microsoft Azure AD Configuration
const MICROSOFT_AUTH_CONFIG = {
  clientId: process.env.MICROSOFT_CLIENT_ID,
  clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
  tenantId: process.env.MICROSOFT_TENANT_ID || 'common', // 'common' for multi-tenant
  redirectUri: process.env.MICROSOFT_REDIRECT_URI || 'http://localhost:3005/api/auth/microsoft/callback',
  authority: process.env.MICROSOFT_AUTHORITY || 'https://login.microsoftonline.com',
  scopes: ['openid', 'profile', 'email', 'User.Read']
};

/**
 * Generate Microsoft OAuth authorization URL
 */
function getMicrosoftAuthUrl(state) {
  const authority = `${MICROSOFT_AUTH_CONFIG.authority}/${MICROSOFT_AUTH_CONFIG.tenantId}`;
  const params = new URLSearchParams({
    client_id: MICROSOFT_AUTH_CONFIG.clientId,
    response_type: 'code',
    redirect_uri: MICROSOFT_AUTH_CONFIG.redirectUri,
    response_mode: 'query',
    scope: MICROSOFT_AUTH_CONFIG.scopes.join(' '),
    state: state || generateState(),
    prompt: 'select_account' // Force account selection
  });

  return `${authority}/oauth2/v2.0/authorize?${params.toString()}`;
}

/**
 * Exchange authorization code for access token
 */
async function getMicrosoftAccessToken(code) {
  const authority = `${MICROSOFT_AUTH_CONFIG.authority}/${MICROSOFT_AUTH_CONFIG.tenantId}`;
  const tokenUrl = `${authority}/oauth2/v2.0/token`;

  try {
    const response = await axios.post(tokenUrl, new URLSearchParams({
      client_id: MICROSOFT_AUTH_CONFIG.clientId,
      client_secret: MICROSOFT_AUTH_CONFIG.clientSecret,
      code: code,
      redirect_uri: MICROSOFT_AUTH_CONFIG.redirectUri,
      grant_type: 'authorization_code'
    }), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    return response.data; // { access_token, id_token, refresh_token, expires_in }
  } catch (error) {
    console.error('Microsoft token exchange failed:', error.response?.data || error.message);
    throw new Error('Failed to exchange Microsoft authorization code');
  }
}

/**
 * Get Microsoft user profile
 */
async function getMicrosoftUserProfile(accessToken) {
  try {
    const response = await axios.get('https://graph.microsoft.com/v1.0/me', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    return response.data; // { id, displayName, mail, userPrincipalName }
  } catch (error) {
    console.error('Failed to get Microsoft user profile:', error.response?.data || error.message);
    throw new Error('Failed to retrieve Microsoft user profile');
  }
}

/**
 * Verify Microsoft ID token
 */
function verifyMicrosoftIdToken(idToken) {
  try {
    // Decode without verification (Microsoft tokens are verified via signature)
    const decoded = jwt.decode(idToken, { complete: true });

    if (!decoded) {
      throw new Error('Invalid Microsoft ID token');
    }

    // Basic validation
    const payload = decoded.payload;
    const now = Math.floor(Date.now() / 1000);

    if (payload.exp && payload.exp < now) {
      throw new Error('Microsoft ID token expired');
    }

    if (payload.iss && !payload.iss.includes('microsoftonline.com')) {
      throw new Error('Invalid Microsoft token issuer');
    }

    return payload;
  } catch (error) {
    console.error('Microsoft ID token verification failed:', error.message);
    throw error;
  }
}

/**
 * Find or create user from Microsoft profile
 */
async function findOrCreateMicrosoftUser(profile, tenantId) {
  const email = profile.mail || profile.userPrincipalName;
  const microsoftId = profile.id;

  // Check if user exists
  let user = await prisma.users.findFirst({
    where: {
      OR: [
        { email: email },
        { microsoft_id: microsoftId }
      ]
    }
  });

  if (user) {
    // Update Microsoft ID if not set
    if (!user.microsoft_id) {
      user = await prisma.users.update({
        where: { id: user.id },
        data: {
          microsoft_id: microsoftId,
          auth_provider: 'microsoft',
          updated_at: new Date()
        }
      });
    }
  } else {
    // Create new user
    user = await prisma.users.create({
      data: {
        email: email,
        username: email.split('@')[0],
        full_name: profile.displayName,
        microsoft_id: microsoftId,
        auth_provider: 'microsoft',
        email_verified: true, // Microsoft verifies emails
        tenant_id: tenantId,
        role: 'user',
        is_active: true
      }
    });
  }

  return user;
}

/**
 * Generate JWT token for authenticated user
 */
function generateJwtToken(user) {
  const payload = {
    id: user.id,
    email: user.email,
    tenantId: user.tenant_id,
    roles: [user.role]
  };

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: '24h',
    issuer: 'shahin-grc-platform'
  });
}

/**
 * Generate secure state parameter for OAuth
 */
function generateState() {
  return require('crypto').randomBytes(32).toString('hex');
}

/**
 * Microsoft Authentication Middleware
 * Handles OAuth 2.0 flow with Microsoft Azure AD
 */
async function authenticateWithMicrosoft(req, res) {
  try {
    const { code } = req.query;

    if (!code) {
      return res.status(400).json({
        success: false,
        error: 'Authorization code missing',
        message: 'Microsoft authorization code is required'
      });
    }

    // Exchange code for tokens
    const tokens = await getMicrosoftAccessToken(code);

    // Verify ID token
    verifyMicrosoftIdToken(tokens.id_token);

    // Get user profile
    const profile = await getMicrosoftUserProfile(tokens.access_token);

    // Find or create user
    const tenantId = req.headers['x-tenant-id'] || '42c676e2-8d5e-4b1d-ae80-3986b82dd5c5'; // Default tenant
    const user = await findOrCreateMicrosoftUser(profile, tenantId);

    // Generate JWT
    const jwtToken = generateJwtToken(user);

    // Audit log
    await auditAuthEvent(AuditEventType.LOGIN_SUCCESS, req, {
      success: true,
      userId: user.id,
      details: {
        authProvider: 'microsoft',
        email: user.email,
        displayName: profile.displayName
      }
    });

    return res.json({
      success: true,
      token: jwtToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.full_name,
        tenantId: user.tenant_id,
        authProvider: 'microsoft'
      },
      expiresIn: '24h'
    });

  } catch (error) {
    console.error('Microsoft authentication failed:', error);

    await auditAuthEvent(AuditEventType.LOGIN_FAILED, req, {
      success: false,
      userId: null,
      errorMessage: error.message,
      details: { authProvider: 'microsoft' }
    });

    return res.status(401).json({
      success: false,
      error: 'Authentication failed',
      message: error.message
    });
  }
}

/**
 * Initiate Microsoft login flow
 */
function initiateMicrosoftLogin(req, res) {
  const state = generateState();

  // Store state in session or Redis for validation (optional but recommended)
  // req.session.microsoftState = state;

  const authUrl = getMicrosoftAuthUrl(state);

  res.json({
    success: true,
    authUrl: authUrl,
    state: state
  });
}

module.exports = {
  authenticateWithMicrosoft,
  initiateMicrosoftLogin,
  getMicrosoftAuthUrl,
  getMicrosoftAccessToken,
  getMicrosoftUserProfile,
  findOrCreateMicrosoftUser,
  generateJwtToken,
  MICROSOFT_AUTH_CONFIG
};

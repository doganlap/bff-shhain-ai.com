const express = require('express');
const bcrypt = require('bcryptjs');
const { query, transaction } = require('../config/database');
const { generateToken, generateRefreshToken, generatePasswordResetToken, verifyToken } = require('../utils/jwt');
const { authenticateToken } = require('../middleware/auth');

// Dynamic import for ES Module compatibility
let uuidv4;
(async () => {
  const { v4 } = await import('uuid');
  uuidv4 = v4;
})();

const router = express.Router();

/**
 * POST /api/auth/register
 * Register new user
 */
router.post('/register', async (req, res) => {
  try {
    const {
      email,
      password,
      first_name,
      last_name,
      tenant_id,
      tenant_code,
      role = 'user'
    } = req.body;

    // Validation
    if (!email || !password || !first_name || !last_name) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        message: 'Email, password, first name, and last name are required'
      });
    }

    // Check if user already exists
    const existingUser = await query(
      'SELECT id FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        success: false,
        error: 'User already exists',
        message: 'A user with this email already exists'
      });
    }

    // Resolve tenant (either by ID or code)
    let resolvedTenantId = tenant_id;

    if (!resolvedTenantId && tenant_code) {
      const tenantResult = await query(
        'SELECT id FROM tenants WHERE tenant_code = $1 AND is_active = true',
        [tenant_code.toLowerCase()]
      );

      if (tenantResult.rows.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Invalid tenant',
          message: 'Tenant not found or inactive'
        });
      }

      resolvedTenantId = tenantResult.rows[0].id;
    }

    // If no tenant specified, use default tenant
    if (!resolvedTenantId) {
      const defaultTenant = await query(
        'SELECT id FROM tenants WHERE tenant_code = $1',
        ['DEFAULT']
      );

      if (defaultTenant.rows.length > 0) {
        resolvedTenantId = defaultTenant.rows[0].id;
      }
    }

    // Hash password
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // Ensure uuid is available
    if (!uuidv4) {
      const { v4 } = await import('uuid');
      uuidv4 = v4;
    }

    // Create user with tenant
    const userResult = await transaction(async (client) => {
      // Create user
      const newUserResult = await client.query(`
        INSERT INTO users (
          id, email, password_hash, first_name, last_name,
          tenant_id, role, status, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING id, email, first_name, last_name, role, tenant_id, created_at
      `, [
        uuidv4(),
        email.toLowerCase(),
        password_hash,
        first_name,
        last_name,
        resolvedTenantId,
        role
      ]);

      const newUser = newUserResult.rows[0];

      // Assign default role
      const roleResult = await client.query(
        'SELECT id FROM roles WHERE name = $1 AND (tenant_id = $2 OR is_system_role = true) LIMIT 1',
        [role, resolvedTenantId]
      );

      if (roleResult.rows.length > 0) {
        await client.query(`
          INSERT INTO user_roles (user_id, role_id, assigned_by, is_active)
          VALUES ($1, $2, $3, true)
        `, [newUser.id, roleResult.rows[0].id, newUser.id]);
      }

      return newUser;
    });

    const user = userResult;

    // Generate tokens
    const token = generateToken(user);
    const refreshToken = generateRefreshToken();

    // Store refresh token
    await query(`
      UPDATE users
      SET session_token = $1, session_expires_at = $2, last_login = CURRENT_TIMESTAMP
      WHERE id = $3
    `, [refreshToken, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), user.id]); // 7 days

    res.cookie('accessToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 1 day
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          role: user.role,
          tenant_id: user.tenant_id
        },
        token,
        refreshToken,
        expiresIn: process.env.JWT_EXPIRES_IN || '24h'
      }
    });

  } catch (error) {
    console.error('[AUTH-SERVICE] Registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Registration failed',
      message: error.message
    });
  }
});

/**
 * POST /api/auth/login
 * User login
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Missing credentials',
        message: 'Email and password are required'
      });
    }

    // Get user with tenant info
    const userResult = await query(`
      SELECT
        u.id,
        u.email,
        u.password_hash,
        u.first_name,
        u.last_name,
        u.role,
        u.tenant_id,
        u.permissions,
        u.status,
        u.failed_login_attempts,
        u.account_locked_until,
        t.name as tenant_name,
        t.tenant_code
      FROM users u
      LEFT JOIN tenants t ON u.tenant_id = t.id
      WHERE u.email = $1
    `, [email.toLowerCase()]);

    if (userResult.rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
        message: 'Email or password is incorrect'
      });
    }

    const user = userResult.rows[0];

    // Check if account is locked
    if (user.account_locked_until && new Date() < new Date(user.account_locked_until)) {
      return res.status(423).json({
        success: false,
        error: 'Account locked',
        message: 'Account is temporarily locked due to multiple failed login attempts',
        lockedUntil: user.account_locked_until
      });
    }

    // Check if account is active
    if (user.status !== 'active') {
      return res.status(401).json({
        success: false,
        error: 'Account inactive',
        message: 'Your account is not active. Please contact administrator.'
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      // Increment failed login attempts
      const failedAttempts = (user.failed_login_attempts || 0) + 1;
      const lockUntil = failedAttempts >= 5 ? new Date(Date.now() + 30 * 60 * 1000) : null; // Lock for 30 minutes after 5 failed attempts

      await query(`
        UPDATE users
        SET failed_login_attempts = $1, account_locked_until = $2
        WHERE id = $3
      `, [failedAttempts, lockUntil, user.id]);

      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
        message: 'Email or password is incorrect',
        attemptsRemaining: Math.max(0, 5 - failedAttempts)
      });
    }

    // Reset failed login attempts on successful login
    await query(`
      UPDATE users
      SET failed_login_attempts = 0, account_locked_until = NULL, last_login = CURRENT_TIMESTAMP
      WHERE id = $1
    `, [user.id]);

    // Generate tokens
    const token = generateToken(user);
    const refreshToken = generateRefreshToken();

    // Store refresh token
    await query(`
      UPDATE users
      SET session_token = $1, session_expires_at = $2
      WHERE id = $3
    `, [refreshToken, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), user.id]);

    // Set cookies
    res.cookie('accessToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 1 day
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          role: user.role,
          tenant_id: user.tenant_id,
          tenant_name: user.tenant_name,
          tenant_code: user.tenant_code,
          permissions: user.permissions
        },
        token,
        refreshToken,
        expiresIn: process.env.JWT_EXPIRES_IN || '24h'
      }
    });

  } catch (error) {
    console.error('[AUTH-SERVICE] Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Login failed',
      message: error.message
    });
  }
});

/**
 * POST /api/auth/refresh
 * Refresh access token
 */
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        error: 'Refresh token required',
        message: 'Please provide a refresh token'
      });
    }

    // Find user with this refresh token
    const userResult = await query(`
      SELECT
        u.id,
        u.email,
        u.first_name,
        u.last_name,
        u.role,
        u.tenant_id,
        u.permissions,
        u.status,
        u.session_expires_at,
        t.name as tenant_name,
        t.tenant_code
      FROM users u
      LEFT JOIN tenants t ON u.tenant_id = t.id
      WHERE u.session_token = $1 AND u.status = 'active'
    `, [refreshToken]);

    if (userResult.rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Invalid refresh token',
        message: 'Refresh token is invalid or expired'
      });
    }

    const user = userResult.rows[0];

    // Check if refresh token is expired
    if (new Date() > new Date(user.session_expires_at)) {
      return res.status(401).json({
        success: false,
        error: 'Refresh token expired',
        message: 'Please login again'
      });
    }

    // Generate new tokens
    const newToken = generateToken(user);
    const newRefreshToken = generateRefreshToken();

    // Update refresh token in database
    await query(`
      UPDATE users
      SET session_token = $1, session_expires_at = $2
      WHERE id = $3
    `, [newRefreshToken, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), user.id]);

    res.cookie('accessToken', newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 1 day
    });

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        token: newToken,
        refreshToken: newRefreshToken,
        expiresIn: process.env.JWT_EXPIRES_IN || '24h'
      }
    });

  } catch (error) {
    console.error('[AUTH-SERVICE] Token refresh error:', error);
    res.status(500).json({
      success: false,
      error: 'Token refresh failed',
      message: error.message
    });
  }
});

/**
 * POST /api/auth/logout
 * User logout
 */
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    // Clear refresh token
    await query(`
      UPDATE users
      SET session_token = NULL, session_expires_at = NULL
      WHERE id = $1
    `, [req.user.id]);

    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    res.json({
      success: true,
      message: 'Logged out successfully'
    });

  } catch (error) {
    console.error('[AUTH-SERVICE] Logout error:', error);
    res.status(500).json({
      success: false,
      error: 'Logout failed',
      message: error.message
    });
  }
});

/**
 * GET /api/auth/me
 * Get current user profile
 */
router.get('/me', authenticateToken, async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        user: req.user
      }
    });
  } catch (error) {
    console.error('[AUTH-SERVICE] Profile fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch profile',
      message: error.message
    });
  }
});

/**
 * POST /api/auth/change-password
 * Change password (authenticated)
 */
router.post('/change-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        message: 'Current password and new password are required'
      });
    }

    // Get current password hash
    const userResult = await query(
      'SELECT password_hash FROM users WHERE id = $1',
      [req.user.id]
    );

    const user = userResult.rows[0];

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isValidPassword) {
      return res.status(400).json({
        success: false,
        error: 'Invalid current password',
        message: 'Current password is incorrect'
      });
    }

    // Hash new password
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    const password_hash = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await query(`
      UPDATE users
      SET password_hash = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
    `, [password_hash, req.user.id]);

    res.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('[AUTH-SERVICE] Password change error:', error);
    res.status(500).json({
      success: false,
      error: 'Password change failed',
      message: error.message
    });
  }
});

module.exports = router;

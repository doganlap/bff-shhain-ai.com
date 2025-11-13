const jwt = require('jsonwebtoken');

// Dynamic import for ES Module compatibility
let uuidv4;
(async () => {
  const { v4 } = await import('uuid');
  uuidv4 = v4;
})();

/**
 * Generate JWT access token
 */
const generateToken = (user) => {
  const payload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    tenant_id: user.tenant_id,
    permissions: user.permissions || []
  };

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    issuer: 'grc-auth-service',
    audience: 'grc-ecosystem'
  });
};

/**
 * Generate refresh token
 */
const generateRefreshToken = async () => {
  // Ensure uuid is loaded before use
  if (!uuidv4) {
    const { v4 } = await import('uuid');
    uuidv4 = v4;
  }
  return uuidv4();
};

/**
 * Generate password reset token
 */
const generatePasswordResetToken = (userId) => {
  const payload = {
    userId,
    type: 'password_reset'
  };

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: '1h',
    issuer: 'grc-auth-service',
    audience: 'grc-ecosystem'
  });
};

/**
 * Generate email verification token
 */
const generateEmailVerificationToken = (userId, email) => {
  const payload = {
    userId,
    email,
    type: 'email_verification'
  };

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: '24h',
    issuer: 'grc-auth-service',
    audience: 'grc-ecosystem'
  });
};

/**
 * Generate service token for inter-service communication
 */
const generateServiceToken = (serviceName) => {
  const payload = {
    service: serviceName,
    type: 'service_token'
  };

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: '30d',
    issuer: 'grc-auth-service',
    audience: 'grc-ecosystem'
  });
};

/**
 * Verify JWT token
 */
const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET, {
    issuer: 'grc-auth-service',
    audience: 'grc-ecosystem'
  });
};

/**
 * Decode JWT token without verification (for debugging)
 */
const decodeToken = (token) => {
  return jwt.decode(token);
};

module.exports = {
  generateToken,
  generateRefreshToken,
  generatePasswordResetToken,
  generateEmailVerificationToken,
  generateServiceToken,
  verifyToken,
  decodeToken
};

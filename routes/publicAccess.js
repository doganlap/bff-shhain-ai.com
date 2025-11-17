const express = require('express');
const router = express.Router();
const prisma = require('../db/prisma');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { logger } = require('../utils/logger');

// Use Node.js built-in crypto.randomUUID() instead of uuid package to avoid ES module issues
const uuidv4 = () => crypto.randomUUID();

const { ENV } = require('../config/env');
const JWT_SECRET = ENV.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRY = process.env.JWT_EXPIRY || '7d';

// Email validation cache (5-minute TTL)
const emailCache = new Map();
const EMAIL_CACHE_TTL = 5 * 60 * 1000;

function _getCachedEmail(email) {
  const cached = emailCache.get(email.toLowerCase());
  if (cached && Date.now() - cached.timestamp < EMAIL_CACHE_TTL) {
    return cached.data;
  }
  return null;
}

function _setCachedEmail(email, data) {
  emailCache.set(email.toLowerCase(), { data, timestamp: Date.now() });
  if (emailCache.size > 1000) {
    const oldestKey = emailCache.keys().next().value;
    emailCache.delete(oldestKey);
  }
}

/**
 * Helper: Generate slug from name
 */
function _generateSlug(name, type) {
  const baseSlug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  const timestamp = Date.now().toString(36);
  return `${baseSlug}-${type}-${timestamp}`;
}





/**
 * POST /api/public/poc/request
 * Submit POC request for manual review (no instant access)
 */
router.post('/public/poc/request', async (req, res) => {
  const requestId = uuidv4();

  try {
    const {
      fullName,
      email,
      companyName,
      sector,
      useCases = [],
      environmentPreference,
      preferredStartDate,
      notes
    } = req.body;

    // Validation
    if (!fullName || !email || !companyName) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: 'Full name, email, and company name are required'
      });
    }

    if (useCases.length === 0) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: 'At least one use case is required'
      });
    }

    logger.info('POC request received', { requestId, email, companyName });

    // Create POC request
    const pocRequest = await prisma.poc_requests.create({
      data: {
        id: requestId,
        email: email.toLowerCase(),
        full_name: fullName,
        company_name: companyName,
        sector,
        use_cases: useCases,
        environment_preference: environmentPreference || 'azure-cloud',
        preferred_start_date: preferredStartDate ? new Date(preferredStartDate) : null,
        notes,
        status: 'pending_review',
        metadata: {
          source: 'website',
          submittedAt: new Date().toISOString()
        }
      }
    });

    logger.info('POC request created successfully', { requestId });

    // TODO: Send notification email to sales team
    // TODO: Send confirmation email to requester

    res.status(202).json({
      requestId: pocRequest.id,
      status: 'pending_review',
      message: 'Your POC request has been received and will be reviewed within 48 hours'
    });

  } catch (error) {
    logger.error('POC request failed', { requestId, error: error.message, stack: error.stack });
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Failed to submit POC request',
      requestId
    });
  }
});

/**
 * POST /api/partner/auth/login
 * Authenticate partner user
 */
router.post('/partner/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: 'Email and password are required'
      });
    }

    logger.info('Partner login attempt', { email });

    // Find partner user
    const user = await prisma.users.findFirst({
      where: {
        email: email.toLowerCase(),
        is_partner: true
      },
      include: {
        tenants: true
      }
    });

    if (!user) {
      logger.warn('Partner user not found', { email });
      return res.status(401).json({
        error: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password'
      });
    }

    // Check if tenant is partner type
    if (user.tenant.type !== 'partner') {
      logger.warn('User is not associated with partner tenant', { email, tenantType: user.tenant.type });
      return res.status(401).json({
        error: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password'
      });
    }

    // Check tenant status
    if (user.tenant.status !== 'active') {
      logger.warn('Partner tenant not active', { email, tenantStatus: user.tenant.status });
      return res.status(403).json({
        error: 'ACCOUNT_SUSPENDED',
        message: 'Partner account is not active. Please contact support.'
      });
    }

    // Verify password
    if (!user.password_hash) {
      logger.error('Partner user has no password hash', { userId: user.id });
      return res.status(500).json({
        error: 'CONFIGURATION_ERROR',
        message: 'Account not properly configured. Please contact support.'
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      logger.warn('Invalid password for partner user', { email });
      return res.status(401).json({
        error: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password'
      });
    }

    // Update last login
    await prisma.users.update({
      where: { id: user.id },
      data: { last_login_at: new Date() }
    });

    // Generate JWT token
    const token = generateToken(user, user.tenant);
    
    // Add ID field for enhancedAuth compatibility
    const decoded = jwt.decode(token);
    decoded.id = decoded.sub; // Copy sub to id for enhancedAuth compatibility
    
    // Re-sign the token with the additional field
    const enhancedToken = jwt.sign(decoded, JWT_SECRET, {
      expiresIn: JWT_EXPIRY,
      algorithm: 'HS256'
    });

    logger.info('Partner login successful', { userId: user.id, tenantId: user.tenant.id });

    res.status(200).json({
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role
      },
      tenant: {
        id: user.tenant.id,
        slug: user.tenant.slug,
        type: user.tenant.type,
        status: user.tenant.status
      },
      token: enhancedToken
    });

  } catch (error) {
    logger.error('Partner login failed', { error: error.message, stack: error.stack });
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Login failed. Please try again.'
    });
  }
});

module.exports = router;
function generateToken(user, tenant) {
  const payload = {
    sub: user.id,
    email: user.email,
    tenantId: tenant.id,
    role: user.role,
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY, algorithm: 'HS256' });
}

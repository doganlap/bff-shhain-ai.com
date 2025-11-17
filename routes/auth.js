/**
 * Microsoft Authentication Routes
 * OAuth 2.0 authentication flow with Azure AD
 */

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../db/prisma');
const { ENV } = require('../config/env');
const { logger } = require('../utils/logger');
const {
  initiateMicrosoftLogin,
  authenticateWithMicrosoft
} = require('../middleware/microsoftAuth');
// const { createProxyMiddleware } = require('http-proxy-middleware');

// GET /api/auth/microsoft - Initiate Microsoft login
router.get('/microsoft', initiateMicrosoftLogin);

// GET /api/auth/microsoft/callback - Handle Microsoft OAuth callback
router.get('/microsoft/callback', authenticateWithMicrosoft);

router.post('/login', async (req, res) => {
  try {
    const { email, password, invite } = req.body || {};
    logger.info('Auth login request', { path: req.path, method: req.method, email: email || null, hasBody: !!req.body });
    if (!email || !password) {
      logger.warn('Auth missing credentials', { email: email || null });
      return res.status(400).json({ success: false, error: 'Missing credentials' });
    }
    if (process.env.INVITE_ONLY && process.env.INVITE_ONLY.trim() === 'true') {
      if (!invite) return res.status(403).json({ success: false, error: 'Invitation required' });
      const inv = await prisma.invitations.findUnique({ where: { token: invite } });
      if (!inv) return res.status(403).json({ success: false, error: 'Invalid invitation' });
      if (inv.status !== 'pending') return res.status(403).json({ success: false, error: 'Invitation used or revoked' });
      if (new Date(inv.expires_at).getTime() < Date.now()) return res.status(403).json({ success: false, error: 'Invitation expired' });
    }
    const user = await prisma.users.findFirst({ where: { email: email.toLowerCase() } });
    logger.info('Auth user lookup', { found: !!user, email: email.toLowerCase() });
    if (!user || !user.password_hash) {
      logger.warn('Auth user not found or no hash', { email: email.toLowerCase() });
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }
    const ok = await bcrypt.compare(password, user.password_hash);
    logger.info('Auth password compare', { ok });
    if (!ok) {
      logger.warn('Auth invalid password', { email: email.toLowerCase() });
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }
    const payload = {
      id: user.id,
      email: user.email,
      tenantId: user.tenant_id,
      roles: [user.role || 'user']
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET || 'fallback-secret', { expiresIn: '15m' });
    const refreshToken = jwt.sign({ id: user.id, tenantId: user.tenant_id }, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || 'fallback-refresh', { expiresIn: '7d' });
    const secure = ENV.NODE_ENV === 'production';
    res.cookie('accessToken', token, { httpOnly: true, secure, sameSite: secure ? 'none' : 'lax', maxAge: 15 * 60 * 1000 });
    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure, sameSite: secure ? 'none' : 'lax', maxAge: 7 * 24 * 60 * 60 * 1000 });
    if (process.env.INVITE_ONLY && process.env.INVITE_ONLY.trim() === 'true' && invite) {
      await prisma.invitations.update({ where: { token: invite }, data: { status: 'used', used_at: new Date() } });
    }
    logger.info('Auth success', { email: user.email, userId: user.id, tenantId: user.tenant_id });
    res.json({ success: true, accessToken: token, refreshToken, user: { id: user.id, email: user.email, tenantId: user.tenant_id, role: user.role } });
  } catch (error) {
    logger.error('Auth error', error, { path: req.path, method: req.method });
    res.status(500).json({ success: false, error: 'Login failed' });
}
});

// Service configuration for health proxy
const authServiceUrl = process.env.AUTH_SERVICE_URL || 'http://localhost:3001';
const SERVICE_TOKEN = process.env.SERVICE_TOKEN || 'default-token';

// GET /api/auth/health - Proxy to auth service health check
router.get('/health', async (req, res) => {
  try {
    console.log(`[BFF-AUTH] ${req.method} ${req.path} → auth-service (${authServiceUrl})`);
    
    const axios = require('axios');
    const response = await axios.get(`${authServiceUrl}/api/health`, {
      headers: {
        'X-Service-Token': SERVICE_TOKEN,
        'X-Request-ID': req.headers['x-request-id'] || `req-${Date.now()}`
      },
      timeout: 30000
    });
    
    console.log(`[BFF-AUTH] ${req.method} ${req.path} ← auth-service (${response.status})`);
    res.status(response.status).json(response.data);
  } catch (error) {
    console.error(`[BFF-AUTH] Proxy error for auth-service:`, error.message);
    res.status(502).json({
      success: false,
      error: 'Service unavailable',
      message: 'auth-service is currently unavailable',
      service: 'auth-service'
    });
  }
});

// Temporary endpoint to check password hash status
router.get('/debug/password-check', async (req, res) => {
  try {
    const users = await prisma.users.findMany({
      select: { id: true, email: true, password_hash: true, role: true }
    });
    
    const results = users.map(user => ({
      id: user.id,
      email: user.email,
      role: user.role,
      hasPassword: !!user.password_hash,
      hashLength: user.password_hash ? user.password_hash.length : 0,
      hashPreview: user.password_hash ? user.password_hash.substring(0, 20) + '...' : null
    }));
    
    res.json({ success: true, users: results });
  } catch (error) {
    logger.error('Password check error', error);
    res.status(500).json({ success: false, error: 'Check failed' });
  }
});

// Temporary endpoint to fix password hashes
router.post('/debug/fix-passwords', async (req, res) => {
  try {
    const bcrypt = require('bcryptjs');
    
    // Fix admin password
    const adminHash = await bcrypt.hash('Admin@123', 12);
    await prisma.users.updateMany({
      where: { email: 'admin@grc.com' },
      data: { password_hash: adminHash }
    });
    
    // Fix partner password
    const partnerHash = await bcrypt.hash('Partner@123', 12);
    await prisma.users.updateMany({
      where: { email: 'partner@grc.com' },
      data: { password_hash: partnerHash }
    });
    
    logger.info('Passwords fixed successfully');
    res.json({ success: true, message: 'Passwords fixed' });
  } catch (error) {
    logger.error('Password fix error', error);
    res.status(500).json({ success: false, error: 'Fix failed' });
  }
});

module.exports = router;

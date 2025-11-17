/**
 * Debug Routes
 * Temporary debugging endpoints
 */

const express = require('express');
const router = express.Router();
const prisma = require('../db/prisma');
const bcrypt = require('bcryptjs');

// GET /api/debug/auth-test - Test authentication with detailed debugging
router.post('/auth-test', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    
    console.log('=== DEBUG AUTH TEST ===');
    console.log('Email received:', email);
    console.log('Password received:', password ? 'Yes' : 'No');
    
    if (!email || !password) {
      return res.json({ 
        success: false, 
        error: 'Missing credentials',
        debug: { email: !!email, password: !!password }
      });
    }
    
    console.log('Looking up user:', email.toLowerCase());
    const user = await prisma.users.findFirst({ 
      where: { email: email.toLowerCase() } 
    });
    
    console.log('User lookup result:', {
      found: !!user,
      userId: user?.id,
      email: user?.email,
      hasPasswordHash: !!user?.password_hash
    });
    
    if (!user || !user.password_hash) {
      return res.json({ 
        success: false, 
        error: 'User not found or no password hash',
        debug: { 
          userFound: !!user, 
          hasPasswordHash: user?.password_hash ? true : false 
        }
      });
    }
    
    console.log('Comparing passwords...');
    console.log('Input password:', password);
    console.log('Stored hash:', user.password_hash);
    const isValid = await bcrypt.compare(password, user.password_hash);
    console.log('Password comparison result:', isValid);
    
    res.json({
      success: isValid,
      error: isValid ? null : 'Invalid password',
      debug: {
        userId: user.id,
        email: user.email,
        role: user.role,
        tenant_id: user.tenant_id,
        passwordValid: isValid
      }
    });
    
  } catch (error) {
    console.error('Debug auth error:', error);
    res.json({ 
      success: false, 
      error: error.message,
      debug: { exception: true }
    });
  }
});

// GET /api/debug/env - Check environment variables (safe ones only)
router.get('/env', (req, res) => {
  res.json({
    success: true,
    env: {
      NODE_ENV: process.env.NODE_ENV,
      INVITE_ONLY: process.env.INVITE_ONLY,
      INVITE_ONLY_LENGTH: process.env.INVITE_ONLY ? process.env.INVITE_ONLY.length : 0,
      INVITE_ONLY_CLEAN: process.env.INVITE_ONLY ? process.env.INVITE_ONLY.trim() : null,
      JWT_SECRET_EXISTS: !!process.env.JWT_SECRET,
      JWT_REFRESH_SECRET_EXISTS: !!process.env.JWT_REFRESH_SECRET,
      DATABASE_URL_EXISTS: !!process.env.DATABASE_URL,
      DATABASE_URL_TYPE: process.env.DATABASE_URL ? process.env.DATABASE_URL.split('@')[1]?.split(':')[0] : 'unknown'
    }
  });
});

// GET /api/debug/user/:email - Get user details (safe ones only)
router.get('/user/:email', async (req, res) => {
  try {
    const email = req.params.email;
    const user = await prisma.users.findFirst({ 
      where: { email: email.toLowerCase() },
      select: {
        id: true,
        email: true,
        full_name: true,
        role: true,
        tenant_id: true,
        created_at: true,
        password_hash: true // Include hash for debugging
      }
    });
    
    if (!user) {
      return res.json({ success: false, error: 'User not found' });
    }
    
    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        tenant_id: user.tenant_id,
        created_at: user.created_at,
        hasPasswordHash: !!user.password_hash,
        passwordHashLength: user.password_hash ? user.password_hash.length : 0,
        passwordHashPrefix: user.password_hash ? user.password_hash.substring(0, 20) : null
      }
    });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

module.exports = router;
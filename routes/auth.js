/**
 * Microsoft Authentication Routes
 * OAuth 2.0 authentication flow with Azure AD
 */

const express = require('express');
const router = express.Router();
const {
  initiateMicrosoftLogin,
  authenticateWithMicrosoft
} = require('../middleware/microsoftAuth');

// GET /api/auth/microsoft - Initiate Microsoft login
router.get('/microsoft', initiateMicrosoftLogin);

// GET /api/auth/microsoft/callback - Handle Microsoft OAuth callback
router.get('/microsoft/callback', authenticateWithMicrosoft);

module.exports = router;

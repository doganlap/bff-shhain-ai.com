/**
 * Fix Password Hash in Production
 * This script creates a temporary endpoint to fix the password hash
 */

const express = require('express');
const router = express.Router();
const prisma = require('../db/prisma');
const bcrypt = require('bcryptjs');

// POST /api/fix-password - Fix password hash for admin user
router.post('/fix-password', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    
    if (!email || !password) {
      return res.json({ 
        success: false, 
        error: 'Missing email or password',
        debug: { email: !!email, password: !!password }
      });
    }
    
    console.log('Fixing password for:', email);
    
    // Generate the correct password hash
    const correctHash = await bcrypt.hash(password, 12);
    console.log('Generated hash:', correctHash);
    console.log('Hash length:', correctHash.length);
    
    // Find the user
    const user = await prisma.users.findFirst({ 
      where: { email: email.toLowerCase() } 
    });
    
    if (!user) {
      return res.json({ success: false, error: 'User not found' });
    }
    
    console.log('Found user:', user.id, user.email);
    
    // Update the user with the correct hash
    const updatedUser = await prisma.users.update({
      where: { 
        tenant_id_email: {
          tenant_id: user.tenant_id,
          email: user.email
        }
      },
      data: { password_hash: correctHash }
    });
    
    console.log('Updated user password hash');
    
    // Verify the update
    const verifiedUser = await prisma.users.findFirst({
      where: { email: email.toLowerCase() }
    });
    
    const isValid = await bcrypt.compare(password, verifiedUser.password_hash);
    
    res.json({
      success: true,
      message: 'Password hash updated successfully',
      debug: {
        userId: updatedUser.id,
        email: updatedUser.email,
        hashLength: correctHash.length,
        passwordValid: isValid
      }
    });
    
  } catch (error) {
    console.error('Error fixing password:', error);
    res.json({ 
      success: false, 
      error: error.message,
      debug: { exception: true }
    });
  }
});

module.exports = router;
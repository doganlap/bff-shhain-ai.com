/**
 * Zakat.ie Integration Routes
 * Islamic Zakat calculations and charity donations
 */

const express = require('express');
const router = express.Router();
const zakatService = require('../src/services/zakat.service');
const { authenticateToken } = require('../middleware/enhancedAuth');
const { requirePermission } = require('../middleware/rbac');

// GET /api/zakat/nisab - Get current Nisab values
router.get('/nisab', async (req, res) => {
  try {
    const nisabValues = await zakatService.getNisabValues();

    res.json({
      success: true,
      data: nisabValues
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get Nisab values',
      message: error.message
    });
  }
});

// POST /api/zakat/calculate - Calculate Zakat amount
router.post('/calculate', authenticateToken, async (req, res) => {
  try {
    const {
      cash,
      bankBalance,
      investments,
      gold,
      silver,
      businessAssets,
      receivables,
      liabilities,
      nisabType
    } = req.body;

    const calculation = zakatService.calculateZakat({
      cash: parseFloat(cash) || 0,
      bankBalance: parseFloat(bankBalance) || 0,
      investments: parseFloat(investments) || 0,
      gold: parseFloat(gold) || 0,
      silver: parseFloat(silver) || 0,
      businessAssets: parseFloat(businessAssets) || 0,
      receivables: parseFloat(receivables) || 0,
      liabilities: parseFloat(liabilities) || 0,
      nisabType: nisabType || 'silver'
    });

    res.json({
      success: true,
      data: calculation
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to calculate Zakat',
      message: error.message
    });
  }
});

// POST /api/zakat/organization - Calculate organization's Zakat
router.post('/organization', authenticateToken, requirePermission('finance:view'), async (req, res) => {
  try {
    const tenantId = req.user.tenantId;

    const calculation = await zakatService.calculateOrganizationZakat(tenantId);

    res.json({
      success: true,
      data: calculation
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to calculate organization Zakat',
      message: error.message
    });
  }
});

// POST /api/zakat/donate - Create Zakat donation
router.post('/donate', authenticateToken, async (req, res) => {
  try {
    const { amount, currency, donorInfo } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid amount',
        message: 'Amount must be greater than 0'
      });
    }

    const donation = await zakatService.createZakatDonation({
      amount: parseFloat(amount),
      currency: currency || 'USD',
      donorInfo: {
        name: donorInfo.name || req.user.name,
        email: donorInfo.email || req.user.email,
        phone: donorInfo.phone,
        address: donorInfo.address
      },
      metadata: {
        tenantId: req.user.tenantId,
        userId: req.user.id
      }
    });

    res.json({
      success: true,
      data: {
        donationId: donation.id,
        paymentUrl: donation.payment_url,
        status: donation.status
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to create Zakat donation',
      message: error.message
    });
  }
});

// GET /api/zakat/donation/:id - Get donation status
router.get('/donation/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const donation = await zakatService.getZakatDonationStatus(id);

    res.json({
      success: true,
      data: donation
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get donation status',
      message: error.message
    });
  }
});

// GET /api/zakat/history - Get Zakat calculation and donation history
router.get('/history', authenticateToken, requirePermission('finance:view'), async (req, res) => {
  try {
    const tenantId = req.user.tenantId;

    const history = await zakatService.getZakatHistory(tenantId);

    res.json({
      success: true,
      data: history
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get Zakat history',
      message: error.message
    });
  }
});

// POST /api/zakat/webhook - Zakat.ie webhook endpoint
router.post('/webhook', express.raw({ type: 'application/json' }), zakatService.handleZakatWebhook);

module.exports = router;

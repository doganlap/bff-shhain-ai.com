/**
 * Stripe Payment Routes
 * Handles payment processing, subscriptions, and webhooks
 */

const express = require('express');
const router = express.Router();
const stripeService = require('../src/services/stripe.service');
const { authenticateToken } = require('../middleware/enhancedAuth');
const { requirePermission } = require('../middleware/rbac');

// POST /api/payments/customers - Create Stripe customer
// Supports KSA with Arabic locale and phone number for local payment methods
router.post('/customers', authenticateToken, requirePermission('payments:manage'), async (req, res) => {
  try {
    const { email, name, tenantId, metadata, region, phone } = req.body;

    const customer = await stripeService.createStripeCustomer({
      email,
      name,
      tenantId: tenantId || req.user.tenantId,
      metadata,
      region, // 'KSA' for Saudi Arabia
      phone // Required for KSA payment methods like STC Pay
    });

    res.json({
      success: true,
      customer: {
        id: customer.id,
        email: customer.email,
        name: customer.name
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to create customer',
      message: error.message
    });
  }
});

// POST /api/payments/intents - Create payment intent
// Supports KSA with SAR currency, VAT, and local payment methods
router.post('/intents', authenticateToken, requirePermission('payments:process'), async (req, res) => {
  try {
    const { amount, currency, customerId, metadata, region } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid amount',
        message: 'Amount must be greater than 0'
      });
    }

    const paymentIntent = await stripeService.createPaymentIntent({
      amount,
      currency: currency || 'usd',
      customerId,
      region, // KSA, UAE, etc.
      metadata: {
        ...metadata,
        tenantId: req.user.tenantId,
        userId: req.user.id
      }
    });

    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to create payment intent',
      message: error.message
    });
  }
});

// POST /api/payments/subscriptions - Create subscription
router.post('/subscriptions', authenticateToken, requirePermission('subscriptions:manage'), async (req, res) => {
  try {
    const { customerId, priceId, metadata } = req.body;

    if (!customerId || !priceId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        message: 'customerId and priceId are required'
      });
    }

    const subscription = await stripeService.createSubscription({
      customerId,
      priceId,
      tenantId: req.user.tenantId,
      metadata: {
        ...metadata,
        userId: req.user.id
      }
    });

    res.json({
      success: true,
      subscription: {
        id: subscription.id,
        status: subscription.status,
        currentPeriodEnd: subscription.current_period_end
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to create subscription',
      message: error.message
    });
  }
});

// DELETE /api/payments/subscriptions/:id - Cancel subscription
router.delete('/subscriptions/:id', authenticateToken, requirePermission('subscriptions:manage'), async (req, res) => {
  try {
    const { id } = req.params;

    const subscription = await stripeService.cancelSubscription(id);

    res.json({
      success: true,
      message: 'Subscription canceled successfully',
      subscription: {
        id: subscription.id,
        status: subscription.status
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to cancel subscription',
      message: error.message
    });
  }
});

// GET /api/payments/methods/:customerId - Get payment methods
router.get('/methods/:customerId', authenticateToken, async (req, res) => {
  try {
    const { customerId } = req.params;

    const paymentMethods = await stripeService.getPaymentMethods(customerId);

    res.json({
      success: true,
      paymentMethods
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get payment methods',
      message: error.message
    });
  }
});

// POST /api/payments/ksa/calculate-vat - Calculate KSA VAT (15%)
router.post('/ksa/calculate-vat', authenticateToken, async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid amount',
        message: 'Amount must be greater than 0'
      });
    }

    const vatDetails = stripeService.calculateKSAVAT(amount);

    res.json({
      success: true,
      currency: 'SAR',
      country: 'Saudi Arabia',
      vatRate: '15%',
      calculation: {
        subtotal: vatDetails.subtotal,
        vat: vatDetails.vat,
        total: vatDetails.total
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to calculate VAT',
      message: error.message
    });
  }
});

// GET /api/payments/ksa/config - Get KSA payment configuration
router.get('/ksa/config', async (req, res) => {
  try {
    res.json({
      success: true,
      config: {
        currency: stripeService.KSA_CONFIG.currency,
        countryCode: stripeService.KSA_CONFIG.countryCode,
        vatRate: stripeService.KSA_CONFIG.vatRate,
        locale: stripeService.KSA_CONFIG.locale,
        supportedPaymentMethods: stripeService.KSA_CONFIG.supportedPaymentMethods,
        timezone: stripeService.KSA_CONFIG.timezone
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get KSA config',
      message: error.message
    });
  }
});

// POST /api/payments/webhook - Stripe webhook handler

// POST /api/payments/webhook - Stripe webhook endpoint
router.post('/webhook', express.raw({ type: 'application/json' }), stripeService.handleStripeWebhook);

module.exports = router;

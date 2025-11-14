/**
 * Stripe Payment Integration Service
 * Handles payment processing, subscriptions, and invoicing
 */

const axios = require('axios');
const prisma = require('../../db/prisma');
const { logger } = require('../../utils/logger');

// Stripe Configuration
const STRIPE_CONFIG = {
  secretKey: process.env.STRIPE_SECRET_KEY,
  publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  apiVersion: '2023-10-16',
  baseUrl: 'https://api.stripe.com/v1'
};

// KSA (Saudi Arabia) Configuration
const KSA_CONFIG = {
  currency: 'sar', // Saudi Riyal
  vatRate: 0.15, // 15% VAT in Saudi Arabia
  countryCode: 'SA',
  locale: 'ar', // Arabic locale
  supportedPaymentMethods: [
    'card', // Credit/Debit cards
    'mada', // Saudi domestic debit card network
    'stcpay', // STC Pay wallet
    'tabby', // Buy now, pay later (BNPL) for KSA
    'tamara' // BNPL alternative for KSA
  ],
  timezone: 'Asia/Riyadh'
};

// Initialize Stripe (lazy load to avoid errors if not configured)
let stripe = null;
function getStripe() {
  if (!stripe && STRIPE_CONFIG.secretKey) {
    try {
      stripe = require('stripe')(STRIPE_CONFIG.secretKey);
      logger.info('Stripe initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize Stripe', { error: error.message });
    }
  }
  return stripe;
}

/**
 * Create Stripe customer
 * Supports KSA with Arabic locale and regional settings
 */
async function createStripeCustomer({ email, name, tenantId, metadata = {}, region = null, phone = null }) {
  const stripeClient = getStripe();
  if (!stripeClient) {
    throw new Error('Stripe not configured');
  }

  try {
    const isKSA = region === 'KSA';

    const customerData = {
      email,
      name,
      metadata: {
        tenantId,
        region: isKSA ? 'KSA' : region || 'OTHER',
        ...metadata
      }
    };

    // Add KSA-specific customer data
    if (isKSA) {
      customerData.preferred_locales = ['ar', 'en']; // Arabic first, English fallback
      if (phone) {
        customerData.phone = phone; // Important for STC Pay and other KSA payment methods
      }
      customerData.address = {
        country: 'SA',
        ...metadata.address
      };
    }

    const customer = await stripeClient.customers.create(customerData);

    // Store customer ID in database
    await prisma.organizations.update({
      where: { id: tenantId },
      data: {
        stripe_customer_id: customer.id,
        updated_at: new Date()
      }
    });

    logger.info('Stripe customer created', { customerId: customer.id, tenantId });
    return customer;
  } catch (error) {
    logger.error('Failed to create Stripe customer', { error: error.message, tenantId });
    throw error;
  }
}

/**
 * Calculate VAT for KSA transactions
 */
function calculateKSAVAT(amount) {
  return {
    subtotal: amount,
    vat: Math.round(amount * KSA_CONFIG.vatRate * 100) / 100,
    total: Math.round(amount * (1 + KSA_CONFIG.vatRate) * 100) / 100
  };
}

/**
 * Create payment intent
 * Supports KSA with SAR currency, VAT, and local payment methods (Mada, STC Pay)
 */
async function createPaymentIntent({ amount, currency = 'usd', customerId, metadata = {}, region = null }) {
  const stripeClient = getStripe();
  if (!stripeClient) {
    throw new Error('Stripe not configured');
  }

  try {
    // Check if this is a KSA transaction
    const isKSA = region === 'KSA' || currency.toLowerCase() === 'sar';

    // Calculate VAT for KSA
    let finalAmount = amount;
    let vatDetails = null;
    if (isKSA) {
      vatDetails = calculateKSAVAT(amount);
      finalAmount = vatDetails.total;
      currency = 'sar'; // Force SAR for KSA
    }

    const paymentIntentData = {
      amount: Math.round(finalAmount * 100), // Convert to smallest currency unit
      currency: currency.toLowerCase(),
      customer: customerId,
      metadata: {
        ...metadata,
        region: isKSA ? 'KSA' : metadata.region || 'OTHER',
        ...(isKSA && vatDetails ? {
          subtotal: vatDetails.subtotal.toString(),
          vat_amount: vatDetails.vat.toString(),
          vat_rate: '15',
          country_code: 'SA'
        } : {})
      }
    };

    // Add KSA-specific payment methods
    if (isKSA) {
      paymentIntentData.payment_method_types = ['card', 'mada'];
      // Note: mada requires Stripe account with Saudi Arabia enabled
    } else {
      paymentIntentData.automatic_payment_methods = { enabled: true };
    }

    const paymentIntent = await stripeClient.paymentIntents.create(paymentIntentData);

    logger.info('Payment intent created', {
      paymentIntentId: paymentIntent.id,
      amount,
      currency
    });

    return paymentIntent;
  } catch (error) {
    logger.error('Failed to create payment intent', { error: error.message });
    throw error;
  }
}

/**
 * Create subscription
 */
async function createSubscription({ customerId, priceId, tenantId, metadata = {} }) {
  const stripeClient = getStripe();
  if (!stripeClient) {
    throw new Error('Stripe not configured');
  }

  try {
    const subscription = await stripeClient.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      metadata: {
        tenantId,
        ...metadata
      },
      payment_behavior: 'default_incomplete',
      expand: ['latest_invoice.payment_intent']
    });

    // Store subscription in database
    await prisma.subscriptions.create({
      data: {
        tenant_id: tenantId,
        stripe_subscription_id: subscription.id,
        stripe_customer_id: customerId,
        status: subscription.status,
        current_period_start: new Date(subscription.current_period_start * 1000),
        current_period_end: new Date(subscription.current_period_end * 1000),
        plan_id: priceId,
        created_at: new Date()
      }
    });

    logger.info('Subscription created', {
      subscriptionId: subscription.id,
      tenantId,
      status: subscription.status
    });

    return subscription;
  } catch (error) {
    logger.error('Failed to create subscription', { error: error.message, tenantId });
    throw error;
  }
}

/**
 * Cancel subscription
 */
async function cancelSubscription(subscriptionId) {
  const stripeClient = getStripe();
  if (!stripeClient) {
    throw new Error('Stripe not configured');
  }

  try {
    const subscription = await stripeClient.subscriptions.cancel(subscriptionId);

    // Update database
    await prisma.subscriptions.updateMany({
      where: { stripe_subscription_id: subscriptionId },
      data: {
        status: 'canceled',
        canceled_at: new Date(),
        updated_at: new Date()
      }
    });

    logger.info('Subscription canceled', { subscriptionId });
    return subscription;
  } catch (error) {
    logger.error('Failed to cancel subscription', { error: error.message, subscriptionId });
    throw error;
  }
}

/**
 * Handle Stripe webhook events
 */
async function handleStripeWebhook(req, res) {
  const stripeClient = getStripe();
  if (!stripeClient) {
    return res.status(500).json({ error: 'Stripe not configured' });
  }

  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripeClient.webhooks.constructEvent(
      req.body,
      sig,
      STRIPE_CONFIG.webhookSecret
    );
  } catch (err) {
    logger.error('Webhook signature verification failed', { error: err.message });
    return res.status(400).json({ error: 'Webhook signature verification failed' });
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(event.data.object);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentFailure(event.data.object);
        break;

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdate(event.data.object);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionCanceled(event.data.object);
        break;

      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSuccess(event.data.object);
        break;

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object);
        break;

      default:
        logger.info('Unhandled Stripe event type', { type: event.type });
    }

    res.json({ received: true });
  } catch (error) {
    logger.error('Error handling Stripe webhook', { error: error.message, eventType: event.type });
    res.status(500).json({ error: 'Webhook handler failed' });
  }
}

/**
 * Handle successful payment
 */
async function handlePaymentSuccess(paymentIntent) {
  logger.info('Payment succeeded', {
    paymentIntentId: paymentIntent.id,
    amount: paymentIntent.amount / 100,
    currency: paymentIntent.currency
  });

  // Store payment record
  await prisma.payments.create({
    data: {
      stripe_payment_intent_id: paymentIntent.id,
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency,
      status: 'succeeded',
      customer_id: paymentIntent.customer,
      created_at: new Date()
    }
  });
}

/**
 * Handle failed payment
 */
async function handlePaymentFailure(paymentIntent) {
  logger.warn('Payment failed', {
    paymentIntentId: paymentIntent.id,
    error: paymentIntent.last_payment_error?.message
  });

  await prisma.payments.create({
    data: {
      stripe_payment_intent_id: paymentIntent.id,
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency,
      status: 'failed',
      customer_id: paymentIntent.customer,
      error_message: paymentIntent.last_payment_error?.message,
      created_at: new Date()
    }
  });
}

/**
 * Handle subscription update
 */
async function handleSubscriptionUpdate(subscription) {
  logger.info('Subscription updated', {
    subscriptionId: subscription.id,
    status: subscription.status
  });

  await prisma.subscriptions.updateMany({
    where: { stripe_subscription_id: subscription.id },
    data: {
      status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000),
      current_period_end: new Date(subscription.current_period_end * 1000),
      updated_at: new Date()
    }
  });
}

/**
 * Handle subscription cancellation
 */
async function handleSubscriptionCanceled(subscription) {
  logger.info('Subscription canceled', { subscriptionId: subscription.id });

  await prisma.subscriptions.updateMany({
    where: { stripe_subscription_id: subscription.id },
    data: {
      status: 'canceled',
      canceled_at: new Date(),
      updated_at: new Date()
    }
  });
}

/**
 * Handle invoice payment success
 */
async function handleInvoicePaymentSuccess(invoice) {
  logger.info('Invoice payment succeeded', {
    invoiceId: invoice.id,
    amount: invoice.amount_paid / 100
  });

  await prisma.invoices.upsert({
    where: { stripe_invoice_id: invoice.id },
    update: {
      status: 'paid',
      paid_at: new Date(),
      updated_at: new Date()
    },
    create: {
      stripe_invoice_id: invoice.id,
      customer_id: invoice.customer,
      amount: invoice.amount_paid / 100,
      currency: invoice.currency,
      status: 'paid',
      paid_at: new Date(),
      created_at: new Date()
    }
  });
}

/**
 * Handle invoice payment failure
 */
async function handleInvoicePaymentFailed(invoice) {
  logger.warn('Invoice payment failed', { invoiceId: invoice.id });

  await prisma.invoices.upsert({
    where: { stripe_invoice_id: invoice.id },
    update: {
      status: 'payment_failed',
      updated_at: new Date()
    },
    create: {
      stripe_invoice_id: invoice.id,
      customer_id: invoice.customer,
      amount: invoice.amount_due / 100,
      currency: invoice.currency,
      status: 'payment_failed',
      created_at: new Date()
    }
  });
}

/**
 * Get customer payment methods
 */
async function getPaymentMethods(customerId) {
  const stripeClient = getStripe();
  if (!stripeClient) {
    throw new Error('Stripe not configured');
  }

  try {
    const paymentMethods = await stripeClient.paymentMethods.list({
      customer: customerId,
      type: 'card'
    });

    return paymentMethods.data;
  } catch (error) {
    logger.error('Failed to get payment methods', { error: error.message, customerId });
    throw error;
  }
}

module.exports = {
  createStripeCustomer,
  createPaymentIntent,
  createSubscription,
  cancelSubscription,
  handleStripeWebhook,
  getPaymentMethods,
  getStripe,
  STRIPE_CONFIG,
  KSA_CONFIG,
  calculateKSAVAT
};

/**
 * Zakat.ie Integration Service
 * Handles Zakat calculations and charity donations for Islamic compliance
 */

const axios = require('axios');
const prisma = require('../../db/prisma');
const { logger } = require('../../utils/logger');

// Zakat.ie Configuration
const ZAKAT_CONFIG = {
  apiKey: process.env.ZAKAT_API_KEY,
  apiUrl: process.env.ZAKAT_API_URL || 'https://api.zakat.ie/v1',
  organizationId: process.env.ZAKAT_ORGANIZATION_ID,
  webhookSecret: process.env.ZAKAT_WEBHOOK_SECRET
};

// Nisab values (updated periodically based on gold/silver prices)
const NISAB_VALUES = {
  gold: 85, // grams of gold
  silver: 595, // grams of silver
  goldPricePerGram: 65, // USD (should be updated from live API)
  silverPricePerGram: 0.8 // USD (should be updated from live API)
};

/**
 * Calculate Zakat based on Islamic principles
 * Zakat = 2.5% of qualifying wealth held for one lunar year
 */
function calculateZakat({
  cash = 0,
  bankBalance = 0,
  investments = 0,
  gold = 0,
  silver = 0,
  businessAssets = 0,
  receivables = 0,
  liabilities = 0,
  nisabType = 'silver' // 'gold' or 'silver' (silver is more inclusive)
}) {
  // Calculate total qualifying wealth
  const totalWealth = cash + bankBalance + investments + gold + silver + businessAssets + receivables - liabilities;

  // Calculate Nisab threshold
  const nisabThreshold = nisabType === 'gold'
    ? NISAB_VALUES.gold * NISAB_VALUES.goldPricePerGram
    : NISAB_VALUES.silver * NISAB_VALUES.silverPricePerGram;

  // Check if wealth exceeds Nisab
  const isZakatDue = totalWealth >= nisabThreshold;

  // Calculate Zakat amount (2.5%)
  const zakatAmount = isZakatDue ? totalWealth * 0.025 : 0;

  return {
    totalWealth,
    nisabThreshold,
    nisabType,
    isZakatDue,
    zakatAmount,
    zakatPercentage: 2.5,
    breakdown: {
      cash,
      bankBalance,
      investments,
      gold,
      silver,
      businessAssets,
      receivables,
      liabilities
    }
  };
}

/**
 * Get current Nisab values from live gold/silver prices
 */
async function getNisabValues() {
  try {
    // In production, fetch from a reliable gold/silver price API
    // Example: https://api.metals.live/v1/spot/gold

    // For now, return configured values
    return {
      gold: {
        gramsRequired: NISAB_VALUES.gold,
        pricePerGram: NISAB_VALUES.goldPricePerGram,
        threshold: NISAB_VALUES.gold * NISAB_VALUES.goldPricePerGram
      },
      silver: {
        gramsRequired: NISAB_VALUES.silver,
        pricePerGram: NISAB_VALUES.silverPricePerGram,
        threshold: NISAB_VALUES.silver * NISAB_VALUES.silverPricePerGram
      },
      lastUpdated: new Date().toISOString()
    };
  } catch (error) {
    logger.error('Failed to fetch Nisab values', { error: error.message });
    throw error;
  }
}

/**
 * Create Zakat donation via Zakat.ie platform
 */
async function createZakatDonation({ amount, currency = 'USD', donorInfo, metadata = {} }) {
  if (!ZAKAT_CONFIG.apiKey) {
    throw new Error('Zakat.ie API not configured');
  }

  try {
    const response = await axios.post(`${ZAKAT_CONFIG.apiUrl}/donations`, {
      amount,
      currency,
      organization_id: ZAKAT_CONFIG.organizationId,
      donor: {
        name: donorInfo.name,
        email: donorInfo.email,
        phone: donorInfo.phone,
        address: donorInfo.address
      },
      donation_type: 'zakat',
      metadata: {
        ...metadata,
        platform: 'shahin-grc',
        timestamp: new Date().toISOString()
      }
    }, {
      headers: {
        'Authorization': `Bearer ${ZAKAT_CONFIG.apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    // Store donation record in database
    await prisma.zakat_donations.create({
      data: {
        tenant_id: metadata.tenantId,
        user_id: metadata.userId,
        amount,
        currency,
        zakat_ie_donation_id: response.data.id,
        status: response.data.status,
        payment_url: response.data.payment_url,
        created_at: new Date()
      }
    });

    logger.info('Zakat donation created', {
      donationId: response.data.id,
      amount,
      currency
    });

    return response.data;
  } catch (error) {
    logger.error('Failed to create Zakat donation', {
      error: error.response?.data || error.message
    });
    throw error;
  }
}

/**
 * Get Zakat donation status
 */
async function getZakatDonationStatus(donationId) {
  if (!ZAKAT_CONFIG.apiKey) {
    throw new Error('Zakat.ie API not configured');
  }

  try {
    const response = await axios.get(`${ZAKAT_CONFIG.apiUrl}/donations/${donationId}`, {
      headers: {
        'Authorization': `Bearer ${ZAKAT_CONFIG.apiKey}`
      }
    });

    // Update database
    await prisma.zakat_donations.updateMany({
      where: { zakat_ie_donation_id: donationId },
      data: {
        status: response.data.status,
        updated_at: new Date()
      }
    });

    return response.data;
  } catch (error) {
    logger.error('Failed to get Zakat donation status', {
      error: error.response?.data || error.message,
      donationId
    });
    throw error;
  }
}

/**
 * Calculate organization's Zakat obligation
 */
async function calculateOrganizationZakat(tenantId) {
  try {
    // Fetch organization's financial data
    const financials = await prisma.$queryRaw`
      SELECT
        SUM(CASE WHEN account_type = 'asset' THEN balance ELSE 0 END) as total_assets,
        SUM(CASE WHEN account_type = 'liability' THEN balance ELSE 0 END) as total_liabilities,
        SUM(CASE WHEN account_type = 'cash' THEN balance ELSE 0 END) as cash_balance,
        SUM(CASE WHEN account_type = 'investment' THEN balance ELSE 0 END) as investments
      FROM accounts
      WHERE tenant_id = ${tenantId}
    `;

    const data = financials[0];

    // Calculate Zakat
    const zakatCalculation = calculateZakat({
      cash: parseFloat(data.cash_balance) || 0,
      bankBalance: parseFloat(data.total_assets) || 0,
      investments: parseFloat(data.investments) || 0,
      liabilities: parseFloat(data.total_liabilities) || 0
    });

    // Store calculation
    await prisma.zakat_calculations.create({
      data: {
        tenant_id: tenantId,
        total_wealth: zakatCalculation.totalWealth,
        nisab_threshold: zakatCalculation.nisabThreshold,
        zakat_amount: zakatCalculation.zakatAmount,
        is_zakat_due: zakatCalculation.isZakatDue,
        calculation_date: new Date(),
        fiscal_year: new Date().getFullYear(),
        breakdown: JSON.stringify(zakatCalculation.breakdown),
        created_at: new Date()
      }
    });

    logger.info('Organization Zakat calculated', {
      tenantId,
      zakatAmount: zakatCalculation.zakatAmount,
      isZakatDue: zakatCalculation.isZakatDue
    });

    return zakatCalculation;
  } catch (error) {
    logger.error('Failed to calculate organization Zakat', {
      error: error.message,
      tenantId
    });
    throw error;
  }
}

/**
 * Get Zakat history for organization
 */
async function getZakatHistory(tenantId) {
  try {
    const history = await prisma.zakat_calculations.findMany({
      where: { tenant_id: tenantId },
      orderBy: { calculation_date: 'desc' },
      take: 10
    });

    const donations = await prisma.zakat_donations.findMany({
      where: { tenant_id: tenantId },
      orderBy: { created_at: 'desc' },
      take: 10
    });

    return {
      calculations: history,
      donations: donations,
      totalDonated: donations.reduce((sum, d) => sum + parseFloat(d.amount), 0)
    };
  } catch (error) {
    logger.error('Failed to get Zakat history', {
      error: error.message,
      tenantId
    });
    throw error;
  }
}

/**
 * Handle Zakat.ie webhook events
 */
async function handleZakatWebhook(req, res) {
  const signature = req.headers['x-zakat-signature'];

  // Verify webhook signature (implementation depends on Zakat.ie's signature method)
  // For now, we'll assume the signature is valid

  const event = req.body;

  try {
    switch (event.type) {
      case 'donation.completed':
        await handleDonationCompleted(event.data);
        break;

      case 'donation.failed':
        await handleDonationFailed(event.data);
        break;

      default:
        logger.info('Unhandled Zakat webhook event', { type: event.type });
    }

    res.json({ received: true });
  } catch (error) {
    logger.error('Error handling Zakat webhook', {
      error: error.message,
      eventType: event.type
    });
    res.status(500).json({ error: 'Webhook handler failed' });
  }
}

/**
 * Handle completed donation
 */
async function handleDonationCompleted(donation) {
  logger.info('Zakat donation completed', { donationId: donation.id });

  await prisma.zakat_donations.updateMany({
    where: { zakat_ie_donation_id: donation.id },
    data: {
      status: 'completed',
      completed_at: new Date(),
      updated_at: new Date()
    }
  });
}

/**
 * Handle failed donation
 */
async function handleDonationFailed(donation) {
  logger.warn('Zakat donation failed', { donationId: donation.id });

  await prisma.zakat_donations.updateMany({
    where: { zakat_ie_donation_id: donation.id },
    data: {
      status: 'failed',
      updated_at: new Date()
    }
  });
}

module.exports = {
  calculateZakat,
  getNisabValues,
  createZakatDonation,
  getZakatDonationStatus,
  calculateOrganizationZakat,
  getZakatHistory,
  handleZakatWebhook,
  NISAB_VALUES
};

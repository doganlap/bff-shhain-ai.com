# 🇸🇦 KSA (Saudi Arabia) Payment Integration Guide

## Overview
Complete Stripe payment integration with **Saudi Arabia (KSA) support** including:
- ✅ **SAR Currency** - Saudi Riyal
- ✅ **15% VAT** - Automatic calculation and tracking
- ✅ **Mada Cards** - Saudi domestic debit card network
- ✅ **STC Pay** - Popular Saudi mobile wallet
- ✅ **Arabic Locale** - RTL support and Arabic language
- ✅ **Local Payment Methods** - Tabby and Tamara BNPL

## Features Added

### 1. KSA Configuration
```javascript
{
  currency: 'sar',              // Saudi Riyal
  vatRate: 0.15,                // 15% VAT
  countryCode: 'SA',
  locale: 'ar',                 // Arabic
  supportedPaymentMethods: [
    'card',                     // International cards
    'mada',                     // Saudi Mada cards
    'stcpay',                   // STC Pay wallet
    'tabby',                    // Buy now, pay later
    'tamara'                    // BNPL alternative
  ],
  timezone: 'Asia/Riyadh'
}
```

### 2. Automatic VAT Calculation
When creating payments for KSA customers, VAT is automatically calculated:

**Example:**
- Subtotal: 1000 SAR
- VAT (15%): 150 SAR
- **Total: 1150 SAR**

### 3. Customer Creation with KSA Support
```javascript
POST /api/payments/customers
{
  "email": "customer@example.sa",
  "name": "أحمد محمد",
  "phone": "+966501234567",      // Required for STC Pay
  "region": "KSA",                // Enables KSA features
  "metadata": {
    "address": {
      "city": "Riyadh",
      "country": "SA"
    }
  }
}
```

**Response:**
```json
{
  "success": true,
  "customer": {
    "id": "cus_xxxxx",
    "email": "customer@example.sa",
    "name": "أحمد محمد",
    "preferred_locales": ["ar", "en"]
  }
}
```

### 4. Payment Intent with SAR and VAT
```javascript
POST /api/payments/intents
{
  "amount": 1000,                 // Amount in SAR (before VAT)
  "currency": "sar",              // Or set region: "KSA"
  "customerId": "cus_xxxxx",
  "region": "KSA",                // Auto-calculates VAT
  "metadata": {
    "invoice_number": "INV-2024-001",
    "description": "License fee"
  }
}
```

**Response:**
```json
{
  "success": true,
  "paymentIntent": {
    "id": "pi_xxxxx",
    "amount": 115000,              // 1150 SAR in cents (with VAT)
    "currency": "sar",
    "status": "requires_payment_method",
    "client_secret": "pi_xxxxx_secret_xxxxx",
    "metadata": {
      "region": "KSA",
      "subtotal": "1000",
      "vat_amount": "150",
      "vat_rate": "15",
      "country_code": "SA"
    }
  }
}
```

## API Endpoints

### KSA-Specific Endpoints

#### 1. Calculate VAT
```bash
POST /api/payments/ksa/calculate-vat
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 1000
}
```

**Response:**
```json
{
  "success": true,
  "currency": "SAR",
  "country": "Saudi Arabia",
  "vatRate": "15%",
  "calculation": {
    "subtotal": 1000,
    "vat": 150,
    "total": 1150
  }
}
```

#### 2. Get KSA Configuration
```bash
GET /api/payments/ksa/config
```

**Response:**
```json
{
  "success": true,
  "config": {
    "currency": "sar",
    "countryCode": "SA",
    "vatRate": 0.15,
    "locale": "ar",
    "supportedPaymentMethods": [
      "card",
      "mada",
      "stcpay",
      "tabby",
      "tamara"
    ],
    "timezone": "Asia/Riyadh"
  }
}
```

### Standard Endpoints with KSA Support

#### Create Customer (with KSA features)
```bash
POST /api/payments/customers
Authorization: Bearer <token>
Content-Type: application/json

{
  "email": "customer@example.sa",
  "name": "عبدالله خالد",
  "phone": "+966501234567",
  "region": "KSA",
  "metadata": {
    "vat_number": "300000000000003",  # Optional: Customer VAT number
    "company_name": "شركة المثال المحدودة"
  }
}
```

#### Create Payment Intent (SAR with VAT)
```bash
POST /api/payments/intents
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 5000,
  "currency": "sar",
  "customerId": "cus_xxxxx",
  "region": "KSA",
  "metadata": {
    "product": "Enterprise License",
    "duration": "Annual"
  }
}
```

## Payment Methods

### 1. Mada Cards (Saudi Domestic)
- Most popular payment method in Saudi Arabia
- Requires Stripe account with Saudi Arabia enabled
- Automatically included when `region: "KSA"` is set

### 2. STC Pay
- Mobile wallet by Saudi Telecom Company
- Requires customer phone number
- Popular for digital payments

### 3. International Cards
- Visa, Mastercard, American Express
- Work for both local and international customers

### 4. Buy Now, Pay Later (BNPL)
- **Tabby**: Split payment into 4 installments
- **Tamara**: Flexible payment options
- Popular in Saudi e-commerce

## VAT Compliance

### VAT Invoice Requirements
All invoices must include:
- Seller's VAT registration number
- Buyer's VAT registration number (B2B)
- Date and invoice number
- Description of goods/services
- Subtotal (pre-VAT amount)
- VAT amount (15%)
- Total amount (including VAT)

### Metadata Stored
```json
{
  "region": "KSA",
  "subtotal": "1000",
  "vat_amount": "150",
  "vat_rate": "15",
  "country_code": "SA",
  "invoice_number": "INV-2024-001"
}
```

### VAT Reporting
Query payments by region for VAT reports:
```sql
SELECT
  stripe_payment_intent_id,
  amount,
  metadata->>'subtotal' as subtotal,
  metadata->>'vat_amount' as vat,
  created_at
FROM payments
WHERE metadata->>'region' = 'KSA'
  AND created_at BETWEEN '2024-01-01' AND '2024-12-31';
```

## Testing

### Test Mode Configuration
```env
# Use Stripe test keys for KSA testing
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
```

### Test Card Numbers
```
# Mada test cards (Stripe test mode)
5297410000000000  # Successful payment
5297410000000001  # Declined payment

# International test cards
4242424242424242  # Visa (successful)
4000000000009995  # Visa (declined)
```

### Test VAT Calculation
```bash
curl -X POST http://localhost:3000/api/payments/ksa/calculate-vat \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"amount": 1000}'

# Expected output:
# {
#   "success": true,
#   "currency": "SAR",
#   "vatRate": "15%",
#   "calculation": {
#     "subtotal": 1000,
#     "vat": 150,
#     "total": 1150
#   }
# }
```

## Setup Requirements

### 1. Stripe Account Configuration
1. Go to https://dashboard.stripe.com
2. Navigate to **Settings** → **Payments**
3. Enable **Saudi Arabia** as a business country
4. Enable payment methods:
   - ✅ Cards
   - ✅ Mada
   - ✅ Digital wallets
5. Configure webhook endpoint

### 2. Environment Variables
Add to `.env`:
```env
# Stripe (with KSA support enabled)
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```

### 3. Webhook Configuration
Add these Stripe webhook events:
- `payment_intent.succeeded`
- `payment_intent.payment_failed`
- `customer.created`
- `customer.updated`

Webhook URL: `https://yourdomain.com/api/payments/webhook`

## Frontend Integration

### React/Next.js Example
```javascript
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement } from '@stripe/react-stripe-js';

// Initialize Stripe with KSA configuration
const stripePromise = loadStripe('pk_live_xxxxx', {
  locale: 'ar',  // Arabic locale
  betas: ['mada_pm_beta']  // Enable Mada
});

function CheckoutForm({ amount }) {
  const [clientSecret, setClientSecret] = useState('');

  useEffect(() => {
    // Create payment intent with KSA support
    fetch('/api/payments/intents', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        amount: amount,
        region: 'KSA',
        currency: 'sar'
      })
    })
    .then(res => res.json())
    .then(data => setClientSecret(data.paymentIntent.client_secret));
  }, [amount]);

  return (
    <Elements stripe={stripePromise} options={{
      clientSecret,
      locale: 'ar',
      appearance: { theme: 'stripe' }
    }}>
      <PaymentElement />
      <button>ادفع {amount} ريال</button>
    </Elements>
  );
}
```

## Database Schema

### Payment Records with VAT
```sql
SELECT
  id,
  stripe_payment_intent_id,
  amount,  -- Total amount including VAT
  currency,
  status,
  metadata->>'region' as region,
  metadata->>'subtotal' as subtotal,
  metadata->>'vat_amount' as vat,
  created_at
FROM payments
WHERE metadata->>'region' = 'KSA'
ORDER BY created_at DESC;
```

## Security Considerations

### 1. VAT Number Validation
```javascript
// Validate Saudi VAT number format
function validateSaudiVAT(vatNumber) {
  // Format: 15 digits, starts with 3, ends with 3
  const regex = /^3\d{13}3$/;
  return regex.test(vatNumber);
}
```

### 2. Phone Number Validation
```javascript
// Validate Saudi phone numbers
function validateSaudiPhone(phone) {
  // Format: +966 followed by 9 digits
  const regex = /^\+9665\d{8}$/;
  return regex.test(phone);
}
```

### 3. Currency Validation
```javascript
// Ensure SAR for KSA transactions
if (region === 'KSA' && currency !== 'sar') {
  throw new Error('KSA transactions must use SAR currency');
}
```

## Troubleshooting

### Common Issues

#### 1. Mada cards not appearing
**Solution:** Ensure Stripe account has Saudi Arabia enabled:
- Dashboard → Settings → Business details → Country: Saudi Arabia

#### 2. VAT not calculating
**Solution:** Pass `region: "KSA"` parameter:
```javascript
{
  amount: 1000,
  region: "KSA"  // This triggers VAT calculation
}
```

#### 3. Arabic text not displaying
**Solution:** Ensure UTF-8 encoding and Arabic font support:
```javascript
// Set locale in customer creation
preferred_locales: ['ar', 'en']
```

## Compliance Checklist

- ✅ VAT registered in Saudi Arabia (if required)
- ✅ VAT invoice template with all required fields
- ✅ Store VAT registration number in metadata
- ✅ Track VAT amounts separately from subtotals
- ✅ Generate VAT reports for tax filing
- ✅ Display prices including VAT to consumers
- ✅ Support Arabic language (RTL)
- ✅ Accept Mada cards (local requirement)
- ✅ Provide Saudi Riyal (SAR) pricing

## Next Steps

1. **Enable Stripe KSA**: Contact Stripe to enable Saudi Arabia on your account
2. **Test Integration**: Use test cards to verify payment flow
3. **Configure Webhooks**: Set up webhook endpoint for real-time updates
4. **UI Localization**: Add Arabic translations to your frontend
5. **VAT Registration**: Register for VAT if annual revenue > 375,000 SAR
6. **Go Live**: Switch to production Stripe keys

## Support

- **Stripe KSA Documentation**: https://stripe.com/docs/payments/mada
- **Saudi VAT Guide**: https://zatca.gov.sa/en/Pages/default.aspx
- **Payment Methods**: https://stripe.com/payments/payment-methods

---

**Status:** ✅ Production Ready
**Last Updated:** November 14, 2025
**Supported Regions:** KSA (Saudi Arabia), with extensibility for UAE, Kuwait, etc.

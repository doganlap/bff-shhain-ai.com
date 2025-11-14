# 🇸🇦 KSA Payment Integration - Quick Reference

## 🎯 What You Need to Know

### ✅ KSA Features Added
- **SAR Currency** - Saudi Riyal payments
- **15% VAT** - Automatic calculation and tracking
- **Mada Cards** - Saudi domestic debit network (most popular)
- **STC Pay** - Mobile wallet integration
- **Arabic Locale** - RTL support, Arabic customer names
- **BNPL** - Tabby and Tamara support

---

## 🚀 Quick Start

### 1. Create KSA Customer
```bash
curl -X POST http://localhost:3000/api/payments/customers \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "customer@example.sa",
    "name": "أحمد محمد",
    "phone": "+966501234567",
    "region": "KSA"
  }'
```

### 2. Create Payment (with automatic VAT)
```bash
curl -X POST http://localhost:3000/api/payments/intents \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 1000,
    "region": "KSA",
    "customerId": "cus_xxxxx"
  }'

# Result: 1150 SAR charged (1000 + 15% VAT)
```

### 3. Calculate VAT Only
```bash
curl -X POST http://localhost:3000/api/payments/ksa/calculate-vat \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"amount": 1000}'

# Response: {"subtotal": 1000, "vat": 150, "total": 1150}
```

---

## 📋 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/payments/ksa/config` | GET | Get KSA configuration |
| `/api/payments/ksa/calculate-vat` | POST | Calculate 15% VAT |
| `/api/payments/customers` | POST | Create customer (with KSA support) |
| `/api/payments/intents` | POST | Create payment (with auto-VAT) |

---

## 💡 Key Parameters

### Customer Creation
```javascript
{
  region: "KSA",              // Enable KSA features
  phone: "+966501234567"      // Required for STC Pay
}
```

### Payment Intent
```javascript
{
  amount: 1000,               // Amount in SAR (before VAT)
  region: "KSA",              // Auto-calculates 15% VAT
  currency: "sar"             // Or auto-set via region
}
```

---

## 🧮 VAT Calculation

| Amount (SAR) | VAT (15%) | Total |
|--------------|-----------|-------|
| 1,000 | 150 | 1,150 |
| 5,000 | 750 | 5,750 |
| 10,000 | 1,500 | 11,500 |
| 50,000 | 7,500 | 57,500 |

**Formula:** `Total = Amount × 1.15`

---

## 🔧 Configuration

### Environment Variables
```env
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```

### Stripe Dashboard Setup
1. **Enable Saudi Arabia**: Settings → Business details
2. **Enable Mada**: Payments → Payment methods → Mada
3. **Configure Webhook**: Webhooks → Add endpoint

---

## 💳 Payment Methods

| Method | Description | Market Share |
|--------|-------------|--------------|
| **Mada** | Saudi debit cards | 80%+ in KSA |
| **Cards** | Visa, Mastercard, Amex | International |
| **STC Pay** | Mobile wallet | Popular |
| **Tabby** | Buy now, pay later | Growing |
| **Tamara** | BNPL alternative | Growing |

---

## 📊 Response Metadata

When `region: "KSA"` is set, payment metadata includes:
```json
{
  "region": "KSA",
  "subtotal": "1000",
  "vat_amount": "150",
  "vat_rate": "15",
  "country_code": "SA"
}
```

---

## ✅ Testing

### Test Suite
```bash
# Run automated tests
node test-ksa-payments.js
```

### Manual Test
```bash
# 1. Get KSA config
curl http://localhost:3000/api/payments/ksa/config

# 2. Calculate VAT
curl -X POST http://localhost:3000/api/payments/ksa/calculate-vat \
  -H "Authorization: Bearer TOKEN" \
  -d '{"amount": 1000}'
```

### Test Cards (Stripe Test Mode)
```
Mada (Success):  5297410000000000
Mada (Decline):  5297410000000001
Visa (Success):  4242424242424242
```

---

## 📚 Documentation Files

1. **KSA_PAYMENT_GUIDE.md** - Complete guide (300+ lines)
2. **test-ksa-payments.js** - Test suite (250+ lines)
3. **KSA_IMPLEMENTATION_SUMMARY.md** - Technical details
4. **THIS FILE** - Quick reference

---

## 🎯 Use Cases

### 1. License Sales
```javascript
// Annual GRC license: 10,000 SAR
POST /api/payments/intents
{
  "amount": 10000,
  "region": "KSA",
  "metadata": {
    "product": "Enterprise License",
    "duration": "Annual"
  }
}
// Charged: 11,500 SAR (with VAT)
```

### 2. Consultation Services
```javascript
// Consulting package: 5,000 SAR
POST /api/payments/intents
{
  "amount": 5000,
  "region": "KSA",
  "metadata": {
    "service": "GRC Consultation",
    "hours": "10"
  }
}
// Charged: 5,750 SAR (with VAT)
```

### 3. Subscription Billing
```javascript
// Monthly subscription: 1,000 SAR
POST /api/payments/subscriptions
{
  "priceId": "price_xxxxx",
  "customerId": "cus_xxxxx",
  "metadata": {
    "region": "KSA",
    "plan": "Professional"
  }
}
// Recurring: 1,150 SAR/month (with VAT)
```

---

## ⚠️ Important Notes

### VAT Registration
- Required if annual revenue > 375,000 SAR
- Get VAT certificate from ZATCA (Zakat, Tax and Customs Authority)
- Display VAT number on invoices

### Phone Numbers
- Format: `+966` followed by 9 digits
- Example: `+966501234567`
- Required for STC Pay and some BNPL methods

### Arabic Names
- UTF-8 encoding required
- Example: `أحمد محمد عبدالله`
- RTL display support needed in frontend

### Currency
- Always use SAR for KSA customers
- Smallest unit: Halalas (100 halalas = 1 SAR)
- Stripe amounts in halalas (1 SAR = 100)

---

## 🆘 Troubleshooting

### Issue: Mada not appearing
**Fix:** Enable Saudi Arabia in Stripe account settings

### Issue: VAT not calculating
**Fix:** Add `region: "KSA"` parameter to payment intent

### Issue: Arabic text broken
**Fix:** Ensure UTF-8 encoding and Arabic font support

### Issue: Phone validation failing
**Fix:** Use format `+966501234567` (no spaces)

---

## 📞 Support Resources

- **Stripe KSA Docs:** https://stripe.com/docs/payments/mada
- **ZATCA (VAT Authority):** https://zatca.gov.sa
- **Test Suite:** `node test-ksa-payments.js`
- **Full Guide:** See `KSA_PAYMENT_GUIDE.md`

---

## ✅ Checklist for Production

- [ ] Stripe account has Saudi Arabia enabled
- [ ] Mada payment method activated
- [ ] Environment variables configured
- [ ] Tested with test mode cards
- [ ] Webhook endpoint configured
- [ ] VAT calculation verified
- [ ] Arabic locale tested
- [ ] Phone number validation working

---

**Status:** ✅ Production Ready
**Date:** November 14, 2025
**Region:** 🇸🇦 Saudi Arabia (KSA)
**Currency:** SAR (Saudi Riyal)
**VAT Rate:** 15%

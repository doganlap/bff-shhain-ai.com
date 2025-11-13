# 📋 Registration System Integration Guide
## Shahin-AI KSA Platform - Complete Setup Instructions

---

## 🎯 Overview

This guide provides complete instructions for integrating the **Story-Driven Registration Form** with:
- ✅ Database (PostgreSQL/MySQL)
- ✅ Email Service (SendGrid/AWS SES/Mailgun)
- ✅ Agent Notifications
- ✅ Email Verification System

---

## 📊 1. DATABASE SETUP

### PostgreSQL Schema

```sql
-- Create registrations table
CREATE TABLE registrations (
  id SERIAL PRIMARY KEY,
  registration_id VARCHAR(50) UNIQUE NOT NULL,
  
  -- Personal Information
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  country_code VARCHAR(10) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  job_title VARCHAR(150),
  department VARCHAR(100),
  
  -- Organization Information
  organization_name VARCHAR(255) NOT NULL,
  legal_structure VARCHAR(100) NOT NULL,
  industry VARCHAR(100) NOT NULL,
  employee_count VARCHAR(50) NOT NULL,
  looking_for VARCHAR(150) NOT NULL,
  
  -- Address Information
  address TEXT NOT NULL,
  country VARCHAR(100) NOT NULL,
  city VARCHAR(100) NOT NULL,
  website VARCHAR(255),
  has_internal_office VARCHAR(20) NOT NULL,
  
  -- System Fields
  status VARCHAR(50) DEFAULT 'pending_verification',
  locale VARCHAR(10) DEFAULT 'ar-SA',
  source VARCHAR(100) DEFAULT 'shahin-ai-ksa-platform',
  registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  email_verified BOOLEAN DEFAULT FALSE,
  email_verified_at TIMESTAMP,
  last_contacted_at TIMESTAMP,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Indexes for performance
  INDEX idx_email (email),
  INDEX idx_registration_id (registration_id),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at)
);

-- Create email verification tokens table
CREATE TABLE email_verification_tokens (
  id SERIAL PRIMARY KEY,
  registration_id VARCHAR(50) NOT NULL,
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (registration_id) REFERENCES registrations(registration_id),
  INDEX idx_token (token),
  INDEX idx_expires_at (expires_at)
);
```

---

## 🔌 2. API ENDPOINT SETUP

### Backend API Structure (Node.js/Express Example)

```javascript
// routes/registration.js
const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const crypto = require('crypto');

// POST /api/v1/registrations
router.post('/registrations', [
  // Validation middleware
  body('firstName').notEmpty().trim(),
  body('lastName').notEmpty().trim(),
  body('email').isEmail().normalizeEmail(),
  body('phone').notEmpty(),
  body('organizationName').notEmpty(),
  // Add more validations...
], async (req, res) => {
  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const registrationData = req.body;
    const registrationId = `REG-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
    
    // 1. Save to database
    await db.query(`
      INSERT INTO registrations (
        registration_id, first_name, last_name, email, country_code, phone,
        job_title, department, organization_name, legal_structure, industry,
        employee_count, looking_for, address, country, city, website,
        has_internal_office, status, locale, source
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      registrationId,
      registrationData.firstName,
      registrationData.lastName,
      registrationData.email,
      registrationData.countryCode,
      registrationData.phone,
      registrationData.jobTitle,
      registrationData.department,
      registrationData.organizationName,
      registrationData.legalStructure,
      registrationData.industry,
      registrationData.employeeCount,
      registrationData.lookingFor,
      registrationData.address,
      registrationData.country,
      registrationData.city,
      registrationData.website,
      registrationData.hasInternalOffice,
      'pending_verification',
      registrationData.locale || 'ar-SA',
      registrationData.source || 'shahin-ai-ksa-platform'
    ]);

    // 2. Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    
    await db.query(`
      INSERT INTO email_verification_tokens (registration_id, token, expires_at)
      VALUES (?, ?, ?)
    `, [registrationId, verificationToken, expiresAt]);

    // 3. Send confirmation email to user
    await sendConfirmationEmail({
      email: registrationData.email,
      name: `${registrationData.firstName} ${registrationData.lastName}`,
      registrationId,
      verificationToken
    });

    // 4. Send notification to agent
    await sendAgentNotification({
      registrationData,
      registrationId
    });

    res.status(201).json({
      success: true,
      registrationId,
      message: 'Registration successful. Please check your email for verification.'
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed. Please try again.'
    });
  }
});

// GET /api/v1/verify-email
router.get('/verify-email', async (req, res) => {
  try {
    const { token } = req.query;
    
    // Verify token
    const tokenData = await db.query(`
      SELECT * FROM email_verification_tokens
      WHERE token = ? AND used = FALSE AND expires_at > NOW()
    `, [token]);

    if (tokenData.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification token'
      });
    }

    // Update registration
    await db.query(`
      UPDATE registrations
      SET email_verified = TRUE, email_verified_at = NOW(), status = 'verified'
      WHERE registration_id = ?
    `, [tokenData[0].registration_id]);

    // Mark token as used
    await db.query(`
      UPDATE email_verification_tokens
      SET used = TRUE
      WHERE token = ?
    `, [token]);

    res.redirect('/verification-success');

  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Verification failed'
    });
  }
});

module.exports = router;
```

---

## 📧 3. EMAIL SERVICE INTEGRATION

### Option 1: SendGrid

```javascript
// services/emailService.js
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

async function sendConfirmationEmail({ email, name, registrationId, verificationToken }) {
  const verificationUrl = `${process.env.APP_URL}/api/v1/verify-email?token=${verificationToken}`;
  
  const msg = {
    to: email,
    from: 'registrations@shahin-ai.com',
    templateId: 'd-xxxxxxxxxxxxxxxxx', // SendGrid template ID
    dynamicTemplateData: {
      name,
      registrationId,
      verificationUrl,
      year: new Date().getFullYear()
    }
  };

  await sgMail.send(msg);
}

async function sendAgentNotification({ registrationData, registrationId }) {
  const msg = {
    to: ['registrations@shahin-ai.com', 'sales@shahin-ai.com'],
    from: 'system@shahin-ai.com',
    subject: `🔔 New Registration: ${registrationData.organizationName}`,
    html: `
      <h2>New Registration Received</h2>
      <p><strong>Registration ID:</strong> ${registrationId}</p>
      <p><strong>Name:</strong> ${registrationData.firstName} ${registrationData.lastName}</p>
      <p><strong>Email:</strong> ${registrationData.email}</p>
      <p><strong>Phone:</strong> ${registrationData.countryCode} ${registrationData.phone}</p>
      <p><strong>Organization:</strong> ${registrationData.organizationName}</p>
      <p><strong>Industry:</strong> ${registrationData.industry}</p>
      <p><strong>Looking For:</strong> ${registrationData.lookingFor}</p>
      <p><strong>Country:</strong> ${registrationData.country}</p>
      <p><strong>City:</strong> ${registrationData.city}</p>
      <hr>
      <p>Please review and contact within 2-4 business hours.</p>
    `
  };

  await sgMail.send(msg);
}
```

### Option 2: AWS SES

```javascript
const AWS = require('aws-sdk');
const ses = new AWS.SES({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY
});

async function sendConfirmationEmail({ email, name, registrationId, verificationToken }) {
  const verificationUrl = `${process.env.APP_URL}/api/v1/verify-email?token=${verificationToken}`;
  
  const params = {
    Source: 'registrations@shahin-ai.com',
    Destination: { ToAddresses: [email] },
    Message: {
      Subject: {
        Data: 'تأكيد التسجيل | Shahin-AI KSA Registration Confirmation',
        Charset: 'UTF-8'
      },
      Body: {
        Html: {
          Data: `
            <div dir="rtl" style="font-family: Arial, sans-serif;">
              <h2>مرحباً ${name}</h2>
              <p>شكراً لتسجيلك في منصة شاهين الذكي السعودية</p>
              <p>رقم التسجيل: ${registrationId}</p>
              <p><a href="${verificationUrl}" style="background: #0066cc; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">تأكيد البريد الإلكتروني</a></p>
            </div>
            <hr>
            <div style="font-family: Arial, sans-serif;">
              <h2>Welcome ${name}</h2>
              <p>Thank you for registering with Shahin-AI KSA platform</p>
              <p>Registration ID: ${registrationId}</p>
              <p><a href="${verificationUrl}" style="background: #0066cc; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Verify Email</a></p>
            </div>
          `,
          Charset: 'UTF-8'
        }
      }
    }
  };

  await ses.sendEmail(params).promise();
}
```

---

## 🔐 4. ENVIRONMENT VARIABLES

Create a `.env` file in your backend:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=shahin_grc
DB_USER=postgres
DB_PASSWORD=your_password

# Email Service (Choose one)
# SendGrid
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxx

# AWS SES
AWS_REGION=us-east-1
AWS_ACCESS_KEY=AKIAxxxxxxxxxxxxx
AWS_SECRET_KEY=xxxxxxxxxxxxxxxxxxxxxxxx

# Application
APP_URL=https://app.shahin-ai.com
NODE_ENV=production

# Email Addresses
REGISTRATION_EMAIL=registrations@shahin-ai.com
SALES_EMAIL=sales@shahin-ai.com
SYSTEM_EMAIL=system@shahin-ai.com
```

---

## 🚀 5. FRONTEND INTEGRATION

Update `StoryDrivenRegistration.jsx`:

```javascript
const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError('');

  try {
    // Call actual API endpoint
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/registrations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...formData,
        countryCode: formData.countryCode,
        fullPhone: `${formData.countryCode} ${formData.phone}`,
        registrationDate: new Date().toISOString(),
        source: 'shahin-ai-ksa-platform',
        status: 'pending_verification',
        locale: 'ar-SA'
      })
    });

    const result = await response.json();

    if (result.success) {
      setRegistrationData({
        email: formData.email,
        name: `${formData.firstName} ${formData.lastName}`,
        organization: formData.organizationName,
        confirmationId: result.registrationId
      });
      setRegistrationSuccess(true);
    } else {
      throw new Error(result.message || 'Registration failed');
    }
  } catch (err) {
    console.error('Registration error:', err);
    setError('حدث خطأ في التسجيل. يرجى المحاولة مرة أخرى | Registration failed. Please try again.');
  } finally {
    setLoading(false);
  }
};
```

---

## 📱 6. ADDITIONAL INTEGRATIONS

### Slack Notifications

```javascript
const axios = require('axios');

async function sendSlackNotification(registrationData) {
  await axios.post(process.env.SLACK_WEBHOOK_URL, {
    text: `🎉 New Registration`,
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*New Registration Received*\n*Name:* ${registrationData.firstName} ${registrationData.lastName}\n*Organization:* ${registrationData.organizationName}\n*Email:* ${registrationData.email}`
        }
      }
    ]
  });
}
```

### SMS Notifications (Twilio)

```javascript
const twilio = require('twilio');
const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

async function sendSMSNotification(registrationData) {
  await client.messages.create({
    body: `New registration from ${registrationData.organizationName}. Check dashboard for details.`,
    from: process.env.TWILIO_PHONE,
    to: process.env.SALES_PHONE
  });
}
```

---

## ✅ 7. TESTING CHECKLIST

- [ ] Database connection works
- [ ] Registration saves to database correctly
- [ ] Confirmation email sent to user
- [ ] Agent notification email sent
- [ ] Email verification link works
- [ ] Success page displays correctly
- [ ] Error handling works properly
- [ ] All required fields validated
- [ ] Duplicate email prevention works
- [ ] Form clears after successful submission

---

## 📞 8. SUPPORT & TROUBLESHOOTING

### Common Issues:

1. **Email not sending**: Check SMTP/API credentials and firewall settings
2. **Database connection failed**: Verify connection string and credentials
3. **Token expired**: Extend token expiration time in code
4. **Duplicate email**: Add unique constraint and handle error gracefully

---

## 🎉 DEPLOYMENT READY

Once everything is set up and tested, the registration system will:
- ✅ Collect comprehensive business data
- ✅ Store securely in database
- ✅ Send automatic confirmation emails
- ✅ Notify sales team instantly
- ✅ Provide email verification
- ✅ Display professional success message
- ✅ Track all registrations

**Your registration system is now enterprise-ready! 🚀**

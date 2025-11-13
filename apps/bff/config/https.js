/**
 * HTTPS/SSL Configuration
 * Handles SSL/TLS certificate management for production
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

/**
 * Load SSL certificates
 */
function loadSSLCertificates() {
  const certPath = process.env.SSL_CERT_PATH || '/etc/ssl/certs';
  const keyPath = process.env.SSL_KEY_PATH || '/etc/ssl/private';
  
  try {
    const cert = fs.readFileSync(path.join(certPath, 'server.crt'), 'utf8');
    const key = fs.readFileSync(path.join(keyPath, 'server.key'), 'utf8');
    
    // Optional: CA certificate for chain
    let ca;
    try {
      ca = fs.readFileSync(path.join(certPath, 'ca.crt'), 'utf8');
    } catch (e) {
      console.log('[HTTPS] CA certificate not found, using cert only');
    }
    
    return { cert, key, ca };
  } catch (error) {
    console.error('[HTTPS] Failed to load SSL certificates:', error.message);
    return null;
  }
}

/**
 * Create HTTPS server
 */
function createSecureServer(app) {
  const sslEnabled = process.env.SSL_ENABLED === 'true';
  
  if (!sslEnabled || process.env.NODE_ENV !== 'production') {
    console.log('[HTTPS] SSL disabled, using HTTP server');
    return http.createServer(app);
  }
  
  const credentials = loadSSLCertificates();
  
  if (!credentials) {
    console.warn('[HTTPS] SSL certificates not found, falling back to HTTP');
    return http.createServer(app);
  }
  
  console.log('[HTTPS] Creating HTTPS server with SSL certificates');
  
  return https.createServer({
    ...credentials,
    // Security options
    minVersion: 'TLSv1.2',
    ciphers: [
      'ECDHE-ECDSA-AES128-GCM-SHA256',
      'ECDHE-RSA-AES128-GCM-SHA256',
      'ECDHE-ECDSA-AES256-GCM-SHA384',
      'ECDHE-RSA-AES256-GCM-SHA384',
      'ECDHE-ECDSA-CHACHA20-POLY1305',
      'ECDHE-RSA-CHACHA20-POLY1305',
    ].join(':'),
    honorCipherOrder: true,
  }, app);
}

/**
 * Force HTTPS redirect middleware
 */
function forceHTTPS(req, res, next) {
  if (process.env.NODE_ENV !== 'production') {
    return next();
  }
  
  // Check if request is secure
  const isSecure = 
    req.secure ||
    req.headers['x-forwarded-proto'] === 'https' ||
    req.connection.encrypted;
  
  if (!isSecure) {
    const httpsUrl = `https://${req.headers.host}${req.url}`;
    console.log(`[HTTPS] Redirecting to HTTPS: ${httpsUrl}`);
    return res.redirect(301, httpsUrl);
  }
  
  next();
}

/**
 * Enhanced HSTS middleware
 */
function hstsMiddleware() {
  return (req, res, next) => {
    if (process.env.NODE_ENV === 'production') {
      // Strict Transport Security
      res.setHeader(
        'Strict-Transport-Security',
        'max-age=31536000; includeSubDomains; preload'
      );
    }
    next();
  };
}

/**
 * Certificate renewal check
 */
function checkCertificateExpiry() {
  const credentials = loadSSLCertificates();
  
  if (!credentials) {
    return null;
  }
  
  try {
    const { X509Certificate } = require('crypto');
    const cert = new X509Certificate(credentials.cert);
    
    const expiryDate = new Date(cert.validTo);
    const daysUntilExpiry = Math.floor((expiryDate - Date.now()) / (1000 * 60 * 60 * 24));
    
    const info = {
      subject: cert.subject,
      issuer: cert.issuer,
      validFrom: cert.validFrom,
      validTo: cert.validTo,
      daysUntilExpiry,
    };
    
    // Warn if certificate expires soon
    if (daysUntilExpiry < 30) {
      console.warn(`[HTTPS] SSL certificate expires in ${daysUntilExpiry} days!`);
      
      // Send alert
      if (process.env.SENTRY_ENABLED === 'true') {
        const { captureMessage } = require('../integrations/sentry');
        captureMessage(
          `SSL certificate expires in ${daysUntilExpiry} days`,
          'warning',
          { extra: info }
        );
      }
    }
    
    return info;
  } catch (error) {
    console.error('[HTTPS] Failed to check certificate expiry:', error);
    return null;
  }
}

/**
 * Let's Encrypt ACME challenge handler
 * For automatic certificate renewal
 */
function acmeChallengeHandler(req, res, next) {
  if (req.url.startsWith('/.well-known/acme-challenge/')) {
    const token = req.url.split('/').pop();
    const challengePath = process.env.ACME_CHALLENGE_PATH || '/var/www/certbot';
    const filePath = path.join(challengePath, token);
    
    if (fs.existsSync(filePath)) {
      return res.sendFile(filePath);
    }
  }
  
  next();
}

module.exports = {
  createSecureServer,
  forceHTTPS,
  hstsMiddleware,
  checkCertificateExpiry,
  acmeChallengeHandler,
  loadSSLCertificates,
};

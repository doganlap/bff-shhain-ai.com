# 🔒 GRC Platform Production Security Checklist

## ✅ **Pre-Deployment Security Requirements**

### 🔐 **1. Environment Configuration**
- [ ] **Copy `.env.production.template` to `.env.production`**
- [ ] **Generate secure passwords (32+ characters):**
  - [ ] `DB_PASSWORD` - Database password
  - [ ] `JWT_SECRET` - JWT signing secret (64+ chars)
  - [ ] `JWT_REFRESH_SECRET` - JWT refresh secret (64+ chars)
  - [ ] `REDIS_PASSWORD` - Redis password
  - [ ] `SERVICE_TOKEN` - Inter-service communication token
  - [ ] `ENCRYPTION_KEY` - Must be exactly 32 characters for AES-256
  - [ ] `RABBITMQ_PASS` - RabbitMQ password (if using)

### 🌐 **2. Domain Configuration**
- [ ] **Update domain names in `.env.production`:**
  - [ ] `DOMAIN_NAME` - Your actual domain (e.g., grc.company.com)
  - [ ] `ADMIN_EMAIL` - Valid admin email for SSL certificates
  - [ ] `FRONTEND_URL` - Full HTTPS URL
  - [ ] `VITE_API_URL` - API endpoint URL

### 📧 **3. SMTP Configuration**
- [ ] **Configure email settings:**
  - [ ] `SMTP_HOST` - Your SMTP server
  - [ ] `SMTP_USER` - SMTP username
  - [ ] `SMTP_PASSWORD` - App-specific password
  - [ ] `SMTP_FROM` - From email address

### 🔒 **4. SSL/TLS Setup**
- [ ] **DNS Configuration:**
  - [ ] A record pointing to your server IP
  - [ ] CNAME record for www subdomain
  - [ ] DNS propagation completed (check with `nslookup`)
- [ ] **SSL Certificate:**
  - [ ] Run `bash scripts/setup-ssl.sh` for Let's Encrypt
  - [ ] Or upload custom certificates to `/etc/letsencrypt/live/`
  - [ ] Verify certificate installation

## 🛡️ **Security Hardening**

### 🔐 **5. Database Security**
- [ ] **PostgreSQL Configuration:**
  - [ ] Change default database name from `grc_ecosystem`
  - [ ] Use strong database user password
  - [ ] Enable connection encryption
  - [ ] Configure proper backup strategy
  - [ ] Set up database monitoring

### 🔴 **6. Redis Security**
- [ ] **Redis Configuration:**
  - [ ] Enable password authentication
  - [ ] Disable dangerous commands
  - [ ] Configure memory limits
  - [ ] Enable persistence if needed

### 🌐 **7. Nginx Security**
- [ ] **Web Server Hardening:**
  - [ ] Update `nginx.production.conf` with your domain
  - [ ] Review security headers configuration
  - [ ] Configure rate limiting rules
  - [ ] Set up fail2ban (optional)
  - [ ] Configure log rotation

### 🐳 **8. Docker Security**
- [ ] **Container Security:**
  - [ ] Run containers as non-root users
  - [ ] Enable read-only filesystems where possible
  - [ ] Use security-opt flags
  - [ ] Scan images for vulnerabilities
  - [ ] Keep base images updated

## 🔍 **Security Validation**

### 🧪 **9. Security Testing**
- [ ] **SSL/TLS Testing:**
  - [ ] Test with SSL Labs: https://www.ssllabs.com/ssltest/
  - [ ] Verify HSTS headers
  - [ ] Check certificate chain
  - [ ] Test HTTP to HTTPS redirect

- [ ] **Security Headers Testing:**
  - [ ] Test with Security Headers: https://securityheaders.com/
  - [ ] Verify CSP policy
  - [ ] Check X-Frame-Options
  - [ ] Validate CSRF protection

- [ ] **Application Security:**
  - [ ] Test authentication flows
  - [ ] Verify authorization controls
  - [ ] Check input validation
  - [ ] Test file upload restrictions
  - [ ] Validate API rate limiting

### 📊 **10. Monitoring & Logging**
- [ ] **Security Monitoring:**
  - [ ] Configure log aggregation
  - [ ] Set up security alerts
  - [ ] Monitor failed login attempts
  - [ ] Track API usage patterns
  - [ ] Set up uptime monitoring

## 🚀 **Deployment Commands**

### **Fresh Production Deployment:**
```bash
# 1. Configure environment
cp .env.production.template .env.production
# Edit .env.production with your values

# 2. Set up SSL certificates
bash scripts/setup-ssl.sh

# 3. Deploy with fresh build
./deploy-production.bat

# 4. Verify deployment
./verify-build.bat
```

### **Security Validation Commands:**
```bash
# Test SSL configuration
curl -I https://your-domain.com

# Check security headers
curl -I https://your-domain.com | grep -E "(Strict-Transport|X-Frame|X-Content)"

# Test API endpoints
curl -X GET https://your-domain.com/api/health

# Check container security
docker exec grc-web whoami  # Should not be root
```

## ⚠️ **Security Warnings**

### 🚨 **Critical Security Issues to Avoid:**
- ❌ **Never use default passwords in production**
- ❌ **Never commit `.env.production` to version control**
- ❌ **Never run containers as root user**
- ❌ **Never disable SSL/TLS in production**
- ❌ **Never expose database ports to public internet**
- ❌ **Never use HTTP for authentication endpoints**

### 🔒 **Additional Security Recommendations:**
- ✅ **Enable two-factor authentication for admin accounts**
- ✅ **Implement IP whitelisting for admin access**
- ✅ **Set up automated security updates**
- ✅ **Regular security audits and penetration testing**
- ✅ **Backup encryption and secure storage**
- ✅ **Incident response plan documentation**

## 📋 **Post-Deployment Checklist**

- [ ] **Functional Testing:**
  - [ ] User registration and login
  - [ ] API endpoints responding
  - [ ] File upload functionality
  - [ ] Email notifications working
  - [ ] Database connections stable

- [ ] **Performance Testing:**
  - [ ] Load testing completed
  - [ ] Response times acceptable
  - [ ] Memory usage within limits
  - [ ] Database performance optimized

- [ ] **Security Validation:**
  - [ ] Vulnerability scan completed
  - [ ] Penetration testing performed
  - [ ] Security headers verified
  - [ ] SSL certificate valid

- [ ] **Monitoring Setup:**
  - [ ] Health checks configured
  - [ ] Log monitoring active
  - [ ] Alert notifications working
  - [ ] Backup procedures tested

## 🆘 **Emergency Contacts & Procedures**

### **Security Incident Response:**
1. **Immediate Actions:**
   - Stop affected services: `docker-compose down`
   - Preserve logs: `docker-compose logs > incident-$(date).log`
   - Notify security team
   - Document incident timeline

2. **Recovery Procedures:**
   - Restore from clean backup
   - Update security configurations
   - Patch vulnerabilities
   - Monitor for continued threats

### **Support Contacts:**
- **System Administrator:** [Your Contact]
- **Security Team:** [Security Contact]
- **Database Administrator:** [DBA Contact]
- **DevOps Team:** [DevOps Contact]

---

**🔒 Remember: Security is an ongoing process, not a one-time setup!**

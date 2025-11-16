# 🚀 Shahin AI Platform - Production Deployment Guide

## 📦 Current Status: READY FOR PRODUCTION

**✅ Build Complete**: November 2, 2025  
**✅ Domain**: shahin-ai.com configured  
**✅ Features**: Login gateway + Multi-modal AI + Landing page  
**✅ Size**: ~501KB optimized build  

---

## 🌐 Production Deployment Options

### Option 1: VPS/Dedicated Server (Recommended)
### Option 2: Azure Container Apps
### Option 3: Vercel/Netlify (Frontend Only)

---

## 🖥️ **OPTION 1: VPS/Dedicated Server Deployment**

### Prerequisites
- Ubuntu 20.04+ or CentOS 8+
- Domain: shahin-ai.com pointing to your server IP
- Root/sudo access

### Step 1: Server Setup
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install required packages
sudo apt install -y nginx nodejs npm certbot python3-certbot-nginx git

# Install PM2 for process management
sudo npm install -g pm2
```

### Step 2: Upload Files
```bash
# Create directories
sudo mkdir -p /var/www/shahin-ai.com
sudo mkdir -p /opt/shahin-api

# Upload files (from your local machine)
scp -r landing-page/dist/* user@your-server:/var/www/shahin-ai.com/
scp -r backend/* user@your-server:/opt/shahin-api/
scp nginx-shahin-ai.conf user@your-server:/tmp/

# Set permissions
sudo chown -R www-data:www-data /var/www/shahin-ai.com
sudo chown -R $USER:$USER /opt/shahin-api
```

### Step 3: Backend Setup
```bash
# Install backend dependencies
cd /opt/shahin-api
npm install --production

# Copy environment file
cp .env.production .env

# Start with PM2
pm2 start server.js --name shahin-api
pm2 save
pm2 startup

# Check status
pm2 status
```

### Step 4: Nginx Configuration
```bash
# Copy nginx configuration
sudo cp /tmp/nginx-shahin-ai.conf /etc/nginx/sites-available/
sudo ln -sf /etc/nginx/sites-available/nginx-shahin-ai.conf /etc/nginx/sites-enabled/

# Remove default site
sudo rm -f /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx
```

### Step 5: SSL Certificate
```bash
# Generate Let's Encrypt SSL
sudo certbot --nginx -d shahin-ai.com -d www.shahin-ai.com

# Test auto-renewal
sudo certbot renew --dry-run

# Setup auto-renewal cron
echo "0 12 * * * /usr/bin/certbot renew --quiet" | sudo crontab -
```

### Step 6: Firewall Setup
```bash
# Configure UFW firewall
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

---

## ☁️ **OPTION 2: Azure Container Apps**

### Step 1: Build Docker Images
```dockerfile
# Frontend Dockerfile
FROM nginx:alpine
COPY landing-page/dist /usr/share/nginx/html
COPY nginx-shahin-ai.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

```dockerfile
# Backend Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY backend/package*.json ./
RUN npm install --production
COPY backend/ .
EXPOSE 3001
CMD ["node", "server.js"]
```

### Step 2: Azure CLI Commands
```bash
# Login to Azure
az login

# Create resource group
az group create --name shahin-ai-rg --location eastus

# Create container app environment
az containerapp env create \
  --name shahin-ai-env \
  --resource-group shahin-ai-rg \
  --location eastus

# Deploy backend
az containerapp create \
  --name shahin-api \
  --resource-group shahin-ai-rg \
  --environment shahin-ai-env \
  --image your-registry/shahin-backend:latest \
  --target-port 3001 \
  --ingress external

# Deploy frontend
az containerapp create \
  --name shahin-frontend \
  --resource-group shahin-ai-rg \
  --environment shahin-ai-env \
  --image your-registry/shahin-frontend:latest \
  --target-port 80 \
  --ingress external

# Configure custom domain
az containerapp hostname add \
  --hostname shahin-ai.com \
  --name shahin-frontend \
  --resource-group shahin-ai-rg
```

---

## 🌍 **OPTION 3: Vercel Deployment (Frontend + Serverless)**

### Step 1: Install Vercel CLI
```bash
npm i -g vercel
```

### Step 2: Deploy
```bash
cd landing-page
vercel --prod
```

### Step 3: Configure Domain
```bash
vercel domains add shahin-ai.com
vercel alias https://your-app.vercel.app shahin-ai.com
```

---

## 🔧 **Quick Deploy Script**

I'll create an automated deployment script:

```bash
#!/bin/bash
# Quick VPS Deployment Script

set -e

echo "🚀 Deploying Shahin AI Platform to Production..."

# Configuration
DOMAIN="shahin-ai.com"
FRONTEND_DIR="/var/www/shahin-ai.com"
BACKEND_DIR="/opt/shahin-api"

# Install system packages
sudo apt update
sudo apt install -y nginx nodejs npm certbot python3-certbot-nginx

# Install PM2
sudo npm install -g pm2

# Create directories
sudo mkdir -p $FRONTEND_DIR
sudo mkdir -p $BACKEND_DIR

# Copy files (assuming you're in project directory)
sudo cp -r landing-page/dist/* $FRONTEND_DIR/
sudo cp -r backend/* $BACKEND_DIR/

# Set permissions
sudo chown -R www-data:www-data $FRONTEND_DIR
sudo chown -R $USER:$USER $BACKEND_DIR

# Install backend dependencies
cd $BACKEND_DIR
npm install --production

# Start backend
pm2 start server.js --name shahin-api
pm2 save
pm2 startup

# Configure Nginx
sudo cp nginx-shahin-ai.conf /etc/nginx/sites-available/
sudo ln -sf /etc/nginx/sites-available/nginx-shahin-ai.conf /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test and restart Nginx
sudo nginx -t
sudo systemctl restart nginx

# Setup SSL
sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN

echo "✅ Deployment Complete!"
echo "🌐 Visit: https://$DOMAIN"
```

---

## 📋 **Post-Deployment Checklist**

### ✅ **Verify Deployment**
- [ ] **Frontend**: https://shahin-ai.com loads
- [ ] **API Health**: https://shahin-ai.com/api/ai/health
- [ ] **Login Modal**: Opens and functions
- [ ] **AI Chat**: Multi-modal interface works
- [ ] **SSL Certificate**: Valid and secure
- [ ] **Mobile**: Responsive design works
- [ ] **Performance**: Page loads < 3 seconds

### ✅ **Monitor Services**
```bash
# Check backend status
pm2 status
pm2 logs shahin-api

# Check Nginx
sudo systemctl status nginx
sudo nginx -t

# Check SSL
sudo certbot certificates

# Monitor logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

---

## 🆘 **Troubleshooting**

### Common Issues & Solutions

**Issue**: API not responding
```bash
# Solution
pm2 restart shahin-api
pm2 logs shahin-api
```

**Issue**: SSL certificate problems
```bash
# Solution
sudo certbot renew
sudo systemctl reload nginx
```

**Issue**: Domain not resolving
```bash
# Check DNS
nslookup shahin-ai.com
dig shahin-ai.com
```

**Issue**: Permission errors
```bash
# Fix permissions
sudo chown -R www-data:www-data /var/www/shahin-ai.com
sudo chown -R $USER:$USER /opt/shahin-api
```

---

## 📊 **Performance Optimization**

### Backend Optimization
```bash
# Enable Nginx gzip
# Already configured in nginx-shahin-ai.conf

# PM2 cluster mode
pm2 start server.js --name shahin-api -i max

# Monitor performance
pm2 monit
```

### Database Setup (if needed)
```bash
# Install MongoDB (if required)
sudo apt install -y mongodb
sudo systemctl start mongodb
sudo systemctl enable mongodb
```

---

## 🎉 **Your Shahin AI Platform is Production Ready!**

**Current Build Status:**
- ✅ **Frontend**: Optimized (501KB total)
- ✅ **Backend**: Multi-AI routing ready  
- ✅ **Domain**: shahin-ai.com configured
- ✅ **Login**: Gateway functionality complete
- ✅ **SSL**: Let's Encrypt ready
- ✅ **Performance**: Production optimized

**Choose your deployment method and follow the guide above!**
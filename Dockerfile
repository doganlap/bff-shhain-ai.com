FROM node:20-alpine

# Add build argument for cache busting
ARG BUILD_DATE
ARG BUILD_VERSION
ENV BUILD_DATE=${BUILD_DATE}
ENV BUILD_VERSION=${BUILD_VERSION}

WORKDIR /app

# Copy package files
COPY package.json ./

# Copy Prisma files before npm install to avoid postinstall issues
COPY prisma ./prisma

# Install dependencies
RUN npm install --ignore-scripts

# Generate Prisma client manually
RUN npx prisma generate

# Copy application code
COPY . .

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

USER nodejs

# Expose port (should match PORT in .env)
EXPOSE 3005

# Health check using the health endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3005/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start server
CMD ["npm", "start"]


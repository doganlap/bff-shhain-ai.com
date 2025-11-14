# Multi-stage build for GRC Assessment App
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install --legacy-peer-deps

COPY frontend/ ./
RUN npm run build

FROM node:20-alpine AS backend-builder

WORKDIR /app/backend
COPY backend/ .
RUN npm install --production

FROM node:20-alpine AS final

# Install PostgreSQL client for database operations
RUN apk add --no-cache postgresql-client

WORKDIR /app

# Copy backend
COPY --from=backend-builder /app/backend ./backend

# Copy frontend build
COPY --from=frontend-builder /app/frontend/dist ./frontend/build

# Copy database schema
COPY database-schema/ ./database-schema/

# Copy main package.json
COPY package.json ./

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S grc -u 1001 -G nodejs

# Change ownership
RUN chown -R grc:nodejs /app

USER grc

EXPOSE 5001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "const http = require('http'); http.get('http://localhost:5001/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1); }).on('error', () => process.exit(1));"

CMD ["node", "backend/server.js"]
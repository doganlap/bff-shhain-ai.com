// Vercel API Route - Proxy to BFF
// This file routes all /api/* requests to the BFF service

const path = require('path');

// Import the BFF app
const app = require('../apps/bff/index.js');

module.exports = app;

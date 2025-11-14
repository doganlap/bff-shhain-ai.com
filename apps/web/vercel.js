import app from './api/index.js';

// Vercel serverless function handler
export default (req, res) => {
  // Handle Vercel serverless function requirements
  if (!req.url) {
    req.url = '/';
  }
  if (!req.method) {
    req.method = 'GET';
  }
  
  // Set up proper request context for Express
  req.headers = req.headers || {};
  req.query = req.query || {};
  req.body = req.body || {};
  
  return app(req, res);
};
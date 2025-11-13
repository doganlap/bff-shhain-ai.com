// routes/vercel.js

const express = require('express');
const axios = require('axios');
const router = express.Router();

const VERCEL_API_URL = 'https://api.vercel.com';
const VERCEL_ACCESS_TOKEN = process.env.VERCEL_ACCESS_TOKEN;
const VERCEL_PROJECT_ID = process.env.VERCEL_PROJECT_ID || 'shainpag'; // Default to your project name

const vercelApi = axios.create({
  baseURL: VERCEL_API_URL,
  headers: {
    'Authorization': `Bearer ${VERCEL_ACCESS_TOKEN}`
  }
});

// Route to get the latest deployments
router.get('/deployments', async (req, res) => {
  try {
    const response = await vercelApi.get(`/v6/deployments?projectId=${VERCEL_PROJECT_ID}&limit=5`);
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching Vercel deployments:', error.message);
    res.status(500).json({ error: 'Failed to fetch deployments' });
  }
});

// Route to get project status
router.get('/status', async (req, res) => {
  try {
    const response = await vercelApi.get(`/v9/projects/${VERCEL_PROJECT_ID}`);
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching Vercel project status:', error.message);
    res.status(500).json({ error: 'Failed to fetch project status' });
  }
});

module.exports = router;

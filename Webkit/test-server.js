// Simple test to verify if we can create a basic HTTP server
const express = require('express');
const app = express();
const PORT = 3002;

app.get('/test', (req, res) => {
  res.json({ status: 'working', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Test server running on http://localhost:${PORT}/test`);
});
const express = require('express');  
const cors = require('cors');  
const path = require('path');  
  
const app = express();  
const port = 3001;  
  
// Security and CORS configuration  
app.use(cors({  
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000'],  
  credentials: true,  
  methods: ['GET', 'POST', 'PUT', 'DELETE'],  
  allowedHeaders: ['Content-Type', 'Authorization']  
}));  
  
app.use(express.json());  
app.use(express.static('public'));  
  
// API Routes  
app.get('/health', (req, res) => {  
  res.json({status: 'ok', timestamp: new Date(), security: 'enabled'});  
});  
  
app.get('/', (req, res) => {  
  res.json({message: 'GRC Backend API', version: '1.0.0', security: 'CORS enabled'});  
});  
  
app.get('/api/test', (req, res) => {  
  res.json({data: 'Security test passed', cors: 'working'});  
});  
  
app.listen(port, '0.0.0.0', () => {  
  console.log(`GRC Backend server running on http://localhost:${port}`);  
  console.log('CORS enabled for localhost:5173');  
  console.log('Security: Enabled');  
}); 

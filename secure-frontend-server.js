const http = require('http');  
const fs = require('fs');  
const path = require('path');  
  
const server = http.createServer((req, res) => {  
  // Security headers  
  res.setHeader('Access-Control-Allow-Origin', '*');  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');  
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');  
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');  
  res.setHeader('X-Content-Type-Options', 'nosniff');  
  

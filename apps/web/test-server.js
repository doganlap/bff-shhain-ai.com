const http = require('http');  
const path = require('path');  
const server = http.createServer((req, res) => {  
  res.writeHead(200, {'Content-Type': 'text/html'});  
  res.end('<h1>GRC System Test</h1><p>If you can see this, the server is working!</p>');  
});  
server.listen(3000, () => console.log('Test server running at http://localhost:3000'));  

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 STARTING ADVANCED GRC UI');
console.log('============================\n');

// Start backend server
console.log('📡 Starting Backend Server...');
const backend = spawn('node', ['server.js'], {
  cwd: path.join(__dirname, 'backend'),
  stdio: 'inherit',
  shell: true
});

// Wait a moment for backend to start
setTimeout(() => {
  console.log('\n🎨 Starting Frontend Application...');
  
  // Start frontend development server
  const frontend = spawn('npm', ['start'], {
    cwd: path.join(__dirname, 'frontend'),
    stdio: 'inherit',
    shell: true
  });

  // Handle process termination
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down servers...');
    backend.kill();
    frontend.kill();
    process.exit();
  });

  frontend.on('close', (code) => {
    console.log(`Frontend process exited with code ${code}`);
    backend.kill();
  });

  backend.on('close', (code) => {
    console.log(`Backend process exited with code ${code}`);
    frontend.kill();
  });

}, 3000);

console.log('\n📊 Advanced GRC Platform Features:');
console.log('✅ Real-time Dashboard with 25 Regulators');
console.log('✅ Assessment Manager with 2,568+ Controls');
console.log('✅ Framework Manager with 21 Frameworks');
console.log('✅ Multi-tenant Architecture');
console.log('✅ RBAC Security System');
console.log('✅ Comprehensive Database Schema');
console.log('\n🌐 Frontend will be available at: http://localhost:3000');
console.log('🔧 Backend API available at: http://localhost:5001');
console.log('\n📋 Use Ctrl+C to stop both servers');

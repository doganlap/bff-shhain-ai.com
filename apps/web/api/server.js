import app from './index.js';

const PORT = process.env.PORT || 3005;

app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`Simple GRC API Server Started`);
  console.log(`===============================================`);
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
  console.log(`Test login: http://localhost:${PORT}/api/auth/login`);
  console.log(`===============================================`);
});
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { PORT, UPLOAD_DIR } = require('./config/constants');
const { initializeDatabase } = require('./db/init');

// Route imports
const authRoutes = require('./routes/auth.routes');
const internshipRoutes = require('./routes/internships.routes');
const applicationRoutes = require('./routes/applications.routes');
const testRoutes = require('./routes/tests.routes');
const questionRoutes = require('./routes/questions.routes');
const studentRoutes = require('./routes/students.routes');
const companyRoutes = require('./routes/companies.routes');
const adminRoutes = require('./routes/admin.routes');

const app = express();

// Initialize DB schema on server start if not present
initializeDatabase();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static uploads directory
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}
app.use('/uploads', express.static(UPLOAD_DIR));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/internships', internshipRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/tests', testRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/admin', adminRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    system: 'Internship Management with Online Test for Selection',
    candidate: 'SREEHARI NIKATHIL (CCE25CS231)'
  });
});

// Serve frontend build if dist folder exists (production single-port mode)
const clientDist = path.join(__dirname, '../../client/dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

app.listen(PORT, () => {
  console.log(`================================================================`);
  console.log(`🚀 Placement & Internship Server running on http://localhost:${PORT}`);
  console.log(`📡 API Base: http://localhost:${PORT}/api`);
  console.log(`🎓 Candidate: SREEHARI NIKATHIL (Reg No: CCE25CS231)`);
  console.log(`================================================================`);
});

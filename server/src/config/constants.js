const path = require('path');
require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 5000,
  JWT_SECRET: process.env.JWT_SECRET || 'sep-placement-jwt-secret-key-2026',
  JWT_EXPIRES_IN: '7d',
  ROLES: {
    ADMIN: 'ADMIN',
    COMPANY: 'COMPANY',
    STUDENT: 'STUDENT'
  },
  UPLOAD_DIR: path.join(__dirname, '../../uploads')
};

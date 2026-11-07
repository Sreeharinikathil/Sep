const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db/database');
const { JWT_SECRET, JWT_EXPIRES_IN } = require('../config/constants');
const { authenticateToken } = require('../middleware/auth');

// Helper to generate token
function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, full_name: user.full_name },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

// Helper to fetch user with profile details
function getUserWithProfile(userId, role) {
  const user = db.get('SELECT id, email, role, full_name, is_verified, avatar_url, created_at FROM users WHERE id = ?', [userId]);
  if (!user) return null;

  if (role === 'STUDENT') {
    const profile = db.get('SELECT * FROM student_profiles WHERE user_id = ?', [userId]);
    return { ...user, profile: profile || {} };
  } else if (role === 'COMPANY') {
    const profile = db.get('SELECT * FROM company_profiles WHERE user_id = ?', [userId]);
    return { ...user, profile: profile || {} };
  } else {
    return { ...user, profile: { title: 'Placement Director / College Administrator' } };
  }
}

// 1. Register User
router.post('/register', (req, res) => {
  try {
    const { email, password, role, full_name, ...extraDetails } = req.body;

    if (!email || !password || !role || !full_name) {
      return res.status(400).json({ error: 'Please provide email, password, role, and full name.' });
    }

    if (!['ADMIN', 'COMPANY', 'STUDENT'].includes(role)) {
      return res.status(400).json({ error: 'Invalid user role selected.' });
    }

    // Check if user already exists
    const existing = db.get('SELECT id FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    if (existing) {
      return res.status(409).json({ error: 'An account with this email address already exists.' });
    }

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);

    // Auto-verify students and admin by default; companies start verified if admin registers or unverified if self-registered
    const isVerified = role === 'COMPANY' ? 0 : 1;

    let createdUser;
    db.transaction(() => {
      const result = db.run(
        `INSERT INTO users (email, password_hash, role, full_name, is_verified) VALUES (?, ?, ?, ?, ?)`,
        [email.toLowerCase().trim(), passwordHash, role, full_name.trim(), isVerified]
      );
      const userId = result.lastInsertRowid;

      if (role === 'STUDENT') {
        db.run(
          `INSERT INTO student_profiles (user_id, register_no, department, degree, cgpa, batch_year, phone, bio, skills)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            userId,
            extraDetails.register_no || `CCE25CS${Math.floor(100 + Math.random() * 900)}`,
            extraDetails.department || 'Computer Science and Engineering',
            extraDetails.degree || 'B.Tech',
            parseFloat(extraDetails.cgpa) || 7.5,
            parseInt(extraDetails.batch_year, 10) || 2025,
            extraDetails.phone || '',
            extraDetails.bio || '',
            extraDetails.skills || 'C++, Python, Web Development'
          ]
        );
      } else if (role === 'COMPANY') {
        db.run(
          `INSERT INTO company_profiles (user_id, company_name, website, industry, location, description, is_verified)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            userId,
            extraDetails.company_name || full_name,
            extraDetails.website || 'https://example.com',
            extraDetails.industry || 'Information Technology',
            extraDetails.location || 'Bangalore, India',
            extraDetails.description || 'Enterprise Technology Solutions',
            0 // Requires admin verification
          ]
        );
      }

      // Record activity
      db.run('INSERT INTO activity_logs (user_id, action, details) VALUES (?, ?, ?)', [
        userId,
        'REGISTER',
        `New ${role} registration for ${email}`
      ]);

      createdUser = getUserWithProfile(userId, role);
    });

    const token = generateToken(createdUser);
    res.status(201).json({
      message: 'Account registered successfully!',
      token,
      user: createdUser
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Server error during registration: ' + err.message });
  }
});

// 2. Login User
router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Please enter both email and password.' });
    }

    const user = db.get('SELECT * FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials. No user found with this email.' });
    }

    const isMatch = bcrypt.compareSync(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password combination.' });
    }

    const fullUser = getUserWithProfile(user.id, user.role);
    const token = generateToken(fullUser);

    db.run('INSERT INTO activity_logs (user_id, action, details) VALUES (?, ?, ?)', [
      user.id,
      'LOGIN',
      `User ${user.email} signed in successfully`
    ]);

    res.json({
      message: 'Signed in successfully!',
      token,
      user: fullUser
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error during authentication: ' + err.message });
  }
});

// 3. Get Current User Profile
router.get('/me', authenticateToken, (req, res) => {
  try {
    const fullUser = getUserWithProfile(req.user.id, req.user.role);
    if (!fullUser) {
      return res.status(404).json({ error: 'User profile not found.' });
    }

    const unreadNotifications = db.get(
      'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0',
      [req.user.id]
    );

    res.json({
      user: fullUser,
      unreadNotificationsCount: unreadNotifications ? unreadNotifications.count : 0
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user profile: ' + err.message });
  }
});

// 4. Instant Demo Role Switcher (Viva & Evaluation Accelerator)
router.post('/demo-login', (req, res) => {
  try {
    const { demoRole } = req.body; // 'admin', 'google', 'zerodha', 'sreehari'
    let targetEmail = 'sreehari@college.edu';

    switch (demoRole) {
      case 'admin':
        targetEmail = 'admin@college.edu';
        break;
      case 'google':
        targetEmail = 'recruitment@google.com';
        break;
      case 'zerodha':
        targetEmail = 'hiring@zerodha.com';
        break;
      case 'sreehari':
      default:
        targetEmail = 'sreehari@college.edu';
        break;
    }

    const user = db.get('SELECT * FROM users WHERE email = ?', [targetEmail]);
    if (!user) {
      return res.status(404).json({ error: 'Demo user not found. Please run seed script.' });
    }

    const fullUser = getUserWithProfile(user.id, user.role);
    const token = generateToken(fullUser);

    res.json({
      message: `Signed in as Demo ${fullUser.role}: ${fullUser.full_name}`,
      token,
      user: fullUser
    });
  } catch (err) {
    res.status(500).json({ error: 'Demo login error: ' + err.message });
  }
});

module.exports = router;

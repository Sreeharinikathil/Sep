const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { authenticateToken } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleCheck');
const upload = require('../middleware/upload');

// 1. Get student's own profile
router.get('/profile', authenticateToken, requireRole('STUDENT'), (req, res) => {
  try {
    const user = db.get('SELECT id, email, full_name, avatar_url, is_verified FROM users WHERE id = ?', [req.user.id]);
    const profile = db.get('SELECT * FROM student_profiles WHERE user_id = ?', [req.user.id]);

    res.json({
      user,
      profile: profile || {}
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch student profile: ' + err.message });
  }
});

// 2. Update student profile
router.put('/profile', authenticateToken, requireRole('STUDENT'), (req, res) => {
  try {
    const {
      full_name,
      register_no,
      college_name,
      department,
      degree,
      cgpa,
      batch_year,
      phone,
      bio,
      skills,
      github_url,
      linkedin_url,
      portfolio_url
    } = req.body;

    if (full_name) {
      db.run('UPDATE users SET full_name = ? WHERE id = ?', [full_name.trim(), req.user.id]);
    }

    db.run(`
      UPDATE student_profiles SET
        register_no = COALESCE(?, register_no),
        college_name = COALESCE(?, college_name),
        department = COALESCE(?, department),
        degree = COALESCE(?, degree),
        cgpa = CASE WHEN ? IS NOT NULL THEN ? ELSE cgpa END,
        batch_year = CASE WHEN ? IS NOT NULL THEN ? ELSE batch_year END,
        phone = COALESCE(?, phone),
        bio = COALESCE(?, bio),
        skills = COALESCE(?, skills),
        github_url = COALESCE(?, github_url),
        linkedin_url = COALESCE(?, linkedin_url),
        portfolio_url = COALESCE(?, portfolio_url)
      WHERE user_id = ?
    `, [
      register_no,
      college_name,
      department,
      degree,
      cgpa !== undefined ? parseFloat(cgpa) : null,
      cgpa !== undefined ? parseFloat(cgpa) : null,
      batch_year !== undefined ? parseInt(batch_year, 10) : null,
      batch_year !== undefined ? parseInt(batch_year, 10) : null,
      phone,
      bio,
      skills,
      github_url,
      linkedin_url,
      portfolio_url,
      req.user.id
    ]);

    res.json({ message: 'Profile updated successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update profile: ' + err.message });
  }
});

// 3. Upload student resume
router.post('/upload-resume', authenticateToken, requireRole('STUDENT'), upload.single('resume'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No resume file uploaded.' });
    }

    const resumeUrl = `/uploads/${req.file.filename}`;
    const originalName = req.file.originalname;

    db.run(`
      UPDATE student_profiles SET
        resume_url = ?,
        resume_filename = ?
      WHERE user_id = ?
    `, [resumeUrl, originalName, req.user.id]);

    res.json({
      message: 'Resume uploaded successfully!',
      resumeUrl,
      fileName: originalName
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to upload resume: ' + err.message });
  }
});

module.exports = router;

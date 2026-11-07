const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { authenticateToken } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleCheck');
const upload = require('../middleware/upload');

// 1. Get company's own profile
router.get('/profile', authenticateToken, requireRole('COMPANY', 'ADMIN'), (req, res) => {
  try {
    const companyId = req.user.role === 'ADMIN' && req.query.company_id ? req.query.company_id : req.user.id;
    const user = db.get('SELECT id, email, full_name, avatar_url, is_verified FROM users WHERE id = ?', [companyId]);
    const profile = db.get('SELECT * FROM company_profiles WHERE user_id = ?', [companyId]);

    res.json({
      user,
      profile: profile || {}
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch company profile: ' + err.message });
  }
});

// 2. Update company profile
router.put('/profile', authenticateToken, requireRole('COMPANY', 'ADMIN'), (req, res) => {
  try {
    const companyId = req.user.role === 'ADMIN' && req.body.company_id ? req.body.company_id : req.user.id;
    const {
      company_name,
      website,
      industry,
      location,
      hq_address,
      description,
      logo_url,
      hr_name,
      hr_phone
    } = req.body;

    if (company_name) {
      db.run('UPDATE users SET full_name = ? WHERE id = ?', [company_name.trim(), companyId]);
    }

    db.run(`
      UPDATE company_profiles SET
        company_name = COALESCE(?, company_name),
        website = COALESCE(?, website),
        industry = COALESCE(?, industry),
        location = COALESCE(?, location),
        hq_address = COALESCE(?, hq_address),
        description = COALESCE(?, description),
        logo_url = COALESCE(?, logo_url),
        hr_name = COALESCE(?, hr_name),
        hr_phone = COALESCE(?, hr_phone)
      WHERE user_id = ?
    `, [
      company_name,
      website,
      industry,
      location,
      hq_address,
      description,
      logo_url,
      hr_name,
      hr_phone,
      companyId
    ]);

    res.json({ message: 'Company profile updated successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update company profile: ' + err.message });
  }
});

// 3. Upload company logo
router.post('/upload-logo', authenticateToken, requireRole('COMPANY', 'ADMIN'), upload.single('logo'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No logo file provided.' });
    }

    const logoUrl = `/uploads/${req.file.filename}`;
    const companyId = req.user.role === 'ADMIN' && req.body.company_id ? req.body.company_id : req.user.id;

    db.run('UPDATE company_profiles SET logo_url = ? WHERE user_id = ?', [logoUrl, companyId]);

    res.json({
      message: 'Logo uploaded successfully!',
      logoUrl
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to upload logo: ' + err.message });
  }
});

// 4. Public list of verified hiring partners
router.get('/', (req, res) => {
  try {
    const companies = db.query(`
      SELECT 
        u.id,
        u.email,
        cp.company_name,
        cp.website,
        cp.industry,
        cp.location,
        cp.description,
        cp.logo_url,
        cp.is_verified,
        (SELECT COUNT(*) FROM internships WHERE company_id = u.id AND status = 'OPEN') as active_openings
      FROM users u
      JOIN company_profiles cp ON u.id = cp.user_id
      WHERE u.role = 'COMPANY'
      ORDER BY cp.is_verified DESC, cp.company_name ASC
    `);

    res.json({ companies });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch companies list: ' + err.message });
  }
});

module.exports = router;

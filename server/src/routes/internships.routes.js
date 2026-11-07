const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { authenticateToken } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleCheck');

// 1. Get all public open internships (with search and filters)
router.get('/', (req, res) => {
  try {
    const { search, department, location_type, min_stipend, branch } = req.query;

    let query = `
      SELECT 
        i.*,
        cp.company_name,
        cp.logo_url as company_logo,
        cp.website as company_website,
        cp.is_verified as company_verified,
        t.title as test_title,
        t.duration_minutes as test_duration,
        t.total_marks as test_marks,
        (SELECT COUNT(*) FROM applications WHERE internship_id = i.id) as applicants_count
      FROM internships i
      JOIN company_profiles cp ON i.company_id = cp.user_id
      LEFT JOIN tests t ON i.test_id = t.id
      WHERE i.status = 'OPEN'
    `;

    const params = [];

    if (search) {
      query += ` AND (i.title LIKE ? OR i.description LIKE ? OR cp.company_name LIKE ? OR i.required_skills LIKE ?)`;
      const term = `%${search}%`;
      params.push(term, term, term, term);
    }

    if (department && department !== 'ALL') {
      query += ` AND i.department = ?`;
      params.push(department);
    }

    if (location_type && location_type !== 'ALL') {
      query += ` AND i.location_type = ?`;
      params.push(location_type);
    }

    if (min_stipend) {
      query += ` AND i.stipend_amount >= ?`;
      params.push(Number(min_stipend));
    }

    query += ` ORDER BY i.created_at DESC`;

    const internships = db.query(query, params);
    res.json({ internships });
  } catch (err) {
    console.error('Error fetching internships:', err);
    res.status(500).json({ error: 'Failed to retrieve internships: ' + err.message });
  }
});

// 2. Get company's own postings (with analytics)
router.get('/company/my-postings', authenticateToken, requireRole('COMPANY', 'ADMIN'), (req, res) => {
  try {
    const companyId = req.user.role === 'ADMIN' && req.query.company_id ? req.query.company_id : req.user.id;

    const postings = db.query(`
      SELECT 
        i.*,
        t.title as test_title,
        t.duration_minutes as test_duration,
        (SELECT COUNT(*) FROM applications WHERE internship_id = i.id) as total_applicants,
        (SELECT COUNT(*) FROM applications WHERE internship_id = i.id AND status = 'SHORTLISTED') as shortlisted_count,
        (SELECT COUNT(*) FROM applications WHERE internship_id = i.id AND status = 'SELECTED') as selected_count,
        (SELECT COUNT(*) FROM applications WHERE internship_id = i.id AND status = 'TEST_COMPLETED') as test_completed_count
      FROM internships i
      LEFT JOIN tests t ON i.test_id = t.id
      WHERE i.company_id = ?
      ORDER BY i.created_at DESC
    `, [companyId]);

    res.json({ postings });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch company postings: ' + err.message });
  }
});

// 3. Get single internship details by ID
router.get('/:id', (req, res) => {
  try {
    const internship = db.get(`
      SELECT 
        i.*,
        cp.company_name,
        cp.logo_url as company_logo,
        cp.website as company_website,
        cp.description as company_bio,
        cp.location as company_location,
        cp.is_verified as company_verified,
        t.title as test_title,
        t.duration_minutes as test_duration,
        t.total_marks as test_marks,
        t.passing_percentage as test_passing_percentage,
        t.proctoring_enabled as test_proctoring,
        (SELECT COUNT(*) FROM applications WHERE internship_id = i.id) as applicants_count
      FROM internships i
      JOIN company_profiles cp ON i.company_id = cp.user_id
      LEFT JOIN tests t ON i.test_id = t.id
      WHERE i.id = ?
    `, [req.params.id]);

    if (!internship) {
      return res.status(404).json({ error: 'Internship posting not found.' });
    }

    res.json({ internship });
  } catch (err) {
    res.status(500).json({ error: 'Error fetching internship details: ' + err.message });
  }
});

// 4. Create new internship posting (Company or Admin)
router.post('/', authenticateToken, requireRole('COMPANY', 'ADMIN'), (req, res) => {
  try {
    const {
      title,
      department,
      employment_type,
      location_type,
      location_city,
      stipend_amount,
      stipend_type,
      duration_months,
      description,
      responsibilities,
      requirements,
      required_skills,
      min_cgpa,
      allowed_branches,
      target_batches,
      openings_count,
      deadline,
      test_id
    } = req.body;

    if (!title || !department || !description) {
      return res.status(400).json({ error: 'Please provide Title, Department, and Description.' });
    }

    const companyId = req.user.role === 'ADMIN' && req.body.company_id ? req.body.company_id : req.user.id;

    const result = db.run(`
      INSERT INTO internships (
        company_id, title, department, employment_type, location_type, location_city,
        stipend_amount, stipend_type, duration_months, description, responsibilities,
        requirements, required_skills, min_cgpa, allowed_branches, target_batches,
        openings_count, deadline, status, test_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'OPEN', ?)
    `, [
      companyId,
      title.trim(),
      department.trim(),
      employment_type || 'Full-time Internship',
      location_type || 'REMOTE',
      location_city || 'Remote',
      Number(stipend_amount) || 0,
      stipend_type || 'Monthly',
      Number(duration_months) || 3,
      description.trim(),
      responsibilities || '',
      requirements || '',
      required_skills || '',
      parseFloat(min_cgpa) || 0.0,
      allowed_branches || 'CSE, IT, ECE, EEE',
      target_batches || '2025, 2026',
      parseInt(openings_count, 10) || 1,
      deadline || null,
      test_id ? parseInt(test_id, 10) : null
    ]);

    db.run('INSERT INTO activity_logs (user_id, action, details) VALUES (?, ?, ?)', [
      req.user.id,
      'CREATE_INTERNSHIP',
      `Posted new internship: ${title}`
    ]);

    res.status(201).json({
      message: 'Internship posting published successfully!',
      internshipId: result.lastInsertRowid
    });
  } catch (err) {
    console.error('Create internship error:', err);
    res.status(500).json({ error: 'Failed to create internship posting: ' + err.message });
  }
});

// 5. Update internship posting
router.put('/:id', authenticateToken, requireRole('COMPANY', 'ADMIN'), (req, res) => {
  try {
    const internship = db.get('SELECT * FROM internships WHERE id = ?', [req.params.id]);
    if (!internship) {
      return res.status(404).json({ error: 'Internship not found.' });
    }

    if (req.user.role !== 'ADMIN' && internship.company_id !== req.user.id) {
      return res.status(403).json({ error: 'You are not authorized to edit this internship posting.' });
    }

    const {
      title,
      department,
      employment_type,
      location_type,
      location_city,
      stipend_amount,
      stipend_type,
      duration_months,
      description,
      responsibilities,
      requirements,
      required_skills,
      min_cgpa,
      allowed_branches,
      target_batches,
      openings_count,
      deadline,
      status,
      test_id
    } = req.body;

    db.run(`
      UPDATE internships SET
        title = ?,
        department = ?,
        employment_type = ?,
        location_type = ?,
        location_city = ?,
        stipend_amount = ?,
        stipend_type = ?,
        duration_months = ?,
        description = ?,
        responsibilities = ?,
        requirements = ?,
        required_skills = ?,
        min_cgpa = ?,
        allowed_branches = ?,
        target_batches = ?,
        openings_count = ?,
        deadline = ?,
        status = ?,
        test_id = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [
      title || internship.title,
      department || internship.department,
      employment_type || internship.employment_type,
      location_type || internship.location_type,
      location_city || internship.location_city,
      stipend_amount !== undefined ? Number(stipend_amount) : internship.stipend_amount,
      stipend_type || internship.stipend_type,
      duration_months !== undefined ? Number(duration_months) : internship.duration_months,
      description || internship.description,
      responsibilities !== undefined ? responsibilities : internship.responsibilities,
      requirements !== undefined ? requirements : internship.requirements,
      required_skills !== undefined ? required_skills : internship.required_skills,
      min_cgpa !== undefined ? parseFloat(min_cgpa) : internship.min_cgpa,
      allowed_branches !== undefined ? allowed_branches : internship.allowed_branches,
      target_batches !== undefined ? target_batches : internship.target_batches,
      openings_count !== undefined ? parseInt(openings_count, 10) : internship.openings_count,
      deadline !== undefined ? deadline : internship.deadline,
      status || internship.status,
      test_id !== undefined ? (test_id ? parseInt(test_id, 10) : null) : internship.test_id,
      req.params.id
    ]);

    res.json({ message: 'Internship posting updated successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update internship: ' + err.message });
  }
});

// 6. Delete or Close internship posting
router.delete('/:id', authenticateToken, requireRole('COMPANY', 'ADMIN'), (req, res) => {
  try {
    const internship = db.get('SELECT * FROM internships WHERE id = ?', [req.params.id]);
    if (!internship) {
      return res.status(404).json({ error: 'Internship not found.' });
    }

    if (req.user.role !== 'ADMIN' && internship.company_id !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized to delete this posting.' });
    }

    db.run('DELETE FROM internships WHERE id = ?', [req.params.id]);
    res.json({ message: 'Internship posting deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete internship: ' + err.message });
  }
});

module.exports = router;

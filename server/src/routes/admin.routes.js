const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { authenticateToken } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleCheck');

// 1. Overview Placement Statistics
router.get('/stats', authenticateToken, requireRole('ADMIN'), (req, res) => {
  try {
    const totalStudents = db.get("SELECT COUNT(*) as count FROM users WHERE role = 'STUDENT'");
    const totalCompanies = db.get("SELECT COUNT(*) as count FROM users WHERE role = 'COMPANY'");
    const totalInternships = db.get('SELECT COUNT(*) as count FROM internships');
    const activeInternships = db.get("SELECT COUNT(*) as count FROM internships WHERE status = 'OPEN'");
    const totalApplications = db.get('SELECT COUNT(*) as count FROM applications');
    const selectedStudents = db.get("SELECT COUNT(DISTINCT student_id) as count FROM applications WHERE status = 'SELECTED'");
    const testsConducted = db.get('SELECT COUNT(*) as count FROM test_attempts WHERE status = "COMPLETED"');
    const passedTests = db.get('SELECT COUNT(*) as count FROM test_attempts WHERE passed = 1');

    const totalStudCount = totalStudents ? totalStudents.count : 0;
    const selectedCount = selectedStudents ? selectedStudents.count : 0;
    const placementRate = totalStudCount > 0 ? Number(((selectedCount / totalStudCount) * 100).toFixed(1)) : 0;

    // Applications by Department
    const departmentBreakdown = db.query(`
      SELECT sp.department, COUNT(a.id) as applications_count,
             COUNT(CASE WHEN a.status = 'SELECTED' THEN 1 END) as selections_count
      FROM student_profiles sp
      LEFT JOIN applications a ON sp.user_id = a.student_id
      GROUP BY sp.department
    `);

    // Top Recruiting Companies
    const topCompanies = db.query(`
      SELECT cp.company_name, cp.logo_url, COUNT(a.id) as applications_count,
             COUNT(CASE WHEN a.status = 'SELECTED' THEN 1 END) as hires_count
      FROM company_profiles cp
      LEFT JOIN internships i ON cp.user_id = i.company_id
      LEFT JOIN applications a ON i.id = a.internship_id
      GROUP BY cp.user_id
      ORDER BY applications_count DESC
      LIMIT 5
    `);

    res.json({
      metrics: {
        totalStudents: totalStudCount,
        totalCompanies: totalCompanies ? totalCompanies.count : 0,
        totalInternships: totalInternships ? totalInternships.count : 0,
        activeInternships: activeInternships ? activeInternships.count : 0,
        totalApplications: totalApplications ? totalApplications.count : 0,
        selectedStudents: selectedCount,
        placementRate,
        testsConducted: testsConducted ? testsConducted.count : 0,
        passedTests: passedTests ? passedTests.count : 0
      },
      departmentBreakdown,
      topCompanies
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to compute admin statistics: ' + err.message });
  }
});

// 2. Manage Companies (List & Verification Toggle)
router.get('/companies', authenticateToken, requireRole('ADMIN'), (req, res) => {
  try {
    const companies = db.query(`
      SELECT 
        u.id,
        u.email,
        u.is_verified as user_verified,
        u.created_at,
        cp.company_name,
        cp.website,
        cp.industry,
        cp.location,
        cp.is_verified,
        cp.hr_name,
        cp.hr_phone,
        (SELECT COUNT(*) FROM internships WHERE company_id = u.id) as postings_count,
        (SELECT COUNT(*) FROM applications a JOIN internships i ON a.internship_id = i.id WHERE i.company_id = u.id) as total_applicants
      FROM users u
      JOIN company_profiles cp ON u.id = cp.user_id
      ORDER BY u.created_at DESC
    `);

    res.json({ companies });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch companies: ' + err.message });
  }
});

router.patch('/companies/:id/verify', authenticateToken, requireRole('ADMIN'), (req, res) => {
  try {
    const { is_verified } = req.body;
    const companyId = req.params.id;

    db.run('UPDATE company_profiles SET is_verified = ? WHERE user_id = ?', [is_verified ? 1 : 0, companyId]);
    db.run('UPDATE users SET is_verified = ? WHERE id = ?', [is_verified ? 1 : 0, companyId]);

    db.run('INSERT INTO activity_logs (user_id, action, details) VALUES (?, ?, ?)', [
      req.user.id,
      'COMPANY_VERIFICATION',
      `${is_verified ? 'Approved & verified' : 'Revoked verification for'} company ID: ${companyId}`
    ]);

    res.json({ message: `Company verification status set to ${is_verified ? 'Verified' : 'Unverified'}.` });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update company verification: ' + err.message });
  }
});

// 3. List All Students for Placement Audit
router.get('/students', authenticateToken, requireRole('ADMIN'), (req, res) => {
  try {
    const students = db.query(`
      SELECT 
        u.id,
        u.email,
        u.full_name,
        u.is_verified,
        u.created_at,
        sp.register_no,
        sp.department,
        sp.degree,
        sp.cgpa,
        sp.batch_year,
        sp.phone,
        sp.skills,
        sp.resume_url,
        (SELECT COUNT(*) FROM applications WHERE student_id = u.id) as applications_count,
        (SELECT COUNT(*) FROM applications WHERE student_id = u.id AND status = 'SELECTED') as selections_count,
        (SELECT COUNT(*) FROM test_attempts WHERE student_id = u.id AND status = 'COMPLETED') as tests_taken
      FROM users u
      JOIN student_profiles sp ON u.id = sp.user_id
      ORDER BY sp.cgpa DESC
    `);

    res.json({ students });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch students: ' + err.message });
  }
});

// 4. Audit & Activity Logs
router.get('/activity-logs', authenticateToken, requireRole('ADMIN'), (req, res) => {
  try {
    const logs = db.query(`
      SELECT 
        l.*,
        u.full_name as user_name,
        u.role as user_role,
        u.email as user_email
      FROM activity_logs l
      LEFT JOIN users u ON l.user_id = u.id
      ORDER BY l.created_at DESC
      LIMIT 50
    `);

    res.json({ logs });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch logs: ' + err.message });
  }
});

module.exports = router;

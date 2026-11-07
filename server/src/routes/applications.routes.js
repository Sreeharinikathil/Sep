const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { authenticateToken } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleCheck');

// 1. Student applies to an internship
router.post('/', authenticateToken, requireRole('STUDENT'), (req, res) => {
  try {
    const { internship_id } = req.body;

    if (!internship_id) {
      return res.status(400).json({ error: 'Internship ID is required.' });
    }

    // Check internship status
    const internship = db.get(`
      SELECT i.*, cp.company_name 
      FROM internships i 
      JOIN company_profiles cp ON i.company_id = cp.user_id 
      WHERE i.id = ?
    `, [internship_id]);

    if (!internship) {
      return res.status(404).json({ error: 'Internship posting not found.' });
    }

    if (internship.status !== 'OPEN') {
      return res.status(400).json({ error: 'Applications for this internship are currently closed.' });
    }

    // Check student profile completeness & eligibility
    const student = db.get('SELECT * FROM student_profiles WHERE user_id = ?', [req.user.id]);
    if (!student) {
      return res.status(400).json({ error: 'Please set up your student profile before applying.' });
    }

    // CGPA verification
    if (internship.min_cgpa && student.cgpa < internship.min_cgpa) {
      return res.status(400).json({
        error: `Eligibility criteria not met: Required minimum CGPA is ${internship.min_cgpa}, but your recorded CGPA is ${student.cgpa}.`
      });
    }

    // Check for duplicate application
    const existingApp = db.get(
      'SELECT id, status FROM applications WHERE internship_id = ? AND student_id = ?',
      [internship_id, req.user.id]
    );

    if (existingApp) {
      return res.status(409).json({
        error: `You have already applied for this position (Current status: ${existingApp.status}).`
      });
    }

    // If internship has a required test, set initial status to TEST_INVITED so student can take test immediately
    const initialStatus = internship.test_id ? 'TEST_INVITED' : 'APPLIED';

    const result = db.run(`
      INSERT INTO applications (internship_id, student_id, status, remarks)
      VALUES (?, ?, ?, ?)
    `, [
      internship_id,
      req.user.id,
      initialStatus,
      internship.test_id ? 'Online test requirement assigned.' : 'Application submitted.'
    ]);

    // Send in-app notification to student
    db.run(`
      INSERT INTO notifications (user_id, title, message, link)
      VALUES (?, ?, ?, ?)
    `, [
      req.user.id,
      `Application Received: ${internship.title}`,
      internship.test_id 
        ? `You have applied to ${internship.company_name}. Please complete the required online assessment to proceed.` 
        : `Your application to ${internship.company_name} was received successfully.`,
      '/student/applications'
    ]);

    // Notify company
    db.run(`
      INSERT INTO notifications (user_id, title, message, link)
      VALUES (?, ?, ?, ?)
    `, [
      internship.company_id,
      `New Applicant for ${internship.title}`,
      `${req.user.full_name} (${student.register_no || 'Student'}) applied for ${internship.title}.`,
      `/company/applicants?internship=${internship.id}`
    ]);

    res.status(201).json({
      message: 'Application submitted successfully!',
      applicationId: result.lastInsertRowid,
      status: initialStatus
    });
  } catch (err) {
    console.error('Application error:', err);
    res.status(500).json({ error: 'Failed to submit application: ' + err.message });
  }
});

// 2. Student gets their own applications with timeline & test attempts
router.get('/my-applications', authenticateToken, requireRole('STUDENT'), (req, res) => {
  try {
    const applications = db.query(`
      SELECT 
        a.id as application_id,
        a.status as application_status,
        a.applied_at,
        a.score,
        a.remarks,
        a.feedback,
        i.id as internship_id,
        i.title as internship_title,
        i.department,
        i.stipend_amount,
        i.stipend_type,
        i.location_type,
        i.location_city,
        i.deadline,
        i.test_id,
        cp.company_name,
        cp.logo_url as company_logo,
        cp.website as company_website,
        t.title as test_title,
        t.duration_minutes as test_duration,
        t.total_marks as test_max_score,
        t.passing_percentage as test_passing_percentage,
        ta.id as test_attempt_id,
        ta.status as test_attempt_status,
        ta.total_score as test_score,
        ta.percentage as test_percentage,
        ta.passed as test_passed,
        ta.submitted_at as test_submitted_at
      FROM applications a
      JOIN internships i ON a.internship_id = i.id
      JOIN company_profiles cp ON i.company_id = cp.user_id
      LEFT JOIN tests t ON i.test_id = t.id
      LEFT JOIN test_attempts ta ON a.test_attempt_id = ta.id
      WHERE a.student_id = ?
      ORDER BY a.applied_at DESC
    `, [req.user.id]);

    res.json({ applications });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve applications: ' + err.message });
  }
});

// 3. Company or Admin gets applicants for an internship
router.get('/internship/:internshipId', authenticateToken, requireRole('COMPANY', 'ADMIN'), (req, res) => {
  try {
    const internship = db.get('SELECT * FROM internships WHERE id = ?', [req.params.internshipId]);
    if (!internship) {
      return res.status(404).json({ error: 'Internship not found.' });
    }

    if (req.user.role !== 'ADMIN' && internship.company_id !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized to view applicants for this posting.' });
    }

    const applicants = db.query(`
      SELECT 
        a.id as application_id,
        a.status,
        a.applied_at,
        a.score,
        a.remarks,
        a.feedback,
        u.id as student_id,
        u.full_name as student_name,
        u.email as student_email,
        sp.register_no,
        sp.department,
        sp.degree,
        sp.cgpa,
        sp.batch_year,
        sp.phone,
        sp.skills,
        sp.resume_url,
        sp.github_url,
        sp.linkedin_url,
        ta.id as test_attempt_id,
        ta.status as test_status,
        ta.total_score as test_score,
        ta.max_score as test_max_score,
        ta.percentage as test_percentage,
        ta.passed as test_passed,
        ta.tab_switch_count,
        ta.submitted_at as test_submitted_at
      FROM applications a
      JOIN users u ON a.student_id = u.id
      JOIN student_profiles sp ON u.id = sp.user_id
      LEFT JOIN test_attempts ta ON a.test_attempt_id = ta.id
      WHERE a.internship_id = ?
      ORDER BY a.applied_at DESC
    `, [req.params.internshipId]);

    res.json({
      internshipTitle: internship.title,
      totalApplicants: applicants.length,
      applicants
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch applicants: ' + err.message });
  }
});

// 4. Update applicant status (Shortlist, Test Invite, Select, Reject)
router.patch('/:id/status', authenticateToken, requireRole('COMPANY', 'ADMIN'), (req, res) => {
  try {
    const { status, remarks, feedback } = req.body;

    const validStatuses = [
      'APPLIED',
      'SHORTLISTED',
      'TEST_INVITED',
      'TEST_IN_PROGRESS',
      'TEST_COMPLETED',
      'UNDER_REVIEW',
      'SELECTED',
      'REJECTED'
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid application status requested.' });
    }

    const application = db.get(`
      SELECT a.*, i.title as internship_title, i.company_id, cp.company_name
      FROM applications a
      JOIN internships i ON a.internship_id = i.id
      JOIN company_profiles cp ON i.company_id = cp.user_id
      WHERE a.id = ?
    `, [req.params.id]);

    if (!application) {
      return res.status(404).json({ error: 'Application record not found.' });
    }

    if (req.user.role !== 'ADMIN' && application.company_id !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized to modify this application.' });
    }

    db.run(`
      UPDATE applications SET 
        status = ?,
        remarks = COALESCE(?, remarks),
        feedback = COALESCE(?, feedback),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [status, remarks, feedback, req.params.id]);

    // Send meaningful notification based on status
    let notifTitle = `Application Status Update: ${application.internship_title}`;
    let notifMsg = `Your application status has been updated to ${status}.`;

    if (status === 'SELECTED') {
      notifTitle = `🎉 Congratulations! Selected for ${application.internship_title}`;
      notifMsg = `Great news! ${application.company_name} has selected you for the internship position.`;
    } else if (status === 'SHORTLISTED') {
      notifTitle = `⭐ Shortlisted: ${application.internship_title}`;
      notifMsg = `You have been shortlisted by ${application.company_name} for the next selection round.`;
    } else if (status === 'TEST_INVITED') {
      notifTitle = `📝 Online Test Assigned: ${application.internship_title}`;
      notifMsg = `${application.company_name} has invited you to take the online assessment. Please complete it soon.`;
    }

    db.run(`
      INSERT INTO notifications (user_id, title, message, link)
      VALUES (?, ?, ?, ?)
    `, [application.student_id, notifTitle, notifMsg, '/student/applications']);

    res.json({ message: `Applicant status successfully changed to ${status}.` });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update application status: ' + err.message });
  }
});

module.exports = router;

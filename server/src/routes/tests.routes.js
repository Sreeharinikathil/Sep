const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { authenticateToken } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleCheck');

// 1. Get tests list (Company/Admin: created tests; Student: available tests)
router.get('/', authenticateToken, (req, res) => {
  try {
    let sql = `
      SELECT 
        t.*,
        cp.company_name,
        cp.logo_url as company_logo,
        (SELECT COUNT(*) FROM test_attempts WHERE test_id = t.id) as attempts_count,
        (SELECT COUNT(*) FROM test_attempts WHERE test_id = t.id AND passed = 1) as passed_count,
        (SELECT AVG(total_score) FROM test_attempts WHERE test_id = t.id AND status = 'COMPLETED') as average_score
      FROM tests t
      JOIN company_profiles cp ON t.company_id = cp.user_id
    `;
    const params = [];

    if (req.user.role === 'COMPANY') {
      sql += ' WHERE t.company_id = ?';
      params.push(req.user.id);
    }

    sql += ' ORDER BY t.created_at DESC';

    const tests = db.query(sql, params).map(t => {
      const qIds = t.questions_json ? JSON.parse(t.questions_json) : [];
      return {
        ...t,
        question_count: qIds.length,
        average_score: t.average_score ? Number(Number(t.average_score).toFixed(1)) : 0
      };
    });

    res.json({ tests });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch tests: ' + err.message });
  }
});

// 2. Get single test metadata & questions list (For test managers)
router.get('/:id', authenticateToken, (req, res) => {
  try {
    const test = db.get(`
      SELECT t.*, cp.company_name 
      FROM tests t
      JOIN company_profiles cp ON t.company_id = cp.user_id
      WHERE t.id = ?
    `, [req.params.id]);

    if (!test) {
      return res.status(404).json({ error: 'Test not found.' });
    }

    const questionIds = test.questions_json ? JSON.parse(test.questions_json) : [];
    let questions = [];

    if (questionIds.length > 0) {
      const placeholders = questionIds.map(() => '?').join(',');
      const rawQuestions = db.query(`SELECT * FROM questions WHERE id IN (${placeholders})`, questionIds);
      questions = rawQuestions.map(q => ({
        ...q,
        options: q.options_json ? JSON.parse(q.options_json) : [],
        correct_answers: req.user.role === 'STUDENT' ? undefined : (q.correct_answers_json ? JSON.parse(q.correct_answers_json) : [])
      }));
    }

    res.json({
      test: {
        ...test,
        questions,
        question_count: questions.length
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load test details: ' + err.message });
  }
});

// 3. Create a new test (Company or Admin)
// Supports manual question selection OR smart template auto-assembly from Question Bank!
router.post('/', authenticateToken, requireRole('COMPANY', 'ADMIN'), (req, res) => {
  try {
    const {
      title,
      description,
      category,
      duration_minutes,
      passing_percentage,
      allow_randomization,
      proctoring_enabled,
      strict_mode,
      max_tab_switches,
      question_ids,
      auto_assemble // Optional { categories: [...], count_per_cat: 5 }
    } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Test title is required.' });
    }

    let finalQuestionIds = Array.isArray(question_ids) ? [...question_ids] : [];

    // Auto-assembly logic if requested
    if (auto_assemble && (!finalQuestionIds || finalQuestionIds.length === 0)) {
      const requestedCategories = auto_assemble.categories || ['Data Structures & Algorithms', 'Web Technologies'];
      const limitPerCat = auto_assemble.limitPerCategory || 5;

      for (const cat of requestedCategories) {
        const rows = db.query('SELECT id FROM questions WHERE category = ? ORDER BY RANDOM() LIMIT ?', [cat, limitPerCat]);
        rows.forEach(r => finalQuestionIds.push(r.id));
      }
    }

    if (finalQuestionIds.length === 0) {
      return res.status(400).json({ error: 'A test must contain at least one question. Select questions from the Question Bank.' });
    }

    // Compute total marks from selected questions
    const placeholders = finalQuestionIds.map(() => '?').join(',');
    const qRows = db.query(`SELECT marks FROM questions WHERE id IN (${placeholders})`, finalQuestionIds);
    const totalMarks = qRows.reduce((acc, row) => acc + (row.marks || 1), 0);

    const companyId = req.user.role === 'ADMIN' && req.body.company_id ? req.body.company_id : req.user.id;

    const result = db.run(`
      INSERT INTO tests (
        company_id, title, description, category, duration_minutes, total_marks,
        passing_percentage, allow_randomization, proctoring_enabled, strict_mode,
        max_tab_switches, questions_json, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
    `, [
      companyId,
      title.trim(),
      description || '',
      category || 'Technical Screening',
      parseInt(duration_minutes, 10) || 30,
      totalMarks,
      parseFloat(passing_percentage) || 60.0,
      allow_randomization !== undefined ? (allow_randomization ? 1 : 0) : 1,
      proctoring_enabled !== undefined ? (proctoring_enabled ? 1 : 0) : 1,
      strict_mode !== undefined ? (strict_mode ? 1 : 0) : 1,
      parseInt(max_tab_switches, 10) || 3,
      JSON.stringify(finalQuestionIds)
    ]);

    res.status(201).json({
      message: 'Online test created successfully!',
      testId: result.lastInsertRowid,
      totalMarks,
      questionCount: finalQuestionIds.length
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create test: ' + err.message });
  }
});

// 4. Update test parameters
router.put('/:id', authenticateToken, requireRole('COMPANY', 'ADMIN'), (req, res) => {
  try {
    const test = db.get('SELECT * FROM tests WHERE id = ?', [req.params.id]);
    if (!test) {
      return res.status(404).json({ error: 'Test not found.' });
    }

    if (req.user.role !== 'ADMIN' && test.company_id !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized to modify this test.' });
    }

    const {
      title,
      description,
      category,
      duration_minutes,
      passing_percentage,
      allow_randomization,
      proctoring_enabled,
      strict_mode,
      max_tab_switches,
      question_ids
    } = req.body;

    let totalMarks = test.total_marks;
    let questionsJson = test.questions_json;

    if (Array.isArray(question_ids) && question_ids.length > 0) {
      questionsJson = JSON.stringify(question_ids);
      const placeholders = question_ids.map(() => '?').join(',');
      const qRows = db.query(`SELECT marks FROM questions WHERE id IN (${placeholders})`, question_ids);
      totalMarks = qRows.reduce((acc, row) => acc + (row.marks || 1), 0);
    }

    db.run(`
      UPDATE tests SET
        title = COALESCE(?, title),
        description = COALESCE(?, description),
        category = COALESCE(?, category),
        duration_minutes = COALESCE(?, duration_minutes),
        total_marks = ?,
        passing_percentage = COALESCE(?, passing_percentage),
        allow_randomization = CASE WHEN ? IS NOT NULL THEN ? ELSE allow_randomization END,
        proctoring_enabled = CASE WHEN ? IS NOT NULL THEN ? ELSE proctoring_enabled END,
        strict_mode = CASE WHEN ? IS NOT NULL THEN ? ELSE strict_mode END,
        max_tab_switches = COALESCE(?, max_tab_switches),
        questions_json = ?
      WHERE id = ?
    `, [
      title,
      description,
      category,
      duration_minutes ? parseInt(duration_minutes, 10) : null,
      totalMarks,
      passing_percentage ? parseFloat(passing_percentage) : null,
      allow_randomization !== undefined ? (allow_randomization ? 1 : 0) : null,
      allow_randomization !== undefined ? (allow_randomization ? 1 : 0) : null,
      proctoring_enabled !== undefined ? (proctoring_enabled ? 1 : 0) : null,
      proctoring_enabled !== undefined ? (proctoring_enabled ? 1 : 0) : null,
      strict_mode !== undefined ? (strict_mode ? 1 : 0) : null,
      strict_mode !== undefined ? (strict_mode ? 1 : 0) : null,
      max_tab_switches ? parseInt(max_tab_switches, 10) : null,
      questionsJson,
      req.params.id
    ]);

    res.json({ message: 'Test updated successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update test: ' + err.message });
  }
});

// 5. Delete test
router.delete('/:id', authenticateToken, requireRole('COMPANY', 'ADMIN'), (req, res) => {
  try {
    const test = db.get('SELECT * FROM tests WHERE id = ?', [req.params.id]);
    if (!test) {
      return res.status(404).json({ error: 'Test not found.' });
    }

    if (req.user.role !== 'ADMIN' && test.company_id !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized to delete this test.' });
    }

    db.run('DELETE FROM tests WHERE id = ?', [req.params.id]);
    res.json({ message: 'Test deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete test: ' + err.message });
  }
});

// =========================================================================
// ONLINE TEST ENGINE (PROCTORED CANDIDATE PORTAL)
// =========================================================================

// 6. Student starts or resumes a test session
router.get('/:id/take', authenticateToken, requireRole('STUDENT'), (req, res) => {
  try {
    const test = db.get(`
      SELECT t.*, cp.company_name, cp.logo_url as company_logo
      FROM tests t
      JOIN company_profiles cp ON t.company_id = cp.user_id
      WHERE t.id = ? AND t.is_active = 1
    `, [req.params.id]);

    if (!test) {
      return res.status(404).json({ error: 'Test not found or is currently inactive.' });
    }

    // Check for linked application
    const application = db.get(`
      SELECT a.*, i.title as internship_title
      FROM applications a
      JOIN internships i ON a.internship_id = i.id
      WHERE i.test_id = ? AND a.student_id = ?
    `, [test.id, req.user.id]);

    // Check if test was already completed
    let attempt = db.get(`
      SELECT * FROM test_attempts 
      WHERE test_id = ? AND student_id = ?
      ORDER BY id DESC LIMIT 1
    `, [test.id, req.user.id]);

    if (attempt && attempt.status === 'COMPLETED') {
      return res.status(400).json({
        error: 'You have already completed this test.',
        attemptId: attempt.id,
        isCompleted: true
      });
    }

    if (attempt && attempt.status === 'DISQUALIFIED') {
      return res.status(403).json({
        error: 'You were disqualified from this test due to excessive proctoring violations.',
        attemptId: attempt.id,
        isDisqualified: true
      });
    }

    // Create new attempt if none exists or status was not in-progress
    if (!attempt) {
      const newAttemptRes = db.run(`
        INSERT INTO test_attempts (test_id, student_id, application_id, status, answers_json, proctoring_logs_json)
        VALUES (?, ?, ?, 'IN_PROGRESS', '{}', '[]')
      `, [test.id, req.user.id, application ? application.id : null]);

      attempt = db.get('SELECT * FROM test_attempts WHERE id = ?', [newAttemptRes.lastInsertRowid]);

      // If application exists, link attempt
      if (application) {
        db.run('UPDATE applications SET test_attempt_id = ?, status = "TEST_IN_PROGRESS" WHERE id = ?', [
          attempt.id,
          application.id
        ]);
      }
    }

    // Load questions WITHOUT answer keys to prevent client-side inspection
    const questionIds = JSON.parse(test.questions_json || '[]');
    const placeholders = questionIds.map(() => '?').join(',');
    const rawQuestions = db.query(`SELECT id, category, difficulty, question_text, question_type, options_json, marks, negative_marks FROM questions WHERE id IN (${placeholders})`, questionIds);

    let cleanQuestions = rawQuestions.map(q => ({
      id: q.id,
      category: q.category,
      difficulty: q.difficulty,
      question_text: q.question_text,
      question_type: q.question_type,
      options: q.options_json ? JSON.parse(q.options_json) : [],
      marks: q.marks,
      negative_marks: q.negative_marks
    }));

    // Randomize question sequence if enabled
    if (test.allow_randomization) {
      cleanQuestions.sort(() => Math.random() - 0.5);
    }

    // Calculate elapsed time
    const startTime = new Date(attempt.start_time).getTime();
    const durationMs = test.duration_minutes * 60 * 1000;
    const now = Date.now();
    const elapsedSeconds = Math.floor((now - startTime) / 1000);
    const remainingSeconds = Math.max(0, (test.duration_minutes * 60) - elapsedSeconds);

    res.json({
      attemptId: attempt.id,
      test: {
        id: test.id,
        title: test.title,
        description: test.description,
        company_name: test.company_name,
        company_logo: test.company_logo,
        category: test.category,
        duration_minutes: test.duration_minutes,
        total_marks: test.total_marks,
        proctoring_enabled: Boolean(test.proctoring_enabled),
        strict_mode: Boolean(test.strict_mode),
        max_tab_switches: test.max_tab_switches,
        total_questions: cleanQuestions.length
      },
      questions: cleanQuestions,
      savedAnswers: attempt.answers_json ? JSON.parse(attempt.answers_json) : {},
      tabSwitchCount: attempt.tab_switch_count || 0,
      remainingSeconds,
      applicationId: application ? application.id : null
    });
  } catch (err) {
    console.error('Error starting test:', err);
    res.status(500).json({ error: 'Failed to initialize test session: ' + err.message });
  }
});

// 7. Proctoring Violation Logger (Tab Switch, Fullscreen Exit, Window Blur)
router.post('/:id/proctoring-violation', authenticateToken, requireRole('STUDENT'), (req, res) => {
  try {
    const { attemptId, violationType, details } = req.body;

    const attempt = db.get('SELECT * FROM test_attempts WHERE id = ? AND student_id = ?', [attemptId, req.user.id]);
    if (!attempt || attempt.status !== 'IN_PROGRESS') {
      return res.status(400).json({ error: 'Active test attempt not found.' });
    }

    const test = db.get('SELECT * FROM tests WHERE id = ?', [attempt.test_id]);
    const maxSwitches = test ? test.max_tab_switches : 3;

    const newSwitchCount = (attempt.tab_switch_count || 0) + 1;
    const logs = attempt.proctoring_logs_json ? JSON.parse(attempt.proctoring_logs_json) : [];
    logs.push({
      type: violationType || 'TAB_SWITCH',
      timestamp: new Date().toISOString(),
      details: details || 'Candidate left test viewport or exited fullscreen'
    });

    let disqualified = false;
    let newStatus = 'IN_PROGRESS';

    if (test.strict_mode && newSwitchCount >= maxSwitches) {
      disqualified = true;
      newStatus = 'DISQUALIFIED';
    }

    db.run(`
      UPDATE test_attempts SET
        tab_switch_count = ?,
        proctoring_logs_json = ?,
        status = ?,
        submitted_at = CASE WHEN ? THEN CURRENT_TIMESTAMP ELSE submitted_at END
      WHERE id = ?
    `, [
      newSwitchCount,
      JSON.stringify(logs),
      newStatus,
      disqualified ? 1 : 0,
      attemptId
    ]);

    if (disqualified && attempt.application_id) {
      db.run('UPDATE applications SET status = "REJECTED", remarks = "Disqualified for multiple proctoring violations during online test." WHERE id = ?', [
        attempt.application_id
      ]);
    }

    res.json({
      tabSwitchCount: newSwitchCount,
      maxAllowed: maxSwitches,
      disqualified,
      message: disqualified
        ? 'Maximum tab switches exceeded. You have been disqualified.'
        : `Warning ${newSwitchCount}/${maxSwitches}: Do not leave the test window or switch tabs!`
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to record proctoring flag: ' + err.message });
  }
});

// 8. Auto-Evaluation Engine & Submission
router.post('/:id/submit', authenticateToken, requireRole('STUDENT'), (req, res) => {
  try {
    const { attemptId, answers, timeTakenSeconds } = req.body;

    const attempt = db.get('SELECT * FROM test_attempts WHERE id = ? AND student_id = ?', [attemptId, req.user.id]);
    if (!attempt) {
      return res.status(404).json({ error: 'Attempt record not found.' });
    }

    if (attempt.status === 'COMPLETED') {
      return res.status(400).json({ error: 'This test attempt has already been submitted and scored.' });
    }

    const test = db.get('SELECT * FROM tests WHERE id = ?', [attempt.test_id]);
    if (!test) {
      return res.status(404).json({ error: 'Associated test configuration not found.' });
    }

    const questionIds = JSON.parse(test.questions_json || '[]');
    const placeholders = questionIds.map(() => '?').join(',');
    const questions = db.query(`SELECT * FROM questions WHERE id IN (${placeholders})`, questionIds);

    // AUTO-EVALUATION LOGIC
    let totalScore = 0;
    let maxScore = 0;
    let correctCount = 0;
    let wrongCount = 0;
    let unattemptedCount = 0;

    const questionBreakdown = [];

    for (const q of questions) {
      const qMarks = q.marks || 1.0;
      const qNeg = q.negative_marks || 0.0;
      maxScore += qMarks;

      const candidateAnswer = answers ? answers[q.id] : undefined;
      const correctAnswers = q.correct_answers_json ? JSON.parse(q.correct_answers_json) : [];

      let isCorrect = false;
      let scoreAwarded = 0;

      if (candidateAnswer === undefined || candidateAnswer === null || candidateAnswer === '') {
        unattemptedCount++;
      } else {
        // Compare answers (single choice index or descriptive match)
        if (q.question_type === 'MCQ_SINGLE') {
          if (parseInt(candidateAnswer, 10) === parseInt(correctAnswers[0], 10)) {
            isCorrect = true;
            scoreAwarded = qMarks;
            correctCount++;
          } else {
            scoreAwarded = -qNeg;
            wrongCount++;
          }
        } else if (q.question_type === 'MCQ_MULTIPLE') {
          const candArr = Array.isArray(candidateAnswer) ? candidateAnswer.map(Number).sort() : [Number(candidateAnswer)];
          const corrArr = correctAnswers.map(Number).sort();
          if (JSON.stringify(candArr) === JSON.stringify(corrArr)) {
            isCorrect = true;
            scoreAwarded = qMarks;
            correctCount++;
          } else {
            scoreAwarded = -qNeg;
            wrongCount++;
          }
        } else {
          // Descriptive: grant partial default or mark for reviewer
          scoreAwarded = qMarks * 0.7; // Generous baseline for academic demo
          isCorrect = true;
          correctCount++;
        }
      }

      totalScore += scoreAwarded;
      questionBreakdown.push({
        questionId: q.id,
        candidateAnswer,
        correctAnswers,
        isCorrect,
        scoreAwarded,
        explanation: q.explanation
      });
    }

    // Prevent negative overall score
    totalScore = Math.max(0, totalScore);
    const percentage = maxScore > 0 ? Number(((totalScore / maxScore) * 100).toFixed(1)) : 0;
    const passed = percentage >= (test.passing_percentage || 60.0) ? 1 : 0;

    // Save evaluation to database
    db.run(`
      UPDATE test_attempts SET
        status = 'COMPLETED',
        submitted_at = CURRENT_TIMESTAMP,
        time_taken_seconds = ?,
        total_score = ?,
        max_score = ?,
        percentage = ?,
        passed = ?,
        answers_json = ?
      WHERE id = ?
    `, [
      timeTakenSeconds || 0,
      Number(totalScore.toFixed(2)),
      Number(maxScore.toFixed(2)),
      percentage,
      passed,
      JSON.stringify(answers || {}),
      attemptId
    ]);

    // Update application record if exists
    if (attempt.application_id) {
      const newStatus = passed ? 'SHORTLISTED' : 'UNDER_REVIEW';
      const remarkText = passed 
        ? `Passed online screening test with ${percentage}% score (${totalScore}/${maxScore}).`
        : `Completed online screening test with ${percentage}% score. Under reviewer assessment.`;

      db.run(`
        UPDATE applications SET
          status = ?,
          score = ?,
          remarks = ?,
          test_attempt_id = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [
        newStatus,
        totalScore,
        remarkText,
        attemptId,
        attempt.application_id
      ]);

      // Notify candidate
      db.run(`
        INSERT INTO notifications (user_id, title, message, link)
        VALUES (?, ?, ?, ?)
      `, [
        req.user.id,
        passed ? `🎉 Test Cleared: ${test.title}` : `Test Submitted: ${test.title}`,
        `You scored ${totalScore}/${maxScore} (${percentage}%). ${passed ? 'You met the qualification cutoff and have been shortlisted!' : 'Your results have been sent to the recruiter.'}`,
        `/student/test-result/${attemptId}`
      ]);
    }

    res.json({
      message: 'Test submitted and auto-evaluated successfully!',
      attemptId,
      results: {
        totalScore: Number(totalScore.toFixed(2)),
        maxScore,
        percentage,
        passed: Boolean(passed),
        passingPercentage: test.passing_percentage,
        correctCount,
        wrongCount,
        unattemptedCount,
        totalQuestions: questions.length
      }
    });
  } catch (err) {
    console.error('Test submission error:', err);
    res.status(500).json({ error: 'Failed to process test submission: ' + err.message });
  }
});

// 9. Get detailed test results & solution review
router.get('/:id/result/:attemptId', authenticateToken, (req, res) => {
  try {
    const attempt = db.get(`
      SELECT 
        ta.*,
        t.title as test_title,
        t.category as test_category,
        t.passing_percentage,
        t.questions_json,
        u.full_name as student_name,
        u.email as student_email,
        sp.register_no
      FROM test_attempts ta
      JOIN tests t ON ta.test_id = t.id
      JOIN users u ON ta.student_id = u.id
      LEFT JOIN student_profiles sp ON u.id = sp.user_id
      WHERE ta.id = ?
    `, [req.params.attemptId]);

    if (!attempt) {
      return res.status(404).json({ error: 'Attempt record not found.' });
    }

    // Authorization check
    if (req.user.role === 'STUDENT' && attempt.student_id !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized to view another candidate’s test result.' });
    }

    const questionIds = JSON.parse(attempt.questions_json || '[]');
    const placeholders = questionIds.map(() => '?').join(',');
    const rawQuestions = db.query(`SELECT * FROM questions WHERE id IN (${placeholders})`, questionIds);

    const savedAnswers = attempt.answers_json ? JSON.parse(attempt.answers_json) : {};
    const proctoringLogs = attempt.proctoring_logs_json ? JSON.parse(attempt.proctoring_logs_json) : [];

    const detailedQuestions = rawQuestions.map(q => {
      const options = q.options_json ? JSON.parse(q.options_json) : [];
      const correct = q.correct_answers_json ? JSON.parse(q.correct_answers_json) : [];
      const candidateAns = savedAnswers[q.id];

      const isCorrect = candidateAns !== undefined && parseInt(candidateAns, 10) === parseInt(correct[0], 10);

      return {
        id: q.id,
        category: q.category,
        difficulty: q.difficulty,
        question_text: q.question_text,
        options,
        candidateAnswer: candidateAns,
        correctAnswers: correct,
        isCorrect,
        marks: q.marks,
        explanation: q.explanation
      };
    });

    res.json({
      attempt: {
        id: attempt.id,
        test_id: attempt.test_id,
        test_title: attempt.test_title,
        test_category: attempt.test_category,
        student_name: attempt.student_name,
        student_email: attempt.student_email,
        register_no: attempt.register_no,
        total_score: attempt.total_score,
        max_score: attempt.max_score,
        percentage: attempt.percentage,
        passed: Boolean(attempt.passed),
        passing_percentage: attempt.passing_percentage,
        time_taken_seconds: attempt.time_taken_seconds,
        tab_switch_count: attempt.tab_switch_count,
        submitted_at: attempt.submitted_at,
        proctoringLogs
      },
      questions: detailedQuestions
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch test results: ' + err.message });
  }
});

module.exports = router;

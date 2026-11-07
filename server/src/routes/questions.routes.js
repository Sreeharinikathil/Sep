const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { authenticateToken } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleCheck');

// 1. Get all questions from the question bank (with filtering)
router.get('/', authenticateToken, requireRole('COMPANY', 'ADMIN'), (req, res) => {
  try {
    const { category, difficulty, search, tag } = req.query;

    let sql = 'SELECT * FROM questions WHERE 1=1';
    const params = [];

    if (category && category !== 'ALL') {
      sql += ' AND category = ?';
      params.push(category);
    }

    if (difficulty && difficulty !== 'ALL') {
      sql += ' AND difficulty = ?';
      params.push(difficulty);
    }

    if (search) {
      sql += ' AND (question_text LIKE ? OR tags LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    if (tag) {
      sql += ' AND tags LIKE ?';
      params.push(`%${tag}%`);
    }

    sql += ' ORDER BY id DESC';

    const rawQuestions = db.query(sql, params);

    // Parse JSON fields
    const questions = rawQuestions.map(q => ({
      ...q,
      options: q.options_json ? JSON.parse(q.options_json) : [],
      correct_answers: q.correct_answers_json ? JSON.parse(q.correct_answers_json) : []
    }));

    res.json({ questions });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch questions: ' + err.message });
  }
});

// 2. Get categories and summary stats
router.get('/summary', authenticateToken, requireRole('COMPANY', 'ADMIN'), (req, res) => {
  try {
    const categories = db.query(`
      SELECT category, COUNT(*) as count 
      FROM questions 
      GROUP BY category 
      ORDER BY count DESC
    `);

    const difficulties = db.query(`
      SELECT difficulty, COUNT(*) as count 
      FROM questions 
      GROUP BY difficulty
    `);

    const total = db.get('SELECT COUNT(*) as count FROM questions');

    res.json({
      totalQuestions: total ? total.count : 0,
      categories,
      difficulties
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch question bank summary: ' + err.message });
  }
});

// 3. Add question to Question Bank
router.post('/', authenticateToken, requireRole('COMPANY', 'ADMIN'), (req, res) => {
  try {
    const {
      category,
      difficulty,
      question_text,
      question_type,
      options,
      correct_answers,
      explanation,
      marks,
      negative_marks,
      tags
    } = req.body;

    if (!category || !question_text || !correct_answers) {
      return res.status(400).json({ error: 'Category, Question text, and Correct answers are required.' });
    }

    const result = db.run(`
      INSERT INTO questions (
        category, difficulty, question_text, question_type,
        options_json, correct_answers_json, explanation,
        marks, negative_marks, tags, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      category.trim(),
      difficulty || 'MEDIUM',
      question_text.trim(),
      question_type || 'MCQ_SINGLE',
      JSON.stringify(options || []),
      JSON.stringify(Array.isArray(correct_answers) ? correct_answers : [correct_answers]),
      explanation || '',
      parseFloat(marks) || 1.0,
      parseFloat(negative_marks) || 0.0,
      tags || '',
      req.user.id
    ]);

    res.status(201).json({
      message: 'Question added to Question Bank successfully!',
      questionId: result.lastInsertRowid
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create question: ' + err.message });
  }
});

// 4. Update question
router.put('/:id', authenticateToken, requireRole('COMPANY', 'ADMIN'), (req, res) => {
  try {
    const question = db.get('SELECT * FROM questions WHERE id = ?', [req.params.id]);
    if (!question) {
      return res.status(404).json({ error: 'Question not found.' });
    }

    const {
      category,
      difficulty,
      question_text,
      question_type,
      options,
      correct_answers,
      explanation,
      marks,
      negative_marks,
      tags
    } = req.body;

    db.run(`
      UPDATE questions SET
        category = COALESCE(?, category),
        difficulty = COALESCE(?, difficulty),
        question_text = COALESCE(?, question_text),
        question_type = COALESCE(?, question_type),
        options_json = CASE WHEN ? IS NOT NULL THEN ? ELSE options_json END,
        correct_answers_json = CASE WHEN ? IS NOT NULL THEN ? ELSE correct_answers_json END,
        explanation = COALESCE(?, explanation),
        marks = COALESCE(?, marks),
        negative_marks = COALESCE(?, negative_marks),
        tags = COALESCE(?, tags)
      WHERE id = ?
    `, [
      category,
      difficulty,
      question_text,
      question_type,
      options ? 1 : null,
      options ? JSON.stringify(options) : null,
      correct_answers ? 1 : null,
      correct_answers ? JSON.stringify(Array.isArray(correct_answers) ? correct_answers : [correct_answers]) : null,
      explanation,
      marks !== undefined ? parseFloat(marks) : null,
      negative_marks !== undefined ? parseFloat(negative_marks) : null,
      tags,
      req.params.id
    ]);

    res.json({ message: 'Question updated successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update question: ' + err.message });
  }
});

// 5. Delete question
router.delete('/:id', authenticateToken, requireRole('COMPANY', 'ADMIN'), (req, res) => {
  try {
    db.run('DELETE FROM questions WHERE id = ?', [req.params.id]);
    res.json({ message: 'Question removed from question bank.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete question: ' + err.message });
  }
});

module.exports = router;

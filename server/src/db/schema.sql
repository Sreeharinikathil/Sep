-- ========================================================
-- Schema: Internship Management with Online Test for Selection
-- Author: Sreehari Nikathil (CCE25CS231)
-- ========================================================

-- 1. Users Table (RBAC: ADMIN, COMPANY, STUDENT)
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT CHECK(role IN ('ADMIN', 'COMPANY', 'STUDENT')) NOT NULL,
    full_name TEXT NOT NULL,
    is_verified INTEGER DEFAULT 0,
    avatar_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Student Profiles
CREATE TABLE IF NOT EXISTS student_profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER UNIQUE NOT NULL,
    register_no TEXT UNIQUE,
    college_name TEXT DEFAULT 'College of Engineering',
    department TEXT NOT NULL,
    degree TEXT DEFAULT 'B.Tech',
    cgpa REAL DEFAULT 0.0,
    batch_year INTEGER DEFAULT 2025,
    phone TEXT,
    bio TEXT,
    skills TEXT, -- comma-separated or JSON
    resume_url TEXT,
    resume_filename TEXT,
    github_url TEXT,
    linkedin_url TEXT,
    portfolio_url TEXT,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. Company Profiles
CREATE TABLE IF NOT EXISTS company_profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER UNIQUE NOT NULL,
    company_name TEXT NOT NULL,
    website TEXT,
    industry TEXT,
    location TEXT,
    hq_address TEXT,
    description TEXT,
    logo_url TEXT,
    is_verified INTEGER DEFAULT 0,
    hr_name TEXT,
    hr_phone TEXT,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 4. Question Bank
CREATE TABLE IF NOT EXISTS questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category TEXT NOT NULL, -- e.g., 'Data Structures', 'Web Development', 'Quantitative Aptitude', 'Python', 'DBMS'
    difficulty TEXT CHECK(difficulty IN ('EASY', 'MEDIUM', 'HARD')) DEFAULT 'MEDIUM',
    question_text TEXT NOT NULL,
    question_type TEXT CHECK(question_type IN ('MCQ_SINGLE', 'MCQ_MULTIPLE', 'DESCRIPTIVE')) DEFAULT 'MCQ_SINGLE',
    options_json TEXT, -- JSON array of strings: ["Option A", "Option B", ...]
    correct_answers_json TEXT NOT NULL, -- JSON array of indices: [0] or strings
    explanation TEXT,
    marks REAL DEFAULT 1.0,
    negative_marks REAL DEFAULT 0.0,
    tags TEXT, -- Comma-separated: e.g. '#arrays, #two-pointers'
    created_by INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- 5. Online Tests
CREATE TABLE IF NOT EXISTS tests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT DEFAULT 'General Assessment',
    duration_minutes INTEGER DEFAULT 30,
    total_marks REAL DEFAULT 100.0,
    passing_percentage REAL DEFAULT 60.0,
    allow_randomization INTEGER DEFAULT 1,
    proctoring_enabled INTEGER DEFAULT 1,
    strict_mode INTEGER DEFAULT 1, -- fullscreen + tab change detection
    max_tab_switches INTEGER DEFAULT 3,
    questions_json TEXT NOT NULL, -- JSON array of question IDs: [1, 2, 5, ...]
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(company_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 6. Internship Postings
CREATE TABLE IF NOT EXISTS internships (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    department TEXT NOT NULL,
    employment_type TEXT DEFAULT 'Full-time Internship', -- Summer, Full-time, Co-op, Part-time
    location_type TEXT CHECK(location_type IN ('REMOTE', 'HYBRID', 'ON_SITE')) DEFAULT 'REMOTE',
    location_city TEXT,
    stipend_amount INTEGER DEFAULT 0,
    stipend_type TEXT DEFAULT 'Monthly', -- Monthly, Fixed, Unpaid, Performance
    duration_months INTEGER DEFAULT 3,
    description TEXT NOT NULL,
    responsibilities TEXT,
    requirements TEXT,
    required_skills TEXT, -- Comma-separated
    min_cgpa REAL DEFAULT 0.0,
    allowed_branches TEXT, -- JSON or comma-separated
    target_batches TEXT, -- e.g. '2025, 2026'
    openings_count INTEGER DEFAULT 1,
    deadline DATE,
    status TEXT CHECK(status IN ('OPEN', 'CLOSED', 'ARCHIVED')) DEFAULT 'OPEN',
    test_id INTEGER, -- Linked online test requirement
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(company_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY(test_id) REFERENCES tests(id) ON DELETE SET NULL
);

-- 7. Test Attempts (Online Test Engine)
CREATE TABLE IF NOT EXISTS test_attempts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    test_id INTEGER NOT NULL,
    student_id INTEGER NOT NULL,
    application_id INTEGER,
    start_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    submitted_at DATETIME,
    time_taken_seconds INTEGER DEFAULT 0,
    status TEXT CHECK(status IN ('IN_PROGRESS', 'COMPLETED', 'AUTO_SUBMITTED', 'DISQUALIFIED')) DEFAULT 'IN_PROGRESS',
    total_score REAL DEFAULT 0.0,
    max_score REAL DEFAULT 0.0,
    percentage REAL DEFAULT 0.0,
    passed INTEGER DEFAULT 0,
    answers_json TEXT, -- JSON object: { [questionId]: selectedOptionIndex | string }
    tab_switch_count INTEGER DEFAULT 0,
    proctoring_logs_json TEXT, -- JSON array of violations: [{ type: 'TAB_BLUR', timestamp: '...' }]
    reviewed_by INTEGER,
    reviewer_feedback TEXT,
    FOREIGN KEY(test_id) REFERENCES tests(id) ON DELETE CASCADE,
    FOREIGN KEY(student_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY(application_id) REFERENCES applications(id) ON DELETE CASCADE
);

-- 8. Applications Table
CREATE TABLE IF NOT EXISTS applications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    internship_id INTEGER NOT NULL,
    student_id INTEGER NOT NULL,
    status TEXT CHECK(status IN (
        'APPLIED', 
        'SHORTLISTED', 
        'TEST_INVITED', 
        'TEST_IN_PROGRESS', 
        'TEST_COMPLETED', 
        'UNDER_REVIEW', 
        'SELECTED', 
        'REJECTED'
    )) DEFAULT 'APPLIED',
    test_attempt_id INTEGER,
    applied_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    score REAL,
    remarks TEXT,
    feedback TEXT,
    FOREIGN KEY(internship_id) REFERENCES internships(id) ON DELETE CASCADE,
    FOREIGN KEY(student_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY(test_attempt_id) REFERENCES test_attempts(id) ON DELETE SET NULL,
    UNIQUE(internship_id, student_id)
);

-- 9. Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    link TEXT,
    is_read INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 10. Audit & Activity Logs
CREATE TABLE IF NOT EXISTS activity_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    action TEXT NOT NULL,
    details TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Performance indices
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_internships_status ON internships(status);
CREATE INDEX IF NOT EXISTS idx_internships_company ON internships(company_id);
CREATE INDEX IF NOT EXISTS idx_applications_student ON applications(student_id);
CREATE INDEX IF NOT EXISTS idx_applications_internship ON applications(internship_id);
CREATE INDEX IF NOT EXISTS idx_questions_category ON questions(category);
CREATE INDEX IF NOT EXISTS idx_test_attempts_student ON test_attempts(student_id);

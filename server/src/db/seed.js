const bcrypt = require('bcryptjs');
const db = require('./database');
const { initializeDatabase } = require('./init');

function seedDatabase() {
  console.log('🌱 Starting database seeding...');
  initializeDatabase();

  // Clean existing data
  db.exec(`
    DELETE FROM activity_logs;
    DELETE FROM notifications;
    DELETE FROM test_attempts;
    DELETE FROM applications;
    DELETE FROM internships;
    DELETE FROM tests;
    DELETE FROM questions;
    DELETE FROM student_profiles;
    DELETE FROM company_profiles;
    DELETE FROM users;
  `);

  const salt = bcrypt.genSaltSync(10);
  const hash = (pwd) => bcrypt.hashSync(pwd, salt);

  // 1. Seed Users
  const insertUser = db.raw.prepare(`
    INSERT INTO users (email, password_hash, role, full_name, is_verified, avatar_url)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  // Admin
  const adminRes = insertUser.run('admin@college.edu', hash('Admin@123'), 'ADMIN', 'Dr. K. R. Sharma', 1, 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200');
  const adminId = adminRes.lastInsertRowid;

  // Companies
  const googleRes = insertUser.run('recruitment@google.com', hash('Google@123'), 'COMPANY', 'Google Cloud India', 1, 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg');
  const googleId = googleRes.lastInsertRowid;

  const msftRes = insertUser.run('careers@microsoft.com', hash('Microsoft@123'), 'COMPANY', 'Microsoft IDC', 1, 'https://upload.wikimedia.org/wikipedia/commons/9/96/Microsoft_logo_%282012%29.svg');
  const msftId = msftRes.lastInsertRowid;

  const zerodhaRes = insertUser.run('hiring@zerodha.com', hash('Zerodha@123'), 'COMPANY', 'Zerodha Tech', 1, 'https://zerodha.com/static/images/logo.svg');
  const zerodhaId = zerodhaRes.lastInsertRowid;

  const tataRes = insertUser.run('talent@tataelxsi.com', hash('Tata@123'), 'COMPANY', 'Tata Elxsi Ltd', 1, 'https://upload.wikimedia.org/wikipedia/commons/b/b5/Tata_logo.svg');
  const tataId = tataRes.lastInsertRowid;

  // Students (featuring user's friend Sreehari Nikathil)
  const sreehariRes = insertUser.run('sreehari@college.edu', hash('Student@123'), 'STUDENT', 'Sreehari Nikathil', 1, 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200');
  const sreehariId = sreehariRes.lastInsertRowid;

  const ananyaRes = insertUser.run('ananya.n@college.edu', hash('Student@123'), 'STUDENT', 'Ananya Nair', 1, 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200');
  const ananyaId = ananyaRes.lastInsertRowid;

  const rohitRes = insertUser.run('rohit.v@college.edu', hash('Student@123'), 'STUDENT', 'Rohit Varma', 1, 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=200');
  const rohitId = rohitRes.lastInsertRowid;

  // 2. Company Profiles
  const insertCompany = db.raw.prepare(`
    INSERT INTO company_profiles (user_id, company_name, website, industry, location, hq_address, description, logo_url, is_verified, hr_name, hr_phone)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertCompany.run(
    googleId,
    'Google Cloud India',
    'https://cloud.google.com',
    'Cloud Computing & AI',
    'Bangalore, Karnataka',
    'Google Signature Tower, RMZ Infinity, Old Madras Rd, Bengaluru',
    'Google Cloud provides organizations with leading infrastructure, platform capabilities and industry solutions.',
    'https://images.unsplash.com/photo-1572021335469-31706a17aaef?auto=format&fit=crop&q=80&w=200',
    1,
    'Priya Sundaram',
    '+91 80 6721 8000'
  );

  insertCompany.run(
    msftId,
    'Microsoft IDC',
    'https://careers.microsoft.com',
    'Software & Cloud Platforms',
    'Hyderabad, Telangana',
    'Microsoft Campus, Gachibowli, Hyderabad',
    'Microsoft India Development Center (IDC) is one of Microsoft’s largest R&D centers outside Redmond.',
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=200',
    1,
    'Arun Chawla',
    '+91 40 6694 0000'
  );

  insertCompany.run(
    zerodhaId,
    'Zerodha Tech',
    'https://zerodha.tech',
    'FinTech & High Performance Trading',
    'Bangalore, Karnataka',
    '153/154, 4th Cross, Dollars Colony, JP Nagar 4th Phase, Bengaluru',
    'India’s biggest stockbroker building cutting edge, open-source-first financial systems.',
    'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&q=80&w=200',
    1,
    'Kailash Nadh Team',
    '+91 80 4718 1888'
  );

  insertCompany.run(
    tataId,
    'Tata Elxsi Ltd',
    'https://tataelxsi.com',
    'IoT & Embedded Systems',
    'Trivandrum, Kerala',
    'Technopark Campus, Trivandrum',
    'A global design and technology services company focusing on automotive, broadcast, and healthcare.',
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=200',
    1,
    'Deepak Menon',
    '+91 471 660 1000'
  );

  // 3. Student Profiles
  const insertStudent = db.raw.prepare(`
    INSERT INTO student_profiles (
      user_id, register_no, college_name, department, degree, cgpa, batch_year, phone, bio, skills, resume_url, resume_filename, github_url, linkedin_url, portfolio_url
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertStudent.run(
    sreehariId,
    'CCE25CS231',
    'College of Engineering',
    'Computer Science and Engineering',
    'B.Tech',
    8.92,
    2025,
    '+91 98765 43210',
    'Passionate Full-Stack Developer and Systems Enthusiast. Love building scalable web architectures and real-time distributed applications.',
    'React, Node.js, Express, PostgreSQL, SQLite, Python, Data Structures & Algorithms, Docker, Git',
    '/uploads/sreehari_resume.pdf',
    'Sreehari_Nikathil_Resume.pdf',
    'https://github.com/sreehari-nikathil',
    'https://linkedin.com/in/sreehari-nikathil',
    'https://sreehari.dev'
  );

  insertStudent.run(
    ananyaId,
    'CCE25CS104',
    'College of Engineering',
    'Computer Science and Engineering',
    'B.Tech',
    9.15,
    2025,
    '+91 94471 23456',
    'AI/ML researcher and competitive programmer with top ranks in national hackathons.',
    'Python, PyTorch, C++, Machine Learning, Algorithms, React, Flask',
    '/uploads/ananya_resume.pdf',
    'Ananya_Nair_Resume.pdf',
    'https://github.com/ananyanair',
    'https://linkedin.com/in/ananyanair',
    'https://ananya.ai'
  );

  insertStudent.run(
    rohitId,
    'CCE25EC045',
    'College of Engineering',
    'Electronics and Communication',
    'B.Tech',
    8.20,
    2025,
    '+91 98460 98765',
    'Hardware-Software co-design, Embedded C, and IoT enthusiast.',
    'C, C++, Embedded Systems, RTOS, ARM Cortex, Python',
    '/uploads/rohit_resume.pdf',
    'Rohit_Varma_Resume.pdf',
    'https://github.com/rohitvarma',
    'https://linkedin.com/in/rohitvarma',
    ''
  );

  // 4. Question Bank (Curated, top-tier engineering questions)
  const insertQuestion = db.raw.prepare(`
    INSERT INTO questions (category, difficulty, question_text, question_type, options_json, correct_answers_json, explanation, marks, negative_marks, tags, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const questionsData = [
    // Data Structures & Algorithms
    {
      category: 'Data Structures & Algorithms',
      difficulty: 'MEDIUM',
      question_text: 'What is the worst-case time complexity of searching in a Balanced Binary Search Tree (such as an AVL or Red-Black Tree) containing N elements?',
      question_type: 'MCQ_SINGLE',
      options: ['O(1)', 'O(log N)', 'O(N)', 'O(N log N)'],
      correct: [1],
      explanation: 'In a balanced BST, the height is guaranteed to be O(log N). Every comparison eliminates half the remaining subtree, yielding O(log N) worst-case time.',
      marks: 2,
      neg: 0.5,
      tags: '#trees, #complexity, #bst'
    },
    {
      category: 'Data Structures & Algorithms',
      difficulty: 'HARD',
      question_text: 'Which data structure is most optimal for implementing Dijkstra’s Shortest Path Algorithm on a sparse graph with V vertices and E edges?',
      question_type: 'MCQ_SINGLE',
      options: ['Array', 'Fibonacci Heap or Min-Binary Heap', 'Queue (FIFO)', 'Stack (LIFO)'],
      correct: [1],
      explanation: 'Using a Min-Binary Heap or Fibonacci Heap allows extracting the minimum vertex in O(log V) time, resulting in overall time complexity of O((V + E) log V).',
      marks: 3,
      neg: 1.0,
      tags: '#graphs, #dijkstra, #heaps'
    },
    {
      category: 'Data Structures & Algorithms',
      difficulty: 'EASY',
      question_text: 'What will be the time complexity to access an element at index i in a dynamic array (e.g., std::vector or ArrayList)?',
      question_type: 'MCQ_SINGLE',
      options: ['O(1)', 'O(N)', 'O(log N)', 'O(i)'],
      correct: [0],
      explanation: 'Arrays allocate contiguous memory blocks. Element address is computed by: base_address + index * element_size, allowing direct O(1) random access.',
      marks: 1,
      neg: 0.25,
      tags: '#arrays, #basics'
    },
    {
      category: 'Data Structures & Algorithms',
      difficulty: 'MEDIUM',
      question_text: 'Which sorting algorithm has a guaranteed worst-case time complexity of O(N log N) while requiring O(1) auxiliary space?',
      question_type: 'MCQ_SINGLE',
      options: ['Quick Sort', 'Merge Sort', 'Heap Sort', 'Bubble Sort'],
      correct: [2],
      explanation: 'Heap Sort builds a heap in-place and repeatedly extracts max/min elements in O(N log N) time using only O(1) auxiliary space. Merge Sort requires O(N) space and Quick Sort has O(N^2) worst-case.',
      marks: 2,
      neg: 0.5,
      tags: '#sorting, #heapsort'
    },
    {
      category: 'Data Structures & Algorithms',
      difficulty: 'EASY',
      question_text: 'Which data structure follows the Last-In-First-Out (LIFO) principle and is used for function call stacks and undo operations?',
      question_type: 'MCQ_SINGLE',
      options: ['Queue', 'Stack', 'Linked List', 'Priority Queue'],
      correct: [1],
      explanation: 'A Stack follows LIFO semantics. The most recently pushed element is the first one popped.',
      marks: 1,
      neg: 0.25,
      tags: '#stack, #lifo'
    },

    // Web Technologies & Distributed Systems
    {
      category: 'Web Technologies',
      difficulty: 'MEDIUM',
      question_text: 'In Node.js asynchronous runtime, where are resolved Promise callbacks (e.g., .then(), .catch()) executed in the Event Loop?',
      question_type: 'MCQ_SINGLE',
      options: ['Check Phase (setImmediate)', 'Timers Phase (setTimeout)', 'Microtask Queue (process.nextTick & Promise jobs)', 'Close Callbacks Phase'],
      correct: [2],
      explanation: 'Promises execute in the Microtask Queue, which drains immediately after the current operation finishes and before moving to the next Event Loop macrotask phase.',
      marks: 2,
      neg: 0.5,
      tags: '#nodejs, #eventloop, #javascript'
    },
    {
      category: 'Web Technologies',
      difficulty: 'EASY',
      question_text: 'Which HTTP header is used by browsers and servers to govern Cross-Origin Resource Sharing (CORS)?',
      question_type: 'MCQ_SINGLE',
      options: ['Access-Control-Allow-Origin', 'X-Forwarded-Host', 'Content-Security-Origin', 'Allow-Cross-Domain'],
      correct: [0],
      explanation: 'The Access-Control-Allow-Origin response header indicates whether the response can be shared with requesting code from the given origin.',
      marks: 1,
      neg: 0.25,
      tags: '#http, #cors, #security'
    },
    {
      category: 'Web Technologies',
      difficulty: 'MEDIUM',
      question_text: 'What mechanism does React use under the hood to minimize expensive real DOM updates during state changes?',
      question_type: 'MCQ_SINGLE',
      options: ['Shadow DOM', 'Virtual DOM and Reconciliation Diffing', 'Direct Web Worker Mutation', 'Two-Way Dirty Checking'],
      correct: [1],
      explanation: 'React maintains an in-memory Virtual DOM tree representation. Upon state updates, it compares (diffs) the new and old virtual trees and applies batched minimal patches to the real DOM.',
      marks: 2,
      neg: 0.5,
      tags: '#react, #virtual-dom, #frontend'
    },
    {
      category: 'Web Technologies',
      difficulty: 'MEDIUM',
      question_text: 'Which HTTP method should be idempotent according to the RFC HTTP/1.1 specification? (Choose the most appropriate)',
      question_type: 'MCQ_SINGLE',
      options: ['POST', 'PUT', 'PATCH (in non-standard forms)', 'CONNECT'],
      correct: [1],
      explanation: 'PUT replaces the target resource with request payload. Multiple identical PUT requests must yield the same server state as a single request, making it idempotent.',
      marks: 2,
      neg: 0.5,
      tags: '#rest, #http-methods, #api'
    },

    // Database Management Systems (DBMS)
    {
      category: 'Database Systems',
      difficulty: 'MEDIUM',
      question_text: 'In relational database transactions, what does the "I" in ACID properties stand for?',
      question_type: 'MCQ_SINGLE',
      options: ['Integrity', 'Isolation', 'Indexing', 'Idempotency'],
      correct: [1],
      explanation: 'ACID stands for Atomicity, Consistency, Isolation, and Durability. Isolation ensures that concurrent transactions do not interfere with one another.',
      marks: 1,
      neg: 0.25,
      tags: '#dbms, #acid, #transactions'
    },
    {
      category: 'Database Systems',
      difficulty: 'HARD',
      question_text: 'A relation is in Boyce-Codd Normal Form (BCNF) if and only if for every non-trivial functional dependency X -> Y:',
      question_type: 'MCQ_SINGLE',
      options: ['Y is a prime attribute', 'X is a Superkey', 'X is a Foreign Key', 'Y is a candidate key'],
      correct: [1],
      explanation: 'BCNF is a stricter version of 3NF. In BCNF, for every functional dependency X -> Y, X must strictly be a Superkey of the relation.',
      marks: 3,
      neg: 1.0,
      tags: '#dbms, #normalization, #bcnf'
    },
    {
      category: 'Database Systems',
      difficulty: 'MEDIUM',
      question_text: 'Which SQL clause is used to filter records resulting from aggregate functions (e.g., COUNT(), AVG())?',
      question_type: 'MCQ_SINGLE',
      options: ['WHERE', 'HAVING', 'GROUP BY', 'ORDER BY'],
      correct: [1],
      explanation: 'HAVING filters aggregated groups produced by GROUP BY, whereas WHERE filters individual rows before grouping.',
      marks: 1,
      neg: 0.25,
      tags: '#sql, #queries, #aggregations'
    },
    {
      category: 'Database Systems',
      difficulty: 'MEDIUM',
      question_text: 'Why are B+ Trees predominantly preferred over standard Binary Search Trees for on-disk database indexing?',
      question_type: 'MCQ_SINGLE',
      options: [
        'B+ Trees have fewer nodes than binary trees',
        'B+ Trees have high fan-out (reducing disk I/O depth) and linked leaf nodes for rapid range scans',
        'B+ Trees require zero memory cache',
        'B+ Trees only store integers'
      ],
      correct: [1],
      explanation: 'High fan-out keeps B+ Trees shallow (typically 3-4 levels for millions of records), drastically minimizing disk block reads. Linked leaf nodes make sequential range queries extremely fast.',
      marks: 2,
      neg: 0.5,
      tags: '#indexing, #bplus-tree, #storage'
    },

    // Quantitative Aptitude & Reasoning
    {
      category: 'Quantitative Aptitude',
      difficulty: 'EASY',
      question_text: 'A train 180 meters long is traveling at a speed of 54 km/h. How many seconds will it take to pass a stationary signal pole?',
      question_type: 'MCQ_SINGLE',
      options: ['10 seconds', '12 seconds', '15 seconds', '18 seconds'],
      correct: [1],
      explanation: 'Speed in m/s = 54 * (5/18) = 15 m/s. Time = Distance / Speed = 180 m / 15 m/s = 12 seconds.',
      marks: 1,
      neg: 0.25,
      tags: '#aptitude, #speed-time-distance'
    },
    {
      category: 'Quantitative Aptitude',
      difficulty: 'MEDIUM',
      question_text: 'Pipe A can fill a tank in 6 hours and Pipe B can empty it in 8 hours. If both pipes are opened simultaneously, in how many hours will the tank be full?',
      question_type: 'MCQ_SINGLE',
      options: ['14 hours', '20 hours', '24 hours', '48 hours'],
      correct: [2],
      explanation: 'Net filling rate per hour = (1/6) - (1/8) = (4 - 3)/24 = 1/24. Thus, it takes 24 hours to fill the tank.',
      marks: 2,
      neg: 0.5,
      tags: '#aptitude, #pipes-cisterns'
    },
    {
      category: 'Quantitative Aptitude',
      difficulty: 'EASY',
      question_text: 'Two dice are rolled simultaneously. What is the probability of getting a sum equal to 7?',
      question_type: 'MCQ_SINGLE',
      options: ['1/12', '1/6', '7/36', '5/36'],
      correct: [1],
      explanation: 'Total outcomes = 36. Favorable outcomes for sum=7: (1,6), (2,5), (3,4), (4,3), (5,2), (6,1) = 6 pairs. Probability = 6/36 = 1/6.',
      marks: 1,
      neg: 0.25,
      tags: '#probability, #math'
    },
    {
      category: 'Quantitative Aptitude',
      difficulty: 'MEDIUM',
      question_text: 'If 12 men can complete a software project in 15 days working 8 hours a day, how many days will 16 men take working 6 hours a day?',
      question_type: 'MCQ_SINGLE',
      options: ['12 days', '15 days', '18 days', '20 days'],
      correct: [1],
      explanation: 'Total man-hours = 12 * 15 * 8 = 1440. With 16 men working 6 hrs/day: Daily hours = 16 * 6 = 96. Days required = 1440 / 96 = 15 days.',
      marks: 2,
      neg: 0.5,
      tags: '#aptitude, #time-and-work'
    },

    // Python & Core CS
    {
      category: 'Python & Programming',
      difficulty: 'EASY',
      question_text: 'What is the output of `bool([])`, `bool([0])`, and `bool("")` in Python?',
      question_type: 'MCQ_SINGLE',
      options: ['False, True, False', 'False, False, False', 'True, True, True', 'False, True, True'],
      correct: [0],
      explanation: 'Empty collections `[]` and empty strings `""` evaluate to False (falsy). Non-empty lists like `[0]` contain an element, so they evaluate to True.',
      marks: 1,
      neg: 0.25,
      tags: '#python, #basics, #types'
    },
    {
      category: 'Python & Programming',
      difficulty: 'MEDIUM',
      question_text: 'What keyword in Python converts a regular function into a generator that yields values on demand rather than storing everything in memory?',
      question_type: 'MCQ_SINGLE',
      options: ['return', 'yield', 'async', 'generate'],
      correct: [1],
      explanation: 'The `yield` statement suspends function execution and sends a value back to the caller, resuming state on the next `next()` call without allocating full memory upfront.',
      marks: 2,
      neg: 0.5,
      tags: '#python, #generators, #memory'
    },
    {
      category: 'Operating Systems',
      difficulty: 'MEDIUM',
      question_text: 'Which of the following is NOT one of Coffman’s four necessary conditions for a Deadlock to occur?',
      question_type: 'MCQ_SINGLE',
      options: ['Mutual Exclusion', 'Hold and Wait', 'Preemption allowed by OS', 'Circular Wait'],
      correct: [2],
      explanation: 'The condition is NO PREEMPTION. If preemption is allowed, resources can be forcibly reclaimed, breaking deadlock.',
      marks: 2,
      neg: 0.5,
      tags: '#os, #deadlocks, #coffman'
    }
  ];

  const insertedQuestionIds = [];
  for (const q of questionsData) {
    const res = insertQuestion.run(
      q.category,
      q.difficulty,
      q.question_text,
      q.question_type,
      JSON.stringify(q.options),
      JSON.stringify(q.correct),
      q.explanation,
      q.marks,
      q.neg,
      q.tags,
      adminId
    );
    insertedQuestionIds.push(res.lastInsertRowid);
  }

  // 5. Online Tests
  const insertTest = db.raw.prepare(`
    INSERT INTO tests (company_id, title, description, category, duration_minutes, total_marks, passing_percentage, allow_randomization, proctoring_enabled, strict_mode, max_tab_switches, questions_json, is_active)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // Test 1: Google Cloud Technical Assessment (10 questions)
  const googleQuestions = insertedQuestionIds.slice(0, 10);
  const googleTestRes = insertTest.run(
    googleId,
    'Google Cloud SWE Intern Screening Test',
    'Comprehensive online screening test covering Algorithms, Data Structures, Web Systems, and Operating System internals.',
    'Technical Assessment',
    30,
    20.0,
    65.0,
    1,
    1,
    1,
    3,
    JSON.stringify(googleQuestions),
    1
  );
  const googleTestId = googleTestRes.lastInsertRowid;

  // Test 2: Zerodha Full Stack Developer Challenge (8 questions)
  const zerodhaQuestions = [insertedQuestionIds[0], insertedQuestionIds[2], insertedQuestionIds[5], insertedQuestionIds[6], insertedQuestionIds[7], insertedQuestionIds[8], insertedQuestionIds[9], insertedQuestionIds[11]];
  const zerodhaTestRes = insertTest.run(
    zerodhaId,
    'Zerodha Full-Stack Engineering Assessment',
    'Focuses on web performance, asynchronous Node.js primitives, React reconciliation, and database query optimization.',
    'Full Stack Engineering',
    25,
    15.0,
    60.0,
    1,
    1,
    1,
    3,
    JSON.stringify(zerodhaQuestions),
    1
  );
  const zerodhaTestId = zerodhaTestRes.lastInsertRowid;

  // Test 3: Microsoft Core Systems & Problem Solving Test (10 questions)
  const msftQuestions = [insertedQuestionIds[0], insertedQuestionIds[1], insertedQuestionIds[3], insertedQuestionIds[4], insertedQuestionIds[10], insertedQuestionIds[12], insertedQuestionIds[13], insertedQuestionIds[14], insertedQuestionIds[18], insertedQuestionIds[19]];
  const msftTestRes = insertTest.run(
    msftId,
    'Microsoft IDC Problem Solving & Core CS Exam',
    'Evaluates graph algorithms, advanced trees, relational schema design, concurrency, and memory management.',
    'Systems & Algorithms',
    40,
    25.0,
    70.0,
    1,
    1,
    1,
    3,
    JSON.stringify(msftQuestions),
    1
  );
  const msftTestId = msftTestRes.lastInsertRowid;

  // Test 4: Campus General Aptitude & Logic Test (Aptitude questions)
  const aptitudeQuestions = [insertedQuestionIds[13], insertedQuestionIds[14], insertedQuestionIds[15], insertedQuestionIds[16], insertedQuestionIds[17], insertedQuestionIds[18]];
  const generalTestRes = insertTest.run(
    tataId,
    'Tata Elxsi General Technical & Quantitative Test',
    'Evaluates numerical problem solving, aptitude, programming basics, and logical deductions.',
    'Campus Aptitude & Technical',
    20,
    10.0,
    50.0,
    1,
    1,
    1,
    3,
    JSON.stringify(aptitudeQuestions),
    1
  );
  const generalTestId = generalTestRes.lastInsertRowid;

  // 6. Internship Postings
  const insertInternship = db.raw.prepare(`
    INSERT INTO internships (
      company_id, title, department, employment_type, location_type, location_city, stipend_amount, stipend_type, duration_months, description, responsibilities, requirements, required_skills, min_cgpa, allowed_branches, target_batches, openings_count, deadline, status, test_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const googleInternshipRes = insertInternship.run(
    googleId,
    'Cloud Software Engineering Intern',
    'Engineering & Product',
    'Summer Internship',
    'HYBRID',
    'Bangalore, Karnataka',
    85000,
    'Monthly',
    6,
    'Join Google Cloud India engineering team to work on planetary-scale distributed cloud infrastructure, microservices, and AI integrations.',
    '• Design, develop, test, deploy, maintain and enhance software solutions.\n• Collaborate with global product teams on cloud scalability.\n• Build robust backend APIs and automated test suites.',
    '• Currently pursuing a B.Tech/M.Tech in CSE, IT, or related field.\n• Strong foundation in Data Structures, Algorithms, and System Design.\n• Proficiency in at least one modern language (C++, Java, Python, Go, Node.js).',
    'Data Structures, Algorithms, Cloud Computing, Distributed Systems, Python/Go',
    8.0,
    'CSE, IT, ECE',
    '2025, 2026',
    5,
    '2026-12-31',
    'OPEN',
    googleTestId
  );
  const googleInternshipId = googleInternshipRes.lastInsertRowid;

  const zerodhaInternshipRes = insertInternship.run(
    zerodhaId,
    'Full Stack Web Developer Intern',
    'Platform Engineering',
    'Full-time Internship',
    'REMOTE',
    'Bangalore / Remote',
    50000,
    'Monthly',
    3,
    'Work on high-throughput, low-latency financial tech web platforms used by over 12 million active Indian traders every single day.',
    '• Develop responsive, accessible web interfaces in React and TypeScript.\n• Optimize client-server latency, WebSockets, and state caching.\n• Write clean, testable backend services.',
    '• Experience with modern JavaScript/TypeScript, React, Node.js.\n• Sound understanding of REST APIs, WebSockets, and relational databases.\n• Passion for minimalism and clean code architecture.',
    'React, Node.js, TypeScript, PostgreSQL, WebSockets',
    7.5,
    'CSE, IT, ECE, EEE',
    '2025, 2026',
    3,
    '2026-11-30',
    'OPEN',
    zerodhaTestId
  );
  const zerodhaInternshipId = zerodhaInternshipRes.lastInsertRowid;

  const msftInternshipRes = insertInternship.run(
    msftId,
    'Systems & Core Platforms Intern',
    'Cloud + AI Division',
    'Summer Internship',
    'ON_SITE',
    'Hyderabad, Telangana',
    90000,
    'Monthly',
    6,
    'Empower every person and every organization on the planet to achieve more. Work on Azure core computing, kernel performance, and enterprise platforms.',
    '• Build high-performance services in C++, C#, or Rust.\n• Profile, debug, and optimize multi-threaded distributed pipelines.\n• Participate in code reviews and architecture discussions.',
    '• Strong grasp of Operating Systems, Memory Management, and Concurrency.\n• High problem-solving caliber with minimum 8.5 CGPA.\n• Familiarity with Git, Linux environments, and CI/CD.',
    'C++, Operating Systems, Algorithms, Multithreading, Distributed Systems',
    8.5,
    'CSE, IT',
    '2025',
    4,
    '2026-12-15',
    'OPEN',
    msftTestId
  );
  const msftInternshipId = msftInternshipRes.lastInsertRowid;

  const tataInternshipRes = insertInternship.run(
    tataId,
    'Embedded Software & IoT Intern',
    'Automotive & Embedded Division',
    'Full-time Internship',
    'ON_SITE',
    'Trivandrum, Kerala',
    30000,
    'Monthly',
    6,
    'Develop smart connected vehicle solutions, AUTOSAR compliant software modules, and digital cockpit systems.',
    '• Develop and debug microcontroller firmware in C/C++.\n• Interface with CAN, SPI, I2C protocols.\n• Validate firmware against hardware test benches.',
    '• Degree in Electronics, Electrical, or Computer Science.\n• Hands-on experience with microcontrollers and C programming.\n• Minimum CGPA of 7.0.',
    'Embedded C, C++, Microcontrollers, RTOS, Protocols',
    7.0,
    'ECE, EEE, CSE',
    '2025, 2026',
    8,
    '2026-11-20',
    'OPEN',
    generalTestId
  );
  const tataInternshipId = tataInternshipRes.lastInsertRowid;

  // 7. Applications & Test Attempts (Realistic candidate state for viva demo)
  const insertApp = db.raw.prepare(`
    INSERT INTO applications (internship_id, student_id, status, applied_at, score, remarks)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const insertAttempt = db.raw.prepare(`
    INSERT INTO test_attempts (
      test_id, student_id, application_id, start_time, submitted_at, time_taken_seconds, status, total_score, max_score, percentage, passed, answers_json, tab_switch_count, proctoring_logs_json
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // Application 1: Sreehari applied to Google Cloud -> Took test -> Scored 18/20 (90%) -> SHORTLISTED!
  const appGoogle = insertApp.run(
    googleInternshipId,
    sreehariId,
    'SHORTLISTED',
    '2026-11-01 10:15:00',
    18.0,
    'Exceptional performance in online screening test. Shortlisted for technical interview round.'
  );
  const appGoogleId = appGoogle.lastInsertRowid;

  const attemptGoogle = insertAttempt.run(
    googleTestId,
    sreehariId,
    appGoogleId,
    '2026-11-02 14:00:00',
    '2026-11-02 14:24:30',
    1470,
    'COMPLETED',
    18.0,
    20.0,
    90.0,
    1,
    JSON.stringify({ 1: 1, 2: 1, 3: 0, 4: 2, 5: 1, 6: 2, 7: 0, 8: 1, 9: 1, 10: 1 }),
    0,
    JSON.stringify([])
  );
  db.raw.prepare('UPDATE applications SET test_attempt_id = ? WHERE id = ?').run(attemptGoogle.lastInsertRowid, appGoogleId);

  // Application 2: Sreehari applied to Zerodha -> Invited to test (TEST_INVITED)
  // Ready to be tested live by the student or evaluator during demonstration!
  insertApp.run(
    zerodhaInternshipId,
    sreehariId,
    'TEST_INVITED',
    '2026-11-05 09:30:00',
    null,
    'Online test assigned. Please complete before the deadline.'
  );

  // Application 3: Sreehari applied to Microsoft -> APPLIED
  insertApp.run(
    msftInternshipId,
    sreehariId,
    'APPLIED',
    '2026-11-06 16:45:00',
    null,
    'Application submitted. Profile under initial screening.'
  );

  // Application 4: Ananya applied to Google Cloud -> SELECTED
  const appAnanyaGoogle = insertApp.run(
    googleInternshipId,
    ananyaId,
    'SELECTED',
    '2026-10-25 11:00:00',
    19.0,
    'Final offer rolled out! Verification and onboarding initiated.'
  );
  const attemptAnanya = insertAttempt.run(
    googleTestId,
    ananyaId,
    appAnanyaGoogle.lastInsertRowid,
    '2026-10-26 15:00:00',
    '2026-10-26 15:21:10',
    1270,
    'COMPLETED',
    19.0,
    20.0,
    95.0,
    1,
    JSON.stringify({ 1: 1, 2: 1, 3: 0, 4: 2, 5: 1, 6: 2, 7: 0, 8: 1, 9: 1, 10: 1 }),
    0,
    JSON.stringify([])
  );
  db.raw.prepare('UPDATE applications SET test_attempt_id = ? WHERE id = ?').run(attemptAnanya.lastInsertRowid, appAnanyaGoogle.lastInsertRowid);

  // Application 5: Rohit applied to Tata Elxsi -> UNDER_REVIEW
  insertApp.run(
    tataInternshipId,
    rohitId,
    'UNDER_REVIEW',
    '2026-11-04 12:00:00',
    8.5,
    'Aptitude cleared. Hardware interview pending.'
  );

  // 8. Notifications for Sreehari
  const insertNotif = db.raw.prepare(`
    INSERT INTO notifications (user_id, title, message, link, is_read)
    VALUES (?, ?, ?, ?, ?)
  `);

  insertNotif.run(
    sreehariId,
    '🎉 Congratulations! Shortlisted by Google Cloud',
    'You scored 90% (18/20) in the Google Cloud SWE Intern Assessment and have been shortlisted for technical interviews!',
    '/student/applications',
    0
  );

  insertNotif.run(
    sreehariId,
    '📝 Action Required: Online Test for Zerodha Tech',
    'Zerodha Tech has invited you to take the Full-Stack Engineering Assessment (25 minutes). You can start the proctored test now.',
    '/student/applications',
    0
  );

  insertNotif.run(
    sreehariId,
    '✅ Profile Verified',
    'Your student profile (Reg: CCE25CS231) has been verified by the College Placement Cell.',
    '/student/profile',
    1
  );

  // 9. Activity Logs
  const insertLog = db.raw.prepare(`
    INSERT INTO activity_logs (user_id, action, details)
    VALUES (?, ?, ?)
  `);
  insertLog.run(adminId, 'VERIFY_COMPANY', 'Verified Google Cloud India recruiter account');
  insertLog.run(adminId, 'VERIFY_COMPANY', 'Verified Microsoft IDC recruiter account');
  insertLog.run(adminId, 'SYSTEM_INIT', 'College Placement Portal Database Seed Completed');

  console.log('✅ Database seeded successfully with realistic, high-quality data!');
  console.log('----------------------------------------------------');
  console.log('Credentials for immediate testing:');
  console.log('👑 Admin:     admin@college.edu      / Admin@123');
  console.log('🏢 Company:   recruitment@google.com / Google@123');
  console.log('🏢 Company:   hiring@zerodha.com     / Zerodha@123');
  console.log('🎓 Student:   sreehari@college.edu   / Student@123 (Sreehari Nikathil - CCE25CS231)');
  console.log('----------------------------------------------------');
}

if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };

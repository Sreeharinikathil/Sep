# Comprehensive Viva-Voce & Technical Defense Guide

**Project Title:** Internship Management with Online Test for Selection  
**Candidate Name:** SREEHARI NIKATHIL  
**Register Number:** CCE25CS231  
**Subject:** Software Engineering Project (SEP) &bull; Computer Science & Engineering  

---

## 🎯 1. Elevator Pitch (How to Introduce Your Project)

> *"Good morning respected examiners. My project is **NextStep: Internship Management with Online Test for Selection**.*
>
> *In traditional campus recruitment, placement cells struggle with fragmented spreadsheets, unverified external recruiter drives, and manual aptitude tests that waste weeks of faculty time. My system unifies the entire pipeline into an automated web ecosystem.*
>
> *It supports three distinct user roles: College Administrators, Company Recruiters, and Students. The crowning flagship module is our **Proctored Online Test Engine**, which enforces strict browser-level anti-cheat controls (fullscreen lock, tab-switch tracking, right-click blocking, webcam monitoring) and performs instant auto-evaluation of objective technical questions with detailed percentile scoring and solution reviews.*
>
> *I designed the system using React, Node.js REST APIs, and an embedded transactional SQLite database configured with Write-Ahead Logging for high reliability."*

---

## 🏗️ 2. Architectural Decisions & Justifications

### Q1: Why did you choose React + Node.js (Express) instead of a monolithic template framework (like PHP or standard Django templates)?
**Answer:**
- **Separation of Concerns:** Clear boundary between presentation logic (React client) and business logic (Express REST API). The backend can serve mobile applications or third-party webhooks in the future without refactoring.
- **Single Page Application (SPA) Experience:** The online test engine requires smooth, latency-free question switching, dynamic timers, and instant state caching without causing full browser page reloads that could interrupt examination focus.
- **Stateless RESTful APIs:** Using JWT authentication allows stateless API requests, reducing server memory overhead compared to traditional server-side session stores.

### Q2: Why did you choose SQLite with WAL mode rather than MySQL or PostgreSQL?
**Answer:**
- **Zero-Configuration Deployment:** SQLite is an embedded database that requires no external database daemon, eliminating socket connection errors, database port conflicts, and user permission misconfigurations during university evaluations.
- **ACID Compliance:** SQLite provides full ACID (Atomicity, Consistency, Isolation, Durability) guarantees.
- **Write-Ahead Logging (WAL Mode):** In standard rollback journal mode, read and write operations lock the database exclusively. By executing `PRAGMA journal_mode = WAL;`, readers do not block writers and writers do not block readers, providing high concurrent read performance suitable for campus-scale examinations.
- **Relational Integrity:** We explicitly enable `PRAGMA foreign_keys = ON;` to enforce foreign key constraints, cascading deletions, and referential integrity across users, internships, applications, and test attempts.

### Q3: How is the Proctored Online Test protected against cheating?
**Answer:**
The proctoring system implements defense-in-depth:
1. **Fullscreen Enforcement:** Before the candidate can view questions, the browser's Fullscreen API (`document.documentElement.requestFullscreen()`) is invoked.
2. **Tab-Switch & Focus Loss Tracking:** We listen to browser events:
   - `document.addEventListener('visibilitychange')`: Detects when a student changes browser tabs, minimizes the window, or switches to another application.
   - `window.addEventListener('blur')`: Detects loss of window focus.
3. **Progressive Warning Policy:** Every violation triggers an immediate API call (`/api/tests/:id/proctoring-violation`), incrementing the candidate's violation counter on the server. A modal alerts the student (`Warning 1/3`). If the candidate exceeds 3 strikes, the server immediately marks the attempt as `DISQUALIFIED` and auto-submits.
4. **Clipboard & DevTools Blocking:** `contextmenu` (right click) and common keyboard shortcuts (`Ctrl+C`, `Ctrl+V`, `Ctrl+U`, `F12`) are intercepted and prevented.
5. **Security of Question Data:** The `/take` API endpoint explicitly strips out correct answer indices and explanations before sending the payload to the browser. Thus, a candidate inspecting the Network tab in DevTools cannot find the answers.

### Q4: How does the Auto-Evaluation Engine work?
**Answer:**
When a student submits the test or time runs out:
1. The client transmits the candidate's answer map `{ [questionId]: selectedOptionIndex }`.
2. The server loads the authentic answer keys directly from the database (never relying on client calculations).
3. For each question, it verifies if the choice matches the correct index.
4. Correct answers award positive marks; wrong answers apply optional negative marking (e.g. -0.5 marks); unattempted questions incur no penalty.
5. Overall score and percentage are computed and compared against the company's `passing_percentage`.
6. If percentage $\ge$ cutoff, the application status updates to `SHORTLISTED`; otherwise `UNDER_REVIEW`.
7. An automated notification is sent to the student's dashboard.

### Q5: How is Candidate Eligibility enforced?
**Answer:**
Eligibility is verified both on the UI and in the backend controller:
- When a student applies (`POST /api/applications`), the backend compares `student_profiles.cgpa` against `internships.min_cgpa`.
- If the student's CGPA is below the minimum requirement, the server returns an HTTP 400 Bad Request explaining the shortfall.
- On the frontend, a visual eligibility badge warns students in advance whether they meet the cutoff criteria.

---

## 🛡️ 3. Security & Best Practices Implemented

1. **Password Hashing:** Passwords are never stored in plaintext. They are salted and hashed using `bcryptjs` with 10 salt rounds.
2. **JWT Authentication:** Tokens are signed with a secure secret key and set to expire after 7 days. Middleware verifies the token signature on every protected request.
3. **Role-Based Access Control (RBAC):** Custom Express middleware (`requireRole('COMPANY', 'ADMIN')`) guards sensitive endpoints such as posting internships, adding questions, or modifying candidate statuses.
4. **Input Sanitization & Parameterized Queries:** All database queries utilize parameterized prepared statements (`db.prepare('... WHERE id = ?').get(...)`), rendering SQL Injection attacks impossible.
5. **Safe File Uploads:** Multer validates file extensions (`.pdf`, `.docx`) and enforces a 5MB size limit to prevent Denial of Service via large payload uploads.

---

## 📊 4. Database Schema Summary (Normalization)

- **1NF:** All attributes are atomic (no repeating groups).
- **2NF:** All non-key attributes are fully functionally dependent on primary keys.
- **3NF:** No transitive functional dependencies exist (e.g., student degree and CGPA belong to `student_profiles` keyed by `user_id`, not duplicated across applications).

---

## 💡 5. Rapid Feature Walkthrough for the Examiner

1. **Start on Home Page:** Show the statistics banner, live openings, and the 5-module project layout.
2. **Viva Role Switcher (Top Bar):**
   - Click **"Student (Sreehari)"**: Navigate to **My Applications**. Show the shortlisted status for Google Cloud (scored 90%) and the pending test for Zerodha Tech.
   - Click **"Launch Online Assessment"**: Walk through the pre-test instructions, fullscreen entry, question palette navigation, and instant auto-evaluation scorecard with conceptual solutions!
   - Click **"Recruiter (Google)"**: Open the **Recruiter Hub**. Show the applicants table, filter candidates by CGPA, preview resumes, and update application status with recruiter feedback.
   - Click **"Question Bank"**: Show how technical questions are categorized with difficulty ratings, marks, and explanations.
   - Click **"College Admin"**: Display campus placement statistics, department-wise placement conversion, and the recruiter verification toggle.

const API_BASE = '/api';

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    ...options.headers
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Do not set Content-Type if sending FormData (browser sets boundary automatically)
  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data.error || data.message || `Request failed with status ${response.status}`;
    const error = new Error(errorMsg);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  // Auth
  login: (credentials) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  register: (userData) => request('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
  getMe: () => request('/auth/me'),
  demoLogin: (demoRole) => request('/auth/demo-login', { method: 'POST', body: JSON.stringify({ demoRole }) }),

  // Internships
  getInternships: (params = '') => request(`/internships${params ? `?${params}` : ''}`),
  getInternshipById: (id) => request(`/internships/${id}`),
  getMyPostings: () => request('/internships/company/my-postings'),
  createInternship: (data) => request('/internships', { method: 'POST', body: JSON.stringify(data) }),
  updateInternship: (id, data) => request(`/internships/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteInternship: (id) => request(`/internships/${id}`, { method: 'DELETE' }),

  // Applications
  applyForInternship: (internship_id) => request('/applications', { method: 'POST', body: JSON.stringify({ internship_id }) }),
  getMyApplications: () => request('/applications/my-applications'),
  getApplicantsForInternship: (internshipId) => request(`/applications/internship/${internshipId}`),
  updateApplicantStatus: (id, statusData) => request(`/applications/${id}/status`, { method: 'PATCH', body: JSON.stringify(statusData) }),

  // Tests & Proctoring
  getTests: () => request('/tests'),
  getTestById: (id) => request(`/tests/${id}`),
  createTest: (data) => request('/tests', { method: 'POST', body: JSON.stringify(data) }),
  updateTest: (id, data) => request(`/tests/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteTest: (id) => request(`/tests/${id}`, { method: 'DELETE' }),
  startTestAttempt: (id) => request(`/tests/${id}/take`),
  logProctoringViolation: (id, data) => request(`/tests/${id}/proctoring-violation`, { method: 'POST', body: JSON.stringify(data) }),
  submitTest: (id, data) => request(`/tests/${id}/submit`, { method: 'POST', body: JSON.stringify(data) }),
  getTestResult: (testId, attemptId) => request(`/tests/${testId}/result/${attemptId}`),

  // Question Bank
  getQuestions: (params = '') => request(`/questions${params ? `?${params}` : ''}`),
  getQuestionSummary: () => request('/questions/summary'),
  createQuestion: (data) => request('/questions', { method: 'POST', body: JSON.stringify(data) }),
  updateQuestion: (id, data) => request(`/questions/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteQuestion: (id) => request(`/questions/${id}`, { method: 'DELETE' }),

  // Profiles
  getStudentProfile: () => request('/students/profile'),
  updateStudentProfile: (data) => request('/students/profile', { method: 'PUT', body: JSON.stringify(data) }),
  uploadResume: (formData) => request('/students/upload-resume', { method: 'POST', body: formData }),

  getCompanyProfile: () => request('/companies/profile'),
  updateCompanyProfile: (data) => request('/companies/profile', { method: 'PUT', body: JSON.stringify(data) }),
  getCompanies: () => request('/companies'),

  // Admin
  getAdminStats: () => request('/admin/stats'),
  getAdminCompanies: () => request('/admin/companies'),
  toggleCompanyVerification: (id, is_verified) => request(`/admin/companies/${id}/verify`, { method: 'PATCH', body: JSON.stringify({ is_verified }) }),
  getAdminStudents: () => request('/admin/students'),
  getActivityLogs: () => request('/admin/activity-logs')
};

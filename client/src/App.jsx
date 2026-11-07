import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Layout Components
import DemoBanner from './components/DemoBanner';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';

// Student Pages
import BrowseInternships from './pages/student/BrowseInternships';
import InternshipDetails from './pages/student/InternshipDetails';
import MyApplications from './pages/student/MyApplications';
import StudentProfile from './pages/student/StudentProfile';
import TestPortal from './pages/student/TestPortal';
import TestResult from './pages/student/TestResult';

// Company Pages
import CompanyDashboard from './pages/company/CompanyDashboard';
import CreateInternship from './pages/company/CreateInternship';
import ManageApplicants from './pages/company/ManageApplicants';
import QuestionBank from './pages/company/QuestionBank';
import ManageTests from './pages/company/ManageTests';
import CreateTest from './pages/company/CreateTest';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import VerifyCompanies from './pages/admin/VerifyCompanies';
import AllStudents from './pages/admin/AllStudents';

export default function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
        {/* Fast-Track Examiner Role Switcher Bar */}
        <DemoBanner />

        {/* Dynamic Role-Based Navbar */}
        <Navbar />

        {/* Main Content Viewport */}
        <main className="flex-1">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/internships" element={<BrowseInternships />} />
            <Route path="/internships/:id" element={<InternshipDetails />} />

            {/* Student Protected Routes */}
            <Route
              path="/student/applications"
              element={
                <ProtectedRoute allowedRoles={['STUDENT']}>
                  <MyApplications />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/profile"
              element={
                <ProtectedRoute allowedRoles={['STUDENT']}>
                  <StudentProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/test/:id"
              element={
                <ProtectedRoute allowedRoles={['STUDENT']}>
                  <TestPortal />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/test-result/:attemptId"
              element={
                <ProtectedRoute allowedRoles={['STUDENT', 'COMPANY', 'ADMIN']}>
                  <TestResult />
                </ProtectedRoute>
              }
            />

            {/* Company Protected Routes */}
            <Route
              path="/company/dashboard"
              element={
                <ProtectedRoute allowedRoles={['COMPANY', 'ADMIN']}>
                  <CompanyDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/company/post-internship"
              element={
                <ProtectedRoute allowedRoles={['COMPANY', 'ADMIN']}>
                  <CreateInternship />
                </ProtectedRoute>
              }
            />
            <Route
              path="/company/applicants"
              element={
                <ProtectedRoute allowedRoles={['COMPANY', 'ADMIN']}>
                  <ManageApplicants />
                </ProtectedRoute>
              }
            />
            <Route
              path="/company/question-bank"
              element={
                <ProtectedRoute allowedRoles={['COMPANY', 'ADMIN']}>
                  <QuestionBank />
                </ProtectedRoute>
              }
            />
            <Route
              path="/company/tests"
              element={
                <ProtectedRoute allowedRoles={['COMPANY', 'ADMIN']}>
                  <ManageTests />
                </ProtectedRoute>
              }
            />
            <Route
              path="/company/create-test"
              element={
                <ProtectedRoute allowedRoles={['COMPANY', 'ADMIN']}>
                  <CreateTest />
                </ProtectedRoute>
              }
            />

            {/* Admin Protected Routes */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/companies"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <VerifyCompanies />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/students"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AllStudents />
                </ProtectedRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {/* Global Footer */}
        <Footer />
      </div>
    </AuthProvider>
  );
}

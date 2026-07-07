import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import './assets/styles/global.css';

// Components
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Screens - Users
import Login from './screens/users/Login';
import Register from './screens/users/Register';
import Dashboard from './screens/users/Dashboard';
import Assessment from './screens/users/Assessment';
import AssessmentResults from './screens/users/AssessmentResults';
import TherapistList from './screens/users/TherapistList';
import BookSession from './screens/users/BookSession';
import MySessions from './screens/users/MySessions';
import Messages from './screens/users/Messages';
import Profile from './screens/users/Profile';

// Screens - Therapists
import TherapistDashboard from './screens/therapists/TherapistDashboard';
import TherapistSessions from './screens/therapists/TherapistSessions';
import TherapistStudents from './screens/therapists/TherapistStudents';
import TherapistMessages from './screens/therapists/TherapistMessages';
import AvailabilityManager from './screens/therapists/AvailabilityManager';
import Reports from './screens/therapists/Reports';

// Screens - Admin
import AdminDashboard from './screens/admin/AdminDashboard';
import UserManagement from './screens/admin/UserManagement';
import ReportsAnalytics from './screens/admin/ReportsAnalytics';
import SystemSettings from './screens/admin/SystemSettings';

// Screens - Parent
import ParentDashboard from './screens/parent/ParentDashboard';
import ParentNotifications from './screens/parent/ParentNotifications';

function App() {
  useEffect(() => {
    // Load Inter font
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }, []);

  return (
    <BrowserRouter>
      <div className="app">
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 5000,
            style: {
              background: '#fff',
              color: '#1f2937',
              padding: '16px',
              borderRadius: '8px',
              boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'
            }
          }}
        />
        <Navbar />
        <main className="main-content">
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<Navigate to="/login" />} />

            {/* Student Routes */}
            <Route element={<ProtectedRoute allowedRoles={['student']} />}>
              <Route path="/student/dashboard" element={<Dashboard />} />
              <Route path="/student/assessment" element={<Assessment />} />
              <Route path="/student/assessment/results" element={<AssessmentResults />} />
              <Route path="/student/therapists" element={<TherapistList />} />
              <Route path="/student/book-session/:therapistId?" element={<BookSession />} />
              <Route path="/student/sessions" element={<MySessions />} />
              <Route path="/student/messages" element={<Messages />} />
              <Route path="/student/profile" element={<Profile />} />
            </Route>

            {/* Therapist Routes */}
            <Route element={<ProtectedRoute allowedRoles={['therapist']} />}>
              <Route path="/therapist/dashboard" element={<TherapistDashboard />} />
              <Route path="/therapist/sessions" element={<TherapistSessions />} />
              <Route path="/therapist/students" element={<TherapistStudents />} />
              <Route path="/therapist/messages" element={<TherapistMessages />} />
              <Route path="/therapist/availability" element={<AvailabilityManager />} />
              <Route path="/therapist/reports" element={<Reports />} />
            </Route>

            {/* Admin Routes */}
            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<UserManagement />} />
              <Route path="/admin/reports" element={<ReportsAnalytics />} />
              <Route path="/admin/settings" element={<SystemSettings />} />
            </Route>

            {/* Parent Routes */}
            <Route element={<ProtectedRoute allowedRoles={['parent']} />}>
              <Route path="/parent/dashboard" element={<ParentDashboard />} />
              <Route path="/parent/notifications" element={<ParentNotifications />} />
            </Route>

            {/* 404 */}
            <Route path="*" element={<div>Page not found</div>} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
import React, { useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Header from './components/common/Header';
import Sidebar from './components/common/Sidebar';

// Public pages
import LandingPage from './pages/public/LandingPage';
import LoginPage from './pages/public/LoginPage';
import RegisterPage from './pages/public/RegisterPage';

// Seeker pages
import Dashboard from './pages/seeker/Dashboard';
import ProfilePage from './pages/seeker/ProfilePage';
import ResumeUploadPage from './pages/seeker/ResumeUploadPage';
import JobSearchPage from './pages/seeker/JobSearchPage';
import JobDetailsPage from './pages/seeker/JobDetailsPage';
import RecommendationsPage from './pages/seeker/RecommendationsPage';
import SkillGapPage from './pages/seeker/SkillGapPage';
import LearningPage from './pages/seeker/LearningPage';
import RoadmapPage from './pages/seeker/RoadmapPage';
import ApplicationsPage from './pages/seeker/ApplicationsPage';
import SavedJobsPage from './pages/seeker/SavedJobsPage';
import SettingsPage from './pages/seeker/SettingsPage';

/** Shell layout shared by all authenticated pages */
function AppShell() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

/** Redirect unauthenticated users to /login */
function ProtectedRoute() {
  const { user, loading } = useContext(AuthContext);
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-slate-400 text-sm animate-pulse">Loading…</div>
      </div>
    );
  }
  return user ? <Outlet /> : <Navigate to="/login" replace />;
}

/** Redirect already-logged-in users away from auth pages */
function GuestRoute() {
  const { user, loading } = useContext(AuthContext);
  if (loading) return null;
  return user ? <Navigate to="/dashboard" replace /> : <Outlet />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* ── Guest-only pages ── */}
          <Route element={<GuestRoute />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>

          {/* ── Authenticated pages ── */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppShell />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/resume" element={<ResumeUploadPage />} />
              <Route path="/jobs" element={<JobSearchPage />} />
              <Route path="/jobs/:id" element={<JobDetailsPage />} />
              <Route path="/recommendations" element={<RecommendationsPage />} />
              <Route path="/skill-gap" element={<SkillGapPage />} />
              <Route path="/learning" element={<LearningPage />} />
              <Route path="/roadmap" element={<RoadmapPage />} />
              <Route path="/applications" element={<ApplicationsPage />} />
              <Route path="/saved-jobs" element={<SavedJobsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>
          </Route>

          {/* ── Fallback ── */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

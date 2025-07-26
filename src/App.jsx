import React, { useState, useEffect } from 'react'
import { 
  User, 
  BarChart3, 
  GraduationCap, 
  Mail, 
  Search, 
  Bell, 
  Settings, 
  BookOpen, 
  Briefcase, 
  Users, 
  TrendingUp, 
  Award,
  Calendar,
  MapPin,
  Star,
  ChevronRight,
  Clock,
  Bookmark,
  Eye,
  Heart,
  MessageCircle,
  Filter,
  Download,
  Share2
} from 'lucide-react'
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { useSettings } from './hooks/useSettings'
import LandingPage from './LandingPage'
import LoginForm from './components/auth/LoginForm'
import SignupForm from './components/auth/SignupForm'
import RefugeeDashboard from './components/dashboard/RefugeeDashboard'
import ProviderDashboard from './components/dashboard/ProviderDashboard'
import AdminDashboard from './components/dashboard/AdminDashboard'

import OpportunityDetails from './components/opportunities/OpportunityDetails'
import ProfileViewPage from './components/profiles/ProfileViewPage'
import CreateProfile from './components/profiles/CreateProfile'

// Settings Provider Component
function SettingsProvider({ children }) {
  const { settings } = useSettings();
  
  // Apply settings to the entire app
  useEffect(() => {
    if (settings) {
      // Force light theme - disable dark mode
      const root = document.documentElement;
      root.classList.remove('dark', 'theme-dark', 'theme-auto');
      root.classList.add('theme-light');

      // Apply language
      if (settings.preferences?.language) {
        document.documentElement.lang = settings.preferences.language;
      }
    }
  }, [settings]);

  return children;
}

function AppRouter() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginForm />} />
            <Route path="/signup" element={<SignupForm />} />
            <Route
              path="/refugee-dashboard"
              element={
                <ProtectedRoute role="refugee">
                  <RefugeeDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/provider-dashboard"
              element={
                <ProtectedRoute role="provider">
                  <ProviderDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin-dashboard"
              element={
                <ProtectedRoute role="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/create-profile"
              element={
                <ProtectedRoute role="refugee">
                  <CreateProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/opportunity/:id"
              element={
                <ProtectedRoute>
                  <OpportunityDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile/:id"
              element={
                <ProtectedRoute>
                  <ProfileViewPage />
                </ProtectedRoute>
              }
            />
            {/* Add more routes as needed */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </SettingsProvider>
    </AuthProvider>
  )
}

// Protected route component
function ProtectedRoute({ children, role }) {
  const { user, loading, isAuthenticated, getRedirectPath } = useAuth()
  const navigate = useNavigate()
  
  // Debug logging
  console.log('ProtectedRoute:', { 
    role, 
    userRole: user?.role, 
    isAuthenticated, 
    loading, 
    hasProfile: user?.hasProfile,
    pathname: window.location.pathname 
  });
  
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  if (!isAuthenticated) return <Navigate to="/login" replace />
  
  // Check role-specific requirements
  if (role && user?.role !== role) {
    console.log('Role mismatch:', { expected: role, actual: user?.role });
    return <Navigate to="/" replace />
  }
  
  // For refugee routes, check profile status
  if (role === 'refugee') {
    const currentPath = window.location.pathname;
    
    // If user doesn't have a profile and is trying to access refugee dashboard
    if (currentPath === '/refugee-dashboard' && !user?.hasProfile) {
      console.log('Refugee without profile trying to access dashboard, redirecting to create-profile');
      navigate('/create-profile', { replace: true });
      return <div className="min-h-screen flex items-center justify-center">Redirecting to create profile...</div>;
    }
    
    // If user has a profile and is trying to access create-profile
    if (currentPath === '/create-profile' && user?.hasProfile) {
      console.log('Refugee with profile trying to access create-profile, redirecting to dashboard');
      navigate('/refugee-dashboard', { replace: true });
      return <div className="min-h-screen flex items-center justify-center">Redirecting to dashboard...</div>;
    }
  }
  

  
  return <>{children}</>
}

export default AppRouter 
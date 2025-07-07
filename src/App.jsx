import React, { useState } from 'react'
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
import LandingPage from './LandingPage'
import LoginForm from './components/auth/LoginForm'
import SignupForm from './components/auth/SignupForm'
import RefugeeDashboard from './components/dashboard/RefugeeDashboard'
import ProviderDashboard from './components/dashboard/ProviderDashboard'
import AdminDashboard from './components/dashboard/AdminDashboard'

import OpportunityDetails from './components/opportunities/OpportunityDetails'
import ProfileViewPage from './components/profiles/ProfileViewPage'
import CreateProfile from './components/profiles/CreateProfile'

function AppRouter() {
  return (
    <AuthProvider>
      <Router>
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
              <ProtectedRoute role="refugee">
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
    </AuthProvider>
  )
}

// Protected route component
function ProtectedRoute({ children, role }) {
  const { user, loading, isAuthenticated, getRedirectPath } = useAuth()
  const navigate = useNavigate()
  
  // Debug logging
  console.log('ProtectedRoute:', { role, userRole: user?.role, isAuthenticated, loading, hasProfile: user?.hasProfile });
  
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (role && user?.role !== role) {
    console.log('Role mismatch:', { expected: role, actual: user?.role });
    return <Navigate to="/" replace />
  }
  

  
  return <>{children}</>
}

export default AppRouter 
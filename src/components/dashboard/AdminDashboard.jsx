import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useUsers } from '../../hooks/useUsers';
import { useProfiles } from '../../hooks/useProfiles';
import { useOpportunities } from '../../hooks/useOpportunities';
import { useNotifications } from '../../hooks/useNotifications';
import { usePlatformStats } from '../../hooks/usePlatformStats';
import { useApplications } from '../../hooks/useApplications';
import { 
  Home, 
  Users, 
  UserCheck, 
  Shield, 
  FileText, 
  AlertTriangle, 
  BarChart3, 
  Settings, 
  MessageCircle, 
  Bell, 
  Lock, 
  Activity, 
  Database, 
  Flag, 
  Eye, 
  UserX, 
  CheckCircle, 
  XCircle, 
  Clock,
  HelpCircle,
  ChevronRight,
  ChevronDown,
  Search,
  Filter,
  Download,
  Mail,
  Globe,
  TrendingUp,
  LogOut,
  Edit,
  Trash2,
  MoreVertical,
  RefreshCw,
  User,
  GraduationCap,
  BookOpen,
  Briefcase,
  Award,
  Calendar,
  MapPin,
  Star,
  Bookmark,
  Heart,
  Share2,
  Plus,
  AlertCircle,
  Phone
} from 'lucide-react';

// Error Alert Component
const ErrorAlert = ({ message, onRetry }) => (
  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
    <div className="flex items-center">
      <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
      <div className="flex-1">
        <h3 className="text-sm font-medium text-red-800">Error</h3>
        <p className="text-sm text-red-700 mt-1">{message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="ml-4 bg-red-100 text-red-700 px-3 py-1 rounded-md text-sm hover:bg-red-200"
        >
          Retry
        </button>
      )}
    </div>
  </div>
);

const AdminDashboard = () => {
  const [activeItem, setActiveItem] = useState('overview');
  const [expandedSections, setExpandedSections] = useState({
    users: true,
    content: true,
    security: true,
    analytics: true
  });

  const { logout, user, loading } = useAuth();
  const navigate = useNavigate();
  const { notifications } = useNotifications();
  const { users, loading: usersLoading, error: usersError, fetchUsers, updateUserStatus, deleteUser, refetchUsers } = useUsers();
  // Use profiles data for profiles section to show refugees who have created profiles
  const { profiles: refugeeProfiles, loading: profilesLoading, error: profilesError, fetchProfiles, deleteProfile, refetchProfiles } = useProfiles();
  const { opportunities, loading: opportunitiesLoading, error: opportunitiesError, fetchOpportunities, deleteOpportunity, updateOpportunityStatus, refetch: refetchOpportunities } = useOpportunities({});
  const { stats, loading: statsLoading, error: statsError, refetchStats } = usePlatformStats();
  const { applications, loading: applicationsLoading, error: applicationsError, refetch: refetchApplications } = useApplications();

  // Auto-refresh data every 30 seconds when on overview
  useEffect(() => {
    if (activeItem === 'overview') {
      const interval = setInterval(() => {
        fetchUsers();
        fetchOpportunities();
        fetchProfiles();
        refetchStats();
        refetchApplications();
      }, 30000); // Refresh every 30 seconds

      return () => clearInterval(interval);
    }
  }, [activeItem, fetchUsers, fetchOpportunities, fetchProfiles, refetchStats, refetchApplications]);

  // Calculate unread notifications count
  const unreadNotificationsCount = useMemo(() => {
    return notifications.filter(notification => !notification.isRead).length;
  }, [notifications]);

  // User management state
  const [selectedUser, setSelectedUser] = useState(null);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    role: '',
    search: ''
  });

  // Opportunity management state
  const [opportunityFilters, setOpportunityFilters] = useState({
    type: '',
    status: '',
    search: ''
  });
  const [editingOpportunity, setEditingOpportunity] = useState(null); // Placeholder for edit modal
  const [profilesLoaded, setProfilesLoaded] = useState(false);
  
  // Get display name from profile data
  const getDisplayName = useCallback((profile) => {
    if (profile.fullName) {
      return profile.fullName;
    }
    if (profile.firstName && profile.lastName) {
      return `${profile.firstName} ${profile.lastName}`;
    }
    if (profile.firstName) {
      return profile.firstName;
    }
    if (profile.lastName) {
      return profile.lastName;
    }
    return 'Unknown User';
  }, []);
  
  // Memoize profile statistics to prevent unnecessary recalculations
  const profileStats = useMemo(() => {
    // Count refugee profiles that have been created
    const total = refugeeProfiles.length;
    const refugees = refugeeProfiles.filter(p => p.user?.role === 'refugee').length;
    const providers = refugeeProfiles.filter(p => p.user?.role === 'provider').length;
    const admins = refugeeProfiles.filter(p => p.user?.role === 'admin').length;
    
    return { total, refugees, providers, admins };
  }, [refugeeProfiles]);

  // Memoize profiles array to prevent unnecessary re-renders
  const memoizedProfiles = useMemo(() => refugeeProfiles, [refugeeProfiles]);

  // Defensive loading state (must be after all hooks)
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading user...</div>;
  if (!user) return <div className="min-h-screen flex items-center justify-center text-red-600">User not found. Please log in again.</div>;
  
  // Debug logging to prevent infinite re-renders
  console.log('AdminDashboard render - user:', user?._id, 'activeItem:', activeItem);

  const toggleSection = useCallback((section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  }, []);

  // Sidebar main categories only
  const navigationItems = useMemo(() => [
    { id: 'overview', label: 'Dashboard Overview', icon: Home },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'opportunities', label: 'Opportunities', icon: Briefcase },
    { id: 'profiles', label: 'Profiles', icon: User },
    { 
      id: 'notifications', 
      label: 'Notifications', 
      icon: Bell,
      badge: unreadNotificationsCount > 0 ? unreadNotificationsCount : null
    },
    { id: 'reports', label: 'Reports', icon: TrendingUp },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'support', label: 'Help & Support', icon: HelpCircle }
  ], [unreadNotificationsCount]);

  // Sidebar rendering (no dropdowns)
  const renderMenuItem = useCallback((item) => {
    const Icon = item.icon;
    const isActive = activeItem === item.id;
    return (
      <div key={item.id} className="mb-2">
        <button
          onClick={() => setActiveItem(item.id)}
          className={`w-full flex items-center justify-between px-4 py-3 text-left text-sm rounded-lg transition-all duration-200 ${
            isActive 
              ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-500 shadow-sm' 
              : 'text-gray-700 hover:bg-gray-50 hover:border-l-4 hover:border-gray-200'
          }`}
        >
          <div className="flex items-center">
            <Icon className={`h-5 w-5 mr-3 ${isActive ? 'text-blue-600' : 'text-gray-500'}`} />
            <div className="font-medium">{item.label}</div>
          </div>
          {item.badge && (
            <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full min-w-[20px] text-center">
              {item.badge}
            </span>
          )}
        </button>
      </div>
    );
  }, [activeItem]);

  // Handle user status update
  const handleUserStatusUpdate = useCallback(async (userId, newStatus) => {
    try {
      await updateUserStatus(userId, newStatus);
      // No need to refetch - the hook will update the local state
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  }, [updateUserStatus]);

  // Handle user deletion
  const handleUserDelete = useCallback(async (userId) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        await deleteUser(userId);
        // No need to refetch - the hook will update the local state
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  }, [deleteUser]);

  // Handle profile deletion
  const handleProfileDelete = useCallback(async (profileId) => {
    if (window.confirm('Are you sure you want to delete this profile? This action cannot be undone.')) {
      try {
        await deleteProfile(profileId);
        // No need to refetch - the hook will update the local state
      } catch (error) {
        console.error('Error deleting profile:', error);
      }
    }
  }, [deleteProfile]);

  // Handle opportunity deletion
  const handleOpportunityDelete = useCallback(async (opportunityId) => {
    if (window.confirm('Are you sure you want to delete this opportunity? This action cannot be undone.')) {
      try {
        await deleteOpportunity(opportunityId);
        // No need to refetch - the hook will update the local state
      } catch (error) {
        console.error('Error deleting opportunity:', error);
      }
    }
  }, [deleteOpportunity]);

  // Handle opportunity status update
  const handleOpportunityStatusUpdate = useCallback(async (opportunityId, newStatus) => {
    try {
      await updateOpportunityStatus(opportunityId, newStatus);
      // No need to refetch - the hook will update the local state
    } catch (error) {
      console.error('Error updating opportunity status:', error);
    }
  }, [updateOpportunityStatus]);



  // Apply filters
  useEffect(() => {
    fetchUsers(filters);
  }, [filters, fetchUsers]);

  // Apply opportunity filters
  useEffect(() => {
    if (typeof fetchOpportunities === 'function') {
      fetchOpportunities(opportunityFilters);
    }
  }, [opportunityFilters, fetchOpportunities]);

  // Load profiles and opportunities once when component mounts
  useEffect(() => {
    const loadData = async () => {
      try {
        await fetchProfiles();
        setProfilesLoaded(true);
      } catch (error) {
        console.error('Error loading profiles:', error);
        setProfilesLoaded(true); // Set to true even on error to prevent infinite loading
      }
      fetchOpportunities();
    };
    loadData();
  }, []); // Remove dependencies to prevent re-fetching on every render

  // Main content area
  const renderMainContent = () => {
    if (activeItem === 'overview') {
      // Calculate real-time stats from loaded data
      const totalUsers = users.length;
      const activeOpportunities = opportunities.filter(opp => opp.status === 'active' || opp.isActive === true).length;
      const refugeeProfilesCount = refugeeProfiles.filter(p => p.user?.role === 'refugee').length;
      const pendingApprovals = users.filter(u => u.isActive === true && u.isVerified === false).length;
      const numRefugees = users.filter(u => u.role === 'refugee' && u.isActive === true).length;
      const numProviders = users.filter(u => u.role === 'provider' && u.isActive === true).length;
      const numAdmins = users.filter(u => u.role === 'admin' && u.isActive === true).length;
      const recentUsers = users.filter(u => u.isActive === true).slice(0, 5);
      
      // Additional real-time metrics
      const totalApplications = applications.length;
      const pendingApplications = applications.filter(app => app.status === 'pending').length;
      const acceptedApplications = applications.filter(app => app.status === 'accepted').length;
      const rejectedApplications = applications.filter(app => app.status === 'rejected').length;
      const totalOpportunities = opportunities.length;
      const draftOpportunities = opportunities.filter(opp => opp.status === 'draft').length;
      const closedOpportunities = opportunities.filter(opp => opp.status === 'closed').length;

      return (
        <div className="space-y-6">
          {/* Stats Cards */}
          {statsLoading || usersLoading || opportunitiesLoading || profilesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-white p-6 rounded-lg border">
                  <div className="animate-pulse">
                    <div className="flex items-center">
                      <div className="p-2 bg-gray-200 rounded-lg w-10 h-10"></div>
                      <div className="ml-4 flex-1">
                        <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                        <div className="h-8 bg-gray-200 rounded w-16"></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div>
              {/* Refresh Button */}
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Dashboard Overview</h2>
                <button
                  onClick={() => {
                    fetchUsers();
                    fetchOpportunities();
                    fetchProfiles();
                    refetchStats();
                    refetchApplications();
                  }}
                  className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Data
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Users</p>
                      <p className="text-2xl font-bold text-gray-900">{totalUsers}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Briefcase className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Active Opportunities</p>
                      <p className="text-2xl font-bold text-gray-900">{activeOpportunities}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                  <div className="flex items-center">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <User className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Refugee Profiles</p>
                      <p className="text-2xl font-bold text-gray-900">{refugeeProfilesCount}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                  <div className="flex items-center">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <Activity className="h-6 w-6 text-orange-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Pending Approvals</p>
                      <p className="text-2xl font-bold text-gray-900">{pendingApprovals}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Additional Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <FileText className="h-6 w-6 text-indigo-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Applications</p>
                  <p className="text-2xl font-bold text-gray-900">{totalApplications}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending Applications</p>
                  <p className="text-2xl font-bold text-gray-900">{pendingApplications}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-emerald-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Accepted Applications</p>
                  <p className="text-2xl font-bold text-gray-900">{acceptedApplications}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <XCircle className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Rejected Applications</p>
                  <p className="text-2xl font-bold text-gray-900">{rejectedApplications}</p>
                </div>
              </div>
            </div>
          </div>

          {/* User Distribution Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">User Distribution</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                    <span className="text-sm text-gray-600">Refugees</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{numRefugees}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                    <span className="text-sm text-gray-600">Providers</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{numProviders}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-purple-500 rounded-full mr-3"></div>
                    <span className="text-sm text-gray-600">Admins</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{numAdmins}</span>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg border p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-4">
                {/* Recent Users */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Recent Users</h4>
                  {recentUsers.length > 0 ? (
                    recentUsers.map(user => (
                      <div key={user._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg mb-2">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center mr-3">
                            <span className="text-sm font-medium text-gray-700">{user.firstName?.[0]}{user.lastName?.[0]}</span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{user.firstName} {user.lastName}</p>
                            <p className="text-sm text-gray-500">{user.role}</p>
                          </div>
                        </div>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.isActive === true && user.isVerified === true ? 'bg-green-100 text-green-800' :
                          user.isActive === true && user.isVerified === false ? 'bg-yellow-100 text-yellow-800' :
                          user.isActive === false ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {user.isActive === true && user.isVerified === true ? 'Active' :
                           user.isActive === true && user.isVerified === false ? 'Pending' :
                           user.isActive === false ? 'Disabled' :
                           'Unknown'}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm">No recent user activity</p>
                  )}
                </div>

                {/* Recent Opportunities */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Recent Opportunities</h4>
                  {opportunities.slice(0, 3).length > 0 ? (
                    opportunities.slice(0, 3).map(opportunity => (
                      <div key={opportunity._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg mb-2">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                            <Briefcase className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{opportunity.title}</p>
                            <p className="text-sm text-gray-500">{opportunity.company}</p>
                          </div>
                        </div>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          opportunity.status === 'active' ? 'bg-green-100 text-green-800' :
                          opportunity.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                          opportunity.status === 'closed' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {opportunity.status}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm">No recent opportunities</p>
                  )}
                </div>

                {/* Recent Applications */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Recent Applications</h4>
                  {applications.slice(0, 3).length > 0 ? (
                    applications.slice(0, 3).map(application => (
                      <div key={application._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg mb-2">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                            <FileText className="h-4 w-4 text-purple-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{application.opportunity?.title || 'Unknown Opportunity'}</p>
                            <p className="text-sm text-gray-500">{application.applicant?.firstName} {application.applicant?.lastName}</p>
                          </div>
                        </div>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          application.status === 'accepted' ? 'bg-green-100 text-green-800' :
                          application.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          application.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {application.status}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm">No recent applications</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (activeItem === 'users') {
      return (
        <div className="space-y-6">
          {/* Description */}
              <p className="text-gray-600">Manage users who can login to the platform</p>

          {/* Filters */}
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                <input
                  type="text"
                  placeholder="Search users..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={filters.role}
                  onChange={(e) => setFilters(prev => ({ ...prev, role: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="">All Roles</option>
                  <option value="refugee">Refugee</option>
                  <option value="provider">Provider</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => setFilters({ role: '', search: '' })}
                  className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-200"
                >
                  Clear Filters
                </button>
              </div>
            </div>
            
            {/* Filter Summary */}
            {(filters.search || filters.role) && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-blue-800">
                    <strong>Active Filters:</strong>
                    {filters.search && <span className="ml-2 px-2 py-1 bg-blue-100 rounded text-xs">Search: "{filters.search}"</span>}
                    {filters.role && <span className="ml-2 px-2 py-1 bg-blue-100 rounded text-xs">Role: {filters.role}</span>}
                  </div>
                  <button
                    onClick={() => setFilters({ role: '', search: '' })}
                    className="text-blue-600 hover:text-blue-800 text-sm underline"
                  >
                    Clear All
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Users Table */}
          {usersLoading ? (
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
              <div className="animate-pulse space-y-4">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : usersError ? (
            <ErrorAlert message={usersError} onRetry={refetchUsers} />
          ) : (() => {
            // Debug logging to understand the user data
            console.log('AdminDashboard - User Management Debug:', {
              totalUsers: users.length,
              users: users.map(u => ({
                id: u._id,
                email: u.email,
                firstName: u.firstName,
                lastName: u.lastName,
                role: u.role,
                isActive: u.isActive,
                isVerified: u.isVerified,
                canLogin: u.isActive !== false && u.isVerified !== false
              }))
            });

            const loginableUsers = users.filter(user => {
              // Debug each user's login capability
              // Based on auth.js login route, users can log in if isActive: true
              const canLogin = user.isActive === true;
              console.log(`User ${user.email} (${user.role}): isActive=${user.isActive}, isVerified=${user.isVerified}, canLogin=${canLogin}`);
              return canLogin;
            });
            
            console.log('AdminDashboard - Loginable Users:', {
              loginableCount: loginableUsers.length,
              users: loginableUsers.map(u => ({
                id: u._id,
                email: u.email,
                role: u.role
              }))
            });

            const filteredUsers = loginableUsers.filter(user => {
              // Debug logging for filters
              console.log('Filtering user:', user.email, 'with filters:', filters);
              
              // Apply search filter
              if (filters.search) {
                const searchTerm = filters.search.toLowerCase();
                const fullName = `${user.firstName || ''} ${user.lastName || ''}`.toLowerCase();
                const email = (user.email || '').toLowerCase();
                const matchesSearch = fullName.includes(searchTerm) || email.includes(searchTerm);
                console.log(`Search filter: "${searchTerm}" matches "${fullName}" or "${email}": ${matchesSearch}`);
                if (!matchesSearch) {
                  return false;
                }
              }
              
              // Apply role filter
              if (filters.role && user.role !== filters.role) {
                console.log(`Role filter: user role "${user.role}" doesn't match filter "${filters.role}"`);
                return false;
              }
              
              // Note: Login status filter removed since we only show loginable users
              // All users in loginableUsers can login by definition
              
              console.log(`User ${user.email} passed all filters`);
              return true;
            });

            console.log('AdminDashboard - Filter Summary:', {
              activeFilters: filters,
              loginableUsersCount: loginableUsers.length,
              filteredUsersCount: filteredUsers.length,
              searchTerm: filters.search,
              roleFilter: filters.role
            });

            console.log('AdminDashboard - Final Results:', {
              totalUsers: users.length,
              loginableUsers: loginableUsers.length,
              filteredUsers: filteredUsers.length,
              activeFilters: Object.keys(filters).filter(key => filters[key]).length
            });

            if (filteredUsers.length === 0) {
              return (
                <div className="space-y-6">
                  <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-12 text-center">
                    <Users className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
                    <p className="text-gray-600">
                      {loginableUsers.length === 0 
                        ? 'No users can currently login to the platform.'
                        : 'No users match the current filters.'
                      }
                    </p>
                  </div>
                  
                  {/* Debug section - show all users */}
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                    <h4 className="text-lg font-medium text-yellow-900 mb-4">Debug: All Users ({users.length})</h4>
                    <p className="text-sm text-yellow-700 mb-4">
                      <strong>Note:</strong> Users can login if <code>isActive: true</code>. 
                      <code>isVerified</code> is for additional verification but doesn't prevent login.
                    </p>
                    
                    {/* Comparison with profiles */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                      <h5 className="font-medium text-blue-900 mb-2">Data Comparison:</h5>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <strong>User Accounts:</strong> {users.length}
                          <br />
                          <strong>Active Users:</strong> {users.filter(u => u.isActive === true).length}
                          <br />
                          <strong>Refugee Users:</strong> {users.filter(u => u.role === 'refugee' && u.isActive === true).length}
                        </div>
                        <div>
                          <strong>Created Profiles:</strong> {refugeeProfiles.length}
                          <br />
                          <strong>Refugee Profiles:</strong> {refugeeProfiles.filter(p => p.user?.role === 'refugee').length}
                          <br />
                          <strong>Provider Profiles:</strong> {refugeeProfiles.filter(p => p.user?.role === 'provider').length}
                        </div>
                      </div>
                      
                      {/* Profile creation status */}
                      <div className="mt-4 p-3 bg-white rounded border">
                        <h6 className="font-medium text-blue-900 mb-2">Profile Creation Status:</h6>
                        <div className="space-y-2">
                          {users.filter(u => u.isActive === true).map(user => {
                            const hasProfile = refugeeProfiles.some(p => p.user?._id === user._id);
                            return (
                              <div key={user._id} className="flex items-center justify-between text-sm">
                                <span>{user.firstName} {user.lastName} ({user.email})</span>
                                <span className={`px-2 py-1 rounded text-xs ${
                                  hasProfile ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                  {hasProfile ? 'Has Profile' : 'No Profile'}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                {/* Results Summary */}
                <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      Showing <strong>{filteredUsers.length}</strong> of <strong>{loginableUsers.length}</strong> users who can login
                      {Object.keys(filters).filter(key => filters[key]).length > 0 && (
                        <span className="ml-2 text-gray-500">(filtered)</span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">
                      Total users: {users.length}
                    </div>
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Role
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Joined
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredUsers.map((user) => (
                        <tr key={user._id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                  <span className="text-sm font-medium text-gray-700">
                                    {user.firstName?.[0]}{user.lastName?.[0]}
                                  </span>
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {user.firstName} {user.lastName}
                                </div>
                                <div className="text-sm text-gray-500">{user.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                              user.role === 'provider' ? 'bg-blue-100 text-blue-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              user.isActive === true ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {user.isActive === true ? 'Can Login' : 'Cannot Login'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => {
                                  if (window.confirm(`Are you sure you want to disable ${user.firstName} ${user.lastName}? They will not be able to login.`)) {
                                    handleUserStatusUpdate(user._id, { isActive: false });
                                  }
                                }}
                                className="text-yellow-600 hover:text-yellow-900 flex items-center"
                                title="Disable user login access"
                              >
                                <UserX className="h-4 w-4 mr-1" />
                                Disable
                              </button>
                              <button
                                onClick={() => {
                                  if (window.confirm(`Are you sure you want to suspend ${user.firstName} ${user.lastName}? They will be disabled and unverified.`)) {
                                    handleUserStatusUpdate(user._id, { isActive: false, isVerified: false });
                                  }
                                }}
                                className="text-orange-600 hover:text-orange-900 flex items-center"
                                title="Suspend user (disable and unverify)"
                              >
                                <Shield className="h-4 w-4 mr-1" />
                                Suspend
                              </button>
                              <button
                                onClick={() => {
                                  if (window.confirm(`Are you sure you want to permanently delete ${user.firstName} ${user.lastName}? This action cannot be undone.`)) {
                                    handleUserDelete(user._id);
                                  }
                                }}
                                className="text-red-600 hover:text-red-900 flex items-center"
                                title="Permanently delete user"
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })()
          }
        </div>
      );
    }

    if (activeItem === 'profiles') {
      return (
        <div className="space-y-6">
          {/* Description */}
          <p className="text-gray-600">Review and manage refugee profiles that have been created</p>

          {/* Stats Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                                 <div className="ml-3">
                   <p className="text-sm font-medium text-gray-600">Total Profiles</p>
                   <p className="text-xl font-bold text-gray-900">{profileStats.total}</p>
                 </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <UserCheck className="h-5 w-5 text-green-600" />
                </div>
                                 <div className="ml-3">
                   <p className="text-sm font-medium text-gray-600">Refugee Users</p>
                   <p className="text-xl font-bold text-gray-900">{profileStats.refugees}</p>
                 </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Briefcase className="h-5 w-5 text-purple-600" />
                </div>
                                 <div className="ml-3">
                   <p className="text-sm font-medium text-gray-600">Provider Users</p>
                   <p className="text-xl font-bold text-gray-900">{profileStats.providers}</p>
                 </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Shield className="h-5 w-5 text-orange-600" />
                </div>
                                 <div className="ml-3">
                   <p className="text-sm font-medium text-gray-600">Admin Users</p>
                   <p className="text-xl font-bold text-gray-900">{profileStats.admins}</p>
                 </div>
              </div>
            </div>
          </div>

          {/* Profiles Table */}
          {profilesLoading && !profilesLoaded ? (
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
              <div className="animate-pulse space-y-4">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                    </div>
                    <div className="h-6 bg-gray-200 rounded w-20"></div>
                    <div className="h-6 bg-gray-200 rounded w-16"></div>
                    <div className="h-6 bg-gray-200 rounded w-24"></div>
                  </div>
                ))}
              </div>
            </div>
          ) : profilesError ? (
            <ErrorAlert message={profilesError} onRetry={refetchProfiles} />
          ) : refugeeProfiles.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-12 text-center">
              <User className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No refugee profiles found</h3>
              <p className="text-gray-600">No refugee profiles have been created yet.</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Profile
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Profile Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {memoizedProfiles.map((profile) => (
                      <tr key={profile._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                <span className="text-sm font-medium text-gray-700">
                                  {getDisplayName(profile).charAt(0)}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {getDisplayName(profile)}
                              </div>
                              <div className="text-sm text-gray-500">{profile.user?.email || 'No email'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            profile.user?.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                            profile.user?.role === 'provider' ? 'bg-blue-100 text-blue-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {profile.user?.role || 'Unknown'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            profile.option === 'student' ? 'bg-blue-100 text-blue-800' :
                            profile.option === 'job seeker' ? 'bg-green-100 text-green-800' :
                            profile.option === 'undocumented_talent' ? 'bg-orange-100 text-orange-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {profile.option ? profile.option.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'General'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'Unknown'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => navigate(`/profile/${profile._id}`)}
                              className="text-blue-600 hover:text-blue-900 flex items-center"
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </button>
                            <button
                              onClick={() => handleProfileDelete(profile._id)}
                              className="text-red-600 hover:text-red-900 flex items-center"
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      );
    }

    if (activeItem === 'opportunities') {
  return (
        <div className="space-y-6">
          {/* Description */}
          <p className="text-gray-600">Review and manage job opportunities posted by providers</p>

          {/* Filters */}
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm mb-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                <input
                  type="text"
                  placeholder="Search opportunities..."
                  value={opportunityFilters.search}
                  onChange={(e) => setOpportunityFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={opportunityFilters.type}
                  onChange={(e) => setOpportunityFilters(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="">All Types</option>
                  <option value="part-time job">Part-time Job</option>
                  <option value="full-time job">Full-time Job</option>
                  <option value="internship">Internship</option>
                  <option value="scholarship">Scholarship</option>
                  <option value="funding">Funds</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={opportunityFilters.status}
                  onChange={(e) => setOpportunityFilters(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => setOpportunityFilters({ type: '', status: '', search: '' })}
                  className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-200"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>

          {/* Opportunities Table */}
          {opportunitiesLoading ? (
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
              <div className="animate-pulse space-y-4">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                    </div>
                    <div className="h-6 bg-gray-200 rounded w-20"></div>
                    <div className="h-6 bg-gray-200 rounded w-16"></div>
                    <div className="h-6 bg-gray-200 rounded w-24"></div>
                  </div>
                ))}
              </div>
            </div>
          ) : opportunitiesError ? (
            <ErrorAlert message={opportunitiesError} onRetry={refetchOpportunities} />
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Opportunity
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Location
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Salary
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Posted
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                                  {opportunities
                      .filter(opp => {
                        if (!opp) return false;
                        return (
                          (!opportunityFilters.type || opp.type === opportunityFilters.type) &&
                          (!opportunityFilters.status || opp.status === opportunityFilters.status) &&
                          (!opportunityFilters.search ||
                            (opp.title && opp.title.toLowerCase().includes(opportunityFilters.search.toLowerCase())) ||
                            (opp.company && opp.company.toLowerCase().includes(opportunityFilters.search.toLowerCase()))
                          )
                        );
                      })
                      .map((opportunity) => (
                        <tr key={opportunity._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                  <Briefcase className="h-5 w-5 text-blue-600" />
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {opportunity.title || 'Untitled Opportunity'}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {opportunity.company || 'Unknown Company'}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              opportunity.type === 'full-time job' ? 'bg-green-100 text-green-800' :
                              opportunity.type === 'part-time job' ? 'bg-blue-100 text-blue-800' :
                              opportunity.type === 'internship' ? 'bg-yellow-100 text-yellow-800' :
                              opportunity.type === 'scholarship' ? 'bg-purple-100 text-purple-800' :
                              opportunity.type === 'funds' ? 'bg-pink-100 text-pink-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {opportunity.type === 'full-time job' ? 'Full-time Job' :
                                opportunity.type === 'part-time job' ? 'Part-time Job' :
                                opportunity.type ? opportunity.type.charAt(0).toUpperCase() + opportunity.type.slice(1) : 'Unknown'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {opportunity.location || 'Not specified'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {opportunity.salary && typeof opportunity.salary === 'object'
                              ? `${opportunity.salary.min} - ${opportunity.salary.max} ${opportunity.salary.currency || ''}`
                              : opportunity.salary || 'Not specified'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              opportunity.status === 'active' ? 'bg-green-100 text-green-800' :
                              opportunity.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {opportunity.status || 'Unknown'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {opportunity.createdAt ? new Date(opportunity.createdAt).toLocaleDateString() : 'Unknown'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => navigate(`/opportunity/${opportunity._id}`)}
                                className="text-blue-600 hover:text-blue-900 flex items-center"
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </button>
                              {opportunity.status === 'pending' && (
                                <button
                                  onClick={() => handleOpportunityStatusUpdate(opportunity._id, 'active')}
                                  className="text-green-600 hover:text-green-900 flex items-center"
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Approve
                                </button>
                              )}
                              {opportunity.status === 'active' && (
                                <button
                                  onClick={() => handleOpportunityStatusUpdate(opportunity._id, 'suspended')}
                                  className="text-yellow-600 hover:text-yellow-900 flex items-center"
                                >
                                  <XCircle className="h-4 w-4 mr-1" />
                                  Suspend
                                </button>
                              )}
                              {opportunity.status === 'suspended' && (
                                <button
                                  onClick={() => handleOpportunityStatusUpdate(opportunity._id, 'active')}
                                  className="text-green-600 hover:text-green-900 flex items-center"
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Activate
                                </button>
                              )}
                              <button
                                onClick={() => setEditingOpportunity(opportunity)}
                                className="text-gray-600 hover:text-gray-900 flex items-center"
                              >
                                <Edit className="h-4 w-4 mr-1" />
                                Edit
                              </button>
                              <button
                                onClick={() => handleOpportunityDelete(opportunity._id)}
                                className="text-red-600 hover:text-red-900 flex items-center"
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
              {opportunities.filter(opp => {
                if (!opp) return false;
                return (
                  (!opportunityFilters.type || opp.type === opportunityFilters.type) &&
                  (!opportunityFilters.status || opp.status === opportunityFilters.status) &&
                  (!opportunityFilters.search ||
                    (opp.title && opp.title.toLowerCase().includes(opportunityFilters.search.toLowerCase())) ||
                    (opp.company && opp.company.toLowerCase().includes(opportunityFilters.search.toLowerCase()))
                  )
                );
              }).length === 0 && (
                <div className="text-center py-12">
                  <Briefcase className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No opportunities found</h3>
                  <p className="text-gray-600">No opportunities match your current filters</p>
                </div>
              )}
            </div>
          )}
        </div>
      );
    }

    if (activeItem === 'reports') {
      // Calculate average applications per opportunity
      let totalApplications = 0;
      let countedOpportunities = 0;
      opportunities.forEach(opp => {
        if (typeof opp.currentApplicants === 'number') {
          totalApplications += opp.currentApplicants;
          countedOpportunities++;
        }
      });
      const avgApplications = countedOpportunities > 0 ? (totalApplications / countedOpportunities).toFixed(1) : 0;

      // Calculate profile completion rate (example: profiles with at least 5 fields filled)
      const completedProfiles = refugeeProfiles.filter(p => {
        let filled = 0;
        if (getDisplayName(p)) filled++;
        if (p.age) filled++;
        if (p.gender) filled++;
        if (p.currentLocation) filled++;
        if (p.skills && p.skills.length > 0) filled++;
        return filled >= 5;
      }).length;
      const completionRate = refugeeProfiles.length > 0 ? Math.round((completedProfiles / refugeeProfiles.length) * 100) : 0;

      return (
        <div className="space-y-6">
          {/* Description */}
          <p className="text-gray-600">View platform analytics and generate reports</p>

          {/* Reports Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* User Growth Report */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-3">
                  <h3 className="font-medium text-gray-900">User Growth</h3>
                  <p className="text-sm text-gray-500">Monthly user registration trends</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Users:</span>
                  <span className="font-medium">{stats?.totalUsers || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Active Users:</span>
                  <span className="font-medium">{stats?.activeUsers || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">New This Month:</span>
                  <span className="font-medium">{stats?.newUsersThisMonth || 0}</span>
                </div>
              </div>
              <button className="w-full mt-4 bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 transition-colors">
                <Download className="h-4 w-4 inline mr-2" />
                Download Report
              </button>
            </div>

            {/* Opportunity Analytics */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Briefcase className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-3">
                  <h3 className="font-medium text-gray-900">Opportunity Analytics</h3>
                  <p className="text-sm text-gray-500">Job posting and application metrics</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Opportunities:</span>
                  <span className="font-medium">{opportunities.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Active Postings:</span>
                  <span className="font-medium">{opportunities.filter(opp => opp.isActive).length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Avg. Applications:</span>
                  <span className="font-medium">{applicationsLoading ? '...' : avgApplications}</span>
                </div>
              </div>
              <button className="w-full mt-4 bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700 transition-colors">
                <Download className="h-4 w-4 inline mr-2" />
                Download Report
              </button>
            </div>

            {/* Profile Statistics */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <User className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-3">
                  <h3 className="font-medium text-gray-900">Profile Statistics</h3>
                  <p className="text-sm text-gray-500">User profile completion rates</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Profiles:</span>
                  <span className="font-medium">{profiles.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Public Profiles:</span>
                  <span className="font-medium">{profiles.filter(p => p.isPublic).length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Completion Rate:</span>
                  <span className="font-medium">{profilesLoading ? '...' : `${completionRate}%`}</span>
                </div>
              </div>
              <button className="w-full mt-4 bg-purple-600 text-white px-4 py-2 rounded text-sm hover:bg-purple-700 transition-colors">
                <Download className="h-4 w-4 inline mr-2" />
                Download Report
              </button>
            </div>

            {/* System Health */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Activity className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-3">
                  <h3 className="font-medium text-gray-900">System Health</h3>
                  <p className="text-sm text-gray-500">Platform performance metrics</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Uptime:</span>
                  <span className="font-medium text-green-600">99.9%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Response Time:</span>
                  <span className="font-medium">120ms</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Error Rate:</span>
                  <span className="font-medium text-green-600">0.1%</span>
                </div>
              </div>
              <button className="w-full mt-4 bg-yellow-600 text-white px-4 py-2 rounded text-sm hover:bg-yellow-700 transition-colors">
                <Download className="h-4 w-4 inline mr-2" />
                Download Report
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (activeItem === 'settings') {
      return (
        <div className="space-y-6">
          {/* Description */}
          <p className="text-gray-600">Manage platform settings and configurations</p>

          {/* Settings Sections */}
          <div className="space-y-6">
            {/* General Settings */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <Settings className="h-5 w-5 mr-2 text-gray-500" />
                General Settings
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Platform Name</label>
                    <p className="text-xs text-gray-500">Display name for the platform</p>
                  </div>
                  <input
                    type="text"
                    defaultValue="Refuture"
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Contact Email</label>
                    <p className="text-xs text-gray-500">Support email address</p>
                  </div>
                  <input
                    type="email"
                    defaultValue="support@refuture.com"
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Maintenance Mode</label>
                    <p className="text-xs text-gray-500">Temporarily disable platform access</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Security Settings */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <Shield className="h-5 w-5 mr-2 text-gray-500" />
                Security Settings
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Two-Factor Authentication</label>
                    <p className="text-xs text-gray-500">Require 2FA for all users</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Session Timeout</label>
                    <p className="text-xs text-gray-500">Auto-logout after inactivity</p>
                  </div>
                  <select className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>30 minutes</option>
                    <option>1 hour</option>
                    <option>2 hours</option>
                    <option>4 hours</option>
                  </select>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Password Policy</label>
                    <p className="text-xs text-gray-500">Minimum password requirements</p>
                  </div>
                  <select className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>8 characters minimum</option>
                    <option>10 characters minimum</option>
                    <option>12 characters minimum</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Notification Settings */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <Bell className="h-5 w-5 mr-2 text-gray-500" />
                Notification Settings
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Email Notifications</label>
                    <p className="text-xs text-gray-500">Send email alerts for important events</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Admin Alerts</label>
                    <p className="text-xs text-gray-500">Notify admins of system issues</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Save Settings
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (activeItem === 'support') {
      return (
        <div className="space-y-6">
          {/* Description */}
          <p className="text-gray-600">Help and support resources for administrators</p>

          {/* Support Sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Documentation */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-3">
                  <h3 className="font-medium text-gray-900">Documentation</h3>
                  <p className="text-sm text-gray-500">Admin guides and tutorials</p>
                </div>
              </div>
              <div className="space-y-2">
                <a href="#" className="block text-sm text-blue-600 hover:text-blue-800">Getting Started Guide</a>
                <a href="#" className="block text-sm text-blue-600 hover:text-blue-800">User Management</a>
                <a href="#" className="block text-sm text-blue-600 hover:text-blue-800">Security Best Practices</a>
                <a href="#" className="block text-sm text-blue-600 hover:text-blue-800">API Documentation</a>
              </div>
            </div>

            {/* Contact Support */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <MessageCircle className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-3">
                  <h3 className="font-medium text-gray-900">Contact Support</h3>
                  <p className="text-sm text-gray-500">Get help from our team</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center text-sm">
                  <Mail className="h-4 w-4 mr-2 text-gray-500" />
                  <span>support@refuture.com</span>
                </div>
                <div className="flex items-center text-sm">
                  <Phone className="h-4 w-4 mr-2 text-gray-500" />
                  <span>+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center text-sm">
                  <Clock className="h-4 w-4 mr-2 text-gray-500" />
                  <span>24/7 Support Available</span>
                </div>
              </div>
              <button className="w-full mt-4 bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700 transition-colors">
                Open Support Ticket
              </button>
            </div>

            {/* System Status */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Activity className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-3">
                  <h3 className="font-medium text-gray-900">System Status</h3>
                  <p className="text-sm text-gray-500">Current platform status</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Platform Status:</span>
                  <span className="text-green-600 font-medium">Operational</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Database:</span>
                  <span className="text-green-600 font-medium">Healthy</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>API Services:</span>
                  <span className="text-green-600 font-medium">Online</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Last Updated:</span>
                  <span className="text-gray-500">2 minutes ago</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Settings className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-3">
                  <h3 className="font-medium text-gray-900">Quick Actions</h3>
                  <p className="text-sm text-gray-500">Common admin tasks</p>
                </div>
              </div>
              <div className="space-y-2">
                <button onClick={() => handleActionFeedback(fakeBackupApiCall(), 'Backup complete!', 'Backup failed!')} className="w-full text-left text-sm text-blue-600 hover:text-blue-800 py-1">
                  Backup Database
                </button>
                <button onClick={() => toast.error('Clear Cache not implemented')} className="w-full text-left text-sm text-blue-600 hover:text-blue-800 py-1">
                  Clear Cache
                </button>
                <button onClick={() => toast.error('Update System not implemented')} className="w-full text-left text-sm text-blue-600 hover:text-blue-800 py-1">
                  Update System
                </button>
                <button onClick={() => toast.error('View Logs not implemented')} className="w-full text-left text-sm text-blue-600 hover:text-blue-800 py-1">
                  View Logs
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (activeItem === 'notifications') {
      return (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">System Notifications</h3>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">
                {unreadNotificationsCount} unread notifications
              </span>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-6">
              {notifications && notifications.length > 0 ? (
                <div className="space-y-4">
                  {notifications.slice(0, 10).map(notification => (
                    <div key={notification._id} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-sm">{notification.title}</p>
                          <p className="text-xs text-gray-500 mt-1">{notification.message}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-xs text-gray-400">
                            {new Date(notification.createdAt).toLocaleDateString()}
                          </span>
                          {!notification.isRead && (
                            <span className="block bg-red-500 text-white text-xs rounded-full px-2 py-1 mt-1">
                              New
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No notifications found</p>
              )}
            </div>
          </div>
        </div>
      );
    }

    // Default placeholder for any other sections
    return (
      <div className="space-y-6">
        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
          <h2 className="text-lg font-medium text-gray-900 mb-4">{navigationItems.find(item => item.id === activeItem)?.label}</h2>
          <p className="text-gray-600">This section is under development. Coming soon!</p>
        </div>
      </div>
    );
  };

  // Helper: Fake API call for quick actions
  const fakeBackupApiCall = useCallback(() => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (Math.random() > 0.1) { // 90% success rate
          resolve('Backup successful!');
        } else {
          reject('Backup failed!');
        }
      }, 1000);
    });
  }, []);

  // Debug logging to understand the data
  console.log('AdminDashboard - Data Summary:', {
    totalUsers: users.length,
    totalProfiles: refugeeProfiles.length,
    users: users.map(u => ({
      id: u._id,
      email: u.email,
      role: u.role,
      isActive: u.isActive,
      isVerified: u.isVerified
    })),
    profiles: refugeeProfiles.map(p => ({
      id: p._id,
      userId: p.user?._id,
      userEmail: p.user?.email,
      userRole: p.user?.role
    }))
  });

  return (
    <div>
      {/* Main Dashboard */}
      <div className="flex h-screen bg-gray-50">
        {/* Sidebar */}
        <div className="w-80 bg-white shadow-lg flex flex-col">
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-sm text-gray-600 mt-1">Manage platform, users, and content</p>
          </div>

          <nav className="flex-1 p-4 overflow-y-auto">
            {navigationItems.map(item => renderMenuItem(item))}
          </nav>

          {/* Logout button at bottom */}
          <div className="p-4 pb-8 border-t border-gray-200 mt-auto mb-4">
            <button
              onClick={() => { logout(); navigate('/'); }}
              className="w-full flex items-center justify-between px-3 py-2 text-left text-sm rounded-lg transition-colors text-gray-700 hover:bg-gray-100"
            >
              <span className="flex items-center">
                <LogOut className="h-5 w-5 mr-3 text-gray-500" />
                Logout
              </span>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            <div className="max-w-6xl mx-auto">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  {navigationItems.find(item => item.id === activeItem)?.label || 'Dashboard Overview'}
                </h2>
                <div className="text-gray-600">
                  {renderMainContent()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 
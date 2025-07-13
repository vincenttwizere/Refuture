import React, { useState, useEffect, useMemo } from 'react';
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
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../hooks/useNotifications';
import { useMessages } from '../../hooks/useMessages';
import { useUsers } from '../../hooks/useUsers';
import { useProfiles } from '../../hooks/useProfiles';
import { useOpportunities } from '../../hooks/useOpportunities';
import { usePlatformStats } from '../../hooks/usePlatformStats';

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
  const { messages } = useMessages();
  const { users, loading: usersLoading, error: usersError, fetchUsers, updateUserStatus, deleteUser, refetchUsers } = useUsers();
  const { profiles, loading: profilesLoading, error: profilesError, fetchProfiles, deleteProfile, refetch: refetchProfiles } = useProfiles();
  const { opportunities, loading: opportunitiesLoading, error: opportunitiesError, fetchOpportunities, deleteOpportunity, updateOpportunityStatus, refetch: refetchOpportunities } = useOpportunities();
  const { stats, loading: statsLoading, error: statsError, refetchStats } = usePlatformStats();

  // Calculate unread messages count
  const unreadMessagesCount = useMemo(() => {
    if (!messages || !user) return 0;
    return messages.filter(message => {
      const recipientId = typeof message.recipient === 'object' ? message.recipient._id : message.recipient;
      const currentUserId = typeof user._id === 'object' ? user._id.toString() : user._id;
      return !message.isRead && recipientId === currentUserId;
    }).length;
  }, [messages, user]);

  // Calculate unread notifications count
  const unreadNotificationsCount = useMemo(() => {
    return notifications.filter(notification => !notification.isRead).length;
  }, [notifications]);

  // User management state
  const [selectedUser, setSelectedUser] = useState(null);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    role: '',
    status: '',
    search: ''
  });

  // Opportunity management state
  const [opportunityFilters, setOpportunityFilters] = useState({
    type: '',
    status: '',
    search: ''
  });
  const [editingOpportunity, setEditingOpportunity] = useState(null); // Placeholder for edit modal

  // Defensive loading state (must be after all hooks)
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading user...</div>;
  if (!user) return <div className="min-h-screen flex items-center justify-center text-red-600">User not found. Please log in again.</div>;
  
  // Debug logging to prevent infinite re-renders
  console.log('AdminDashboard render - user:', user?._id, 'activeItem:', activeItem);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Sidebar main categories only
  const navigationItems = [
    { id: 'overview', label: 'Dashboard Overview', icon: BarChart3 },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'opportunities', label: 'Opportunities', icon: Briefcase },
    { id: 'profiles', label: 'Profiles', icon: User },
    { id: 'messages', label: 'Messages', icon: MessageCircle, badge: unreadMessagesCount > 0 ? unreadMessagesCount : null },
    { 
      id: 'notifications', 
      label: 'Notifications', 
      icon: Bell,
      badge: unreadNotificationsCount > 0 ? unreadNotificationsCount : null
    },
    { id: 'reports', label: 'Reports', icon: TrendingUp },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'support', label: 'Help & Support', icon: HelpCircle }
  ];

  // Sidebar rendering (no dropdowns)
  const renderMenuItem = (item) => {
    const Icon = item.icon;
    const isActive = activeItem === item.id;
    return (
      <div key={item.id} className="mb-1">
        <button
          onClick={() => setActiveItem(item.id)}
          className={`w-full flex items-center justify-between px-3 py-2 text-left text-sm rounded-lg transition-colors ${
            isActive 
              ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-500' 
              : 'text-gray-700 hover:bg-gray-50'
          }`}
        >
          <div className="flex items-center">
            <Icon className={`h-5 w-5 mr-3 ${isActive ? 'text-blue-600' : 'text-gray-500'}`} />
            <div className="font-medium">{item.label}</div>
      </div>
          {item.badge && (
            <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">
              {item.badge}
            </span>
          )}
    </button>
      </div>
    );
  };

  // Handle user status update
  const handleUserStatusUpdate = async (userId, newStatus) => {
    try {
      await updateUserStatus(userId, newStatus);
      refetchUsers();
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  };

  // Handle user deletion
  const handleUserDelete = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        await deleteUser(userId);
        refetchUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  // Handle profile deletion
  const handleProfileDelete = async (profileId) => {
    if (window.confirm('Are you sure you want to delete this profile? This action cannot be undone.')) {
      try {
        await deleteProfile(profileId);
        refetchProfiles();
      } catch (error) {
        console.error('Error deleting profile:', error);
      }
    }
  };

  // Handle opportunity deletion
  const handleOpportunityDelete = async (opportunityId) => {
    if (window.confirm('Are you sure you want to delete this opportunity? This action cannot be undone.')) {
      try {
        await deleteOpportunity(opportunityId);
        refetchOpportunities();
      } catch (error) {
        console.error('Error deleting opportunity:', error);
      }
    }
  };

  // Handle opportunity status update
  const handleOpportunityStatusUpdate = async (opportunityId, newStatus) => {
    try {
      await updateOpportunityStatus(opportunityId, newStatus);
      refetchOpportunities();
    } catch (error) {
      console.error('Error updating opportunity status:', error);
    }
  };

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
    fetchProfiles();
    fetchOpportunities();
  }, [fetchProfiles, fetchOpportunities]);

  // Main content area
  const renderMainContent = () => {
    if (activeItem === 'overview') {
      return (
        <div className="space-y-6">
          {/* Stats Cards */}
          {statsLoading ? (
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg border">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.totalUsers || 0}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg border">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Briefcase className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Opportunities</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.activeOpportunities || 0}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg border">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <User className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Refugee Profiles</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.refugeeProfiles || 0}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg border">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Activity className="h-6 w-6 text-orange-600" />
            </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending Approvals</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.pendingApprovals || 0}</p>
                </div>
              </div>
            </div>
          </div>
        )}

          {/* User Distribution Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg border p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">User Distribution</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                    <span className="text-sm text-gray-600">Refugees</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {users.filter(u => u.role === 'refugee').length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                    <span className="text-sm text-gray-600">Providers</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {users.filter(u => u.role === 'provider').length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-purple-500 rounded-full mr-3"></div>
                    <span className="text-sm text-gray-600">Admins</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {users.filter(u => u.role === 'admin').length}
                  </span>
                </div>
              </div>
                  </div>

            <div className="bg-white rounded-lg border p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-4">
                {users.slice(0, 5).map(user => (
                  <div key={user._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center mr-3">
                        <span className="text-sm font-medium text-gray-700">
                          {user.firstName?.[0]}{user.lastName?.[0]}
                        </span>
                </div>
                      <div>
                        <p className="font-medium text-gray-900">{user.firstName} {user.lastName}</p>
                        <p className="text-sm text-gray-500">{user.role}</p>
                  </div>
                </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      user.status === 'active' ? 'bg-green-100 text-green-800' :
                      user.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {user.status}
                    </span>
                  </div>
                ))}
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
              <p className="text-gray-600">Manage platform users and their permissions</p>

          {/* Filters */}
          <div className="bg-white p-6 rounded-lg border">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                  <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
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
                  onClick={() => setFilters({ role: '', status: '', search: '' })}
                  className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-200"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>

          {/* Users Table */}
          {usersLoading ? (
            <div className="bg-white rounded-lg border p-6">
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
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                <p className="text-red-800">{usersError}</p>
              </div>
            </div>
          ) : (
          <div className="bg-white rounded-lg border overflow-hidden">
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
                  {users.map((user) => (
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
                          user.status === 'active' ? 'bg-green-100 text-green-800' :
                          user.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          {user.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleUserStatusUpdate(user._id, 'active')}
                                  className="text-green-600 hover:text-green-900 flex items-center"
                              >
                                  <UserCheck className="h-4 w-4 mr-1" />
                                Approve
                              </button>
                              <button
                                onClick={() => handleUserStatusUpdate(user._id, 'suspended')}
                                  className="text-red-600 hover:text-red-900 flex items-center"
                              >
                                  <UserX className="h-4 w-4 mr-1" />
                                Reject
                              </button>
                            </>
                          )}
                          {user.status === 'active' && (
                            <button
                              onClick={() => handleUserStatusUpdate(user._id, 'suspended')}
                                className="text-yellow-600 hover:text-yellow-900 flex items-center"
                            >
                                <UserX className="h-4 w-4 mr-1" />
                              Suspend
                            </button>
                          )}
                          {user.status === 'suspended' && (
                            <button
                              onClick={() => handleUserStatusUpdate(user._id, 'active')}
                                className="text-green-600 hover:text-green-900 flex items-center"
                            >
                                <UserCheck className="h-4 w-4 mr-1" />
                              Activate
                            </button>
                          )}
                          <button
                            onClick={() => handleUserDelete(user._id)}
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

    if (activeItem === 'profiles') {
    return (
      <div className="space-y-6">
          {/* Description */}
          <p className="text-gray-600">Review and manage user profiles</p>

          {/* Profiles Grid */}
          {profilesLoading ? (
            <div className="bg-white rounded-lg border p-6">
              <div className="animate-pulse space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="bg-gray-200 h-32 rounded-lg"></div>
                ))}
              </div>
            </div>
          ) : profilesError ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                <p className="text-red-800">{profilesError}</p>
        </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {profiles.map((profile) => (
                <div key={profile._id} className="bg-gray-50 rounded-lg p-6 border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center">
                      {profile.photoUrl ? (
                        <img 
                          src={profile.photoUrl} 
                          alt="Profile" 
                          className="w-12 h-12 rounded-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-medium">
                        {profile.fullName?.[0] || 'U'}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{profile.fullName}</h3>
                      <p className="text-sm text-gray-500">{profile.email}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm">
                      <span className="text-gray-500 w-20">Type:</span>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        profile.option === 'student' ? 'bg-blue-100 text-blue-800' :
                        profile.option === 'job seeker' ? 'bg-green-100 text-green-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {profile.option}
                      </span>
                    </div>
                    <div className="flex items-center text-sm">
                      <span className="text-gray-500 w-20">Age:</span>
                      <span className="text-gray-900">{profile.age} years old</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <span className="text-gray-500 w-20">Location:</span>
                      <span className="text-gray-900">{profile.currentLocation}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <span className="text-gray-500 w-20">Status:</span>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        profile.isPublic ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {profile.isPublic ? 'Public' : 'Private'}
                      </span>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => navigate(`/profile/${profile._id}`)}
                      className="flex-1 bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700 transition-colors flex items-center justify-center"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </button>
                    <button
                      onClick={() => handleProfileDelete(profile._id)}
                      className="bg-red-50 text-red-700 px-3 py-2 rounded text-sm hover:bg-red-100 transition-colors flex items-center"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
              
              {profiles.length === 0 && (
                <div className="col-span-full text-center py-12">
                  <User className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No profiles found</h3>
                  <p className="text-gray-600">No profiles match your current filters</p>
                </div>
              )}
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
          <div className="bg-white p-6 rounded-lg border mb-4">
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
                  <option value="funds">Funds</option>
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

          {/* Opportunities Grid */}
          {opportunitiesLoading ? (
            <div className="bg-white rounded-lg border p-6">
              <div className="animate-pulse space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="bg-gray-200 h-32 rounded-lg"></div>
                ))}
              </div>
            </div>
          ) : opportunitiesError ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                <p className="text-red-800">{opportunitiesError}</p>
        </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {opportunities
                .filter(opp =>
                  (!opportunityFilters.type || opp.type === opportunityFilters.type) &&
                  (!opportunityFilters.status || opp.status === opportunityFilters.status) &&
                  (!opportunityFilters.search ||
                    opp.title?.toLowerCase().includes(opportunityFilters.search.toLowerCase()) ||
                    opp.company?.toLowerCase().includes(opportunityFilters.search.toLowerCase())
                  )
                )
                .map((opportunity) => (
                <div key={opportunity._id} className="bg-gray-50 rounded-lg p-6 border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                      <Briefcase className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{opportunity.title}</h3>
                      <p className="text-sm text-gray-500">{opportunity.company}</p>
                    </div>
                  </div>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm">
                      <span className="text-gray-500 w-20">Type:</span>
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
                            opportunity.type.charAt(0).toUpperCase() + opportunity.type.slice(1)}
                      </span>
                    </div>
                    <div className="flex items-center text-sm">
                      <span className="text-gray-500 w-20">Location:</span>
                      <span className="text-gray-900">{opportunity.location}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <span className="text-gray-500 w-20">Salary:</span>
                        <span className="text-gray-900">
                          {opportunity.salary && typeof opportunity.salary === 'object'
                            ? `${opportunity.salary.min} - ${opportunity.salary.max} ${opportunity.salary.currency || ''}`
                            : opportunity.salary || 'Not specified'}
                        </span>
                    </div>
                    <div className="flex items-center text-sm">
                      <span className="text-gray-500 w-20">Status:</span>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          opportunity.status === 'active' ? 'bg-green-100 text-green-800' :
                          opportunity.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                      }`}>
                        {opportunity.status}
                      </span>
                    </div>
                  </div>
                    <div className="flex space-x-2 flex-wrap">
              <button
                      onClick={() => navigate(`/opportunity/${opportunity._id}`)}
                      className="flex-1 bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700 transition-colors flex items-center justify-center"
              >
                      <Eye className="h-4 w-4 mr-1" />
                      View
              </button>
                      {/* Status management actions */}
                      {opportunity.status === 'pending' && (
                        <button
                          onClick={() => handleOpportunityStatusUpdate(opportunity._id, 'active')}
                          className="bg-green-100 text-green-700 px-3 py-2 rounded text-sm hover:bg-green-200 flex items-center"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </button>
                      )}
                      {opportunity.status === 'active' && (
                        <button
                          onClick={() => handleOpportunityStatusUpdate(opportunity._id, 'suspended')}
                          className="bg-yellow-100 text-yellow-700 px-3 py-2 rounded text-sm hover:bg-yellow-200 flex items-center"
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Suspend
                        </button>
                      )}
                      {opportunity.status === 'suspended' && (
                        <button
                          onClick={() => handleOpportunityStatusUpdate(opportunity._id, 'active')}
                          className="bg-green-100 text-green-700 px-3 py-2 rounded text-sm hover:bg-green-200 flex items-center"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Activate
                        </button>
                      )}
                      {/* Edit button (placeholder) */}
                      <button
                        onClick={() => setEditingOpportunity(opportunity)}
                        className="bg-gray-100 text-gray-700 px-3 py-2 rounded text-sm hover:bg-gray-200 flex items-center"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
              </button>
          <button
                      onClick={() => handleOpportunityDelete(opportunity._id)}
                      className="bg-red-50 text-red-700 px-3 py-2 rounded text-sm hover:bg-red-100 transition-colors flex items-center"
          >
                      <Trash2 className="h-4 w-4" />
          </button>
            </div>
          </div>
              ))}
              {opportunities.length === 0 && (
                <div className="col-span-full text-center py-12">
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
                  <span className="font-medium">{opportunities.filter(opp => opp.status === 'active').length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Avg. Applications:</span>
                  <span className="font-medium">12</span>
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
                  <span className="font-medium">85%</span>
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
                <button className="w-full text-left text-sm text-blue-600 hover:text-blue-800 py-1">
                  Backup Database
                </button>
                <button className="w-full text-left text-sm text-blue-600 hover:text-blue-800 py-1">
                  Clear Cache
                </button>
                <button className="w-full text-left text-sm text-blue-600 hover:text-blue-800 py-1">
                  Update System
                </button>
                <button className="w-full text-left text-sm text-blue-600 hover:text-blue-800 py-1">
                  View Logs
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (activeItem === 'messages') {
      return (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">System Messages</h3>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">
                {unreadMessagesCount} unread messages
              </span>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-6">
              {messages && messages.length > 0 ? (
                <div className="space-y-4">
                  {messages.slice(0, 10).map(message => {
                    const senderId = typeof message.sender === 'object' ? message.sender._id : message.sender;
                    const recipientId = typeof message.recipient === 'object' ? message.recipient._id : message.recipient;
                    const currentUserId = typeof user._id === 'object' ? user._id.toString() : user._id;
                    const isReceived = recipientId === currentUserId;
                    const otherUserName = isReceived ? message.senderName : message.recipientName;
                    
                    return (
                      <div key={message._id} className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-sm">{otherUserName || 'Unknown'}</p>
                            <p className="text-xs text-gray-500 mt-1">{message.content}</p>
                          </div>
                          <div className="text-right">
                            <span className="text-xs text-gray-400">
                              {new Date(message.createdAt).toLocaleDateString()}
                            </span>
                            {!message.isRead && isReceived && (
                              <span className="block bg-blue-500 text-white text-xs rounded-full px-2 py-1 mt-1">
                                New
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No messages found</p>
              )}
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

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar - Fixed */}
      <div className="w-80 bg-white shadow-lg fixed h-full overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-sm text-gray-600 mt-1">Platform administration and management</p>
        </div>

        {/* Navigation */}
        <nav className="p-4">
          {navigationItems.map(item => renderMenuItem(item))}
          <button
            onClick={() => { logout(); navigate('/'); }}
            className="w-full flex items-center justify-between px-3 py-2 text-left text-sm rounded-lg transition-colors text-gray-700 hover:bg-gray-100 mt-4 border-t border-gray-200"
          >
            <span className="flex items-center">
              <LogOut className="h-5 w-5 mr-3 text-gray-500" />
              Logout
            </span>
          </button>
        </nav>
      </div>

      {/* Main Content Area - Scrollable */}
      <div className="flex-1 ml-80 overflow-y-auto">
        <div className="p-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="mb-4">
                <h2 className="text-2xl font-bold text-gray-900">
                  {navigationItems.find(item => item.id === activeItem)?.label || 'Dashboard Overview'}
                </h2>
              </div>
              <div className="text-gray-600">
            {renderMainContent()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 
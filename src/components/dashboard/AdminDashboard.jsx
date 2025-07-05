import React, { useState, useEffect } from 'react';
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
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../hooks/useNotifications';
import { useMessages } from '../../hooks/useMessages';
import { useUsers } from '../../hooks/useUsers';
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
  const { stats, loading: statsLoading, error: statsError, refetchStats } = usePlatformStats();

  // User management state
  const [selectedUser, setSelectedUser] = useState(null);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    role: '',
    status: '',
    search: ''
  });

  // Defensive loading state (must be after all hooks)
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading user...</div>;
  if (!user) return <div className="min-h-screen flex items-center justify-center text-red-600">User not found. Please log in again.</div>;

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Sidebar main categories only
  const navigationItems = [
    {
      id: 'overview',
      label: 'Overview',
      icon: BarChart3,
      description: 'Platform statistics and analytics'
    },
    {
      id: 'users',
      label: 'User Management',
      icon: Users,
      description: 'Manage platform users and permissions'
    },
    {
      id: 'opportunities',
      label: 'Opportunities',
      icon: Briefcase,
      description: 'Monitor and manage opportunities'
    },
    {
      id: 'profiles',
      label: 'Profiles',
      icon: User,
      description: 'Review and manage user profiles'
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: TrendingUp,
      description: 'Generate platform reports'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      description: 'Platform configuration'
    }
  ];

  // Sidebar rendering (no dropdowns)
  const renderMenuItem = (item) => (
        <button
      key={item.id}
          onClick={() => setActiveItem(item.id)}
      className={`w-full flex items-center px-3 py-2 text-left text-sm rounded-lg transition-colors ${
        activeItem === item.id
          ? 'bg-blue-50 text-blue-700 border border-blue-200'
          : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
      <item.icon className="h-5 w-5 mr-3" />
      <div>
            <div className="font-medium">{item.label}</div>
        <div className="text-xs text-gray-500">{item.description}</div>
      </div>
    </button>
    );

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

  // Apply filters
  useEffect(() => {
    fetchUsers(filters);
  }, [filters, fetchUsers]);

  // Main content area
  const renderMainContent = () => {
    if (activeItem === 'overview') {
      return (
        <div className="space-y-6">
          {/* Stats Cards */}
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
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
              <p className="text-gray-600">Manage platform users and their permissions</p>
            </div>
          </div>

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

    // Placeholder for other sections
    return (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg border">
          <h2 className="text-lg font-medium text-gray-900 mb-4">{navigationItems.find(item => item.id === activeItem)?.label}</h2>
          <p className="text-gray-600">This section is under development. Coming soon!</p>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
        {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => refetchStats()}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <RefreshCw className="h-5 w-5" />
              </button>
          <button
                onClick={logout}
                className="flex items-center text-gray-700 hover:text-gray-900"
          >
                <LogOut className="h-5 w-5 mr-2" />
              Logout
          </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <div className="w-64 flex-shrink-0">
            <nav className="space-y-1">
              {navigationItems.map(renderMenuItem)}
        </nav>
      </div>

          {/* Main Content */}
          <div className="flex-1">
            {renderMainContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 
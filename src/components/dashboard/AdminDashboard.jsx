import React, { useState } from 'react';
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
  LogOut
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../hooks/useNotifications';
import { useMessages } from '../../hooks/useMessages';

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
    { id: 'overview', label: 'Dashboard Overview', icon: Home },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'content', label: 'Content Moderation', icon: FileText },
    { id: 'security', label: 'Security & Compliance', icon: Shield },
    { id: 'analytics', label: 'Analytics & Reports', icon: BarChart3 },
    { id: 'disputes', label: 'Dispute Resolution', icon: AlertTriangle },
    { id: 'communications', label: 'Communications', icon: MessageCircle },
    { id: 'notifications', label: 'System Notifications', icon: Bell },
    { id: 'settings', label: 'Platform Settings', icon: Settings },
    { id: 'support', label: 'Support Center', icon: HelpCircle }
  ];

  // Subitems for each main category
  const subItems = {
    users: [
      { label: 'All Users', icon: Users },
      { label: 'Refugees', icon: UserCheck },
      { label: 'Providers', icon: Users },
      { label: 'Pending Approval', icon: Clock, badge: '23' },
      { label: 'Suspended Users', icon: UserX },
      { label: 'Verification Queue', icon: CheckCircle }
    ],
    content: [
      { label: 'Profile Review', icon: Eye },
      { label: 'Opportunity Review', icon: FileText },
      { label: 'Flagged Content', icon: Flag, badge: '5' },
      { label: 'Document Verification', icon: FileText }
    ],
    security: [
      { label: 'Security Logs', icon: Lock },
      { label: 'Activity Monitoring', icon: Activity },
      { label: 'Data Protection', icon: Database },
      { label: 'Audit Trail', icon: Search }
    ],
    analytics: [
      { label: 'Platform Analytics', icon: BarChart3 },
      { label: 'User Analytics', icon: Users },
      { label: 'Success Metrics', icon: CheckCircle },
      { label: 'Custom Reports', icon: Download }
    ]
  };

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

  // Main content area: show subitems for selected category
  const renderMainContent = () => {
    if (activeItem === 'overview') {
      return (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-900">Total Users</h3>
              <p className="text-2xl font-bold text-blue-600 mt-2">2,847</p>
              <p className="text-sm text-blue-600 mt-1">+12% this month</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-medium text-green-900">Active Applications</h3>
              <p className="text-2xl font-bold text-green-600 mt-2">1,234</p>
              <p className="text-sm text-green-600 mt-1">+8% this week</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-medium text-purple-900">Pending Reviews</h3>
              <p className="text-2xl font-bold text-purple-600 mt-2">31</p>
              <p className="text-sm text-purple-600 mt-1">Requires attention</p>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <h3 className="font-medium text-orange-900">Success Rate</h3>
              <p className="text-2xl font-bold text-orange-600 mt-2">78%</p>
              <p className="text-sm text-orange-600 mt-1">Placement success</p>
            </div>
          </div>

          {/* Recent Activity & Alerts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Recent Administrative Actions</h3>
              <div className="space-y-2">
                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">User account approved</p>
                    <p className="text-xs text-gray-500">Ahmed Hassan - Refugee registration</p>
                  </div>
                  <span className="text-xs text-gray-500">2 min ago</span>
                </div>
                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Content flagged for review</p>
                    <p className="text-xs text-gray-500">Job posting requires moderation</p>
                  </div>
                  <span className="text-xs text-gray-500">15 min ago</span>
                </div>
                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Security alert</p>
                    <p className="text-xs text-gray-500">Multiple failed login attempts</p>
                  </div>
                  <span className="text-xs text-gray-500">1 hour ago</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-3">System Alerts</h3>
              <div className="space-y-2">
                <div className="flex items-center p-3 bg-red-50 rounded-lg border border-red-200">
                  <AlertTriangle className="h-5 w-5 text-red-500 mr-3" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-red-900">High Priority</p>
                    <p className="text-xs text-red-700">23 users awaiting approval</p>
                  </div>
                </div>
                <div className="flex items-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <Flag className="h-5 w-5 text-yellow-500 mr-3" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-yellow-900">Medium Priority</p>
                    <p className="text-xs text-yellow-700">5 content reports pending</p>
                  </div>
                </div>
                <div className="flex items-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <Bell className="h-5 w-5 text-blue-500 mr-3" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-blue-900">Info</p>
                    <p className="text-xs text-blue-700">System maintenance scheduled</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Platform Statistics */}
          <div>
            <h3 className="font-medium text-gray-900 mb-3">Platform Statistics (Last 30 Days)</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white border border-gray-200 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">New Registrations</p>
                    <p className="text-2xl font-bold text-gray-900">342</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-500" />
                </div>
              </div>
              <div className="bg-white border border-gray-200 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Opportunities Posted</p>
                    <p className="text-2xl font-bold text-gray-900">156</p>
                  </div>
                  <FileText className="h-8 w-8 text-green-500" />
                </div>
              </div>
              <div className="bg-white border border-gray-200 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Successful Matches</p>
                    <p className="text-2xl font-bold text-gray-900">89</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-purple-500" />
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
    if (subItems[activeItem]) {
      return (
        <div className="flex flex-row flex-wrap gap-4">
          {subItems[activeItem].map((sub, idx) => (
            <div key={idx} className="flex items-center p-4 bg-white rounded-lg shadow border border-gray-100 min-w-[220px]">
              <sub.icon className="h-6 w-6 text-blue-500 mr-4" />
              <div className="font-medium text-gray-900">{sub.label}</div>
              {sub.badge && (
                <span className="ml-auto bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">{sub.badge}</span>
              )}
            </div>
          ))}
        </div>
      );
    }
    return <div className="text-gray-500">Select a section to view details.</div>;
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-80 bg-white shadow-lg overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-sm text-gray-600 mt-1">Platform oversight and management</p>
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

      {/* Main Content Area */}
      <div className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-6">
            {renderMainContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 
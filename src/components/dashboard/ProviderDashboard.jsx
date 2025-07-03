import React, { useState } from 'react';
import { 
  Home, 
  Users, 
  Search, 
  FileText, 
  Plus, 
  Edit, 
  Eye, 
  MessageCircle, 
  Calendar, 
  BarChart3, 
  Award, 
  Briefcase, 
  DollarSign, 
  UserCheck, 
  Clock, 
  Settings,
  HelpCircle,
  ChevronRight,
  ChevronDown,
  Filter,
  Star,
  LogOut
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const ProviderDashboard = () => {
  const [activeItem, setActiveItem] = useState('overview');
  const [expandedSections, setExpandedSections] = useState({
    talent: true,
    opportunities: true,
    applications: true
  });

  const { logout } = useAuth();
  const navigate = useNavigate();

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Sidebar main categories only
  const navigationItems = [
    { id: 'overview', label: 'Dashboard Overview', icon: Home },
    { id: 'talent', label: 'Talent Discovery', icon: Users },
    { id: 'opportunities', label: 'My Opportunities', icon: FileText },
    { id: 'applications', label: 'Applications', icon: FileText },
    { id: 'communications', label: 'Communications', icon: MessageCircle, badge: '7' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'interviews', label: 'Interview Manager', icon: Calendar },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'support', label: 'Help & Support', icon: HelpCircle }
  ];

  // Subitems for each main category
  const subItems = {
    talent: [
      { label: 'Search Talent', icon: Search },
      { label: 'Students', icon: Award },
      { label: 'Job Seekers', icon: Briefcase },
      { label: 'Undocumented Talent', icon: UserCheck },
      { label: 'Favorite Profiles', icon: Star }
    ],
    opportunities: [
      { label: 'Create New', icon: Plus },
      { label: 'Manage Posts', icon: Edit },
      { label: 'My Scholarships', icon: Award },
      { label: 'My Job Posts', icon: Briefcase },
      { label: 'My Mentorships', icon: Users },
      { label: 'My Funding', icon: DollarSign }
    ],
    applications: [
      { label: 'All Applications', icon: FileText },
      { label: 'Pending Review', icon: Clock, badge: '12' },
      { label: 'Shortlisted', icon: UserCheck },
      { label: 'Interview Scheduled', icon: Calendar }
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-900">Active Opportunities</h3>
              <p className="text-2xl font-bold text-blue-600 mt-2">8</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-medium text-green-900">Total Applications</h3>
              <p className="text-2xl font-bold text-green-600 mt-2">156</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-medium text-purple-900">Pending Review</h3>
              <p className="text-2xl font-bold text-purple-600 mt-2">12</p>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <h3 className="font-medium text-orange-900">Successful Placements</h3>
              <p className="text-2xl font-bold text-orange-600 mt-2">23</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Recent Applications</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">Software Engineer Position</p>
                    <p className="text-xs text-gray-500">3 new applications</p>
                  </div>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">New</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">Computer Science Scholarship</p>
                    <p className="text-xs text-gray-500">5 new applications</p>
                  </div>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Review</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Upcoming Interviews</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">Ahmed Hassan</p>
                    <p className="text-xs text-gray-500">Software Engineer - Tomorrow 2:00 PM</p>
                  </div>
                  <Calendar className="h-4 w-4 text-gray-400" />
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">Maria Santos</p>
                    <p className="text-xs text-gray-500">Mentorship Program - Friday 10:00 AM</p>
                  </div>
                  <Calendar className="h-4 w-4 text-gray-400" />
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
          <h1 className="text-xl font-bold text-gray-900">Provider Dashboard</h1>
          <p className="text-sm text-gray-600 mt-1">Discover talent, post opportunities</p>
        </div>

        {/* Navigation */}
        <nav className="p-4">
          {navigationItems.map(item => renderMenuItem(item))}
        </nav>

        {/* Logout Button */}
        <button
          onClick={() => { logout(); navigate('/'); }}
          className="w-full flex items-center justify-between px-3 py-2 text-left text-sm rounded-lg transition-colors text-gray-700 hover:bg-gray-100 mt-4 border-t border-gray-200"
        >
          <span className="flex items-center">
            <LogOut className="h-5 w-5 mr-3 text-gray-500" />
            Logout
          </span>
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {navigationItems.find(item => item.id === activeItem)?.label || 
               navigationItems.find(item => item.children?.some(child => child.id === activeItem))?.children?.find(child => child.id === activeItem)?.label ||
               'Dashboard Overview'}
            </h2>
            <div className="text-gray-600">
              {renderMainContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderDashboard; 
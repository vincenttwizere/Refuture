import React, { useState } from 'react';
import { 
  Home, 
  User, 
  FileText, 
  Search, 
  Send, 
  Clock, 
  MessageCircle, 
  BookOpen, 
  Bell, 
  Award, 
  Briefcase, 
  DollarSign, 
  Users, 
  Calendar,
  Settings,
  HelpCircle,
  ChevronRight,
  ChevronDown
} from 'lucide-react';

const RefugeeDashboard = () => {
  const [activeItem, setActiveItem] = useState('overview');
  const [expandedSections, setExpandedSections] = useState({
    opportunities: true,
    applications: true,
    profile: true
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const navigationItems = [
    {
      id: 'overview',
      label: 'Dashboard Overview',
      icon: Home,
      description: 'Quick stats, recent activities, upcoming deadlines'
    },
    {
      id: 'profile',
      label: 'My Profile',
      icon: User,
      isSection: true,
      children: [
        {
          id: 'profile-view',
          label: 'View Profile',
          icon: User,
          description: 'Public profile visibility'
        },
        {
          id: 'profile-edit',
          label: 'Edit Profile',
          icon: FileText,
          description: 'Personal info, skills, experience'
        },
        {
          id: 'documents',
          label: 'Documents',
          icon: FileText,
          description: 'CV, transcripts, certificates, motivation letters'
        }
      ]
    },
    {
      id: 'opportunities',
      label: 'Opportunities',
      icon: Search,
      isSection: true,
      children: [
        {
          id: 'browse-opportunities',
          label: 'Browse All',
          icon: Search,
          description: 'Search scholarships, jobs, mentorships, funding'
        },
        {
          id: 'scholarships',
          label: 'Scholarships',
          icon: Award,
          description: 'Educational funding opportunities'
        },
        {
          id: 'jobs',
          label: 'Job Opportunities',
          icon: Briefcase,
          description: 'Employment positions'
        },
        {
          id: 'mentorships',
          label: 'Mentorships',
          icon: Users,
          description: 'Career guidance and support'
        },
        {
          id: 'funding',
          label: 'Funding',
          icon: DollarSign,
          description: 'Investment and financial support'
        }
      ]
    },
    {
      id: 'applications',
      label: 'My Applications',
      icon: Send,
      isSection: true,
      children: [
        {
          id: 'application-status',
          label: 'Application Status',
          icon: Clock,
          description: 'Track all submitted applications'
        },
        {
          id: 'saved-opportunities',
          label: 'Saved Opportunities',
          icon: BookOpen,
          description: 'Bookmarked opportunities'
        },
        {
          id: 'interview-schedule',
          label: 'Interviews',
          icon: Calendar,
          description: 'Scheduled interviews and meetings'
        }
      ]
    },
    {
      id: 'messages',
      label: 'Messages',
      icon: MessageCircle,
      description: 'Communication with sponsors, employers, mentors',
      badge: '3'
    },
    {
      id: 'learning',
      label: 'Learning Resources',
      icon: BookOpen,
      description: 'Career guidance, skill development, tutorials'
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: Bell,
      description: 'Alerts, deadlines, updates',
      badge: '5'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      description: 'Account preferences, privacy, notifications'
    },
    {
      id: 'support',
      label: 'Help & Support',
      icon: HelpCircle,
      description: 'FAQ, contact support, platform guide'
    }
  ];

  const renderMenuItem = (item, isChild = false) => {
    const Icon = item.icon;
    const isActive = activeItem === item.id;
    
    if (item.isSection) {
      const isExpanded = expandedSections[item.id];
      return (
        <div key={item.id} className="mb-2">
          <button
            onClick={() => toggleSection(item.id)}
            className="w-full flex items-center justify-between px-3 py-2 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <div className="flex items-center">
              <Icon className="h-5 w-5 mr-3 text-gray-500" />
              {item.label}
            </div>
            {isExpanded ? 
              <ChevronDown className="h-4 w-4 text-gray-400" /> : 
              <ChevronRight className="h-4 w-4 text-gray-400" />
            }
          </button>
          {isExpanded && (
            <div className="ml-4 mt-1 space-y-1">
              {item.children.map(child => renderMenuItem(child, true))}
            </div>
          )}
        </div>
      );
    }

    return (
      <div key={item.id} className="mb-1">
        <button
          onClick={() => setActiveItem(item.id)}
          className={`w-full flex items-center justify-between px-3 py-2 text-left text-sm rounded-lg transition-colors ${
            isActive 
              ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-500' 
              : 'text-gray-700 hover:bg-gray-50'
          } ${isChild ? 'ml-2' : ''}`}
        >
          <div className="flex items-center">
            <Icon className={`h-5 w-5 mr-3 ${isActive ? 'text-blue-600' : 'text-gray-500'}`} />
            <div>
              <div className="font-medium">{item.label}</div>
              {item.description && (
                <div className="text-xs text-gray-500 mt-0.5">{item.description}</div>
              )}
            </div>
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

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-80 bg-white shadow-lg overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">Refugee Dashboard</h1>
          <p className="text-sm text-gray-600 mt-1">Showcase your talents, find opportunities</p>
        </div>

        {/* Navigation */}
        <nav className="p-4">
          {navigationItems.map(item => renderMenuItem(item))}
        </nav>

        {/* Quick Stats */}
        <div className="p-4 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Quick Stats</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Applications Submitted</span>
              <span className="font-medium">12</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Profile Views</span>
              <span className="font-medium">47</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Saved Opportunities</span>
              <span className="font-medium">8</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {navigationItems.find(item => item.id === activeItem)?.label || 
               navigationItems.find(item => item.children?.some(child => child.id === activeItem))?.children?.find(child => child.id === activeItem)?.label ||
               'Dashboard Overview'}
            </h2>
            <div className="text-gray-600">
              {activeItem === 'overview' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h3 className="font-medium text-blue-900">Active Applications</h3>
                      <p className="text-2xl font-bold text-blue-600 mt-2">5</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h3 className="font-medium text-green-900">Interviews Scheduled</h3>
                      <p className="text-2xl font-bold text-green-600 mt-2">2</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <h3 className="font-medium text-purple-900">New Opportunities</h3>
                      <p className="text-2xl font-bold text-purple-600 mt-2">8</p>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">Recent Activity</h3>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                        <span>New scholarship opportunity matches your profile</span>
                        <span className="text-gray-500 ml-auto">2 hours ago</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                        <span>Interview scheduled with Tech Corp</span>
                        <span className="text-gray-500 ml-auto">1 day ago</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {activeItem !== 'overview' && (
                <p>This section would contain the detailed content for the selected navigation item.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RefugeeDashboard; 
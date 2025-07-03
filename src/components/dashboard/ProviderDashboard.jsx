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
  Star
} from 'lucide-react';

const ProviderDashboard = () => {
  const [activeItem, setActiveItem] = useState('overview');
  const [expandedSections, setExpandedSections] = useState({
    talent: true,
    opportunities: true,
    applications: true
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
      description: 'Quick stats, recent activities, insights'
    },
    {
      id: 'talent',
      label: 'Talent Discovery',
      icon: Users,
      isSection: true,
      children: [
        {
          id: 'search-talent',
          label: 'Search Talent',
          icon: Search,
          description: 'Find refugees by skills, category, location'
        },
        {
          id: 'students',
          label: 'Students',
          icon: Award,
          description: 'Academic talent seeking education'
        },
        {
          id: 'job-seekers',
          label: 'Job Seekers',
          icon: Briefcase,
          description: 'Professional talent seeking employment'
        },
        {
          id: 'undocumented-talent',
          label: 'Undocumented Talent',
          icon: UserCheck,
          description: 'Skilled individuals without formal credentials'
        },
        {
          id: 'favorite-profiles',
          label: 'Favorite Profiles',
          icon: Star,
          description: 'Saved and bookmarked talent profiles'
        }
      ]
    },
    {
      id: 'opportunities',
      label: 'My Opportunities',
      icon: FileText,
      isSection: true,
      children: [
        {
          id: 'create-opportunity',
          label: 'Create New',
          icon: Plus,
          description: 'Post scholarships, jobs, mentorships, funding'
        },
        {
          id: 'manage-opportunities',
          label: 'Manage Posts',
          icon: Edit,
          description: 'Edit and update your opportunities'
        },
        {
          id: 'scholarships-posted',
          label: 'My Scholarships',
          icon: Award,
          description: 'Educational funding opportunities'
        },
        {
          id: 'jobs-posted',
          label: 'My Job Posts',
          icon: Briefcase,
          description: 'Employment positions posted'
        },
        {
          id: 'mentorships-posted',
          label: 'My Mentorships',
          icon: Users,
          description: 'Mentorship programs offered'
        },
        {
          id: 'funding-posted',
          label: 'My Funding',
          icon: DollarSign,
          description: 'Investment opportunities posted'
        }
      ]
    },
    {
      id: 'applications',
      label: 'Applications',
      icon: FileText,
      isSection: true,
      children: [
        {
          id: 'all-applications',
          label: 'All Applications',
          icon: FileText,
          description: 'View all applications received'
        },
        {
          id: 'pending-review',
          label: 'Pending Review',
          icon: Clock,
          description: 'Applications awaiting your review',
          badge: '12'
        },
        {
          id: 'shortlisted',
          label: 'Shortlisted',
          icon: UserCheck,
          description: 'Candidates selected for next stage'
        },
        {
          id: 'interview-scheduled',
          label: 'Interview Scheduled',
          icon: Calendar,
          description: 'Candidates with scheduled interviews'
        }
      ]
    },
    {
      id: 'communications',
      label: 'Communications',
      icon: MessageCircle,
      description: 'Messages with candidates, direct invitations',
      badge: '7'
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3,
      description: 'Performance metrics, application insights'
    },
    {
      id: 'interviews',
      label: 'Interview Manager',
      icon: Calendar,
      description: 'Schedule and manage interviews'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      description: 'Account preferences, organization profile'
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
              ? 'bg-green-50 text-green-700 border-r-2 border-green-500' 
              : 'text-gray-700 hover:bg-gray-50'
          } ${isChild ? 'ml-2' : ''}`}
        >
          <div className="flex items-center">
            <Icon className={`h-5 w-5 mr-3 ${isActive ? 'text-green-600' : 'text-gray-500'}`} />
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
          <h1 className="text-xl font-bold text-gray-900">Provider Dashboard</h1>
          <p className="text-sm text-gray-600 mt-1">Discover talent, post opportunities</p>
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
              <span className="text-gray-600">Active Opportunities</span>
              <span className="font-medium">8</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Applications Received</span>
              <span className="font-medium">156</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Interviews Scheduled</span>
              <span className="font-medium">12</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Hired/Funded</span>
              <span className="font-medium">23</span>
            </div>
          </div>
        </div>
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
              {activeItem === 'overview' && (
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

export default ProviderDashboard; 
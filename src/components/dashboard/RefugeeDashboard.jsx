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
  ChevronDown,
  LogOut,
  AlertCircle,
  MapPin,
  Eye,
  Filter
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useOpportunities } from '../../hooks/useOpportunities';
import { useInterviews } from '../../hooks/useInterviews';
import { useProfiles } from '../../hooks/useProfiles';
import { useNotifications } from '../../hooks/useNotifications';
import { useMessages } from '../../hooks/useMessages';
import ProfileView from '../profiles/ProfileView';
import CreateProfile from '../profiles/CreateProfile';

const RefugeeDashboard = () => {
  const [activeItem, setActiveItem] = useState('overview');
  const [expandedSections, setExpandedSections] = useState({
    opportunities: true,
    applications: true,
    profile: true
  });
  const [opportunityType, setOpportunityType] = useState('all');
  const [profileMode, setProfileMode] = useState('view');

  const { logout, user, loading } = useAuth();
  const navigate = useNavigate();

  // Fetch real data from API
  const { 
    opportunities, 
    loading: opportunitiesLoading, 
    error: opportunitiesError 
  } = useOpportunities();

  const { 
    interviews, 
    loading: interviewsLoading, 
    error: interviewsError 
  } = useInterviews('refugee');

  const { 
    profiles, 
    loading: profileLoading, 
    error: profileError 
  } = useProfiles({ email: user?.email });
  const profile = profiles && profiles.length > 0 ? profiles[0] : null;

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
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'opportunities', label: 'Opportunities', icon: Search },
    { id: 'applications', label: 'My Applications', icon: Send },
    { id: 'messages', label: 'Messages', icon: MessageCircle },
    { id: 'learning', label: 'Learning Resources', icon: BookOpen },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'support', label: 'Help & Support', icon: HelpCircle }
  ];

  // Subitems for each main category
  const subItems = {
    profile: [
      { label: 'View Profile', icon: User },
      { label: 'Edit Profile', icon: FileText },
      { label: 'Documents', icon: FileText }
    ],
    opportunities: [
      { label: 'Browse All', icon: Search },
      { label: 'Scholarships', icon: Award },
      { label: 'Job Opportunities', icon: Briefcase },
      { label: 'Mentorships', icon: Users },
      { label: 'Funding', icon: DollarSign }
    ],
    applications: [
      { label: 'Application Status', icon: Clock },
      { label: 'Saved Opportunities', icon: BookOpen },
      { label: 'Interviews', icon: Calendar }
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
      // Calculate real statistics
      const activeApplications = interviews.filter(int => int.status === 'pending' || int.status === 'accepted').length;
      const interviewsScheduled = interviews.filter(int => int.status === 'accepted').length;
      const newOpportunities = opportunities.filter(opp => opp.isActive).length;

      return (
        <div className="space-y-6">
          {/* Error Display */}
          {(opportunitiesError || interviewsError || profileError) && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                <p className="text-red-800 text-sm">
                  {opportunitiesError || interviewsError || profileError}
                </p>
              </div>
            </div>
          )}

          {/* Loading State */}
          {(opportunitiesLoading || interviewsLoading || profileLoading) && (
            <div className="space-y-4">
              <div className="animate-pulse">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="bg-gray-200 p-4 rounded-lg h-20"></div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Real Data Display */}
          {!opportunitiesLoading && !interviewsLoading && !profileLoading && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-medium text-blue-900">Active Applications</h3>
                  <p className="text-2xl font-bold text-blue-600 mt-2">{activeApplications}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-medium text-green-900">Interviews Scheduled</h3>
                  <p className="text-2xl font-bold text-green-600 mt-2">{interviewsScheduled}</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="font-medium text-purple-900">Available Opportunities</h3>
                  <p className="text-2xl font-bold text-purple-600 mt-2">{newOpportunities}</p>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Recent Activity</h3>
                <div className="space-y-2">
                  {interviews.slice(0, 3).map((interview) => (
                    <div key={interview._id} className="flex items-center text-sm">
                      <div className={`w-2 h-2 rounded-full mr-3 ${
                        interview.status === 'pending' ? 'bg-yellow-500' :
                        interview.status === 'accepted' ? 'bg-green-500' :
                        interview.status === 'declined' ? 'bg-red-500' :
                        'bg-blue-500'
                      }`}></div>
                      <span>
                        {interview.status === 'pending' ? 'Interview invitation received from ' :
                         interview.status === 'accepted' ? 'Interview accepted with ' :
                         interview.status === 'declined' ? 'Interview declined with ' :
                         'Interview with '}
                        {interview.providerId?.firstName} {interview.providerId?.lastName}
                      </span>
                      <span className="text-gray-500 ml-auto">
                        {new Date(interview.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                  {interviews.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <MessageCircle className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                      <p>No recent activity</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      );
    }
    if (activeItem === 'opportunities') {
      // Opportunity type tabs
      const typeTabs = [
        { label: 'All', value: 'all' },
        { label: 'Scholarships', value: 'scholarship' },
        { label: 'Jobs', value: 'job' },
        { label: 'Internships', value: 'internship' },
        { label: 'Mentorships', value: 'mentorship' },
        { label: 'Funding', value: 'funding' }
      ];
      // Filtered opportunities
      const filteredOpportunities = opportunityType === 'all'
        ? opportunities
        : opportunities.filter(opp => opp.type === opportunityType);
      return (
        <div className="space-y-6">
          {/* Tabs/Filters */}
          <div className="flex space-x-2 mb-4">
            {typeTabs.map(tab => (
              <button
                key={tab.value}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  opportunityType === tab.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-blue-50'
                }`}
                onClick={() => setOpportunityType(tab.value)}
              >
                {tab.label}
              </button>
            ))}
          </div>
          {/* Error Display */}
          {opportunitiesError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                <p className="text-red-800 text-sm">{opportunitiesError}</p>
              </div>
            </div>
          )}
          {/* Loading State */}
          {opportunitiesLoading && (
            <div className="space-y-4">
              <div className="animate-pulse">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[1, 2, 3, 4, 5, 6].map(i => (
                    <div key={i} className="bg-gray-200 p-6 rounded-lg h-32"></div>
                  ))}
                </div>
              </div>
            </div>
          )}
          {/* Real Opportunities Display */}
          {!opportunitiesLoading && (
            <>
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Available Opportunities</h3>
                <div className="flex space-x-2">
                  <button className="bg-gray-100 text-gray-700 px-3 py-2 rounded-lg text-sm hover:bg-gray-200 transition-colors">
                    <Filter className="h-4 w-4 inline mr-1" />
                    Filter
                  </button>
                  <button className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors">
                    <Search className="h-4 w-4 inline mr-1" />
                    Search
                  </button>
                </div>
              </div>
              {filteredOpportunities.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredOpportunities.map((opportunity) => (
                    <div key={opportunity._id} className="bg-white rounded-lg shadow border border-gray-200 p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-1">{opportunity.title}</h4>
                          <p className="text-sm text-gray-600">{opportunity.providerName}</p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          opportunity.type === 'scholarship' ? 'bg-green-100 text-green-800' :
                          opportunity.type === 'job' ? 'bg-blue-100 text-blue-800' :
                          opportunity.type === 'mentorship' ? 'bg-purple-100 text-purple-800' :
                          opportunity.type === 'internship' ? 'bg-yellow-100 text-yellow-800' :
                          opportunity.type === 'funding' ? 'bg-orange-100 text-orange-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {opportunity.type}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 mb-4 line-clamp-2">
                        {opportunity.description}
                      </p>
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="h-4 w-4 mr-2" />
                          {opportunity.location}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Briefcase className="h-4 w-4 mr-2" />
                          {opportunity.category}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Clock className="h-4 w-4 mr-2" />
                          Deadline: {new Date(opportunity.applicationDeadline).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button className="flex-1 bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700 transition-colors">
                          <Eye className="h-4 w-4 inline mr-1" />
                          View Details
                        </button>
                        <button className="flex-1 bg-gray-50 text-gray-700 px-3 py-2 rounded text-sm hover:bg-gray-100 transition-colors">
                          <BookOpen className="h-4 w-4 inline mr-1" />
                          Save
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Search className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No opportunities available</h3>
                  <p className="text-gray-600 mb-6">Check back later for new opportunities that match your profile</p>
                </div>
              )}
            </>
          )}
        </div>
      );
    }

    if (activeItem === 'messages') {
      return (
        <div className="space-y-6">
          {/* Error Display */}
          {interviewsError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                <p className="text-red-800 text-sm">{interviewsError}</p>
              </div>
            </div>
          )}

          {/* Loading State */}
          {interviewsLoading && (
            <div className="space-y-4">
              <div className="animate-pulse">
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="bg-gray-200 p-6 rounded-lg h-24"></div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Real Messages Display */}
          {!interviewsLoading && (
            <>
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Interview Messages</h3>
              </div>

              {interviews.length > 0 ? (
                <div className="space-y-4">
                  {interviews.map((interview) => (
                    <div key={interview._id} className="bg-white rounded-lg shadow border border-gray-200 p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-1">
                            {interview.providerId?.firstName} {interview.providerId?.lastName}
                          </h4>
                          <p className="text-sm text-gray-600">{interview.title}</p>
                        </div>
                        <span className={`text-xs px-3 py-1 rounded-full ${
                          interview.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          interview.status === 'accepted' ? 'bg-green-100 text-green-800' :
                          interview.status === 'declined' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {interview.status}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-700 mb-4">
                        {interview.description}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2" />
                            {interview.scheduledDate ? new Date(interview.scheduledDate).toLocaleDateString() : 'Not scheduled'}
                          </div>
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-2" />
                            {interview.location || 'Remote'}
                          </div>
                        </div>
                        
                        <div className="flex space-x-2">
                          {interview.status === 'pending' && (
                            <>
                              <button className="bg-green-50 text-green-700 px-3 py-2 rounded text-sm hover:bg-green-100 transition-colors">
                                Accept
                              </button>
                              <button className="bg-red-50 text-red-700 px-3 py-2 rounded text-sm hover:bg-red-100 transition-colors">
                                Decline
                              </button>
                            </>
                          )}
                          <button className="bg-blue-50 text-blue-700 px-3 py-2 rounded text-sm hover:bg-blue-100 transition-colors">
                            <MessageCircle className="h-4 w-4 inline mr-1" />
                            Reply
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <MessageCircle className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No messages yet</h3>
                  <p className="text-gray-600 mb-6">When providers reach out to you, their messages will appear here</p>
                </div>
              )}
            </>
          )}
        </div>
      );
    }

    if (subItems[activeItem]) {
      // Profile section: handle view/edit
      if (activeItem === 'profile') {
        return (
          <div className="w-full">
            {profileMode === 'view' ? (
              <ProfileView profile={profile} onEdit={() => setProfileMode('edit')} />
            ) : (
              <CreateProfile />
            )}
            <div className="flex flex-row flex-wrap gap-4 mt-4">
              {subItems[activeItem].map((sub, idx) => (
                <div
                  key={idx}
                  className="flex items-center p-4 bg-white rounded-lg shadow border border-gray-100 min-w-[220px] cursor-pointer hover:bg-blue-50 transition"
                  onClick={() => {
                    if (sub.label === 'View Profile') setProfileMode('view');
                    if (sub.label === 'Edit Profile') setProfileMode('edit');
                  }}
                >
                  <sub.icon className="h-6 w-6 text-blue-500 mr-4" />
                  <div className="font-medium text-gray-900">{sub.label}</div>
                  {sub.badge && (
                    <span className="ml-auto bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">{sub.badge}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      }
      return (
        <div className="flex flex-row flex-wrap gap-4">
          {subItems[activeItem].map((sub, idx) => (
            <div
              key={idx}
              className="flex items-center p-4 bg-white rounded-lg shadow border border-gray-100 min-w-[220px] cursor-pointer hover:bg-blue-50 transition"
              onClick={() => {
                if (activeItem === 'profile' && (sub.label === 'View Profile' || sub.label === 'Edit Profile')) {
                  navigate('/create-profile');
                }
              }}
            >
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
      {/* Sidebar - Fixed */}
      <div className="w-80 bg-white shadow-lg fixed h-full overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">Refugee Dashboard</h1>
          <p className="text-sm text-gray-600 mt-1">Showcase your talents, find opportunities</p>
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
    </div>
  );
};

export default RefugeeDashboard; 
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Home, 
  User, 
  Search, 
  MessageCircle, 
  Bell, 
  Calendar,
  Settings,
  HelpCircle,
  LogOut,
  AlertCircle,
  MapPin,
  Filter,
  XCircle
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useOpportunities } from '../../hooks/useOpportunities';
import { useInterviews } from '../../hooks/useInterviews';
import { useApplications } from '../../hooks/useApplications';
import { useProfiles } from '../../hooks/useProfiles';
import { useNotifications } from '../../hooks/useNotifications';
import { useMessages } from '../../hooks/useMessages';
import { messagesAPI, notificationsAPI } from '../../services/api';
import ProfileView from '../profiles/ProfileView';
import CreateProfile from '../profiles/CreateProfile';
import MessageCenter from '../messaging/MessageCenter';

// Utility: shallow array equality
function shallowArrayEqual(arr1, arr2) {
  if (arr1 === arr2) return true;
  if (!arr1 || !arr2) return false;
  if (arr1.length !== arr2.length) return false;
  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i] !== arr2[i]) return false;
  }
  return true;
}

// Helper functions for avatar and initials (from ProviderDashboard)
function getAvatarColor(name) {
  const colors = [
    'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500',
    'bg-indigo-500', 'bg-yellow-500', 'bg-red-500', 'bg-teal-500'
  ];
  if (!name) return colors[0];
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
}

function getInitials(name) {
  if (!name) return '';
  const names = name.split(' ');
  if (names.length === 1) return names[0].charAt(0).toUpperCase();
  return names[0].charAt(0).toUpperCase() + names[names.length - 1].charAt(0).toUpperCase();
}

// Group messages into conversations (from ProviderDashboard)
function groupMessagesByConversation(messages, user) {
  const conversationMap = new Map();
  messages.forEach(message => {
    const senderId = typeof message.sender === 'object' ? message.sender._id : message.sender;
    const recipientId = typeof message.recipient === 'object' ? message.recipient._id : message.recipient;
    const currentUserId = typeof user._id === 'object' ? user._id.toString() : user._id;
    const isReceived = recipientId === currentUserId;
    const otherUserId = isReceived ? senderId : recipientId;
    const otherUserName = isReceived ? message.senderName : message.recipientName;
    if (!conversationMap.has(otherUserId)) {
      conversationMap.set(otherUserId, {
        userId: otherUserId,
        userName: otherUserName,
        messages: [],
        messageCount: 0,
        unreadCount: 0,
        lastMessage: null,
        date: '',
        status: 'Open Conversation'
      });
    }
    const conversation = conversationMap.get(otherUserId);
    conversation.messages.push(message);
    conversation.messageCount = conversation.messages.length;
    if (!conversation.lastMessage || new Date(message.createdAt) > new Date(conversation.lastMessage.createdAt)) {
      conversation.lastMessage = message;
      conversation.date = new Date(message.createdAt).toLocaleDateString();
    }
    if (isReceived && !message.isRead) {
      conversation.unreadCount++;
    }
  });
  // Convert map to array and sort messages within each conversation
  const conversations = Array.from(conversationMap.values()).map(conversation => {
    conversation.messages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    return conversation;
  });
  // Sort conversations by most recent message
  return conversations.sort((a, b) => new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt));
}

const RefugeeDashboard = () => {
  // Core state
  const [activeItem, setActiveItem] = useState('overview');
  const [opportunityType, setOpportunityType] = useState('all');
  const [profileMode, setProfileMode] = useState('view');
  const [showMessageCenter, setShowMessageCenter] = useState(false);
  const [dismissedReminders, setDismissedReminders] = useState([]);

  // Auth and navigation
  const { logout, user, loading } = useAuth();
  const navigate = useNavigate();

  // Data hooks
  const { 
    opportunities, 
    loading: opportunitiesLoading, 
    error: opportunitiesError, 
    isTimeout: opportunitiesTimeout, 
    refetch: refetchOpportunities 
  } = useOpportunities();

  const { 
    interviews, 
    loading: interviewsLoading, 
    error: interviewsError,
    refetch: refetchInterviews,
    respondToInterview
  } = useInterviews('refugee');

  const { 
    applications, 
     loading: applicationsLoading, 
    error: applicationsError 
  } = useApplications(null, 'refugee');

  const profileFilters = useMemo(() => ({ email: user?.email }), [user?.email]);
  const { 
    profiles, 
    loading: profileLoading, 
    error: profileError, 
    isTimeout: profileTimeout, 
    refetch: refetchProfile 
  } = useProfiles({ email: user?.email });

  const { notifications, refetch: refetchNotifications } = useNotifications();
  const { messages, loading: messagesLoading, error: messagesError, refetch: refetchMessages } = useMessages();

  // Use hook data directly for display with safety checks
  const displayOpportunities = Array.isArray(opportunities) ? opportunities : [];
  const displayInterviews = Array.isArray(interviews) ? interviews : [];
  const displayApplications = Array.isArray(applications) ? applications : [];
  const displayProfiles = Array.isArray(profiles) ? profiles : [];
  const displayMessages = Array.isArray(messages) ? messages : [];
  const displayNotifications = Array.isArray(notifications) ? notifications : [];

  // Derived data with safety checks
  const profile = displayProfiles && displayProfiles.length > 0 ? displayProfiles[0] : null;
  const unreadNotificationsCount = displayNotifications.filter(notification => !notification.isRead).length;
  const unreadMessagesCount = displayMessages.filter(message => !message.isRead && message.recipient === user?._id).length;

  // Navigation items - only implemented sections
  const navigationItems = [
    { id: 'overview', label: 'Dashboard Overview', icon: Home },
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'opportunities', label: 'Opportunities', icon: Search },
    { id: 'interviews', label: 'Interviews', icon: Calendar, badge: displayInterviews.filter(int => int.status === 'invited').length > 0 ? displayInterviews.filter(int => int.status === 'invited').length : null },
    { id: 'messages', label: 'Messages', icon: MessageCircle, badge: unreadMessagesCount > 0 ? unreadMessagesCount : null },
    { id: 'notifications', label: 'Notifications', icon: Bell, badge: unreadNotificationsCount > 0 ? unreadNotificationsCount : null },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'support', label: 'Help & Support', icon: HelpCircle }
  ];

  // Real-time polling
  useEffect(() => {
    const interval = setInterval(() => {
      refetchNotifications();
      refetchMessages();
    }, 30000);
    return () => clearInterval(interval);
  }, [refetchNotifications, refetchMessages]);

  // Profile redirect
  useEffect(() => {
    if (!profileLoading && !profile) {
      navigate('/create-profile', { replace: true });
    }
  }, [profileLoading, profile, navigate]);

  // Loading and error states
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading user...</div>;
  if (!user) return <div className="min-h-screen flex items-center justify-center text-red-600">User not found. Please log in again.</div>;
  if (!profile) {
    return <div className="min-h-screen flex items-center justify-center">No profile found. Redirecting to create profile...</div>;
  }

  if (opportunitiesTimeout || profileTimeout) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-red-600">
        <div className="mb-4 text-lg font-semibold">Server is taking too long to respond.</div>
        <div className="mb-4">This may be due to a slow backend or network issue. Please try again.</div>
        <button
          onClick={() => {
            if (opportunitiesTimeout) refetchOpportunities();
            if (profileTimeout) refetchProfile();
          }}
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  // Helper functions
  const markMessageAsRead = async (messageId) => {
    try {
      await messagesAPI.markAsRead(messageId);
      refetchMessages();
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  const markNotificationAsRead = async (notificationId) => {
    try {
      await notificationsAPI.markAsRead(notificationId);
      refetchNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Render navigation item
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

  // Render main content
  const renderMainContent = () => {
    switch (activeItem) {
      case 'overview':
        return <OverviewSection 
          opportunities={displayOpportunities}
          interviews={displayInterviews}
          applications={displayApplications}
          opportunitiesLoading={opportunitiesLoading}
          interviewsLoading={interviewsLoading}
          applicationsLoading={applicationsLoading}
          opportunitiesError={opportunitiesError}
          interviewsError={interviewsError}
          applicationsError={applicationsError}
        />;

      case 'opportunities':
        return <OpportunitiesSection 
          opportunities={displayOpportunities}
          opportunityType={opportunityType}
          setOpportunityType={setOpportunityType}
          loading={opportunitiesLoading}
          error={opportunitiesError}
          navigate={navigate}
        />;

      case 'interviews':
        return <InterviewsSection 
          interviews={displayInterviews}
          loading={interviewsLoading}
          error={interviewsError}
          respondToInterview={respondToInterview}
        />;

      case 'messages':
        return <MessagesSection 
          messages={displayMessages}
          loading={messagesLoading}
          error={messagesError}
          user={user}
          markMessageAsRead={markMessageAsRead}
          setShowMessageCenter={setShowMessageCenter}
        />;

      case 'notifications':
        return <NotificationsSection 
          notifications={displayNotifications}
          markNotificationAsRead={markNotificationAsRead}
          navigate={navigate}
          setActiveItem={setActiveItem}
        />;

      case 'profile':
        return <ProfileSection 
          profile={profile}
          profileMode={profileMode}
          setProfileMode={setProfileMode}
          refetchProfile={refetchProfile}
        />;

      case 'settings':
        return <SettingsSection />;

      case 'support':
        return <SupportSection />;

      default:
        return <div className="text-gray-500">Select a section to view details.</div>;
    }
  };

  // Get upcoming interviews for reminders with safety checks
  const now = new Date();
  const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const upcomingInterviews = displayInterviews
    .filter(int => int && int.status === 'scheduled' && int.scheduledDate &&
      new Date(int.scheduledDate) > now && new Date(int.scheduledDate) <= in24h &&
      !dismissedReminders.includes(int._id)
    )
    .sort((a, b) => new Date(a.scheduledDate) - new Date(b.scheduledDate));

  const dismissReminder = (id) => setDismissedReminders(prev => [...prev, id]);

  return (
    <div>
      {/* Interview Reminders */}
      {upcomingInterviews.length > 0 && (
        <div className="max-w-4xl mx-auto mt-6 mb-4">
          {upcomingInterviews.map(interview => (
            <div key={interview._id} className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-4 mb-2 shadow">
              <div className="flex items-center">
                <Calendar className="h-6 w-6 text-blue-600 mr-3" />
                <div>
                  <div className="font-semibold text-blue-900">Upcoming Interview: {interview.title}</div>
                  <div className="text-sm text-blue-800">
                    {interview.scheduledDate ? new Date(interview.scheduledDate).toLocaleString() : 'Date/Time TBD'}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {interview.meetingLink && (
                  <a
                    href={interview.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                  >
                    Join
                  </a>
                )}
                <button
                  onClick={() => dismissReminder(interview._id)}
                  className="ml-2 p-1 rounded-full hover:bg-blue-100"
                  title="Dismiss reminder"
                >
                  <XCircle className="h-5 w-5 text-blue-400" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Main Dashboard */}
      <div className="flex h-screen bg-gray-50">
        {/* Sidebar */}
        <div className="w-80 bg-white shadow-lg fixed h-full overflow-y-auto">
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-xl font-bold text-gray-900">Refugee Dashboard</h1>
            <p className="text-sm text-gray-600 mt-1">Showcase your talents, find opportunities</p>
          </div>

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

        {/* Main Content */}
        <div className="flex-1 ml-80 overflow-y-auto">
          <div className="p-8">
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  {navigationItems.find(item => item.id === activeItem)?.label || 'Dashboard Overview'}
                </h2>
                <div className="text-gray-600">
                  {renderMainContent()}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* MessageCenter Modal */}
        <MessageCenter
          isOpen={showMessageCenter}
          onClose={() => setShowMessageCenter(false)}
        />
      </div>
    </div>
  );
};

// Overview Section Component
const OverviewSection = ({ opportunities = [], interviews = [], applications = [], opportunitiesLoading, interviewsLoading, applicationsLoading, opportunitiesError, interviewsError, applicationsError }) => {
  const activeApplications = applications.filter(app => 
    app.status === 'pending' || app.status === 'accepted' || app.status === 'under_review'
  ).length;
  
  const interviewsScheduled = interviews.filter(int => 
    int.status === 'accepted' || int.status === 'scheduled'
  ).length;
  
  const newOpportunities = opportunities.filter(opp => opp.isActive).length;

  // Only show loading if we have no data at all
  const hasAnyData = opportunities.length > 0 || interviews.length > 0 || applications.length > 0;
  const showLoading = !hasAnyData && (opportunitiesLoading || interviewsLoading || applicationsLoading);

  return (
    <div className="space-y-6">
      {/* Error Display */}
      {(opportunitiesError || interviewsError || applicationsError) && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
            <p className="text-red-800 text-sm">
              {opportunitiesError || interviewsError || applicationsError}
            </p>
          </div>
        </div>
      )}

      {/* Loading State - only show if we have no data */}
      {showLoading && (
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

      {/* Data Display - always show if we have data */}
      {hasAnyData && (
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
              {[...applications.slice(0, 2), ...interviews.slice(0, 2)]
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .slice(0, 4)
                .map((item) => {
                  const isApplication = item.hasOwnProperty('opportunityId');
                  return (
                    <div key={item._id} className="flex items-center text-sm">
                      <div className={`w-2 h-2 rounded-full mr-3 ${
                        isApplication ? (
                          item.status === 'pending' ? 'bg-yellow-500' :
                          item.status === 'accepted' ? 'bg-green-500' :
                          item.status === 'rejected' ? 'bg-red-500' :
                          'bg-blue-500'
                        ) : (
                          item.status === 'pending' ? 'bg-yellow-500' :
                          item.status === 'accepted' ? 'bg-green-500' :
                          item.status === 'declined' ? 'bg-red-500' :
                          'bg-blue-500'
                        )
                      }`}></div>
                      <span>
                        {isApplication ? (
                          <>
                            {item.status === 'pending' ? 'Application submitted for ' :
                             item.status === 'accepted' ? 'Application accepted for ' :
                             item.status === 'rejected' ? 'Application rejected for ' :
                             'Application for '}
                            {item.opportunityId?.title || 'Opportunity'}
                          </>
                        ) : (
                          <>
                            {item.status === 'pending' ? 'Interview invitation received from ' :
                             item.status === 'accepted' ? 'Interview accepted with ' :
                             item.status === 'declined' ? 'Interview declined with ' :
                             'Interview with '}
                            {item.providerId?.firstName && item.providerId?.lastName
                              ? `${item.providerId.firstName} ${item.providerId.lastName}`
                              : 'Unknown Provider'
                            }
                          </>
                        )}
                      </span>
                      <span className="text-gray-500 ml-auto">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  );
                })}
              {applications.length === 0 && interviews.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <MessageCircle className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>No recent activity</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Show empty state if no data and not loading */}
      {!hasAnyData && !showLoading && (
        <div className="text-center py-12">
          <Home className="h-16 w-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Welcome to your dashboard!</h3>
          <p className="text-gray-600">Start by exploring opportunities and building your profile.</p>
        </div>
      )}
    </div>
  );
};

// Opportunities Section Component
const OpportunitiesSection = ({ opportunities, opportunityType, setOpportunityType, loading, error, navigate }) => {
  const typeTabs = [
    { label: 'All', value: 'all' },
    { label: 'Scholarships', value: 'scholarship' },
    { label: 'Jobs', value: 'job' },
    { label: 'Internships', value: 'internship' },
    { label: 'Mentorships', value: 'mentorship' },
    { label: 'Funding', value: 'funding' }
  ];

  const filteredOpportunities = opportunityType === 'all'
    ? opportunities
    : opportunities.filter(opp => opp.type === opportunityType);

  // Only show loading if we have no data
  const showLoading = loading && opportunities.length === 0;

  return (
    <div className="space-y-6">
      {/* Tabs */}
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
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Loading State - only show if we have no data */}
      {showLoading && (
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

      {/* Opportunities Display - always show if we have data */}
      {opportunities.length > 0 && (
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
            <div className="overflow-x-auto bg-white rounded-lg border">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Provider</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deadline</th>
                    <th className="px-4 py-2"></th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {filteredOpportunities.map((opportunity) => (
                    <tr key={opportunity._id} className="hover:bg-blue-50 transition-colors">
                      <td className="px-4 py-2">
                        <span className="font-semibold text-gray-900">{opportunity.title}</span>
                      </td>
                      <td className="px-4 py-2 text-gray-700">{opportunity.providerName}</td>
                      <td className="px-4 py-2">
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
                      </td>
                      <td className="px-4 py-2 text-gray-700">{opportunity.location}</td>
                      <td className="px-4 py-2 text-gray-700">
                        {new Date(opportunity.applicationDeadline).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-2">
                        <button 
                          onClick={() => navigate(`/opportunity/${opportunity._id}`)}
                          className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-sm"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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

      {/* Show empty state if no data and not loading */}
      {opportunities.length === 0 && !showLoading && (
        <div className="text-center py-12">
          <Search className="h-16 w-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No opportunities available</h3>
          <p className="text-gray-600 mb-6">Check back later for new opportunities that match your profile</p>
        </div>
      )}
    </div>
  );
};

// Interviews Section Component
const InterviewsSection = ({ interviews, loading, error, respondToInterview }) => {
  // Only show loading if we have no data
  const showLoading = loading && interviews.length === 0;

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Interviews</h2>
        <p className="text-gray-600">Manage your interview invitations and scheduled interviews</p>
      </div>

      {/* Interview Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Calendar className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">{interviews.filter(int => int.status === 'invited').length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Confirmed</p>
              <p className="text-2xl font-bold text-gray-900">{interviews.filter(int => int.status === 'confirmed').length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Calendar className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Scheduled</p>
              <p className="text-2xl font-bold text-gray-900">{interviews.filter(int => int.status === 'scheduled').length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Calendar className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">{interviews.filter(int => int.status === 'completed').length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Interviews List */}
      {showLoading ? (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => (
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
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      ) : interviews.length > 0 ? (
        <div className="space-y-4">
          {interviews.map((interview) => (
            <div key={interview._id} className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{interview.title}</h3>
                    <p className="text-sm text-gray-500">
                      {interview.providerId?.firstName && interview.providerId?.lastName 
                        ? `${interview.providerId.firstName} ${interview.providerId.lastName}`
                        : interview.organization || 'Unknown Provider'
                      }
                    </p>
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  interview.status === 'invited' ? 'bg-yellow-100 text-yellow-800' :
                  interview.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                  interview.status === 'scheduled' ? 'bg-green-100 text-green-800' :
                  interview.status === 'completed' ? 'bg-purple-100 text-purple-800' :
                  interview.status === 'declined' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {interview.status === 'invited' ? 'Invitation Sent' :
                   interview.status === 'confirmed' ? 'Confirmed' :
                   interview.status === 'scheduled' ? 'Scheduled' :
                   interview.status === 'completed' ? 'Completed' :
                   interview.status === 'declined' ? 'Declined' :
                   interview.status}
                </span>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm">
                  <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                  <span className="text-gray-600">
                    {interview.scheduledDate ? new Date(interview.scheduledDate).toLocaleDateString() : 'Date TBD'}
                  </span>
                </div>
                <div className="flex items-center text-sm">
                  <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                  <span className="text-gray-600">
                    {interview.format === 'video' ? 'Video Call' : 
                     interview.format === 'in-person' ? 'In-Person' : 
                     interview.format === 'phone' ? 'Phone Call' : 
                     interview.format || 'TBD'}
                  </span>
                </div>
              </div>
              
              <div className="flex space-x-2">
                {interview.status === 'invited' && (
                  <>
                    <button
                      onClick={() => respondToInterview(interview._id, {
                        status: 'confirmed',
                        message: 'Interview confirmed by refugee'
                      })}
                      className="text-green-600 hover:text-green-700 text-sm font-medium"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => respondToInterview(interview._id, {
                        status: 'declined',
                        message: 'Interview declined by refugee'
                      })}
                      className="text-red-600 hover:text-red-700 text-sm font-medium"
                    >
                      Decline
                    </button>
                  </>
                )}
                {interview.status === 'scheduled' && interview.meetingLink && (
                  <a
                    href={interview.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    Join Interview
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <Calendar className="h-16 w-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No interviews yet</h3>
          <p className="text-gray-600">You haven't received any interview invitations yet. Keep applying to opportunities!</p>
        </div>
      )}
    </div>
  );
};

// Messages Section Component (copied/adapted from ProviderDashboard)
const MessagesSection = ({ messages, loading, error, user, markMessageAsRead, setShowMessageCenter }) => {
  const [selectedConversation, setSelectedConversation] = React.useState(null);
  const [newMessage, setNewMessage] = React.useState('');
  const [sendingMessage, setSendingMessage] = React.useState(false);

  // Group messages into conversations
  const conversations = React.useMemo(() => groupMessagesByConversation(messages, user), [messages, user]);

  // Send message function (stub, replace with actual API call)
  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || sendingMessage) return;
    setSendingMessage(true);
    // TODO: Implement send message API call
    setTimeout(() => {
      setNewMessage('');
      setSendingMessage(false);
    }, 500);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 p-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="animate-pulse">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
          <p className="text-red-800">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[70vh] bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
      {/* Sidebar - Conversations List */}
      <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-semibold text-gray-900">Messages</h1>
            <button 
              onClick={() => setShowMessageCenter(true)}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <MessageCircle className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.length > 0 ? (
            conversations.map((conversation) => (
              <div
                key={conversation.userId}
                onClick={async () => {
                  setSelectedConversation(conversation);
                  // Mark all unread messages in this conversation as read
                  for (const message of conversation.messages) {
                    if (!message.isRead && message.recipient === user?._id) {
                      await markMessageAsRead(message._id);
                    }
                  }
                }}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedConversation?.userId === conversation.userId ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium text-sm ${getAvatarColor(conversation.userName)}`}>
                    {getInitials(conversation.userName)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-gray-900 truncate">{conversation.userName}</h3>
                      <span className="text-xs text-gray-500">
                        {new Date(conversation.lastMessage.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600 mb-1">
                      <span>{conversation.messages.length} message{conversation.messages.length > 1 ? 's' : ''}</span>
                      <span className="mx-2">•</span>
                      <span className="truncate">
                        {conversation.lastMessage.content.length > 30 
                          ? conversation.lastMessage.content.substring(0, 30) + '...'
                          : conversation.lastMessage.content
                        }
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-green-600">Open Conversation</span>
                      {conversation.unreadCount > 0 && (
                        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                          {conversation.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <MessageCircle className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No conversations yet</h3>
              <p className="text-gray-600 mb-6">When providers reach out to you, their messages will appear here</p>
              <button
                onClick={() => setShowMessageCenter(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Start a Conversation
              </button>
            </div>
          )}
        </div>
      </div>
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium ${getAvatarColor(selectedConversation.userName)}`}>
                  {getInitials(selectedConversation.userName)}
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">{selectedConversation.userName}</h2>
                  <p className="text-sm text-green-500">Open Conversation</p>
                </div>
              </div>
            </div>
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
              <div className="max-w-4xl mx-auto space-y-4">
                {selectedConversation.messages.map((message) => {
                  const senderId = typeof message.sender === 'object' ? message.sender._id : message.sender;
                  const recipientId = typeof message.recipient === 'object' ? message.recipient._id : message.recipient;
                  const currentUserId = typeof user._id === 'object' ? user._id.toString() : user._id;
                  const isOwnMessage = senderId === currentUserId;
                  return (
                    <div key={message._id} className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-md px-4 py-2 rounded-lg ${
                        isOwnMessage 
                          ? 'bg-blue-500 text-white ml-auto' 
                          : 'bg-gray-100 text-gray-900'
                      }`}>
                        <div className="flex-1">
                          <div className="flex items-center justify-end mb-1">
                            <span className="text-xs text-gray-500">
                              {new Date(message.createdAt).toLocaleString()}
                            </span>
                          </div>
                          <p className={`${isOwnMessage ? 'text-white' : 'text-gray-800'}`}>
                            {message.content}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            {/* Input Area */}
            <div className="bg-white border-t border-gray-200 px-6 py-4">
              <div className="max-w-4xl mx-auto flex items-center space-x-4">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={`Reply to ${selectedConversation.userName}...`}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={sendingMessage}
                />
                <button 
                  onClick={sendMessage}
                  disabled={!newMessage.trim() || sendingMessage}
                  className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sendingMessage ? 'Sending...' : 'Send'}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <MessageCircle className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
              <p className="text-gray-600">Choose a conversation from the list to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Notifications Section Component
const NotificationsSection = ({ notifications, markNotificationAsRead, navigate, setActiveItem }) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
        <div className="flex space-x-2">
          <button 
            onClick={async () => {
              for (const notification of notifications) {
                if (!notification.isRead) {
                  await markNotificationAsRead(notification._id);
                }
              }
            }}
            className="bg-gray-100 text-gray-700 px-3 py-2 rounded-lg text-sm hover:bg-gray-200 transition-colors"
          >
            Mark all read
          </button>
          <button className="bg-gray-100 text-gray-700 px-3 py-2 rounded-lg text-sm hover:bg-gray-200 transition-colors">
            <Filter className="h-4 w-4 inline mr-1" />
            Filter
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {notifications && notifications.length > 0 ? (
          notifications.map((notification, index) => (
            <div 
              key={notification._id || index} 
              className={`bg-white rounded-lg shadow border p-4 cursor-pointer transition-colors ${
                !notification.isRead ? 'border-blue-200 bg-blue-50' : 'border-gray-200'
              }`}
              onClick={async () => {
                if (!notification.isRead) {
                  await markNotificationAsRead(notification._id);
                }
                
                if (notification.type === 'new_opportunity' && notification.metadata?.opportunityId) {
                  navigate(`/opportunity/${notification.metadata.opportunityId}`);
                } else if (notification.type === 'new_opportunity') {
                  setActiveItem('opportunities');
                }
              }}
            >
              <div className="flex items-start space-x-3">
                <div className={`p-2 rounded-full ${
                  notification.type === 'new_opportunity' ? 'bg-blue-100' :
                  notification.type === 'interview' ? 'bg-green-100' :
                  notification.type === 'message' ? 'bg-purple-100' :
                  'bg-gray-100'
                }`}>
                  {notification.type === 'new_opportunity' && <Search className="h-4 w-4 text-blue-600" />}
                  {notification.type === 'interview' && <Calendar className="h-4 w-4 text-green-600" />}
                  {notification.type === 'message' && <MessageCircle className="h-4 w-4 text-purple-600" />}
                  {notification.type === 'general' && <Bell className="h-4 w-4 text-gray-600" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium text-gray-900">
                      {notification.type === 'new_opportunity' ? 'New Opportunity' : notification.type}
                    </h4>
                    {!notification.isRead && (
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {new Date(notification.createdAt).toLocaleDateString()} at {new Date(notification.createdAt).toLocaleTimeString()}
                    </span>
                    {notification.type === 'new_opportunity' && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        View Opportunity
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <Bell className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
            <p className="text-gray-600">You're all caught up! New notifications will appear here</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Profile Section Component
const ProfileSection = ({ profile, profileMode, setProfileMode, refetchProfile }) => {
  const handleProfileUpdated = async () => {
    await refetchProfile();
    setProfileMode('view');
  };

  return (
    <div className="w-full">
      {profileMode === 'view' ? (
        <ProfileView profile={profile} onEdit={() => setProfileMode('edit')} />
      ) : (
        <CreateProfile onProfileUpdated={handleProfileUpdated} />
      )}
    </div>
  );
};

// Settings Section Component
const SettingsSection = () => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Settings</h3>
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <p className="text-gray-600">Settings functionality will be implemented here.</p>
      </div>
    </div>
  );
};

// Support Section Component
const SupportSection = () => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Help & Support</h3>
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <p className="text-gray-600">Support functionality will be implemented here.</p>
      </div>
    </div>
  );
};

export default RefugeeDashboard;



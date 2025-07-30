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
  XCircle,
  Shield,
  BookOpen,
  Wrench,
  ChevronDown,
  X,
  Clock,
  Video,
  FileText,
  Menu,
  Briefcase
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useOpportunities } from '../../hooks/useOpportunities';
import { useInterviews } from '../../hooks/useInterviews';
import { useApplications } from '../../hooks/useApplications';
import { useProfiles } from '../../hooks/useProfiles';
import { useNotifications } from '../../hooks/useNotifications';
import { useMessages } from '../../hooks/useMessages';
import { useSettings } from '../../hooks/useSettings';
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
    const otherUserName = isReceived ? 
      (message.senderName || 
        (message.sender && typeof message.sender === 'object' ? 
          `${message.sender.firstName || ''} ${message.sender.lastName || ''}`.trim() : 'Unknown User') ||
        'Unknown User') :
      (message.recipientName || 
        (message.recipient && typeof message.recipient === 'object' ? 
          `${message.recipient.firstName || ''} ${message.recipient.lastName || ''}`.trim() : 'Unknown User') ||
        'Unknown User');
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
  const [initialProfileLoadComplete, setInitialProfileLoadComplete] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Auth and navigation
  const { logout, user, loading } = useAuth();
  const navigate = useNavigate();
  const { settings } = useSettings();

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
    respondToInterview,
    selectAvailabilitySlot
  } = useInterviews('refugee');

  const { 
    applications, 
     loading: applicationsLoading, 
    error: applicationsError 
  } = useApplications(null, 'refugee');

  const profileFilters = useMemo(() => ({ 
    email: user?.email,
    // Apply privacy settings to profile visibility
    isPublic: settings?.privacy?.profileVisibility === 'public' ? true : undefined
  }), [user?.email, settings?.privacy?.profileVisibility]);
  const { 
    profiles, 
    loading: profileLoading, 
    error: profileError, 
    isTimeout: profileTimeout, 
    refetch: refetchProfile 
  } = useProfiles({ email: user?.email });

  const { notifications, refetch: refetchNotifications } = useNotifications(settings);
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

  // Debug logging for main component
  console.log('RefugeeDashboard Debug:', {
    user: user ? { id: user._id, email: user.email, role: user.role } : null,
    opportunities: displayOpportunities.length,
    interviews: displayInterviews.length,
    applications: displayApplications.length,
    profiles: displayProfiles.length,
    profile: profile ? { id: profile._id, fullName: profile.fullName } : null,
    profileLoading,
    opportunitiesLoading,
    interviewsLoading,
    applicationsLoading,
    opportunitiesError,
    interviewsError,
    applicationsError
  });
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

  // Real-time polling - respect user settings
  useEffect(() => {
    // Check if user has enabled notifications and messages
    const notificationsEnabled = settings?.notifications?.push !== false;
    const messagesEnabled = settings?.notifications?.types?.messages !== false;
    
    const interval = setInterval(() => {
      if (notificationsEnabled) {
        refetchNotifications();
      }
      if (messagesEnabled) {
        refetchMessages();
      }
    }, 60000); // Increased to 60 seconds to reduce load
    
    return () => clearInterval(interval);
  }, [refetchNotifications, refetchMessages, settings?.notifications?.push, settings?.notifications?.types?.messages]);

  // Test backend connectivity
  useEffect(() => {
    const testBackend = async () => {
      try {
        // Use the same API base URL as the rest of the app
        const apiBaseUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'https://refuture-backend-1.onrender.com/api';
        const response = await fetch(`${apiBaseUrl}/health`);
        console.log('Backend health check:', response.status, response.ok);
        if (!response.ok) {
          console.error('Backend is not responding properly');
        }
      } catch (error) {
        console.error('Backend connectivity test failed:', error);
      }
    };
    testBackend();
  }, []);

  // Track initial profile load completion
  useEffect(() => {
    if (!profileLoading && !initialProfileLoadComplete) {
      setInitialProfileLoadComplete(true);
    }
  }, [profileLoading, initialProfileLoadComplete]);

  // Profile redirect - only redirect if we're not loading and there's no profile
  useEffect(() => {
    if (initialProfileLoadComplete && displayProfiles.length === 0 && user) {
      console.log('No profile found, redirecting to create profile');
      navigate('/create-profile', { replace: true });
    }
  }, [initialProfileLoadComplete, displayProfiles.length, navigate, user]);

  // Loading and error states
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading user...</div>;
  if (!user) return <div className="min-h-screen flex items-center justify-center text-red-600">User not found. Please log in again.</div>;
  
  // Show loading state only on initial load, not during refetches
  if (profileLoading && !initialProfileLoadComplete) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4"></div>
        <div>Loading your profile...</div>
      </div>
    );
  }
  
  // Only show "no profile" message if initial load is complete and there's no profile
  if (initialProfileLoadComplete && displayProfiles.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="text-center">
          <div className="mb-4">No profile found. Redirecting to create profile...</div>
          <button
            onClick={() => refetchProfile()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry Loading Profile
          </button>
        </div>
      </div>
    );
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

  const markAllNotificationsAsRead = async () => {
    try {
      await notificationsAPI.markAllAsRead();
      refetchNotifications();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Function to mark all messages in a conversation as read
  const markConversationAsRead = async (conversation) => {
    try {
      console.log('Marking conversation as read:', conversation.userName);
      
      // Mark all unread messages in this conversation as read
      const unreadMessages = conversation.messages.filter(message => {
        const recipientId = typeof message.recipient === 'object' ? message.recipient._id : message.recipient;
        const currentUserId = typeof user._id === 'object' ? user._id.toString() : user._id;
        return !message.isRead && recipientId === currentUserId;
      });
      
      console.log(`Found ${unreadMessages.length} unread messages to mark as read`);
      
      for (const message of unreadMessages) {
        await markMessageAsRead(message._id);
      }
      
      // Update the conversation's unread count locally
      conversation.unreadCount = 0;
      
      // Refetch messages to ensure UI is updated
      await refetchMessages();
      
      console.log('Conversation marked as read successfully');
    } catch (error) {
      console.error('Error marking conversation as read:', error);
    }
  };

  // Render navigation item
  const renderMenuItem = (item) => {
    const Icon = item.icon;
    const isActive = activeItem === item.id;
    return (
      <div key={item.id} className="mb-2">
        <button
          onClick={() => {
            setActiveItem(item.id);
            setMobileNavOpen(false); // Close mobile nav when item is clicked
          }}
          className={`w-full flex items-center justify-between px-3 sm:px-4 py-2 sm:py-3 text-left text-sm rounded-lg transition-all duration-200 ${
            isActive 
              ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-500 shadow-sm' 
              : 'text-gray-700 hover:bg-gray-50 hover:border-l-4 hover:border-gray-200'
          }`}
        >
          <div className="flex items-center min-w-0 flex-1">
            <Icon className={`h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3 flex-shrink-0 ${isActive ? 'text-blue-600' : 'text-gray-500'}`} />
            <div className="font-medium truncate">{item.label}</div>
          </div>
          {item.badge && (
            <span className="bg-red-100 text-red-800 text-xs font-medium px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full min-w-[18px] sm:min-w-[20px] text-center flex-shrink-0">
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
          setActiveItem={setActiveItem}
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
          selectAvailabilitySlot={selectAvailabilitySlot}
        />;

      case 'messages':
        return <MessagesSection 
          messages={displayMessages}
          loading={messagesLoading}
          error={messagesError}
          user={user}
          markMessageAsRead={markMessageAsRead}
          markConversationAsRead={markConversationAsRead}
          setShowMessageCenter={setShowMessageCenter}
          refetchMessages={refetchMessages}
        />;

      case 'notifications':
        return <NotificationsSection 
          notifications={displayNotifications}
          markNotificationAsRead={markNotificationAsRead}
          markAllNotificationsAsRead={markAllNotificationsAsRead}
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
    <div className="min-h-screen bg-gray-50">
      {/* Interview Reminders */}
      {upcomingInterviews.length > 0 && (
        <div className="max-w-4xl mx-auto mt-4 mb-4 px-4 sm:px-6 lg:px-8">
          {upcomingInterviews.map(interview => (
            <div key={interview._id} className="flex flex-col sm:flex-row sm:items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 mb-2 shadow">
              <div className="flex items-center mb-3 sm:mb-0">
                <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 mr-2 sm:mr-3 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-blue-900 text-sm sm:text-base truncate">Upcoming Interview: {interview.title}</div>
                  <div className="text-xs sm:text-sm text-blue-800">
                    {interview.scheduledDate ? new Date(interview.scheduledDate).toLocaleString() : 'Date/Time TBD'}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2 flex-shrink-0">
                {interview.meetingLink && (
                  <a
                    href={interview.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 sm:px-4 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-xs sm:text-sm font-medium whitespace-nowrap"
                  >
                    Join
                  </a>
                )}
                <button
                  onClick={() => dismissReminder(interview._id)}
                  className="p-1 rounded-full hover:bg-blue-100"
                  title="Dismiss reminder"
                >
                  <XCircle className="h-4 w-4 sm:h-5 sm:w-5 text-blue-400" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Main Dashboard */}
      <div className="flex flex-col lg:flex-row h-screen bg-gray-50">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white shadow-sm border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold text-gray-900">Refugee Dashboard</h1>
              <p className="text-xs text-gray-600">Showcase your talents, find opportunities</p>
            </div>
            <button
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
              className="p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <Menu className="h-6 w-6 text-gray-700" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation Overlay */}
        {mobileNavOpen && (
          <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-50">
            <div className="fixed inset-y-0 left-0 w-80 bg-white shadow-xl transform transition-transform duration-300 ease-in-out">
              <div className="flex flex-col h-full">
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h1 className="text-lg font-bold text-gray-900">Menu</h1>
                    <button
                      onClick={() => setMobileNavOpen(false)}
                      className="p-2 rounded-lg hover:bg-gray-100"
                    >
                      <X className="h-5 w-5 text-gray-700" />
                    </button>
                  </div>
                </div>
                <nav className="flex-1 p-4 overflow-y-auto">
                  {navigationItems.map(item => renderMenuItem(item))}
                </nav>
                <div className="p-4 border-t border-gray-200">
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
            </div>
          </div>
        )}

        {/* Desktop Sidebar */}
        <div className="hidden lg:flex lg:w-80 bg-white shadow-lg flex-col">
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-xl font-bold text-gray-900">Refugee Dashboard</h1>
            <p className="text-sm text-gray-600 mt-1">Showcase your talents, find opportunities</p>
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
          {activeItem === 'profile' ? (
            // Full width for profile view
            <div className="p-3 sm:p-4 lg:p-6">
              {renderMainContent()}
            </div>
          ) : (
            // Standard layout for other sections
          <div className="p-3 sm:p-4 lg:p-6">
            <div className="max-w-6xl mx-auto">
              <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
                  {navigationItems.find(item => item.id === activeItem)?.label || 'Dashboard Overview'}
                </h2>
                <div className="text-gray-600">
                  {renderMainContent()}
                </div>
              </div>
            </div>
          </div>
          )}
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
const OverviewSection = ({ opportunities = [], interviews = [], applications = [], opportunitiesLoading, interviewsLoading, applicationsLoading, opportunitiesError, interviewsError, applicationsError, setActiveItem }) => {
  const activeApplications = applications.filter(app => 
    app.status === 'pending' || app.status === 'accepted' || app.status === 'under_review'
  ).length;
  
  const interviewsScheduled = interviews.filter(int => 
    int.status === 'accepted' || int.status === 'scheduled'
  ).length;
  
  const newOpportunities = opportunities.filter(opp => opp.isActive).length;

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

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Applications</p>
              <p className="text-2xl font-bold text-gray-900">{activeApplications}</p>
          </div>
        </div>
              </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Calendar className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Scheduled Interviews</p>
              <p className="text-2xl font-bold text-gray-900">{interviewsScheduled}</p>
              </div>
            </div>
              </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Briefcase className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Available Opportunities</p>
              <p className="text-2xl font-bold text-gray-900">{newOpportunities}</p>
              </div>
            </div>
          </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Video className="h-6 w-6 text-indigo-600" />
                        </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Interviews</p>
              <p className="text-2xl font-bold text-gray-900">{interviews.length}</p>
                        </div>
                      </div>
                    </div>
                  </div>

      {/* Recent Applications and Interviews */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg border">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium text-gray-900">Recent Applications</h3>
            <button
              onClick={() => setActiveItem('opportunities')}
              className="text-blue-600 hover:text-blue-700 text-sm"
            >
              View All
            </button>
                </div>
          <div className="space-y-3">
            {applications.slice(0, 3).map(app => (
              <div key={app._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-sm">{app.opportunity?.title || 'Opportunity'}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(app.createdAt).toLocaleDateString()}
                  </p>
            </div>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  app.status === 'accepted' ? 'bg-green-100 text-green-800' :
                  app.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  app.status === 'rejected' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {app.status}
                </span>
          </div>
            ))}
            {applications.length === 0 && (
              <p className="text-gray-500 text-sm text-center py-4">No applications yet</p>
            )}
            </div>
          </div>
          
        <div className="bg-white p-6 rounded-lg border">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium text-gray-900">Upcoming Interviews</h3>
            <button
              onClick={() => setActiveItem('interviews')}
              className="text-blue-600 hover:text-blue-700 text-sm"
            >
              View All
            </button>
                </div>
          <div className="space-y-3">
            {interviews.filter(int => int.status === 'scheduled' || int.status === 'accepted').slice(0, 3).map(interview => (
              <div key={interview._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-sm">{interview.title || 'Interview'}</p>
                  <p className="text-xs text-gray-500">
                    {interview.scheduledDate ? new Date(interview.scheduledDate).toLocaleDateString() : 'Date TBD'}
                  </p>
                  </div>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  interview.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                  interview.status === 'accepted' ? 'bg-green-100 text-green-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {interview.status}
                </span>
              </div>
            ))}
            {interviews.filter(int => int.status === 'scheduled' || int.status === 'accepted').length === 0 && (
              <p className="text-gray-500 text-sm text-center py-4">No upcoming interviews</p>
                )}
              </div>
            </div>
        </div>
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
const InterviewsSection = ({ interviews, loading, error, respondToInterview, selectAvailabilitySlot }) => {
  // Only show loading if we have no data
  const showLoading = loading && interviews.length === 0;
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [showInterviewModal, setShowInterviewModal] = useState(false);

  return (
    <div className="space-y-6">
      <div className="mb-6">
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
              <p className="text-sm font-medium text-gray-600">Accepted</p>
              <p className="text-2xl font-bold text-gray-900">{interviews.filter(int => int.status === 'accepted').length}</p>
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
                      {interview.provider?.firstName && interview.provider?.lastName 
                        ? `${interview.provider.firstName} ${interview.provider.lastName}`
                        : interview.organization || 'Unknown Provider'
                      }
                    </p>
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  interview.status === 'invited' ? 'bg-yellow-100 text-yellow-800' :
                  interview.status === 'accepted' ? 'bg-blue-100 text-blue-800' :
                  interview.status === 'scheduled' ? 'bg-green-100 text-green-800' :
                  interview.status === 'completed' ? 'bg-purple-100 text-purple-800' :
                  interview.status === 'declined' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {interview.status === 'invited' ? 'Invitation Sent' :
                   interview.status === 'accepted' ? 'Accepted' :
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
                    {interview.selectedSlot ? new Date(interview.selectedSlot.date).toLocaleDateString() : 
                     interview.availabilitySlots && interview.availabilitySlots.length > 0 ? 
                     `${interview.availabilitySlots.length} date(s) available` : 'Date TBD'}
                  </span>
                </div>
                <div className="flex items-center text-sm">
                  <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                  <span className="text-gray-600">
                    {interview.location === 'onsite' ? 'In-Person' : 
                     interview.location === 'remote' ? 'Remote' : 
                     interview.location || 'TBD'}
                  </span>
                </div>
                {interview.selectedSlot && (
                  <div className="flex items-center text-sm">
                    <Clock className="h-4 w-4 mr-2 text-gray-400" />
                    <span className="text-gray-600">
                      {interview.selectedSlot.startTime} - {interview.selectedSlot.endTime}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setSelectedInterview(interview);
                    setShowInterviewModal(true);
                  }}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  View Details
                </button>
                {interview.status === 'invited' && (
                  <>
                    <button
                      onClick={async () => {
                        try {
                          await respondToInterview(interview._id, {
                        response: 'accept',
                        notes: 'Interview accepted by refugee'
                          });
                          alert('Interview accepted successfully! Please select your preferred time slot.');
                          setShowInterviewModal(false);
                          setSelectedInterview(null);
                        } catch (error) {
                          console.error('Error accepting interview:', error);
                          alert('Failed to accept interview. Please try again.');
                        }
                      }}
                      className="text-green-600 hover:text-green-700 text-sm font-medium bg-green-50 px-3 py-1 rounded-md hover:bg-green-100 transition-colors"
                    >
                      Accept Interview
                    </button>
                    <button
                      onClick={async () => {
                        if (window.confirm('Are you sure you want to decline this interview?')) {
                          try {
                            await respondToInterview(interview._id, {
                        response: 'decline',
                        notes: 'Interview declined by refugee'
                            });
                            alert('Interview declined successfully.');
                            setShowInterviewModal(false);
                            setSelectedInterview(null);
                          } catch (error) {
                            console.error('Error declining interview:', error);
                            alert('Failed to decline interview. Please try again.');
                          }
                        }
                      }}
                      className="text-red-600 hover:text-red-700 text-sm font-medium bg-red-50 px-3 py-1 rounded-md hover:bg-red-100 transition-colors"
                    >
                      Decline Interview
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

      {/* Interview Details Modal */}
      {showInterviewModal && selectedInterview && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Interview Details</h2>
              <button
                onClick={() => {
                  setShowInterviewModal(false);
                  setSelectedInterview(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Interview Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">{selectedInterview.title}</h3>
                <p className="text-gray-600 mb-3">{selectedInterview.description}</p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">From:</span>
                    <span className="ml-2 text-gray-600">
                      {selectedInterview.provider?.firstName && selectedInterview.provider?.lastName 
                        ? `${selectedInterview.provider.firstName} ${selectedInterview.provider.lastName}`
                        : 'Unknown Provider'
                      }
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Type:</span>
                    <span className="ml-2 text-gray-600">{selectedInterview.type?.replace('_', ' ')}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Duration:</span>
                    <span className="ml-2 text-gray-600">{selectedInterview.duration || 60} minutes</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Status:</span>
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                      selectedInterview.status === 'invited' ? 'bg-yellow-100 text-yellow-800' :
                      selectedInterview.status === 'accepted' ? 'bg-blue-100 text-blue-800' :
                      selectedInterview.status === 'scheduled' ? 'bg-green-100 text-green-800' :
                      selectedInterview.status === 'completed' ? 'bg-purple-100 text-purple-800' :
                      selectedInterview.status === 'declined' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {selectedInterview.status}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Location:</span>
                    <span className="ml-2 text-gray-600">{selectedInterview.location || 'Remote'}</span>
                  </div>
                </div>
              </div>

              {/* Availability Slots */}
              {selectedInterview.availabilitySlots && selectedInterview.availabilitySlots.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-4">Available Time Slots</h3>
                  <div className="space-y-3">
                    {selectedInterview.availabilitySlots.map((slot, dateIndex) => (
                      <div key={dateIndex} className="border border-gray-200 rounded-lg p-3">
                        <div className="font-medium text-gray-900 mb-2">
                          {new Date(slot.date).toLocaleDateString()}
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {slot.timeSlots.map((timeSlot, timeIndex) => (
                            <button
                              key={timeIndex}
                              onClick={async () => {
                                if (selectedInterview.status === 'invited') {
                                  try {
                                    await selectAvailabilitySlot(selectedInterview._id, {
                                    dateIndex,
                                    timeSlotIndex: timeIndex
                                  });
                                    alert('Time slot selected successfully! Your interview has been scheduled.');
                                  setShowInterviewModal(false);
                                  setSelectedInterview(null);
                                  } catch (error) {
                                    console.error('Error selecting time slot:', error);
                                    alert('Failed to select time slot. Please try again.');
                                  }
                                }
                              }}
                              disabled={selectedInterview.status !== 'invited'}
                              className={`p-2 rounded text-sm border transition-colors ${
                                timeSlot.isSelected
                                  ? 'bg-green-100 border-green-300 text-green-800'
                                  : selectedInterview.status === 'invited'
                                  ? 'bg-white border-gray-300 text-gray-700 hover:bg-blue-50 hover:border-blue-300'
                                  : 'bg-gray-100 border-gray-200 text-gray-500 cursor-not-allowed'
                              }`}
                            >
                              {timeSlot.startTime} - {timeSlot.endTime}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  {selectedInterview.status === 'invited' && (
                    <p className="text-sm text-gray-600 mt-3">
                      Click on a time slot to select it and confirm the interview.
                    </p>
                  )}
                </div>
              )}

              {/* Selected Slot */}
              {selectedInterview.selectedSlot && (
                <div className="bg-green-50 rounded-lg p-4">
                  <h3 className="font-semibold text-green-900 mb-2">Selected Time</h3>
                  <div className="text-green-800">
                    <div>{new Date(selectedInterview.selectedSlot.date).toLocaleDateString()}</div>
                    <div>{selectedInterview.selectedSlot.startTime} - {selectedInterview.selectedSlot.endTime}</div>
                  </div>
                </div>
              )}

              {/* Provider Notes */}
              {selectedInterview.notes?.provider && (
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-2">Provider Notes</h3>
                  <p className="text-gray-700">{selectedInterview.notes.provider}</p>
                </div>
              )}

              {/* Meeting Link */}
              {selectedInterview.meetingLink && (
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-2">Meeting Link</h3>
                  <div className="flex items-center space-x-3">
                    <a
                      href={selectedInterview.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium bg-blue-100 px-3 py-2 rounded-md hover:bg-blue-200 transition-colors flex items-center"
                    >
                      <Video className="h-4 w-4 mr-2" />
                      Join Meeting
                    </a>
                    <span className="text-xs text-gray-600 break-all">
                      {selectedInterview.meetingLink}
                    </span>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              {selectedInterview.status === 'invited' && (
                <div className="flex space-x-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={async () => {
                      try {
                        await respondToInterview(selectedInterview._id, {
                        response: 'accept',
                        notes: 'Interview accepted by refugee'
                      });
                        alert('Interview accepted successfully! Please select your preferred time slot.');
                      setShowInterviewModal(false);
                      setSelectedInterview(null);
                      } catch (error) {
                        console.error('Error accepting interview:', error);
                        alert('Failed to accept interview. Please try again.');
                      }
                    }}
                    className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Accept Interview
                  </button>
                  <button
                    onClick={async () => {
                      if (window.confirm('Are you sure you want to decline this interview?')) {
                        try {
                          await respondToInterview(selectedInterview._id, {
                        response: 'decline',
                        notes: 'Interview declined by refugee'
                      });
                          alert('Interview declined successfully.');
                      setShowInterviewModal(false);
                      setSelectedInterview(null);
                        } catch (error) {
                          console.error('Error declining interview:', error);
                          alert('Failed to decline interview. Please try again.');
                        }
                      }
                    }}
                    className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Decline Interview
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Messages Section Component (copied/adapted from ProviderDashboard)
const MessagesSection = ({ messages, loading, error, user, markMessageAsRead, markConversationAsRead, setShowMessageCenter, refetchMessages }) => {
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);

  // Group messages into conversations
  const conversations = useMemo(() => groupMessagesByConversation(messages, user), [messages, user]);

  // Send message function
  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || sendingMessage) return;
    
    try {
      setSendingMessage(true);
      
      const messageData = {
        recipient: selectedConversation.userId,
        content: newMessage.trim(),
        metadata: {
          type: 'direct_message'
        }
      };

      console.log('Sending message:', messageData);
      
      // Send the message using the messages API service
      const response = await messagesAPI.send(messageData);
      console.log('Message sent successfully:', response.data);

      // Clear the input
      setNewMessage('');
      
      // Refresh messages to show the new message
      if (refetchMessages) {
        refetchMessages();
      }
      
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setSendingMessage(false);
    }
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
                  await markConversationAsRead(conversation);
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
const NotificationsSection = ({ notifications, markNotificationAsRead, markAllNotificationsAsRead, navigate, setActiveItem }) => {
  const unreadCount = notifications.filter(notification => !notification.isRead).length;
  
  return (
    <div className="space-y-6">
      <div className="mb-6">
        <p className="text-gray-600">
          {unreadCount > 0 
            ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
            : 'You\'re all caught up with your notifications'
          }
        </p>
      </div>
      
      <div className="flex justify-between items-center">
        <div className="flex space-x-2">
          {unreadCount > 0 && (
            <button 
              onClick={markAllNotificationsAsRead}
              className="bg-gray-100 text-gray-700 px-3 py-2 rounded-lg text-sm hover:bg-gray-200 transition-colors"
            >
              Mark all read
            </button>
          )}
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
                
                if (notification.type === 'opportunity_posted' && notification.metadata?.opportunityId) {
                  navigate(`/opportunity/${notification.metadata.opportunityId}`);
                } else if (notification.type === 'opportunity_posted') {
                  setActiveItem('opportunities');
                } else if (notification.type === 'interview_invitation' || notification.type === 'interview_confirmed' || notification.type === 'interview_cancelled') {
                  setActiveItem('interviews');
                } else if (notification.type === 'message_received') {
                  setActiveItem('messages');
                }
              }}
            >
              <div className="flex items-start space-x-3">
                <div className={`p-2 rounded-full ${
                  notification.type === 'opportunity_posted' ? 'bg-blue-100' :
                  notification.type === 'interview_invitation' ? 'bg-green-100' :
                  notification.type === 'interview_confirmed' ? 'bg-green-100' :
                  notification.type === 'interview_cancelled' ? 'bg-red-100' :
                  notification.type === 'message_received' ? 'bg-purple-100' :
                  notification.type === 'application_received' ? 'bg-yellow-100' :
                  'bg-gray-100'
                }`}>
                  {notification.type === 'opportunity_posted' ? (
                    <Search className="h-4 w-4 text-blue-600" />
                  ) : notification.type === 'interview_invitation' || notification.type === 'interview_confirmed' ? (
                    <Calendar className="h-4 w-4 text-green-600" />
                  ) : notification.type === 'interview_cancelled' ? (
                    <X className="h-4 w-4 text-red-600" />
                  ) : notification.type === 'message_received' ? (
                    <MessageCircle className="h-4 w-4 text-purple-600" />
                  ) : notification.type === 'application_received' ? (
                    <FileText className="h-4 w-4 text-yellow-600" />
                  ) : (
                    <Bell className="h-4 w-4 text-gray-600" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium text-gray-900">
                      {notification.type === 'opportunity_posted' ? 'New Opportunity' : notification.type}
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
                    {notification.type === 'opportunity_posted' && (
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
    console.log('Profile updated, starting refresh process...');
    
    try {
      // Force immediate profile refresh
    console.log('Refreshing profile data...');
    await refetchProfile();
    
      // Add a short delay to ensure backend has processed the update
    await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Refresh again to ensure we have the latest data
      console.log('Refreshing profile data again...');
      await refetchProfile();
    
    console.log('Profile refresh completed, switching to view mode');
    setProfileMode('view');
    } catch (error) {
      console.error('Error refreshing profile:', error);
      // Still switch to view mode even if refresh fails
      setProfileMode('view');
    }
  };

  // Debug logging
  console.log('ProfileSection Debug:', {
    profileMode,
    hasProfile: !!profile,
    profileData: profile ? {
      id: profile._id,
      fullName: profile.fullName,
      photoUrl: profile.photoUrl,
      age: profile.age,
      gender: profile.gender,
      nationality: profile.nationality,
      currentLocation: profile.currentLocation,
      email: profile.email
    } : null
  });

  return (
    <div className="w-full">
      {profileMode === 'view' ? (
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-4 sm:p-6 border-b border-gray-200">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
              My Profile
            </h2>
            <p className="text-gray-600 mt-1">View and manage your profile information</p>
          </div>
          <div className="p-4 sm:p-6">
        <ProfileView profile={profile} onEdit={() => setProfileMode('edit')} />
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-4 sm:p-6 border-b border-gray-200">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
              Edit Profile
            </h2>
            <p className="text-gray-600 mt-1">Update your profile information</p>
          </div>
          <div className="p-4 sm:p-6">
        <CreateProfile 
          existingProfile={profile} 
          isEditing={true}
          onProfileUpdated={handleProfileUpdated} 
        />
          </div>
        </div>
      )}
    </div>
  );
};

// Settings Section Component
const SettingsSection = () => {
  const { settings, loading, updating, updateSettings } = useSettings();
  const { user } = useAuth();
  const [settingsActiveTab, setSettingsActiveTab] = useState('account');
  const [localSettings, setLocalSettings] = useState(null);
  const [saveStatus, setSaveStatus] = useState('');

  // Initialize local settings when settings are loaded
  useEffect(() => {
    if (settings) {
      setLocalSettings(settings);
    }
  }, [settings]);

  const handleSettingChange = (path, value) => {
    setLocalSettings(prev => {
      const newSettings = { ...prev };
      const keys = path.split('.');
      let current = newSettings;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return newSettings;
    });
  };

  const handleSaveSettings = async () => {
    if (!localSettings) return;
    
    setSaveStatus('saving');
    const result = await updateSettings(localSettings);
    
    if (result.success) {
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus(''), 2000);
    } else {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus(''), 3000);
    }
  };

  const tabs = [
    { id: 'account', label: 'Account Settings', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy & Security', icon: Shield },
    { id: 'preferences', label: 'Preferences', icon: Settings }
  ];

  const renderAccountSettings = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Refugee Name</label>
            <input
              type="text"
              value={`${user?.firstName || ''} ${user?.lastName || ''}`}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
            />
            <p className="text-xs text-gray-500 mt-1">Name cannot be changed here</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
            />
            <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Account Type</label>
            <div className="flex items-center space-x-4">
              <span className="px-3 py-2 bg-blue-100 text-blue-800 rounded-md text-sm font-medium">
                Refugee
              </span>
              <span className="text-sm text-gray-500">Active since July 2025</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Password & Security</h3>
        <div className="space-y-4">
          <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
            Change Password
          </button>
          <button className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors">
            Enable Two-Factor Authentication
          </button>
        </div>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Preferences</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Email Notifications</h4>
              <p className="text-sm text-gray-500">Receive notifications via email</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={localSettings?.notifications?.email || false}
                onChange={(e) => handleSettingChange('notifications.email', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Push Notifications</h4>
              <p className="text-sm text-gray-500">Receive notifications in browser</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={localSettings?.notifications?.push || false}
                onChange={(e) => handleSettingChange('notifications.push', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Types</h3>
        <div className="space-y-3">
          {[
            { id: 'opportunities', label: 'New Opportunities', description: 'When new opportunities match your profile' },
            { id: 'interviews', label: 'Interview Invitations', description: 'When providers invite you for interviews' },
            { id: 'messages', label: 'New Messages', description: 'When you receive new messages' },
            { id: 'applications', label: 'Application Updates', description: 'Updates on your submitted applications' }
          ].map((type) => (
            <div key={type.id} className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">{type.label}</h4>
                <p className="text-sm text-gray-500">{type.description}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={localSettings?.notifications?.types?.[type.id] || false}
                  onChange={(e) => handleSettingChange(`notifications.types.${type.id}`, e.target.checked)}
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderPrivacySettings = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Visibility</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Profile Visibility</label>
            <select
              value={localSettings?.privacy?.profileVisibility || 'public'}
              onChange={(e) => handleSettingChange('privacy.profileVisibility', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="public">Public - Visible to all providers</option>
              <option value="private">Private - Only visible to providers you apply to</option>
              <option value="hidden">Hidden - Not visible to providers</option>
            </select>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Show Contact Information</h4>
              <p className="text-sm text-gray-500">Allow providers to see your contact details</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={localSettings?.privacy?.showContactInfo || false}
                onChange={(e) => handleSettingChange('privacy.showContactInfo', e.target.checked)}
                className="sr-only peer" 
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Data & Privacy</h3>
        <div className="space-y-4">
          <button className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-left">
            Download My Data
          </button>
          <button className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-left">
            Delete My Account
          </button>
        </div>
      </div>
    </div>
  );

  const renderPreferences = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Language & Region</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
            <select
              value={localSettings?.preferences?.language || 'en'}
              onChange={(e) => handleSettingChange('preferences.language', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="en">English</option>
              <option value="fr">Français</option>
              <option value="es">Español</option>
              <option value="ar">العربية</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
            <select
              value={localSettings?.preferences?.timezone || 'UTC'}
              onChange={(e) => handleSettingChange('preferences.timezone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="UTC">UTC</option>
              <option value="EST">Eastern Time</option>
              <option value="PST">Pacific Time</option>
              <option value="GMT">GMT</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Display Settings</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Dark Mode</h4>
              <p className="text-sm text-gray-500">Use dark theme</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={localSettings?.preferences?.darkMode || false}
                onChange={(e) => handleSettingChange('preferences.darkMode', e.target.checked)}
                className="sr-only peer" 
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Settings Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSettingsActiveTab(tab.id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              settingsActiveTab === tab.id
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Settings Content */}
      {settingsActiveTab === 'account' && renderAccountSettings()}
      {settingsActiveTab === 'notifications' && renderNotificationSettings()}
      {settingsActiveTab === 'privacy' && renderPrivacySettings()}
      {settingsActiveTab === 'preferences' && renderPreferences()}

      {/* Save Button */}
      <div className="flex justify-end pt-4 border-t border-gray-200">
        <button
          onClick={handleSaveSettings}
          disabled={updating || !localSettings}
          className={`px-6 py-2 rounded-md font-medium transition-colors ${
            updating
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {updating ? 'Saving...' : 'Save Settings'}
        </button>
        
        {/* Save Status */}
        {saveStatus && (
          <div className={`ml-3 px-3 py-2 rounded-md text-sm ${
            saveStatus === 'saved' 
              ? 'bg-green-100 text-green-800' 
              : saveStatus === 'error'
              ? 'bg-red-100 text-red-800'
              : 'bg-blue-100 text-blue-800'
          }`}>
            {saveStatus === 'saved' && 'Settings saved successfully!'}
            {saveStatus === 'error' && 'Failed to save settings. Please try again.'}
            {saveStatus === 'saving' && 'Saving settings...'}
          </div>
        )}
      </div>
    </div>
  );
};

// Support Section Component
const SupportSection = () => {
  const [supportActiveTab, setSupportActiveTab] = useState('faq');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFAQ, setSelectedFAQ] = useState(null);

  const tabs = [
    { id: 'faq', label: 'FAQ', icon: HelpCircle },
    { id: 'contact', label: 'Contact Support', icon: MessageCircle },
    { id: 'resources', label: 'Resources', icon: BookOpen },
    { id: 'troubleshooting', label: 'Troubleshooting', icon: Wrench }
  ];

  const faqs = [
    {
      id: 1,
      question: "How do I create a profile?",
      answer: "To create a profile, go to 'My Profile' section and click 'Edit Profile'. Fill in your personal information, skills, experience, and upload necessary documents. Make sure to complete all required fields for better visibility to providers."
    },
    {
      id: 2,
      question: "How do I apply for opportunities?",
      answer: "Browse opportunities in the 'Opportunities' section. Click on any opportunity that interests you, review the details, and click 'Apply'. You'll need to submit your application with relevant documents and information."
    },
    {
      id: 3,
      question: "What happens after I apply?",
      answer: "After applying, the provider will review your application. You may receive an interview invitation, acceptance, or rejection. You can track your application status in the 'Applications' section."
    },
    {
      id: 4,
      question: "How do I manage my privacy settings?",
      answer: "Go to 'Settings' > 'Privacy & Security' to control your profile visibility, contact information sharing, and other privacy preferences. You can choose to be visible to all providers or only those you apply to."
    },
    {
      id: 5,
      question: "Can I change my email address?",
      answer: "Currently, email addresses cannot be changed for security reasons. If you need to update your email, please contact support for assistance."
    },
    {
      id: 6,
      question: "How do I enable notifications?",
      answer: "Go to 'Settings' > 'Notifications' to configure your notification preferences. You can enable email notifications, push notifications, and choose which types of updates you want to receive."
    }
  ];

  const resources = [
    {
      title: "Profile Building Guide",
      description: "Learn how to create an effective profile that attracts providers",
      type: "Guide",
      link: "#"
    },
    {
      title: "Application Tips",
      description: "Best practices for writing compelling applications",
      type: "Tips",
      link: "#"
    },
    {
      title: "Interview Preparation",
      description: "How to prepare for and succeed in interviews",
      type: "Guide",
      link: "#"
    },
    {
      title: "Platform Safety",
      description: "Guidelines for staying safe while using the platform",
      type: "Safety",
      link: "#"
    }
  ];

  const troubleshooting = [
    {
      issue: "Can't log in to my account",
      solution: "Check your email and password. If you've forgotten your password, use the 'Forgot Password' link on the login page. If the problem persists, contact support."
    },
    {
      issue: "Profile not showing up in searches",
      solution: "Ensure your profile is set to 'Public' in Settings > Privacy & Security. Complete all required profile fields and add relevant skills and experience."
    },
    {
      issue: "Not receiving notifications",
      solution: "Check your notification settings in Settings > Notifications. Ensure email notifications are enabled and check your spam folder."
    },
    {
      issue: "Can't upload documents",
      solution: "Make sure your files are in PDF, JPG, or PNG format and under 10MB. Try refreshing the page or using a different browser."
    }
  ];

  const filteredFAQs = faqs.filter(faq => 
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderFAQ = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Frequently Asked Questions</h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search FAQs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        
        <div className="space-y-3">
          {filteredFAQs.map((faq) => (
            <div key={faq.id} className="border border-gray-200 rounded-lg">
              <button
                onClick={() => setSelectedFAQ(selectedFAQ === faq.id ? null : faq.id)}
                className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <span className="font-medium text-gray-900">{faq.question}</span>
                <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${selectedFAQ === faq.id ? 'rotate-180' : ''}`} />
              </button>
              {selectedFAQ === faq.id && (
                <div className="px-4 pb-3">
                  <p className="text-gray-600">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderContact = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Support</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Email Support</h4>
              <p className="text-sm text-blue-700 mb-2">support@refuture.com</p>
              <p className="text-xs text-blue-600">Response within 24 hours</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-900 mb-2">Live Chat</h4>
              <p className="text-sm text-green-700 mb-2">Available 9 AM - 6 PM UTC</p>
              <button className="text-xs text-green-600 hover:text-green-700">Start Chat</button>
            </div>
          </div>
          
          <div className="border-t pt-4">
            <h4 className="font-medium text-gray-900 mb-3">Send us a message</h4>
            <form className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>General Inquiry</option>
                  <option>Technical Issue</option>
                  <option>Account Problem</option>
                  <option>Feature Request</option>
                  <option>Report a Bug</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea
                  rows={4}
                  placeholder="Describe your issue or question..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                type="submit"
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );

  const renderResources = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Helpful Resources</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {resources.map((resource, index) => (
            <div key={index} className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium text-gray-900">{resource.title}</h4>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  resource.type === 'Guide' ? 'bg-blue-100 text-blue-800' :
                  resource.type === 'Tips' ? 'bg-green-100 text-green-800' :
                  'bg-orange-100 text-orange-800'
                }`}>
                  {resource.type}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-3">{resource.description}</p>
              <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                Read More →
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderTroubleshooting = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Common Issues & Solutions</h3>
        <div className="space-y-4">
          {troubleshooting.map((item, index) => (
            <div key={index} className="p-4 border border-gray-200 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">{item.issue}</h4>
              <p className="text-sm text-gray-600">{item.solution}</p>
            </div>
          ))}
        </div>
      </div>
      
      <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
        <h3 className="text-lg font-semibold text-yellow-900 mb-2">Still Need Help?</h3>
        <p className="text-yellow-800 mb-3">If you couldn't find the solution to your problem, our support team is here to help.</p>
        <button className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors">
          Contact Support
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Support Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSupportActiveTab(tab.id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              supportActiveTab === tab.id
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Support Content */}
      {supportActiveTab === 'faq' && renderFAQ()}
      {supportActiveTab === 'contact' && renderContact()}
      {supportActiveTab === 'resources' && renderResources()}
      {supportActiveTab === 'troubleshooting' && renderTroubleshooting()}
    </div>
  );
};

export default RefugeeDashboard;



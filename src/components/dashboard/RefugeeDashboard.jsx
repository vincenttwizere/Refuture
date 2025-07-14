import React, { useState, useEffect, useRef } from 'react';
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
  LogOut,
  AlertCircle,
  MapPin,
  Eye,
  Filter,
  Globe,
  X,
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
import { messagesAPI, notificationsAPI, interviewsAPI } from '../../services/api';
import ProfileView from '../profiles/ProfileView';
import CreateProfile from '../profiles/CreateProfile';
import MessageCenter from '../messaging/MessageCenter';
import axios from 'axios';

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
    error: interviewsError,
    refetch: refetchInterviews,
    respondToInterview
  } = useInterviews('refugee');

  const { 
    applications, 
    loading: applicationsLoading, 
    error: applicationsError 
  } = useApplications(null, 'refugee');

  const { 
    profiles, 
    loading: profileLoading, 
    error: profileError,
    refetch: refetchProfile 
  } = useProfiles({ email: user?.email });
  const profile = profiles && profiles.length > 0 ? profiles[0] : null;

  const { notifications, refetch: refetchNotifications } = useNotifications();
  const { messages, loading: messagesLoading, error: messagesError, refetch: refetchMessages } = useMessages();
  const [showMessageCenter, setShowMessageCenter] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);

  // Interview details modal state
  const [showInterviewDetailsModal, setShowInterviewDetailsModal] = useState(false);
  const [selectedInterviewDetails, setSelectedInterviewDetails] = useState(null);
  
  // Local interviews state for managing updates
  const [localInterviews, setLocalInterviews] = useState([]);

  // Add a state for slot selection error message (moved up)
  const [slotSelectionError, setSlotSelectionError] = useState('');

  // Add a state for dismissed reminders (move up)
  const [dismissedReminders, setDismissedReminders] = useState([]);

  // Settings state
  const [settings, setSettings] = useState({
    profileVisibility: profile?.isPublic || false,
    emailNotifications: true,
    pushNotifications: true,
    showContactInfo: true,
    showLocation: true,
    language: 'English',
    timeZone: 'UTC-5 (Eastern Time)',
    email: user?.email || ''
  });
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);

  // Track previous unread counts
  const prevUnreadMessagesRef = useRef(0);
  const prevUnreadNotificationsRef = useRef(0);

  // Calculate unread notifications count
  const unreadNotificationsCount = notifications.filter(notification => !notification.isRead).length;

  // Calculate unread messages count
  const unreadMessagesCount = messages.filter(message => !message.isRead && message.recipient === user?._id).length;

  // Function to mark a message as read
  const markMessageAsRead = async (messageId) => {
    try {
      await messagesAPI.markAsRead(messageId);
      // Refetch messages to update the UI
      refetchMessages();
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  // Function to mark a notification as read
  const markNotificationAsRead = async (notificationId) => {
    try {
      await notificationsAPI.markAsRead(notificationId);
      // Refetch notifications to update the UI
      refetchNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Function to mark all messages in a conversation as read
  const markConversationAsRead = async (conversation) => {
    try {
      // Mark all unread messages in this conversation as read
      const unreadMessages = conversation.messages.filter(message => 
        !message.isRead && message.recipient === user?._id
      );
      
      for (const message of unreadMessages) {
        await markMessageAsRead(message._id);
      }
    } catch (error) {
      console.error('Error marking conversation as read:', error);
    }
  };

  // Function to save settings
  const saveSettings = async () => {
    try {
      setSavingSettings(true);
      setSettingsSaved(false);
      
      // Simulate API call to save settings
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update profile visibility if changed
      if (settings.profileVisibility !== profile?.isPublic) {
        // Here you would call the API to update the profile
        console.log('Updating profile visibility:', settings.profileVisibility);
      }
      
      // Save settings to localStorage for persistence
      localStorage.setItem('userSettings', JSON.stringify(settings));
      
      setSettingsSaved(true);
      setTimeout(() => setSettingsSaved(false), 3000);
      
      console.log('Settings saved:', settings);
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setSavingSettings(false);
    }
  };

  // Load settings from localStorage on component mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('userSettings');
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        setSettings(prev => ({ ...prev, ...parsedSettings }));
      } catch (error) {
        console.error('Error loading saved settings:', error);
      }
    }
  }, []);

  // Sync local interviews with fetched interviews
  useEffect(() => {
    if (interviews.length > 0) {
      setLocalInterviews(interviews);
    }
  }, [interviews]);

  // Group messages into conversations
  useEffect(() => {
    if (messages.length > 0) {
      console.log('=== START MESSAGE GROUPING ===');
      console.log('Raw messages from API:', messages);
      console.log('Current user ID:', user._id);
      
      // Create a map to group messages by conversation partner
      const conversationMap = new Map();
      
      messages.forEach(message => {
        const isReceived = message.recipient === user._id;
        const otherUserId = isReceived ? message.sender : message.recipient;
        const otherUserName = isReceived ? message.senderName : message.recipientName;
        
        console.log('Processing message:', {
          messageId: message._id,
          content: message.content.substring(0, 30) + '...',
          isReceived,
          otherUserId,
          otherUserName,
          sender: message.sender,
          recipient: message.recipient,
          senderName: message.senderName,
          recipientName: message.recipientName,
          currentUserId: user._id,
          senderType: typeof message.sender,
          recipientType: typeof message.recipient,
          currentUserIdType: typeof user._id
        });
        
        // Check if user IDs are strings or objects
        const senderId = typeof message.sender === 'object' ? message.sender._id : message.sender;
        const recipientId = typeof message.recipient === 'object' ? message.recipient._id : message.recipient;
        const currentUserId = typeof user._id === 'object' ? user._id.toString() : user._id;
        
        console.log('Normalized IDs:', {
          senderId,
          recipientId,
          currentUserId,
          isReceivedAfterNormalization: recipientId === currentUserId
        });
        
        const normalizedIsReceived = recipientId === currentUserId;
        const normalizedOtherUserId = normalizedIsReceived ? senderId : recipientId;
        
        // Determine the conversation partner name - always show the other person's name
        let normalizedOtherUserName;
        if (normalizedIsReceived) {
          // Message was received by current user, so show sender's name
          normalizedOtherUserName = message.senderName;
        } else {
          // Message was sent by current user, so show recipient's name
          normalizedOtherUserName = message.recipientName;
        }
        
        console.log('Conversation partner determination:', {
          isReceived: normalizedIsReceived,
          otherUserId: normalizedOtherUserId,
          otherUserName: normalizedOtherUserName,
          senderName: message.senderName,
          recipientName: message.recipientName,
          currentUserName: user.firstName + ' ' + user.lastName
        });
        
        if (!conversationMap.has(normalizedOtherUserId)) {
          conversationMap.set(normalizedOtherUserId, {
            userId: normalizedOtherUserId,
            userName: normalizedOtherUserName,
            messages: [],
            messageCount: 0,
            unreadCount: 0,
            lastMessage: null,
            date: '',
            status: 'Open Conversation'
          });
        }
        
        const conversation = conversationMap.get(normalizedOtherUserId);
        conversation.messages.push(message);
        conversation.messageCount = conversation.messages.length;
        
        // Update last message if this one is more recent
        if (!conversation.lastMessage || new Date(message.createdAt) > new Date(conversation.lastMessage.createdAt)) {
          conversation.lastMessage = message;
          conversation.date = new Date(message.createdAt).toLocaleDateString();
        }
        
        // Count unread messages
        if (normalizedIsReceived && !message.isRead) {
          conversation.unreadCount++;
        }
      });
      
      // Convert map to array and sort messages within each conversation
      const conversations = Array.from(conversationMap.values()).map(conversation => {
        // Sort messages by date
        conversation.messages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        console.log(`Conversation with ${conversation.userName}: ${conversation.messages.length} messages`);
        return conversation;
      });
      
      // Sort conversations by most recent message
      const sortedConversations = conversations.sort((a, b) => 
        new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt)
      );
      
      console.log('Final grouped conversations:', sortedConversations.map(c => ({
        userName: c.userName,
        userId: c.userId,
        messageCount: c.messages.length,
        unreadCount: c.unreadCount,
        lastMessage: c.lastMessage.content.substring(0, 50)
      })));
      console.log('=== END MESSAGE GROUPING ===');
      
      setConversations(sortedConversations);
    } else {
      console.log('No messages to group');
      setConversations([]);
    }
  }, [messages, user._id]);

  // Real-time polling for notifications (every 30 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      refetchNotifications();
    }, 30000);

    return () => clearInterval(interval);
  }, [refetchNotifications]);

  // Real-time polling for messages (every 30 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      refetchMessages();
    }, 30000);

    return () => clearInterval(interval);
  }, [refetchMessages]);

  // Debug logging for messages
  useEffect(() => {
    console.log('Refugee Dashboard - Messages:', messages);
    console.log('Refugee Dashboard - Messages Loading:', messagesLoading);
    console.log('Refugee Dashboard - Messages Error:', messagesError);
    console.log('Refugee Dashboard - Conversations:', conversations);
  }, [messages, messagesLoading, messagesError, conversations]);

  useEffect(() => {
    if (!profileLoading && !profile) {
      navigate('/create-profile', { replace: true });
    }
  }, [profileLoading, profile, navigate]);

  // Defensive loading state (must be after all hooks)
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading user...</div>;
  if (!user) return <div className="min-h-screen flex items-center justify-center text-red-600">User not found. Please log in again.</div>;
  if (profileLoading) return <div className="min-h-screen flex items-center justify-center">Loading profile...</div>;
  if (!profileLoading && !profile) {
    return <div className="min-h-screen flex items-center justify-center">No profile found. Redirecting to create profile...</div>;
  }

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
    { id: 'interviews', label: 'Interviews', icon: Calendar, badge: interviews.filter(int => int.status === 'invited').length > 0 ? interviews.filter(int => int.status === 'invited').length : null },
    { id: 'mentors', label: 'Mentors', icon: Users },
    { id: 'investors', label: 'Investors', icon: DollarSign },
    { id: 'messages', label: 'Messages', icon: MessageCircle, badge: unreadMessagesCount > 0 ? unreadMessagesCount : null },
    { 
      id: 'notifications', 
      label: 'Notifications', 
      icon: Bell,
      badge: unreadNotificationsCount > 0 ? unreadNotificationsCount : null
    },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'support', label: 'Help & Support', icon: HelpCircle }
  ];

  // Subitems for each main category
  const subItems = {
    profile: [],
    opportunities: [
      { label: 'Browse All', icon: Search },
      { label: 'Scholarships', icon: Award },
      { label: 'Job Opportunities', icon: Briefcase },
      { label: 'Internships', icon: Calendar },
      { label: 'Training Programs', icon: BookOpen }
    ]
    // mentors and investors removed
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
      const activeApplications = applications.filter(app => 
        app.status === 'pending' || app.status === 'accepted' || app.status === 'under_review'
      ).length;
      
      const interviewsScheduled = interviews.filter(int => 
        int.status === 'accepted' || int.status === 'scheduled'
      ).length;
      
      const newOpportunities = opportunities.filter(opp => opp.isActive).length;

      // Debug logging
      console.log('Refugee Dashboard Stats:', {
        applications: applications.length,
        activeApplications,
        interviews: interviews.length,
        interviewsScheduled,
        opportunities: opportunities.length,
        newOpportunities,
        applicationsData: applications,
        interviewsData: interviews
      });

      return (
        <div className="space-y-6">
          {/* Error Display */}
          {(opportunitiesError || interviewsError || applicationsError || profileError) && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                <p className="text-red-800 text-sm">
                  {opportunitiesError || interviewsError || applicationsError || profileError}
                </p>
              </div>
            </div>
          )}

          {/* Loading State */}
          {(opportunitiesLoading || interviewsLoading || applicationsLoading || profileLoading) && (
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
          {!opportunitiesLoading && !interviewsLoading && !applicationsLoading && !profileLoading && (
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
                  {/* Show recent applications and interviews */}
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
                <div className="overflow-x-auto bg-white rounded-lg border">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Provider</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
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
                          <td className="px-4 py-2 text-gray-700">{opportunity.category}</td>
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
        </div>
      );
    }

    if (activeItem === 'interviews') {
      return (
        <div className="space-y-6">
          {/* Description */}
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
          {interviewsLoading ? (
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
          ) : interviewsError ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                <p className="text-red-800">{interviewsError}</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {interviews.length === 0 ? (
                <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                  <Calendar className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No interviews yet</h3>
                  <p className="text-gray-600">You haven't received any interview invitations yet. Keep applying to opportunities!</p>
                </div>
              ) : (
                (localInterviews.length > 0 ? localInterviews : interviews).map((interview) => (
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
                        <Clock className="h-4 w-4 mr-2 text-gray-400" />
                        <span className="text-gray-600">
                          {interview.scheduledDate ? new Date(interview.scheduledDate).toLocaleTimeString() : 'Time TBD'}
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
                      <button
                        onClick={() => handleViewInterviewDetails(interview)}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        View Details
                      </button>
                      {interview.status === 'invited' && interview.availabilitySlots && interview.availabilitySlots.length > 0 && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                          {interview.availabilitySlots.length} time slot{interview.availabilitySlots.length > 1 ? 's' : ''} available
                        </span>
                      )}
                      {interview.status === 'invited' && (
                        <>
                          <button
                            onClick={() => handleConfirmInterview(interview._id)}
                            className="text-green-600 hover:text-green-700 text-sm font-medium"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => handleDeclineInterview(interview._id)}
                            className="text-red-600 hover:text-red-700 text-sm font-medium"
                          >
                            Decline
                          </button>
                        </>
                      )}
                      {interview.status === 'scheduled' && (
                        <button
                          onClick={() => handleJoinInterview(interview)}
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                          Join Interview
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      );
    }

    if (activeItem === 'messages') {
      return (
        <div className="flex h-screen bg-gray-100">
          {/* Sidebar - Conversations List */}
          <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col">
            {/* Header */}
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

            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto">
              {!messagesLoading ? (
                conversations.length > 0 ? (
                  conversations.map((conversation) => (
                    <div
                      key={conversation.userId}
                      onClick={async () => {
                        console.log('Selected conversation:', {
                          userId: conversation.userId,
                          userName: conversation.userName,
                          messageCount: conversation.messages.length,
                          messages: conversation.messages.map(m => ({
                            id: m._id,
                            sender: m.sender,
                            recipient: m.recipient,
                            senderName: m.senderName,
                            recipientName: m.recipientName,
                            content: m.content.substring(0, 30)
                          }))
                        });
                        setSelectedConversation(conversation);
                        
                        // Mark all unread messages in this conversation as read
                        await markConversationAsRead(conversation);
                      }}
                      className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedConversation?.userId === conversation.userId ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        {/* Avatar */}
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium text-sm ${getAvatarColor(conversation.userName)}`}>
                          {getInitials(conversation.userName)}
                        </div>
                        
                        {/* Message Info */}
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
                )
              ) : (
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
                      // Use the same normalization logic as in the grouping
                      const senderId = typeof message.sender === 'object' ? message.sender._id : message.sender;
                      const recipientId = typeof message.recipient === 'object' ? message.recipient._id : message.recipient;
                      const currentUserId = typeof user._id === 'object' ? user._id.toString() : user._id;
                      const isReceived = recipientId === currentUserId;
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
                      className="px-6 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {sendingMessage ? 'Sending...' : 'Send'}
                          </button>
                        </div>
                      </div>
              </>
            ) : (
              /* No Conversation Selected */
              <div className="flex-1 flex items-center justify-center bg-gray-50">
                <div className="text-center">
                  <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
                  <p className="text-gray-500">Choose a conversation from the sidebar to start messaging</p>
                </div>
                </div>
          )}
          </div>
        </div>
      );
    }

    if (activeItem === 'notifications') {
      return (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
            <div className="flex space-x-2">
              <button 
                onClick={async () => {
                  // Mark all notifications as read
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

          {/* Notifications List */}
          <div className="space-y-4">
            {notifications && notifications.length > 0 ? (
              notifications.map((notification, index) => (
                <div 
                  key={notification._id || index} 
                  className={`bg-white rounded-lg shadow border p-4 cursor-pointer transition-colors ${
                    !notification.isRead ? 'border-blue-200 bg-blue-50' : 'border-gray-200'
                  }`}
                  onClick={async () => {
                    // Mark notification as read
                    if (!notification.isRead) {
                      await markNotificationAsRead(notification._id);
                    }
                    
                    // Navigate based on notification type
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
                      {notification.metadata && (
                        <div className="text-xs text-gray-500 mb-2">
                          {notification.metadata.providerName && (
                            <span className="mr-3">Provider: {notification.metadata.providerName}</span>
                          )}
                          {notification.metadata.opportunityType && (
                            <span>Type: {notification.metadata.opportunityType}</span>
                          )}
                        </div>
                      )}
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
    }

    if (activeItem === 'settings') {
      return (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900">Settings</h3>

          {/* Settings Sections */}
          <div className="space-y-6">
            {/* Profile Settings */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <User className="h-5 w-5 mr-2 text-gray-500" />
                Profile Settings
              </h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Profile Visibility</label>
                    <p className="text-xs text-gray-500">Make your profile visible to providers</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={settings.profileVisibility}
                      onChange={(e) => setSettings(prev => ({ ...prev, profileVisibility: e.target.checked }))}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Email Notifications</label>
                    <p className="text-xs text-gray-500">Receive email updates about opportunities</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={settings.emailNotifications}
                      onChange={(e) => setSettings(prev => ({ ...prev, emailNotifications: e.target.checked }))}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Push Notifications</label>
                    <p className="text-xs text-gray-500">Receive notifications in your browser</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={settings.pushNotifications}
                      onChange={(e) => setSettings(prev => ({ ...prev, pushNotifications: e.target.checked }))}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Privacy Settings */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <Settings className="h-5 w-5 mr-2 text-gray-500" />
                Privacy Settings
              </h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Show Contact Info</label>
                    <p className="text-xs text-gray-500">Display your email and phone to providers</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={settings.showContactInfo}
                      onChange={(e) => setSettings(prev => ({ ...prev, showContactInfo: e.target.checked }))}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Show Location</label>
                    <p className="text-xs text-gray-500">Display your current location</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={settings.showLocation}
                      onChange={(e) => setSettings(prev => ({ ...prev, showLocation: e.target.checked }))}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Account Settings */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <User className="h-5 w-5 mr-2 text-gray-500" />
                Account Settings
              </h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    value={settings.email}
                    onChange={(e) => setSettings(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                  <select 
                    value={settings.language}
                    onChange={(e) => setSettings(prev => ({ ...prev, language: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option>English</option>
                    <option>Spanish</option>
                    <option>French</option>
                    <option>Arabic</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Time Zone</label>
                  <select 
                    value={settings.timeZone}
                    onChange={(e) => setSettings(prev => ({ ...prev, timeZone: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option>UTC-5 (Eastern Time)</option>
                    <option>UTC-6 (Central Time)</option>
                    <option>UTC-7 (Mountain Time)</option>
                    <option>UTC-8 (Pacific Time)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end items-center space-x-3">
              {settingsSaved && (
                <div className="text-green-600 text-sm flex items-center">
                  <span className="w-2 h-2 bg-green-600 rounded-full mr-2"></span>
                  Settings saved successfully!
                </div>
              )}
              <button 
                onClick={saveSettings}
                disabled={savingSettings}
                className={`px-6 py-2 rounded-lg transition-colors ${
                  savingSettings 
                    ? 'bg-gray-400 text-white cursor-not-allowed' 
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {savingSettings ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (activeItem === 'support') {
      return (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900">Help & Support</h3>

          {/* Support Sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* FAQ */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <HelpCircle className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-3">
                  <h4 className="font-medium text-gray-900">Frequently Asked Questions</h4>
                  <p className="text-sm text-gray-500">Find answers to common questions</p>
                </div>
              </div>
              <div className="space-y-3">
                <details className="group">
                  <summary className="flex justify-between items-center cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
                    How do I create my profile?
                    <span className="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <p className="mt-2 text-sm text-gray-600">
                    Go to your profile section and click "Edit Profile" to fill out your information, skills, and experience.
                  </p>
                </details>
                <details className="group">
                  <summary className="flex justify-between items-center cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
                    How do I apply for opportunities?
                    <span className="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <p className="mt-2 text-sm text-gray-600">
                    Browse opportunities in the Opportunities section and click "View Details" to learn more and apply.
                  </p>
                </details>
                <details className="group">
                  <summary className="flex justify-between items-center cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
                    How do I check my application status?
                    <span className="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <p className="mt-2 text-sm text-gray-600">
                    Visit the "My Applications" section to see the status of all your applications and interviews.
                  </p>
                </details>
              </div>
            </div>

            {/* Contact Support */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <MessageCircle className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-3">
                  <h4 className="font-medium text-gray-900">Contact Support</h4>
                  <p className="text-sm text-gray-500">Get help from our team</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center text-sm">
                  <MessageCircle className="h-4 w-4 mr-2 text-gray-500" />
                  <span>support@refuture.com</span>
                </div>
                <div className="flex items-center text-sm">
                  <Clock className="h-4 w-4 mr-2 text-gray-500" />
                  <span>24/7 Support Available</span>
                </div>
                <div className="flex items-center text-sm">
                  <Users className="h-4 w-4 mr-2 text-gray-500" />
                  <span>Live chat available</span>
                </div>
              </div>
              <button className="w-full mt-4 bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700 transition-colors">
                Contact Support
              </button>
            </div>

            {/* Resources */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <BookOpen className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-3">
                  <h4 className="font-medium text-gray-900">Resources</h4>
                  <p className="text-sm text-gray-500">Helpful guides and tools</p>
                </div>
              </div>
              <div className="space-y-2">
                <a href="#" className="block text-sm text-blue-600 hover:text-blue-800">Getting Started Guide</a>
                <a href="#" className="block text-sm text-blue-600 hover:text-blue-800">Profile Optimization Tips</a>
                <a href="#" className="block text-sm text-blue-600 hover:text-blue-800">Interview Preparation</a>
                <a href="#" className="block text-sm text-blue-600 hover:text-blue-800">Resume Templates</a>
                <a href="#" className="block text-sm text-blue-600 hover:text-blue-800">Community Guidelines</a>
              </div>
            </div>

            {/* Community */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Users className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-3">
                  <h4 className="font-medium text-gray-900">Community</h4>
                  <p className="text-sm text-gray-500">Connect with others</p>
                </div>
              </div>
              <div className="space-y-2">
                <a href="#" className="block text-sm text-blue-600 hover:text-blue-800">Community Forum</a>
                <a href="#" className="block text-sm text-blue-600 hover:text-blue-800">Success Stories</a>
                <a href="#" className="block text-sm text-blue-600 hover:text-blue-800">Mentorship Program</a>
                <a href="#" className="block text-sm text-blue-600 hover:text-blue-800">Events & Workshops</a>
                <a href="#" className="block text-sm text-blue-600 hover:text-blue-800">Volunteer Opportunities</a>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (subItems[activeItem]) {
      // Profile section: handle view/edit
      if (activeItem === 'profile') {
        // Callback to handle profile update
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
      }
      return (
        <div className="flex flex-row flex-wrap gap-4">
          {subItems[activeItem].map((sub, idx) => (
            <div
              key={idx}
              className="flex items-center p-4 bg-white rounded-lg shadow border border-gray-100 min-w-[220px] cursor-pointer hover:bg-blue-50 transition"
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

  // Helper functions for avatar and initials
  const getAvatarColor = (name) => {
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500', 
      'bg-indigo-500', 'bg-yellow-500', 'bg-red-500', 'bg-teal-500'
    ];
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  const getInitials = (name) => {
    if (!name) return '';
    const names = name.split(' ');
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return names[0].charAt(0).toUpperCase() + names[names.length - 1].charAt(0).toUpperCase();
  };

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
      refetchMessages();
      
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setSendingMessage(false);
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Interview handlers
  const handleViewInterviewDetails = (interview) => {
    console.log('Opening interview details:', interview);
    console.log('Interview status:', interview.status);
    console.log('Availability slots:', interview.availabilitySlots);
    console.log('Number of slots:', interview.availabilitySlots?.length);
    setSelectedInterviewDetails(interview);
    setShowInterviewDetailsModal(true);
  };

  const handleConfirmInterview = async (interviewId) => {
    try {
      // Find the interview and its selected slot
      const interview = (localInterviews.length > 0 ? localInterviews : interviews).find(i => i._id === interviewId);
      const selectedSlot = interview?.talentResponse?.selectedSlot;
      if (!selectedSlot) {
        setSlotSelectionError('Please select a time slot before confirming.');
        return;
      }
      setSlotSelectionError('');
      await respondToInterview(interviewId, {
        status: 'confirmed',
        message: 'Interview confirmed by refugee',
        selectedSlot
      });
      // The hook will automatically update the local state
      // Optionally show a toast or non-intrusive message here
    } catch (error) {
      console.error('Error confirming interview:', error);
      // Optionally show a toast or non-intrusive message here
    }
  };

  const handleDeclineInterview = async (interviewId) => {
    try {
      await respondToInterview(interviewId, {
        status: 'declined',
        message: 'Interview declined by refugee'
      });
      // The hook will automatically update the local state
      alert('Interview declined successfully!');
    } catch (error) {
      console.error('Error declining interview:', error);
      alert('Failed to decline interview. Please try again.');
    }
  };

  const handleJoinInterview = (interview) => {
    // This would open the interview meeting link
    if (interview.meetingLink) {
      window.open(interview.meetingLink, '_blank');
    } else {
      console.log('No meeting link available for this interview');
      alert('Meeting link not available yet. Please contact the provider.');
    }
  };

  const handleSelectTimeSlot = async (interviewId, slotIndex) => {
    try {
      // First, update the local state immediately for better UX
      const updatedInterviews = interviews.map(interview => 
        interview._id === interviewId 
          ? {
              ...interview,
              talentResponse: {
                ...interview.talentResponse,
                selectedSlot: interview.availabilitySlots[slotIndex]
              }
            }
          : interview
      );
      
      setLocalInterviews(updatedInterviews);
      
      // Update the modal state
      setSelectedInterviewDetails(prev => 
        prev ? {
          ...prev,
          talentResponse: {
            ...prev.talentResponse,
            selectedSlot: prev.availabilitySlots[slotIndex]
          }
        } : null
      );
      
      // Call the API to update the backend
      const interview = interviews.find(i => i._id === interviewId);
      const slot = interview && interview.availabilitySlots ? interview.availabilitySlots[slotIndex] : null;
      await respondToInterview(interviewId, {
        status: 'confirmed',
        message: 'Time slot selected from available options',
        selectedSlot: slot
      });
      
      alert('Time slot selected successfully! You can now confirm the interview.');
    } catch (error) {
      console.error('Error selecting time slot:', error);
      alert('Failed to select time slot. Please try again.');
      
      // Revert the local state on error
      setLocalInterviews(interviews);
    }
  };

  // Helper: Get upcoming interviews within 24 hours
  const now = new Date();
  const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const upcomingInterviews = (localInterviews.length > 0 ? localInterviews : interviews)
    .filter(int => int.status === 'scheduled' && int.scheduledDate &&
      new Date(int.scheduledDate) > now && new Date(int.scheduledDate) <= in24h &&
      !dismissedReminders.includes(int._id)
    )
    .sort((a, b) => new Date(a.scheduledDate) - new Date(b.scheduledDate));

  // Handler to dismiss a reminder
  const dismissReminder = (id) => setDismissedReminders(prev => [...prev, id]);

  return (
    <div>
      {/* Upcoming Interview Reminder Banner */}
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
                  <div className="text-xs text-blue-700 mt-1">
                    {interview.providerId?.firstName && interview.providerId?.lastName
                      ? `${interview.providerId.firstName} ${interview.providerId.lastName}`
                      : interview.organization || 'Unknown Provider'}
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
      {/* Main dashboard content follows */}
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
        
        {/* MessageCenter Modal */}
        <MessageCenter
          isOpen={showMessageCenter}
          onClose={() => setShowMessageCenter(false)}
        />

        {/* Interview Details Modal */}
        {showInterviewDetailsModal && selectedInterviewDetails && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-900">Interview Details</h2>
                  <button
                    onClick={() => setShowInterviewDetailsModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Interview Status */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-semibold text-gray-900">Status</h3>
                    <p className="text-sm text-gray-600">Current interview status</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    selectedInterviewDetails.status === 'invited' ? 'bg-yellow-100 text-yellow-800' :
                    selectedInterviewDetails.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                    selectedInterviewDetails.status === 'scheduled' ? 'bg-green-100 text-green-800' :
                    selectedInterviewDetails.status === 'completed' ? 'bg-purple-100 text-purple-800' :
                    selectedInterviewDetails.status === 'declined' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {selectedInterviewDetails.status === 'invited' ? 'Invitation Sent' :
                     selectedInterviewDetails.status === 'confirmed' ? 'Confirmed' :
                     selectedInterviewDetails.status === 'scheduled' ? 'Scheduled' :
                     selectedInterviewDetails.status === 'completed' ? 'Completed' :
                     selectedInterviewDetails.status === 'declined' ? 'Declined' :
                     selectedInterviewDetails.status}
                  </span>
                </div>

                {/* Interview Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Interview Information</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Type</label>
                        <p className="text-sm text-gray-900">{selectedInterviewDetails.type || 'Not specified'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Title</label>
                        <p className="text-sm text-gray-900">{selectedInterviewDetails.title || 'Interview'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Organization</label>
                        <p className="text-sm text-gray-900">{selectedInterviewDetails.organization || 'Not specified'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Provider</label>
                        <p className="text-sm text-gray-900">
                          {selectedInterviewDetails.providerId?.firstName && selectedInterviewDetails.providerId?.lastName
                            ? `${selectedInterviewDetails.providerId.firstName} ${selectedInterviewDetails.providerId.lastName}`
                            : selectedInterviewDetails.organization || 'Unknown Provider'
                          }
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Schedule Details</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Date & Time</label>
                        <p className="text-sm text-gray-900">
                          {selectedInterviewDetails.scheduledDate ? 
                            new Date(selectedInterviewDetails.scheduledDate).toLocaleString() : 
                            'Not scheduled'
                          }
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Duration</label>
                        <p className="text-sm text-gray-900">
                          {selectedInterviewDetails.duration ? `${selectedInterviewDetails.duration} minutes` : 'Not specified'}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Format</label>
                        <p className="text-sm text-gray-900">
                          {selectedInterviewDetails.format === 'video' ? 'Video Call' :
                           selectedInterviewDetails.format === 'in-person' ? 'In-Person' :
                           selectedInterviewDetails.format === 'phone' ? 'Phone Call' :
                           selectedInterviewDetails.format === 'hybrid' ? 'Hybrid' :
                           selectedInterviewDetails.format || 'Not specified'}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Location</label>
                        <p className="text-sm text-gray-900">{selectedInterviewDetails.location || 'Not specified'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Meeting Platform (for video calls) */}
                {selectedInterviewDetails.format === 'video' && selectedInterviewDetails.meetingPlatform && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Meeting Platform</h3>
                    <p className="text-sm text-gray-900">{selectedInterviewDetails.meetingPlatform}</p>
                  </div>
                )}

                {/* Materials Required */}
                {selectedInterviewDetails.materials && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Materials Required</h3>
                    <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">
                      {selectedInterviewDetails.materials}
                    </p>
                  </div>
                )}

                {/* Special Instructions */}
                {selectedInterviewDetails.instructions && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Special Instructions</h3>
                    <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">
                      {selectedInterviewDetails.instructions}
                    </p>
                  </div>
                )}

                {/* Description */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Description</h3>
                  <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">
                    {selectedInterviewDetails.description || 'No description provided'}
                  </p>
                </div>

                {/* Provider Notes */}
                {selectedInterviewDetails.providerNotes && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Provider Notes</h3>
                    <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">
                      {selectedInterviewDetails.providerNotes}
                    </p>
                  </div>
                )}

                {/* Meeting Link */}
                {selectedInterviewDetails.meetingLink && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Meeting Link</h3>
                    <a 
                      href={selectedInterviewDetails.meetingLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 text-sm break-all"
                    >
                      {selectedInterviewDetails.meetingLink}
                    </a>
                  </div>
                )}

                {/* Created Date */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Created</h3>
                  <p className="text-sm text-gray-900">
                    {new Date(selectedInterviewDetails.createdAt).toLocaleString()}
                  </p>
                </div>

                {/* Availability Slots Section */}
                {selectedInterviewDetails.status === 'invited' && selectedInterviewDetails.availabilitySlots && selectedInterviewDetails.availabilitySlots.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Available Time Slots</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Please select your preferred time slot from the options below:
                    </p>
                    <div className="space-y-3">
                      {selectedInterviewDetails.availabilitySlots.map((slot, index) => (
                        <div key={index} className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                          selectedInterviewDetails.talentResponse?.selectedSlot?.date === slot.date && 
                          selectedInterviewDetails.talentResponse?.selectedSlot?.startTime === slot.startTime
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                        }`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <Calendar className="h-5 w-5 text-blue-600" />
                              <div>
                                <p className="font-medium text-gray-900">
                                  {new Date(slot.date).toLocaleDateString('en-US', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                  })}
                                </p>
                                <p className="text-sm text-gray-600">
                                  {slot.startTime} - {slot.endTime} ({slot.duration || 60} minutes)
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => handleSelectTimeSlot(selectedInterviewDetails._id, index)}
                              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                selectedInterviewDetails.talentResponse?.selectedSlot?.date === slot.date && 
                                selectedInterviewDetails.talentResponse?.selectedSlot?.startTime === slot.startTime
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-gray-100 text-gray-700 hover:bg-blue-600 hover:text-white'
                              }`}
                            >
                              {selectedInterviewDetails.talentResponse?.selectedSlot?.date === slot.date && 
                               selectedInterviewDetails.talentResponse?.selectedSlot?.startTime === slot.startTime
                                ? 'Selected'
                                : 'Select This Time'
                              }
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                  {selectedInterviewDetails.status === 'invited' && (
                    <>
                      {selectedInterviewDetails.availabilitySlots && selectedInterviewDetails.availabilitySlots.length > 0 ? (
                        <button
                          onClick={() => {
                            handleConfirmInterview(selectedInterviewDetails._id);
                            setShowInterviewDetailsModal(false);
                          }}
                          disabled={!selectedInterviewDetails.talentResponse?.selectedSlot}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            selectedInterviewDetails.talentResponse?.selectedSlot
                              ? 'bg-green-600 text-white hover:bg-green-700'
                              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          Confirm Selected Time
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            handleConfirmInterview(selectedInterviewDetails._id);
                            setShowInterviewDetailsModal(false);
                          }}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
                        >
                          Confirm Interview
                        </button>
                      )}
                      {/* Show slot selection error message below the button if needed */}
                      {slotSelectionError && (
                        <div className="text-red-600 text-sm mt-2">{slotSelectionError}</div>
                      )}
                      <button
                        onClick={() => {
                          handleDeclineInterview(selectedInterviewDetails._id);
                          setShowInterviewDetailsModal(false);
                        }}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium"
                      >
                        Decline Interview
                      </button>
                    </>
                  )}
                  {selectedInterviewDetails.status === 'scheduled' && selectedInterviewDetails.meetingLink && (
                    <button
                      onClick={() => {
                        handleJoinInterview(selectedInterviewDetails);
                        setShowInterviewDetailsModal(false);
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                    >
                      Join Interview
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RefugeeDashboard; 

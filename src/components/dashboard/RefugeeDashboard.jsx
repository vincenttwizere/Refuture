import React, { useState, useEffect } from 'react';
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
  X
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
import MessageCenter from '../messaging/MessageCenter';

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
    error: profileError,
    refetch: refetchProfile 
  } = useProfiles({ email: user?.email });
  const profile = profiles && profiles.length > 0 ? profiles[0] : null;

  const { notifications, refetch: refetchNotifications } = useNotifications();
  const { messages, loading: messagesLoading, error: messagesError, refetch: refetchMessages } = useMessages();
  const [showMessageCenter, setShowMessageCenter] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [conversations, setConversations] = useState([]);

  // Calculate unread notifications count
  const unreadNotificationsCount = notifications.filter(notification => !notification.isRead).length;

  // Calculate unread messages count
  const unreadMessagesCount = messages.filter(message => !message.isRead && message.recipient === user?._id).length;

  // Group messages into conversations
  useEffect(() => {
    if (messages.length > 0) {
      const conversationMap = new Map();
      
      messages.forEach(message => {
        const isReceived = message.recipient === user._id;
        const otherUserId = isReceived ? message.sender : message.recipient;
        const otherUserName = isReceived ? message.senderName : message.recipientName;
        
        if (!conversationMap.has(otherUserId)) {
          conversationMap.set(otherUserId, {
            userId: otherUserId,
            userName: otherUserName,
            messages: [],
            unreadCount: 0,
            lastMessage: null
          });
        }
        
        const conversation = conversationMap.get(otherUserId);
        conversation.messages.push(message);
        
        if (isReceived && !message.isRead) {
          conversation.unreadCount++;
        }
        
        if (!conversation.lastMessage || new Date(message.createdAt) > new Date(conversation.lastMessage.createdAt)) {
          conversation.lastMessage = message;
        }
      });
      
      // Convert to array and sort by last message date
      const conversationsArray = Array.from(conversationMap.values()).sort((a, b) => 
        new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt)
      );
      
      setConversations(conversationsArray);
    } else {
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
  }, [messages, messagesLoading, messagesError]);

  // Defensive loading state (must be after all hooks)
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading user...</div>;
  if (!user) return <div className="min-h-screen flex items-center justify-center text-red-600">User not found. Please log in again.</div>;
  if (profileLoading) return <div className="min-h-screen flex items-center justify-center">Loading profile...</div>;
  
  // Check if user has profile after loading is complete
  if (!profileLoading && !profile) {
    // Redirect to create profile if no profile exists
    useEffect(() => {
      navigate('/create-profile', { replace: true });
    }, [navigate]);
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
    ],
    mentors: [
      { label: 'Find Mentors', icon: Search },
      { label: 'My Mentors', icon: Users },
      { label: 'Mentorship Requests', icon: Send }
    ],
    investors: [
      { label: 'Browse Investors', icon: Search },
      { label: 'My Connections', icon: Users },
      { label: 'Investment Opportunities', icon: DollarSign }
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

    if (activeItem === 'messages') {
      return (
        <div className="space-y-6">
          {/* Error Display */}
          {messagesError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                <p className="text-red-800 text-sm">{messagesError}</p>
              </div>
            </div>
          )}

          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Messages</h3>
              <p className="text-sm text-gray-600">Communicate with providers and mentors</p>
            </div>
            <button
              onClick={() => setShowMessageCenter(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Open Messages
            </button>
          </div>

          {/* Loading State */}
          {messagesLoading && (
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

          {/* Messages Display */}
          {!messagesLoading && (
            <>
              {conversations.length > 0 ? (
                <div className="space-y-4">
                  {conversations.map((conversation) => (
                    <div 
                      key={conversation.userId} 
                      className="bg-white rounded-lg shadow border border-gray-200 p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => setSelectedConversation(conversation)}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-1">
                            {conversation.userName}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {conversation.lastMessage.content.length > 50 
                              ? conversation.lastMessage.content.substring(0, 50) + '...'
                              : conversation.lastMessage.content
                            }
                          </p>
                        </div>
                        <div className="text-right">
                          {conversation.unreadCount > 0 && (
                            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                              {conversation.unreadCount}
                            </span>
                          )}
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(conversation.lastMessage.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex justify-end">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedConversation(conversation);
                          }}
                          className="bg-blue-50 text-blue-700 px-3 py-2 rounded text-sm hover:bg-blue-100 transition-colors"
                        >
                          <MessageCircle className="h-4 w-4 inline mr-1" />
                          Open Conversation
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
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
            </>
          )}

          {/* Conversation Modal */}
          {selectedConversation && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] flex flex-col">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-900">Conversation with {selectedConversation.userName}</h2>
                    <button
                      onClick={() => setSelectedConversation(null)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-6 w-6" />
                    </button>
                  </div>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6">
                  <div className="space-y-4">
                    {selectedConversation.messages.map((message) => {
                      const isReceived = message.recipient === user._id;
                      return (
                        <div 
                          key={message._id} 
                          className={`flex ${isReceived ? 'justify-start' : 'justify-end'}`}
                        >
                          <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            isReceived 
                              ? 'bg-gray-100 text-gray-900' 
                              : 'bg-blue-600 text-white'
                          }`}>
                            <p className="text-sm">{message.content}</p>
                            <p className={`text-xs mt-1 ${
                              isReceived ? 'text-gray-500' : 'text-blue-100'
                            }`}>
                              {new Date(message.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                <div className="p-6 border-t border-gray-200">
                  <div className="flex space-x-3">
                    <button
                      onClick={() => setShowMessageCenter(true)}
                      className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                    >
                      <MessageCircle className="h-4 w-4 inline mr-2" />
                      Reply
                    </button>
                    <button
                      onClick={() => setSelectedConversation(null)}
                      className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Message Center Modal */}
          <MessageCenter 
            isOpen={showMessageCenter}
            onClose={() => setShowMessageCenter(false)}
            preSelectedRecipient={selectedConversation}
          />
        </div>
      );
    }

    if (activeItem === 'mentors') {
      return (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Mentors</h3>
            <div className="flex space-x-2">
              <button className="bg-gray-100 text-gray-700 px-3 py-2 rounded-lg text-sm hover:bg-gray-200 transition-colors">
                <Filter className="h-4 w-4 inline mr-1" />
                Filter
              </button>
              <button className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors">
                <Search className="h-4 w-4 inline mr-1" />
                Find Mentors
              </button>
            </div>
          </div>

          {/* Mentors Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Available Mentors */}
            <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-3">
                  <h4 className="font-semibold text-gray-900">Available Mentors</h4>
                  <p className="text-sm text-gray-600">Connect with experienced professionals</p>
                </div>
              </div>
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  Career guidance
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  Industry insights
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  Skill development
                </div>
              </div>
              <button className="w-full bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 transition-colors">
                Browse Mentors
              </button>
            </div>

            {/* My Mentors */}
            <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-3">
                  <h4 className="font-semibold text-gray-900">My Mentors</h4>
                  <p className="text-sm text-gray-600">Your current mentorship connections</p>
                </div>
              </div>
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Active mentorships
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Scheduled sessions
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Progress tracking
                </div>
              </div>
              <button className="w-full bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700 transition-colors">
                View My Mentors
              </button>
            </div>

            {/* Mentorship Requests */}
            <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Send className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-3">
                  <h4 className="font-semibold text-gray-900">Mentorship Requests</h4>
                  <p className="text-sm text-gray-600">Manage your mentorship applications</p>
                </div>
              </div>
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                  Pending requests
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                  Accepted mentorships
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                  Request history
                </div>
              </div>
              <button className="w-full bg-purple-600 text-white px-4 py-2 rounded text-sm hover:bg-purple-700 transition-colors">
                View Requests
              </button>
            </div>
          </div>

          {/* Featured Mentors */}
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <h4 className="font-semibold text-gray-900 mb-4">Featured Mentors</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Mentor Card 1 */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center mr-3">
                    <Users className="h-6 w-6 text-gray-600" />
                  </div>
                  <div>
                    <h5 className="font-medium text-gray-900">Sarah Johnson</h5>
                    <p className="text-sm text-gray-600">Software Engineer</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-3">10+ years experience in tech industry. Specializes in career transitions and skill development.</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Tech</span>
                  <button className="text-blue-600 text-sm hover:text-blue-800">Connect</button>
                </div>
              </div>

              {/* Mentor Card 2 */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center mr-3">
                    <Users className="h-6 w-6 text-gray-600" />
                  </div>
                  <div>
                    <h5 className="font-medium text-gray-900">Michael Chen</h5>
                    <p className="text-sm text-gray-600">Business Consultant</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-3">Former refugee, now successful entrepreneur. Helps with business development and cultural integration.</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Business</span>
                  <button className="text-blue-600 text-sm hover:text-blue-800">Connect</button>
                </div>
              </div>

              {/* Mentor Card 3 */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center mr-3">
                    <Users className="h-6 w-6 text-gray-600" />
                  </div>
                  <div>
                    <h5 className="font-medium text-gray-900">Dr. Maria Rodriguez</h5>
                    <p className="text-sm text-gray-600">Education Specialist</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-3">PhD in Education. Specializes in helping refugees access educational opportunities and navigate academic systems.</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">Education</span>
                  <button className="text-blue-600 text-sm hover:text-blue-800">Connect</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (activeItem === 'investors') {
      return (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Investors</h3>
            <div className="flex space-x-2">
              <button className="bg-gray-100 text-gray-700 px-3 py-2 rounded-lg text-sm hover:bg-gray-200 transition-colors">
                <Filter className="h-4 w-4 inline mr-1" />
                Filter
              </button>
              <button className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors">
                <Search className="h-4 w-4 inline mr-1" />
                Find Investors
              </button>
            </div>
          </div>

          {/* Investors Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Browse Investors */}
            <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Search className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-3">
                  <h4 className="font-semibold text-gray-900">Browse Investors</h4>
                  <p className="text-sm text-gray-600">Find potential investors</p>
                </div>
              </div>
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  Angel investors
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  Venture capitalists
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  Impact investors
                </div>
              </div>
              <button className="w-full bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 transition-colors">
                Browse Investors
              </button>
            </div>

            {/* My Connections */}
            <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-3">
                  <h4 className="font-semibold text-gray-900">My Connections</h4>
                  <p className="text-sm text-gray-600">Your investor network</p>
                </div>
              </div>
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Connected investors
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Investment discussions
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Partnership opportunities
                </div>
              </div>
              <button className="w-full bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700 transition-colors">
                View Connections
              </button>
            </div>

            {/* Investment Opportunities */}
            <div className="bg-white p-6 border-b border-gray-200">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-3">
                  <h4 className="font-semibold text-gray-900">Investment Opportunities</h4>
                  <p className="text-sm text-gray-600">Funding and support programs</p>
                </div>
              </div>
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                  Startup funding
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                  Business grants
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                  Microfinance options
                </div>
              </div>
              <button className="w-full bg-purple-600 text-white px-4 py-2 rounded text-sm hover:bg-purple-700 transition-colors">
                View Opportunities
              </button>
            </div>
          </div>

          {/* Featured Investors */}
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <h4 className="font-semibold text-gray-900 mb-4">Featured Investors</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Investor 1 */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center mr-3">
                    <DollarSign className="h-6 w-6 text-gray-600" />
                  </div>
                  <div>
                    <h5 className="font-medium text-gray-900">Refugee Impact Fund</h5>
                    <p className="text-sm text-gray-600">Impact Investment Fund</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-3">Dedicated to supporting refugee entrepreneurs and businesses. Focus on social impact and sustainable growth.</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">$50K-$500K</span>
                  <button className="text-blue-600 text-sm hover:text-blue-800">Connect</button>
                </div>
              </div>

              {/* Investor 2 */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center mr-3">
                    <DollarSign className="h-6 w-6 text-gray-600" />
                  </div>
                  <div>
                    <h5 className="font-medium text-gray-900">Global Ventures</h5>
                    <p className="text-sm text-gray-600">Venture Capital</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-3">Early-stage venture capital firm with a focus on diverse founders and innovative solutions.</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">$100K-$2M</span>
                  <button className="text-blue-600 text-sm hover:text-blue-800">Connect</button>
                </div>
              </div>

              {/* Investor 3 */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center mr-3">
                    <DollarSign className="h-6 w-6 text-gray-600" />
                  </div>
                  <div>
                    <h5 className="font-medium text-gray-900">Community Angels</h5>
                    <p className="text-sm text-gray-600">Angel Investment Network</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-3">Network of angel investors supporting refugee entrepreneurs with mentorship and funding.</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">$10K-$100K</span>
                  <button className="text-blue-600 text-sm hover:text-blue-800">Connect</button>
                </div>
              </div>
            </div>
          </div>

          {/* Investment Resources */}
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <h4 className="font-semibold text-gray-900 mb-4">Investment Resources</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h5 className="font-medium text-gray-900">Getting Started</h5>
                <div className="space-y-2">
                  <a href="#" className="block text-sm text-blue-600 hover:text-blue-800">How to Pitch Your Business</a>
                  <a href="#" className="block text-sm text-blue-600 hover:text-blue-800">Business Plan Template</a>
                  <a href="#" className="block text-sm text-blue-600 hover:text-blue-800">Financial Projections Guide</a>
                </div>
              </div>
              <div className="space-y-3">
                <h5 className="font-medium text-gray-900">Support Programs</h5>
                <div className="space-y-2">
                  <a href="#" className="block text-sm text-blue-600 hover:text-blue-800">Incubator Programs</a>
                  <a href="#" className="block text-sm text-blue-600 hover:text-blue-800">Accelerator Applications</a>
                  <a href="#" className="block text-sm text-blue-600 hover:text-blue-800">Grant Opportunities</a>
                </div>
              </div>
            </div>
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
                onClick={() => {
                  // Mark all notifications as read
                  notifications.forEach(notification => {
                    if (!notification.isRead) {
                      // Call API to mark as read
                      fetch(`http://localhost:5001/api/notifications/${notification._id}/read`, {
                        method: 'PUT',
                        headers: {
                          'Authorization': `Bearer ${localStorage.getItem('token')}`,
                          'Content-Type': 'application/json'
                        }
                      });
                    }
                  });
                  refetchNotifications();
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
                  onClick={() => {
                    // Mark notification as read
                    if (!notification.isRead) {
                      fetch(`http://localhost:5001/api/notifications/${notification._id}/read`, {
                        method: 'PUT',
                        headers: {
                          'Authorization': `Bearer ${localStorage.getItem('token')}`,
                          'Content-Type': 'application/json'
                        }
                      }).then(() => refetchNotifications());
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
                      defaultChecked={profile?.isPublic}
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
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Push Notifications</label>
                    <p className="text-xs text-gray-500">Receive notifications in your browser</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
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
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Show Location</label>
                    <p className="text-xs text-gray-500">Display your current location</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
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
                    defaultValue={user?.email}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>English</option>
                    <option>Spanish</option>
                    <option>French</option>
                    <option>Arabic</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Time Zone</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>UTC-5 (Eastern Time)</option>
                    <option>UTC-6 (Central Time)</option>
                    <option>UTC-7 (Mountain Time)</option>
                    <option>UTC-8 (Pacific Time)</option>
                  </select>
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

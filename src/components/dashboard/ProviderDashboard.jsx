import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { 
  Home, 
  Users, 
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
  LogOut,
  AlertCircle,
  MapPin,
  Save,
  Trash2,
  RefreshCw,
  X,
  CheckCircle,
  Mail,
  Phone,
  Video,
  Globe,
  GraduationCap,
  Download,
  ArrowLeft,
  BookOpen,
  Languages,
  Palette,
  Search,
  User
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useOpportunities } from '../../hooks/useOpportunities';
import { useInterviews } from '../../hooks/useInterviews';
import { useProfiles } from '../../hooks/useProfiles';
import { useNotifications } from '../../hooks/useNotifications';
import { useMessages } from '../../hooks/useMessages';
import { useApplications } from '../../hooks/useApplications';
import MessageCenter from '../messaging/MessageCenter';
import { messagesAPI, notificationsAPI, interviewsAPI } from '../../services/api';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import ProfileView from '../profiles/ProfileView';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const ProviderDashboard = () => {
  const [activeItem, setActiveItem] = useState('overview');
  const [expandedSections, setExpandedSections] = useState({
    talent: true,
    opportunities: true,
    applications: true
  });

  const { logout, user, loading } = useAuth();
  const navigate = useNavigate();

  // Function to expand common degree abbreviations
  const expandDegreeAbbreviation = (degree) => {
    if (!degree) return degree;
    
    const abbreviations = {
      'BD': 'Bachelor Degree',
      'BS': 'Bachelor of Science',
      'BA': 'Bachelor of Arts',
      'BSc': 'Bachelor of Science',
      'BEng': 'Bachelor of Engineering',
      'BBA': 'Bachelor of Business Administration',
      'MD': 'Master Degree',
      'MS': 'Master of Science',
      'MA': 'Master of Arts',
      'MSc': 'Master of Science',
      'MBA': 'Master of Business Administration',
      'PhD': 'Doctor of Philosophy',
      'Ph.D': 'Doctor of Philosophy',
      'DBA': 'Doctor of Business Administration',
      'JD': 'Juris Doctor',
      'LLB': 'Bachelor of Laws',
      'LLM': 'Master of Laws'
    };
    
    const upperDegree = degree.toUpperCase().trim();
    return abbreviations[upperDegree] || degree;
  };

  // Fetch real data from API
  const { 
    opportunities, 
    loading: opportunitiesLoading, 
    error: opportunitiesError,
    pagination: opportunitiesPagination,
    createOpportunity,
    updateOpportunity,
    deleteOpportunity,
    refetch: refetchOpportunities
  } = useOpportunities();

  const {
    interviews, 
    loading: interviewsLoading, 
    error: interviewsError,
    sendInterviewInvite,
    updateInterview,
    deleteInterview,
    refetch: refetchInterviews
  } = useInterviews('provider');

  const { 
    profiles, 
    loading: profilesLoading, 
    error: profilesError,
    fetchProfiles,
    fetchProfileById
  } = useProfiles();

  // Memoize the fetchProfiles function to prevent unnecessary re-renders
  const stableFetchProfiles = useCallback(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  // Ensure profiles are fetched when component mounts
  useEffect(() => {
    if (profiles.length === 0 && !profilesLoading) {
      stableFetchProfiles();
    }
  }, [profiles.length, profilesLoading, stableFetchProfiles]);

  // Memoize refugee profiles filtering to prevent unnecessary re-computations
  const validCategories = ['student', 'job seeker', 'undocumented_talent'];
  const allRefugeeProfiles = useMemo(() => {
    if (!profiles || profiles.length === 0) return [];
    
    // Debug logging
    console.log('ProviderDashboard - Available Talents Debug:', {
      totalProfiles: profiles.length,
      profiles: profiles.map(p => ({
        id: p._id,
        email: p.email,
        fullName: p.fullName || `${p.firstName} ${p.lastName}`,
        option: p.option,
        userRole: p.user?.role,
        isPublic: p.isPublic
      }))
    });
    
    const filtered = profiles.filter(p => {
      // Check if user role is refugee
      const isRefugeeUser = p.user && p.user.role === 'refugee';
      // Check if option is a valid refugee category
      const hasValidOption = validCategories.includes(p.option);
      // Check if profile is public (optional, but good for filtering)
      const isPublic = p.isPublic !== false; // Default to true if not specified
      
      return isRefugeeUser || hasValidOption;
    });
    
    console.log('ProviderDashboard - Filtered Refugee Profiles:', {
      filteredCount: filtered.length,
      profiles: filtered.map(p => ({
        id: p._id,
        email: p.email,
        fullName: p.fullName || `${p.firstName} ${p.lastName}`,
        option: p.option,
        userRole: p.user?.role
      }))
    });
    
    return filtered;
  }, [profiles]);

  const { notifications, refetch: refetchNotifications } = useNotifications();
  const { messages, loading: messagesLoading, error: messagesError, refetch: refetchMessages } = useMessages();
  const { applications, loading: applicationsLoading, error: applicationsError, refetch: refetchApplications, updateApplicationStatus } = useApplications();
  const [showMessageCenter, setShowMessageCenter] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);



  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);





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

  // Calculate unread messages count
  const unreadMessagesCount = useMemo(() => {
    if (!messages || !user) return 0;
    return messages.filter(message => {
      const recipientId = typeof message.recipient === 'object' ? message.recipient._id : message.recipient;
      const currentUserId = typeof user._id === 'object' ? user._id.toString() : user._id;
      return !message.isRead && recipientId === currentUserId;
    }).length;
  }, [messages, user]);

  // Calculate unread notifications count
  const unreadNotificationsCount = useMemo(() => {
    return notifications.filter(notification => !notification.isRead).length;
  }, [notifications]);

  // Debug log for user and data (commented out to reduce noise)
  // console.log('ProviderDashboard user:', user, 'loading:', loading);
  // console.log('ProviderDashboard profiles:', profiles.length, 'profiles');
  // console.log('ProviderDashboard activeItem:', activeItem);

  // Modal state
  const [selectedOpportunity, setSelectedOpportunity] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    location: '',
    type: '',
    company: '',
    contactEmail: '',
    salary: {
      min: '',
      max: '',
      currency: 'USD'
    },
    requirements: {
      skills: [],
      experience: '',
      education: '',
      languages: []
    },
    benefits: [],
    applicationDeadline: '',
    startDate: '',
    duration: '',
    isRemote: false,
    maxApplicants: '',
    tags: '',
    contactPhone: '',
    website: '',
    isActive: true,
    // Job-specific fields
    workArrangement: '',
    employmentType: '',
    // Internship-specific fields
    stipend: '',
    internshipDuration: '',
    learningObjectives: '',
    academicCredit: '',
    // Scholarship-specific fields
    scholarshipAmount: '',
    scholarshipCurrency: 'USD',
    scholarshipType: '',
    academicLevel: '',
    eligibilityCriteria: '',
    requiredDocuments: '',
    gpaRequirement: '',
    renewable: '',
    // Mentorship-specific fields
    mentorshipDuration: '',
    meetingFrequency: '',
    focusAreas: '',
    mentorBackground: '',
    communicationMethod: '',
    groupSize: '',
    // Funding-specific fields
    fundingAmount: '',
    fundingCurrency: 'USD',
    fundingType: '',
    fundingPurpose: '',
    projectDescription: '',
    eligibilityRequirements: '',
    repaymentRequired: '',
    applicationProcess: ''
  });
  const [formError, setFormError] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingOpportunity, setEditingOpportunity] = useState(null);
  const [formSuccess, setFormSuccess] = useState(null);

  // Profile view modal state
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactForm, setContactForm] = useState({
    subject: '',
    message: '',
    contactMethod: 'email' // email, phone, or video
  });

  const toggleSection = useCallback((section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  }, []);

  // Sidebar main categories only
  const navigationItems = useMemo(() => [
    { id: 'overview', label: 'Dashboard Overview', icon: Home },
    { id: 'available-talents', label: 'Available Talents', icon: Users },
    { id: 'opportunities', label: 'Create Opportunity', icon: FileText },
    { id: 'my-opportunities', label: 'My Opportunities', icon: Briefcase },
    { 
      id: 'applications', 
      label: 'Applications', 
      icon: FileText,
      badge: applications.filter(app => app.status === 'pending').length > 0 ? applications.filter(app => app.status === 'pending').length : null
    },
    { 
      id: 'messages', 
      label: 'Messages', 
      icon: MessageCircle,
      badge: unreadMessagesCount > 0 ? unreadMessagesCount : null
    },
    { 
      id: 'communications', 
      label: 'Communications', 
      icon: MessageCircle,
      badge: unreadNotificationsCount > 0 ? unreadNotificationsCount : null
    },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'interviews', label: 'Interview Manager', icon: Calendar },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'support', label: 'Help & Support', icon: HelpCircle }
  ], [applications, unreadMessagesCount, unreadNotificationsCount]);

  // Sidebar rendering
  const renderMenuItem = useCallback((item) => {
    const Icon = item.icon;
    const isActive = activeItem === item.id;
    return (
      <div key={item.id} className="mb-1">
        <button
          onClick={() => {
            if (item.id === 'opportunities') {
              setShowCreateModal(true);
            } else {
              setActiveItem(item.id);
            }
          }}
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
  }, [activeItem]);

  // Modal functions
  const openEditModal = (opportunity) => {
    setEditingOpportunity(opportunity);
    setFormData({
      title: opportunity.title || '',
      description: opportunity.description || '',
      category: opportunity.category || '',
      location: opportunity.location || '',
      type: opportunity.type || '',
      salary: opportunity.salary || { min: '', max: '', currency: 'USD' },
      requirements: opportunity.requirements || { skills: [], experience: '', education: '', languages: [] },
      benefits: opportunity.benefits || [],
      applicationDeadline: opportunity.applicationDeadline ? new Date(opportunity.applicationDeadline).toISOString().split('T')[0] : '',
      startDate: opportunity.startDate ? new Date(opportunity.startDate).toISOString().split('T')[0] : '',
      duration: opportunity.duration || '',
      isRemote: opportunity.isRemote || false,
      maxApplicants: opportunity.maxApplicants || '',
      tags: opportunity.tags ? opportunity.tags.join(', ') : '',
      contactEmail: opportunity.contactEmail || user?.email || '',
      contactPhone: opportunity.contactPhone || '',
      website: opportunity.website || '',
      isActive: opportunity.isActive !== false,
      // Job-specific fields
      workArrangement: opportunity.workArrangement || '',
      employmentType: opportunity.employmentType || '',
      // Internship-specific fields
      stipend: opportunity.stipend || '',
      internshipDuration: opportunity.internshipDuration || '',
      learningObjectives: opportunity.learningObjectives || '',
      academicCredit: opportunity.academicCredit || '',
      // Scholarship-specific fields
      scholarshipAmount: opportunity.scholarshipAmount || '',
      scholarshipCurrency: opportunity.scholarshipCurrency || 'USD',
      scholarshipType: opportunity.scholarshipType || '',
      academicLevel: opportunity.academicLevel || '',
      eligibilityCriteria: opportunity.eligibilityCriteria || '',
      requiredDocuments: opportunity.requiredDocuments || '',
      gpaRequirement: opportunity.gpaRequirement || '',
      renewable: opportunity.renewable || '',
      // Mentorship-specific fields
      mentorshipDuration: opportunity.mentorshipDuration || '',
      meetingFrequency: opportunity.meetingFrequency || '',
      focusAreas: opportunity.focusAreas || '',
      mentorBackground: opportunity.mentorBackground || '',
      communicationMethod: opportunity.communicationMethod || '',
      groupSize: opportunity.groupSize || '',
      // Funding-specific fields
      fundingAmount: opportunity.fundingAmount || '',
      fundingCurrency: opportunity.fundingCurrency || 'USD',
      fundingType: opportunity.fundingType || '',
      fundingPurpose: opportunity.fundingPurpose || '',
      projectDescription: opportunity.projectDescription || '',
      eligibilityRequirements: opportunity.eligibilityRequirements || '',
      repaymentRequired: opportunity.repaymentRequired || '',
      applicationProcess: opportunity.applicationProcess || ''
    });
    setShowEditModal(true);
  };

  const closeModal = () => {
    setSelectedOpportunity(null);
    setFormData({});
    setFormError(null);
    setShowCreateModal(false);
    setShowEditModal(false);
    setEditingOpportunity(null);
  };

  // Profile view functions
  const openProfileModal = async (applicant) => {
    try {
      setProfileLoading(true);
      setShowProfileModal(true);
      
      // Fetch profile data using the applicant's email
      if (applicant?.email) {
        const response = await fetch(`http://localhost:5001/api/profiles?email=${applicant.email}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.profiles && data.profiles.length > 0) {
            setSelectedProfile(data.profiles[0]);
          } else {
            // If no profile found, create a basic profile object from applicant data
            setSelectedProfile({
              fullName: `${applicant.firstName} ${applicant.lastName}`,
              email: applicant.email,
              option: 'Not specified',
              age: 'Not specified',
              gender: 'Not specified',
              currentLocation: 'Not specified',
              skills: [],
              language: [],
              isPublic: false
            });
          }
        } else {
          console.error('Failed to fetch profile data');
          // Create a basic profile object from applicant data
          setSelectedProfile({
            fullName: `${applicant.firstName} ${applicant.lastName}`,
            email: applicant.email,
            option: 'Not specified',
            age: 'Not specified',
            gender: 'Not specified',
            currentLocation: 'Not specified',
            skills: [],
            language: [],
            isPublic: false
          });
        }
      } else {
        console.error('No applicant email provided');
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      // Create a basic profile object from applicant data
      setSelectedProfile({
        fullName: `${applicant?.firstName || 'Unknown'} ${applicant?.lastName || 'User'}`,
        email: applicant?.email || 'No email',
        option: 'Not specified',
        age: 'Not specified',
        gender: 'Not specified',
        currentLocation: 'Not specified',
        skills: [],
        language: [],
        isPublic: false
      });
    } finally {
      setProfileLoading(false);
    }
  };

  const closeProfileModal = () => {
    setShowProfileModal(false);
    setSelectedProfile(null);
    setProfileLoading(false);
  };

  const openContactModal = () => {
    setShowContactModal(true);
    setContactForm({
      subject: `Opportunity for ${selectedProfile?.fullName}`,
      message: `Hi ${selectedProfile?.fullName},\n\nI hope this message finds you well. I came across your profile and would like to discuss potential opportunities that might be a great fit for your skills and experience.\n\nBest regards,\n${user?.name || user?.email}`,
      contactMethod: 'email'
    });
  };

  const closeContactModal = () => {
    setShowContactModal(false);
    setContactForm({
      subject: '',
      message: '',
      contactMethod: 'email'
    });
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    try {
      // Here you would implement the actual contact functionality
      // For now, we'll just show a success message
      // Contact message sent successfully
      closeContactModal();
    } catch (error) {
      console.error('Error sending contact message:', error);
    }
  };

  const handleContactFormChange = (e) => {
    const { name, value } = e.target;
    setContactForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    }
  };

    const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);
    setFormSuccess(null);

    try {
      // Map form data to match backend expectations
      const opportunityData = {
        title: formData.title,
        description: formData.description,
        company: formData.company || user?.company || 'Company Name', // Required by backend
        location: formData.location,
        jobType: (() => {
          const type = formData.type;
          if (!type) return 'full_time';
          if (type === 'job') return 'full_time';
          if (type === 'internship') return 'internship';
          if (type === 'scholarship') return 'volunteer';
          if (type === 'mentorship') return 'volunteer';
          if (type === 'funding') return 'volunteer';
          return 'full_time';
        })(), // Map 'type' to 'jobType' as required by backend
        category: formData.category,
        salary: {
          min: parseInt(formData.salary?.min) || 0,
          max: parseInt(formData.salary?.max) || 0,
          currency: formData.salary?.currency || 'USD'
        },
        experienceLevel: (() => {
          const exp = formData.requirements?.experience;
          if (!exp) return 'entry';
          if (exp.includes('Entry')) return 'entry';
          if (exp.includes('Mid')) return 'mid';
          if (exp.includes('Senior')) return 'senior';
          if (exp.includes('Executive')) return 'executive';
          return 'entry';
        })(), // Required by backend
        contactEmail: formData.contactEmail || user?.email, // Required by backend
        contactPhone: formData.contactPhone || '',
        isRemote: formData.isRemote || false,
        applicationDeadline: formData.applicationDeadline ? new Date(formData.applicationDeadline).toISOString() : null,
        startDate: formData.startDate ? new Date(formData.startDate).toISOString() : null,
        duration: formData.duration,
        maxApplicants: parseInt(formData.maxApplicants) || 0,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
        requirements: formData.requirements?.experience || '',
        skills: Array.isArray(formData.requirements?.skills) 
          ? formData.requirements.skills 
          : (formData.requirements?.skills ? formData.requirements.skills.split(',').map(skill => skill.trim()).filter(Boolean) : []),
        languages: Array.isArray(formData.requirements?.languages) 
          ? formData.requirements.languages.map(lang => ({ language: lang, proficiency: 'intermediate' }))
          : (formData.requirements?.languages ? formData.requirements.languages.split(',').map(lang => ({ language: lang.trim(), proficiency: 'intermediate' })).filter(lang => lang.language) : []),
        benefits: Array.isArray(formData.benefits) 
          ? formData.benefits 
          : (formData.benefits ? formData.benefits.split(',').map(benefit => benefit.trim()).filter(Boolean) : []),
        provider: user?._id,
        providerName: user?.fullName || user?.name || ''
      };

      console.log('Sending opportunity data:', opportunityData);

      if (showEditModal && editingOpportunity) {
        await updateOpportunity(editingOpportunity._id, opportunityData);
        setFormSuccess('Opportunity updated successfully!');
      } else {
        await createOpportunity(opportunityData);
        setFormSuccess('Opportunity created successfully!');
      }

      setTimeout(() => {
        closeModal();
        refetchOpportunities();
      }, 1500);
    } catch (error) {
      console.error('Opportunity creation error:', error.response?.data);
      if (error.response?.data?.errors) {
        // Show specific validation errors
        const errorMessages = error.response.data.errors.map(err => `${err.path}: ${err.msg}`).join(', ');
        setFormError(`Validation errors: ${errorMessages}`);
      } else {
        setFormError(error.response?.data?.message || 'An error occurred. Please try again.');
      }
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteOpportunity = async (opportunityId) => {
    if (window.confirm('Are you sure you want to delete this opportunity?')) {
      try {
        await deleteOpportunity(opportunityId);
        refetchOpportunities();
      } catch (error) {
        console.error('Error deleting opportunity:', error);
      }
    }
  };

  // Load opportunities when my-opportunities section is active
  useEffect(() => {
    if (activeItem === 'my-opportunities') {
      refetchOpportunities();
    }
  }, [activeItem]);

  // Calculate real statistics for overview
  const overviewStats = useMemo(() => {
    const activeOpportunities = (opportunities || []).filter(opp => opp.isActive).length;
    const totalApplications = (applications || []).length;
    const pendingInterviews = (interviews || []).filter(int => int.status === 'pending').length;
    const successfulPlacements = (interviews || []).filter(int => int.status === 'completed').length;
    
    return {
      activeOpportunities,
      totalApplications,
      pendingInterviews,
      successfulPlacements
    };
  }, [opportunities, applications, interviews]);

  // Memoize profile statistics to prevent recalculation
  const profileStats = useMemo(() => {
    return {
      students: (profiles || []).filter(p => p.option === 'student').length,
      jobSeekers: (profiles || []).filter(p => p.option === 'job seeker').length,
      undocumented: (profiles || []).filter(p => p.option === 'undocumented_talent').length,
      total: (profiles || []).length
    };
  }, [profiles]);

  // Filter opportunities to only those created by the current provider
  const myOpportunities = useMemo(() => {
    if (!user || !user._id) return [];
    return (opportunities || []).filter(opp => opp.provider === user._id || (opp.provider && opp.provider._id === user._id));
  }, [opportunities, user]);

  // Main content area
  const renderMainContent = () => {
    if (activeItem === 'overview') {
      const stats = overviewStats;

      return (
        <div className="space-y-6">
          {/* Error Display */}
          {(opportunitiesError || interviewsError || profilesError) && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                <p className="text-red-800 text-sm">
                  {opportunitiesError || interviewsError || profilesError}
                </p>
              </div>
            </div>
          )}

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-900">Active Opportunities</h3>
              <p className="text-2xl font-bold text-blue-600 mt-2">{stats.activeOpportunities}</p>
              <p className="text-sm text-blue-600 mt-1">Currently posted</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-medium text-green-900">Total Applications</h3>
              <p className="text-2xl font-bold text-green-600 mt-2">{stats.totalApplications}</p>
              <p className="text-sm text-green-600 mt-1">Across all opportunities</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-medium text-purple-900">Pending Interviews</h3>
              <p className="text-2xl font-bold text-purple-600 mt-2">{stats.pendingInterviews}</p>
              <p className="text-sm text-purple-600 mt-1">Requires scheduling</p>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <h3 className="font-medium text-orange-900">Successful Placements</h3>
              <p className="text-2xl font-bold text-orange-600 mt-2">{stats.successfulPlacements}</p>
              <p className="text-sm text-orange-600 mt-1">Completed interviews</p>
            </div>
          </div>

          {/* Recent Opportunities */}
          <div className="bg-white p-6 rounded-lg border">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium text-gray-900">Recent Opportunities</h3>
              <button
                onClick={() => setActiveItem('my-opportunities')}
                className="text-blue-600 hover:text-blue-700 text-sm"
              >
                View All
              </button>
            </div>
            <div className="space-y-3">
              {myOpportunities.slice(0, 3).map(opp => (
                <div key={opp._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{opp.title}</p>
                    <p className="text-xs text-gray-500">{getApplicationCount(opp._id)} applications</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    opp.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {opp.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              ))}
              {myOpportunities.length === 0 && (
                <p className="text-gray-500 text-sm text-center py-4">No opportunities created yet</p>
              )}
            </div>
          </div>
        </div>
      );
    }

    if (activeItem === 'available-talents') {
      // Use the memoized refugee profiles from the top level
      // Category labels
      const categoryLabels = {
        all: 'All',
        student: 'Students',
        'job seeker': 'Job Seekers',
        undocumented_talent: 'Undocumented Talents'
      };
      const filterCategories = ['all', ...validCategories];
      // Filter by selected category
      let displayProfiles = selectedCategory === 'all'
        ? allRefugeeProfiles
        : allRefugeeProfiles.filter(p => p.option === selectedCategory);
      // Sort students by score descending if 'Students' is selected
      if (selectedCategory === 'student') {
        displayProfiles = displayProfiles.slice().sort((a, b) => {
          // Get scores from different possible sources
          const scoreA = a.score || 
                         (a.academicRecords && a.academicRecords.length > 0 ? 
                          parseFloat(a.academicRecords[0].percentage) : 0);
          const scoreB = b.score || 
                         (b.academicRecords && b.academicRecords.length > 0 ? 
                          parseFloat(b.academicRecords[0].percentage) : 0);
          
          // Sort by score descending (highest first)
          return scoreB - scoreA;
        });
      }
      return (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Available Talents</h2>
              <p className="text-gray-600">Browse refugee talent profiles</p>
            </div>
          </div>
          {/* Category Filter Buttons */}
          <div className="flex flex-wrap gap-2 mb-4">
            {filterCategories.map(category => (
              <button
                key={category}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${selectedCategory === category ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-blue-50'}`}
                onClick={() => setSelectedCategory(category)}
              >
                {categoryLabels[category]}
              </button>
            ))}
          </div>
          
                    {/* Information for Students */}
          {selectedCategory === 'student' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg mr-3">
                  <Award className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-blue-900">Student Rankings</h4>
                  <p className="text-sm text-blue-700">
                    Ranked by academic performance
                  </p>
                </div>
              </div>
            </div>
          )}
          {/* Warning if error */}
          {profilesError && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-2">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-yellow-400 mr-2" />
                <p className="text-yellow-800 text-sm">
                  Could not refresh talents. Showing last available data. <button onClick={stableFetchProfiles} className="ml-2 underline text-blue-600">Retry</button>
                </p>
              </div>
            </div>
          )}
          {/* Table or Loader */}
          {profilesLoading && allRefugeeProfiles.length === 0 ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white p-6 rounded-lg border animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : allRefugeeProfiles.length > 0 ? (
            <div className="overflow-x-auto bg-white rounded-lg border">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {/* Add ranking column for students */}
                    {selectedCategory === 'student' && (
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                    )}
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Age</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gender</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Key Skills</th>
                    {/* Add Score column for students */}
                    {selectedCategory === 'student' && (
                                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Score/GPA
                    </th>
                    )}
                    <th className="px-4 py-2"></th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {displayProfiles.map((profile, index) => (
                    <tr key={profile._id} className="hover:bg-blue-50 transition-colors">
                      {/* Show ranking for students */}
                      {selectedCategory === 'student' && (
                        <td className="px-4 py-2">
                          {(() => {
                            const rank = index + 1;
                            if (rank === 1) {
                              return (
                                <div className="flex items-center">
                                  <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-2 py-1 rounded-full">🥇 1st</span>
                                </div>
                              );
                            } else if (rank === 2) {
                              return (
                                <div className="flex items-center">
                                  <span className="bg-gray-100 text-gray-800 text-xs font-bold px-2 py-1 rounded-full">🥈 2nd</span>
                                </div>
                              );
                            } else if (rank === 3) {
                              return (
                                <div className="flex items-center">
                                  <span className="bg-orange-100 text-orange-800 text-xs font-bold px-2 py-1 rounded-full">🥉 3rd</span>
                                </div>
                              );
                            } else {
                              return (
                                <span className="text-sm font-medium text-gray-600">#{rank}</span>
                              );
                            }
                          })()}
                        </td>
                      )}
                      <td className="px-4 py-2 font-semibold text-gray-900">{profile.fullName || profile.firstName + ' ' + profile.lastName}</td>
                      <td className="px-4 py-2">{profile.age || '-'}</td>
                      <td className="px-4 py-2">{profile.gender || '-'}</td>
                      <td className="px-4 py-2">{profile.currentLocation || '-'}</td>
                      <td className="px-4 py-2">
                        <div className="flex flex-wrap gap-1">
                          {profile.skills?.slice(0, 3).map((skill, i) => (
                            <span key={i} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              {skill}
                            </span>
                          ))}
                          {profile.skills?.length > 3 && (
                            <span className="text-xs text-gray-500">+{profile.skills.length - 3} more</span>
                          )}
                        </div>
                      </td>
                      {/* Show score for students */}
                      {selectedCategory === 'student' && (
                        <td className="px-4 py-2">
                          {(() => {
                            // Try to get score from different possible sources
                            const score = profile.score || 
                                         (profile.academicRecords && profile.academicRecords.length > 0 ? 
                                          profile.academicRecords[0].percentage : null);
                            
                            if (score) {
                              const numericScore = parseFloat(score);
                              return (
                                <div className="flex flex-col">
                                  <div className="flex items-center">
                                    <span className="font-bold text-blue-700">{score}%</span>
                                    {numericScore >= 90 && (
                                      <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Excellent</span>
                                    )}
                                    {numericScore >= 80 && numericScore < 90 && (
                                      <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">Good</span>
                                    )}
                                    {numericScore >= 70 && numericScore < 80 && (
                                      <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">Average</span>
                                    )}
                                    {numericScore < 70 && (
                                      <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">Needs Improvement</span>
                                    )}
                                  </div>
                                  {/* Show academic level if available */}
                                  {profile.academicRecords && profile.academicRecords.length > 0 && (
                                    <div className="text-xs text-gray-500 mt-1">
                                      {profile.academicRecords[0].level} • {profile.academicRecords[0].year}
                                    </div>
                                  )}
                                </div>
                              );
                            } else {
                              return <span className="text-gray-400">No score available</span>;
                            }
                          })()}
                        </td>
                      )}
                      <td className="px-4 py-2">
                        <button 
                          onClick={() => { setSelectedProfile(profile); setShowProfileModal(true); }}
                          className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-sm"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {/* Profile Modal */}
              {showProfileModal && selectedProfile && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
                  <div className="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto relative">
                    <button
                      onClick={() => setShowProfileModal(false)}
                      className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 p-2"
                    >
                      <X className="h-6 w-6" />
                    </button>
                    <ProfileView profile={selectedProfile} />
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="h-16 w-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {profilesLoading ? 'Loading talents...' : 'No refugee talents found'}
              </h3>
              <p className="text-gray-600 mb-4">
                {profilesLoading 
                  ? 'Please wait while we fetch available refugee profiles...'
                  : 'No refugee profiles have been created yet. Refugees need to create profiles to appear here.'
                }
              </p>
              {!profilesLoading && (
                <button 
                  onClick={stableFetchProfiles}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Refresh
                </button>
              )}
            </div>
          )}
        </div>
      );
    }

    if (activeItem === 'my-opportunities') {
      return (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">My Opportunities</h2>
              <p className="text-gray-600">Manage your posted opportunities</p>
            </div>
          </div>

          {/* Opportunities List */}
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white p-6 rounded-lg border animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : opportunitiesError ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                <p className="text-red-800">{opportunitiesError}</p>
              </div>
            </div>
          ) : myOpportunities.length > 0 ? (
            <div className="space-y-4">
              {myOpportunities.map(opportunity => (
                <div key={opportunity._id} className="bg-white p-6 rounded-lg border border-gray-200">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{opportunity.title}</h3>
                      <p className="text-gray-600 mb-3">{opportunity.description}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {opportunity.location}
                        </div>
                        <div className="flex items-center">
                          <Briefcase className="h-4 w-4 mr-1" />
                          {opportunity.type}
                        </div>
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          {getApplicationCount(opportunity._id)} applications
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        opportunity.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {opportunity.isActive ? 'Active' : 'Inactive'}
                      </span>
                      <button
                        onClick={() => openEditModal(opportunity)}
                        className="p-2 text-gray-400 hover:text-gray-600"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteOpportunity(opportunity._id)}
                        className="p-2 text-gray-400 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="border-t pt-4 flex justify-between items-center">
                    <button 
                      onClick={() => setActiveItem('applications')}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      View Applications ({getApplicationCount(opportunity._id)})
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Briefcase className="h-16 w-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No opportunities yet</h3>
              <p className="text-gray-600 mb-6">Create your first opportunity to start attracting talent</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
              >
                Create Opportunity
              </button>
            </div>
          )}
        </div>
      );
    }

    if (activeItem === 'opportunities') {
      // Redirect to create opportunity modal
      setShowCreateModal(true);
      return null;
    }

    if (activeItem === 'applications') {
      return (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Applications</h2>
              <p className="text-gray-600">Review applications for your opportunities</p>
            </div>
            {applications.length > 0 && (
              <div className="flex items-center space-x-2">
                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                  {applications.length} {applications.length === 1 ? 'application' : 'applications'}
                </span>
                {applications.filter(app => app.status === 'pending').length > 0 && (
                  <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-1 rounded-full">
                    {applications.filter(app => app.status === 'pending').length} pending
                  </span>
                )}
              </div>
            )}
          </div>

          {applicationsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white p-6 rounded-lg border animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : applicationsError ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                <p className="text-red-800">{applicationsError}</p>
              </div>
            </div>
          ) : applications.length > 0 ? (
            <div className="space-y-4">
              {applications.map(application => (
                <div key={application._id} className="bg-white p-6 rounded-lg border border-gray-200">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {application.opportunityId?.title || 'Opportunity'}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {application.opportunityId?.location || 'Location not specified'}
                        </div>
                        <div className="flex items-center">
                          <Briefcase className="h-4 w-4 mr-1" />
                          {application.opportunityId?.type || 'Type not specified'}
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          Applied {new Date(application.appliedAt).toLocaleDateString()}
                        </div>
                      </div>
                      
                      {/* Applicant Information */}
                      <div className="bg-gray-50 rounded-lg p-4 mb-3">
                        <h4 className="font-medium text-gray-900 mb-2">Applicant</h4>
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center">
                            <UserCheck className="h-4 w-4 mr-2 text-gray-500" />
                            <span className="text-sm">
                              {application.applicantId?.firstName} {application.applicantId?.lastName}
                            </span>
                    </div>
                          <div className="flex items-center">
                            <Mail className="h-4 w-4 mr-2 text-gray-500" />
                            <span className="text-sm">{application.applicantId?.email}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <span className={`text-xs px-3 py-1 rounded-full ${
                      application.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      application.status === 'accepted' ? 'bg-green-100 text-green-800' :
                      application.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      application.status === 'reviewed' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                    </span>
                  </div>
                  
                  <div className="border-t pt-4 flex justify-between items-center">
                    <button 
                      onClick={() => openProfileModal(application.applicantId)}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      View Profile
                    </button>
                    
                    <div className="flex space-x-2">
                      {application.status === 'pending' && (
                        <>
                          <button 
                            onClick={() => handleApplicationStatusUpdate(application._id, 'accepted')}
                            className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                          >
                            Accept
                          </button>
                          <button 
                            onClick={() => handleApplicationStatusUpdate(application._id, 'rejected')}
                            className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      <button 
                        onClick={() => {
                          // Create a recipient object with the applicant's email
                          const recipient = {
                            _id: application.applicantId?._id,
                            firstName: application.applicantId?.firstName,
                            lastName: application.applicantId?.lastName,
                            email: application.applicantId?.email
                          };
                          setSelectedProfile(recipient);
                          setShowMessageCenter(true);
                        }}
                        className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                      >
                        Message
                    </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No applications yet</h3>
              <p className="text-gray-600">Applications will appear here once refugees apply to your opportunities</p>
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
                    <p className="text-gray-600 mb-6">When refugees reach out to you, their messages will appear here</p>
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
    }

    if (activeItem === 'communications') {
      return (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Communications</h2>
              <p className="text-gray-600">Manage notifications</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
            {/* Notifications */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">
                  {notifications?.length || 0}
                </span>
              </div>
              <div className="space-y-3">
                {notifications && notifications.length > 0 ? (
                  notifications.slice(0, 10).map(notification => (
                    <div key={notification._id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-sm">{notification.title}</p>
                          <p className="text-xs text-gray-500">{notification.message}</p>
                        </div>
                        <span className="text-xs text-gray-400">
                          {new Date(notification.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm text-center py-4">No notifications yet</p>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }



    if (activeItem === 'analytics') {
      // --- Chart Data Preparation ---
      // Use applicationsByMonth and opportunityPerformance from top-level hooks
      return (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Analytics</h2>
              <p className="text-gray-600">Track your platform performance</p>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-900">Total Opportunities</h3>
              <p className="text-2xl font-bold text-blue-600 mt-2">{myOpportunities.length}</p>
              <p className="text-sm text-blue-600 mt-1">Created</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-medium text-green-900">Active Opportunities</h3>
              <p className="text-2xl font-bold text-green-600 mt-2">
                {myOpportunities.filter(opp => opp.isActive).length}
              </p>
              <p className="text-sm text-green-600 mt-1">Currently posted</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-medium text-purple-900">Total Applications</h3>
              <p className="text-2xl font-bold text-purple-600 mt-2">
                {myOpportunities.reduce((sum, opp) => sum + (opp.currentApplicants || 0), 0)}
              </p>
              <p className="text-sm text-purple-600 mt-1">Received</p>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <h3 className="font-medium text-orange-900">Interviews Scheduled</h3>
              <p className="text-2xl font-bold text-orange-600 mt-2">
                {interviews.filter(int => int.status === 'scheduled').length}
              </p>
              <p className="text-sm text-orange-600 mt-1">This month</p>
            </div>
          </div>

          {/* Charts Placeholder */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Applications Over Time</h3>
              <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                {applicationsByMonth.labels && applicationsByMonth.labels.length > 0 ? (
                  <Line
                    data={applicationsByMonth}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: { display: false },
                        title: { display: false },
                      },
                      scales: {
                        x: { title: { display: true, text: 'Month' } },
                        y: { title: { display: true, text: 'Applications' }, beginAtZero: true }
                      }
                    }}
                  />
                ) : (
                  <p className="text-gray-500">No application data yet</p>
                )}
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Opportunity Performance</h3>
              <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                {opportunityPerformance.labels && opportunityPerformance.labels.length > 0 ? (
                  <Bar
                    data={opportunityPerformance}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: { display: false },
                        title: { display: false },
                      },
                      scales: {
                        x: { title: { display: true, text: 'Opportunity' } },
                        y: { title: { display: true, text: 'Applications' }, beginAtZero: true }
                      }
                    }}
                  />
                ) : (
                  <p className="text-gray-500">No opportunity data yet</p>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (activeItem === 'interviews') {
      return (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Interview Manager</h2>
              <p className="text-gray-600">Schedule and manage interviews</p>
            </div>
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
              onClick={() => setShowCandidatePicker(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Schedule Interview
            </button>
          </div>

          {interviewsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white p-6 rounded-lg border animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : interviewsError ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                <p className="text-red-800">{interviewsError}</p>
              </div>
            </div>
          ) : interviews.length > 0 ? (
            <div className="space-y-4">
              {interviews.map(interview => (
                <div key={interview._id} className="bg-white p-6 rounded-lg border border-gray-200">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Interview with {interview.talentId ? `${interview.talentId.firstName} ${interview.talentId.lastName}` : 'Talent'}
                      </h3>
                      <p className="text-gray-600 mb-3">
                        For: {interview.title || 'Interview'}
                      </p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {interview.scheduledDate ? new Date(interview.scheduledDate).toLocaleDateString() : 'TBD'}
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {interview.scheduledDate ? new Date(interview.scheduledDate).toLocaleTimeString() : 'TBD'}
                        </div>
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {interview.format === 'video' ? 'Video Call' : interview.format === 'in-person' ? 'In-Person' : interview.format === 'phone' ? 'Phone Call' : interview.format || 'TBD'}
                        </div>
                      </div>
                      
                      {/* Show selected time slot if available */}
                      {interview.status === 'confirmed' && interview.talentResponse?.selectedSlot && (
                        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-center">
                            <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                            <span className="text-sm font-medium text-green-800">
                              Candidate selected: {new Date(interview.talentResponse.selectedSlot.date).toLocaleDateString()} at {interview.talentResponse.selectedSlot.startTime}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      interview.status === 'invited' ? 'bg-yellow-100 text-yellow-800' :
                      interview.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                      interview.status === 'scheduled' ? 'bg-green-100 text-green-800' :
                      interview.status === 'completed' ? 'bg-purple-100 text-purple-800' :
                      interview.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      interview.status === 'declined' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {interview.status === 'invited' ? 'Invitation Sent' :
                       interview.status === 'confirmed' ? 'Confirmed' :
                       interview.status === 'scheduled' ? 'Scheduled' :
                       interview.status === 'completed' ? 'Completed' :
                       interview.status === 'cancelled' ? 'Cancelled' :
                       interview.status === 'declined' ? 'Declined' :
                       interview.status}
                    </span>
                  </div>
                  
                  <div className="flex space-x-2 pt-4 border-t">
                    <button className="text-blue-600 hover:text-blue-700 text-sm font-medium" onClick={() => handleViewInterviewDetails(interview)}>
                      View Details
                    </button>
                    {interview.status === 'invited' && (
                      <button className="text-green-600 hover:text-green-700 text-sm font-medium" onClick={() => handleConfirmInterview(interview)}>
                        Confirm
                      </button>
                    )}
                    {interview.status === 'confirmed' && (
                      <button className="text-green-600 hover:text-green-700 text-sm font-medium" onClick={() => handleScheduleInterview(interview)}>
                        Schedule
                      </button>
                    )}
                    {interview.status === 'scheduled' && (
                      <>
                        <button className="text-purple-600 hover:text-purple-700 text-sm font-medium" onClick={() => handleCompleteInterview(interview._id)}>
                          Complete
                        </button>
                        <button className="text-blue-600 hover:text-blue-700 text-sm font-medium" onClick={() => handleSendReminder(interview._id)}>
                          Send Reminder
                        </button>
                      </>
                    )}
                    <button className="text-green-600 hover:text-green-700 text-sm font-medium" onClick={() => handleReschedule(interview)}>
                      Reschedule
                    </button>
                    <button className="text-red-600 hover:text-red-700 text-sm font-medium" onClick={() => handleCancelInterview(interview._id)}>
                      Cancel
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="h-16 w-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No interviews scheduled</h3>
              <p className="text-gray-600">Schedule interviews with candidates who have applied to your opportunities</p>
            </div>
          )}
        </div>
      );
    }

    if (activeItem === 'settings') {
      return (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
              <p className="text-gray-600">Manage your account and preferences</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Profile Settings */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Provider Name</label>
                  <input
                    type="text"
                    value={`${user?.firstName || ''} ${user?.lastName || ''}`}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Your name"
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="your@email.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    value=""
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="+1 (555) 123-4567"
                    disabled
                  />
                </div>
                <button 
                  onClick={() => {
                    setIsUpdatingProfile(true);
                    navigate('/create-profile');
                  }}
                  disabled={isUpdatingProfile}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isUpdatingProfile ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    'Update Profile'
                  )}
                </button>
              </div>
            </div>

            {/* Notification Settings */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Settings</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">New Applications</p>
                    <p className="text-xs text-gray-500">Get notified when someone applies</p>
                  </div>
                  <input
                    type="checkbox"
                    defaultChecked
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Interview Reminders</p>
                    <p className="text-xs text-gray-500">Remind me before interviews</p>
                  </div>
                  <input
                    type="checkbox"
                    defaultChecked
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Platform Updates</p>
                    <p className="text-xs text-gray-500">Receive platform news and updates</p>
                  </div>
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>
                <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                  Save Preferences
                </button>
              </div>
            </div>
          </div>

          {/* Account Actions */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Actions</h3>
            <div className="flex space-x-4">
              <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </button>
              <button className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700">
                Delete Account
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (activeItem === 'support') {
      return (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Help & Support</h2>
              <p className="text-gray-600">Get help and contact support</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* FAQ */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Frequently Asked Questions</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-sm text-gray-900 mb-2">How do I create an opportunity?</h4>
                  <p className="text-xs text-gray-600">Go to "Create Opportunity" in the sidebar and fill out the form with your job details.</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-gray-900 mb-2">How do I contact a refugee talent?</h4>
                  <p className="text-xs text-gray-600">Click "View Profile" to see complete profile details, or "Contact" to send a message directly.</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-gray-900 mb-2">How do I schedule an interview?</h4>
                  <p className="text-xs text-gray-600">Go to "Interview Manager" and click "Schedule Interview" to set up a meeting with candidates.</p>
                </div>
              </div>
            </div>

            {/* Contact Support */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Support</h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <Mail className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="font-medium text-sm">Email Support</p>
                    <p className="text-xs text-gray-500">support@refuture.com</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Phone className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="font-medium text-sm">Phone Support</p>
                    <p className="text-xs text-gray-500">+1 (555) 123-4567</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="font-medium text-sm">Support Hours</p>
                    <p className="text-xs text-gray-500">Monday - Friday, 9 AM - 6 PM EST</p>
                  </div>
                </div>
                <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                  Send Support Request
                </button>
              </div>
            </div>
          </div>

          {/* Resources */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Helpful Resources</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <a href="#" className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                <FileText className="h-8 w-8 text-blue-600 mb-2" />
                <h4 className="font-medium text-sm">User Guide</h4>
                <p className="text-xs text-gray-500">Complete platform guide</p>
              </a>
              <a href="#" className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                <Video className="h-8 w-8 text-green-600 mb-2" />
                <h4 className="font-medium text-sm">Video Tutorials</h4>
                <p className="text-xs text-gray-500">Step-by-step videos</p>
              </a>
              <a href="#" className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                <MessageCircle className="h-8 w-8 text-purple-600 mb-2" />
                <h4 className="font-medium text-sm">Community Forum</h4>
                <p className="text-xs text-gray-500">Connect with other providers</p>
              </a>
            </div>
          </div>
        </div>
      );
    }



    // Default fallback
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Provider Dashboard</h2>
        <p className="text-gray-600">Select an option from the sidebar to get started</p>
      </div>
    );
  };

  // Helper function to render form fields based on opportunity type
  const renderTypeSpecificFields = () => {
    const { type } = formData;
    
    switch (type) {
      case 'job':
        return (
          <>
            {/* Salary Information - Only for Jobs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Min Salary *</label>
                <input
                  type="number"
                  name="salary.min"
                  value={formData.salary.min}
                  onChange={handleFormChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Max Salary *</label>
                <input
                  type="number"
                  name="salary.max"
                  value={formData.salary.max}
                  onChange={handleFormChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                <select
                  name="salary.currency"
                  value={formData.salary.currency}
                  onChange={handleFormChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                </select>
              </div>
            </div>

            {/* Job-specific Requirements */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Required Skills (comma-separated) *</label>
              <input
                type="text"
                name="requirements.skills"
                value={Array.isArray(formData.requirements.skills) ? formData.requirements.skills.join(', ') : formData.requirements.skills}
                onChange={handleFormChange}
                placeholder="JavaScript, React, Node.js"
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Experience Level *</label>
                <select
                  name="requirements.experience"
                  value={formData.requirements.experience}
                  onChange={handleFormChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Experience Level</option>
                  <option value="Entry Level">Entry Level (0-2 years)</option>
                  <option value="Mid Level">Mid Level (3-5 years)</option>
                  <option value="Senior Level">Senior Level (5+ years)</option>
                  <option value="Executive">Executive Level</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Education Requirement</label>
                <select
                  name="requirements.education"
                  value={formData.requirements.education}
                  onChange={handleFormChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Education Level</option>
                  <option value="High School">High School</option>
                  <option value="Associate's Degree">Associate's Degree</option>
                  <option value="Bachelor's Degree">Bachelor's Degree</option>
                  <option value="Master's Degree">Master's Degree</option>
                  <option value="PhD">PhD</option>
                  <option value="No Degree Required">No Degree Required</option>
                </select>
              </div>
            </div>

            {/* Job Benefits */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Benefits (comma-separated)</label>
              <input
                type="text"
                name="benefits"
                value={Array.isArray(formData.benefits) ? formData.benefits.join(', ') : formData.benefits}
                onChange={handleFormChange}
                placeholder="Health insurance, Remote work, Flexible hours, 401k"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Work Arrangement */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Work Arrangement</label>
                <select
                  name="workArrangement"
                  value={formData.workArrangement || ''}
                  onChange={handleFormChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Work Arrangement</option>
                  <option value="On-site">On-site</option>
                  <option value="Remote">Remote</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Employment Type</label>
                <select
                  name="employmentType"
                  value={formData.employmentType || ''}
                  onChange={handleFormChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Employment Type</option>
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Temporary">Temporary</option>
                </select>
              </div>
            </div>
          </>
        );

      case 'internship':
        return (
          <>
            {/* Internship-specific fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Stipend (per month)</label>
                <input
                  type="number"
                  name="stipend"
                  value={formData.stipend || ''}
                  onChange={handleFormChange}
                  placeholder="e.g., 2000"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Internship Duration *</label>
                <select
                  name="internshipDuration"
                  value={formData.internshipDuration || ''}
                  onChange={handleFormChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Duration</option>
                  <option value="3 months">3 months</option>
                  <option value="6 months">6 months</option>
                  <option value="12 months">12 months</option>
                  <option value="Flexible">Flexible</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Learning Objectives</label>
              <textarea
                name="learningObjectives"
                value={formData.learningObjectives || ''}
                onChange={handleFormChange}
                rows={3}
                placeholder="What will the intern learn during this internship?"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Required Skills (comma-separated)</label>
              <input
                type="text"
                name="requirements.skills"
                value={Array.isArray(formData.requirements.skills) ? formData.requirements.skills.join(', ') : formData.requirements.skills}
                onChange={handleFormChange}
                placeholder="Basic programming, Communication skills"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Academic Credit</label>
                <select
                  name="academicCredit"
                  value={formData.academicCredit || ''}
                  onChange={handleFormChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Option</option>
                  <option value="Available">Academic Credit Available</option>
                  <option value="Not Available">Academic Credit Not Available</option>
                  <option value="Optional">Academic Credit Optional</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Work Arrangement</label>
                <select
                  name="workArrangement"
                  value={formData.workArrangement || ''}
                  onChange={handleFormChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Work Arrangement</option>
                  <option value="On-site">On-site</option>
                  <option value="Remote">Remote</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
              </div>
            </div>
          </>
        );

      case 'scholarship':
        return (
          <>
            {/* Scholarship-specific fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Scholarship Amount *</label>
                <input
                  type="number"
                  name="scholarshipAmount"
                  value={formData.scholarshipAmount || ''}
                  onChange={handleFormChange}
                  required
                  placeholder="e.g., 5000"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                <select
                  name="scholarshipCurrency"
                  value={formData.scholarshipCurrency || 'USD'}
                  onChange={handleFormChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Scholarship Type</label>
                <select
                  name="scholarshipType"
                  value={formData.scholarshipType || ''}
                  onChange={handleFormChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Scholarship Type</option>
                  <option value="Merit-based">Merit-based</option>
                  <option value="Need-based">Need-based</option>
                  <option value="Academic">Academic</option>
                  <option value="Athletic">Athletic</option>
                  <option value="Creative">Creative</option>
                  <option value="Community Service">Community Service</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Academic Level</label>
                <select
                  name="academicLevel"
                  value={formData.academicLevel || ''}
                  onChange={handleFormChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Academic Level</option>
                  <option value="Undergraduate">Undergraduate</option>
                  <option value="Graduate">Graduate</option>
                  <option value="PhD">PhD</option>
                  <option value="Vocational">Vocational</option>
                  <option value="Certificate">Certificate Program</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Eligibility Criteria</label>
              <textarea
                name="eligibilityCriteria"
                value={formData.eligibilityCriteria || ''}
                onChange={handleFormChange}
                rows={3}
                placeholder="Describe the eligibility requirements for this scholarship"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Required Documents</label>
              <input
                type="text"
                name="requiredDocuments"
                value={formData.requiredDocuments || ''}
                onChange={handleFormChange}
                placeholder="Transcript, Essay, Letters of recommendation, etc."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">GPA Requirement</label>
                <input
                  type="number"
                  name="gpaRequirement"
                  value={formData.gpaRequirement || ''}
                  onChange={handleFormChange}
                  step="0.1"
                  min="0"
                  max="4"
                  placeholder="e.g., 3.0"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Renewable</label>
                <select
                  name="renewable"
                  value={formData.renewable || ''}
                  onChange={handleFormChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Option</option>
                  <option value="Yes">Yes, Renewable</option>
                  <option value="No">No, One-time</option>
                  <option value="Conditional">Conditional Renewal</option>
                </select>
              </div>
            </div>
          </>
        );

      case 'mentorship':
        return (
          <>
            {/* Mentorship-specific fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mentorship Duration *</label>
                <select
                  name="mentorshipDuration"
                  value={formData.mentorshipDuration || ''}
                  onChange={handleFormChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Duration</option>
                  <option value="3 months">3 months</option>
                  <option value="6 months">6 months</option>
                  <option value="12 months">12 months</option>
                  <option value="Ongoing">Ongoing</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Meeting Frequency</label>
                <select
                  name="meetingFrequency"
                  value={formData.meetingFrequency || ''}
                  onChange={handleFormChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Frequency</option>
                  <option value="Weekly">Weekly</option>
                  <option value="Bi-weekly">Bi-weekly</option>
                  <option value="Monthly">Monthly</option>
                  <option value="As needed">As needed</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mentorship Focus Areas</label>
              <input
                type="text"
                name="focusAreas"
                value={formData.focusAreas || ''}
                onChange={handleFormChange}
                placeholder="Career guidance, Skill development, Networking, Leadership"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mentor Background</label>
              <textarea
                name="mentorBackground"
                value={formData.mentorBackground || ''}
                onChange={handleFormChange}
                rows={3}
                placeholder="Describe the mentor's background, experience, and expertise"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Communication Method</label>
                <select
                  name="communicationMethod"
                  value={formData.communicationMethod || ''}
                  onChange={handleFormChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Method</option>
                  <option value="Video calls">Video calls</option>
                  <option value="Phone calls">Phone calls</option>
                  <option value="Email">Email</option>
                  <option value="In-person">In-person</option>
                  <option value="Mixed">Mixed methods</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Group Size</label>
                <select
                  name="groupSize"
                  value={formData.groupSize || ''}
                  onChange={handleFormChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Group Size</option>
                  <option value="1-on-1">1-on-1</option>
                  <option value="Small group (2-5)">Small group (2-5)</option>
                  <option value="Large group (6-10)">Large group (6-10)</option>
                </select>
              </div>
            </div>
          </>
        );

      case 'funding':
        return (
          <>
            {/* Funding-specific fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Funding Amount *</label>
                <input
                  type="number"
                  name="fundingAmount"
                  value={formData.fundingAmount || ''}
                  onChange={handleFormChange}
                  required
                  placeholder="e.g., 10000"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                <select
                  name="fundingCurrency"
                  value={formData.fundingCurrency || 'USD'}
                  onChange={handleFormChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Funding Type</label>
                <select
                  name="fundingType"
                  value={formData.fundingType || ''}
                  onChange={handleFormChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Funding Type</option>
                  <option value="Grant">Grant</option>
                  <option value="Loan">Loan</option>
                  <option value="Investment">Investment</option>
                  <option value="Crowdfunding">Crowdfunding</option>
                  <option value="Scholarship">Scholarship</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Funding Purpose</label>
                <select
                  name="fundingPurpose"
                  value={formData.fundingPurpose || ''}
                  onChange={handleFormChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Purpose</option>
                  <option value="Education">Education</option>
                  <option value="Business Startup">Business Startup</option>
                  <option value="Skill Development">Skill Development</option>
                  <option value="Research">Research</option>
                  <option value="Community Project">Community Project</option>
                  <option value="Emergency Support">Emergency Support</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Project Description</label>
              <textarea
                name="projectDescription"
                value={formData.projectDescription || ''}
                onChange={handleFormChange}
                rows={3}
                placeholder="Describe the project or initiative that needs funding"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Eligibility Requirements</label>
              <textarea
                name="eligibilityRequirements"
                value={formData.eligibilityRequirements || ''}
                onChange={handleFormChange}
                rows={3}
                placeholder="Describe who is eligible for this funding"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Repayment Required</label>
                <select
                  name="repaymentRequired"
                  value={formData.repaymentRequired || ''}
                  onChange={handleFormChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Option</option>
                  <option value="No">No repayment required</option>
                  <option value="Yes">Repayment required</option>
                  <option value="Conditional">Conditional repayment</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Application Process</label>
                <select
                  name="applicationProcess"
                  value={formData.applicationProcess || ''}
                  onChange={handleFormChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Process</option>
                  <option value="Simple">Simple application</option>
                  <option value="Standard">Standard application</option>
                  <option value="Complex">Complex application</option>
                  <option value="Interview Required">Interview required</option>
                </select>
              </div>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  // Interview booking modal state
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [interviewProfile, setInterviewProfile] = useState(null);
  const [interviewDate, setInterviewDate] = useState('');
  const [interviewTime, setInterviewTime] = useState('');
  const [interviewMessage, setInterviewMessage] = useState('');
  const [interviewFormat, setInterviewFormat] = useState('video');
  const [meetingPlatform, setMeetingPlatform] = useState('zoom');
  const [interviewMaterials, setInterviewMaterials] = useState('');
  const [interviewInstructions, setInterviewInstructions] = useState('');
  const [interviewLoading, setInterviewLoading] = useState(false);
  const [interviewError, setInterviewError] = useState(null);
  
  // Enhanced interview form state
  const [interviewType, setInterviewType] = useState('job');
  const [interviewTitle, setInterviewTitle] = useState('');
  const [interviewDuration, setInterviewDuration] = useState('60');
  const [interviewLocation, setInterviewLocation] = useState('');
  const [sendReminder24h, setSendReminder24h] = useState(false);
  const [sendReminder1h, setSendReminder1h] = useState(false);
  const [sendReminder15min, setSendReminder15min] = useState(false);
  
  // Availability slots state
  const [availabilitySlots, setAvailabilitySlots] = useState([]);
  const [newSlotDate, setNewSlotDate] = useState('');
  const [newSlotTime, setNewSlotTime] = useState('');
  const [newSlotDuration, setNewSlotDuration] = useState('60');
  
  // Custom Google Meet link
  const [customGoogleMeetLink, setCustomGoogleMeetLink] = useState('');

  // Add a handler to open the interview modal
  const openInterviewModal = (profile) => {
    setInterviewProfile(profile);
    setInterviewDate('');
    setInterviewTime('');
    setInterviewMessage('');
    setInterviewError(null);
    setInterviewType('job');
    setInterviewTitle('');
    setInterviewDuration('60');
    setInterviewLocation('');
    setInterviewFormat('video');
    setMeetingPlatform('zoom');
    setInterviewMaterials('');
    setInterviewInstructions('');
    setSendReminder24h(false);
    setSendReminder1h(false);
    setSendReminder15min(false);
    setAvailabilitySlots([]);
    setNewSlotDate('');
    setNewSlotTime('');
    setNewSlotDuration('60');
    setCustomGoogleMeetLink('');
    setShowInterviewModal(true);
  };

  const closeInterviewModal = () => {
    setShowInterviewModal(false);
    setInterviewProfile(null);
    setInterviewDate('');
    setInterviewTime('');
    setInterviewMessage('');
    setInterviewError(null);
    setInterviewType('job');
    setInterviewTitle('');
    setInterviewDuration('60');
    setInterviewLocation('');
    setInterviewFormat('video');
    setMeetingPlatform('zoom');
    setInterviewMaterials('');
    setInterviewInstructions('');
    setSendReminder24h(false);
    setSendReminder1h(false);
    setSendReminder15min(false);
    setAvailabilitySlots([]);
    setNewSlotDate('');
    setNewSlotTime('');
    setNewSlotDuration('60');
    setCustomGoogleMeetLink('');
  };

  // Availability slot functions
  const addAvailabilitySlot = () => {
    if (!newSlotDate || !newSlotTime) {
      setInterviewError('Please select both date and time for the slot.');
      return;
    }
    
    const newSlot = {
      date: newSlotDate,
      time: newSlotTime,
      duration: newSlotDuration
    };
    
    // Check if slot already exists
    const slotExists = availabilitySlots.some(slot => 
      slot.date === newSlotDate && slot.time === newSlotTime
    );
    
    if (slotExists) {
      setInterviewError('This time slot already exists.');
      return;
    }
    
    setAvailabilitySlots([...availabilitySlots, newSlot]);
    setNewSlotDate('');
    setNewSlotTime('');
    setNewSlotDuration('60');
    setInterviewError(null);
  };

  const removeAvailabilitySlot = (index) => {
    const updatedSlots = availabilitySlots.filter((_, i) => i !== index);
    setAvailabilitySlots(updatedSlots);
  };

  const handleBookInterview = async (e) => {
    e.preventDefault();
    
    // Enhanced validation
    if (!interviewTitle.trim()) {
      setInterviewError('Please enter an interview title.');
      return;
    }
    
    if (availabilitySlots.length === 0) {
      setInterviewError('Please add at least one availability slot.');
      return;
    }
    
    if (interviewFormat === 'in-person' && !interviewLocation.trim()) {
      setInterviewError('Please enter a location for in-person interviews.');
      return;
    }
    
    if (interviewFormat === 'video' && !meetingPlatform) {
      setInterviewError('Please select a meeting platform for video interviews.');
      return;
    }
    
    setInterviewLoading(true);
    setInterviewError(null);
    
    try {
      // Find the user ID by email since profiles don't have userId field
      const userResponse = await fetch(`http://localhost:5001/api/users/by-email/${encodeURIComponent(interviewProfile.email)}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!userResponse.ok) {
        throw new Error('Could not find user for this profile');
      }
      
      const userData = await userResponse.json();
      const talentId = userData.user._id;
      
      // Create interview invitation with availability slots
      const inviteData = {
        talentId: talentId,
        type: interviewType,
        title: interviewTitle.trim(),
        description: interviewMessage || `${interviewType.charAt(0).toUpperCase() + interviewType.slice(1)} interview invitation`,
        organization: `${user.firstName} ${user.lastName}`,
        position: '',
        location: interviewFormat === 'in-person' ? 'onsite' : 'remote',
        address: interviewFormat === 'in-person' ? interviewLocation : '',
        availabilitySlots: availabilitySlots,
        providerNotes: interviewMessage || '',
        format: interviewFormat,
        meetingPlatform: interviewFormat === 'video' ? meetingPlatform : undefined,
        customGoogleMeetLink: interviewFormat === 'video' && meetingPlatform === 'google-meet' ? customGoogleMeetLink : undefined,
        materials: interviewMaterials || '',
        instructions: interviewInstructions || '',
        reminderSettings: {
          sendReminder24h,
          sendReminder1h,
          sendReminder15min
        }
      };
      
      console.log('Sending interview invite with data:', inviteData);
      console.log('Interview profile:', interviewProfile);
      console.log('User:', user);
      
      if (rescheduleMode && rescheduleInterviewId) {
        console.log('Rescheduling interview:', rescheduleInterviewId);
        await updateInterview(rescheduleInterviewId, inviteData);
        // Interview rescheduled successfully
      } else {
        console.log('Creating new interview invite');
        await sendInterviewInvite(inviteData);
        // Interview booked successfully
      }
      
      // Reset form
      setShowInterviewModal(false);
      setInterviewProfile(null);
      setInterviewDate('');
      setInterviewTime('');
      setInterviewMessage('');
      setInterviewError(null);
      setInterviewType('job');
      setInterviewTitle('');
      setInterviewDuration('60');
      setInterviewLocation('');
      setInterviewFormat('video');
      setMeetingPlatform('zoom');
      setInterviewMaterials('');
      setInterviewInstructions('');
      setSendReminder24h(false);
      setSendReminder1h(false);
      setSendReminder15min(false);
      setAvailabilitySlots([]);
      setNewSlotDate('');
      setNewSlotTime('');
      setNewSlotDuration('60');
      setCustomGoogleMeetLink('');
      setRescheduleMode(false);
      setRescheduleInterviewId(null);
      
      if (typeof refetchInterviews === 'function') refetchInterviews();
      
      // Show success message
      alert(rescheduleMode ? 'Interview rescheduled successfully!' : 'Interview scheduled successfully! The candidate will be notified to choose their preferred time.');
      
    } catch (err) {
      setInterviewError(err.response?.data?.message || 'Failed to schedule interview');
    } finally {
      setInterviewLoading(false);
    }
  };

  const [preselecting, setPreselecting] = useState(false);
  const [preselectSuccess, setPreselectSuccess] = useState('');
  const [preselectError, setPreselectError] = useState('');

  const handleSendPreselection = async (profile) => {
    try {
      const response = await messagesAPI.send({
        recipientId: profile.userId,
        content: `You have been preselected for an opportunity! Please check your dashboard for more details.`
      });
      
      if (response.data.success) {
        // Preselection message sent successfully
        refetchMessages();
      }
    } catch (error) {
      console.error('Error sending preselection:', error);
      console.error('Failed to send preselection message');
    }
  };

  const handleApplicationStatusUpdate = async (applicationId, status) => {
    try {
      const result = await updateApplicationStatus(applicationId, status);
      
      if (result.success) {
        // Application status updated successfully
      } else {
        console.error(`Failed to ${status} application: ${result.error}`);
      }
    } catch (error) {
      console.error('Error updating application status:', error);
      console.error('Failed to update application status');
    }
  };

  // Calculate application count for an opportunity
  const getApplicationCount = (opportunityId) => {
    return applications.filter(app => app.opportunityId?._id === opportunityId).length;
  };

  // Place these at the top level, after all other hooks in ProviderDashboard
  const applicationsByMonth = useMemo(() => {
    if (!applications) return {};
    const counts = {};
    applications.forEach(app => {
      const date = new Date(app.appliedAt);
      const label = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      counts[label] = (counts[label] || 0) + 1;
    });
    const labels = Object.keys(counts).sort();
    return {
      labels,
      datasets: [
        {
          label: 'Applications',
          data: labels.map(l => counts[l]),
          borderColor: '#2563eb',
          backgroundColor: 'rgba(37,99,235,0.2)',
          fill: true,
          tension: 0.3,
        }
      ]
    };
  }, [applications]);

  const opportunityPerformance = useMemo(() => {
    if (!opportunities || !applications) return {};
    const counts = {};
    opportunities.forEach(opp => {
      counts[opp.title] = 0;
    });
    applications.forEach(app => {
      const opp = app.opportunityId?.title || app.opportunityId;
      if (counts[opp] !== undefined) counts[opp]++;
    });
    const labels = Object.keys(counts);
    return {
      labels,
      datasets: [
        {
          label: 'Applications',
          data: labels.map(l => counts[l]),
          backgroundColor: '#2563eb',
        }
      ]
    };
  }, [opportunities, applications]);

  // Add at the top level of ProviderDashboard, after other useState hooks
  const [showCandidatePicker, setShowCandidatePicker] = useState(false);
  const [candidateSearch, setCandidateSearch] = useState('');

  // Add at the top level of ProviderDashboard, after other useState hooks
  const [rescheduleMode, setRescheduleMode] = useState(false);
  const [rescheduleInterviewId, setRescheduleInterviewId] = useState(null);

  // Interview details modal state
  const [showInterviewDetailsModal, setShowInterviewDetailsModal] = useState(false);
  const [selectedInterviewDetails, setSelectedInterviewDetails] = useState(null);

  // Add a function to handle viewing interview details
  const handleViewInterviewDetails = (interview) => {
    setSelectedInterviewDetails(interview);
    setShowInterviewDetailsModal(true);
  };

  // Add a function to handle rescheduling
  const handleReschedule = (interview) => {
    console.log('Rescheduling interview:', interview);
    
    // Set the talent profile for the interview modal
    setInterviewProfile(interview.talentId);
    
    // Set the date and time from the scheduled date
    if (interview.scheduledDate) {
      const date = new Date(interview.scheduledDate);
      setInterviewDate(date.toISOString().slice(0, 10));
      setInterviewTime(date.toISOString().slice(11, 16));
    } else {
      setInterviewDate('');
      setInterviewTime('');
    }
    
    // Set the message from provider notes
    setInterviewMessage(interview.providerNotes || '');
    setInterviewError(null);
    setRescheduleMode(true);
    setRescheduleInterviewId(interview._id);
    setShowInterviewModal(true);
  };

  // Add a function to handle canceling an interview
  const handleCancelInterview = async (interviewId) => {
    if (!window.confirm('Are you sure you want to cancel this interview?')) return;
    try {
      await deleteInterview(interviewId);
      // Interview canceled successfully
      if (typeof refetchInterviews === 'function') refetchInterviews();
    } catch (err) {
      console.error('Failed to cancel interview.');
    }
  };

  // Handle confirming an interview (talent response)
  const handleConfirmInterview = async (interview) => {
    try {
      await interviewsAPI.respondToInterview(interview._id, {
        status: 'confirmed',
        message: 'Interview confirmed by provider'
      });
      // Interview confirmed successfully
      if (typeof refetchInterviews === 'function') refetchInterviews();
    } catch (err) {
      console.error('Failed to confirm interview.');
    }
  };

  // Handle scheduling a confirmed interview
  const handleScheduleInterview = async (interview) => {
    // This would typically open a scheduling modal
    // For now, we'll use the current date/time
    try {
      const confirmedDate = interview.scheduledDate ? new Date(interview.scheduledDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
      const confirmedTime = interview.scheduledDate ? new Date(interview.scheduledDate).toTimeString().slice(0, 5) : '10:00';
      
      await interviewsAPI.confirmInterview(interview._id, {
        confirmedDate,
        confirmedTime,
        meetingDetails: interview.meetingLink || '',
        finalInstructions: interview.instructions || ''
      });
      // Interview scheduled successfully
      if (typeof refetchInterviews === 'function') refetchInterviews();
    } catch (err) {
      console.error('Failed to schedule interview.');
    }
  };

  // Handle completing an interview
  const handleCompleteInterview = async (interviewId) => {
    if (!window.confirm('Mark this interview as completed?')) return;
    try {
      await interviewsAPI.completeInterview(interviewId);
      // Interview marked as completed
      if (typeof refetchInterviews === 'function') refetchInterviews();
    } catch (err) {
      console.error('Failed to complete interview.');
    }
  };

  // Handle sending a reminder
  const handleSendReminder = async (interviewId) => {
    try {
      await interviewsAPI.sendReminder(interviewId, {
        reminderType: '24h'
      });
      // Reminder sent successfully
    } catch (err) {
      console.error('Failed to send reminder.');
    }
  };

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
    console.log('Provider Dashboard - Messages:', messages);
    console.log('Provider Dashboard - Messages Loading:', messagesLoading);
    console.log('Provider Dashboard - Messages Error:', messagesError);
    console.log('Provider Dashboard - Conversations:', conversations);
  }, [messages, messagesLoading, messagesError, conversations]);

  const [selectedCategory, setSelectedCategory] = useState('all');

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Provider Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
            </div>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Fixed Sidebar */}
        <div className="w-64 bg-white shadow-sm flex-shrink-0">
          <div className="p-4">
            <nav className="space-y-1">
              {navigationItems.map(renderMenuItem)}
              <button
                onClick={logout}
                className="w-full flex items-center justify-between px-3 py-2 text-left text-sm rounded-lg transition-colors text-gray-700 hover:bg-gray-100 mt-4 border-t border-gray-200"
              >
                <span className="flex items-center">
                  <LogOut className="h-5 w-5 mr-3 text-gray-500" />
                  Logout
                </span>
              </button>
            </nav>
          </div>
        </div>

        {/* Scrollable Main Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-8">
            {renderMainContent()}
          </div>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {(showCreateModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg border border-gray-200 p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                {showEditModal ? 'Edit Opportunity' : 'Create New Opportunity'}
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <X className="h-6 w-6" />
              </button>
            </div>
            
            {formError && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                  <p className="text-red-800">{formError}</p>
                </div>
              </div>
            )}

            {formSuccess && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
                  <p className="text-green-800">{formSuccess}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-6">
              {/* Basic Information */}
              {/* Opportunity Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Opportunity Type *</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleFormChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Opportunity Type</option>
                  <option value="job">💼 Full-time Job</option>
                  <option value="internship">🎓 Internship</option>
                  <option value="scholarship">🏆 Scholarship</option>
                  <option value="mentorship">🤝 Mentorship</option>
                  <option value="funding">💰 Funding/Grant</option>
                </select>
              </div>

              {/* Type Indicator */}
              {formData.type && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="text-blue-600 font-medium">
                      {formData.type === 'job' && '💼 Job Opportunity'}
                      {formData.type === 'internship' && '🎓 Internship Program'}
                      {formData.type === 'scholarship' && '🏆 Scholarship Program'}
                      {formData.type === 'mentorship' && '🤝 Mentorship Program'}
                      {formData.type === 'funding' && '💰 Funding Opportunity'}
                    </div>
                  </div>
                  <p className="text-blue-700 text-sm mt-1">
                    {formData.type === 'job' && 'Create a full-time employment opportunity with salary and benefits'}
                    {formData.type === 'internship' && 'Offer hands-on learning experience with potential stipend'}
                    {formData.type === 'scholarship' && 'Provide financial support for education and academic pursuits'}
                    {formData.type === 'mentorship' && 'Connect refugees with experienced professionals for guidance'}
                    {formData.type === 'funding' && 'Support projects and initiatives with financial resources'}
                  </p>
                </div>
              )}

              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleFormChange}
                    required
                    placeholder={formData.type === 'job' ? 'e.g., Senior Software Engineer' : 
                               formData.type === 'internship' ? 'e.g., Marketing Internship' :
                               formData.type === 'scholarship' ? 'e.g., STEM Scholarship Program' :
                               formData.type === 'mentorship' ? 'e.g., Career Development Mentorship' :
                               formData.type === 'funding' ? 'e.g., Refugee Business Startup Grant' : 'Enter opportunity title'}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleFormChange}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Category</option>
                    <option value="technology">Technology</option>
                    <option value="healthcare">Healthcare</option>
                    <option value="education">Education</option>
                    <option value="finance">Finance</option>
                    <option value="marketing">Marketing</option>
                    <option value="sales">Sales</option>
                    <option value="customer_service">Customer Service</option>
                    <option value="manufacturing">Manufacturing</option>
                    <option value="logistics">Logistics</option>
                    <option value="hospitality">Hospitality</option>
                    <option value="retail">Retail</option>
                    <option value="construction">Construction</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Company Name *</label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company || ''}
                    onChange={handleFormChange}
                    required
                    placeholder="Enter company name"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Contact Email *</label>
                  <input
                    type="email"
                    name="contactEmail"
                    value={formData.contactEmail || ''}
                    onChange={handleFormChange}
                    required
                    placeholder="Enter contact email"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Contact Phone</label>
                  <input
                    type="tel"
                    name="contactPhone"
                    value={formData.contactPhone || ''}
                    onChange={handleFormChange}
                    placeholder="Enter contact phone"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

                <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleFormChange}
                  required
                  rows={4}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location *</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleFormChange}
                  required
                  placeholder="e.g., New York, NY or Remote"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Dynamic Type-Specific Fields */}
              {renderTypeSpecificFields()}

              {/* Common Fields for All Types */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Languages (comma-separated)</label>
                <input
                  type="text"
                  name="requirements.languages"
                  value={Array.isArray(formData.requirements.languages) ? formData.requirements.languages.join(', ') : formData.requirements.languages}
                  onChange={handleFormChange}
                  placeholder="English, Spanish, French"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Dates and Duration */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Application Deadline *</label>
                  <input
                    type="date"
                    name="applicationDeadline"
                    value={formData.applicationDeadline}
                    onChange={handleFormChange}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleFormChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
                  <input
                    type="text"
                    name="duration"
                    value={formData.duration}
                    onChange={handleFormChange}
                    placeholder="e.g., 6 months, Permanent"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Additional Settings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Max Applicants</label>
                  <input
                    type="number"
                    name="maxApplicants"
                    value={formData.maxApplicants}
                    onChange={handleFormChange}
                    placeholder="Leave empty for unlimited"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tags (comma-separated)</label>
                  <input
                    type="text"
                    name="tags"
                    value={formData.tags}
                    onChange={handleFormChange}
                    placeholder="remote, entry-level, tech"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Contact Email</label>
                  <input
                    type="email"
                    name="contactEmail"
                    value={formData.contactEmail}
                    onChange={handleFormChange}
                    placeholder="contact@company.com"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Contact Phone</label>
                  <input
                    type="tel"
                    name="contactPhone"
                    value={formData.contactPhone}
                    onChange={handleFormChange}
                    placeholder="+1 (555) 123-4567"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleFormChange}
                  placeholder="https://company.com"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="flex items-center space-x-6">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="isRemote"
                    checked={formData.isRemote}
                    onChange={handleFormChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">
                    Remote work available
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleFormChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">
                    Publish immediately
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-6 border-t">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {formLoading ? 'Saving...' : (showEditModal ? 'Update Opportunity' : 'Create Opportunity')}
                </button>
              </div>
            </form>
          </div>
            </div>
      )}

      {/* Profile View Modal */}
      {showProfileModal && selectedProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto relative">
                <button
              onClick={() => setShowProfileModal(false)}
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 p-2"
                >
                  <X className="h-6 w-6" />
                </button>
            <ProfileView profile={selectedProfile} />
              </div>
            </div>
      )}

      {/* Contact Modal */}
      {showContactModal && selectedProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Contact {selectedProfile.fullName}</h2>
                <button
                  onClick={closeContactModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            <form onSubmit={handleContactSubmit} className="p-6">
              <div className="space-y-6">
                {/* Contact Method */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Contact Method</label>
                  <div className="grid grid-cols-3 gap-3">
                    <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="contactMethod"
                        value="email"
                        checked={contactForm.contactMethod === 'email'}
                        onChange={handleContactFormChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                      />
                      <div className="ml-3">
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 mr-2" />
                          <span className="text-sm font-medium">Email</span>
                        </div>
                      </div>
                    </label>
                    <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="contactMethod"
                        value="phone"
                        checked={contactForm.contactMethod === 'phone'}
                        onChange={handleContactFormChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                      />
                      <div className="ml-3">
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 mr-2" />
                          <span className="text-sm font-medium">Phone</span>
                        </div>
                      </div>
                    </label>
                    <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="contactMethod"
                        value="video"
                        checked={contactForm.contactMethod === 'video'}
                        onChange={handleContactFormChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                      />
                      <div className="ml-3">
                        <div className="flex items-center">
                          <Video className="h-4 w-4 mr-2" />
                          <span className="text-sm font-medium">Video Call</span>
                        </div>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                  <input
                    type="text"
                    name="subject"
                    value={contactForm.subject}
                    onChange={handleContactFormChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                  <textarea
                    name="message"
                    value={contactForm.message}
                    onChange={handleContactFormChange}
                    rows={6}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-6 border-t mt-6">
                <button
                  type="button"
                  onClick={closeContactModal}
                  className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Send Message
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Message Center Modal */}
      <MessageCenter 
        isOpen={showMessageCenter}
        onClose={() => setShowMessageCenter(false)}
        preSelectedRecipient={selectedProfile}
      />

      {showInterviewModal && interviewProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {rescheduleMode ? 'Reschedule Interview' : 'Schedule Interview'}
                </h2>
                <p className="text-gray-600 mt-1">
                  with {interviewProfile?.fullName || (interviewProfile?.firstName && interviewProfile?.lastName ? `${interviewProfile.firstName} ${interviewProfile.lastName}` : 'Talent')}
                </p>
              </div>
              <button
                onClick={() => { closeInterviewModal(); setRescheduleMode(false); setRescheduleInterviewId(null); }}
                className="text-gray-400 hover:text-gray-600 p-2"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Candidate Info Card */}
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{interviewProfile?.fullName || 'Talent'}</h3>
                  <p className="text-sm text-gray-600">{interviewProfile?.email}</p>
                  {interviewProfile?.skills && interviewProfile.skills.length > 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      Skills: {interviewProfile.skills.slice(0, 3).join(', ')}
                      {interviewProfile.skills.length > 3 && ` +${interviewProfile.skills.length - 3} more`}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <form onSubmit={handleBookInterview} className="space-y-6">
              {/* Interview Type and Basic Info */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-blue-500" />
                  Interview Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Interview Type <span className="text-red-500">*</span>
                    </label>
                    <select 
                      value={interviewType || 'job'} 
                      onChange={e => setInterviewType(e.target.value)} 
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="job">Job Interview</option>
                      <option value="internship">Internship Interview</option>
                      <option value="scholarship">Scholarship Interview</option>
                      <option value="mentorship">Mentorship Session</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Interview Title <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="text" 
                      value={interviewTitle || ''} 
                      onChange={e => setInterviewTitle(e.target.value)}
                      placeholder="e.g., Software Engineer Interview"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Availability Slots */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-blue-500" />
                  Availability Slots
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Add multiple time slots when you're available. The candidate will choose their preferred time.
                </p>
                
                {/* Available Slots List */}
                <div className="space-y-3 mb-4">
                  {availabilitySlots.map((slot, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                      <div className="flex items-center space-x-3">
                        <Calendar className="h-4 w-4 text-blue-500" />
                        <span className="text-sm font-medium text-gray-900">
                          {new Date(slot.date).toLocaleDateString()} at {slot.time} ({slot.duration} min)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeAvailabilitySlot(index)}
                        className="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-50 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  
                  {availabilitySlots.length === 0 && (
                    <div className="text-center py-6 text-gray-500">
                      <Clock className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                      <p className="text-sm">No availability slots added yet</p>
                    </div>
                  )}
                </div>

                {/* Add New Slot */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                    <input 
                      type="date" 
                      value={newSlotDate} 
                      onChange={e => setNewSlotDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                    <input 
                      type="time" 
                      value={newSlotTime} 
                      onChange={e => setNewSlotTime(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
                    <select 
                      value={newSlotDuration} 
                      onChange={e => setNewSlotDuration(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="30">30 minutes</option>
                      <option value="45">45 minutes</option>
                      <option value="60">1 hour</option>
                      <option value="90">1.5 hours</option>
                      <option value="120">2 hours</option>
                    </select>
                  </div>
                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={addAvailabilitySlot}
                      disabled={!newSlotDate || !newSlotTime}
                      className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Slot
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Format and Platform */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Video className="h-5 w-5 mr-2 text-blue-500" />
                  Interview Format
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Interview Format <span className="text-red-500">*</span>
                    </label>
                    <select 
                      value={interviewFormat} 
                      onChange={e => setInterviewFormat(e.target.value)} 
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="video">Video Call</option>
                      <option value="in-person">In-Person</option>
                      <option value="phone">Phone Call</option>
                      <option value="hybrid">Hybrid</option>
                    </select>
                  </div>
                  {interviewFormat === 'video' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Meeting Platform <span className="text-red-500">*</span>
                      </label>
                      <select 
                        value={meetingPlatform} 
                        onChange={e => setMeetingPlatform(e.target.value)} 
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      >
                        <option value="zoom">Zoom</option>
                        <option value="teams">Microsoft Teams</option>
                        <option value="google-meet">Google Meet</option>
                        <option value="skype">Skype</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  )}
                  {interviewFormat === 'in-person' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Location <span className="text-red-500">*</span>
                      </label>
                      <input 
                        type="text" 
                        value={interviewLocation || ''} 
                        onChange={e => setInterviewLocation(e.target.value)}
                        placeholder="e.g., Office Address, Building, Room"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Custom Google Meet Link */}
              {interviewFormat === 'video' && meetingPlatform === 'google-meet' && (
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <label className="block text-sm font-medium text-blue-800 mb-2">
                    Google Meet Link (Optional)
                  </label>
                  <input 
                    type="url" 
                    value={customGoogleMeetLink || ''} 
                    onChange={e => setCustomGoogleMeetLink(e.target.value)}
                    placeholder="https://meet.google.com/xxx-yyyy-zzz"
                    className="w-full border border-blue-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="text-xs text-blue-600 mt-1">
                    If you have a specific Google Meet link, enter it here. Otherwise, one will be generated automatically.
                  </p>
                </div>
              )}

              {/* Interview Details */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-blue-500" />
                  Interview Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Materials Required
                    </label>
                    <textarea 
                      value={interviewMaterials} 
                      onChange={e => setInterviewMaterials(e.target.value)} 
                      placeholder="e.g., Portfolio, ID documents, test materials, laptop..."
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                      rows={3}
                    />
                    <p className="text-xs text-gray-500 mt-1">Let the candidate know what to bring or prepare</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Special Instructions
                    </label>
                    <textarea 
                      value={interviewInstructions} 
                      onChange={e => setInterviewInstructions(e.target.value)} 
                      placeholder="e.g., Prepare for technical questions, dress code, arrival instructions..."
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                      rows={3}
                    />
                    <p className="text-xs text-gray-500 mt-1">Any specific instructions for the candidate</p>
                  </div>
                </div>
              </div>
              
              {/* Personal Message */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <MessageCircle className="h-5 w-5 mr-2 text-blue-500" />
                  Personal Message
                </h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message to Candidate
                  </label>
                  <textarea 
                    value={interviewMessage} 
                    onChange={e => setInterviewMessage(e.target.value)} 
                    placeholder="Add a personal touch to your interview invitation..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                    rows={3}
                  />
                  <p className="text-xs text-gray-500 mt-1">This message will be included in the interview invitation</p>
                </div>
              </div>

              {/* Reminder Settings */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Bell className="h-5 w-5 mr-2 text-blue-500" />
                  Reminder Settings
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <label className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      checked={sendReminder24h || false} 
                      onChange={e => setSendReminder24h(e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">24 hours before</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      checked={sendReminder1h || false} 
                      onChange={e => setSendReminder1h(e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">1 hour before</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      checked={sendReminder15min || false} 
                      onChange={e => setSendReminder15min(e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">15 minutes before</span>
                  </label>
                </div>
              </div>

              {/* Error Display */}
              {interviewError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                    <p className="text-red-800 text-sm">{interviewError}</p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                <button 
                  type="button" 
                  onClick={() => { closeInterviewModal(); setRescheduleMode(false); setRescheduleInterviewId(null); }} 
                  className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={interviewLoading || availabilitySlots.length === 0} 
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center"
                >
                  {interviewLoading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      {rescheduleMode ? 'Rescheduling...' : 'Scheduling...'}
                    </>
                  ) : (
                    <>
                      <Calendar className="h-4 w-4 mr-2" />
                      {rescheduleMode ? 'Reschedule Interview' : 'Schedule Interview'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showCandidatePicker && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg">
            <h2 className="text-lg font-semibold mb-4">Pick a Candidate</h2>
            <input
              type="text"
              placeholder="Search by name, email, or skill..."
              value={candidateSearch}
              onChange={e => setCandidateSearch(e.target.value)}
              className="w-full border rounded px-3 py-2 mb-4"
            />
            <div className="max-h-64 overflow-y-auto divide-y divide-gray-100">
              {profiles.filter(profile =>
                profile.fullName?.toLowerCase().includes(candidateSearch.toLowerCase()) ||
                profile.email?.toLowerCase().includes(candidateSearch.toLowerCase()) ||
                (profile.skills && profile.skills.join(' ').toLowerCase().includes(candidateSearch.toLowerCase()))
              ).map(profile => (
                <button
                  key={profile._id}
                  className="w-full text-left px-3 py-2 hover:bg-blue-50 rounded flex items-center"
                  onClick={() => {
                    setShowCandidatePicker(false);
                    openInterviewModal(profile);
                  }}
                >
                  <span className="font-medium">{profile.fullName}</span>
                  <span className="ml-2 text-xs text-gray-500">{profile.email}</span>
                  <span className="ml-auto text-xs text-gray-400">{profile.skills?.slice(0,2).join(', ')}</span>
                </button>
              ))}
              {profiles.length === 0 && (
                <div className="text-gray-500 text-center py-4">No candidates found</div>
              )}
            </div>
            <div className="flex justify-end mt-4">
              <button onClick={() => setShowCandidatePicker(false)} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Interview Details Modal */}
      {showInterviewDetailsModal && selectedInterviewDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
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
                  selectedInterviewDetails.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  selectedInterviewDetails.status === 'accepted' ? 'bg-green-100 text-green-800' :
                  selectedInterviewDetails.status === 'declined' ? 'bg-red-100 text-red-800' :
                  selectedInterviewDetails.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {selectedInterviewDetails.status.charAt(0).toUpperCase() + selectedInterviewDetails.status.slice(1)}
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
                      <label className="block text-sm font-medium text-gray-700">Position</label>
                      <p className="text-sm text-gray-900">{selectedInterviewDetails.position || 'Not specified'}</p>
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
                      <label className="block text-sm font-medium text-gray-700">Location</label>
                      <p className="text-sm text-gray-900">{selectedInterviewDetails.location || 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Address</label>
                      <p className="text-sm text-gray-900">{selectedInterviewDetails.address || 'Not specified'}</p>
                    </div>
                  </div>
                </div>
              </div>

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

              {/* Talent Response */}
              {selectedInterviewDetails.talentResponse && selectedInterviewDetails.talentResponse.message && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Talent Response</h3>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-900 mb-2">{selectedInterviewDetails.talentResponse.message}</p>
                    <p className="text-xs text-gray-500">
                      Responded on: {new Date(selectedInterviewDetails.talentResponse.respondedAt).toLocaleString()}
                    </p>
                  </div>
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
            </div>

            <div className="p-6 border-t border-gray-200">
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowInterviewDetailsModal(false)}
                  className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setShowInterviewDetailsModal(false);
                    handleReschedule(selectedInterviewDetails);
                  }}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Reschedule
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MessageCenter Modal */}
      <MessageCenter
        isOpen={showMessageCenter}
        onClose={() => setShowMessageCenter(false)}
      />


    </div>
  );
};

export default ProviderDashboard; 
import React, { useState, useMemo, useCallback, useEffect } from 'react';
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
  Palette
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
import { messagesAPI } from '../../services/api';
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

  const { notifications } = useNotifications();
  const { messages, loading: messagesLoading, error: messagesError, refetch: refetchMessages } = useMessages();
  const { applications, loading: applicationsLoading, error: applicationsError, refetch: refetchApplications, updateApplicationStatus } = useApplications();
  const [showMessageCenter, setShowMessageCenter] = useState(false);

  // Success toast state
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Function to show success toast
  const displaySuccessToast = (message) => {
    setSuccessMessage(message);
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 5000);
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
    contactEmail: '',
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
      id: 'communications', 
      label: 'Communications', 
      icon: MessageCircle,
      badge: (unreadMessagesCount + unreadNotificationsCount) > 0 ? (unreadMessagesCount + unreadNotificationsCount) : null
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
      alert(`Contact message sent to ${selectedProfile?.fullName}!`);
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
      const opportunityData = {
        ...formData,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
        requirements: {
          ...formData.requirements,
          skills: Array.isArray(formData.requirements.skills) 
            ? formData.requirements.skills 
            : (formData.requirements.skills ? formData.requirements.skills.split(',').map(skill => skill.trim()).filter(Boolean) : []),
          languages: Array.isArray(formData.requirements.languages) 
            ? formData.requirements.languages 
            : (formData.requirements.languages ? formData.requirements.languages.split(',').map(lang => lang.trim()).filter(Boolean) : [])
        },
        benefits: Array.isArray(formData.benefits) 
          ? formData.benefits 
          : (formData.benefits ? formData.benefits.split(',').map(benefit => benefit.trim()).filter(Boolean) : [])
      };

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
      setFormError(error.response?.data?.message || 'An error occurred. Please try again.');
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
    const activeOpportunities = opportunities.filter(opp => opp.isActive).length;
    const totalApplications = applications.length;
    const pendingInterviews = interviews.filter(int => int.status === 'pending').length;
    const successfulPlacements = interviews.filter(int => int.status === 'completed').length;
    
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
      students: profiles.filter(p => p.option === 'student').length,
      jobSeekers: profiles.filter(p => p.option === 'job seeker').length,
      undocumented: profiles.filter(p => p.option === 'undocumented_talent').length,
      total: profiles.length
    };
  }, [profiles]);

  // Filter opportunities to only those created by the current provider
  const myOpportunities = useMemo(() => {
    if (!user || !user._id) return [];
    return opportunities.filter(opp => opp.provider === user._id || (opp.provider && opp.provider._id === user._id));
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
      return (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Available Talents</h2>
              <p className="text-gray-600">Browse refugee talent profiles</p>
            </div>
          </div>
          {/* Table or Loader/Error */}
          {profilesLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white p-6 rounded-lg border animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : profilesError ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                <p className="text-red-800">{profilesError}</p>
              </div>
            </div>
          ) : profiles.length > 0 ? (
            <div className="overflow-x-auto bg-white rounded-lg border">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Age</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gender</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Key Skills</th>
                    <th className="px-4 py-2"></th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {profiles.map((profile) => (
                    <tr key={profile._id} className="hover:bg-blue-50 transition-colors">
                      <td className="px-4 py-2 flex items-center space-x-2">
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                          {profile.photoUrl ? (
                            <img 
                              src={profile.photoUrl.startsWith('http') ? profile.photoUrl : `http://localhost:5001/${profile.photoUrl}`} 
                              alt={profile.fullName} 
                              className="w-8 h-8 object-cover"
                            />
                          ) : (
                            <span className="text-sm font-medium text-gray-700">
                              {profile.fullName?.split(' ').map(n => n[0]).join('')}
                            </span>
                          )}
                        </div>
                        <span>{profile.fullName}</span>
                      </td>
                      <td className="px-4 py-2">{profile.age}</td>
                      <td className="px-4 py-2">{profile.gender}</td>
                      <td className="px-4 py-2">{profile.currentLocation}</td>
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
                      <td className="px-4 py-2">
                        <button 
                          onClick={() => openProfileModal(profile)}
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
              <Users className="h-16 w-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No talents found</h3>
              <p className="text-gray-600">Try again later or contact support</p>
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

    if (activeItem === 'communications') {
      return (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Communications</h2>
              <p className="text-gray-600">Manage messages and notifications</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Messages */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Messages</h3>
                <div className="flex items-center space-x-2">
                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                  {messages?.length || 0}
                </span>
                  <button
                    onClick={() => setShowMessageCenter(true)}
                    className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                  >
                    Open
                  </button>
                </div>
              </div>
              <div className="space-y-3">
                {messages && messages.length > 0 ? (
                  messages.slice(0, 5).map(message => {
                    // Use the same normalization logic as in RefugeeDashboard
                    const senderId = typeof message.sender === 'object' ? message.sender._id : message.sender;
                    const recipientId = typeof message.recipient === 'object' ? message.recipient._id : message.recipient;
                    const currentUserId = typeof user._id === 'object' ? user._id.toString() : user._id;
                    const isReceived = recipientId === currentUserId;
                    const otherUserName = isReceived ? message.senderName : message.recipientName;
                    
                    return (
                    <div key={message._id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                            <p className="font-medium text-sm">{otherUserName || 'Unknown'}</p>
                            <p className="text-xs text-gray-500">{message.content}</p>
                        </div>
                          <div className="text-right">
                        <span className="text-xs text-gray-400">
                          {new Date(message.createdAt).toLocaleDateString()}
                        </span>
                            {!message.isRead && isReceived && (
                              <span className="block bg-blue-500 text-white text-xs rounded-full px-2 py-1 mt-1">
                                New
                              </span>
                            )}
                      </div>
                    </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-gray-500 text-sm text-center py-4">No messages yet</p>
                )}
              </div>
            </div>

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
                  notifications.slice(0, 5).map(notification => (
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
                        Interview with {interview.talent?.fullName || 'Talent'}
                      </h3>
                      <p className="text-gray-600 mb-3">
                        For: {interview.opportunity?.title || 'Opportunity'}
                      </p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(interview.scheduledDate).toLocaleDateString()}
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {new Date(interview.scheduledDate).toLocaleTimeString()}
                        </div>
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {interview.location || 'TBD'}
                        </div>
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      interview.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                      interview.status === 'completed' ? 'bg-green-100 text-green-800' :
                      interview.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {interview.status}
                    </span>
                  </div>
                  
                  <div className="flex space-x-2 pt-4 border-t">
                    <button className="text-blue-600 hover:text-blue-700 text-sm font-medium" onClick={() => handleViewInterviewDetails(interview)}>
                      View Details
                    </button>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
                  <input
                    type="text"
                    value={user?.companyName || ''}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Your company name"
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
                    value={user?.phone || ''}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="+1 (555) 123-4567"
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
  const [interviewLoading, setInterviewLoading] = useState(false);
  const [interviewError, setInterviewError] = useState(null);

  // Add a handler to open the interview modal
  const openInterviewModal = (profile) => {
    setInterviewProfile(profile);
    setInterviewDate('');
    setInterviewTime('');
    setInterviewMessage('');
    setInterviewError(null);
    setShowInterviewModal(true);
  };

  const closeInterviewModal = () => {
    setShowInterviewModal(false);
    setInterviewProfile(null);
    setInterviewDate('');
    setInterviewTime('');
    setInterviewMessage('');
    setInterviewError(null);
  };

  const handleBookInterview = async (e) => {
    e.preventDefault();
    if (!interviewDate || !interviewTime) {
      setInterviewError('Please select date and time.');
      return;
    }
    setInterviewLoading(true);
    setInterviewError(null);
    try {
      const dateTime = new Date(`${interviewDate}T${interviewTime}`);
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
      
      const inviteData = {
        talentId: talentId,
        type: 'job', // Default to job interview
        title: 'Interview Invitation',
        description: interviewMessage || 'Interview invitation',
        organization: user.organization || 'Unknown',
        position: '',
        location: 'remote',
        address: '',
        scheduledDate: dateTime,
        duration: 60,
        providerNotes: interviewMessage || ''
      };
      
      console.log('Sending interview invite with data:', inviteData);
      console.log('Interview profile:', interviewProfile);
      console.log('User:', user);
      
      if (rescheduleMode && rescheduleInterviewId) {
        console.log('Rescheduling interview:', rescheduleInterviewId);
        await updateInterview(rescheduleInterviewId, inviteData);
        alert('Interview rescheduled successfully!');
      } else {
        console.log('Creating new interview invite');
        await sendInterviewInvite(inviteData);
        alert('Interview booked successfully!');
      }
      setShowInterviewModal(false);
      setInterviewProfile(null);
      setInterviewDate('');
      setInterviewTime('');
      setInterviewMessage('');
      setInterviewError(null);
      setRescheduleMode(false);
      setRescheduleInterviewId(null);
      if (typeof refetchInterviews === 'function') refetchInterviews();
    } catch (err) {
      setInterviewError(err.response?.data?.message || 'Failed to book/reschedule interview');
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
        alert('Preselection message sent successfully!');
        refetchMessages();
      }
    } catch (error) {
      console.error('Error sending preselection:', error);
      alert('Failed to send preselection message');
    }
  };

  const handleApplicationStatusUpdate = async (applicationId, status) => {
    try {
      const result = await updateApplicationStatus(applicationId, status);
      
      if (result.success) {
        alert(`Application ${status} successfully!`);
      } else {
        alert(`Failed to ${status} application: ${result.error}`);
      }
    } catch (error) {
      console.error('Error updating application status:', error);
      alert('Failed to update application status');
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
    setInterviewProfile(interview.talent);
    
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
      alert('Interview canceled successfully!');
      if (typeof refetchInterviews === 'function') refetchInterviews();
    } catch (err) {
      alert('Failed to cancel interview.');
    }
  };

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
                    <option value="Technology">Technology</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Education">Education</option>
                    <option value="Business">Business</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Arts & Design">Arts & Design</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Finance">Finance</option>
                    <option value="Non-profit">Non-profit</option>
                    <option value="Other">Other</option>
                  </select>
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg border border-gray-200 max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900">Profile Details</h2>
                <button
                  onClick={closeProfileModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
            {profileLoading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading profile...</p>
              </div>
            ) : (
              <div className="p-4 space-y-6">
                {/* Profile Picture & Basic Info */}
                <div className="flex items-start space-x-4">
                  <div className="w-20 h-20 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden">
                          {selectedProfile.photoUrl ? (
                            <img 
                              src={selectedProfile.photoUrl.startsWith('http') ? selectedProfile.photoUrl : `http://localhost:5001/${selectedProfile.photoUrl}`} 
                              alt={selectedProfile.fullName} 
                              className="w-20 h-20 rounded-full object-cover"
                            />
                    ) : (
                      <span className="text-xl font-medium text-gray-700">
                            {selectedProfile.fullName?.split(' ').map(n => n[0]).join('')}
                          </span>
                    )}
                        </div>
                        <div className="flex-1">
                          <h1 className="text-2xl font-bold text-gray-900 mb-1">{selectedProfile.fullName}</h1>
                    <p className="text-base text-gray-600 mb-1">{selectedProfile.age} years old • {selectedProfile.gender}</p>
                    <div className="flex items-center space-x-4 mb-2">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                              selectedProfile.option === 'student' ? 'bg-blue-100 text-blue-800' :
                              selectedProfile.option === 'job seeker' ? 'bg-green-100 text-green-800' :
                              selectedProfile.option === 'undocumented_talent' ? 'bg-purple-100 text-purple-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {selectedProfile.option}
                            </span>
                      <span className="flex items-center text-gray-600">
                              <MapPin className="h-4 w-4 mr-1" />
                              {selectedProfile.currentLocation}
                      </span>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${selectedProfile.isPublic ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{selectedProfile.isPublic ? 'Public' : 'Private'}</span>
                            </div>
                    <div className="flex flex-wrap gap-4 text-gray-600 text-sm">
                      <span><Mail className="inline h-4 w-4 mr-1" />{selectedProfile.email}</span>
                      {selectedProfile.phone && <span><Phone className="inline h-4 w-4 mr-1" />{selectedProfile.phone}</span>}
                      {selectedProfile.website && <span><Globe className="inline h-4 w-4 mr-1" /><a href={selectedProfile.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{selectedProfile.website}</a></span>}
                          </div>
                        </div>
                      </div>

                {/* Resume/CV and Get in Touch (now in main form) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Resume/CV */}
                  {selectedProfile.document && (
                                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 flex flex-col items-center justify-center">
                    <h3 className="text-base font-semibold text-gray-900 mb-2">Resume/CV</h3>
                    <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center">
                      <Download className="h-4 w-4 mr-2" />
                      Download Resume
                    </button>
                        </div>
                      )}
                  {/* Get in Touch */}
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 flex flex-col items-center justify-center">
                    <h3 className="text-base font-semibold text-gray-900 mb-2">Get in Touch</h3>
                    <button
                      onClick={() => {
                        setShowMessageCenter(true);
                      }}
                      className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center mb-3"
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Send Message
                    </button>
                    <button className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center justify-center">
                      <Video className="h-4 w-4 mr-2" />
                      Schedule Video Call
                    </button>
                  </div>
                </div>

                {/* Skills & Languages */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <h3 className="text-base font-semibold text-gray-900 mb-2 flex items-center"><Award className="h-4 w-4 mr-2 text-blue-500" />Skills</h3>
                    {selectedProfile.skills && selectedProfile.skills.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                        {selectedProfile.skills.map((skill, i) => (
                          <span key={i} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">{skill}</span>
                            ))}
                          </div>
                    ) : <p className="text-gray-500 text-sm">No skills listed</p>}
                        </div>
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <h3 className="text-base font-semibold text-gray-900 mb-2 flex items-center"><Languages className="h-4 w-4 mr-2 text-blue-500" />Languages</h3>
                    {selectedProfile.language && selectedProfile.language.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                        {selectedProfile.language.map((lang, i) => (
                          <span key={i} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">{lang}</span>
                            ))}
                          </div>
                    ) : <p className="text-gray-500 text-sm">No languages listed</p>}
                        </div>
                          </div>

                {/* Student Template */}
                {selectedProfile.option === 'student' && (
                  <>
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center"><BookOpen className="h-4 w-4 mr-2 text-blue-500" />Academic Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <span className="block text-sm font-medium text-gray-700 mb-2">High School Subjects</span>
                          <p className="text-gray-900">{selectedProfile.highSchoolSubjects || <span className="text-gray-400 italic">No data provided</span>}</p>
                          </div>
                        <div>
                          <span className="block text-sm font-medium text-gray-700 mb-2">Desired Field of Study</span>
                          <p className="text-gray-900">{selectedProfile.desiredField || <span className="text-gray-400 italic">No data provided</span>}</p>
                        </div>
                    </div>
                  </div>
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center"><Award className="h-4 w-4 mr-2 text-blue-500" />Annual Academic Records</h3>
                      {selectedProfile.academicRecords && selectedProfile.academicRecords.length > 0 ? (
                      <div className="space-y-3">
                          {selectedProfile.academicRecords.map((record, i) => (
                            <div key={i} className="bg-white rounded-lg p-3 border border-gray-200">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <span className="text-sm font-medium text-gray-500">Academic Level</span>
                                  <p className="text-gray-900">{expandDegreeAbbreviation(record.level || '')}</p>
                          </div>
                                <div>
                                  <span className="text-sm font-medium text-gray-500">Year</span>
                                  <p className="text-gray-900">{String(record.year || '')}</p>
                          </div>
                                {record.school && (
                                  <div>
                                    <span className="text-sm font-medium text-gray-500">School</span>
                                    <p className="text-gray-900">{String(record.school)}</p>
                          </div>
                        )}
                                <div>
                                  <span className="text-sm font-medium text-gray-500">Percentage Score</span>
                                  <p className="text-gray-900">{String(record.percentage || 0)}%</p>
                      </div>
                    </div>
                              {record.subjectGrades && (
                                <div className="mt-4">
                                  <span className="text-sm font-medium text-gray-500">Subject Grades</span>
                                  <p className="text-gray-900">
                                    {typeof record.subjectGrades === 'string' ? record.subjectGrades : 
                                     typeof record.subjectGrades === 'object' ? JSON.stringify(record.subjectGrades) : 
                                     String(record.subjectGrades)}
                                  </p>
                          </div>
                        )}
                          </div>
                          ))}
                          </div>
                      ) : <p className="text-gray-400 italic">No academic records added yet</p>}
                      </div>
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center"><FileText className="h-4 w-4 mr-2 text-blue-500" />Transcripts and Certificates</h3>
                      {selectedProfile.supportingDocuments && selectedProfile.supportingDocuments.length > 0 ? (
                        <div className="space-y-2">
                          {selectedProfile.supportingDocuments.map((doc, i) => (
                            <div key={i} className="flex items-center justify-between p-2 bg-white rounded border">
                              <div className="flex items-center">
                                <FileText className="h-4 w-4 text-blue-500 mr-2" />
                                <span className="text-gray-700">
                                  {typeof doc === 'object' && doc.originalname ? doc.originalname : 
                                   typeof doc === 'string' ? doc : 'Document'}
                                </span>
                    </div>
                              {typeof doc === 'string' ? (
                                <a href={`http://localhost:5001/${doc}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-xs">View</a>
                              ) : typeof doc === 'object' && doc.path ? (
                                <a href={`http://localhost:5001/${doc.path}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-xs">View</a>
                              ) : null}
                      </div>
                          ))}
                        </div>
                      ) : <p className="text-gray-400 italic">No supporting documents uploaded yet</p>}
                    </div>
                  </>
                )}

                {/* Job Seeker Template */}
                {selectedProfile.option === 'job seeker' && (
                  <>
                    <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center"><GraduationCap className="h-5 w-5 mr-2 text-blue-500" />Education</h3>
                      {selectedProfile.education && selectedProfile.education.length > 0 ? (
                        <div className="space-y-4">
                          {selectedProfile.education.map((edu, i) => (
                            <div key={i} className="bg-white rounded-lg p-4 border border-gray-200">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div><span className="text-sm font-medium text-gray-500">School/Institution</span><p className="text-gray-900">{String(edu.school || '')}</p></div>
                                <div><span className="text-sm font-medium text-gray-500">Degree</span><p className="text-gray-900">{expandDegreeAbbreviation(edu.degree || '')}</p></div>
                                <div><span className="text-sm font-medium text-gray-500">Field of Study</span><p className="text-gray-900">{String(edu.field || '')}</p></div>
                                <div><span className="text-sm font-medium text-gray-500">Duration</span><p className="text-gray-900">{String(edu.duration || '')}</p></div>
                                <div><span className="text-sm font-medium text-gray-500">Start Date</span><p className="text-gray-900">{String(edu.start || '')}</p></div>
                                <div><span className="text-sm font-medium text-gray-500">End Date</span><p className="text-gray-900">{String(edu.end || '')}</p></div>
                      </div>
                            </div>
                          ))}
                        </div>
                      ) : <p className="text-gray-400 italic">No education history added yet</p>}
                    </div>
                    <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center"><Briefcase className="h-5 w-5 mr-2 text-blue-500" />Work Experience</h3>
                      {selectedProfile.experience && selectedProfile.experience.length > 0 ? (
                        <div className="space-y-4">
                          {selectedProfile.experience.map((exp, i) => (
                            <div key={i} className="bg-white rounded-lg p-4 border border-gray-200">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div><span className="text-sm font-medium text-gray-500">Company</span><p className="text-gray-900">{String(exp.company || '')}</p></div>
                                <div><span className="text-sm font-medium text-gray-500">Job Title</span><p className="text-gray-900">{String(exp.title || '')}</p></div>
                                <div><span className="text-sm font-medium text-gray-500">Start Date</span><p className="text-gray-900">{String(exp.start || '')}</p></div>
                                <div><span className="text-sm font-medium text-gray-500">End Date</span><p className="text-gray-900">{String(exp.end || '')}</p></div>
                                <div className="md:col-span-2"><span className="text-sm font-medium text-gray-500">Description</span><p className="text-gray-900">{String(exp.description || '')}</p></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : <p className="text-gray-400 italic">No work experience added yet</p>}
                    </div>
                  </>
                )}

                {/* Undocumented Talent Template */}
                {selectedProfile.option === 'undocumented_talent' && (
                  <>
                    <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center"><Star className="h-5 w-5 mr-2 text-blue-500" />Talent Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div><span className="block text-sm font-medium text-gray-700 mb-2">Talent Category</span><p className="text-gray-900">{String(selectedProfile.talentCategory || '')}</p></div>
                        <div><span className="block text-sm font-medium text-gray-700 mb-2">Years of Experience</span><p className="text-gray-900">{String(selectedProfile.talentExperience || '')}</p></div>
                        <div className="md:col-span-2"><span className="block text-sm font-medium text-gray-700 mb-2">Talent Description</span><p className="text-gray-900">{String(selectedProfile.talentDescription || '')}</p></div>
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center"><Palette className="h-5 w-5 mr-2 text-blue-500" />Portfolio & Work Samples</h3>
                      {selectedProfile.portfolio && selectedProfile.portfolio.length > 0 ? (
                        <div className="space-y-4">
                          {selectedProfile.portfolio.map((item, i) => (
                            <div key={i} className="bg-white rounded-lg p-4 border border-gray-200">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div><span className="text-sm font-medium text-gray-500">Title</span><p className="text-gray-900">{String(item.title || '')}</p></div>
                                <div><span className="text-sm font-medium text-gray-500">Category</span><p className="text-gray-900">{String(item.category || '')}</p></div>
                                <div><span className="text-sm font-medium text-gray-500">Year Created</span><p className="text-gray-900">{String(item.year || '')}</p></div>
                                <div><span className="text-sm font-medium text-gray-500">Link</span>{item.link && (<a href={item.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{String(item.link)}</a>)}</div>
                                <div className="md:col-span-2"><span className="text-sm font-medium text-gray-500">Description</span><p className="text-gray-900">{String(item.description || '')}</p></div>
                  </div>
                </div>
                          ))}
              </div>
                      ) : <p className="text-gray-400 italic">No portfolio items added yet</p>}
                    </div>
                  </>
                )}
              </div>
            )}
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
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {rescheduleMode ? 'Reschedule Interview with' : 'Book Interview with'} {interviewProfile.fullName || interviewProfile.firstName + ' ' + interviewProfile.lastName}
            </h2>
            <form onSubmit={handleBookInterview} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                <input type="date" value={interviewDate} onChange={e => setInterviewDate(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                <input type="time" value={interviewTime} onChange={e => setInterviewTime(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Message (optional)</label>
                <textarea value={interviewMessage} onChange={e => setInterviewMessage(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" rows={3} />
              </div>
              {interviewError && <div className="text-red-600 text-sm">{interviewError}</div>}
              <div className="flex justify-end space-x-3 pt-6 border-t mt-6">
                <button type="button" onClick={() => { closeInterviewModal(); setRescheduleMode(false); setRescheduleInterviewId(null); }} className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Cancel</button>
                <button type="submit" disabled={interviewLoading} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">{interviewLoading ? 'Booking...' : (rescheduleMode ? 'Reschedule Interview' : 'Book Interview')}</button>
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

      {/* Success Toast */}
      {showSuccessToast && (
        <div className="fixed top-4 right-4 z-50 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg animate-fade-in flex items-center">
          <CheckCircle className="h-5 w-5 mr-2" />
          {successMessage}
          <button
            onClick={() => setShowSuccessToast(false)}
            className="ml-4 text-white hover:text-gray-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Error Toast */}
      {(opportunitiesError || interviewsError || profilesError) && (
        <div className="fixed top-4 right-4 z-50 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg animate-fade-in flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          {opportunitiesError || interviewsError || profilesError}
          <button
            onClick={() => {
              // Add any additional actions you want to execute when the error toast is closed
            }}
            className="ml-4 text-white hover:text-gray-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default ProviderDashboard; 
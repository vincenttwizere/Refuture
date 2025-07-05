import React, { useState, useMemo, useCallback, useEffect } from 'react';
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
  LogOut,
  AlertCircle,
  MapPin,
  Save,
  Trash2,
  RefreshCw,
  X,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useOpportunities } from '../../hooks/useOpportunities';
import { useInterviews } from '../../hooks/useInterviews';
import { useProfiles } from '../../hooks/useProfiles';
import { useNotifications } from '../../hooks/useNotifications';
import { useMessages } from '../../hooks/useMessages';

const ProviderDashboard = () => {
  const [activeItem, setActiveItem] = useState('overview');
  const [expandedSections, setExpandedSections] = useState({
    talent: true,
    opportunities: true,
    applications: true
  });

  const { logout, user, loading } = useAuth();
  const navigate = useNavigate();

  // Debug log for user
  console.log('ProviderDashboard user:', user, 'loading:', loading);

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
    error: interviewsError 
  } = useInterviews('provider');

  const { 
    profiles, 
    loading: profilesLoading, 
    error: profilesError,
    fetchProfiles
  } = useProfiles();

  const { notifications } = useNotifications();
  const { messages } = useMessages();

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
    isActive: true
  });
  const [formError, setFormError] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingOpportunity, setEditingOpportunity] = useState(null);
  const [formSuccess, setFormSuccess] = useState(null);

  // Talent search filters
  const [talentFilters, setTalentFilters] = useState({
    search: '',
    skills: '',
    location: '',
    option: ''
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
    { id: 'talent', label: 'Talent Discovery', icon: Users },
    { id: 'opportunities', label: 'Create Opportunity', icon: FileText },
    { id: 'applications', label: 'Applications', icon: FileText },
    { id: 'communications', label: 'Communications', icon: MessageCircle },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'interviews', label: 'Interview Manager', icon: Calendar },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'support', label: 'Help & Support', icon: HelpCircle }
  ], []);

  // Sidebar rendering
  const renderMenuItem = useCallback((item) => {
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
  }, [activeItem]);

  // Filter profiles based on search criteria
  const filteredProfiles = useMemo(() => {
    if (!profiles) return [];
    
    return profiles.filter(profile => {
      const matchesSearch = !talentFilters.search || 
        profile.fullName?.toLowerCase().includes(talentFilters.search.toLowerCase()) ||
        profile.skills?.some(skill => skill.toLowerCase().includes(talentFilters.search.toLowerCase()));
      
      const matchesSkills = !talentFilters.skills || 
        profile.skills?.some(skill => skill.toLowerCase().includes(talentFilters.skills.toLowerCase()));
      
      const matchesLocation = !talentFilters.location || 
        profile.currentLocation?.toLowerCase().includes(talentFilters.location.toLowerCase());
      
      const matchesOption = !talentFilters.option || profile.option === talentFilters.option;
      
      return matchesSearch && matchesSkills && matchesLocation && matchesOption;
    });
  }, [profiles, talentFilters]);

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
      isActive: opportunity.isActive !== false
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
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        requirements: {
          ...formData.requirements,
          skills: Array.isArray(formData.requirements.skills) 
            ? formData.requirements.skills 
            : formData.requirements.skills.split(',').map(skill => skill.trim()).filter(Boolean),
          languages: Array.isArray(formData.requirements.languages) 
            ? formData.requirements.languages 
            : formData.requirements.languages.split(',').map(lang => lang.trim()).filter(Boolean)
        },
        benefits: Array.isArray(formData.benefits) 
          ? formData.benefits 
          : formData.benefits.split(',').map(benefit => benefit.trim()).filter(Boolean)
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

  // Load profiles when talent section is active
  useEffect(() => {
    if (activeItem === 'talent') {
      fetchProfiles();
    }
  }, [activeItem, fetchProfiles]);

  // Main content area
  const renderMainContent = () => {
    if (activeItem === 'overview') {
      // Calculate real statistics
      const stats = useMemo(() => {
        const activeOpportunities = opportunities.filter(opp => opp.isActive).length;
        const totalApplications = opportunities.reduce((sum, opp) => sum + (opp.currentApplicants || 0), 0);
        const pendingInterviews = interviews.filter(int => int.status === 'pending').length;
        const successfulPlacements = interviews.filter(int => int.status === 'completed').length;
        
        return {
          activeOpportunities,
          totalApplications,
          pendingInterviews,
          successfulPlacements
        };
      }, [opportunities, interviews]);

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
                onClick={() => setActiveItem('opportunities')}
                className="text-blue-600 hover:text-blue-700 text-sm"
              >
                View All
              </button>
            </div>
            <div className="space-y-3">
              {opportunities.slice(0, 3).map(opp => (
                <div key={opp._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{opp.title}</p>
                    <p className="text-xs text-gray-500">{opp.currentApplicants || 0} applications</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    opp.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {opp.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              ))}
              {opportunities.length === 0 && (
                <p className="text-gray-500 text-sm text-center py-4">No opportunities created yet</p>
              )}
            </div>
          </div>
        </div>
      );
    }

    if (activeItem === 'talent') {
      return (
        <div className="space-y-6">
          {/* Search Filters */}
          <div className="bg-white p-4 rounded-lg border">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                <input
                  type="text"
                  placeholder="Search by name or skills..."
                  value={talentFilters.search}
                  onChange={(e) => setTalentFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Skills</label>
                <input
                  type="text"
                  placeholder="Filter by skills..."
                  value={talentFilters.skills}
                  onChange={(e) => setTalentFilters(prev => ({ ...prev, skills: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  placeholder="Filter by location..."
                  value={talentFilters.location}
                  onChange={(e) => setTalentFilters(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Talent Type</label>
                <select
                  value={talentFilters.option}
                  onChange={(e) => setTalentFilters(prev => ({ ...prev, option: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="">All Types</option>
                  <option value="student">Student</option>
                  <option value="job seeker">Job Seeker</option>
                  <option value="undocumented_talent">Undocumented Talent</option>
                </select>
              </div>
            </div>
          </div>

          {/* Talent Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProfiles.map(profile => (
              <div key={profile._id} className="bg-white rounded-lg border p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center mr-3">
                    <span className="text-sm font-medium text-gray-700">
                      {profile.fullName?.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{profile.fullName}</h3>
                    <p className="text-sm text-gray-500">{profile.option}</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">
                      <MapPin className="h-4 w-4 inline mr-1" />
                      {profile.currentLocation}
                    </p>
                  </div>
                  
                  {profile.skills && profile.skills.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Skills</p>
                      <div className="flex flex-wrap gap-1">
                        {profile.skills.slice(0, 3).map((skill, index) => (
                          <span key={index} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            {skill}
                          </span>
                        ))}
                        {profile.skills.length > 3 && (
                          <span className="text-xs text-gray-500">+{profile.skills.length - 3} more</span>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex space-x-2 pt-2">
                    <button className="flex-1 text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">
                      View Profile
                    </button>
                    <button className="flex-1 text-sm bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700">
                      Contact
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredProfiles.length === 0 && (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No talent found matching your criteria</p>
            </div>
          )}
        </div>
      );
    }

    if (activeItem === 'opportunities') {
      return (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Opportunities</h2>
              <p className="text-gray-600">Manage your posted opportunities</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Opportunity
            </button>
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
          ) : opportunities.length > 0 ? (
            <div className="space-y-4">
              {opportunities.map(opportunity => (
                <div key={opportunity._id} className="bg-white p-6 rounded-lg border">
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
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(opportunity.applicationDeadline).toLocaleDateString()}
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

    // Placeholder for other sections
    return (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg border">
          <h2 className="text-lg font-medium text-gray-900 mb-4">{navigationItems.find(item => item.id === activeItem)?.label}</h2>
          <p className="text-gray-600">This section is under development. Coming soon!</p>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <div className="w-64 flex-shrink-0">
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

          {/* Main Content */}
          <div className="flex-1">
            {renderMainContent()}
          </div>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {(showCreateModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleFormChange}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type *</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleFormChange}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Type</option>
                    <option value="job">Full-time Job</option>
                    <option value="internship">Internship</option>
                    <option value="scholarship">Scholarship</option>
                    <option value="mentorship">Mentorship</option>
                    <option value="funding">Funding/Grant</option>
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location *</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleFormChange}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Salary Information */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Min Salary</label>
                  <input
                    type="number"
                    name="salary.min"
                    value={formData.salary.min}
                    onChange={handleFormChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Max Salary</label>
                  <input
                    type="number"
                    name="salary.max"
                    value={formData.salary.max}
                    onChange={handleFormChange}
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

              {/* Requirements */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Required Skills (comma-separated)</label>
                <input
                  type="text"
                  name="requirements.skills"
                  value={Array.isArray(formData.requirements.skills) ? formData.requirements.skills.join(', ') : formData.requirements.skills}
                  onChange={handleFormChange}
                  placeholder="JavaScript, React, Node.js"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Experience Level</label>
                  <input
                    type="text"
                    name="requirements.experience"
                    value={formData.requirements.experience}
                    onChange={handleFormChange}
                    placeholder="e.g., 2+ years"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Education</label>
                  <input
                    type="text"
                    name="requirements.education"
                    value={formData.requirements.education}
                    onChange={handleFormChange}
                    placeholder="e.g., Bachelor's degree"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

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

              {/* Benefits */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Benefits (comma-separated)</label>
                <input
                  type="text"
                  name="benefits"
                  value={Array.isArray(formData.benefits) ? formData.benefits.join(', ') : formData.benefits}
                  onChange={handleFormChange}
                  placeholder="Health insurance, Remote work, Flexible hours"
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
    </div>
  );
};

export default ProviderDashboard; 
import React, { useState, useMemo, useCallback } from 'react';
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
  MapPin
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
    refetch: refetchOpportunities
  } = useOpportunities({ provider: user?._id });

  const { 
    interviews, 
    loading: interviewsLoading, 
    error: interviewsError 
  } = useInterviews('provider');

  const { 
    profiles, 
    loading: profilesLoading, 
    error: profilesError 
  } = useProfiles();

  const { notifications } = useNotifications();
  const { messages } = useMessages();

  // Modal state
  const [modalType, setModalType] = useState(null); // 'create' | 'edit' | 'view' | null
  const [selectedOpportunity, setSelectedOpportunity] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    location: '',
    type: '',
    isActive: true,
  });
  const [formError, setFormError] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

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
    { id: 'opportunities', label: 'My Opportunities', icon: FileText },
    { id: 'applications', label: 'Applications', icon: FileText },
    { id: 'communications', label: 'Communications', icon: MessageCircle },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'interviews', label: 'Interview Manager', icon: Calendar },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'support', label: 'Help & Support', icon: HelpCircle }
  ], []);

  // Subitems for each main category
  const subItems = useMemo(() => ({
    talent: [
      { label: 'Search Talent', icon: Search },
      { label: 'Students', icon: Award },
      { label: 'Job Seekers', icon: Briefcase },
      { label: 'Undocumented Talent', icon: UserCheck },
      { label: 'Favorite Profiles', icon: Star }
    ],
    opportunities: [
      { label: 'Create New', icon: Plus },
      { label: 'Manage Posts', icon: Edit },
      { label: 'My Scholarships', icon: Award },
      { label: 'My Job Posts', icon: Briefcase },
      { label: 'My Mentorships', icon: Users },
      { label: 'My Funding', icon: DollarSign }
    ],
    applications: [
      { label: 'All Applications', icon: FileText },
      { label: 'Pending Review', icon: Clock },
      { label: 'Shortlisted', icon: UserCheck },
      { label: 'Interview Scheduled', icon: Calendar }
    ]
  }), []);

  // Sidebar rendering (no dropdowns)
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

  // Main content area: show subitems for selected category
  const renderMainContent = () => {
    if (activeItem === 'overview') {
      // Calculate real statistics with memoization
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

          {/* Loading State */}
          {(opportunitiesLoading || interviewsLoading || profilesLoading) && (
            <div className="space-y-4">
              <div className="animate-pulse">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="bg-gray-200 p-4 rounded-lg h-20"></div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Real Data Display - Only show when not loading and no errors */}
          {!opportunitiesLoading && !interviewsLoading && !profilesLoading && 
           !opportunitiesError && !interviewsError && !profilesError && (
            <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-900">Active Opportunities</h3>
                  <p className="text-2xl font-bold text-blue-600 mt-2">{stats.activeOpportunities}</p>
              </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-medium text-green-900">Total Applications</h3>
                  <p className="text-2xl font-bold text-green-600 mt-2">{stats.totalApplications}</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="font-medium text-purple-900">Pending Interviews</h3>
                  <p className="text-2xl font-bold text-purple-600 mt-2">{stats.pendingInterviews}</p>
          </div>
            <div className="bg-orange-50 p-4 rounded-lg">
                  <h3 className="font-medium text-orange-900">Completed Interviews</h3>
                  <p className="text-2xl font-bold text-orange-600 mt-2">{stats.successfulPlacements}</p>
        </div>
          </div>
              
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                  <h3 className="font-medium text-gray-900 mb-3">Recent Opportunities</h3>
              <div className="space-y-2">
                    {opportunities.slice(0, 3).map((opportunity) => (
                      <div key={opportunity._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                          <p className="font-medium text-sm">{opportunity.title}</p>
                          <p className="text-xs text-gray-500">
                            {opportunity.currentApplicants || 0} applications • {opportunity.type}
                          </p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded ${
                          opportunity.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {opportunity.isActive ? 'Active' : 'Inactive'}
                        </span>
                    </div>
                    ))}
                    {opportunities.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <FileText className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                        <p>No opportunities created yet</p>
                    </div>
                    )}
                  </div>
                    </div>
                
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Recent Interviews</h3>
                  <div className="space-y-2">
                    {interviews.slice(0, 3).map((interview) => (
                      <div key={interview._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-sm">
                            {interview.talentId?.firstName} {interview.talentId?.lastName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {interview.title} • {interview.status}
                          </p>
                        </div>
                        <Calendar className="h-4 w-4 text-gray-400" />
                      </div>
                    ))}
                    {interviews.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <MessageCircle className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                        <p>No interviews scheduled yet</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      );
    }
    if (activeItem === 'opportunities') {
      return (
        <div className="space-y-6">
          {/* Error Display */}
          {opportunitiesError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                <p className="text-red-800 text-sm">{opportunitiesError}</p>
              </div>
            </div>
          )}
          {/* Interview Error Display */}
          {interviewsError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                <p className="text-red-800 text-sm">Interview Error: {interviewsError}</p>
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
                <h3 className="text-lg font-semibold text-gray-900">My Opportunities</h3>
                <button
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  onClick={openCreateModal}
                >
                  <Plus className="h-4 w-4 inline mr-2" />
                  Create New
                </button>
              </div>

              {opportunities.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {opportunities.map((opportunity) => (
                    <div key={opportunity._id} className="bg-white rounded-lg shadow border border-gray-200 p-6">
                      <div className="flex justify-between items-start mb-4">
                  <div>
                          <h4 className="font-semibold text-gray-900 mb-1">{opportunity.title}</h4>
                          <p className="text-sm text-gray-600">{opportunity.category}</p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          opportunity.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {opportunity.isActive ? 'Active' : 'Inactive'}
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
                          {opportunity.type}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Users className="h-4 w-4 mr-2" />
                          {opportunity.currentApplicants || 0} applications
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <button
                          className="flex-1 bg-blue-50 text-blue-700 px-3 py-2 rounded text-sm hover:bg-blue-100 transition-colors"
                          onClick={() => openViewModal(opportunity)}
                        >
                          <Eye className="h-4 w-4 inline mr-1" />
                          View
                        </button>
                        <button
                          className="flex-1 bg-gray-50 text-gray-700 px-3 py-2 rounded text-sm hover:bg-gray-100 transition-colors"
                          onClick={() => openEditModal(opportunity)}
                        >
                          <Edit className="h-4 w-4 inline mr-1" />
                          Edit
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No opportunities yet</h3>
                  <p className="text-gray-600 mb-6">Create your first opportunity to start connecting with talented refugees</p>
                  <button
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                    onClick={openCreateModal}
                  >
                    <Plus className="h-4 w-4 inline mr-2" />
                    Create Your First Opportunity
                  </button>
                </div>
              )}
            </>
          )}

          {/* Modal Overlay */}
          {modalType && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
              <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-lg relative">
                <button
                  className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                  onClick={closeModal}
                  aria-label="Close"
                >
                  &times;
                </button>
                {modalType === 'create' && (
                  <>
                    <h3 className="text-xl font-bold mb-4">Create Opportunity</h3>
                    <form onSubmit={handleFormSubmit} className="space-y-4">
                      <input
                        className="w-full border rounded px-3 py-2"
                        name="title"
                        placeholder="Title"
                        value={formData.title}
                        onChange={handleFormChange}
                        required
                      />
                      <textarea
                        className="w-full border rounded px-3 py-2"
                        name="description"
                        placeholder="Description"
                        value={formData.description}
                        onChange={handleFormChange}
                        required
                      />
                      <input
                        className="w-full border rounded px-3 py-2"
                        name="category"
                        placeholder="Category"
                        value={formData.category}
                        onChange={handleFormChange}
                      />
                      <input
                        className="w-full border rounded px-3 py-2"
                        name="location"
                        placeholder="Location"
                        value={formData.location}
                        onChange={handleFormChange}
                      />
                      <input
                        className="w-full border rounded px-3 py-2"
                        name="type"
                        placeholder="Type (e.g. Job, Scholarship)"
                        value={formData.type}
                        onChange={handleFormChange}
                      />
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          name="isActive"
                          checked={formData.isActive}
                          onChange={handleFormChange}
                          className="mr-2"
                        />
                        Active
                      </label>
                      {formError && <div className="text-red-600 text-sm">{formError}</div>}
                      <button
                        type="submit"
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                        disabled={formLoading}
                      >
                        {formLoading ? 'Creating...' : 'Create'}
                      </button>
                    </form>
                  </>
                )}
                {modalType === 'edit' && (
                  <>
                    <h3 className="text-xl font-bold mb-4">Edit Opportunity</h3>
                    <form onSubmit={handleFormSubmit} className="space-y-4">
                      <input
                        className="w-full border rounded px-3 py-2"
                        name="title"
                        placeholder="Title"
                        value={formData.title}
                        onChange={handleFormChange}
                        required
                      />
                      <textarea
                        className="w-full border rounded px-3 py-2"
                        name="description"
                        placeholder="Description"
                        value={formData.description}
                        onChange={handleFormChange}
                        required
                      />
                      <input
                        className="w-full border rounded px-3 py-2"
                        name="category"
                        placeholder="Category"
                        value={formData.category}
                        onChange={handleFormChange}
                      />
                      <input
                        className="w-full border rounded px-3 py-2"
                        name="location"
                        placeholder="Location"
                        value={formData.location}
                        onChange={handleFormChange}
                      />
                      <input
                        className="w-full border rounded px-3 py-2"
                        name="type"
                        placeholder="Type (e.g. Job, Scholarship)"
                        value={formData.type}
                        onChange={handleFormChange}
                      />
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          name="isActive"
                          checked={formData.isActive}
                          onChange={handleFormChange}
                          className="mr-2"
                        />
                        Active
                      </label>
                      {formError && <div className="text-red-600 text-sm">{formError}</div>}
                      <button
                        type="submit"
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                        disabled={formLoading}
                      >
                        {formLoading ? 'Saving...' : 'Save Changes'}
                      </button>
                    </form>
                  </>
                )}
                {modalType === 'view' && selectedOpportunity && (
                  <>
                    <h3 className="text-xl font-bold mb-4">Opportunity Details</h3>
                    <div className="space-y-2">
                      <div><span className="font-semibold">Title:</span> {selectedOpportunity.title}</div>
                      <div><span className="font-semibold">Description:</span> {selectedOpportunity.description}</div>
                      <div><span className="font-semibold">Category:</span> {selectedOpportunity.category}</div>
                      <div><span className="font-semibold">Location:</span> {selectedOpportunity.location}</div>
                      <div><span className="font-semibold">Type:</span> {selectedOpportunity.type}</div>
                      <div><span className="font-semibold">Status:</span> {selectedOpportunity.isActive ? 'Active' : 'Inactive'}</div>
                      <div><span className="font-semibold">Applicants:</span> {selectedOpportunity.currentApplicants || 0}</div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      );
    }

    if (activeItem === 'communications') {
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

          {/* Real Interviews Display */}
          {!interviewsLoading && (
            <>
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Interview Communications</h3>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  <MessageCircle className="h-4 w-4 inline mr-2" />
                  Send Invite
                </button>
              </div>

              {interviews.length > 0 ? (
                <div className="space-y-4">
                  {interviews.map((interview) => (
                    <div key={interview._id} className="bg-white rounded-lg shadow border border-gray-200 p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-1">
                            {interview.talentId?.firstName} {interview.talentId?.lastName}
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
                          <button className="bg-blue-50 text-blue-700 px-3 py-2 rounded text-sm hover:bg-blue-100 transition-colors">
                            <MessageCircle className="h-4 w-4 inline mr-1" />
                            Message
                          </button>
                          <button className="bg-gray-50 text-gray-700 px-3 py-2 rounded text-sm hover:bg-gray-100 transition-colors">
                            <Eye className="h-4 w-4 inline mr-1" />
                            View
                          </button>
            </div>
          </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <MessageCircle className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No communications yet</h3>
                  <p className="text-gray-600 mb-6">Start connecting with talented refugees by sending interview invitations</p>
                  <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
                    <MessageCircle className="h-4 w-4 inline mr-2" />
                    Send Your First Invite
                  </button>
                </div>
              )}
            </>
          )}
          </div>
      );
    }

    if (subItems[activeItem]) {
      return (
        <div className="flex flex-row flex-wrap gap-4">
          {subItems[activeItem].map((sub, idx) => (
            <div key={idx} className="flex items-center p-4 bg-white rounded-lg shadow border border-gray-100 min-w-[220px]">
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

  // Modal handlers
  const openCreateModal = () => {
    setFormData({
      title: '',
      description: '',
      category: '',
      location: '',
      type: '',
      isActive: true,
    });
    setFormError(null);
    setModalType('create');
    setSelectedOpportunity(null);
  };

  const openEditModal = (opportunity) => {
    setFormData({
      title: opportunity.title || '',
      description: opportunity.description || '',
      category: opportunity.category || '',
      location: opportunity.location || '',
      type: opportunity.type || '',
      isActive: opportunity.isActive,
    });
    setFormError(null);
    setModalType('edit');
    setSelectedOpportunity(opportunity);
  };

  const openViewModal = (opportunity) => {
    setSelectedOpportunity(opportunity);
    setModalType('view');
  };

  const closeModal = () => {
    setModalType(null);
    setSelectedOpportunity(null);
    setFormError(null);
    setFormLoading(false);
  };

  // Form handlers
  const handleFormChange = (e) => {
    const { name, value, type: inputType, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: inputType === 'checkbox' ? checked : value,
    }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);
    try {
      if (modalType === 'create') {
        await createOpportunity(formData);
      } else if (modalType === 'edit' && selectedOpportunity) {
        await updateOpportunity(selectedOpportunity._id, formData);
      }
      closeModal();
      refetchOpportunities();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save opportunity');
    } finally {
      setFormLoading(false);
    }
  };

  // Defensive loading state (must be after all hooks)
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading user...</div>;
  if (!user) return <div className="min-h-screen flex items-center justify-center text-red-600">User not found. Please log in again.</div>;

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

        {/* Logout Button */}
        <button
          onClick={() => { logout(); navigate('/'); }}
          className="w-full flex items-center justify-between px-3 py-2 text-left text-sm rounded-lg transition-colors text-gray-700 hover:bg-gray-100 mt-4 border-t border-gray-200"
        >
          <span className="flex items-center">
            <LogOut className="h-5 w-5 mr-3 text-gray-500" />
            Logout
          </span>
        </button>
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
              {renderMainContent()}
            </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderDashboard; 
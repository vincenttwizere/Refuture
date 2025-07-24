import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  MapPin, 
  Briefcase, 
  Clock, 
  Calendar,
  DollarSign,
  Globe,
  Mail,
  Phone,
  ExternalLink,
  BookOpen,
  Bookmark,
  AlertCircle,
  CheckCircle,
  X
} from 'lucide-react';
import { useOpportunity } from '../../hooks/useOpportunities';
import { useAuth } from '../../contexts/AuthContext';
import { applicationsAPI } from '../../services/api';

const OpportunityDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { opportunity, loading, error } = useOpportunity(id);
  const { user } = useAuth();
  
  const [applyLoading, setApplyLoading] = useState(false);
  const [applyError, setApplyError] = useState(null);
  const [applySuccess, setApplySuccess] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  // Check if user has already applied for this opportunity
  const checkIfApplied = async () => {
    if (!id || !user) return;
    
    try {
      const response = await applicationsAPI.getUserApplications();
      const userApplications = response.data.applications || [];
      const hasAppliedForThis = userApplications.some(app => app.opportunityId === id);
      setHasApplied(hasAppliedForThis);
    } catch (error) {
      console.error('Error checking if user has applied:', error);
    }
  };

  // Check if user has applied when component loads
  useEffect(() => {
    if (opportunity && user) {
      checkIfApplied();
    }
  }, [opportunity, user]);

  const handleApply = async () => {
    if (!id) return;
    
    setApplyLoading(true);
    setApplyError(null);
    setApplySuccess(false);

    try {
      // Get user info from AuthContext
      if (!user) {
        throw new Error('User not logged in');
      }

      // Check if user has authentication token
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found. Please log in again.');
      }

      // Validate opportunity ID format (basic MongoDB ObjectId check)
      if (!id || typeof id !== 'string' || id.length !== 24) {
        throw new Error('Invalid opportunity ID format');
      }

      // Check if opportunity exists
      if (!opportunity) {
        throw new Error('Opportunity not found. Please refresh the page and try again.');
      }

      // Check if opportunity is active
      if (opportunity.isActive === false) {
        throw new Error('This opportunity is no longer active and cannot accept applications.');
      }

      // Check if user has a profile (this is required by the backend)
      // We'll let the backend handle this validation, but we can show a better error message
      console.log('Checking if user has profile...');


      // Create application data
      const applicationData = {
        opportunity: id,
        coverLetter: coverLetter.trim() || undefined
      };

      console.log('Applying for opportunity:', applicationData);
      console.log('Opportunity ID:', id);
      console.log('Opportunity ID type:', typeof id);
      console.log('User data:', { id: user._id, role: user.role });
      console.log('Opportunity data:', opportunity);

      // Check if backend is accessible
      try {
        const response = await fetch('http://localhost:5001/api/health');
        if (!response.ok) {
          throw new Error('Backend server is not responding properly');
        }
        console.log('Backend is accessible');
      } catch (healthError) {
        console.error('Backend health check failed:', healthError);
        throw new Error('Backend server is not accessible. Please try again later.');
      }

      // Check if user has a profile (this is likely the cause of the 500 error)
      try {
        const profileResponse = await fetch('http://localhost:5001/api/profiles/user', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (profileResponse.status === 404) {
          throw new Error('You must create a profile before applying for opportunities. Please complete your profile first.');
        } else if (!profileResponse.ok) {
          console.warn('Profile check failed:', profileResponse.status);
        } else {
          console.log('User has a profile');
        }
      } catch (profileError) {
        if (profileError.message.includes('create a profile')) {
          throw profileError;
        }
        console.warn('Profile check error:', profileError);
      }

      // Send application to backend using API service
      const response = await applicationsAPI.create(applicationData);
      console.log('API Response:', response);
      const result = response.data;
      console.log('Application submitted successfully:', result);
      setApplySuccess(true);
      setHasApplied(true);
      setShowApplyForm(false);
      setCoverLetter('');
      setShowSuccessToast(true);
      
      // Hide the toast after 5 seconds
      setTimeout(() => {
        setShowSuccessToast(false);
      }, 5000);
      
    } catch (err) {
      console.error('Error applying for opportunity:', err);
      console.error('Error details:', {
        message: err.message,
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        config: err.config
      });
      
      // Log the full error response for debugging
      if (err.response?.data) {
        console.error('Full backend error response:', JSON.stringify(err.response.data, null, 2));
      }
      
      // Try to get detailed error message from backend response
      let errorMessage = 'Failed to apply for opportunity';
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
        
        // Check for specific error messages and provide helpful guidance
        if (errorMessage.includes('profile') || errorMessage.includes('Profile')) {
          errorMessage = 'You must create a profile before applying for opportunities. Please complete your profile first.';
        } else if (errorMessage.includes('already applied')) {
          errorMessage = 'You have already applied for this opportunity.';
        } else if (errorMessage.includes('not active') || errorMessage.includes('no longer active')) {
          errorMessage = 'This opportunity is no longer accepting applications.';
        }
      } else if (err.response?.data?.errors && err.response.data.errors.length > 0) {
        errorMessage = err.response.data.errors.map(e => e.msg).join(', ');
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setApplyError(errorMessage);
    } finally {
      setApplyLoading(false);
    }
  };

  const formatSalary = (salary) => {
    if (!salary) return 'Not specified';
    if (salary.min && salary.max) {
      return `${salary.currency || 'USD'} ${salary.min} - ${salary.max}`;
    }
    if (salary.min) {
      return `${salary.currency || 'USD'} ${salary.min}+`;
    }
    if (salary.max) {
      return `${salary.currency || 'USD'} Up to ${salary.max}`;
    }
    return 'Not specified';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Helper function to get the display type
  const getDisplayType = (opportunity) => {
    const type = opportunity.jobType || opportunity.type;
    if (!type) return 'Unknown';
    return type.replace('_', ' ');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                <div className="h-4 bg-gray-200 rounded w-4/6"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
              <p className="text-red-800">{error}</p>
            </div>
            <button
              onClick={() => navigate('/refugee-dashboard')}
              className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!opportunity) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <p className="text-yellow-800">Opportunity not found</p>
            <button
              onClick={() => navigate('/refugee-dashboard')}
              className="mt-4 bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }



  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Success Banner - Show at the very top */}
        {applySuccess && (
          <div className="mb-6 bg-green-500 text-white p-4 rounded-lg shadow-lg">
            <div className="flex items-center justify-center">
              <CheckCircle className="h-6 w-6 mr-3" />
              <div className="text-center">
                <h2 className="text-xl font-bold">Application Submitted Successfully!</h2>
                <p className="text-green-100">Thank you for your application. The provider will review it and get back to you soon.</p>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => {
              let user = null;
              try {
                user = JSON.parse(localStorage.getItem('user'));
              } catch {}
              if (user?.role === 'admin') {
                navigate('/admin-dashboard');
              } else if (user?.role === 'provider') {
                navigate('/provider-dashboard');
              } else {
                navigate('/refugee-dashboard');
              }
            }}
            className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Dashboard
          </button>
          
          <div className="flex items-center space-x-3">
            {/* Apply Button - Only show for refugees */}
            {user?.role === 'refugee' && !hasApplied && !applySuccess && opportunity && (
              <button
                onClick={() => setShowApplyForm(true)}
                className="flex items-center px-6 py-2 rounded-lg transition-colors bg-blue-600 text-white hover:bg-blue-700"
              >
                <Briefcase className="h-4 w-4 mr-2" />
                Apply
              </button>
            )}
            
            {/* Applied Button - Show if already applied */}
            {user?.role === 'refugee' && (hasApplied || applySuccess) && (
              <button
                disabled
                className="flex items-center px-6 py-2 rounded-lg transition-colors bg-green-600 text-white cursor-not-allowed"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Applied
              </button>
            )}
          </div>
        </div>

        {/* Apply Success/Error Messages */}
        {(applySuccess || hasApplied) && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-400 mr-3" />
              <div>
                <h3 className="text-lg font-semibold text-green-800 mb-1">
                  {applySuccess 
                    ? 'Application Submitted Successfully!'
                    : 'Application Already Submitted'
                  }
                </h3>
                <p className="text-green-700">
                  {applySuccess 
                    ? 'Your application has been submitted successfully! The provider will review your application and get back to you soon.'
                    : 'You have already applied for this opportunity. The provider will review your application.'
                  }
                </p>
              </div>
            </div>
          </div>
        )}

        {applyError && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
              <p className="text-red-800">{applyError}</p>
            </div>
          </div>
        )}

        {/* Opportunity Details */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {/* Header Section */}
          <div className="bg-white p-6 border-b border-gray-200">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-2 text-gray-900">{opportunity.title || 'Untitled Opportunity'}</h1>
                <p className="text-gray-600 text-lg mb-4">{opportunity.company || opportunity.providerName || 'Company not specified'}</p>
                <div className="flex items-center space-x-4 text-gray-600">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2" />
                    {opportunity.location || 'Location not specified'}
                  </div>
                                                    <div className="flex items-center">
                    <Briefcase className="h-4 w-4 mr-2" />
                    {getDisplayType(opportunity)}
                  </div>
                  {opportunity.isRemote && (
                    <div className="flex items-center">
                      <Globe className="h-4 w-4 mr-2" />
                      Remote
                    </div>
                  )}
                </div>
              </div>
              <span className={`text-sm px-3 py-1 rounded-full ${
                (opportunity.jobType || opportunity.type) === 'internship' ? 'bg-yellow-500 text-white' :
                (opportunity.jobType || opportunity.type) === 'full_time' ? 'bg-blue-500 text-white' :
                (opportunity.jobType || opportunity.type) === 'part_time' ? 'bg-green-500 text-white' :
                (opportunity.jobType || opportunity.type) === 'contract' ? 'bg-purple-500 text-white' :
                (opportunity.jobType || opportunity.type) === 'volunteer' ? 'bg-orange-500 text-white' :
                (opportunity.jobType || opportunity.type) === 'scholarship' ? 'bg-green-500 text-white' :
                (opportunity.jobType || opportunity.type) === 'job' ? 'bg-blue-500 text-white' :
                (opportunity.jobType || opportunity.type) === 'mentorship' ? 'bg-purple-500 text-white' :
                (opportunity.jobType || opportunity.type) === 'funding' ? 'bg-orange-500 text-white' :
                'bg-gray-500 text-white'
              }`}>
                {getDisplayType(opportunity)}
              </span>
            </div>
          </div>

          {/* Content Section */}
          <div className="p-6">
            {/* Description */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Description</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {opportunity.description || 'No description available'}
              </p>
            </div>

            {/* Key Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Left Column */}
              <div className="space-y-4">
                <div className="flex items-center text-gray-700">
                  <DollarSign className="h-5 w-5 mr-3 text-gray-500" />
                  <div>
                    <span className="font-medium">Salary:</span>
                    <span className="ml-2">{opportunity.salary ? formatSalary(opportunity.salary) : 'Not specified'}</span>
                  </div>
                </div>

                <div className="flex items-center text-gray-700">
                  <Briefcase className="h-5 w-5 mr-3 text-gray-500" />
                  <div>
                    <span className="font-medium">Category:</span>
                    <span className="ml-2">{opportunity.category || 'Not specified'}</span>
                  </div>
                </div>

                <div className="flex items-center text-gray-700">
                  <Calendar className="h-5 w-5 mr-3 text-gray-500" />
                  <div>
                    <span className="font-medium">Start Date:</span>
                    <span className="ml-2">
                      {opportunity.startDate ? formatDate(opportunity.startDate) : 'Not specified'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <div className="flex items-center text-gray-700">
                  <Clock className="h-5 w-5 mr-3 text-gray-500" />
                  <div>
                    <span className="font-medium">Application Deadline:</span>
                    <span className="ml-2">{opportunity.applicationDeadline ? formatDate(opportunity.applicationDeadline) : 'Not specified'}</span>
                  </div>
                </div>

                {opportunity.tags && opportunity.tags.length > 0 && (
                  <div>
                    <span className="font-medium text-gray-700">Tags:</span>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {opportunity.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Requirements */}
            {(opportunity.requirements && opportunity.requirements.length > 0) || 
             (opportunity.skills && opportunity.skills.length > 0) || 
             (opportunity.languages && opportunity.languages.length > 0) ? (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Requirements</h2>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  {opportunity.requirements && opportunity.requirements.length > 0 && (
                    <div>
                      <span className="font-medium text-gray-700">Requirements:</span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {opportunity.requirements.map((requirement, index) => (
                          <span
                            key={index}
                            className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                          >
                            {requirement}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {opportunity.skills && opportunity.skills.length > 0 && (
                    <div>
                      <span className="font-medium text-gray-700">Skills:</span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {opportunity.skills.map((skill, index) => (
                          <span
                            key={index}
                            className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {opportunity.languages && opportunity.languages.length > 0 && (
                    <div>
                      <span className="font-medium text-gray-700">Languages:</span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {opportunity.languages.map((lang, index) => (
                          <span
                            key={index}
                            className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full"
                          >
                            {lang.language} ({lang.proficiency})
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : null}

            {/* Benefits */}
            {opportunity.benefits && opportunity.benefits.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Benefits</h2>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  {opportunity.benefits.map((benefit, index) => (
                    <li key={index}>{benefit}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Contact Information */}
            <div className="border-t pt-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {opportunity.contactEmail && (
                  <div className="flex items-center text-gray-700">
                    <Mail className="h-5 w-5 mr-3 text-gray-500" />
                    <a
                      href={`mailto:${opportunity.contactEmail}`}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      {opportunity.contactEmail}
                    </a>
                  </div>
                )}
                
                {opportunity.contactPhone && (
                  <div className="flex items-center text-gray-700">
                    <Phone className="h-5 w-5 mr-3 text-gray-500" />
                    <a
                      href={`tel:${opportunity.contactPhone}`}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      {opportunity.contactPhone}
                    </a>
                  </div>
                )}
                

              </div>
            </div>
          </div>
        </div>

        {/* Application Form Modal */}
        {showApplyForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Apply for Opportunity</h2>
                <button
                  onClick={() => {
                    setShowApplyForm(false);
                    setCoverLetter('');
                    setApplyError(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="mb-4">
                <h3 className="font-medium text-gray-900 mb-2">{opportunity.title || 'Untitled Opportunity'}</h3>
                <p className="text-gray-600 text-sm">{opportunity.company || opportunity.providerName || 'Company not specified'}</p>
              </div>

              <form onSubmit={(e) => {
                e.preventDefault();
                handleApply();
              }}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cover Letter (Optional)
                  </label>
                  <textarea
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    placeholder="Tell the provider why you're interested in this opportunity and why you'd be a great fit..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={6}
                    maxLength={2000}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {coverLetter.length}/2000 characters
                  </p>
                </div>

                {applyError && (
                  <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
                    <div className="flex items-center">
                      <AlertCircle className="h-4 w-4 text-red-400 mr-2" />
                      <p className="text-red-800 text-sm">{applyError}</p>
                    </div>
                  </div>
                )}

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowApplyForm(false);
                      setCoverLetter('');
                      setApplyError(null);
                    }}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={applyLoading}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {applyLoading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                        Applying...
                      </div>
                    ) : (
                      'Submit Application'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Success Toast Notification */}
      {showSuccessToast && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg z-50 animate-in slide-in-from-right duration-300">
          <div className="flex items-center">
            <CheckCircle className="h-6 w-6 mr-3" />
            <div>
              <h4 className="font-semibold">Application Submitted!</h4>
              <p className="text-sm opacity-90">Your application has been sent successfully.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OpportunityDetails; 
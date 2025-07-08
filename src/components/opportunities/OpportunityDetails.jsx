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
  CheckCircle
} from 'lucide-react';
import { useOpportunity } from '../../hooks/useOpportunities';
import { useSavedOpportunities } from '../../hooks/useSavedOpportunities';

const OpportunityDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { opportunity, loading, error } = useOpportunity(id);
  const { saveOpportunity, unsaveOpportunity, checkIfSaved } = useSavedOpportunities();
  
  const [isSaved, setIsSaved] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(null);

  // Check if opportunity is saved on component mount
  useEffect(() => {
    if (id) {
      checkIfSaved(id).then(setIsSaved);
    }
  }, [id, checkIfSaved]);

  const handleSaveToggle = async () => {
    if (!id) return;
    
    setSaveLoading(true);
    setSaveError(null);
    setSaveSuccess(null);

    try {
      if (isSaved) {
        await unsaveOpportunity(id);
        setIsSaved(false);
        setSaveSuccess('Opportunity removed from saved list');
      } else {
        await saveOpportunity(id);
        setIsSaved(true);
        setSaveSuccess('Opportunity saved successfully');
      }
    } catch (err) {
      setSaveError(err.message || 'Failed to update saved status');
    } finally {
      setSaveLoading(false);
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
          
          <button
            onClick={handleSaveToggle}
            disabled={saveLoading}
            className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
              isSaved
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            } disabled:opacity-50`}
          >
            {saveLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
            ) : isSaved ? (
              <Bookmark className="h-4 w-4 mr-2" />
            ) : (
              <BookOpen className="h-4 w-4 mr-2" />
            )}
            {saveLoading ? 'Saving...' : (isSaved ? 'Saved' : 'Save')}
          </button>
        </div>

        {/* Success/Error Messages */}
        {saveSuccess && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
              <p className="text-green-800">{saveSuccess}</p>
            </div>
          </div>
        )}

        {saveError && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
              <p className="text-red-800">{saveError}</p>
            </div>
          </div>
        )}

        {/* Opportunity Details */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {/* Header Section */}
          <div className="bg-white p-6 border-b border-gray-200">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-2 text-gray-900">{opportunity.title}</h1>
                <p className="text-gray-600 text-lg mb-4">{opportunity.providerName}</p>
                <div className="flex items-center space-x-4 text-gray-600">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2" />
                    {opportunity.location}
                  </div>
                  <div className="flex items-center">
                    <Briefcase className="h-4 w-4 mr-2" />
                    {opportunity.type}
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
                opportunity.type === 'scholarship' ? 'bg-green-500 text-white' :
                opportunity.type === 'job' ? 'bg-blue-500 text-white' :
                opportunity.type === 'mentorship' ? 'bg-purple-500 text-white' :
                opportunity.type === 'internship' ? 'bg-yellow-500 text-white' :
                opportunity.type === 'funding' ? 'bg-orange-500 text-white' :
                'bg-gray-500 text-white'
              }`}>
                {opportunity.type}
              </span>
            </div>
          </div>

          {/* Content Section */}
          <div className="p-6">
            {/* Description */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Description</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {opportunity.description}
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
                    <span className="ml-2">{formatSalary(opportunity.salary)}</span>
                  </div>
                </div>

                <div className="flex items-center text-gray-700">
                  <Briefcase className="h-5 w-5 mr-3 text-gray-500" />
                  <div>
                    <span className="font-medium">Category:</span>
                    <span className="ml-2">{opportunity.category}</span>
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

                {opportunity.duration && (
                  <div className="flex items-center text-gray-700">
                    <Clock className="h-5 w-5 mr-3 text-gray-500" />
                    <div>
                      <span className="font-medium">Duration:</span>
                      <span className="ml-2">{opportunity.duration}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <div className="flex items-center text-gray-700">
                  <Clock className="h-5 w-5 mr-3 text-gray-500" />
                  <div>
                    <span className="font-medium">Application Deadline:</span>
                    <span className="ml-2">{formatDate(opportunity.applicationDeadline)}</span>
                  </div>
                </div>

                {opportunity.maxApplicants && (
                  <div className="flex items-center text-gray-700">
                    <Briefcase className="h-5 w-5 mr-3 text-gray-500" />
                    <div>
                      <span className="font-medium">Max Applicants:</span>
                      <span className="ml-2">{opportunity.maxApplicants}</span>
                    </div>
                  </div>
                )}

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
            {opportunity.requirements && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Requirements</h2>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  {opportunity.requirements.skills && opportunity.requirements.skills.length > 0 && (
                    <div>
                      <span className="font-medium text-gray-700">Skills:</span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {opportunity.requirements.skills.map((skill, index) => (
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
                  
                  {opportunity.requirements.experience && (
                    <div>
                      <span className="font-medium text-gray-700">Experience:</span>
                      <span className="ml-2 text-gray-600">{opportunity.requirements.experience}</span>
                    </div>
                  )}
                  
                  {opportunity.requirements.education && (
                    <div>
                      <span className="font-medium text-gray-700">Education:</span>
                      <span className="ml-2 text-gray-600">{opportunity.requirements.education}</span>
                    </div>
                  )}
                  
                  {opportunity.requirements.languages && opportunity.requirements.languages.length > 0 && (
                    <div>
                      <span className="font-medium text-gray-700">Languages:</span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {opportunity.requirements.languages.map((language, index) => (
                          <span
                            key={index}
                            className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full"
                          >
                            {language}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

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
                
                {opportunity.website && (
                  <div className="flex items-center text-gray-700">
                    <ExternalLink className="h-5 w-5 mr-3 text-gray-500" />
                    <a
                      href={opportunity.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Visit Website
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OpportunityDetails; 
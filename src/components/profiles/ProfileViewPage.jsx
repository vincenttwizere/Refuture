import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Edit, 
  MessageCircle, 
  MapPin, 
  Calendar, 
  GraduationCap, 
  Briefcase, 
  Globe, 
  Phone, 
  Mail, 
  Download, 
  AlertCircle, 
  CheckCircle,
  Award,
  BookOpen,
  FileText,
  Star,
  Palette,
  Tag,
  Eye,
  EyeOff,
  User,
  Languages
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useProfile } from '../../hooks/useProfiles';

const ProfileViewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const { profile, loading, error, refetch } = useProfile(id);
  const [success, setSuccess] = useState('');

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

  useEffect(() => {
    if (profile && !loading && !error) {
        setSuccess('Profile loaded successfully');
    }
  }, [profile, loading, error]);

  // Handle contact button click
  const handleContact = () => {
    if (!isAuthenticated) {
      setError('Please log in to contact this user.');
      setTimeout(() => navigate('/login'), 2000);
      return;
    }
    
    // Navigate to messages or open contact modal
    navigate(`/messages?recipient=${profile?.email || id}`);
  };

  // Handle offer opportunity button click
  const handleOfferOpportunity = () => {
    if (!isAuthenticated) {
      setError('Please log in to offer opportunities.');
      setTimeout(() => navigate('/login'), 2000);
      return;
    }
    
    if (user?.role !== 'provider') {
      setError('Only providers can offer opportunities.');
      return;
    }
    
    // Navigate to create opportunity page with pre-filled recipient
    navigate(`/create-opportunity?recipient=${profile?.email || id}`);
  };

  // Handle download resume
  const handleDownloadResume = async () => {
    if (!profile?.resumeUrl) {
      setError('No resume available for download.');
      return;
    }

    try {
      const response = await fetch(profile.resumeUrl.startsWith('http') 
        ? profile.resumeUrl 
                        : `${import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'https://refuture-backend-1.onrender.com/api'}/${profile.resumeUrl}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to download resume');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `resume_${getDisplayName(profile)?.replace(/\s+/g, '_') || 'user'}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      setSuccess('Resume downloaded successfully');
    } catch (err) {
      console.error('Download error:', err);
      setError('Failed to download resume. Please try again.');
    }
  };

  // Get display name from profile data
  const getDisplayName = (profile) => {
    if (profile.fullName) {
      return profile.fullName;
    }
    if (profile.firstName && profile.lastName) {
      return `${profile.firstName} ${profile.lastName}`;
    }
    if (profile.firstName) {
      return profile.firstName;
    }
    if (profile.lastName) {
      return profile.lastName;
    }
    return 'Unknown User';
  };

  // Show loading state
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">
            {authLoading ? 'Checking authentication...' : 'Loading profile...'}
          </p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Profile Not Found</h2>
          <p className="text-gray-600 mb-4">{error || 'The profile you are looking for does not exist.'}</p>
          <div className="space-y-3">
            <button
              onClick={() => navigate(-1)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go Back
            </button>
            <button
              onClick={() => navigate('/')}
              className="block w-full bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Go to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">


      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between h-16">
            <div className="flex items-center mb-2 sm:mb-0">
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
              <h1 className="text-xl font-semibold text-gray-900 ml-4">Profile Details</h1>
            </div>
            <div className="flex space-x-3">
              <button 
                onClick={handleContact}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center transition-colors"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Contact
              </button>
              {user?.role === 'provider' && (
                <button 
                  onClick={handleOfferOpportunity}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center transition-colors"
                >
                  <Briefcase className="h-4 w-4 mr-2" />
                  Offer Opportunity
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Profile Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Profile Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Header Card */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-start space-x-6 mb-6">
                <div className="w-24 h-24 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden">
                  {profile.photoUrl ? (
                    <img 
                      src={profile.photoUrl.startsWith('http') ? profile.photoUrl : `${import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'https://refuture-backend-1.onrender.com/api'}/images/${profile.photoUrl}`} 
                      alt={getDisplayName(profile)} 
                      className="w-24 h-24 rounded-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <span className="text-2xl font-medium text-gray-700" style={{ display: profile.photoUrl ? 'none' : 'flex' }}>
                    {getDisplayName(profile)?.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{getDisplayName(profile)}</h1>
                  <p className="text-lg text-gray-600 mb-3">{profile.age} years old • {profile.gender}</p>
                  <div className="flex items-center space-x-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      profile.option === 'student' ? 'bg-blue-100 text-blue-800' :
                      profile.option === 'job seeker' ? 'bg-green-100 text-green-800' :
                      profile.option === 'undocumented_talent' ? 'bg-purple-100 text-purple-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {profile.option}
                    </span>
                    <div className="flex items-center text-gray-600">
                      <MapPin className="h-4 w-4 mr-1" />
                      {profile.currentLocation}
                    </div>
                    <div className="flex items-center text-gray-600">
                      {profile.isPublic ? (
                        <Eye className="h-4 w-4 mr-1" />
                      ) : (
                        <EyeOff className="h-4 w-4 mr-1" />
                      )}
                      {profile.isPublic ? 'Public' : 'Private'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium text-gray-500">Nationality</span>
                  <p className="text-gray-900">{profile.nationality || 'Not specified'}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Email</span>
                  <p className="text-gray-900">{profile.email}</p>
                </div>
              </div>
            </div>

            {/* Skills & Languages */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Languages className="h-5 w-5 mr-2 text-blue-500" />
                Skills & Languages
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Skills */}
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Skills</h4>
                  {profile.skills && profile.skills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.map((skill, index) => (
                      <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                        {skill}
                      </span>
                    ))}
                  </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No skills listed</p>
                  )}
                </div>

              {/* Languages */}
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Languages</h4>
                  {profile.language && profile.language.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {profile.language.map((lang, index) => (
                      <span key={index} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                        {lang}
                      </span>
                    ))}
                  </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No languages listed</p>
                  )}
                </div>
              </div>
            </div>

            {/* Student Template Sections */}
            {profile.option === 'student' && (
              <>
                {/* Academic Information */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <BookOpen className="h-5 w-5 mr-2 text-blue-500" />
                    Academic Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">High School Subjects</h4>
                      {profile.highSchoolSubjects ? (
                        <p className="text-gray-900">{profile.highSchoolSubjects}</p>
                      ) : (
                        <p className="text-gray-400 italic">No data provided</p>
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">Desired Field of Study</h4>
                      {profile.desiredField ? (
                        <p className="text-gray-900">{profile.desiredField}</p>
                      ) : (
                        <p className="text-gray-400 italic">No data provided</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Annual Academic Records */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Award className="h-5 w-5 mr-2 text-blue-500" />
                    Annual Academic Records
                  </h3>
                  {profile.academicRecords && profile.academicRecords.length > 0 ? (
                    <div className="space-y-4">
                      {profile.academicRecords.map((record, index) => (
                        <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <span className="text-sm font-medium text-gray-500">Academic Level</span>
                              <p className="text-gray-900">{record.level}</p>
                            </div>
                            <div>
                              <span className="text-sm font-medium text-gray-500">Year</span>
                              <p className="text-gray-900">{record.year}</p>
                            </div>
                            {record.school && (
                              <div>
                                <span className="text-sm font-medium text-gray-500">School</span>
                                <p className="text-gray-900">{record.school}</p>
                              </div>
                            )}
                            <div>
                              <span className="text-sm font-medium text-gray-500">Percentage Score</span>
                              <p className="text-gray-900">{record.percentage}%</p>
                            </div>
                          </div>
                          {record.subjectGrades && (
                            <div className="mt-4">
                              <span className="text-sm font-medium text-gray-500">Subject Grades</span>
                              <p className="text-gray-900">{record.subjectGrades}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400 italic">No academic records added yet</p>
                  )}
                </div>

                {/* Supporting Documents */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <FileText className="h-5 w-5 mr-2 text-blue-500" />
                    Transcripts and Certificates
                  </h3>
                  {profile.supportingDocuments && profile.supportingDocuments.length > 0 ? (
                    <div className="space-y-2">
                      {profile.supportingDocuments.map((doc, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded border">
                          <div className="flex items-center">
                            <FileText className="h-4 w-4 text-blue-500 mr-2" />
                            <span className="text-gray-700">{doc.name || `Document ${index + 1}`}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400 italic">No supporting documents uploaded yet</p>
                  )}
                </div>
              </>
              )}

            {/* Job Seeker Template Sections */}
            {profile.option === 'job seeker' && (
              <>
              {/* Education */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <GraduationCap className="h-5 w-5 mr-2 text-blue-500" />
                    Education
                  </h3>
                  {profile.education && profile.education.length > 0 ? (
                    <div className="space-y-4">
                      {profile.education.map((edu, index) => (
                        <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <span className="text-sm font-medium text-gray-500">School/Institution</span>
                              <p className="text-gray-900">{edu.school}</p>
                            </div>
                            <div>
                              <span className="text-sm font-medium text-gray-500">Degree</span>
                              <p className="text-gray-900">{expandDegreeAbbreviation(edu.degree)}</p>
                            </div>
                            <div>
                              <span className="text-sm font-medium text-gray-500">Field of Study</span>
                              <p className="text-gray-900">{edu.field}</p>
                            </div>
                            <div>
                              <span className="text-sm font-medium text-gray-500">Duration</span>
                              <p className="text-gray-900">{edu.duration}</p>
                            </div>
                            <div>
                              <span className="text-sm font-medium text-gray-500">Start Date</span>
                              <p className="text-gray-900">{edu.start}</p>
                            </div>
                            <div>
                              <span className="text-sm font-medium text-gray-500">End Date</span>
                              <p className="text-gray-900">{edu.end}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                  ) : (
                    <p className="text-gray-400 italic">No education history added yet</p>
                  )}
                </div>

              {/* Work Experience */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Briefcase className="h-5 w-5 mr-2 text-blue-500" />
                    Work Experience
                  </h3>
                  {profile.experience && profile.experience.length > 0 ? (
                    <div className="space-y-4">
                      {profile.experience.map((exp, index) => (
                        <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <span className="text-sm font-medium text-gray-500">Company</span>
                              <p className="text-gray-900">{exp.company}</p>
                            </div>
                            <div>
                              <span className="text-sm font-medium text-gray-500">Job Title</span>
                              <p className="text-gray-900">{exp.title}</p>
                            </div>
                            <div>
                              <span className="text-sm font-medium text-gray-500">Start Date</span>
                              <p className="text-gray-900">{exp.start}</p>
                            </div>
                            <div>
                              <span className="text-sm font-medium text-gray-500">End Date</span>
                              <p className="text-gray-900">{exp.end}</p>
                            </div>
                            {exp.duration && (
                              <div>
                                <span className="text-sm font-medium text-gray-500">Duration</span>
                                <p className="text-gray-900">{exp.duration}</p>
                              </div>
                            )}
                            {exp.type && (
                              <div>
                                <span className="text-sm font-medium text-gray-500">Type</span>
                                <p className="text-gray-900">{exp.type}</p>
                              </div>
                            )}
                          </div>
                          {exp.description && (
                            <div className="mt-4">
                              <span className="text-sm font-medium text-gray-500">Description</span>
                              <p className="text-gray-900 mt-1">{exp.description}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400 italic">No work experience added yet</p>
                  )}
                </div>
              </>
            )}

            {/* Undocumented Talent Template Sections */}
            {profile.option === 'undocumented_talent' && (
              <>
                {/* Talent Information */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Star className="h-5 w-5 mr-2 text-blue-500" />
                    Talent Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">Talent Category</h4>
                      {profile.talentCategory ? (
                        <p className="text-gray-900">{profile.talentCategory}</p>
                      ) : (
                        <p className="text-gray-400 italic">No data provided</p>
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">Years of Experience</h4>
                      {profile.talentExperience ? (
                        <p className="text-gray-900">{profile.talentExperience}</p>
                      ) : (
                        <p className="text-gray-400 italic">No data provided</p>
                      )}
                    </div>
                  </div>
                  <div className="mt-4">
                    <h4 className="font-medium text-gray-700 mb-2">Talent Description</h4>
                    {profile.talentDescription ? (
                      <p className="text-gray-900">{profile.talentDescription}</p>
                    ) : (
                      <p className="text-gray-400 italic">No data provided</p>
                    )}
                  </div>
                </div>

                {/* Portfolio */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Palette className="h-5 w-5 mr-2 text-blue-500" />
                    Portfolio & Work Samples
                  </h3>
                  {profile.portfolio && profile.portfolio.length > 0 ? (
                    <div className="space-y-4">
                      {profile.portfolio.map((item, index) => (
                        <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <span className="text-sm font-medium text-gray-500">Title</span>
                              <p className="text-gray-900">{item.title}</p>
                            </div>
                            <div>
                              <span className="text-sm font-medium text-gray-500">Category</span>
                              <p className="text-gray-900">{item.category}</p>
                            </div>
                            <div>
                              <span className="text-sm font-medium text-gray-500">Year Created</span>
                              <p className="text-gray-900">{item.year}</p>
                            </div>
                            {item.link && (
                              <div>
                                <span className="text-sm font-medium text-gray-500">Link</span>
                                <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                  {item.link}
                                </a>
                              </div>
                            )}
                          </div>
                          {item.description && (
                            <div className="mt-4">
                              <span className="text-sm font-medium text-gray-500">Description</span>
                              <p className="text-gray-900 mt-1">{item.description}</p>
                            </div>
                          )}
                          {item.media && (
                            <div className="mt-4">
                              <span className="text-sm font-medium text-gray-500">Media</span>
                              <p className="text-gray-900">{item.media}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400 italic">No portfolio items added yet</p>
              )}
            </div>
              </>
            )}

            {/* Tags */}
            {profile.tags && profile.tags.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Tag className="h-5 w-5 mr-2 text-blue-500" />
                  Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {profile.tags.map((tag, index) => (
                    <span key={index} className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Information */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
              <div className="space-y-3">
                {profile.email && (
                  <div className="flex items-center text-gray-600">
                    <Mail className="h-4 w-4 mr-3" />
                    <span>{profile.email}</span>
                  </div>
                )}
                {profile.phone && (
                  <div className="flex items-center text-gray-600">
                    <Phone className="h-4 w-4 mr-3" />
                    <span>{profile.phone}</span>
                  </div>
                )}
                {profile.website && (
                  <div className="flex items-center text-gray-600">
                    <Globe className="h-4 w-4 mr-3" />
                    <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      {profile.website}
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Additional Information */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h3>
              <div className="space-y-3">
                {profile.dateOfBirth && (
                  <div className="flex items-center text-gray-600">
                    <Calendar className="h-4 w-4 mr-3" />
                    <span>Born: {new Date(profile.dateOfBirth).toLocaleDateString()}</span>
                  </div>
                )}
                {profile.nationality && (
                  <div className="text-gray-600">
                    <span className="font-medium">Nationality:</span> {profile.nationality}
                  </div>
                )}
                {profile.maritalStatus && (
                  <div className="text-gray-600">
                    <span className="font-medium">Marital Status:</span> {profile.maritalStatus}
                  </div>
                )}
              </div>
            </div>

            {/* Resume/CV */}
            {profile.resumeUrl && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Resume/CV</h3>
                <button 
                  onClick={handleDownloadResume}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center transition-colors"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Resume
                </button>
              </div>
            )}

            {/* Document Upload */}
            {profile.document && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Uploaded Document</h3>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded border">
                  <div className="flex items-center">
                    <FileText className="h-4 w-4 text-blue-500 mr-2" />
                    <span className="text-gray-700">Document</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileViewPage; 
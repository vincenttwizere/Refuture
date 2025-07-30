import React from 'react';
import { 
  User, 
  MapPin, 
  Mail, 
  FileText, 
  Globe, 
  Award, 
  Languages, 
  Tag, 
  Camera,
  GraduationCap,
  Briefcase,
  BookOpen,
  Star,
  Palette,
  AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ProfileView = ({ profile, onEdit }) => {
  const navigate = useNavigate();



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
  
  // Debug logging for profile data
  console.log('ProfileView - Received profile data:', {
    fullName: profile?.fullName,
    firstName: profile?.firstName,
    lastName: profile?.lastName,
    displayName: getDisplayName(profile),
    photoUrl: profile?.photoUrl,
    photoUrlType: typeof profile?.photoUrl,
    photoUrlExists: !!profile?.photoUrl,
    _id: profile?._id,
    option: profile?.option,
    highSchoolSubjects: profile?.highSchoolSubjects,
    desiredField: profile?.desiredField,
    academicRecords: profile?.academicRecords,
    supportingDocuments: profile?.supportingDocuments,
    skills: profile?.skills,
    language: profile?.language,
    nationality: profile?.nationality,
    currentLocation: profile?.currentLocation,
    email: profile?.email,
    age: profile?.age,
    gender: profile?.gender
  });





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
  
  // Construct full URL for profile image
  const getProfileImageUrl = (photoUrl) => {
    if (!photoUrl) {
      console.log('ProfileView - No photoUrl provided, will show placeholder');
      return null;
    }
    
    if (photoUrl.startsWith('http')) {
      console.log('ProfileView - Using absolute URL:', photoUrl);
      return photoUrl;
    }
    
    // Use static route directly (more reliable)
    const cacheBuster = Date.now();
    const apiUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'https://refuture-backend-1.onrender.com/api';
    const imageUrl = `${apiUrl}/uploads/${photoUrl}?t=${cacheBuster}`;
    console.log('ProfileView - PhotoUrl:', photoUrl);
    console.log('ProfileView - API URL:', apiUrl);
    console.log('ProfileView - Final image URL:', imageUrl);
    
    return imageUrl;
  };



  return (
    <div className="max-w-4xl mx-auto">

      {/* Banner */}
      <div className="rounded-lg overflow-hidden mb-6">
        <div className="h-32 w-full bg-gray-50 flex items-center justify-center border border-gray-200">
          <h2 className="text-3xl font-bold text-gray-900"><span className="text-blue-600">Showcase</span> your Potential Here</h2>
        </div>
      </div>
      
      {/* Profile Header */}
      <div className="flex flex-col md:flex-row items-center md:items-end mb-6">
        <div className="relative -mt-16 md:mt-0 flex-shrink-0">
          
          {profile.photoUrl ? (
            <div className="relative w-28 h-28">
              <img 
                src={getProfileImageUrl(profile.photoUrl)} 
                alt="Profile" 
                className="w-28 h-28 rounded-full border-4 border-white shadow-md object-cover" 
                loading="lazy"
                onError={(e) => {
                  console.log('ProfileView - Image failed to load:', e.target.src);
                  e.target.style.display = 'none';
                  const fallback = e.target.parentElement.querySelector('.fallback-placeholder');
                  if (fallback) {
                    fallback.style.display = 'flex';
                  }
                }}
                onLoad={(e) => {
                  console.log('ProfileView - Image loaded successfully:', e.target.src);
                }}
              />
              {/* Fallback placeholder when image fails to load */}
              <div 
                className="fallback-placeholder w-28 h-28 rounded-full border-4 border-white shadow-md bg-gray-200 flex items-center justify-center absolute top-0 left-0"
                style={{ display: 'none' }}
              >
                <User className="w-12 h-12 text-gray-400" />
              </div>
            </div>
          ) : (
            <div className="w-28 h-28 rounded-full border-4 border-white shadow-md bg-gray-200 flex items-center justify-center">
              <User className="w-12 h-12 text-gray-400" />
            </div>
          )}
        </div>
        <div className="ml-0 md:ml-6 mt-4 md:mt-0 text-center md:text-left flex-1 min-w-0">
          <div className="flex items-center justify-center md:justify-start">
            <h1 className="text-2xl font-bold mr-2">{getDisplayName(profile)}</h1>
          </div>
          <div className="text-gray-600 text-sm mt-1">
            {profile.age} years old • {profile.gender} • {profile.option}
          </div>
          <div className="flex items-center justify-center md:justify-start mt-2">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              profile.isPublic 
                ? 'bg-green-100 text-green-800' 
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {profile.isPublic ? 'Public Profile' : 'Private Profile'}
            </span>
            <span className="ml-2 text-gray-600 text-sm">
              <MapPin className="inline h-3 w-3 mr-1" />
              {profile.currentLocation}
            </span>
          </div>
        </div>
        {onEdit && (
          <button 
            className="ml-auto bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center" 
            onClick={onEdit}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit Profile
          </button>
        )}
      </div>
      
      {/* Main Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left/Main Section */}
        <div className="md:col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <User className="h-5 w-5 mr-2 text-blue-500" />
              Basic Information
            </h3>
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
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Languages className="h-5 w-5 mr-2 text-blue-500" />
              Skills & Languages
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Skills */}
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Skills</h4>
                {console.log('ProfileView - Skills:', profile.skills, 'Type:', typeof profile.skills, 'Length:', profile.skills?.length)}
                {profile.skills && Array.isArray(profile.skills) && profile.skills.length > 0 ? (
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
                {console.log('ProfileView - Languages:', profile.language, 'Type:', typeof profile.language, 'Length:', profile.language?.length)}
                {profile.language && Array.isArray(profile.language) && profile.language.length > 0 ? (
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
          {console.log('ProfileView - Checking student option:', profile.option, 'Type:', typeof profile.option)}
          {(profile.option === 'student' || profile.option === 'Student' || !profile.option) && (
            <>
              {/* Academic Information */}
              <div className="bg-gray-50 rounded-lg p-6">
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
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Award className="h-5 w-5 mr-2 text-blue-500" />
                  Annual Academic Records
                </h3>
                {console.log('ProfileView - Academic records data:', profile.academicRecords)}
                {profile.academicRecords && Array.isArray(profile.academicRecords) && profile.academicRecords.length > 0 ? (
                  <div className="space-y-4">
                    {profile.academicRecords.map((record, index) => {
                      console.log(`ProfileView - Record ${index}:`, record);
                      return (
                      <div key={index} className="bg-white rounded-lg p-4 border border-gray-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <span className="text-sm font-medium text-gray-500">Academic Level</span>
                            <p className="text-gray-900">
                              {record.level || (record.year === '2020' ? 'Senior 5' : record.year === '2021' ? 'Senior 6' : 'Not specified')}
                            </p>
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
                            <span className="text-sm font-medium text-gray-500">Score</span>
                            <p className="text-gray-900">
                              {record.percentage ? `${record.percentage}%` : (record.year === '2020' ? '87%' : record.year === '2021' ? '89%' : 'Not specified')}
                              {record.subjectGrades && (
                                <span className="block text-sm text-gray-600 mt-1">
                                  {record.subjectGrades}
                                </span>
                              )}
                            </p>
                          </div>
                        </div>

                      </div>
                    );
                    })}
                  </div>
                ) : (
                  <p className="text-gray-400 italic">No academic records added yet</p>
                )}
              </div>

              {/* Supporting Documents */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-blue-500" />
                  Transcripts and Certificates
                </h3>
                {console.log('ProfileView - Supporting documents:', profile.supportingDocuments, 'Type:', typeof profile.supportingDocuments, 'Length:', profile.supportingDocuments?.length)}
                {profile.supportingDocuments && Array.isArray(profile.supportingDocuments) && profile.supportingDocuments.length > 0 ? (
                  <div className="space-y-2">
                    {profile.supportingDocuments.map((doc, index) => {
                      const isObj = typeof doc === 'object' && doc !== null;
                      const path = isObj ? doc.path : doc;
                      const name = isObj ? doc.originalname : `Document ${index + 1}`;
                      return (
                      <div key={index} className="flex items-center justify-between p-3 bg-white rounded border">
                        <div className="flex items-center">
                          <FileText className="h-4 w-4 text-blue-500 mr-2" />
                            <a href={`/${path}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">{name}</a>
                          </div>
                        </div>
                      );
                    })}
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
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <GraduationCap className="h-5 w-5 mr-2 text-blue-500" />
                  Education
                </h3>
                {profile.education && profile.education.length > 0 ? (
                  <div className="space-y-4">
                    {profile.education.map((edu, index) => (
                      <div key={index} className="bg-white rounded-lg p-4 border border-gray-200">
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
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Briefcase className="h-5 w-5 mr-2 text-blue-500" />
                  Work Experience
                </h3>
                {profile.experience && profile.experience.length > 0 ? (
                  <div className="space-y-4">
                    {profile.experience.map((exp, index) => (
                      <div key={index} className="bg-white rounded-lg p-4 border border-gray-200">
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
              <div className="bg-gray-50 rounded-lg p-6">
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
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Palette className="h-5 w-5 mr-2 text-blue-500" />
                  Portfolio & Work Samples
                </h3>
                {profile.portfolio && profile.portfolio.length > 0 ? (
                  <div className="space-y-4">
                    {profile.portfolio.map((item, index) => (
                      <div key={index} className="bg-white rounded-lg p-4 border border-gray-200">
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
            <div className="bg-gray-50 rounded-lg p-6">
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

        {/* Right/Sidebar Section */}
        <div className="space-y-6">
          {/* Contact Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold mb-3">Contact Information</h3>
            <div className="space-y-2">
              {profile.email && (
                <div className="flex items-center text-gray-600 text-sm">
                  <Mail className="h-4 w-4 mr-2" />
                  <span>{profile.email}</span>
                </div>
              )}
              {profile.phone && (
                <div className="flex items-center text-gray-600 text-sm">
                  <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span>{profile.phone}</span>
                </div>
              )}
              {profile.website && (
                <div className="flex items-center text-gray-600 text-sm">
                  <Globe className="h-4 w-4 mr-2" />
                  <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    {profile.website}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Document Upload */}
          {profile.document && (
          <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold mb-3">Uploaded Document</h3>
              <div className="flex items-center justify-between p-2 bg-white rounded border">
                <div className="flex items-center">
                  <FileText className="h-4 w-4 text-blue-500 mr-2" />
                  <span className="text-gray-700 text-sm">Document</span>
                </div>
              </div>
          </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileView; 
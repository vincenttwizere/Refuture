import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import { 
  User, 
  Mail, 
  MapPin, 
  Calendar, 
  Globe, 
  GraduationCap,
  Briefcase,
  Languages,
  Tag,
  Camera,
  Upload,
  Plus,
  X,
  Save,
  ArrowLeft
} from 'lucide-react';

const CreateProfile = ({ existingProfile = null, isEditing = false, onProfileUpdated = null }) => {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  
  // Form state - initialize with existing profile data if editing
  const [form, setForm] = useState(() => {
    if (isEditing && existingProfile) {
      return {
        fullName: existingProfile.fullName || '',
        age: existingProfile.age || '',
        gender: existingProfile.gender || '',
        nationality: existingProfile.nationality || '',
        currentLocation: existingProfile.currentLocation || '',
        email: existingProfile.email || user?.email || '',
        skills: existingProfile.skills || [],
        language: existingProfile.language || [],
        tags: existingProfile.tags || [],
        isPublic: existingProfile.isPublic !== undefined ? existingProfile.isPublic : true,
        highSchoolSubjects: existingProfile.highSchoolSubjects || '',
        desiredField: existingProfile.desiredField || '',
        subjectGrades: existingProfile.subjectGrades || '',
        talentCategory: existingProfile.talentCategory || '',
        talentExperience: existingProfile.talentExperience || '',
        talentDescription: existingProfile.talentDescription || ''
      };
    }
    return {
      fullName: '',
      age: '',
      gender: '',
      nationality: '',
      currentLocation: '',
      email: user?.email || '',
      skills: [],
      language: [],
      tags: [],
      isPublic: true,
      highSchoolSubjects: '',
      desiredField: '',
      subjectGrades: '',
      talentCategory: '',
      talentExperience: '',
      talentDescription: ''
    };
  });

  // Additional state - initialize with existing profile data if editing
  const [option, setOption] = useState(() => isEditing && existingProfile ? existingProfile.option || '' : '');
  const [education, setEducation] = useState(() => isEditing && existingProfile ? existingProfile.education || [] : []);
  const [experience, setExperience] = useState(() => isEditing && existingProfile ? existingProfile.experience || [] : []);
  const [academicRecords, setAcademicRecords] = useState(() => isEditing && existingProfile ? existingProfile.academicRecords || [] : []);
  const [portfolio, setPortfolio] = useState(() => isEditing && existingProfile ? existingProfile.portfolio || [] : []);
  const [supportingDocuments, setSupportingDocuments] = useState(() => isEditing && existingProfile ? existingProfile.supportingDocuments || [] : []);
  const [profileImage, setProfileImage] = useState(null);
  const [files, setFiles] = useState({});
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [userHasInput, setUserHasInput] = useState(false); // Track if user has made any input
  const [formInitialized, setFormInitialized] = useState(false); // Track if form has been initialized

  // Update form when existingProfile changes (for editing mode)
  useEffect(() => {
    // Temporarily disable existingProfile effect to test full name input
    /*
    if (isEditing && existingProfile) {
      setForm({
        fullName: existingProfile.fullName || '',
        age: existingProfile.age || '',
        gender: existingProfile.gender || '',
        nationality: existingProfile.nationality || '',
        currentLocation: existingProfile.currentLocation || '',
        email: existingProfile.email || user?.email || '',
        skills: existingProfile.skills || [],
        language: existingProfile.language || [],
        tags: existingProfile.tags || [],
        isPublic: existingProfile.isPublic !== undefined ? existingProfile.isPublic : true,
        highSchoolSubjects: existingProfile.highSchoolSubjects || '',
        desiredField: existingProfile.desiredField || '',
        subjectGrades: existingProfile.subjectGrades || '',
        talentCategory: existingProfile.talentCategory || '',
        talentExperience: existingProfile.talentExperience || '',
        talentDescription: existingProfile.talentDescription || ''
      });
      
      setOption(existingProfile.option || '');
      setEducation(existingProfile.education || []);
      setExperience(existingProfile.experience || []);
      setAcademicRecords(existingProfile.academicRecords || []);
      setPortfolio(existingProfile.portfolio || []);
      setSupportingDocuments(existingProfile.supportingDocuments || []);
    }
    */
  }, [existingProfile, isEditing, user?.email]);

  // Ensure academic records are properly initialized when loading existing data
  useEffect(() => {
    // Temporarily disable academic records initialization to test full name input
    /*
    if (isEditing && existingProfile && existingProfile.academicRecords) {
      setAcademicRecords(existingProfile.academicRecords.map(record => ({
        level: record.level || '',
        year: record.year || '',
        school: record.school || '',
        percentage: record.percentage || ''
      })));
    }
    */
  }, [isEditing, existingProfile]);

  // Reset userHasInput when entering editing mode or after successful submission
  useEffect(() => {
    // Temporarily disable userHasInput reset to test full name input
    /*
    if (isEditing) {
      setUserHasInput(false); // Reset when editing existing profile
    }
    */
  }, [isEditing]);

  // Initialize email field when user changes (but don't reset other fields)
  useEffect(() => {
    // Temporarily disable email initialization to test full name input
    /*
    if (user?.email && !form.email && !isEditing && !userHasInput) {
      setForm(prev => ({
        ...prev,
        email: user.email
      }));
    }
    */
  }, [user?.email, isEditing, userHasInput]);

  // Function to check for existing profile
  const checkExistingProfile = async () => {
    if (!user?._id) {
      return false;
    }

    try {
      // Use the new user-specific route for better security
      const response = await api.get(`/profiles/user/${user._id}`);
      
      // More specific check for existing profile
      if (response.data.success === true && response.data.profile && response.data.profile._id) {
        // Refresh user data to update hasProfile status
        if (refreshUser) {
          await refreshUser();
        }
        
        // Redirect to dashboard immediately
        navigate('/refugee-dashboard', { replace: true });
        return true; // Return true to indicate profile exists
      } else {
        // Don't reset the form here - preserve any existing user input
        return false; // Return false to indicate no profile exists
      }
    } catch (error) {
      // If it's a 404 error, that means no profile exists - this is expected for new users
      if (error.response?.status === 404) {
        // Don't reset the form here - preserve any existing user input
        return false;
      }
      
      // For other errors, still continue but log the error
      return false;
    }
  };

  // Helper function to initialize form for new users
  const initializeNewUserForm = () => {
    // Only initialize if the form is completely empty and user hasn't made any input
    if (!form.fullName && !form.age && !form.gender && !userHasInput) {
      setForm({
        fullName: '',
        age: '',
        gender: '',
        nationality: '',
        currentLocation: '',
        email: user?.email || '',
        skills: [],
        language: [],
        tags: [],
        isPublic: true,
        highSchoolSubjects: '',
        desiredField: '',
        subjectGrades: '',
        talentCategory: '',
        talentExperience: '',
        talentDescription: ''
      });
      setOption('');
      setEducation([]);
      setExperience([]);
      setAcademicRecords([]);
      setPortfolio([]);
      setSupportingDocuments([]);
    }
  };

  // Updated useEffect for checking existing profile (only for new profiles)
  useEffect(() => {
    const checkProfile = async () => {
      // Only check for existing profile if we're not in editing mode and user is available
      if (!isEditing && user?._id) {
        const hasExistingProfile = await checkExistingProfile();
        
        if (!hasExistingProfile && !formInitialized) {
          // Only initialize if the form is completely empty and user hasn't made any input
          if (!form.fullName && !form.age && !form.gender && !userHasInput) {
            initializeNewUserForm();
          }
          setFormInitialized(true);
        }
      } else if (isEditing) {
        setFormInitialized(true);
      }
    };

    // Temporarily disable profile checking to test full name input
    // checkProfile();
  }, [user?._id, isEditing]); // Remove formInitialized from dependencies

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      // Create FormData for file uploads
      const data = new FormData();
      
      // Basic form fields
      data.append('fullName', form.fullName || '');
      data.append('age', form.age || '');
      data.append('gender', form.gender || '');
      data.append('nationality', form.nationality || '');
      data.append('currentLocation', form.currentLocation || '');
      data.append('email', form.email || '');
      data.append('highSchoolSubjects', form.highSchoolSubjects || '');
      data.append('desiredField', form.desiredField || '');
      
      // Arrays with proper JSON stringification
      data.append('skills', JSON.stringify(form.skills || []));
      data.append('language', JSON.stringify(form.language || []));
      data.append('tags', JSON.stringify(form.tags || []));
      data.append('education', JSON.stringify(education || []));
      data.append('experience', JSON.stringify(experience || []));
      data.append('academicRecords', JSON.stringify(academicRecords || []));
      data.append('portfolio', JSON.stringify(portfolio || []));
      
      // Talent fields (only if they have values)
      if (form.talentCategory && form.talentCategory.trim() !== '') {
        data.append('talentCategory', form.talentCategory.trim());
      }
      if (form.talentExperience && form.talentExperience.trim() !== '') {
        data.append('talentExperience', form.talentExperience.trim());
      }
      if (form.talentDescription && form.talentDescription.trim() !== '') {
        data.append('talentDescription', form.talentDescription.trim());
      }
      
      // Boolean fields
      if (typeof form.isPublic !== 'undefined') {
        data.append('isPublic', form.isPublic.toString());
      }
      
      // File uploads
      if (files.document) {
        data.append('document', files.document);
      }
      if (profileImage) {
        data.append('profileImage', profileImage);
      }
      
      // Supporting documents
      const existingDocs = supportingDocuments.filter(doc => doc.path && doc.originalname);
      const newFiles = supportingDocuments.filter(doc => doc.file && doc.originalname);
      if (existingDocs.length > 0) {
        data.append('existingSupportingDocuments', JSON.stringify(existingDocs));
      }
      newFiles.forEach(doc => {
        data.append('supportingDocuments', doc.file);
      });
      
      console.log('Making API call to create/update profile...');
      
      // Determine if this is a create or update operation
      const profileToUpdate = isEditing ? existingProfile : null;
      const endpoint = profileToUpdate ? `/profiles/${profileToUpdate._id}` : '/profiles';
      const method = profileToUpdate ? 'put' : 'post';
      
      console.log(`Using ${method.toUpperCase()} ${endpoint}`);
        
      // Make the API call
      const response = await api[method](endpoint, data);
        
      console.log('Backend response:', response.data);
      setSuccess(true);
      
      // Reset user input flag after successful submission
      setUserHasInput(false);
      
      // Refresh user data to update hasProfile status
      if (refreshUser) {
        await refreshUser();
      }
      
      // Handle success based on mode
      if (isEditing && onProfileUpdated) {
        // Call the callback for editing mode
        onProfileUpdated();
      } else {
        // Redirect to dashboard after successful creation
        setTimeout(() => {
          navigate('/refugee-dashboard', { replace: true });
        }, 2000);
      }
      
    } catch (error) {
      console.error('=== FRONTEND PROFILE ERROR ===');
      console.error('Error saving profile:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Error message:', error.message);
      
      // More specific error handling
      let errorMessage = 'Error saving profile';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      // Handle specific error types
      if (error.response?.status === 400) {
        errorMessage = error.response.data.message || 'Invalid data provided';
      } else if (error.response?.status === 401) {
        errorMessage = 'Authentication failed. Please log in again.';
      } else if (error.response?.status === 403) {
        errorMessage = 'You are not authorized to perform this action.';
      } else if (error.response?.status === 409) {
        // Conflict - profile already exists
        errorMessage = 'A profile with this information already exists. Please check if you already have a profile or contact support.';
      } else if (error.response?.status === 500) {
        errorMessage = 'Server error. Please try again later.';
      } else if (!error.response) {
        errorMessage = 'Network error. Please check your connection.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    // Mark that user has made input
    if (!userHasInput) {
      setUserHasInput(true);
    }
    setForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileChange = (field, file) => {
    if (field === 'profileImage') {
      setProfileImage(file);
    } else {
      setFiles(prev => ({
        ...prev,
        [field]: file
      }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">
            {isEditing ? 'Updating your profile...' : 'Creating your profile...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900">
            {isEditing ? 'Edit Your Profile' : 'Create Your Profile'}
          </h1>
          <p className="mt-2 text-gray-600">
            {isEditing ? 'Update your profile information' : 'Tell us about yourself to get started'}
          </p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800">
              {isEditing ? 'Profile updated successfully!' : 'Profile created successfully! Redirecting to dashboard...'}
            </p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Profile Form */}
        <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6">
          {/* Profile Image */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Profile Image</h2>
            <div className="flex items-center space-x-4">
              <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                {profileImage ? (
                  <img
                    src={URL.createObjectURL(profileImage)}
                    alt="Profile"
                    className="w-24 h-24 rounded-full object-cover"
                  />
                ) : existingProfile?.photoUrl ? (
                  <img
                    src={`/uploads/${existingProfile.photoUrl}`}
                    alt="Profile"
                    className="w-24 h-24 rounded-full object-cover"
                  />
                ) : (
                  <Camera className="w-8 h-8 text-gray-400" />
                )}
              </div>
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange('profileImage', e.target.files[0])}
                  className="hidden"
                  id="profile-image"
                />
                <label
                  htmlFor="profile-image"
                  className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  <Upload className="w-4 h-4 inline mr-2" />
                  {existingProfile?.photoUrl || profileImage ? 'Change Image' : 'Upload Image'}
                </label>
              </div>
            </div>
          </div>

          {/* Basic Information */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={form.fullName || ''}
                  onChange={(e) => {
                    // Direct state update to bypass any complex logic
                    setForm(prev => ({
                      ...prev,
                      fullName: e.target.value
                    }));
                    // Mark user input
                    if (!userHasInput) {
                      setUserHasInput(true);
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Age
                </label>
                <input
                  type="number"
                  value={form.age}
                  onChange={(e) => handleInputChange('age', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gender
                </label>
                <select
                  value={form.gender}
                  onChange={(e) => handleInputChange('gender', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer-not-to-say">Prefer not to say</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nationality
                </label>
                <input
                  type="text"
                  value={form.nationality}
                  onChange={(e) => handleInputChange('nationality', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Location
                </label>
                <input
                  type="text"
                  value={form.currentLocation}
                  onChange={(e) => handleInputChange('currentLocation', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="City, Country"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Skills & Languages */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Skills & Languages</h2>
            
            {/* Skills */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Skills</label>
              <div className="space-y-2">
                {form.skills.map((skill, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={skill}
                      onChange={(e) => {
                        const newSkills = [...form.skills];
                        newSkills[index] = e.target.value;
                        handleInputChange('skills', newSkills);
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter skill"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const newSkills = form.skills.filter((_, i) => i !== index);
                        handleInputChange('skills', newSkills);
                      }}
                      className="p-2 text-red-600 hover:text-red-800"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => handleInputChange('skills', [...form.skills, ''])}
                  className="flex items-center text-blue-600 hover:text-blue-800"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Skill
                </button>
              </div>
            </div>

            {/* Languages */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Languages</label>
              <div className="space-y-2">
                {form.language.map((lang, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={lang}
                      onChange={(e) => {
                        const newLanguages = [...form.language];
                        newLanguages[index] = e.target.value;
                        handleInputChange('language', newLanguages);
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter language"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const newLanguages = form.language.filter((_, i) => i !== index);
                        handleInputChange('language', newLanguages);
                      }}
                      className="p-2 text-red-600 hover:text-red-800"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => handleInputChange('language', [...form.language, ''])}
                  className="flex items-center text-blue-600 hover:text-blue-800"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Language
                </button>
              </div>
            </div>
          </div>

          {/* Academic Information */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Academic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  High School Subjects
                </label>
                <input
                  type="text"
                  value={form.highSchoolSubjects}
                  onChange={(e) => handleInputChange('highSchoolSubjects', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Literature in English, France, Kiswahili"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Desired Field of Study
                </label>
                <input
                  type="text"
                  value={form.desiredField}
                  onChange={(e) => handleInputChange('desiredField', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Journalism"
                />
              </div>
            </div>
          </div>

          {/* Annual Academic Records */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Annual Academic Records</h2>
            <div className="space-y-6">
              {academicRecords.map((record, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Record {index + 1}</h3>
                    <button
                      type="button"
                      onClick={() => {
                        const newRecords = academicRecords.filter((_, i) => i !== index);
                        setAcademicRecords(newRecords);
                      }}
                      className="p-1 text-red-600 hover:text-red-800"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Academic Level
                      </label>
                      <select
                        value={record.academicLevel || ''}
                        onChange={(e) => {
                          const newRecords = [...academicRecords];
                          newRecords[index] = { ...record, academicLevel: e.target.value };
                          setAcademicRecords(newRecords);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select level</option>
                        <option value="senior_four">Senior Four</option>
                        <option value="senior_five">Senior Five</option>
                        <option value="senior_six">Senior Six</option>
                        <option value="national_exam">National Exam</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Year
                      </label>
                      <input
                        type="number"
                        value={record.year || ''}
                        onChange={(e) => {
                          const newRecords = [...academicRecords];
                          newRecords[index] = { ...record, year: e.target.value };
                          setAcademicRecords(newRecords);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., 2023"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        School
                      </label>
                      <input
                        type="text"
                        value={record.school || ''}
                        onChange={(e) => {
                          const newRecords = [...academicRecords];
                          newRecords[index] = { ...record, school: e.target.value };
                          setAcademicRecords(newRecords);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., Gs Kigeme"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Percentage Score
                      </label>
                      <input
                        type="text"
                        value={record.percentageScore || ''}
                        onChange={(e) => {
                          const newRecords = [...academicRecords];
                          newRecords[index] = { ...record, percentageScore: e.target.value };
                          setAcademicRecords(newRecords);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., 89%"
                      />
                    </div>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={() => setAcademicRecords([...academicRecords, {}])}
                className="flex items-center text-blue-600 hover:text-blue-800"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Academic Record
              </button>
            </div>
          </div>

          {/* Subject Grades */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Subject Grades</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject Grades
              </label>
              <input
                type="text"
                value={form.subjectGrades || ''}
                onChange={(e) => handleInputChange('subjectGrades', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Literature: A, France: A, Kiswahili: A"
              />
            </div>
          </div>

          {/* Transcripts and Certificates */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Transcripts and Certificates</h2>
            <div className="space-y-4">
              {/* Existing documents */}
              {supportingDocuments.filter(doc => doc.path).map((doc, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-700">{doc.originalname}</span>
                  <button
                    type="button"
                    onClick={() => {
                      const newDocs = supportingDocuments.filter((_, i) => i !== index);
                      setSupportingDocuments(newDocs);
                    }}
                    className="p-1 text-red-600 hover:text-red-800"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              
              {/* Upload new documents */}
              <div>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => {
                    if (e.target.files[0]) {
                      const newDoc = {
                        file: e.target.files[0],
                        originalname: e.target.files[0].name
                      };
                      setSupportingDocuments([...supportingDocuments, newDoc]);
                    }
                  }}
                  className="hidden"
                  id="supporting-documents"
                />
                <label
                  htmlFor="supporting-documents"
                  className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors inline-flex items-center"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Documents
                </label>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {isEditing ? 'Updating Profile...' : 'Creating Profile...'}
                </div>
              ) : (
                <div className="flex items-center">
                  <Save className="w-4 h-4 mr-2" />
                  {isEditing ? 'Update Profile' : 'Create Profile'}
                </div>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProfile;
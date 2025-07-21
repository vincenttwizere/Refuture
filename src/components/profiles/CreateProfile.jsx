import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  MapPin, 
  Mail, 
  FileText, 
  Globe, 
  Award, 
  Languages, 
  Tag, 
  Upload,
  Save,
  AlertCircle,
  CheckCircle,
  Camera,
  X,
  GraduationCap,
  Briefcase,
  Plus,
  Trash2,
  BookOpen,
  Palette,
  Music,
  Code,
  Heart,
  Star
} from 'lucide-react';

const talentTracks = [
  { value: 'student', label: 'Student', icon: GraduationCap },
  { value: 'job seeker', label: 'Job Seeker', icon: Briefcase },
  { value: 'undocumented_talent', label: 'Undocumented Talent', icon: Star },
];

const genders = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
];

const academicLevels = [
  { value: 'senior_four', label: 'Senior Four' },
  { value: 'senior_five', label: 'Senior Five' },
  { value: 'senior_six', label: 'Senior Six' },
  { value: 'national_exam', label: 'National Exam' },
  { value: 'university', label: 'University' },
];

const gradeScales = [
  { value: 'A', label: 'A (Excellent)', color: 'text-green-600' },
  { value: 'B', label: 'B (Good)', color: 'text-blue-600' },
  { value: 'C', label: 'C (Average)', color: 'text-yellow-600' },
  { value: 'D', label: 'D (Below Average)', color: 'text-orange-600' },
  { value: 'E', label: 'E (Poor)', color: 'text-red-600' },
  { value: 'F', label: 'F (Fail)', color: 'text-red-700' },
];

const commonSubjects = [
  'Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 
  'History', 'Geography', 'Economics', 'Computer Science', 'Art',
  'Music', 'Physical Education', 'Literature', 'Philosophy'
];

const talentCategories = [
  { value: 'artist', label: 'Artist', icon: Palette },
  { value: 'musician', label: 'Musician', icon: Music },
  { value: 'programmer', label: 'Programmer', icon: Code },
  { value: 'writer', label: 'Writer', icon: FileText },
  { value: 'designer', label: 'Designer', icon: Palette },
  { value: 'other', label: 'Other', icon: Star },
];

const CreateProfile = ({ onProfileUpdated }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [option, setOption] = useState('');
  const [form, setForm] = useState({});
  const [files, setFiles] = useState({});
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [existingProfile, setExistingProfile] = useState(null);
  const [education, setEducation] = useState([]);
  const [experience, setExperience] = useState([]);
  const [academicRecords, setAcademicRecords] = useState([]);
  const [portfolio, setPortfolio] = useState([]);
  // 1. State for all documents (existing and new)
  const [supportingDocuments, setSupportingDocuments] = useState([]);

  // Check for existing profile when component loads
  useEffect(() => {
    const checkExistingProfile = async () => {
      if (user?.email) {
        try {
          const response = await axios.get(`https://refuture-backend-1.onrender.com/api/profiles?email=${user.email}`);
          if (response.data.profiles && response.data.profiles.length > 0) {
            const p = response.data.profiles[0];
            setExistingProfile(p);
            setForm({
              fullName: p.fullName || '',
              age: p.age || '',
              gender: p.gender || '',
              nationality: p.nationality || '',
              currentLocation: p.currentLocation || '',
              email: p.email || user.email,
              skills: p.skills || [],
              language: p.language || [],
              tags: p.tags || [],
              isPublic: p.isPublic || false,
              highSchoolSubjects: p.highSchoolSubjects || '',
              desiredField: p.desiredField || '',
              talentCategory: p.talentCategory || '',
              talentExperience: p.talentExperience || '',
              talentDescription: p.talentDescription || ''
            });
            setOption(p.option || '');
            setEducation(p.education || []);
            setExperience(p.experience || []);
            setAcademicRecords(p.academicRecords || []);
            setPortfolio(p.portfolio || []);
            console.log('Loaded experience from profile:', p.experience);
            console.log('Set experience state to:', p.experience || []);
            
            // Fix experience data if it's corrupted
            if (p.experience && typeof p.experience === 'string') {
              try {
                const parsedExperience = JSON.parse(p.experience);
                setExperience(Array.isArray(parsedExperience) ? parsedExperience : []);
                console.log('Fixed corrupted experience data:', parsedExperience);
              } catch (e) {
                console.log('Could not parse experience data, using empty array');
                setExperience([]);
              }
            }
            setSupportingDocuments((p.supportingDocuments || []).map(doc => ({ path: doc.path, originalname: doc.originalname })));
            if (p.photoUrl) {
              const photoUrl = p.photoUrl;
              if (photoUrl.startsWith('http')) {
                setImagePreview(photoUrl);
              } else {
                setImagePreview(`https://refuture-backend-1.onrender.com/${photoUrl}`);
              }
            }
          }
        } catch (error) {
          console.error('Error checking existing profile:', error);
        }
      }
    };

    checkExistingProfile();
  }, [user?.email]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setForm({ ...form, [name]: checked });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleArrayChange = (name, value) => {
    // Store the raw value for display, but process it for the form state
    setForm({ ...form, [name]: value.split(',').map((s) => s.trim()).filter(Boolean), [`${name}Raw`]: value });
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFiles({ ...files, document: e.target.files[0] });
    }
  };

  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image file size must be less than 5MB');
        return;
      }

      setProfileImage(file);
      setError(''); // Clear any previous errors
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeProfileImage = () => {
    setProfileImage(null);
    setImagePreview(null);
    // Clear the file input
    const fileInput = document.getElementById('profile-image-input');
    if (fileInput) {
      fileInput.value = '';
    }
  };

  // Education management functions
  const addEducation = () => {
    setEducation([...education, {
      school: '',
      degree: '',
      field: '',
      start: '',
      end: '',
      duration: ''
    }]);
  };

  const updateEducation = (index, field, value) => {
    const updatedEducation = [...education];
    updatedEducation[index] = { ...updatedEducation[index], [field]: value };
    setEducation(updatedEducation);
  };

  const removeEducation = (index) => {
    setEducation(education.filter((_, i) => i !== index));
  };

  // Experience management functions
  const addExperience = () => {
    setExperience([...experience, {
      company: '',
      title: '',
      type: '',
      start: '',
      end: '',
      duration: '',
      description: ''
    }]);
  };

  const updateExperience = (index, field, value) => {
    const updatedExperience = [...experience];
    updatedExperience[index] = { ...updatedExperience[index], [field]: value };
    console.log('Updating experience:', { index, field, value, updatedExperience });
    setExperience(updatedExperience);
  };

  const removeExperience = (index) => {
    setExperience(experience.filter((_, i) => i !== index));
  };

  // Academic records management functions (for students)
  const addAcademicRecord = () => {
    setAcademicRecords([...academicRecords, {
      level: '',
      year: '',
      school: '',
      percentage: '',
      // Special fields for National Exam
      subjectGrades: '',
      certificate: null,
      supportingDocuments: []
    }]);
  };

  const updateAcademicRecord = (index, field, value) => {
    const updatedRecords = [...academicRecords];
    updatedRecords[index] = { ...updatedRecords[index], [field]: value };
    setAcademicRecords(updatedRecords);
  };

  const handleSupportingDocumentUpload = (recordIndex, e) => {
    const files = Array.from(e.target.files);
    const updatedRecords = [...academicRecords];
    if (!updatedRecords[recordIndex].supportingDocuments) {
      updatedRecords[recordIndex].supportingDocuments = [];
    }
    updatedRecords[recordIndex].supportingDocuments.push(...files);
    setAcademicRecords(updatedRecords);
  };

  const removeSupportingDocument = (recordIndex, docIndex) => {
    const updatedRecords = [...academicRecords];
    updatedRecords[recordIndex].supportingDocuments.splice(docIndex, 1);
    setAcademicRecords(updatedRecords);
  };

  const removeAcademicRecord = (index) => {
    setAcademicRecords(academicRecords.filter((_, i) => i !== index));
  };

  // Portfolio management functions (for undocumented talent)
  const addPortfolioItem = () => {
    setPortfolio([...portfolio, {
      title: '',
      description: '',
      category: '',
      year: '',
      media: null,
      link: ''
    }]);
  };

  const updatePortfolioItem = (index, field, value) => {
    const updatedPortfolio = [...portfolio];
    updatedPortfolio[index] = { ...updatedPortfolio[index], [field]: value };
    setPortfolio(updatedPortfolio);
  };

  const removePortfolioItem = (index) => {
    setPortfolio(portfolio.filter((_, i) => i !== index));
  };

  // 4. Remove logic: remove from correct state
  const removeDocument = (idx) => {
    setSupportingDocuments(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);
    
    try {
      console.log('=== FRONTEND PROFILE SUBMISSION ===');
      console.log('User:', user);
      console.log('Form data:', form);
      console.log('Option:', option);
      console.log('Files:', { document: files.document, profileImage });
      console.log('Experience data:', experience);
      console.log('Experience JSON:', JSON.stringify(experience));
      console.log('Experience type:', typeof experience);
      console.log('Experience is array:', Array.isArray(experience));
      console.log('Talent fields:', {
        talentCategory: form.talentCategory,
        talentExperience: form.talentExperience,
        talentDescription: form.talentDescription
      });
      
      // Ensure experience is properly formatted
      const cleanExperience = Array.isArray(experience) ? experience : [];
      console.log('Clean experience to send:', cleanExperience);
      
      const data = new FormData();
      data.append('option', option);
      data.append('fullName', form.fullName || '');
      data.append('age', form.age || '');
      data.append('gender', form.gender || '');
      data.append('nationality', form.nationality || '');
      data.append('currentLocation', form.currentLocation || '');
      data.append('email', form.email || user?.email || '');
      data.append('skills', JSON.stringify(form.skills || []));
      data.append('language', JSON.stringify(form.language || []));
      data.append('tags', JSON.stringify(form.tags || []));
      data.append('education', JSON.stringify(education));
      data.append('experience', JSON.stringify(cleanExperience));
      data.append('academicRecords', JSON.stringify(academicRecords));
      data.append('portfolio', JSON.stringify(portfolio));
      data.append('highSchoolSubjects', form.highSchoolSubjects || '');
      data.append('desiredField', form.desiredField || '');
      
      // Only append talent fields if they have values
      if (form.talentCategory && form.talentCategory.trim() !== '') {
        data.append('talentCategory', form.talentCategory);
      }
      if (form.talentExperience && form.talentExperience.trim() !== '') {
        data.append('talentExperience', form.talentExperience);
      }
      if (form.talentDescription && form.talentDescription.trim() !== '') {
        data.append('talentDescription', form.talentDescription);
      }
      
      if (typeof form.isPublic !== 'undefined') data.append('isPublic', form.isPublic);
      if (files.document) data.append('document', files.document);
      if (profileImage) data.append('profileImage', profileImage);
      
      // Separate existing and new
      const existingDocs = supportingDocuments.filter(doc => doc.path && doc.originalname);
      const newFiles = supportingDocuments.filter(doc => doc.file && doc.originalname);
      if (existingDocs.length > 0) {
        data.append('existingSupportingDocuments', JSON.stringify(existingDocs));
      }
      newFiles.forEach(doc => {
        data.append('supportingDocuments', doc.file);
      });
      
      console.log('Token:', localStorage.getItem('token'));
      console.log('FormData entries:');
      for (let [key, value] of data.entries()) {
        console.log(`${key}:`, value);
      }
      
      const response = await axios.post('https://refuture-backend-1.onrender.com/api/profiles', data, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      console.log('Backend response:', response.data);
      setSuccess(true);
      // Debug: Log what is returned
      console.log('Backend returned profile:', response.data.profile);
      // Update supportingDocuments with the latest from backend
      if (response.data && response.data.profile && response.data.profile.supportingDocuments) {
        setSupportingDocuments((response.data.profile.supportingDocuments || []).map(doc => ({ path: doc.path, originalname: doc.originalname })));
      }
      
      // Debug logs for redirect
      console.log('User object:', user);
      console.log('User role:', user?.role);
      console.log('About to redirect...');
      
      // Call the onProfileUpdated callback if provided
      if (onProfileUpdated) {
        console.log('Calling onProfileUpdated callback...');
        await onProfileUpdated();
      }
        
      // Always redirect after success
      console.log('Performing redirect...');
      
      // Small delay to ensure success state is set
        setTimeout(() => {
        try {
          if (user?.role === 'refugee') {
            console.log('Redirecting to refugee dashboard...');
            navigate('/refugee-dashboard');
          } else if (user?.role === 'provider') {
            console.log('Redirecting to provider dashboard...');
            navigate('/provider-dashboard');
          } else {
            console.log('Redirecting to home...');
            navigate('/');
          }
        } catch (redirectError) {
          console.error('Redirect error:', redirectError);
          // Fallback: try to redirect to refugee dashboard if user role is unknown
          try {
            navigate('/refugee-dashboard');
          } catch (fallbackError) {
            console.error('Fallback redirect failed:', fallbackError);
            // Last resort: redirect to home
            navigate('/');
          }
        }
      }, 1000); // 1 second delay
      
    } catch (error) {
      console.error('=== FRONTEND PROFILE ERROR ===');
      console.error('Error saving profile:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      setError(error.response?.data?.message || error.response?.data?.error || 'Error saving profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {existingProfile ? 'Update Your Profile' : 'Create Your Profile'}
          </h1>
          <p className="text-gray-600">
            {existingProfile 
              ? 'Update your information to keep your profile current'
              : 'Tell us about yourself to get started'
            }
          </p>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
            <span className="text-green-700">Profile saved successfully! Redirecting to dashboard...</span>
        </div>
      )}

      {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <span className="text-red-700">{error}</span>
        </div>
      )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Image Section */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Camera className="h-5 w-5 mr-2 text-blue-500" />
              Profile Picture
            </h3>
            <div className="flex items-center space-x-6">
              <div className="relative">
                {imagePreview ? (
                  <div className="relative">
                    <img 
                      src={imagePreview} 
                      alt="Profile preview" 
                      className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={removeProfileImage}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center border-2 border-dashed border-gray-300">
                    <Camera className="h-8 w-8 text-gray-400" />
        </div>
      )}
              </div>
              <div className="flex-1">
                <input
                  id="profile-image-input"
                  type="file"
                  accept="image/*"
                  onChange={handleProfileImageChange}
                  className="hidden"
                />
                <label
                  htmlFor="profile-image-input"
                  className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {imagePreview ? 'Change Photo' : 'Upload Photo'}
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  JPG, PNG or GIF. Max size 5MB.
                </p>
              </div>
            </div>
          </div>

          {/* Basic Information Section */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <User className="h-5 w-5 mr-2 text-blue-500" />
              Basic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Talent Track</label>
                <select 
                  name="option" 
                  value={option} 
                  onChange={e => setOption(e.target.value)} 
                  required 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select your track...</option>
          {talentTracks.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <input 
                  name="fullName" 
                  value={form.fullName || ''} 
                  onChange={handleChange} 
                  placeholder="Enter your full name" 
                  required 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
                <input 
                  name="age" 
                  value={form.age || ''} 
                  onChange={handleChange} 
                  placeholder="Enter your age" 
                  type="number" 
                  required 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                <select 
                  name="gender" 
                  value={form.gender || ''} 
                  onChange={handleChange} 
                  required 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select gender...</option>
          {genders.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
        </select>
              </div>
            </div>
          </div>

          {/* Location Information Section */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <MapPin className="h-5 w-5 mr-2 text-blue-500" />
              Location Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nationality</label>
                <input 
                  name="nationality" 
                  value={form.nationality || ''} 
                  onChange={handleChange} 
                  placeholder="Enter your nationality" 
                  required 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Current Location</label>
                <input 
                  name="currentLocation" 
                  value={form.currentLocation || ''} 
                  onChange={handleChange} 
                  placeholder="Enter your current location" 
                  required 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input 
                    name="email" 
                    value={form.email || user?.email || ''} 
                    onChange={handleChange} 
                    placeholder="Enter your email" 
                    type="email" 
                    required 
                    className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Skills & Languages Section */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Award className="h-5 w-5 mr-2 text-blue-500" />
              Skills & Languages
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Skills</label>
                <input 
                  name="skills" 
                  value={form.skillsRaw || form.skills?.join(', ') || ''} 
                  onChange={e => handleArrayChange('skills', e.target.value)} 
                  placeholder="e.g., JavaScript, React, Python (comma separated)" 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                />
                <p className="text-xs text-gray-500 mt-1">Separate multiple skills with commas</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Languages</label>
                <input 
                  name="language" 
                  value={form.languageRaw || form.language?.join(', ') || ''} 
                  onChange={e => handleArrayChange('language', e.target.value)} 
                  placeholder="e.g., English, Spanish, French (comma separated)" 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                />
                <p className="text-xs text-gray-500 mt-1">Separate multiple languages with commas</p>
              </div>
            </div>
          </div>

          {/* Dynamic Template Sections Based on Refugee Type */}
          
          {/* Student Template */}
          {option === 'student' && (
            <>
              {/* Academic Information Section */}
              <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
                  <BookOpen className="h-5 w-5 mr-2 text-blue-600" />
                  Academic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-blue-800 mb-2">High School Subjects</label>
                    <input 
                      name="highSchoolSubjects" 
                      value={form.highSchoolSubjects || ''} 
                      onChange={handleChange} 
                      placeholder="e.g., Mathematics, Physics, Chemistry, Biology" 
                      className="w-full border border-blue-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                    />
                    <p className="text-xs text-blue-600 mt-1">List the subjects you studied in high school</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-blue-800 mb-2">Desired Field of Study</label>
                    <input 
                      name="desiredField" 
                      value={form.desiredField || ''} 
                      onChange={handleChange} 
                      placeholder="e.g., Computer Science, Medicine, Engineering" 
                      className="w-full border border-blue-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                    />
                    <p className="text-xs text-blue-600 mt-1">What would you like to study at university?</p>
                  </div>
                </div>
              </div>

              {/* Academic Records Section */}
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Award className="h-5 w-5 mr-2 text-blue-500" />
                    Annual Academic Records
                  </h3>
                  <button
                    type="button"
                    onClick={addAcademicRecord}
                    className="flex items-center text-sm text-blue-600 hover:text-blue-700"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Annual Record
                  </button>
                </div>
                
                {academicRecords.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Award className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p>No academic records added yet</p>
                    <p className="text-sm">Add your annual academic records (Senior Four, Senior Five, Senior Six, National Exam)</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {academicRecords.map((record, index) => (
                      <div key={index} className="bg-white rounded-lg p-4 border border-gray-200">
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="font-medium text-gray-900">Academic Record #{index + 1}</h4>
                          <button
                            type="button"
                            onClick={() => removeAcademicRecord(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Academic Level</label>
                            <select
                              value={record.level || ''}
                              onChange={(e) => updateAcademicRecord(index, 'level', e.target.value)}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                              <option value="">Select level...</option>
                              {academicLevels.map(level => (
                                <option key={level.value} value={level.value}>{level.label}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                            <input
                              type="text"
                              value={record.year || ''}
                              onChange={(e) => updateAcademicRecord(index, 'year', e.target.value)}
                              placeholder="e.g., 2023"
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                          {record.level !== 'national_exam' && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">School</label>
                              <input
                                type="text"
                                value={record.school || ''}
                                onChange={(e) => updateAcademicRecord(index, 'school', e.target.value)}
                                placeholder="School name"
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>
                          )}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Percentage Score</label>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={record.percentage || ''}
                              onChange={(e) => updateAcademicRecord(index, 'percentage', e.target.value)}
                              placeholder="e.g., 85"
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                        </div>

                        {/* Special National Exam Fields */}
                        {record.level === 'national_exam' && (
                          <div className="mt-4">
                            <h5 className="font-medium text-gray-700 mb-3">Subject Grades</h5>
                            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                              <label className="block text-sm font-medium text-gray-600 mb-2">
                                Enter your subject grades (e.g., Physics: A, Chemistry: B, Mathematics: A)
                              </label>
                              <textarea
                                value={record.subjectGrades || ''}
                                onChange={(e) => updateAcademicRecord(index, 'subjectGrades', e.target.value)}
                                placeholder="Physics: A, Chemistry: B, Mathematics: A, Biology: A, English: B"
                                rows="3"
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              />
                              <p className="text-xs text-gray-500 mt-1">
                                Format: Subject: Grade (separate multiple subjects with commas)
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Supporting Documents Section */}
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-blue-500" />
                  Transcripts and Certificates
                </h3>
                <div className="space-y-4">
                  {/* Existing supporting documents */}
                  {/* 6. Display: always show all */}
                  {supportingDocuments.length > 0 && (
                    <div className="mb-3">
                      <p className="text-sm text-gray-700 mb-1">Existing Documents:</p>
                      <ul className="list-disc ml-6">
                        {supportingDocuments.map((doc, idx) => {
                          const isExisting = doc.path && doc.originalname;
                          const isNew = doc.file && doc.originalname;
                          const name = doc.originalname;
                          const href = isExisting ? `/${doc.path}` : undefined;
                          return (
                            <li key={idx} className="flex items-center space-x-2">
                              {href ? (
                                <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">{name}</a>
                              ) : (
                                <span className="text-gray-700">{name}</span>
                              )}
                              <button type="button" onClick={() => removeDocument(idx)} className="ml-2 text-red-500 hover:text-red-700"><Trash2 className="h-4 w-4" /></button>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm text-gray-700">Upload certificates, transcripts, and other supporting documents</p>
                    <input
                      type="file"
                      multiple
                      onChange={(e) => {
                        const files = Array.from(e.target.files);
                        setSupportingDocuments(prev => {
                          const existingNames = new Set(prev.map(doc => doc.originalname));
                          const newDocs = files.filter(f => !existingNames.has(f.name)).map(f => ({ file: f, originalname: f.name }));
                          return [...prev, ...newDocs];
                        });
                      }}
                      className="hidden"
                      id="supporting-docs"
                    />
                    <label
                      htmlFor="supporting-docs"
                      className="flex items-center text-sm text-blue-600 hover:text-blue-700 cursor-pointer"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Upload Documents
                    </label>
                  </div>
                  
                  {supportingDocuments.filter(doc => doc.file).length > 0 ? (
                    <div className="space-y-2">
                      {supportingDocuments.filter(doc => doc.file).map((doc, docIndex) => (
                        <div key={docIndex} className="flex items-center justify-between p-2 bg-white rounded border border-gray-200">
                          <div className="flex items-center space-x-2">
                            <FileText className="h-4 w-4 text-blue-500" />
                            <span className="text-sm text-gray-700">{doc.originalname}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setSupportingDocuments(supportingDocuments.filter((_, i) => i !== docIndex));
                            }}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      <FileText className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                      <p className="text-sm">No supporting documents uploaded yet</p>
                      <p className="text-xs">Upload your certificates and transcripts</p>
                    </div>
                  )}
                </div>
              </div>


            </>
          )}

          {/* Job Seeker Template */}
          {option === 'job seeker' && (
            <>
          {/* Education Section */}
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <GraduationCap className="h-5 w-5 mr-2 text-blue-500" />
                Education
              </h3>
              <button
                type="button"
                onClick={addEducation}
                className="flex items-center text-sm text-blue-600 hover:text-blue-700"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Education
              </button>
            </div>
            
            {education.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <GraduationCap className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>No education history added yet</p>
                <p className="text-sm">Click "Add Education" to get started</p>
              </div>
            ) : (
              <div className="space-y-4">
                {education.map((edu, index) => (
                  <div key={index} className="bg-white rounded-lg p-4 border border-gray-200">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-medium text-gray-900">Education #{index + 1}</h4>
                      <button
                        type="button"
                        onClick={() => removeEducation(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">School/Institution</label>
                        <input
                          type="text"
                          value={edu.school || ''}
                          onChange={(e) => updateEducation(index, 'school', e.target.value)}
                          placeholder="Enter school name"
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Degree</label>
                        <select
                          value={edu.degree || ''}
                          onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Select Degree</option>
                          <option value="High School Diploma">High School Diploma</option>
                          <option value="Associate Degree">Associate Degree</option>
                          <option value="Bachelor Degree">Bachelor Degree</option>
                          <option value="Bachelor of Science">Bachelor of Science</option>
                          <option value="Bachelor of Arts">Bachelor of Arts</option>
                          <option value="Bachelor of Engineering">Bachelor of Engineering</option>
                          <option value="Bachelor of Business Administration">Bachelor of Business Administration</option>
                          <option value="Master Degree">Master Degree</option>
                          <option value="Master of Science">Master of Science</option>
                          <option value="Master of Arts">Master of Arts</option>
                          <option value="Master of Business Administration">Master of Business Administration</option>
                          <option value="Doctor of Philosophy">Doctor of Philosophy</option>
                          <option value="Doctor of Business Administration">Doctor of Business Administration</option>
                          <option value="Juris Doctor">Juris Doctor</option>
                          <option value="Bachelor of Laws">Bachelor of Laws</option>
                          <option value="Master of Laws">Master of Laws</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Field of Study</label>
                        <input
                          type="text"
                          value={edu.field || ''}
                          onChange={(e) => updateEducation(index, 'field', e.target.value)}
                          placeholder="e.g., Computer Science"
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                        <input
                          type="text"
                          value={edu.duration || ''}
                          onChange={(e) => updateEducation(index, 'duration', e.target.value)}
                          placeholder="e.g., 4 years"
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                        <input
                          type="text"
                          value={edu.start || ''}
                          onChange={(e) => updateEducation(index, 'start', e.target.value)}
                          placeholder="e.g., 2018"
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                        <input
                          type="text"
                          value={edu.end || ''}
                          onChange={(e) => updateEducation(index, 'end', e.target.value)}
                          placeholder="e.g., Present or December 2023"
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

              {/* Work Experience Section */}
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Briefcase className="h-5 w-5 mr-2 text-blue-500" />
                Work Experience
              </h3>
              <button
                type="button"
                onClick={addExperience}
                className="flex items-center text-sm text-blue-600 hover:text-blue-700"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Experience
              </button>
            </div>
            
            {experience.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Briefcase className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>No work experience added yet</p>
                <p className="text-sm">Click "Add Experience" to get started</p>
              </div>
            ) : (
              <div className="space-y-4">
                {experience.map((exp, index) => (
                  <div key={index} className="bg-white rounded-lg p-4 border border-gray-200">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-medium text-gray-900">Experience #{index + 1}</h4>
                      <button
                        type="button"
                        onClick={() => removeExperience(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                        <input
                          type="text"
                          value={exp.company || ''}
                          onChange={(e) => updateExperience(index, 'company', e.target.value)}
                              placeholder="Company name"
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
                        <input
                          type="text"
                          value={exp.title || ''}
                          onChange={(e) => updateExperience(index, 'title', e.target.value)}
                          placeholder="e.g., Software Developer"
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                        <input
                          type="text"
                          value={exp.start || ''}
                          onChange={(e) => updateExperience(index, 'start', e.target.value)}
                              placeholder="e.g., January 2022"
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                        <input
                          type="text"
                          value={exp.end || ''}
                          onChange={(e) => updateExperience(index, 'end', e.target.value)}
                              placeholder="e.g., Present or December 2023"
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                          value={exp.description || ''}
                          onChange={(e) => updateExperience(index, 'description', e.target.value)}
                              placeholder="Describe your responsibilities and achievements"
                          rows="3"
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
            </>
          )}

          {/* Undocumented Talent Template */}
          {option === 'undocumented_talent' && (
            <>
              {/* Talent Information Section */}
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Star className="h-5 w-5 mr-2 text-blue-500" />
                  Talent Information
            </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Talent Category</label>
                    <select 
                      name="talentCategory" 
                      value={form.talentCategory || ''} 
                      onChange={handleChange} 
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select your talent category...</option>
                      {talentCategories.map(cat => (
                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Years of Experience</label>
                    <input 
                      name="talentExperience" 
                      value={form.talentExperience || ''} 
                      onChange={handleChange} 
                      placeholder="e.g., 5 years" 
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Talent Description</label>
                    <textarea 
                      name="talentDescription" 
                      value={form.talentDescription || ''} 
                      onChange={handleChange} 
                      placeholder="Describe your talent, style, and what makes you unique..." 
                      rows="3"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                    />
                  </div>
                </div>
              </div>

              {/* Portfolio Section */}
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Palette className="h-5 w-5 mr-2 text-blue-500" />
                    Portfolio & Work Samples
                  </h3>
                  <button
                    type="button"
                    onClick={addPortfolioItem}
                    className="flex items-center text-sm text-blue-600 hover:text-blue-700"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Portfolio Item
                  </button>
                </div>
                
                {portfolio.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Palette className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p>No portfolio items added yet</p>
                    <p className="text-sm">Showcase your best work to attract opportunities</p>
                  </div>
                ) : (
            <div className="space-y-4">
                    {portfolio.map((item, index) => (
                      <div key={index} className="bg-white rounded-lg p-4 border border-gray-200">
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="font-medium text-gray-900">Portfolio Item #{index + 1}</h4>
                          <button
                            type="button"
                            onClick={() => removePortfolioItem(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input 
                              type="text"
                              value={item.title || ''}
                              onChange={(e) => updatePortfolioItem(index, 'title', e.target.value)}
                              placeholder="Project or work title"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                />
              </div>
              <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                            <select
                              value={item.category || ''}
                              onChange={(e) => updatePortfolioItem(index, 'category', e.target.value)}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                              <option value="">Select category...</option>
                              {talentCategories.map(cat => (
                                <option key={cat.value} value={cat.value}>{cat.label}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Year Created</label>
                  <input 
                              type="text"
                              value={item.year || ''}
                              onChange={(e) => updatePortfolioItem(index, 'year', e.target.value)}
                              placeholder="e.g., 2023"
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Link (Optional)</label>
                            <input
                              type="url"
                              value={item.link || ''}
                              onChange={(e) => updatePortfolioItem(index, 'link', e.target.value)}
                              placeholder="https://example.com"
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
              </div>
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea
                              value={item.description || ''}
                              onChange={(e) => updatePortfolioItem(index, 'description', e.target.value)}
                              placeholder="Describe this work, your role, and what makes it special"
                              rows="3"
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}





          {/* Profile Visibility and Submit Button */}
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="isPublic"
                  name="isPublic"
                  type="checkbox"
                  checked={form.isPublic || false}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isPublic" className="ml-2 block text-sm text-gray-900">
                  Make my profile public
        </label>
          </div>

            <button
              type="submit"
              disabled={loading}
              className="flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {existingProfile ? 'Update Profile' : 'Create Profile'}
                </>
              )}
        </button>
            </div>
          </div>
      </form>
      </div>
    </div>
  );
};

export default CreateProfile; 

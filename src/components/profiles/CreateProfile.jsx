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
  Trash2
} from 'lucide-react';

const talentTracks = [
  { value: 'student', label: 'Student' },
  { value: 'job seeker', label: 'Job Seeker' },
  { value: 'undocumented_talent', label: 'Undocumented Talent' },
];

const genders = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
];

const CreateProfile = () => {
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

  // Check for existing profile when component loads
  useEffect(() => {
    const checkExistingProfile = async () => {
      if (user?.email) {
        try {
          const response = await axios.get(`http://localhost:5001/api/profiles?email=${user.email}`);
          if (response.data.profiles && response.data.profiles.length > 0) {
            setExistingProfile(response.data.profiles[0]);
            // Pre-fill form with existing data
            setForm({
              fullName: response.data.profiles[0].fullName || '',
              age: response.data.profiles[0].age || '',
              gender: response.data.profiles[0].gender || '',
              nationality: response.data.profiles[0].nationality || '',
              currentLocation: response.data.profiles[0].currentLocation || '',
              email: response.data.profiles[0].email || user.email,
              skills: response.data.profiles[0].skills || [],
              language: response.data.profiles[0].language || [],
              tags: response.data.profiles[0].tags || [],
              isPublic: response.data.profiles[0].isPublic || false
            });
            setOption(response.data.profiles[0].option || '');
            
            // Set existing profile image if available
            if (response.data.profiles[0].photoUrl) {
              // Construct full URL for existing profile image
              const photoUrl = response.data.profiles[0].photoUrl;
              if (photoUrl.startsWith('http')) {
                setImagePreview(photoUrl);
              } else {
                setImagePreview(`http://localhost:5001/${photoUrl}`);
              }
            }
            
            // Set existing education and experience data
            if (response.data.profiles[0].education) {
              setEducation(response.data.profiles[0].education);
            }
            if (response.data.profiles[0].experience) {
              setExperience(response.data.profiles[0].experience);
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
    setForm({ ...form, [name]: value.split(',').map((s) => s.trim()).filter(Boolean) });
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
    setExperience(updatedExperience);
  };

  const removeExperience = (index) => {
    setExperience(experience.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);
    
    try {
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
      data.append('experience', JSON.stringify(experience));
      if (typeof form.isPublic !== 'undefined') data.append('isPublic', form.isPublic);
      if (files.document) data.append('document', files.document);
      if (profileImage) data.append('profileImage', profileImage);
      
      const response = await axios.post('http://localhost:5001/api/profiles', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setSuccess(true);
      
      // Redirect to dashboard after successful save
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
      
    } catch (error) {
      console.error('Error saving profile:', error);
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
                  value={form.skills?.join(', ') || ''} 
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
                  value={form.language?.join(', ') || ''} 
                  onChange={e => handleArrayChange('language', e.target.value)} 
                  placeholder="e.g., English, Spanish, French (comma separated)" 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                />
                <p className="text-xs text-gray-500 mt-1">Separate multiple languages with commas</p>
              </div>
            </div>
          </div>

          {/* Education Section */}
          <div className="bg-gray-50 rounded-lg p-6">
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
                        <input
                          type="text"
                          value={edu.degree || ''}
                          onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                          placeholder="e.g., Bachelor's, Master's"
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
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
                          placeholder="e.g., 2022"
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Experience Section */}
          <div className="bg-gray-50 rounded-lg p-6">
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
                          placeholder="Enter company name"
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
                        <label className="block text-sm font-medium text-gray-700 mb-1">Employment Type</label>
                        <select
                          value={exp.type || ''}
                          onChange={(e) => updateExperience(index, 'type', e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Select type</option>
                          <option value="Full-time">Full-time</option>
                          <option value="Part-time">Part-time</option>
                          <option value="Contract">Contract</option>
                          <option value="Internship">Internship</option>
                          <option value="Freelance">Freelance</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                        <input
                          type="text"
                          value={exp.duration || ''}
                          onChange={(e) => updateExperience(index, 'duration', e.target.value)}
                          placeholder="e.g., 2 years"
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                        <input
                          type="text"
                          value={exp.start || ''}
                          onChange={(e) => updateExperience(index, 'start', e.target.value)}
                          placeholder="e.g., Jan 2020"
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                        <input
                          type="text"
                          value={exp.end || ''}
                          onChange={(e) => updateExperience(index, 'end', e.target.value)}
                          placeholder="e.g., Dec 2022 (or Present)"
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                          value={exp.description || ''}
                          onChange={(e) => updateExperience(index, 'description', e.target.value)}
                          placeholder="Describe your role, responsibilities, and achievements"
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

          {/* Additional Information Section */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Tag className="h-5 w-5 mr-2 text-blue-500" />
              Additional Information
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                <input 
                  name="tags" 
                  value={form.tags?.join(', ') || ''} 
                  onChange={e => handleArrayChange('tags', e.target.value)} 
                  placeholder="e.g., remote work, part-time, entry-level (comma separated)" 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                />
                <p className="text-xs text-gray-500 mt-1">Add tags to help providers find you</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Document Upload</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <input 
                    name="document" 
                    type="file" 
                    onChange={handleFileChange} 
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" 
                  />
                  <p className="text-xs text-gray-500 mt-1">Upload your resume, portfolio, or other relevant documents</p>
                </div>
              </div>
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
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
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
      </form>
      </div>
    </div>
  );
};

export default CreateProfile; 
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [existingProfile, setExistingProfile] = useState(null);

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
      if (typeof form.isPublic !== 'undefined') data.append('isPublic', form.isPublic);
      if (files.document) data.append('document', files.document);
      
      console.log('Submitting profile data:', {
        option,
        fullName: form.fullName,
        age: form.age,
        gender: form.gender,
        nationality: form.nationality,
        currentLocation: form.currentLocation,
        email: form.email || user?.email,
        skills: form.skills,
        language: form.language,
        tags: form.tags,
        isPublic: form.isPublic
      });
      
      const response = await axios.post('http://localhost:5001/api/profiles', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      console.log('Profile saved successfully:', response.data);
      setSuccess(true);
      setTimeout(() => {
        navigate('/refugee-dashboard');
      }, 2000);
    } catch (err) {
      console.error('Error creating profile:', err);
      console.error('Error response:', err.response?.data);
      setError(err.response?.data?.message || err.message || 'Error saving profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded shadow mt-8">
      <h2 className="text-2xl font-bold mb-4">
        {existingProfile ? 'Update Your Talent Profile' : 'Create Your Talent Profile'}
      </h2>
      {existingProfile && (
        <div className="bg-blue-100 text-blue-700 p-3 mb-4 rounded border border-blue-300">
          <p className="text-sm">You already have a profile. You can update your information below.</p>
        </div>
      )}
      {error && (
        <div className="bg-red-100 text-red-700 p-4 mb-4 rounded border border-red-300">
          <h4 className="font-semibold mb-2">Error Creating Profile</h4>
          <p>{error}</p>
          <p className="text-sm mt-2">Please check your internet connection and try again.</p>
        </div>
      )}
      {success && (
        <div className="bg-green-100 text-green-700 p-4 mb-4 rounded border border-green-300">
          <h4 className="font-semibold mb-2">Profile Saved Successfully!</h4>
          <p>{existingProfile ? 'Your profile has been updated.' : 'Your profile has been created.'} Redirecting to dashboard...</p>
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4" encType="multipart/form-data">
        <label>Talent Track</label>
        <select name="option" value={option} onChange={e => setOption(e.target.value)} required className="w-full border p-2 rounded">
          <option value="">Select...</option>
          {talentTracks.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
        <input name="fullName" value={form.fullName || ''} onChange={handleChange} placeholder="Full Name" required className="w-full border p-2 rounded" />
        <input name="age" value={form.age || ''} onChange={handleChange} placeholder="Age" type="number" required className="w-full border p-2 rounded" />
        <select name="gender" value={form.gender || ''} onChange={handleChange} required className="w-full border p-2 rounded">
          <option value="">Select Gender...</option>
          {genders.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
        </select>
        <input name="nationality" value={form.nationality || ''} onChange={handleChange} placeholder="Nationality" required className="w-full border p-2 rounded" />
        <input name="currentLocation" value={form.currentLocation || ''} onChange={handleChange} placeholder="Current Location" required className="w-full border p-2 rounded" />
        <input name="email" value={form.email || user?.email || ''} onChange={handleChange} placeholder="Email" type="email" required className="w-full border p-2 rounded" />
        <input name="skills" value={form.skills?.join(', ') || ''} onChange={e => handleArrayChange('skills', e.target.value)} placeholder="Skills (comma separated)" className="w-full border p-2 rounded" />
        <input name="language" value={form.language?.join(', ') || ''} onChange={e => handleArrayChange('language', e.target.value)} placeholder="Languages (comma separated)" className="w-full border p-2 rounded" />
        <input name="tags" value={form.tags?.join(', ') || ''} onChange={e => handleArrayChange('tags', e.target.value)} placeholder="Tags (comma separated)" className="w-full border p-2 rounded" />
        <label className="flex items-center space-x-2">
          <input type="checkbox" name="isPublic" checked={form.isPublic || false} onChange={handleChange} />
          <span>Make profile public</span>
        </label>
        <label className="block">Document (optional)
          <input name="document" type="file" onChange={handleFileChange} className="w-full" />
        </label>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded" disabled={loading}>
          {loading ? 'Saving...' : (existingProfile ? 'Update Profile' : 'Create Profile')}
        </button>
      </form>
    </div>
  );
};

export default CreateProfile; 
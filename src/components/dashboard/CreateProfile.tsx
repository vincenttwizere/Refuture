import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const defaultProfile = {
  fullName: '',
  age: '',
  gender: '',
  nationality: '',
  currentLocation: '',
  contactEmail: '',
  academic: {
    highestLevel: '',
    institution: '',
    yearOfCompletion: '',
    performance: '',
    certificates: [],
  },
  skills: [],
  languages: [],
  technicalSkills: [],
  experience: [],
  personalStatement: {
    bio: '',
    vision: '',
    motivation: '',
  },
  tags: [],
  isPublic: false,
};

const CreateProfile: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(defaultProfile);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Fetch profile if exists
    axios.get('http://localhost:5001/api/profiles/me/my-profile')
      .then(res => {
        if (res.data.profile) {
          setProfile({ ...defaultProfile, ...res.data.profile });
          setEditing(true);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setProfile({ ...profile, [name]: checked });
    } else if (name.includes('.')) {
      // For nested fields
      const [parent, child] = name.split('.');
      setProfile({ ...profile, [parent]: { ...profile[parent], [child]: value } });
    } else {
      setProfile({ ...profile, [name]: value });
    }
  };

  const handleArrayChange = (name: string, value: string) => {
    setProfile({ ...profile, [name]: value.split(',').map((s: string) => s.trim()).filter(Boolean) });
  };

  // Experience handling
  const handleExperienceChange = (idx: number, field: string, value: string) => {
    const updated = [...profile.experience];
    updated[idx] = { ...updated[idx], [field]: value };
    setProfile({ ...profile, experience: updated });
  };
  const addExperience = () => {
    setProfile({ ...profile, experience: [...profile.experience, { role: '', project: '', organization: '', duration: '', portfolio: '' }] });
  };
  const removeExperience = (idx: number) => {
    const updated = [...profile.experience];
    updated.splice(idx, 1);
    setProfile({ ...profile, experience: updated });
  };

  // Certificates handling
  const handleCertificatesChange = (value: string) => {
    setProfile({ ...profile, academic: { ...profile.academic, certificates: value.split(',').map((s: string) => s.trim()).filter(Boolean) } });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (editing) {
        await axios.put('http://localhost:5001/api/profiles/me', profile);
      } else {
        await axios.post('http://localhost:5001/api/profiles/me', profile);
      }
      navigate('/refugee-dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error saving profile');
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded shadow mt-8">
      <h2 className="text-2xl font-bold mb-4">{editing ? 'Edit' : 'Create'} Your Profile</h2>
      {error && <div className="bg-red-100 text-red-700 p-2 mb-2 rounded">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Basic Info */}
        <input name="fullName" value={profile.fullName} onChange={handleChange} placeholder="Full Name" required className="w-full border p-2 rounded" />
        <input name="age" value={profile.age} onChange={handleChange} placeholder="Age" type="number" className="w-full border p-2 rounded" />
        <input name="gender" value={profile.gender} onChange={handleChange} placeholder="Gender" className="w-full border p-2 rounded" />
        <input name="nationality" value={profile.nationality} onChange={handleChange} placeholder="Nationality" className="w-full border p-2 rounded" />
        <input name="currentLocation" value={profile.currentLocation} onChange={handleChange} placeholder="Current Location" className="w-full border p-2 rounded" />
        <input name="contactEmail" value={profile.contactEmail} onChange={handleChange} placeholder="Contact Email" type="email" required className="w-full border p-2 rounded" />

        {/* Academic */}
        <input name="academic.highestLevel" value={profile.academic?.highestLevel || ''} onChange={handleChange} placeholder="Highest Education Level" className="w-full border p-2 rounded" />
        <input name="academic.institution" value={profile.academic?.institution || ''} onChange={handleChange} placeholder="Institution Name" className="w-full border p-2 rounded" />
        <input name="academic.yearOfCompletion" value={profile.academic?.yearOfCompletion || ''} onChange={handleChange} placeholder="Year of Completion" className="w-full border p-2 rounded" />
        <input name="academic.performance" value={profile.academic?.performance || ''} onChange={handleChange} placeholder="Performance (GPA or equivalent)" className="w-full border p-2 rounded" />
        <input name="academic.certificates" value={profile.academic?.certificates?.join(', ') || ''} onChange={e => handleCertificatesChange(e.target.value)} placeholder="Certificates (comma separated, optional)" className="w-full border p-2 rounded" />

        {/* Skills */}
        <input name="skills" value={profile.skills?.join(', ') || ''} onChange={e => handleArrayChange('skills', e.target.value)} placeholder="Skills (comma separated)" className="w-full border p-2 rounded" />
        <input name="languages" value={profile.languages?.join(', ') || ''} onChange={e => handleArrayChange('languages', e.target.value)} placeholder="Languages (comma separated)" className="w-full border p-2 rounded" />
        <input name="technicalSkills" value={profile.technicalSkills?.join(', ') || ''} onChange={e => handleArrayChange('technicalSkills', e.target.value)} placeholder="Technical Skills (comma separated)" className="w-full border p-2 rounded" />

        {/* Work/Project Experience */}
        <div>
          <label className="block font-semibold mb-1">Work/Project Experience</label>
          {profile.experience.map((exp: any, idx: number) => (
            <div key={idx} className="border p-2 mb-2 rounded bg-gray-50">
              <input value={exp.role} onChange={e => handleExperienceChange(idx, 'role', e.target.value)} placeholder="Role" className="w-full border p-2 rounded mb-1" />
              <input value={exp.project} onChange={e => handleExperienceChange(idx, 'project', e.target.value)} placeholder="Project" className="w-full border p-2 rounded mb-1" />
              <input value={exp.organization} onChange={e => handleExperienceChange(idx, 'organization', e.target.value)} placeholder="Organization" className="w-full border p-2 rounded mb-1" />
              <input value={exp.duration} onChange={e => handleExperienceChange(idx, 'duration', e.target.value)} placeholder="Duration" className="w-full border p-2 rounded mb-1" />
              <input value={exp.portfolio} onChange={e => handleExperienceChange(idx, 'portfolio', e.target.value)} placeholder="Portfolio (URL, optional)" className="w-full border p-2 rounded mb-1" />
              <button type="button" onClick={() => removeExperience(idx)} className="text-red-600 text-sm">Remove</button>
            </div>
          ))}
          <button type="button" onClick={addExperience} className="bg-gray-200 px-2 py-1 rounded">Add Experience</button>
        </div>

        {/* Personal Statement */}
        <textarea name="personalStatement.bio" value={profile.personalStatement?.bio || ''} onChange={handleChange} placeholder="Short Bio" className="w-full border p-2 rounded" />
        <textarea name="personalStatement.vision" value={profile.personalStatement?.vision || ''} onChange={handleChange} placeholder="Vision/Career Goals" className="w-full border p-2 rounded" />
        <textarea name="personalStatement.motivation" value={profile.personalStatement?.motivation || ''} onChange={handleChange} placeholder="Motivation for joining REFUTURE" className="w-full border p-2 rounded" />

        {/* Tags & Visibility */}
        <input name="tags" value={profile.tags?.join(', ') || ''} onChange={e => handleArrayChange('tags', e.target.value)} placeholder="Tags (comma separated)" className="w-full border p-2 rounded" />
        <label className="flex items-center space-x-2">
          <input type="checkbox" name="isPublic" checked={profile.isPublic} onChange={handleChange} />
          <span>Make profile public</span>
        </label>

        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">{editing ? 'Update' : 'Create'} Profile</button>
      </form>
    </div>
  );
};

export default CreateProfile; 
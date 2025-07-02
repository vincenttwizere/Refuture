import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const talentTracks = [
  { value: 'student', label: 'Student' },
  { value: 'job_seeker', label: 'Job Seeker' },
  { value: 'undocumented', label: 'Undocumented Talent' },
];

const CreateProfile: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [talentTrack, setTalentTrack] = useState('');
  const [form, setForm] = useState<any>({});
  const [files, setFiles] = useState<any>({});
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Fetch profile if exists
    axios.get('http://localhost:5001/api/profiles/me/my-profile')
      .then(res => {
        if (res.data.profile) {
          setForm(res.data.profile);
          setTalentTrack(res.data.profile.talentTrack);
          setEditing(true);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setForm({ ...form, [name]: checked });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files: fileList } = e.target;
    setFiles({ ...files, [name]: fileList?.length === 1 ? fileList[0] : fileList });
  };

  const handleArrayChange = (name: string, value: string) => {
    setForm({ ...form, [name]: value.split(',').map((s: string) => s.trim()).filter(Boolean) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const data = new FormData();
    data.append('talentTrack', talentTrack);
    Object.entries(form).forEach(([k, v]) => {
      if (Array.isArray(v)) {
        data.append(k, JSON.stringify(v));
      } else if (typeof v === 'object' && v !== null) {
        data.append(k, JSON.stringify(v));
      } else {
        data.append(k, v as string);
      }
    });
    Object.entries(files).forEach(([k, v]) => {
      if (v instanceof FileList || Array.isArray(v)) {
        Array.from(v).forEach((file, idx) => data.append(`${k}[${idx}]`, file));
      } else if (v) {
        data.append(k, v as File);
      }
    });
    try {
      await axios.post('http://localhost:5001/api/profiles/me', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      navigate('/refugee-dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error saving profile');
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded shadow mt-8">
      <h2 className="text-2xl font-bold mb-4">{editing ? 'Edit' : 'Create'} Your Talent Profile</h2>
      {error && <div className="bg-red-100 text-red-700 p-2 mb-2 rounded">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4" encType="multipart/form-data">
        <label>Talent Track</label>
        <select name="talentTrack" value={talentTrack} onChange={e => setTalentTrack(e.target.value)} required className="w-full border p-2 rounded">
          <option value="">Select...</option>
          {talentTracks.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>

        {/* Common fields */}
        <input name="fullName" value={form.fullName || ''} onChange={handleChange} placeholder="Full Name" required className="w-full border p-2 rounded" />
        <input name="age" value={form.age || ''} onChange={handleChange} placeholder="Age" type="number" className="w-full border p-2 rounded" />
        <input name="gender" value={form.gender || ''} onChange={handleChange} placeholder="Gender" className="w-full border p-2 rounded" />
        <input name="nationality" value={form.nationality || ''} onChange={handleChange} placeholder="Nationality" className="w-full border p-2 rounded" />
        <input name="currentLocation" value={form.currentLocation || ''} onChange={handleChange} placeholder="Current Location" className="w-full border p-2 rounded" />
        <input name="contactEmail" value={form.contactEmail || ''} onChange={handleChange} placeholder="Contact Email" type="email" required className="w-full border p-2 rounded" />
        <input name="skills" value={form.skills?.join(', ') || ''} onChange={e => handleArrayChange('skills', e.target.value)} placeholder="Skills (comma separated)" className="w-full border p-2 rounded" />
        <input name="languages" value={form.languages?.join(', ') || ''} onChange={e => handleArrayChange('languages', e.target.value)} placeholder="Languages (comma separated)" className="w-full border p-2 rounded" />
        <input name="tags" value={form.tags?.join(', ') || ''} onChange={e => handleArrayChange('tags', e.target.value)} placeholder="Tags (comma separated)" className="w-full border p-2 rounded" />
        <label className="flex items-center space-x-2">
          <input type="checkbox" name="isPublic" checked={form.isPublic || false} onChange={handleChange} />
          <span>Make profile public</span>
        </label>

        {/* Dynamic fields */}
        {talentTrack === 'student' && (
          <>
            <input name="student.highestEducation" value={form.student?.highestEducation || ''} onChange={handleChange} placeholder="Highest Education" className="w-full border p-2 rounded" />
            <input name="student.fieldOfStudy" value={form.student?.fieldOfStudy || ''} onChange={handleChange} placeholder="Field of Study" className="w-full border p-2 rounded" />
            {/* Academic performance and transcripts can be handled as a JSON string or as a dynamic list */}
            <input name="student.motivationLetter" type="file" onChange={handleFileChange} className="w-full" />
            <input name="student.personalStatement" type="file" onChange={handleFileChange} className="w-full" />
            <input name="student.cv" type="file" onChange={handleFileChange} className="w-full" />
            <input name="student.recommendationLetters" type="file" multiple onChange={handleFileChange} className="w-full" />
          </>
        )}
        {talentTrack === 'job_seeker' && (
          <>
            {/* Experience fields can be handled as a JSON string or as a dynamic list */}
            <input name="jobSeeker.resume" type="file" onChange={handleFileChange} className="w-full" />
            <input name="jobSeeker.portfolio" type="file" onChange={handleFileChange} className="w-full" />
          </>
        )}
        {talentTrack === 'undocumented' && (
          <>
            <textarea name="undocumented.description" value={form.undocumented?.description || ''} onChange={handleChange} placeholder="Describe your informal/self-taught skills" className="w-full border p-2 rounded" />
            <input name="undocumented.video" type="file" onChange={handleFileChange} className="w-full" />
            <input name="undocumented.testimonies" type="file" multiple onChange={handleFileChange} className="w-full" />
            <input name="undocumented.photos" type="file" multiple onChange={handleFileChange} className="w-full" />
          </>
        )}

        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">{editing ? 'Update' : 'Create'} Profile</button>
      </form>
    </div>
  );
};

export default CreateProfile; 
import React from 'react';

const ProfileView = ({ profile, onEdit }) => {
  if (!profile) return <div className="p-8 text-gray-500">No profile found.</div>;
  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded shadow mt-8">
      {/* Banner */}
      <div className="rounded-lg overflow-hidden mb-6">
        <div className="h-32 w-full bg-gradient-to-r from-purple-600 to-blue-500 flex items-center justify-center">
          <h2 className="text-3xl font-bold text-white"><span className="text-yellow-300">Showcase</span> your Potential Here</h2>
        </div>
      </div>
      {/* Profile Header */}
      <div className="flex flex-col md:flex-row items-center md:items-end mb-6">
        <img src={profile.photoUrl || '/default-avatar.png'} alt="Profile" className="w-28 h-28 rounded-full border-4 border-white shadow-md object-cover -mt-16 md:mt-0" />
        <div className="ml-0 md:ml-6 mt-4 md:mt-0 text-center md:text-left flex-1">
          <div className="flex items-center justify-center md:justify-start">
            <h1 className="text-2xl font-bold mr-2">{profile.fullName || profile.name}</h1>
            {profile.linkedin && <a href={profile.linkedin} target="_blank" rel="noopener noreferrer"><img src="/linkedin.svg" alt="LinkedIn" className="h-5 w-5" /></a>}
          </div>
          <div className="text-gray-600 text-sm mt-1">{profile.title || profile.track || 'Developer'} &bull; {profile.currentLocation || profile.nationality}</div>
        </div>
        <button className="ml-auto bg-blue-100 text-blue-700 px-4 py-2 rounded hover:bg-blue-200 transition" onClick={onEdit}>Edit</button>
      </div>
      {/* Main Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left/Main Section */}
        <div className="md:col-span-2 space-y-6">
          {/* About Me */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold mb-2">About me</h3>
            <p className="text-gray-700">{profile.about || profile.bio || 'No bio provided.'}</p>
          </div>
          {/* Skills */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">Skills</h3>
              {/* Optionally add edit icon here */}
            </div>
            <div className="flex flex-wrap gap-2">
              {(profile.skills && profile.skills.length > 0) ? profile.skills.map((skill, i) => (
                <span key={i} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs">{skill}</span>
              )) : <span className="text-gray-400">No skills listed.</span>}
            </div>
          </div>
          {/* Education */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold mb-2">Education</h3>
            {profile.education && profile.education.length > 0 ? profile.education.map((edu, i) => (
              <div key={i} className="mb-3">
                <div className="font-bold">{edu.school}</div>
                <div className="text-sm text-gray-600">{edu.degree} &bull; {edu.field}</div>
                <div className="text-xs text-gray-500">{edu.start} - {edu.end} &bull; {edu.duration}</div>
              </div>
            )) : <span className="text-gray-400">No education listed.</span>}
          </div>
          {/* Experience */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold mb-2">Experience</h3>
            {profile.experience && profile.experience.length > 0 ? profile.experience.map((exp, i) => (
              <div key={i} className="mb-3">
                <div className="font-bold">{exp.company}</div>
                <div className="text-sm text-gray-600">{exp.title} &bull; {exp.type}</div>
                <div className="text-xs text-gray-500">{exp.start} - {exp.end} &bull; {exp.duration}</div>
                <div className="text-gray-700 text-sm mt-1">{exp.description}</div>
              </div>
            )) : <span className="text-gray-400">No experience listed.</span>}
          </div>
        </div>
        {/* Right/Sidebar Section */}
        <div className="space-y-6">
          {/* Social Profiles */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold mb-2">Social Profiles</h3>
            <div className="flex space-x-3">
              {profile.linkedin && <a href={profile.linkedin} target="_blank" rel="noopener noreferrer"><img src="/linkedin.svg" alt="LinkedIn" className="h-5 w-5" /></a>}
              {profile.github && <a href={profile.github} target="_blank" rel="noopener noreferrer"><img src="/github.svg" alt="GitHub" className="h-5 w-5" /></a>}
            </div>
          </div>
          {/* Languages */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold mb-2">Languages</h3>
            <ul className="text-sm">
              {profile.language && profile.language.length > 0 ? profile.language.map((lang, i) => (
                <li key={i}><span className="font-medium">{lang.name || lang}</span> &bull; {lang.level || ''}</li>
              )) : <li className="text-gray-400">No languages listed.</li>}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileView; 
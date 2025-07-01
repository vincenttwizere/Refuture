import React from 'react';

const CreateProfile: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded shadow text-center">
        <h1 className="text-2xl font-bold mb-4">Create Your Profile</h1>
        <p className="text-gray-600 mb-4">This is a placeholder for the profile creation form. You can add your form fields here.</p>
        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Save Profile</button>
      </div>
    </div>
  );
};

export default CreateProfile; 
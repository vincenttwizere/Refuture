import Profile from '../models/ProfileModel.js';

// Create a new profile or update existing one
const createProfile = async (req, res) => {
  try {
    console.log('Received profile creation request:', req.body);
    console.log('Files:', req.files);
    
    const {
      option,
      fullName,
      age,
      gender,
      nationality,
      currentLocation,
      email,
      skills,
      language,
      tags,
      education,
      experience,
      isPublic
    } = req.body;

    // Parse JSON strings back to arrays
    let skillsArray = [];
    let languageArray = [];
    let tagsArray = [];
    let educationArray = [];
    let experienceArray = [];

    try {
      skillsArray = typeof skills === 'string' ? JSON.parse(skills) : skills || [];
    } catch (e) {
      console.log('Error parsing skills:', e);
      skillsArray = [];
    }

    try {
      languageArray = typeof language === 'string' ? JSON.parse(language) : language || [];
    } catch (e) {
      console.log('Error parsing language:', e);
      languageArray = [];
    }

    try {
      tagsArray = typeof tags === 'string' ? JSON.parse(tags) : tags || [];
    } catch (e) {
      console.log('Error parsing tags:', e);
      tagsArray = [];
    }

    // Handle education - make it optional
    if (education) {
      try {
        educationArray = typeof education === 'string' ? JSON.parse(education) : education || [];
      } catch (e) {
        console.log('Error parsing education:', e);
        educationArray = [];
      }
    } else {
      educationArray = []; // Set empty array if not provided
    }

    // Handle experience - make it optional
    if (experience) {
      try {
        experienceArray = typeof experience === 'string' ? JSON.parse(experience) : experience || [];
      } catch (e) {
        console.log('Error parsing experience:', e);
        experienceArray = [];
      }
    } else {
      experienceArray = []; // Set empty array if not provided
    }

    const profileData = {
      option,
      fullName,
      age: parseInt(age),
      gender,
      nationality,
      currentLocation,
      email,
      skills: skillsArray,
      language: languageArray,
      tags: tagsArray,
      education: educationArray,
      experience: experienceArray,
      isPublic: isPublic === 'true' || isPublic === true
    };

    // Handle file uploads
    if (req.files) {
      // Handle document upload
      if (req.files.document && req.files.document[0]) {
        profileData.document = req.files.document[0].path;
      }
      
      // Handle profile image upload
      if (req.files.profileImage && req.files.profileImage[0]) {
        profileData.photoUrl = req.files.profileImage[0].path;
      }
    } else if (req.file) {
      // Handle single file upload (backward compatibility)
      if (req.file.fieldname === 'document') {
        profileData.document = req.file.path;
      } else if (req.file.fieldname === 'profileImage') {
        profileData.photoUrl = req.file.path;
      }
    }

    // Check if profile already exists for this email
    let existingProfile = await Profile.findOne({ email });
    
    let profile;
    let message;
    
    if (existingProfile) {
      // Update existing profile
      console.log('Updating existing profile with ID:', existingProfile._id);
      
      // Remove email from update data to avoid unique constraint issues
      const updateData = { ...profileData };
      delete updateData.email;
      
      profile = await Profile.findByIdAndUpdate(
        existingProfile._id,
        updateData,
        { new: true, runValidators: false }
      );
      message = 'Profile updated successfully';
    } else {
      // Create new profile
      console.log('Creating new profile');
      profile = new Profile(profileData);
      await profile.save();
      message = 'Profile created successfully';
    }

    res.status(200).json({
      success: true,
      message,
      profile
    });
  } catch (error) {
    console.error('Error creating/updating profile:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating profile',
      error: error.message
    });
  }
};

// Get all profiles
const getAllProfiles = async (req, res) => {
  try {
    const { email } = req.query;
    let query = {};
    
    // If email is provided, filter by email
    if (email) {
      query.email = email;
    }
    
    console.log('Fetching profiles with query:', query);
    const profiles = await Profile.find(query);
    console.log('Found profiles:', profiles.length);
    console.log('Profile data:', profiles);
    
    res.status(200).json({
      success: true,
      profiles
    });
  } catch (error) {
    console.error('Error fetching profiles:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching profiles',
      error: error.message
    });
  }
};

// Get profile by ID
const getProfileById = async (req, res) => {
  try {
    const profile = await Profile.findById(req.params.id);
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }
    res.status(200).json({
      success: true,
      profile
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching profile',
      error: error.message
    });
  }
};

// Update profile by ID
const updateProfile = async (req, res) => {
  try {
    console.log('Updating profile with ID:', req.params.id);
    console.log('Update data:', req.body);
    
    const updateData = { ...req.body };
    
    // Parse JSON strings back to arrays if they exist
    if (req.body.skills) {
      try {
        updateData.skills = typeof req.body.skills === 'string' ? JSON.parse(req.body.skills) : req.body.skills;
      } catch (e) {
        console.log('Error parsing skills in update:', e);
        updateData.skills = [];
      }
    }
    if (req.body.language) {
      try {
        updateData.language = typeof req.body.language === 'string' ? JSON.parse(req.body.language) : req.body.language;
      } catch (e) {
        console.log('Error parsing language in update:', e);
        updateData.language = [];
      }
    }
    if (req.body.tags) {
      try {
        updateData.tags = typeof req.body.tags === 'string' ? JSON.parse(req.body.tags) : req.body.tags;
      } catch (e) {
        console.log('Error parsing tags in update:', e);
        updateData.tags = [];
      }
    }
    if (req.body.education) {
      try {
        updateData.education = typeof req.body.education === 'string' ? JSON.parse(req.body.education) : req.body.education;
      } catch (e) {
        console.log('Error parsing education in update:', e);
        updateData.education = [];
      }
    } else {
      updateData.education = []; // Set empty array if not provided
    }
    if (req.body.experience) {
      try {
        updateData.experience = typeof req.body.experience === 'string' ? JSON.parse(req.body.experience) : req.body.experience;
      } catch (e) {
        console.log('Error parsing experience in update:', e);
        updateData.experience = [];
      }
    } else {
      updateData.experience = []; // Set empty array if not provided
    }

    // Handle file uploads
    if (req.files) {
      // Handle document upload
      if (req.files.document && req.files.document[0]) {
        updateData.document = req.files.document[0].path;
      }
      
      // Handle profile image upload
      if (req.files.profileImage && req.files.profileImage[0]) {
        updateData.photoUrl = req.files.profileImage[0].path;
      }
    } else if (req.file) {
      // Handle single file upload (backward compatibility)
      if (req.file.fieldname === 'document') {
        updateData.document = req.file.path;
      } else if (req.file.fieldname === 'profileImage') {
        updateData.photoUrl = req.file.path;
      }
    }

    console.log('Final update data:', updateData);

    const profile = await Profile.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: false }
    );

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      profile
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: error.message
    });
  }
};

// Delete profile by ID
const deleteProfile = async (req, res) => {
  try {
    const profile = await Profile.findByIdAndDelete(req.params.id);
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }
    res.status(200).json({
      success: true,
      message: 'Profile deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting profile:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting profile',
      error: error.message
    });
  }
};

export {
  createProfile,
  getAllProfiles,
  getProfileById,
  updateProfile,
  deleteProfile
};

import Profile from '../models/Profile.js';

// Create a new profile or update existing one
const createProfile = async (req, res) => {
  try {
    console.log('Received profile creation request:', req.body);
    console.log('Files:', req.file);
    
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
      isPublic
    } = req.body;

    // Parse JSON strings back to arrays
    const skillsArray = typeof skills === 'string' ? JSON.parse(skills) : skills || [];
    const languageArray = typeof language === 'string' ? JSON.parse(language) : language || [];
    const tagsArray = typeof tags === 'string' ? JSON.parse(tags) : tags || [];

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
      isPublic: isPublic === 'true' || isPublic === true
    };

    // Add document path if file was uploaded
    if (req.file) {
      profileData.document = req.file.path;
    }

    console.log('Profile data to save:', profileData);

    // Check if profile already exists for this email
    let existingProfile = await Profile.findOne({ email });
    
    let profile;
    let message;
    
    if (existingProfile) {
      // Update existing profile
      profile = await Profile.findOneAndUpdate(
        { email },
        profileData,
        { new: true, runValidators: true }
      );
      message = 'Profile updated successfully';
      console.log('Profile updated successfully:', profile);
    } else {
      // Create new profile
      profile = new Profile(profileData);
      await profile.save();
      message = 'Profile created successfully';
      console.log('Profile created successfully:', profile);
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
    
    const profiles = await Profile.find(query);
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
    const updateData = { ...req.body };
    
    // Parse JSON strings back to arrays if they exist
    if (req.body.skills) {
      updateData.skills = typeof req.body.skills === 'string' ? JSON.parse(req.body.skills) : req.body.skills;
    }
    if (req.body.language) {
      updateData.language = typeof req.body.language === 'string' ? JSON.parse(req.body.language) : req.body.language;
    }
    if (req.body.tags) {
      updateData.tags = typeof req.body.tags === 'string' ? JSON.parse(req.body.tags) : req.body.tags;
    }

    // Add document path if file was uploaded
    if (req.file) {
      updateData.document = req.file.path;
    }

    const profile = await Profile.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
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

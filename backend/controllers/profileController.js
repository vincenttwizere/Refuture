import Profile from '../models/ProfileModel.js';
import User from '../models/UserModel.js';
import mongoose from 'mongoose';

// Create a new profile or update existing one
const createProfile = async (req, res) => {
  try {
    console.log('=== PROFILE CREATION REQUEST ===');
    console.log('User:', req.user ? req.user.email : 'No user');
    console.log('Request body keys:', Object.keys(req.body));
    console.log('Files:', req.files ? Object.keys(req.files) : 'No files');
    console.log('Raw experience from body:', req.body.experience);
    console.log('Talent fields received:', {
      talentCategory: req.body.talentCategory,
      talentExperience: req.body.talentExperience,
      talentDescription: req.body.talentDescription
    });
    
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
      isPublic,
      // Student-specific fields
      highSchoolSubjects,
      desiredField,
      academicRecords,
      // Undocumented talent-specific fields
      talentCategory,
      talentExperience,
      talentDescription,
      portfolio
    } = req.body;

    // Validate required fields
    if (!option || !fullName || !age || !gender || !nationality || !currentLocation || !email) {
      console.log('Missing required fields:', { option, fullName, age, gender, nationality, currentLocation, email });
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: option, fullName, age, gender, nationality, currentLocation, email'
      });
    }

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
      console.log('Raw experience received:', experience);
      console.log('Experience type:', typeof experience);
      console.log('Experience is array:', Array.isArray(experience));
      try {
        // Check if experience is already an array
        if (Array.isArray(experience)) {
          experienceArray = experience;
        } else {
          experienceArray = typeof experience === 'string' ? JSON.parse(experience) : experience || [];
        }
        console.log('Parsed experience:', experienceArray);
      } catch (e) {
        console.log('Error parsing experience:', e);
        console.log('Raw experience value:', experience);
        experienceArray = [];
      }
    } else {
      experienceArray = []; // Set empty array if not provided
    }

    // Handle academic records - make it optional
    let academicRecordsArray = [];
    if (academicRecords) {
      try {
        academicRecordsArray = typeof academicRecords === 'string' ? JSON.parse(academicRecords) : academicRecords || [];
      } catch (e) {
        console.log('Error parsing academic records:', e);
        academicRecordsArray = [];
      }
    } else {
      academicRecordsArray = []; // Set empty array if not provided
    }

    // Handle portfolio - make it optional
    let portfolioArray = [];
    if (portfolio) {
      try {
        portfolioArray = typeof portfolio === 'string' ? JSON.parse(portfolio) : portfolio || [];
      } catch (e) {
        console.log('Error parsing portfolio:', e);
        portfolioArray = [];
      }
    } else {
      portfolioArray = []; // Set empty array if not provided
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
      isPublic: isPublic === 'true' || isPublic === true,
      // Student-specific fields - only include if not empty
      ...(highSchoolSubjects && highSchoolSubjects.trim() !== '' && { highSchoolSubjects }),
      ...(desiredField && desiredField.trim() !== '' && { desiredField }),
      academicRecords: academicRecordsArray,
      // Undocumented talent-specific fields - only include if provided and not empty
      ...(talentCategory && talentCategory.trim() !== '' && { talentCategory }),
      ...(talentExperience && talentExperience.trim() !== '' && { talentExperience }),
      ...(talentDescription && talentDescription.trim() !== '' && { talentDescription }),
      portfolio: portfolioArray
    };

    console.log('Profile data prepared:', Object.keys(profileData));
    console.log('Final profile data:', JSON.stringify(profileData, null, 2));

    // Handle file uploads
    if (req.files) {
      console.log('Processing uploaded files...');
      // Handle document upload
      if (req.files.document && req.files.document[0]) {
        profileData.document = req.files.document[0].path;
        console.log('Document uploaded:', profileData.document);
      }
      
      // Handle profile image upload
      if (req.files.profileImage && req.files.profileImage[0]) {
        profileData.photoUrl = req.files.profileImage[0].path;
        console.log('Profile image uploaded:', profileData.photoUrl);
      }

      // Handle supporting documents
      if (req.files.supportingDocuments) {
        const supportingDocs = req.files.supportingDocuments.map(file => ({
          path: file.path,
          originalname: file.originalname
        }));
        profileData.supportingDocuments = supportingDocs;
        console.log('Supporting documents uploaded:', supportingDocs.length);
      }
    } else if (req.file) {
      console.log('Processing single file upload...');
      // Handle single file upload (backward compatibility)
      if (req.file.fieldname === 'document') {
        profileData.document = req.file.path;
        console.log('Document uploaded:', profileData.document);
      } else if (req.file.fieldname === 'profileImage') {
        profileData.photoUrl = req.file.path;
        console.log('Profile image uploaded:', profileData.photoUrl);
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
      
      // Update user's hasProfile field
      await User.findOneAndUpdate(
        { email: profileData.email },
        { hasProfile: true }
      );
      
      message = 'Profile created successfully';
    }

    console.log('Profile operation completed successfully');
    res.status(200).json({
      success: true,
      message,
      profile
    });
  } catch (error) {
    console.error('=== PROFILE CREATION ERROR ===');
    console.error('Error creating/updating profile:', error);
    console.error('Error stack:', error.stack);
    
    // Handle validation errors specifically
    if (error.name === 'ValidationError') {
      const validationErrors = Object.keys(error.errors).map(key => {
        return `${key}: ${error.errors[key].message}`;
      }).join(', ');
      
      return res.status(400).json({
        success: false,
        message: 'Profile validation failed',
        error: validationErrors
      });
    }
    
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
    const { email, option } = req.query;
    let query = {};
    
    // If email is provided, filter by email
    if (email) {
      query.email = email;
    }
    
    // If option is provided, filter by option (student, job seeker, undocumented_talent)
    if (option) {
      query.option = option;
    }
    
    console.log('Fetching profiles with query:', query);
    
    // Get profiles that match the query
    const profiles = await Profile.find(query);
    console.log('Found profiles:', profiles.length);
    
    // After fetching profile(s), ensure supportingDocuments is always array of {path, originalname}
    if (profiles && Array.isArray(profiles)) {
      profiles.forEach(profile => {
        if (Array.isArray(profile.supportingDocuments)) {
          profile.supportingDocuments = profile.supportingDocuments.map(doc => {
            if (typeof doc === 'object' && doc !== null && doc.path && doc.originalname) return doc;
            if (typeof doc === 'string') return { path: doc, originalname: doc.split('/').pop() };
            return null;
          }).filter(Boolean);
        }
      });
    }
    
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
    // After fetching profile, ensure supportingDocuments is always array of {path, originalname}
    if (Array.isArray(profile.supportingDocuments)) {
      profile.supportingDocuments = profile.supportingDocuments.map(doc => {
        if (typeof doc === 'object' && doc !== null && doc.path && doc.originalname) return doc;
        if (typeof doc === 'string') return { path: doc, originalname: doc.split('/').pop() };
        return null;
      }).filter(Boolean);
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
    console.log('=== UPDATE PROFILE REQUEST ===');
    console.log('Profile ID:', req.params.id);
    console.log('Request body keys:', Object.keys(req.body));
    console.log('Files:', req.files ? Object.keys(req.files) : 'No files');
    
    const updateData = { ...req.body };
    
    // Parse JSON strings back to arrays if they exist
    if (req.body.skills) {
      try {
        updateData.skills = typeof req.body.skills === 'string' ? JSON.parse(req.body.skills) : req.body.skills;
        console.log('Parsed skills:', updateData.skills);
      } catch (e) {
        console.log('Error parsing skills in update:', e);
        updateData.skills = [];
      }
    }
    if (req.body.language) {
      try {
        updateData.language = typeof req.body.language === 'string' ? JSON.parse(req.body.language) : req.body.language;
        console.log('Parsed language:', updateData.language);
      } catch (e) {
        console.log('Error parsing language in update:', e);
        updateData.language = [];
      }
    }
    if (req.body.tags) {
      try {
        updateData.tags = typeof req.body.tags === 'string' ? JSON.parse(req.body.tags) : req.body.tags;
        console.log('Parsed tags:', updateData.tags);
      } catch (e) {
        console.log('Error parsing tags in update:', e);
        updateData.tags = [];
      }
    }
    if (req.body.education) {
      try {
        updateData.education = typeof req.body.education === 'string' ? JSON.parse(req.body.education) : req.body.education;
        console.log('Parsed education:', updateData.education);
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
        console.log('Parsed experience:', updateData.experience);
      } catch (e) {
        console.log('Error parsing experience in update:', e);
        updateData.experience = [];
      }
    } else {
      updateData.experience = []; // Set empty array if not provided
    }

    // Handle file uploads
    if (req.files) {
      console.log('Processing uploaded files...');
      // Handle document upload
      if (req.files.document && req.files.document[0]) {
        updateData.document = req.files.document[0].path;
        console.log('Document uploaded:', updateData.document);
      }
      
      // Handle profile image upload
      if (req.files.profileImage && req.files.profileImage[0]) {
        updateData.photoUrl = req.files.profileImage[0].path;
        console.log('Profile image uploaded:', updateData.photoUrl);
      }
      // Handle supporting documents merging
      let existingDocs = [];
      if (req.body.existingSupportingDocuments) {
        try {
          const parsed = JSON.parse(req.body.existingSupportingDocuments);
          existingDocs = parsed.map(doc => {
            if (typeof doc === 'object' && doc !== null && doc.path && doc.originalname) return doc;
            if (typeof doc === 'string') return { path: doc, originalname: doc.split('/').pop() };
            return null;
          }).filter(Boolean);
        } catch (e) {
          existingDocs = [];
        }
      }
      let newDocs = [];
      if (req.files.supportingDocuments) {
        newDocs = req.files.supportingDocuments.map(file => ({
          path: file.path,
          originalname: file.originalname
        }));
      }
      updateData.supportingDocuments = [...existingDocs, ...newDocs];
    } else if (req.file) {
      console.log('Processing single file upload...');
      // Handle single file upload (backward compatibility)
      if (req.file.fieldname === 'document') {
        updateData.document = req.file.path;
      } else if (req.file.fieldname === 'profileImage') {
        updateData.photoUrl = req.file.path;
      }
    }

    console.log('Final update data keys:', Object.keys(updateData));
    console.log('About to update profile in database...');

    const profile = await Profile.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: false }
    );

    if (!profile) {
      console.log('Profile not found for ID:', req.params.id);
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    console.log('Profile updated successfully:', profile._id);

    // Ensure user's hasProfile field is set to true
    await User.findOneAndUpdate(
      { email: profile.email },
      { hasProfile: true }
    );

    console.log('User hasProfile status updated for:', profile.email);

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      profile
    });
  } catch (error) {
    console.error('=== UPDATE PROFILE ERROR ===');
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
    const profile = await Profile.findById(req.params.id);
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    // Delete the profile
    await Profile.findByIdAndDelete(req.params.id);

    // Update user's hasProfile status to false
    await User.findOneAndUpdate(
      { email: profile.email },
      { hasProfile: false }
    );

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

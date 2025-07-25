const express = require('express');
const { body, validationResult } = require('express-validator');
const Profile = require('../models/Profile');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');
const mongoose = require('mongoose');

const router = express.Router();

// @desc    Test database connection and Profile model
// @route   GET /api/profiles/test-db
// @access  Public
router.get('/test-db', async (req, res) => {
  try {
    console.log('=== TESTING DATABASE CONNECTION ===');
    
    // Test database connection
    const dbState = mongoose.connection.readyState;
    console.log('Database connection state:', dbState);
    
    // Test Profile model
    const profileCount = await Profile.countDocuments();
    console.log('Total profiles in database:', profileCount);
    
    // Test User model
    const userCount = await User.countDocuments();
    console.log('Total users in database:', userCount);
    
    // Get all profiles to check for duplicates
    const allProfiles = await Profile.find({}).select('email user _id');
    console.log('All profiles:', allProfiles);
    
    // Check for duplicate emails
    const emailCounts = {};
    allProfiles.forEach(profile => {
      emailCounts[profile.email] = (emailCounts[profile.email] || 0) + 1;
    });
    
    const duplicateEmails = Object.entries(emailCounts).filter(([email, count]) => count > 1);
    console.log('Duplicate emails:', duplicateEmails);
    
    res.json({
      success: true,
      message: 'Database connection test successful',
      data: {
        dbState,
        profileCount,
        userCount,
        dbStateText: dbState === 1 ? 'Connected' : 'Not connected',
        allProfiles,
        duplicateEmails
      }
    });
  } catch (error) {
    console.error('Database test error:', error);
    res.status(500).json({
      success: false,
      message: 'Database test failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Test Profile model import
console.log('✅ Profile model imported successfully');
console.log('📋 Profile schema fields:', Object.keys(Profile.schema.paths));

// @desc    Check current user status
// @route   GET /api/profiles/check-user
// @access  Private
router.get('/check-user', protect, async (req, res) => {
  try {
    console.log('=== CHECKING CURRENT USER ===');
    console.log('User from token:', req.user);
    
    // Check if user exists in database
    const user = await User.findById(req.user._id);
    console.log('User found in database:', !!user);
    
    // Check if profile exists for this user
    const profile = await Profile.findOne({ user: req.user._id });
    console.log('Profile exists for user:', !!profile);
    
    if (profile) {
      console.log('Profile details:', {
        id: profile._id,
        email: profile.email,
        fullName: profile.fullName
      });
    }
    
    res.json({
      success: true,
      data: {
        user: {
          id: req.user._id,
          email: req.user.email,
          role: req.user.role
        },
        userExists: !!user,
        profileExists: !!profile,
        profile: profile ? {
          id: profile._id,
          email: profile.email,
          fullName: profile.fullName
        } : null
      }
    });
  } catch (error) {
    console.error('Check user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking user status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @desc    Test profile creation
// @route   POST /api/profiles/test
// @access  Private
router.post('/test', protect, async (req, res) => {
  try {
    console.log('=== TEST PROFILE CREATION ===');
    console.log('User:', req.user);
    
    // Test with minimal data
    const testProfileData = {
      user: req.user._id,
      email: req.user.email,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      option: 'student'
    };
    
    console.log('Test profile data:', testProfileData);
    
    const profile = await Profile.create(testProfileData);
    console.log('Test profile created successfully:', profile._id);
    
    res.json({
      success: true,
      message: 'Test profile created successfully',
      profile
    });
  } catch (error) {
    console.error('Test profile creation error:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    
    if (error.name === 'ValidationError') {
      console.error('Validation errors:', error.errors);
    }
    
    res.status(500).json({
      success: false,
      message: 'Test profile creation failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @desc    Clean up orphaned profiles and duplicates
// @route   POST /api/profiles/cleanup
// @access  Public (for testing)
router.post('/cleanup', async (req, res) => {
  try {
    console.log('=== CLEANING UP ORPHANED PROFILES ===');
    
    // Find profiles without valid users
    const orphanedProfiles = await Profile.find({
      $or: [
        { user: { $exists: false } },
        { user: null },
        { user: { $nin: await User.distinct('_id') } }
      ]
    });
    
    console.log('Found orphaned profiles:', orphanedProfiles.length);
    
    // Find duplicate emails
    const duplicateEmails = await Profile.aggregate([
      {
        $group: {
          _id: '$email',
          count: { $sum: 1 },
          profiles: { $push: '$$ROOT' }
        }
      },
      {
        $match: {
          count: { $gt: 1 }
        }
      }
    ]);
    
    console.log('Found duplicate emails:', duplicateEmails.length);
    
    // Delete orphaned profiles
    if (orphanedProfiles.length > 0) {
      await Profile.deleteMany({ _id: { $in: orphanedProfiles.map(p => p._id) } });
      console.log('Deleted orphaned profiles');
    }
    
    // Keep only the most recent profile for each duplicate email
    for (const duplicate of duplicateEmails) {
      const profiles = duplicate.profiles.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      const toDelete = profiles.slice(1); // Keep the first (most recent), delete the rest
      
      if (toDelete.length > 0) {
        await Profile.deleteMany({ _id: { $in: toDelete.map(p => p._id) } });
        console.log(`Deleted ${toDelete.length} duplicate profiles for email: ${duplicate._id}`);
      }
    }
    
    res.json({
      success: true,
      message: 'Database cleanup completed',
      data: {
        orphanedProfilesDeleted: orphanedProfiles.length,
        duplicateEmailsFixed: duplicateEmails.length
      }
    });
  } catch (error) {
    console.error('Cleanup error:', error);
    res.status(500).json({
      success: false,
      message: 'Cleanup failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @desc    Delete all profiles and drop indexes (for testing)
// @route   DELETE /api/profiles/delete-all
// @access  Public (for testing)
router.delete('/delete-all', async (req, res) => {
  try {
    console.log('=== DELETING ALL PROFILES AND DROPPING INDEXES ===');
    
    // Drop all indexes except _id
    await Profile.collection.dropIndexes();
    console.log('Dropped all indexes');
    
    // Delete all profiles
    const result = await Profile.deleteMany({});
    console.log('Deleted profiles:', result.deletedCount);
    
    // Recreate the correct indexes
    await Profile.collection.createIndex({ user: 1 }, { unique: true });
    await Profile.collection.createIndex({ email: 1 });
    await Profile.collection.createIndex({ isPublic: 1 });
    await Profile.collection.createIndex({ option: 1 });
    await Profile.collection.createIndex({ user: 1, isPublic: 1 });
    console.log('Recreated indexes');
    
    res.json({
      success: true,
      message: 'All profiles deleted and indexes reset',
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Delete all profiles error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete profiles',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @desc    Check for data inconsistencies
// @route   GET /api/profiles/check-inconsistencies
// @access  Private (Admin only)
router.get('/check-inconsistencies', protect, authorize('admin'), async (req, res) => {
  try {
    console.log('=== CHECKING FOR DATA INCONSISTENCIES ===');
    
    // Check for profiles without users
    const orphanedProfiles = await Profile.find({ user: { $exists: false } });
    console.log('Orphaned profiles (no user):', orphanedProfiles.length);
    
    // Check for duplicate emails
    const duplicateEmails = await Profile.aggregate([
      { $group: { _id: '$email', count: { $sum: 1 } } },
      { $match: { count: { $gt: 1 } } }
    ]);
    console.log('Duplicate emails:', duplicateEmails);
    
    // Check for duplicate users
    const duplicateUsers = await Profile.aggregate([
      { $group: { _id: '$user', count: { $sum: 1 } } },
      { $match: { count: { $gt: 1 } } }
    ]);
    console.log('Duplicate users:', duplicateUsers);
    
    res.json({
      success: true,
      data: {
        orphanedProfiles: orphanedProfiles.length,
        duplicateEmails: duplicateEmails.length,
        duplicateUsers: duplicateUsers.length,
        details: {
          orphanedProfiles: orphanedProfiles.map(p => ({ id: p._id, email: p.email })),
          duplicateEmails,
          duplicateUsers
        }
      }
    });
  } catch (error) {
    console.error('Error checking inconsistencies:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking data inconsistencies'
    });
  }
});

// @desc    Test profile creation with minimal data
// @route   POST /api/profiles/test-minimal
// @access  Private
router.post('/test-minimal', protect, async (req, res) => {
  try {
    console.log('=== TESTING MINIMAL PROFILE CREATION ===');
    console.log('User ID:', req.user._id);
    console.log('User email:', req.user.email);
    
    // Create minimal profile data
    const minimalProfileData = {
      user: req.user._id,
      email: req.user.email,
      firstName: 'Test',
      lastName: 'User',
      language: [],
      skills: [],
      tags: [],
      education: [],
      experience: [],
      academicRecords: [],
      portfolio: [],
      isPublic: true
    };
    
    console.log('Minimal profile data:', minimalProfileData);
    
    // Test Profile model validation
    const testProfile = new Profile(minimalProfileData);
    const validationError = testProfile.validateSync();
    
    if (validationError) {
      console.error('Validation error:', validationError);
      return res.status(400).json({
        success: false,
        message: 'Profile validation failed',
        errors: validationError.errors
      });
    }
    
    console.log('Profile validation passed');
    
    // Try to save the profile
    const savedProfile = await testProfile.save();
    
    console.log('Profile saved successfully:', savedProfile._id);
    
    res.json({
      success: true,
      message: 'Minimal profile created successfully',
      profile: savedProfile
    });
    
  } catch (error) {
    console.error('Test profile creation error:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    if (error.name === 'ValidationError') {
      console.error('Validation errors:', error.errors);
      return res.status(400).json({
        success: false,
        message: 'Profile validation failed',
        errors: error.errors
      });
    }
    
    if (error.code === 11000) {
      console.error('Duplicate key error:', error.keyValue);
      return res.status(400).json({
        success: false,
        message: 'Profile already exists for this user',
        error: 'Duplicate key error'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error while creating test profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @desc    Check if user has profile
// @route   GET /api/profiles/check
// @access  Private
router.get('/check', protect, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user._id });
    res.json({
      success: true,
      hasProfile: !!profile,
      profile: profile || null
    });
  } catch (error) {
    console.error('Check profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while checking profile'
    });
  }
});

// @desc    Get all profiles (with filtering)
// @route   GET /api/profiles
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { email, isPublic, role, option } = req.query;
    const filter = {};

    console.log('=== GET PROFILES REQUEST ===');
    console.log('Query params:', req.query);
    console.log('Email filter:', email);
    console.log('Role filter:', role);
    console.log('Option filter:', option);

    if (email) filter.email = email;
    if (isPublic !== undefined) filter.isPublic = isPublic === 'true';
    if (option) filter.option = option;

    console.log('Final filter:', filter);

    let profiles = await Profile.find(filter)
      .populate('user', 'firstName lastName email role')
      .sort({ createdAt: -1 });

    // If role filter is specified, filter by user role
    if (role) {
      profiles = profiles.filter(profile => 
        profile.user && profile.user.role === role
      );
    }

    // Log the profiles for debugging
    console.log('Profiles found:', profiles.length);
    profiles.forEach((profile, index) => {
      console.log(`Profile ${index + 1}:`, {
        id: profile._id,
        email: profile.email,
        fullName: profile.fullName || `${profile.firstName} ${profile.lastName}`,
        option: profile.option,
        userRole: profile.user?.role,
        isPublic: profile.isPublic
      });
    });

    console.log('Found profiles count:', profiles.length);
    if (profiles.length > 0) {
      console.log('First profile:', {
        id: profiles[0]._id,
        email: profiles[0].email,
        fullName: profiles[0].fullName || `${profiles[0].firstName} ${profiles[0].lastName}`,
        option: profiles[0].option,
        userRole: profiles[0].user?.role
      });
    }

    res.json({
      success: true,
      profiles
    });
  } catch (error) {
    console.error('Get profiles error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching profiles'
    });
  }
});

// @desc    Get profile by user ID
// @route   GET /api/profiles/user/:userId
// @access  Private
router.get('/user/:userId', protect, async (req, res) => {
  try {
    console.log('=== GETTING PROFILE FOR USER ===');
    console.log('Requested user ID:', req.params.userId);
    console.log('Current user ID:', req.user._id);
    console.log('User match:', req.params.userId === req.user._id.toString());
    
    const profile = await Profile.findOne({ user: req.params.userId })
      .populate('user', 'firstName lastName email role');
    
    console.log('Profile found:', !!profile);
    
    if (profile) {
      console.log('Profile details:', {
        id: profile._id,
        email: profile.email,
        user: profile.user,
        fullName: profile.fullName
      });
    }

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    res.json({
      success: true,
      profile
    });
  } catch (error) {
    console.error('Get profile by user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching profile'
    });
  }
});

// @desc    Get profile by ID
// @route   GET /api/profiles/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const profile = await Profile.findById(req.params.id)
      .populate('user', 'firstName lastName email role');

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    res.json({
      success: true,
      profile
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching profile'
    });
  }
});

// @desc    Create profile
// @route   POST /api/profiles
// @access  Private (Refugees and Providers)
router.post('/', protect, authorize('refugee', 'provider'), [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('fullName').trim().isLength({ min: 2, max: 100 }).withMessage('Full name must be between 2 and 100 characters'),
  body('phone').optional().trim(),
  body('nationality').optional().trim(),
  body('currentLocation').optional().trim()
], async (req, res) => {
  try {
    console.log('=== PROFILE CREATION REQUEST ===');
    console.log('Request method:', req.method);
    console.log('Request headers:', req.headers);
    console.log('Request body keys:', Object.keys(req.body));
    console.log('Request files:', req.files ? Object.keys(req.files) : 'No files');
    console.log('User:', req.user);
    
    // Log all body fields
    for (const [key, value] of Object.entries(req.body)) {
      console.log(`Body field ${key}:`, typeof value, value);
    }
    
    // Log all request headers
    console.log('Request headers:', req.headers);
    
    // Log parsed data
    console.log('Parsed data check:');
    console.log('- email:', req.body.email);
    console.log('- fullName:', req.body.fullName);
    console.log('- option:', req.body.option);
    console.log('- user ID:', req.user._id);
    
    // Log name splitting
    console.log('Name splitting:');
    console.log('- fullName:', req.body.fullName);
    console.log('- nameParts:', req.body.fullName ? req.body.fullName.trim().split(' ') : []);

    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }

    // Check if profile already exists for this user
    let existingProfile = await Profile.findOne({ user: req.user._id });
    console.log('=== PROFILE EXISTENCE CHECK ===');
    console.log('User ID:', req.user._id);
    console.log('Existing profile found:', !!existingProfile);
    if (existingProfile) {
      console.log('Existing profile ID:', existingProfile._id);
      console.log('Existing profile email:', existingProfile.email);
      console.log('Will update after processing data...');
    } else {
      console.log('No existing profile found for this user');
    }

    // Check if email is already taken by another user
    const emailProfile = await Profile.findOne({ 
      email: req.body.email.trim(),
      user: { $ne: req.user._id } // Exclude current user
    });
    console.log('=== EMAIL CHECK ===');
    console.log('Checking email:', req.body.email.trim());
    console.log('Email taken by another user:', !!emailProfile);
    if (emailProfile) {
      console.log('Email already taken by another user');
      return res.status(400).json({
        success: false,
        message: 'Email is already associated with another profile'
      });
    }

    // Check if user ID is valid
    if (!req.user._id || !mongoose.Types.ObjectId.isValid(req.user._id)) {
      console.log('Invalid user ID:', req.user._id);
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID'
      });
    }

    // Split fullName into firstName and lastName
    const fullName = req.body.fullName || '';
    const nameParts = fullName.trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    // Log the split names
    console.log('- firstName:', firstName);
    console.log('- lastName:', lastName);

    // Validate required fields after splitting
    if (!firstName || firstName.trim() === '') {
      console.log('Missing firstName after splitting fullName');
      return res.status(400).json({
        success: false,
        message: 'First name is required'
      });
    }

    if (!req.body.email || req.body.email.trim() === '') {
      console.log('Missing email');
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Parse JSON fields with error handling
    let skills, language, tags, education, experience, academicRecords, portfolio;
    
    try {
      skills = req.body.skills ? JSON.parse(req.body.skills) : [];
    } catch (e) {
      console.error('Error parsing skills:', e);
      skills = [];
    }
    
    try {
      language = req.body.language ? JSON.parse(req.body.language) : [];
    } catch (e) {
      console.error('Error parsing language:', e);
      language = [];
    }
    
    try {
      tags = req.body.tags ? JSON.parse(req.body.tags) : [];
    } catch (e) {
      console.error('Error parsing tags:', e);
      tags = [];
    }
    
    try {
      education = req.body.education ? JSON.parse(req.body.education) : [];
    } catch (e) {
      console.error('Error parsing education:', e);
      education = [];
    }
    
    try {
      experience = req.body.experience ? JSON.parse(req.body.experience) : [];
    } catch (e) {
      console.error('Error parsing experience:', e);
      experience = [];
    }
    
    try {
      academicRecords = req.body.academicRecords ? JSON.parse(req.body.academicRecords) : [];
    } catch (e) {
      console.error('Error parsing academicRecords:', e);
      academicRecords = [];
    }
    
    try {
      portfolio = req.body.portfolio ? JSON.parse(req.body.portfolio) : [];
    } catch (e) {
      console.error('Error parsing portfolio:', e);
      portfolio = [];
    }

    const profileData = {
      ...req.body,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: req.body.email.trim(),
      skills,
      language,
      tags,
      education,
      experience,
      academicRecords,
      portfolio,
      user: req.user._id
    };

    // Handle file uploads if present
    if (req.files && req.files.profileImage) {
      const profileImage = req.files.profileImage;
      const fileName = `profileImage-${Date.now()}-${Math.random().toString(36).substring(7)}.${profileImage.name.split('.').pop()}`;
      await profileImage.mv(`./uploads/${fileName}`);
      profileData.photoUrl = fileName;
    }

    if (req.files && req.files.document) {
      const document = req.files.document;
      const fileName = `document-${Date.now()}-${Math.random().toString(36).substring(7)}.${document.name.split('.').pop()}`;
      await document.mv(`./uploads/${fileName}`);
      profileData.resumeUrl = fileName;
    }

    // Handle supporting documents
    const supportingDocuments = [];
    
    // Handle existing supporting documents
    if (req.body.existingSupportingDocuments) {
      try {
        const existingDocs = JSON.parse(req.body.existingSupportingDocuments);
        supportingDocuments.push(...existingDocs);
      } catch (e) {
        console.error('Error parsing existing supporting documents:', e);
      }
    }

    // Handle new supporting documents
    if (req.files && req.files.supportingDocuments) {
      const files = Array.isArray(req.files.supportingDocuments) 
        ? req.files.supportingDocuments 
        : [req.files.supportingDocuments];
      
      for (const file of files) {
        const fileName = `supporting-${Date.now()}-${Math.random().toString(36).substring(7)}.${file.name.split('.').pop()}`;
        await file.mv(`./uploads/${fileName}`);
        supportingDocuments.push({
          path: fileName,
          originalname: file.name
        });
      }
    }

    if (supportingDocuments.length > 0) {
      profileData.supportingDocuments = supportingDocuments;
    }

    console.log('Final profile data:', profileData);
    console.log('Final profile data keys:', Object.keys(profileData));
    console.log('Required fields check:');
    console.log('- user:', !!profileData.user);
    console.log('- email:', !!profileData.email);
    console.log('- firstName:', !!profileData.firstName);
    console.log('- lastName:', !!profileData.lastName);
    console.log('Required fields values:');
    console.log('- user:', profileData.user);
    console.log('- email:', profileData.email);
    console.log('- firstName:', profileData.firstName);
    console.log('- lastName:', profileData.lastName);

    console.log('About to create profile with data:', profileData);
    
    // Check if we need to update an existing profile
    if (existingProfile) {
      console.log('Updating existing profile for user:', req.user._id);
      
      try {
        const updatedProfile = await Profile.findByIdAndUpdate(
          existingProfile._id,
          profileData,
          { new: true, runValidators: true }
        );
        
        console.log('Profile updated successfully:', updatedProfile._id);
        
        return res.status(200).json({
          success: true,
          message: 'Profile updated successfully',
          profile: updatedProfile
        });
      } catch (updateError) {
        console.error('Profile update error:', updateError);
        console.error('Error name:', updateError.name);
        console.error('Error message:', updateError.message);
        
        if (updateError.name === 'ValidationError') {
          console.error('Validation errors:', updateError.errors);
          return res.status(400).json({
            success: false,
            message: 'Profile validation failed',
            errors: updateError.errors
          });
        }
        
        throw updateError; // Re-throw to be caught by outer catch block
      }
    }
    
    // Create new profile if no existing profile
    try {
      console.log('=== ATTEMPTING PROFILE CREATION ===');
      console.log('Profile data to create:', JSON.stringify(profileData, null, 2));
      
      // Double-check that no profile exists for this user
      const finalCheck = await Profile.findOne({ user: req.user._id });
      if (finalCheck) {
        console.log('Profile already exists for user, updating instead');
        const updatedProfile = await Profile.findByIdAndUpdate(
          finalCheck._id,
          profileData,
          { new: true, runValidators: true }
        );
        
        console.log('Profile updated successfully:', updatedProfile._id);
        
        return res.status(200).json({
          success: true,
          message: 'Profile updated successfully',
          profile: updatedProfile
        });
      }
      
      const profile = await Profile.create(profileData);
      console.log('Profile created successfully:', profile._id);
      
      res.status(201).json({
        success: true,
        message: 'Profile created successfully',
        profile
      });
    } catch (createError) {
      console.error('Profile creation error:', createError);
      console.error('Error name:', createError.name);
      console.error('Error message:', createError.message);
      console.error('Error code:', createError.code);
      
      if (createError.name === 'ValidationError') {
        console.error('Validation errors:', createError.errors);
        return res.status(400).json({
          success: false,
          message: 'Profile validation failed',
          errors: createError.errors
        });
      }
      
      if (createError.code === 11000) {
        console.error('=== DUPLICATE KEY ERROR DETAILS ===');
        console.error('Duplicate key error:', createError.keyValue);
        console.error('Full error object:', JSON.stringify(createError, null, 2));
        console.error('Error message:', createError.message);
        console.error('Profile data that caused error:', JSON.stringify(profileData, null, 2));
        
        // Check which field caused the duplicate key error
        if (createError.keyValue && createError.keyValue.email) {
          console.error('Email duplicate detected:', createError.keyValue.email);
          return res.status(400).json({
            success: false,
            message: 'Email is already associated with another profile',
            error: 'Duplicate email'
          });
        } else if (createError.keyValue && createError.keyValue.user) {
          console.error('User duplicate detected:', createError.keyValue.user);
          return res.status(400).json({
            success: false,
            message: 'Profile already exists for this user',
            error: 'Duplicate user profile'
          });
        } else {
          console.error('Unknown duplicate key detected:', createError.keyValue);
          return res.status(400).json({
            success: false,
            message: 'Profile with this information already exists',
            error: 'Duplicate key error',
            details: createError.keyValue
          });
        }
      }
      
      throw createError; // Re-throw to be caught by outer catch block
    }
  } catch (error) {
    console.error('Create profile error:', error);
    console.error('Error stack:', error.stack);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    
    // Log validation errors if they exist
    if (error.name === 'ValidationError') {
      console.error('Validation errors:', error.errors);
    }
    
    // Log duplicate key errors
    if (error.code === 11000) {
      console.error('Duplicate key error:', error.keyValue);
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error while creating profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @desc    Update profile
// @route   PUT /api/profiles/:id
// @access  Private (Profile owner or admin)
router.put('/:id', protect, [
  body('fullName').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Full name must be between 2 and 100 characters'),
  body('phone').optional().trim(),
  body('nationality').optional().trim(),
  body('currentLocation').optional().trim()
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const profile = await Profile.findById(req.params.id);

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    // Check if user is authorized to update this profile
    if (req.user.role !== 'admin' && profile.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this profile'
      });
    }

    // Handle fullName splitting if provided
    if (req.body.fullName) {
      const fullName = req.body.fullName || '';
      const nameParts = fullName.trim().split(' ');
      profile.firstName = nameParts[0] || '';
      profile.lastName = nameParts.slice(1).join(' ') || '';
    }

    // Parse JSON fields if provided
    if (req.body.skills) profile.skills = JSON.parse(req.body.skills);
    if (req.body.language) profile.language = JSON.parse(req.body.language);
    if (req.body.tags) profile.tags = JSON.parse(req.body.tags);
    if (req.body.education) profile.education = JSON.parse(req.body.education);
    if (req.body.experience) profile.experience = JSON.parse(req.body.experience);
    if (req.body.academicRecords) profile.academicRecords = JSON.parse(req.body.academicRecords);
    if (req.body.portfolio) profile.portfolio = JSON.parse(req.body.portfolio);

    // Handle file uploads if present
    if (req.files && req.files.profileImage) {
      const profileImage = req.files.profileImage;
      const fileName = `profileImage-${Date.now()}-${Math.random().toString(36).substring(7)}.${profileImage.name.split('.').pop()}`;
      await profileImage.mv(`./uploads/${fileName}`);
      profile.photoUrl = fileName;
    }

    // Handle image removal
    if (req.body.removeProfileImage === 'true') {
      profile.photoUrl = undefined;
    }

    // Update other fields
    Object.keys(req.body).forEach(key => {
      if (key !== 'user' && key !== '_id' && key !== 'fullName' && 
          key !== 'skills' && key !== 'language' && key !== 'tags' && 
          key !== 'education' && key !== 'experience' && key !== 'academicRecords' && key !== 'portfolio' &&
          key !== 'removeProfileImage') {
        profile[key] = req.body[key];
      }
    });

    await profile.save();

    res.json({
      success: true,
      profile
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating profile'
    });
  }
});

// @desc    Delete profile
// @route   DELETE /api/profiles/:id
// @access  Private (Profile owner or admin)
router.delete('/:id', protect, async (req, res) => {
  try {
    const profile = await Profile.findById(req.params.id);

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    // Check if user is authorized to delete this profile
    if (req.user.role !== 'admin' && profile.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this profile'
      });
    }

    await profile.remove();

    res.json({
      success: true,
      message: 'Profile deleted successfully'
    });
  } catch (error) {
    console.error('Delete profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting profile'
    });
  }
});

// @desc    Drop problematic indexes (temporary fix)
// @route   POST /api/profiles/drop-indexes
// @access  Private
router.post('/drop-indexes', protect, async (req, res) => {
  try {
    console.log('=== DROPPING PROBLEMATIC INDEXES ===');
    
    // Get the collection
    const collection = mongoose.connection.collection('profiles');
    
    // List all indexes
    const indexes = await collection.indexes();
    console.log('Current indexes:', indexes);
    
    // Drop the problematic compound index that includes both education and skills
    try {
      await collection.dropIndex('personalInfo.countryOfOrigin_1_education.fieldOfStudy_1_skills.name_1');
      console.log('Dropped problematic compound index');
    } catch (e) {
      console.log('Compound index not found or already dropped:', e.message);
    }
    
    // Drop other potentially problematic indexes
    try {
      await collection.dropIndex('skills_1');
      console.log('Dropped skills index');
    } catch (e) {
      console.log('Skills index not found or already dropped');
    }
    
    try {
      await collection.dropIndex('education_1');
      console.log('Dropped education index');
    } catch (e) {
      console.log('Education index not found or already dropped');
    }
    
    try {
      await collection.dropIndex('experience_1');
      console.log('Dropped experience index');
    } catch (e) {
      console.log('Experience index not found or already dropped');
    }
    
    try {
      await collection.dropIndex('academicRecords_1');
      console.log('Dropped academicRecords index');
    } catch (e) {
      console.log('AcademicRecords index not found or already dropped');
    }
    
    try {
      await collection.dropIndex('portfolio_1');
      console.log('Dropped portfolio index');
    } catch (e) {
      console.log('Portfolio index not found or already dropped');
    }
    
    // List indexes after dropping
    const newIndexes = await collection.indexes();
    console.log('Indexes after cleanup:', newIndexes);
    
    res.json({
      success: true,
      message: 'Problematic indexes dropped successfully',
      indexes: newIndexes
    });
    
  } catch (error) {
    console.error('Error dropping indexes:', error);
    res.status(500).json({
      success: false,
      message: 'Error dropping indexes',
      error: error.message
    });
  }
});

module.exports = router; 
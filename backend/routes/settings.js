const express = require('express');
const { body, validationResult } = require('express-validator');
const UserSettings = require('../models/UserSettings');
const Profile = require('../models/Profile');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @desc    Get user settings
// @route   GET /api/settings
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    let settings = await UserSettings.findOne({ user: req.user._id });
    
    if (!settings) {
      // Create default settings if none exist
      settings = await UserSettings.create({
        user: req.user._id,
        ...UserSettings.getDefaultSettings()
      });
    }
    
    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch settings',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @desc    Update user settings
// @route   PUT /api/settings
// @access  Private
router.put('/', protect, [
  body('notifications.email').optional().isBoolean(),
  body('notifications.push').optional().isBoolean(),
  body('notifications.types.opportunities').optional().isBoolean(),
  body('notifications.types.interviews').optional().isBoolean(),
  body('notifications.types.messages').optional().isBoolean(),
  body('notifications.types.applications').optional().isBoolean(),
  body('privacy.profileVisibility').optional().isIn(['public', 'private', 'hidden']),
  body('privacy.showContactInfo').optional().isBoolean(),
  body('privacy.allowMessages').optional().isBoolean(),
  body('preferences.language').optional().isIn(['en', 'fr', 'es', 'ar']),
  body('preferences.timezone').optional().isString(),
  body('preferences.darkMode').optional().isBoolean(),
  body('preferences.theme').optional().isIn(['light', 'dark', 'auto']),
  body('application.autoSave').optional().isBoolean(),
  body('application.defaultCoverLetter').optional().isString(),
  body('application.preferredOpportunityTypes').optional().isArray()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    let settings = await UserSettings.findOne({ user: req.user._id });
    
    if (!settings) {
      settings = new UserSettings({
        user: req.user._id,
        ...UserSettings.getDefaultSettings()
      });
    }

    // Update settings
    await settings.updateSettings(req.body);
    
    // Apply privacy settings to profile if profile visibility changed
    if (req.body.privacy?.profileVisibility) {
      await Profile.updateMany(
        { user: req.user._id },
        { isPublic: req.body.privacy.profileVisibility === 'public' }
      );
    }

    res.json({
      success: true,
      message: 'Settings updated successfully',
      data: settings
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update settings',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @desc    Reset settings to default
// @route   POST /api/settings/reset
// @access  Private
router.post('/reset', protect, async (req, res) => {
  try {
    const defaultSettings = UserSettings.getDefaultSettings();
    
    let settings = await UserSettings.findOne({ user: req.user._id });
    
    if (!settings) {
      settings = new UserSettings({
        user: req.user._id,
        ...defaultSettings
      });
    } else {
      Object.assign(settings, defaultSettings);
    }
    
    await settings.save();
    
    res.json({
      success: true,
      message: 'Settings reset to default',
      data: settings
    });
  } catch (error) {
    console.error('Error resetting settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset settings',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @desc    Get settings for specific section
// @route   GET /api/settings/:section
// @access  Private
router.get('/:section', protect, async (req, res) => {
  try {
    const { section } = req.params;
    const validSections = ['notifications', 'privacy', 'preferences', 'application'];
    
    if (!validSections.includes(section)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid section'
      });
    }
    
    let settings = await UserSettings.findOne({ user: req.user._id });
    
    if (!settings) {
      settings = await UserSettings.create({
        user: req.user._id,
        ...UserSettings.getDefaultSettings()
      });
    }
    
    res.json({
      success: true,
      data: settings[section]
    });
  } catch (error) {
    console.error('Error fetching section settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch section settings',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @desc    Update specific section settings
// @route   PUT /api/settings/:section
// @access  Private
router.put('/:section', protect, async (req, res) => {
  try {
    const { section } = req.params;
    const validSections = ['notifications', 'privacy', 'preferences', 'application'];
    
    if (!validSections.includes(section)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid section'
      });
    }
    
    let settings = await UserSettings.findOne({ user: req.user._id });
    
    if (!settings) {
      settings = new UserSettings({
        user: req.user._id,
        ...UserSettings.getDefaultSettings()
      });
    }
    
    // Update specific section
    settings[section] = { ...settings[section], ...req.body };
    await settings.save();
    
    // Apply privacy settings to profile if profile visibility changed
    if (section === 'privacy' && req.body.profileVisibility) {
      await Profile.updateMany(
        { user: req.user._id },
        { isPublic: req.body.profileVisibility === 'public' }
      );
    }
    
    res.json({
      success: true,
      message: `${section} settings updated successfully`,
      data: settings[section]
    });
  } catch (error) {
    console.error('Error updating section settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update section settings',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router; 
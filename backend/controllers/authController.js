import User from '../models/UserModel.js';
import Profile from '../models/ProfileModel.js';
import generateToken from '../utils/generateToken.js';
import { sendWelcomeEmail } from '../utils/sendEmail.js';

// @desc    Register user
// @route   POST /api/auth/signup
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { email, password, firstName, lastName, role } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user
    const user = await User.create({
      email,
      password,
      firstName,
      lastName,
      role
    });

    if (user) {
      // Send welcome email
      try {
        await sendWelcomeEmail(user.email, user.firstName);
      } catch (emailError) {
        console.error('Failed to send welcome email:', emailError);
      }
      const token = generateToken(user._id, user.role);
      
      // Determine redirect based on role
      let redirectTo = '/';
      if (role === 'admin') redirectTo = '/admin-dashboard';
      else if (role === 'provider') redirectTo = '/provider-dashboard';
      else if (role === 'refugee') {
        redirectTo = '/refugee-dashboard';
      }

      res.status(201).json({
        success: true,
        token,
        user: user.toPublicJSON(),
        redirectTo
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Block login for suspended, rejected, or deleted users
    if (user.isActive === false) {
      return res.status(403).json({ message: 'Your account has been deleted. Please contact support if you believe this is a mistake.' });
    }
    if (user.status === 'rejected') {
      return res.status(403).json({ message: 'Your registration was rejected by the platform administrators.' });
    }
    if (user.status === 'suspended') {
      return res.status(403).json({ message: 'Your account has been suspended. Please contact support for more information.' });
    }
    if (user.status !== 'active') {
      return res.status(403).json({ message: 'Your account is not active. Please contact support.' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user._id, user.role);
    
    // Determine redirect based on role
    let redirectTo = '/';
    if (user.role === 'admin') redirectTo = '/admin-dashboard';
    else if (user.role === 'provider') redirectTo = '/provider-dashboard';
    else if (user.role === 'refugee') {
      redirectTo = '/refugee-dashboard';
    }

    res.json({
      success: true,
      token,
      user: user.toPublicJSON(),
      redirectTo
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (user) {
      user.firstName = req.body.firstName || user.firstName;
      user.lastName = req.body.lastName || user.lastName;
      user.email = req.body.email || user.email;
      
      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();
      
      res.json({
        success: true,
        user: updatedUser.toPublicJSON()
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export {
  registerUser,
  loginUser,
  getCurrentUser,
  updateUserProfile
}; 
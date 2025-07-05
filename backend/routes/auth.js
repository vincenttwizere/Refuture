import express from 'express';
import User from '../models/UserModel.js';
import { protect } from '../middleware/authMiddleware.js';
import generateToken from '../utils/generateToken.js';

const router = express.Router();

// Signup
router.post('/signup', async (req, res) => {
  try {
    const { email, password, firstName, lastName, role } = req.body;

    // Validate required fields
    if (!email || !password || !firstName || !lastName || !role) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    if (!['refugee', 'provider', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role. Must be refugee, provider, or admin' });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }
    const user = new User({ email, password, firstName, lastName, role, hasProfile: false });
    await user.save();
    const token = generateToken(user._id, user.role);
    res.status(201).json({
      success: true,
      message: 'User created successfully',
      token,
      user: user.toPublicJSON(),
      redirectTo: getRedirectPath(user.role, user.hasProfile)
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Error creating user', error: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    if (!user.isActive) {
      return res.status(401).json({ message: 'Account is deactivated' });
    }
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    user.lastLogin = new Date();
    await user.save();
    const token = generateToken(user._id, user.role);
    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: user.toPublicJSON(),
      redirectTo: getRedirectPath(user.role, user.hasProfile)
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error during login', error: error.message });
  }
});

// Get current user
router.get('/me', protect, async (req, res) => {
  try {
    res.json({
      success: true,
      user: req.user.toPublicJSON(),
      redirectTo: getRedirectPath(req.user.role, req.user.hasProfile)
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Error fetching user data', error: error.message });
  }
});

function getRedirectPath(role, hasProfile) {
  switch (role) {
    case 'refugee':
      return hasProfile ? '/refugee-dashboard' : '/create-profile';
    case 'provider':
      return '/provider-dashboard';
    case 'admin':
      return '/admin-dashboard';
    default:
      return '/';
  }
}

export default router; 
import express from 'express';
import { uploadMultiple } from '../middleware/uploadMiddleware.js';
import { protect } from '../middleware/authMiddleware.js';
import { createProfile, getAllProfiles, getProfileById, updateProfile, deleteProfile } from '../controllers/profileController.js';

const router = express.Router();

// CREATE profile (POST /api/profiles)
router.post('/', protect, uploadMultiple, createProfile);

// READ all profiles (GET /api/profiles)
router.get('/', getAllProfiles);

// READ one profile by ID (GET /api/profiles/:id)
router.get('/:id', getProfileById);

// UPDATE profile by ID (PUT /api/profiles/:id)
router.put('/:id', protect, uploadMultiple, updateProfile);

router.delete('/:id', protect, deleteProfile);

export default router;

import express from 'express';
import upload from '../middleware/uploadMiddleware.js';
import { createProfile, getAllProfiles, getProfileById, updateProfile, deleteProfile } from '../controllers/profileController.js';

const router = express.Router();

// CREATE profile (POST /api/profiles)
router.post('/', upload.single('document'), createProfile);

// READ all profiles (GET /api/profiles)
router.get('/', getAllProfiles);

// READ one profile by ID (GET /api/profiles/:id)
router.get('/:id', getProfileById);

// UPDATE profile by ID (PUT /api/profiles/:id)
router.put('/:id', upload.single('document'), updateProfile);

router.delete('/:id', deleteProfile);

export default router;

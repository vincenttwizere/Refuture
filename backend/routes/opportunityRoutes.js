import express from 'express';
import {
  createOpportunity,
  getAllOpportunities,
  getOpportunityById,
  updateOpportunity,
  deleteOpportunity,
  getOpportunitiesByProvider
} from '../controllers/opportunityController.js';
import { protect, provider, admin } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getAllOpportunities);
router.get('/:id', getOpportunityById);
router.get('/provider/:providerId', getOpportunitiesByProvider);

// Protected routes (Providers and Admins)
router.post('/', protect, provider, upload.array('attachments', 5), createOpportunity);
router.put('/:id', protect, upload.array('attachments', 5), updateOpportunity);
router.delete('/:id', protect, deleteOpportunity);

export default router; 
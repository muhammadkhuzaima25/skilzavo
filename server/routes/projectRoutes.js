import express from 'express';
import {
  getProject,
  getUserProjects,
  updateProjectStatus,
  updateTimeline,
  markPhaseComplete,
  getAllProjects,
} from '../controllers/projectController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/all', protect, adminOnly, getAllProjects);
router.get('/my', protect, getUserProjects);
router.get('/:id', protect, getProject);
router.put('/:id/status', protect, updateProjectStatus);
router.put('/:id/timeline', protect, updateTimeline);
router.put('/:id/timeline/:phaseIndex/complete', protect, markPhaseComplete);

export default router;

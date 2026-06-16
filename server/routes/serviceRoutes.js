import express from 'express';
import {
  getServices,
  getService,
  getMyServices,
  createService,
  updateService,
  deleteService,
} from '../controllers/serviceController.js';
import { protect, providerOnly } from '../middleware/authMiddleware.js';
import { uploadSingle } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.get('/', getServices);
router.get('/my-services', protect, providerOnly, getMyServices);
router.get('/:id', getService);
router.post('/', protect, providerOnly, uploadSingle, createService);
router.put('/:id', protect, uploadSingle, updateService);
router.delete('/:id', protect, deleteService);

export default router;

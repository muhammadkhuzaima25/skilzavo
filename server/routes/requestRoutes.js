import express from 'express';
import {
  createRequest,
  getCustomerRequests,
  getProviderRequests,
  updateRequestStatus,
} from '../controllers/requestController.js';
import { protect, providerOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, createRequest);
router.get('/customer', protect, getCustomerRequests);
router.get('/provider', protect, providerOnly, getProviderRequests);
router.put('/:id', protect, updateRequestStatus);

export default router;

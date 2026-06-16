import express from 'express';
import rateLimit from 'express-rate-limit';
import { register, login, getMe, updateProfile, getProviderById, getAllUsers, addPortfolio, updatePortfolio, deletePortfolio, uploadProfilePicture, deleteProfilePicture, updatePassword, googleAuth } from '../controllers/authController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';
import { uploadSingle } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// --- Rate Limiter for Authentication ---
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes ka window
  max: 5, // Har IP se maximum 5 requests allow hongi
  message: {
    status: 429,
    message: 'Too many authentication attempts from this IP, please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false, 
});


router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/google', authLimiter, googleAuth);


router.get('/me', protect, getMe);
router.put('/profile', protect, uploadSingle, updateProfile);
router.get('/providers/:id', getProviderById);
router.get('/users', protect, adminOnly, getAllUsers);
router.post('/portfolio', protect, uploadSingle, addPortfolio);
router.put('/portfolio/:id', protect, uploadSingle, updatePortfolio);
router.delete('/portfolio/:id', protect, deletePortfolio);
router.put('/profile-picture', protect, uploadSingle, uploadProfilePicture);
router.delete('/profile-picture', protect, deleteProfilePicture);
router.put('/password', protect, updatePassword);

export default router;

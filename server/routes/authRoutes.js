import express from 'express';
import { register, login, getMe, updateProfile, getProviderById, getAllUsers, addPortfolio, updatePortfolio, deletePortfolio, uploadProfilePicture, deleteProfilePicture, updatePassword, googleAuth } from '../controllers/authController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';
import { uploadSingle } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleAuth);
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

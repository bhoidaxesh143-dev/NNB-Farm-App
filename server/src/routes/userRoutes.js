import express from 'express';
import * as userController from '../controllers/userController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Profile routes (current user)
router.get('/profile/me', protect, userController.getProfile);
router.put('/profile/me', protect, userController.updateProfile);

// Admin routes
router.get('/', protect, authorize('admin'), userController.getUsers);
router.get('/:id', protect, authorize('admin'), userController.getUserById);
router.put('/:id', protect, authorize('admin'), userController.updateUser);
router.delete('/:id', protect, authorize('admin'), userController.deleteUser);

export default router;


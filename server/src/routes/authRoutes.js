import express from 'express';
import * as authController from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { registerValidator, loginValidator } from '../validators/authValidator.js';
import { authRateLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Public routes
router.post('/register', authRateLimiter, registerValidator, validate, authController.register);
router.post('/login', authRateLimiter, loginValidator, validate, authController.login);
router.post('/refresh', authController.refreshToken);

// Protected routes
router.post('/logout', protect, authController.logout);
router.get('/me', protect, authController.getMe);

export default router;


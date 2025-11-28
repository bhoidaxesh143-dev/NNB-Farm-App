import express from 'express';
import * as healthController from '../controllers/healthController.js';

const router = express.Router();

router.get('/health', healthController.healthCheck);
router.get('/readiness', healthController.readinessCheck);

export default router;


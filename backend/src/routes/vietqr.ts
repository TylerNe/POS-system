import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { vietQRController } from '../controllers/vietQRController';

const router = express.Router();

// VietQR Settings routes
router.get('/settings', authenticateToken, vietQRController.getSettings);
router.post('/settings', authenticateToken, vietQRController.saveSettings);
router.put('/settings', authenticateToken, vietQRController.updateSettings);

export default router;

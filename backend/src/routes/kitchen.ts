import express from 'express';
import { getKitchenOrders, updateOrderStatus, subscribeToUpdates } from '../controllers/kitchenController';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = express.Router();

// Get all kitchen orders
router.get('/orders', authenticateToken, requireRole(['admin', 'cashier']), getKitchenOrders);

// Update order status
router.put('/orders/:orderId/status', authenticateToken, requireRole(['admin', 'cashier']), updateOrderStatus);

// Subscribe to real-time updates (authentication handled in controller)
router.get('/updates', subscribeToUpdates);

export default router;

import express from 'express';
import {
  getAllOrders,
  getOrderById,
  createOrder,
  getOrderStats
} from '../controllers/orderController';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = express.Router();

// All order routes require authentication
router.use(authenticateToken);

// Get all orders
router.get('/', requireRole(['admin', 'cashier']), getAllOrders);

// Get order statistics
router.get('/stats', requireRole(['admin', 'cashier']), getOrderStats);

// Get specific order
router.get('/:id', requireRole(['admin', 'cashier']), getOrderById);

// Create new order
router.post('/', requireRole(['admin', 'cashier']), createOrder);

export default router;

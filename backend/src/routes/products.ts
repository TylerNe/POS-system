import express from 'express';
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories
} from '../controllers/productController';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = express.Router();

// Public routes (for POS usage)
router.get('/', getAllProducts);
router.get('/categories', getCategories);
router.get('/:id', getProductById);

// Protected routes (require authentication)
router.post('/', authenticateToken, requireRole(['admin', 'cashier']), createProduct);
router.put('/:id', authenticateToken, requireRole(['admin', 'cashier']), updateProduct);
router.delete('/:id', authenticateToken, requireRole(['admin']), deleteProduct);

export default router;

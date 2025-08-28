import express from 'express';
import { 
  register, 
  login, 
  getProfile, 
  getAllUsers, 
  createUser, 
  updateUser, 
  deleteUser,
  refreshToken
} from '../controllers/authController';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Token refresh route (requires expired token)
router.post('/refresh', refreshToken);

// Protected routes
router.get('/profile', authenticateToken, getProfile);

// Admin-only user management routes
router.get('/users', authenticateToken, requireRole(['admin']), getAllUsers);
router.post('/users', authenticateToken, requireRole(['admin']), createUser);
router.put('/users/:id', authenticateToken, requireRole(['admin']), updateUser);
router.delete('/users/:id', authenticateToken, requireRole(['admin']), deleteUser);

export default router;

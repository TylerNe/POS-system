import express from 'express';
import { getSettings, updateSettings, getCurrency, updateCurrency, getLanguage, updateLanguage } from '../controllers/settingsController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Get all settings
router.get('/', getSettings);

// Update a setting
router.put('/', updateSettings);

// Get currency setting
router.get('/currency', getCurrency);

// Update currency setting
router.put('/currency', updateCurrency);

// Get language setting
router.get('/language', getLanguage);

// Update language setting
router.put('/language', updateLanguage);

export default router;

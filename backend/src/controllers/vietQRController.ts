import { Request, Response } from 'express';
import db from '../config/database';

interface VietQRSettings {
  bankAccounts: Array<{
    accountNumber: string;
    accountName: string;
    bankCode: string;
    bankName: string;
    isActive: boolean;
  }>;
  defaultBankCode: string;
  qrCodeSize: number;
  autoRefresh: boolean;
  timeoutMinutes: number;
}

export const vietQRController = {
  // Get VietQR settings
  getSettings: async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      
      // Get settings from database
      const result = await db.query(
        'SELECT settings FROM vietqr_settings WHERE user_id = $1',
        [userId]
      );

      if (result.rows.length > 0) {
        res.json(result.rows[0].settings);
      } else {
        // Return default settings if none exist
        const defaultSettings: VietQRSettings = {
          bankAccounts: [
            {
              accountNumber: '1234567890',
              accountName: 'DEMO ACCOUNT',
              bankCode: 'VCB',
              bankName: 'Vietcombank',
              isActive: true
            }
          ],
          defaultBankCode: 'VCB',
          qrCodeSize: 300,
          autoRefresh: true,
          timeoutMinutes: 5
        };
        res.json(defaultSettings);
      }
    } catch (error) {
      console.error('Error getting VietQR settings:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Save VietQR settings
  saveSettings: async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const settings: VietQRSettings = req.body;

      // Check if settings already exist
      const existing = await db.query(
        'SELECT id FROM vietqr_settings WHERE user_id = $1',
        [userId]
      );

      if (existing.rows.length > 0) {
        // Update existing settings
        await db.query(
          'UPDATE vietqr_settings SET settings = $1, updated_at = NOW() WHERE user_id = $2',
          [JSON.stringify(settings), userId]
        );
      } else {
        // Insert new settings
        await db.query(
          'INSERT INTO vietqr_settings (user_id, settings, created_at, updated_at) VALUES ($1, $2, NOW(), NOW())',
          [userId, JSON.stringify(settings)]
        );
      }

      res.json({ message: 'Settings saved successfully' });
    } catch (error) {
      console.error('Error saving VietQR settings:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Update VietQR settings
  updateSettings: async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const settings: VietQRSettings = req.body;

      // Update settings
      const result = await db.query(
        'UPDATE vietqr_settings SET settings = $1, updated_at = NOW() WHERE user_id = $2 RETURNING *',
        [JSON.stringify(settings), userId]
      );

      if (result.rows.length === 0) {
        // If no settings exist, create new ones
        await db.query(
          'INSERT INTO vietqr_settings (user_id, settings, created_at, updated_at) VALUES ($1, $2, NOW(), NOW())',
          [userId, JSON.stringify(settings)]
        );
      }

      res.json({ message: 'Settings updated successfully' });
    } catch (error) {
      console.error('Error updating VietQR settings:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

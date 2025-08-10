import { Request, Response } from 'express';
import pool from '../config/database';

export const getSettings = async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT key, value FROM system_settings');
    
    const settings: any = {};
    result.rows.forEach(row => {
      settings[row.key] = row.value;
    });
    
    res.json({ settings });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateSettings = async (req: Request, res: Response) => {
  try {
    const { key, value } = req.body;
    
    if (!key || !value) {
      return res.status(400).json({ error: 'Key and value are required' });
    }
    
    const result = await pool.query(
      `INSERT INTO system_settings (key, value) 
       VALUES ($1, $2) 
       ON CONFLICT (key) 
       DO UPDATE SET value = $2, updated_at = CURRENT_TIMESTAMP 
       RETURNING *`,
      [key, value]
    );
    
    res.json({ 
      message: 'Setting updated successfully',
      setting: result.rows[0]
    });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getCurrency = async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      'SELECT value FROM system_settings WHERE key = $1',
      ['currency']
    );
    
    if (result.rows.length === 0) {
      // Return default currency if not set
      return res.json({
        currency: {
          code: 'VND',
          symbol: '₫',
          name: 'Vietnamese Dong'
        }
      });
    }
    
    res.json({ currency: result.rows[0].value });
  } catch (error) {
    console.error('Get currency error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateCurrency = async (req: Request, res: Response) => {
  try {
    const { code, symbol, name } = req.body;
    
    if (!code || !symbol || !name) {
      return res.status(400).json({ error: 'Code, symbol, and name are required' });
    }
    
    const currencyValue = { code, symbol, name };
    
    const result = await pool.query(
      `INSERT INTO system_settings (key, value) 
       VALUES ('currency', $1) 
       ON CONFLICT (key) 
       DO UPDATE SET value = $1, updated_at = CURRENT_TIMESTAMP 
       RETURNING *`,
      [currencyValue]
    );
    
    res.json({ 
      message: 'Currency updated successfully',
      currency: result.rows[0].value
    });
  } catch (error) {
    console.error('Update currency error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getLanguage = async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      'SELECT value FROM system_settings WHERE key = $1',
      ['language']
    );
    
    if (result.rows.length === 0) {
      // Return default language if not set
      return res.json({
        language: {
          code: 'vi',
          name: 'Vietnamese'
        }
      });
    }
    
    res.json({ language: result.rows[0].value });
  } catch (error) {
    console.error('Get language error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateLanguage = async (req: Request, res: Response) => {
  try {
    const { code, name } = req.body;
    
    if (!code || !name) {
      return res.status(400).json({ error: 'Code and name are required' });
    }
    
    const languageValue = { code, name };
    
    const result = await pool.query(
      `INSERT INTO system_settings (key, value) 
       VALUES ('language', $1) 
       ON CONFLICT (key) 
       DO UPDATE SET value = $1, updated_at = CURRENT_TIMESTAMP 
       RETURNING *`,
      [languageValue]
    );
    
    res.json({ 
      message: 'Language updated successfully',
      language: result.rows[0].value
    });
  } catch (error) {
    console.error('Update language error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

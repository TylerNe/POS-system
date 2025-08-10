import pool from '../config/database';

async function addLanguageField() {
  try {
    console.log('Adding language field to settings...');
    
    // Insert default language setting
    await pool.query(`
      INSERT INTO system_settings (key, value) 
      VALUES ('language', '{"code": "vi", "name": "Vietnamese"}')
      ON CONFLICT (key) DO NOTHING
    `);
    
    console.log('✅ Default language setting added successfully!');
    
  } catch (error) {
    console.error('❌ Error adding language field:', error);
  } finally {
    await pool.end();
  }
}

addLanguageField();

import pool from '../config/database';

async function addCurrencyField() {
  try {
    console.log('Adding currency field to settings...');
    
    // Create settings table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS system_settings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        key VARCHAR(100) UNIQUE NOT NULL,
        value JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    console.log('✅ Settings table created/verified successfully!');
    
    // Insert default currency setting
    await pool.query(`
      INSERT INTO system_settings (key, value) 
      VALUES ('currency', '{"code": "VND", "symbol": "₫", "name": "Vietnamese Dong"}')
      ON CONFLICT (key) DO NOTHING
    `);
    
    console.log('✅ Default currency setting added successfully!');
    
    // Create trigger for updated_at
    await pool.query(`
      CREATE TRIGGER update_system_settings_updated_at 
      BEFORE UPDATE ON system_settings
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
    `);
    
    console.log('✅ Settings trigger created successfully!');
    
  } catch (error) {
    console.error('❌ Error adding currency field:', error);
  } finally {
    await pool.end();
  }
}

addCurrencyField();

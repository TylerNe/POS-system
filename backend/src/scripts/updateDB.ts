import db from '../config/database';

async function updateDatabase() {
  try {
    console.log('🔄 Adding VietQR settings table...');
    
    // Add VietQR Settings table
    await db.query(`
      CREATE TABLE IF NOT EXISTS vietqr_settings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        settings JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Add index
    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_vietqr_settings_user_id ON vietqr_settings(user_id);
    `);
    
    // Add trigger if it doesn't exist
    await db.query(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_vietqr_settings_updated_at') THEN
          CREATE TRIGGER update_vietqr_settings_updated_at BEFORE UPDATE ON vietqr_settings
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        END IF;
      END $$;
    `);
    
    console.log('✅ VietQR settings table added successfully!');
    
    // Test the new VietQR settings table
    console.log('🧪 Testing VietQR settings table...');
    const testResult = await db.query('SELECT * FROM vietqr_settings LIMIT 1');
    console.log('✅ VietQR settings table is working!');
    
  } catch (error) {
    console.error('❌ Error updating database:', error);
  } finally {
    await db.end();
  }
}

updateDatabase();

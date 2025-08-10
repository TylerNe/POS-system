import pool from '../config/database';

async function addMetadataField() {
  try {
    console.log('Adding metadata field to orders table...');
    
    // Add metadata column to orders table
    await pool.query(`
      ALTER TABLE orders 
      ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb
    `);
    
    console.log('✅ Metadata field added successfully!');
    
    // Create index for better performance
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_orders_metadata 
      ON orders USING GIN (metadata)
    `);
    
    console.log('✅ Metadata index created successfully!');
    
  } catch (error) {
    console.error('❌ Error adding metadata field:', error);
  } finally {
    await pool.end();
  }
}

addMetadataField();

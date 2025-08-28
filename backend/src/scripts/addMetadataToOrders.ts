import pool from '../config/database';

const addMetadataToOrders = async () => {
  try {
    console.log('Adding metadata column to orders table...');
    
    // Check if metadata column already exists
    const checkResult = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'orders' AND column_name = 'metadata'
    `);

    if (checkResult.rows.length > 0) {
      console.log('Metadata column already exists in orders table');
      return;
    }

    // Add metadata column
    await pool.query(`
      ALTER TABLE orders 
      ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb
    `);

    console.log('Successfully added metadata column to orders table');
  } catch (error) {
    console.error('Error adding metadata column:', error);
    throw error;
  } finally {
    await pool.end();
  }
};

addMetadataToOrders();

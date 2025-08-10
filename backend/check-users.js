const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'pos_system',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
});

async function checkUsers() {
  try {
    console.log('🔍 Checking users in database...');
    
    const result = await pool.query('SELECT id, username, email, role FROM users');
    
    if (result.rows.length === 0) {
      console.log('❌ No users found in database');
      console.log('🔧 Creating default users...');
      
      // Create admin user
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      await pool.query(
        'INSERT INTO users (username, email, password, role) VALUES ($1, $2, $3, $4)',
        ['admin', 'admin@pos.com', hashedPassword, 'admin']
      );
      
      // Create cashier user
      const hashedCashierPassword = await bcrypt.hash('cashier123', 10);
      await pool.query(
        'INSERT INTO users (username, email, password, role) VALUES ($1, $2, $3, $4)',
        ['cashier1', 'cashier1@pos.com', hashedCashierPassword, 'cashier']
      );
      
      console.log('✅ Default users created:');
      console.log('   - admin / admin123');
      console.log('   - cashier1 / cashier123');
    } else {
      console.log('✅ Users found in database:');
      result.rows.forEach(user => {
        console.log(`   - ${user.username} (${user.email}) - ${user.role}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkUsers();

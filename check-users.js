import dotenv from 'dotenv';
import pkg from 'pg';
const { Pool } = pkg;

dotenv.config({ path: './backend/.env' });

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function checkUsers() {
  try {
    console.log('🔍 Checking users in database...\n');
    
    // Check if users table exists
    const tableExists = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'users'
      );
    `);
    
    console.log('📊 Users table exists:', tableExists.rows[0].exists);
    
    if (!tableExists.rows[0].exists) {
      console.log('❌ Users table does not exist!');
      return;
    }
    
    // Get all users
    const users = await pool.query('SELECT id, username, email, role, created_at FROM users');
    
    console.log(`👥 Found ${users.rows.length} users:\n`);
    
    users.rows.forEach((user, index) => {
      console.log(`${index + 1}. ID: ${user.id}`);
      console.log(`   Username: ${user.username}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Created: ${user.created_at}`);
      console.log('');
    });
    
    // Test password hash for admin
    if (users.rows.length > 0) {
      const adminUser = users.rows.find(u => u.username === 'admin');
      if (adminUser) {
        console.log('🔐 Testing admin password...');
        
        const bcryptPkg = await import('bcryptjs');
        const bcrypt = bcryptPkg.default;
        const adminRecord = await pool.query('SELECT password FROM users WHERE username = $1', ['admin']);
        
        if (adminRecord.rows.length > 0) {
          const storedHash = adminRecord.rows[0].password;
          const testPassword = 'admin123';
          const isValid = await bcrypt.compare(testPassword, storedHash);
          
          console.log(`   Stored hash: ${storedHash.substring(0, 20)}...`);
          console.log(`   Test password: ${testPassword}`);
          console.log(`   Password valid: ${isValid ? '✅ YES' : '❌ NO'}`);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkUsers();

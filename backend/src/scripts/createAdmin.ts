import bcrypt from 'bcryptjs';
import pool from '../config/database';

const createAdmin = async () => {
  try {
    const username = 'admin';
    const email = 'admin@pos.com';
    const password = 'admin123';
    const role = 'admin';

    // Check if admin already exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE username = $1 OR email = $2',
      [username, email]
    );

    if (existingUser.rows.length > 0) {
      console.log('Admin user already exists');
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin user
    const result = await pool.query(
      'INSERT INTO users (username, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, username, email, role',
      [username, email, hashedPassword, role]
    );

    const user = result.rows[0];
    console.log('Admin user created successfully:', {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role
    });
    console.log('Login credentials:');
    console.log('Username:', username);
    console.log('Password:', password);

  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await pool.end();
  }
};

createAdmin();

require('dotenv').config({ path: '../.env' });
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

const userEmail = 'ahmet@doganconsult.com';
const roleName = 'super_admin';

const makeSuperAdmin = async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Get user ID
    const userRes = await client.query('SELECT id FROM users WHERE email = $1', [userEmail]);
    if (userRes.rows.length === 0) {
      throw new Error(`User with email ${userEmail} not found.`);
    }
    const userId = userRes.rows[0].id;
    console.log(`Found user with ID: ${userId}`);

    // Get role ID
    const roleRes = await client.query('SELECT id FROM roles WHERE name = $1', [roleName]);
    if (roleRes.rows.length === 0) {
      throw new Error(`Role with name ${roleName} not found.`);
    }
    const roleId = roleRes.rows[0].id;
    console.log(`Found role with ID: ${roleId}`);

    // Check if the user already has the role
    const userRoleRes = await client.query('SELECT 1 FROM user_roles WHERE user_id = $1 AND role_id = $2', [userId, roleId]);
    if (userRoleRes.rows.length > 0) {
      console.log('User already has the super_admin role. No changes needed.');
      await client.query('COMMIT');
      return;
    }

    // Assign the role to the user
    await client.query('INSERT INTO user_roles (user_id, role_id, is_active) VALUES ($1, $2, true)', [userId, roleId]);
    console.log('Successfully assigned super_admin role to the user.');
    
    // Also update the 'role' column in the 'users' table for consistency
    await client.query('UPDATE users SET role = $1 WHERE id = $2', [roleName, userId]);
    console.log('Successfully updated the role in the users table.');

    await client.query('COMMIT');
    console.log('Transaction committed.');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error assigning super admin role:', error.message);
  } finally {
    client.release();
    pool.end();
  }
};

makeSuperAdmin();
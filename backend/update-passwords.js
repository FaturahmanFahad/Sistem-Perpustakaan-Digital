const db = require('./config/db');
const bcrypt = require('bcryptjs');

async function run() {
  try {
    const adminSalt = await bcrypt.genSalt(10);
    const adminHash = await bcrypt.hash('admin123', adminSalt);

    const userSalt = await bcrypt.genSalt(10);
    const userHash = await bcrypt.hash('user123', userSalt);

    // Update Admin
    const [resultAdmin] = await db.query(
      'UPDATE users SET password = ? WHERE email = ?',
      [adminHash, 'admin@perpus.com']
    );
    console.log('Admin password update result:', resultAdmin);

    // Update User
    const [resultUser] = await db.query(
      'UPDATE users SET password = ? WHERE email = ?',
      [userHash, 'user@perpus.com']
    );
    console.log('User password update result:', resultUser);

    console.log('Passwords updated successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error updating passwords:', err);
    process.exit(1);
  }
}

run();

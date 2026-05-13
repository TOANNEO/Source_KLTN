const bcrypt = require('bcryptjs');
const { sequelize, User } = require('../src/models');

async function createAdminAccount() {
  try {
    // Connect to database
    await sequelize.authenticate();
    console.log('✓ Database connected');

    // Check if admin already exists
    const existingAdmin = await User.findOne({
      where: { email: 'admin@tlu.edu.vn' }
    });

    if (existingAdmin) {
      console.log('⚠ Admin account already exists');
      console.log('Email:', existingAdmin.email);
      console.log('Role:', existingAdmin.role);

      // Update password if needed
      const newPassword = '123456';
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      await existingAdmin.update({ password: hashedPassword });
      console.log('✓ Password updated to: 123456');

      process.exit(0);
    }

    // Create new admin account
    const password = '123456';
    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await User.create({
      email: 'admin@tlu.edu.vn',
      password: hashedPassword,
      role: 'admin',
      first_name: 'Admin',
      last_name: 'System'
    });

    console.log('✓ Admin account created successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Email:', admin.email);
    console.log('Password:', password);
    console.log('Role:', admin.role);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    process.exit(0);
  } catch (error) {
    console.error('✗ Error:', error.message);
    process.exit(1);
  }
}

createAdminAccount();

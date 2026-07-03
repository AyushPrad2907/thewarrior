require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('./models/Admin');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/THE_WARRIOR';

const adminName = process.env.ADMIN_NAME || 'Admin';
const adminEmail = process.env.ADMIN_EMAIL || 'admin@warrior.com';
const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';

const seedAdmin = async () => {
  try {
    await mongoose.connect(MONGODB_URI);

    let admin = await Admin.findOne({ email: adminEmail });

    if (admin) {
      admin.name = adminName;
      admin.password = adminPassword;
      admin.role = 'admin';
      admin.isActive = true;
      await admin.save();
      console.log(`Updated existing admin: ${adminEmail}`);
    } else {
      admin = await Admin.create({
        name: adminName,
        email: adminEmail,
        password: adminPassword,
        role: 'admin',
        isActive: true
      });
      console.log(`Created new admin: ${adminEmail}`);
    }

    console.log('Admin login credentials:');
    console.log(`Email: ${adminEmail}`);
    console.log(`Password: ${adminPassword}`);
  } catch (error) {
    console.error('Failed to seed admin:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

seedAdmin();
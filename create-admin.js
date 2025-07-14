import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

const JSON_DB_PATH = path.join(process.cwd(), 'data.json');

async function createAdminUser() {
  try {
    console.log('Setting up JSON database...');
    
    // Initialize database if it doesn't exist
    if (!fs.existsSync(JSON_DB_PATH)) {
      const initialData = {
        users: [],
        profiles: [],
        opportunities: [],
        messages: [],
        notifications: []
      };
      fs.writeFileSync(JSON_DB_PATH, JSON.stringify(initialData, null, 2));
      console.log('✅ JSON database initialized');
    }

    // Read existing data
    const data = JSON.parse(fs.readFileSync(JSON_DB_PATH, 'utf8'));
    
    // Check if admin user already exists
    const existingAdmin = data.users.find(user => user.email === 'admin@refuture.com');
    
    if (existingAdmin) {
      console.log('✅ Admin user already exists:');
      console.log('   Email: admin@refuture.com');
      console.log('   Role:', existingAdmin.role);
      console.log('   Status:', existingAdmin.status);
      return;
    }

    // Create admin user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);
    
    const adminUser = {
      _id: Math.random().toString(36).substr(2, 9),
      email: 'admin@refuture.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      status: 'active',
      hasProfile: false,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Add to database
    data.users.push(adminUser);
    fs.writeFileSync(JSON_DB_PATH, JSON.stringify(data, null, 2));

    console.log('✅ Admin user created successfully:');
    console.log('   Email: admin@refuture.com');
    console.log('   Password: admin123');
    console.log('   Role: admin');
    console.log('   Status: active');

  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  }
}

createAdminUser(); 
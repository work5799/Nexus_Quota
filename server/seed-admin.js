require('dotenv').config();
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const db = require('./lib/db');

const seedAdmin = async () => {
  try {
    const name = 'Rayhan';
    const email = 'rayhan5799@gmail.com';
    const password = 'Rayhan5799@#';
    
    // Check if admin already exists
    const existingAdmin = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (existingAdmin) {
      console.log('✅ Super admin already exists!');
      return;
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);
    const userId = crypto.randomUUID();
    
    // Create admin
    db.prepare(`
      INSERT INTO users (id, name, email, password, role, is_approved)
      VALUES (?, ?, ?, ?, 'superadmin', 1)
    `).run(userId, name, email, hashedPassword);
    
    console.log('✅ Super admin created successfully!');
    console.log('Email:', email);
    console.log('Password:', password);
  } catch (error) {
    console.error('❌ Error creating admin:', error);
  }
};

seedAdmin();

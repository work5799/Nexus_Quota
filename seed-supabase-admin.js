// Local script to seed super admin into Supabase
require('dotenv').config();
const bcrypt = require('bcryptjs');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function seedAdmin() {
  try {
    const name = 'Rayhan';
    const email = 'rayhan5799@gmail.com';
    const password = 'Rayhan5799@#';
    
    console.log('Checking if admin exists...');
    
    // Check if admin already exists
    const { data: existingAdmin, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .limit(1);

    if (fetchError) {
      console.error('❌ Error fetching:', fetchError.message);
      console.error('Hint: Make sure you ran supabase.sql in Supabase SQL Editor!');
      return;
    }

    if (existingAdmin && existingAdmin.length > 0) {
      console.log('✅ Super admin already exists!');
      console.log('Email:', email);
      console.log('You can login with the existing password');
      return;
    }
    
    console.log('Creating super admin...');
    const hashedPassword = await bcrypt.hash(password, 12);
    
    const { data: newAdmin, error: insertError } = await supabase
      .from('users')
      .insert([{ 
        name, 
        email, 
        password: hashedPassword, 
        role: 'superadmin', 
        is_approved: true 
      }])
      .select()
      .single();

    if (insertError) {
      console.error('❌ Error creating admin:', insertError.message);
      return;
    }
    
    console.log('✅ Super admin created successfully!');
    console.log('Email:', email);
    console.log('Password:', password);
    console.log('ID:', newAdmin.id);
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

seedAdmin();
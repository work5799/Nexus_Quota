// Test Supabase connection
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testConnection() {
  try {
    console.log('Testing Supabase connection...');
    console.log('URL:', process.env.SUPABASE_URL);
    console.log('Key (first 30 chars):', process.env.SUPABASE_SERVICE_ROLE_KEY?.substring(0, 30) + '...');
    
    // Try to fetch users table
    const { data, error, count } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.error('❌ Error fetching users:', error.message);
      console.error('Hint: Make sure you ran supabase.sql in Supabase SQL Editor!');
      return;
    }
    
    console.log('✅ Connection successful!');
    console.log(`Found ${count} users in the database`);
    
    // Try to fetch all users (without count)
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, name, email, role, is_approved');
    
    if (usersError) {
      console.error('❌ Error:', usersError.message);
      return;
    }
    
    console.log('\nUsers in database:');
    users.forEach(u => {
      console.log(`  - ${u.email} (role: ${u.role}, approved: ${u.is_approved})`);
    });
    
  } catch (err) {
    console.error('❌ Connection failed:', err.message);
  }
}

testConnection();
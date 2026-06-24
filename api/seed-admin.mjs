import bcrypt from 'bcryptjs'
import supabase from './_lib/supabase.mjs'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const name = 'Rayhan'
    const email = 'rayhan5799@gmail.com'
    const password = 'Rayhan5799@#'
    
    // Check if admin already exists
    const { data: existingAdmin, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .limit(1)

    if (fetchError) throw fetchError

    if (existingAdmin && existingAdmin.length > 0) {
      return res.json({ message: 'Super admin already exists!' })
    }
    
    const hashedPassword = await bcrypt.hash(password, 12)
    
    // Create admin
    await supabase
      .from('users')
      .insert([{ name, email, password: hashedPassword, role: 'superadmin', is_approved: true }])
    
    res.json({ message: 'Super admin created successfully!' })
  } catch (error) {
    console.error('❌ Error creating admin:', error)
    res.status(500).json({ error: 'Server error', details: error.message })
  }
}

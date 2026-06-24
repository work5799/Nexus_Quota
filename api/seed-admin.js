import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import db from './_lib/db.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const name = 'Rayhan'
    const email = 'rayhan5799@gmail.com'
    const password = 'Rayhan5799@#'
    
    const existingAdmin = db.prepare('SELECT * FROM users WHERE email = ?').get(email)
    if (existingAdmin) {
      return res.json({ message: 'Super admin already exists!' })
    }
    
    const hashedPassword = await bcrypt.hash(password, 12)
    const userId = crypto.randomUUID()
    
    db.prepare(`
      INSERT INTO users (id, name, email, password, role, is_approved)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(userId, name, email, hashedPassword, 'superadmin', 1)
    
    res.json({ message: 'Super admin created successfully!' })
  } catch (error) {
    console.error('❌ Error creating admin:', error)
    res.status(500).json({ error: 'Server error' })
  }
}

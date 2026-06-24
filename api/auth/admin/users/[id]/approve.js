import { auth } from '../../../../api/_lib/auth.js'
import db from '../../../../api/_lib/db.js'

export default async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const user = await auth(req)
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  if (user.role !== 'superadmin') {
    return res.status(403).json({ error: 'Access denied' })
  }

  const { id } = req.query
  db.prepare('UPDATE users SET is_approved = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(id)
  
  const updatedUser = db.prepare('SELECT id, name, email, role, is_approved FROM users WHERE id = ?').get(id)
  res.json({
    user: {
      ...updatedUser,
      isApproved: Boolean(updatedUser.is_approved)
    }
  })
}

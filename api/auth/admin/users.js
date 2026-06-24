import { auth } from '../../../api/_lib/auth.js'
import db from '../../../api/_lib/db.js'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const user = await auth(req)
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  if (user.role !== 'superadmin') {
    return res.status(403).json({ error: 'Access denied' })
  }

  const users = db.prepare('SELECT id, name, email, role, is_approved, created_at FROM users').all()
  res.json({
    users: users.map(u => ({
      ...u,
      isApproved: Boolean(u.is_approved)
    }))
  })
}

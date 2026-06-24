import { auth } from '../../_lib/auth.mjs'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const user = await auth(req)
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  res.json({
    user: { 
      id: user.id, 
      name: user.name, 
      email: user.email, 
      role: user.role, 
      isApproved: Boolean(user.is_approved) 
    }
  })
}

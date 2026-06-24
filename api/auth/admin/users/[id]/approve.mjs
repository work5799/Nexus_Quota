import { auth } from '../../../../_lib/auth.mjs'
import supabase from '../../../../_lib/supabase.mjs'

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
  
  // Update user
  await supabase
    .from('users')
    .update({ is_approved: true, updated_at: new Date().toISOString() })
    .eq('id', id)

  // Fetch updated user
  const { data: updatedUser } = await supabase
    .from('users')
    .select('id, name, email, role, is_approved')
    .eq('id', id)
    .single()

  res.json({
    user: {
      ...updatedUser,
      isApproved: Boolean(updatedUser.is_approved)
    }
  })
}
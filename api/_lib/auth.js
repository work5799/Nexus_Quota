import jwt from 'jsonwebtoken'
import supabase from './supabase.js'

export const auth = async (req) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '')
    if (!token) return null

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('id', decoded.userId)
      .single()

    return user || null
  } catch (error) {
    return null
  }
}

import jwt from 'jsonwebtoken'
import db from './db.js'

export const auth = async (req) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '')
    if (!token) return null

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(decoded.userId)
    return user || null
  } catch (error) {
    return null
  }
}

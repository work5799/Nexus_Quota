const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const db = require('../lib/db');
const auth = require('../middleware/auth');

const router = express.Router();

// Check if current user is superadmin
const isSuperAdmin = (user) => user.role === 'superadmin';

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }

    // Check if user already exists
    const existingUser = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);
    const userId = crypto.randomUUID();

    // Create user - default role is user, is_approved is false
    db.prepare(`
      INSERT INTO users (id, name, email, password, role, is_approved)
      VALUES (?, ?, ?, ?, 'user', 0)
    `).run(userId, name, email, hashedPassword);

    const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      token,
      user: { id: userId, name, email, role: 'user', isApproved: false }
    });
  } catch (error) {
    console.error('❌ Registration error:', error);
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Get user
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if user is approved
    if (!user.is_approved) {
      return res.status(403).json({ error: 'Account not approved yet. Please wait for admin approval.' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: { 
        id: user.id, 
        name: user.name, 
        email: user.email, 
        role: user.role, 
        isApproved: Boolean(user.is_approved) 
      }
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/me', auth, async (req, res) => {
  try {
    res.json({
      user: { 
        id: req.user.id, 
        name: req.user.name, 
        email: req.user.email, 
        role: req.user.role, 
        isApproved: Boolean(req.user.is_approved) 
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin routes
router.get('/admin/users', auth, async (req, res) => {
  try {
    if (!isSuperAdmin(req.user)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const users = db.prepare('SELECT id, name, email, role, is_approved, created_at FROM users').all();
    res.json({
      users: users.map(u => ({
        ...u,
        isApproved: Boolean(u.is_approved)
      }))
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/admin/users/:id/approve', auth, async (req, res) => {
  try {
    if (!isSuperAdmin(req.user)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { id } = req.params;
    db.prepare('UPDATE users SET is_approved = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(id);
    
    const updatedUser = db.prepare('SELECT id, name, email, role, is_approved FROM users WHERE id = ?').get(id);
    res.json({
      user: {
        ...updatedUser,
        isApproved: Boolean(updatedUser.is_approved)
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/profile', auth, async (req, res) => {
  try {
    const { name } = req.body;
    if (name) {
      db.prepare(`
        UPDATE users SET name = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
      `).run(name, req.user.id);
      
      const updatedUser = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
      
      res.json({
        user: { id: updatedUser.id, name: updatedUser.name, email: updatedUser.email, role: updatedUser.role, isApproved: Boolean(updatedUser.is_approved) }
      });
    } else {
      res.json({
        user: { id: req.user.id, name: req.user.name, email: req.user.email, role: req.user.role, isApproved: Boolean(req.user.is_approved) }
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const isMatch = await bcrypt.compare(currentPassword, req.user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    db.prepare(`
      UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
    `).run(hashedPassword, req.user.id);

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/account', auth, async (req, res) => {
  try {
    db.prepare('DELETE FROM users WHERE id = ?').run(req.user.id);
    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

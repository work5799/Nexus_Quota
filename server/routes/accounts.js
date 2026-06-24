const express = require('express');
const { google } = require('googleapis');
const crypto = require('crypto');
const db = require('../lib/db');
const auth = require('../middleware/auth');

const router = express.Router();

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

router.get('/google-url', auth, (req, res) => {
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/cloud-platform'
    ]
  });
  res.json({ url });
});

router.post('/google-callback', auth, async (req, res) => {
  try {
    const { code } = req.body;
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const oauth2 = google.oauth2({ auth: oauth2Client, version: 'v2' });
    const userInfo = await oauth2.userinfo.get();

    // Check if account already exists
    const existingAccount = db.prepare(`
      SELECT * FROM google_accounts WHERE user_id = ? AND email = ?
    `).get(req.user.id, userInfo.data.email);

    if (existingAccount) {
      db.prepare(`
        UPDATE google_accounts
        SET access_token = ?, refresh_token = ?, expires_at = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(
        tokens.access_token,
        tokens.refresh_token,
        new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
        existingAccount.id
      );
    } else {
      const accountId = crypto.randomUUID();
      db.prepare(`
        INSERT INTO google_accounts (id, user_id, email, name, access_token, refresh_token, expires_at, quota_data)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        accountId,
        req.user.id,
        userInfo.data.email,
        userInfo.data.name,
        tokens.access_token,
        tokens.refresh_token,
        new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
        JSON.stringify([])
      );
    }

    res.json({ message: 'Account connected successfully' });
  } catch (error) {
    console.error('❌ Google callback error:', error);
    res.status(500).json({ error: 'Failed to connect account' });
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const accounts = db.prepare('SELECT * FROM google_accounts WHERE user_id = ?').all(req.user.id);

    const formattedAccounts = accounts.map(acc => ({
      ...acc,
      _id: acc.id,
      userId: acc.user_id,
      enabled: Boolean(acc.enabled),
      quota_data: JSON.parse(acc.quota_data)
    }));

    res.json(formattedAccounts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const { name, enabled } = req.body;
    const updates = [];
    const values = [];

    if (name !== undefined) {
      updates.push('name = ?');
      values.push(name);
    }
    if (enabled !== undefined) {
      updates.push('enabled = ?');
      values.push(enabled ? 1 : 0);
    }
    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(req.params.id);
    values.push(req.user.id);

    db.prepare(`
      UPDATE google_accounts SET ${updates.join(', ')} WHERE id = ? AND user_id = ?
    `).run(...values);

    const account = db.prepare(`
      SELECT * FROM google_accounts WHERE id = ? AND user_id = ?
    `).get(req.params.id, req.user.id);

    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    res.json({
      ...account,
      _id: account.id,
      userId: account.user_id,
      enabled: Boolean(account.enabled),
      quota_data: JSON.parse(account.quota_data)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    db.prepare('DELETE FROM google_accounts WHERE id = ? AND user_id = ?').run(
      req.params.id,
      req.user.id
    );
    res.json({ message: 'Account removed successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

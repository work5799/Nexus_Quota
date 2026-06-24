const express = require('express');
const axios = require('axios');
const db = require('../lib/db');
const auth = require('../middleware/auth');

const router = express.Router();

const mockQuotaData = [
  { model: 'Gemini 3.5 Flash (High)', used: 0, total: 1000, resetIn: '6d 23h 55m' },
  { model: 'Gemini 3.5 Flash (Low)', used: 0, total: 1000, resetIn: '6d 23h 55m' },
  { model: 'Gemini 3.1 Pro (High)', used: 0, total: 1000, resetIn: '6d 23h 55m' },
  { model: 'Gemini 3.1 Pro (Low)', used: 0, total: 1000, resetIn: '6d 23h 55m' },
  { model: 'Claude Sonnet 4.6', used: 1000, total: 1000, resetIn: '3d 23h 28m' },
  { model: 'Claude Opus 4.6', used: 1000, total: 1000, resetIn: '3d 23h 28m' },
  { model: 'GPT-OSS 120B', used: 1000, total: 1000, resetIn: '3d 23h 28m' }
];

router.get('/', auth, async (req, res) => {
  try {
    const accounts = db.prepare('SELECT * FROM google_accounts WHERE user_id = ?').all(req.user.id);

    const accountsWithQuota = await Promise.all(
      accounts.map(async (acc) => {
        let quotaData = JSON.parse(acc.quota_data);

        if (!quotaData || quotaData.length === 0) {
          quotaData = mockQuotaData;
        }

        try {
          const response = await axios.get('https://cloudcode-pa.googleapis.com/v1/quota', {
            headers: { Authorization: `Bearer ${acc.access_token}` }
          });
          quotaData = response.data;
        } catch (error) {
          console.error(`Failed to fetch quota for ${acc.email}:`, error.message);
        }

        // Update with latest quota data
        db.prepare(`
          UPDATE google_accounts SET quota_data = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
        `).run(JSON.stringify(quotaData), acc.id);

        return {
          ...acc,
          _id: acc.id,
          userId: acc.user_id,
          enabled: Boolean(acc.enabled),
          quotaData
        };
      })
    );

    res.json(accountsWithQuota);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/refresh/:id', auth, async (req, res) => {
  try {
    const account = db.prepare(`
      SELECT * FROM google_accounts WHERE id = ? AND user_id = ?
    `).get(req.params.id, req.user.id);

    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    let quotaData = JSON.parse(account.quota_data);
    if (!quotaData || quotaData.length === 0) {
      quotaData = mockQuotaData;
    }

    try {
      const response = await axios.get('https://cloudcode-pa.googleapis.com/v1/quota', {
        headers: { Authorization: `Bearer ${account.access_token}` }
      });
      quotaData = response.data;
    } catch (error) {
      console.error(`Failed to fetch quota for ${account.email}:`, error.message);
    }

    // Update account
    db.prepare(`
      UPDATE google_accounts SET quota_data = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
    `).run(JSON.stringify(quotaData), account.id);

    const updatedAccount = db.prepare('SELECT * FROM google_accounts WHERE id = ?').get(req.params.id);

    res.json({
      ...updatedAccount,
      _id: updatedAccount.id,
      userId: updatedAccount.user_id,
      enabled: Boolean(updatedAccount.enabled),
      quotaData
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

const mongoose = require('mongoose');

const googleAccountSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  email: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  accessToken: {
    type: String,
    required: true
  },
  refreshToken: {
    type: String,
    required: true
  },
  expiresAt: {
    type: Date,
    required: true
  },
  enabled: {
    type: Boolean,
    default: true
  },
  quotaData: [{
    model: String,
    used: Number,
    total: Number,
    resetAt: Date
  }]
}, { timestamps: true });

module.exports = mongoose.model('GoogleAccount', googleAccountSchema);

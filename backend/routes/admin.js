const express = require('express');
const mongoose = require('mongoose');
const protect = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

// All admin routes require authentication
router.use(protect);

// Admin check middleware — add `role: 'admin'` to a user in MongoDB to grant access
router.use(async (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
});

// GET /api/admin/sessions — list all active sessions
router.get('/sessions', async (req, res) => {
  try {
    const db = mongoose.connection.db;
    const sessionsCol = db.collection('sessions');
    const sessions = await sessionsCol.find({}).toArray();

    const parsed = sessions.map((s) => {
      let data = {};
      try {
        data = JSON.parse(s.session);
      } catch (_) {}
      return {
        sessionId: s._id,
        userId: data.userId || null,
        email: data.email || null,
        expires: s.expires,
      };
    });

    res.json({ sessions: parsed });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch sessions' });
  }
});

// DELETE /api/admin/sessions/:sessionId — destroy a specific session
router.delete('/sessions/:sessionId', async (req, res) => {
  try {
    const db = mongoose.connection.db;
    const sessionsCol = db.collection('sessions');
    const result = await sessionsCol.deleteOne({ _id: req.params.sessionId });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Session not found' });
    }

    res.json({ message: 'Session destroyed' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to destroy session' });
  }
});

// DELETE /api/admin/sessions/user/:userId — destroy all sessions for a user
router.delete('/sessions/user/:userId', async (req, res) => {
  try {
    const db = mongoose.connection.db;
    const sessionsCol = db.collection('sessions');

    // Sessions store userId in the JSON blob
    const all = await sessionsCol.find({}).toArray();
    const toDelete = all
      .filter((s) => {
        try {
          const data = JSON.parse(s.session);
          return data.userId === req.params.userId;
        } catch (_) {
          return false;
        }
      })
      .map((s) => s._id);

    if (toDelete.length === 0) {
      return res.status(404).json({ message: 'No sessions found for this user' });
    }

    await sessionsCol.deleteMany({ _id: { $in: toDelete } });

    res.json({ message: `Destroyed ${toDelete.length} session(s)` });
  } catch (err) {
    res.status(500).json({ message: 'Failed to destroy user sessions' });
  }
});

module.exports = router;

const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const protect = require('../middleware/auth');

const router = express.Router();

const AVATAR_COLORS = [
  'from-blue-500 to-blue-600',
  'from-green-500 to-green-600',
  'from-purple-500 to-purple-600',
  'from-pink-500 to-pink-600',
  'from-orange-500 to-orange-600',
  'from-teal-500 to-teal-600',
  'from-red-500 to-red-600',
  'from-indigo-500 to-indigo-600',
  'from-cyan-500 to-cyan-600',
  'from-amber-500 to-amber-600',
];

function signToken(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName, username, occupation } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: 'Account already exists. Please sign in.' });
    }

    if (username) {
      const usernameTaken = await User.findOne({ username: username.toLowerCase() });
      if (usernameTaken) {
        return res.status(409).json({ message: 'Username is already taken.' });
      }
    }

    const avatarColor = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];

    const user = await User.create({
      email,
      password,
      firstName: firstName || '',
      lastName: lastName || '',
      username: username || undefined,
      occupation: occupation || '',
      avatarColor,
    });

    const token = signToken(user._id);

    // Save session to MongoDB
    req.session.userId = user._id.toString();
    req.session.email = user.email;

    res.status(201).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        occupation: user.occupation,
        avatarColor: user.avatarColor,
        profileImage: user.profileImage,
      },
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Backfill avatarColor for existing users who don't have one
    if (!user.avatarColor) {
      user.avatarColor = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
      await user.save();
    }

    const token = signToken(user._id);

    // Save session to MongoDB
    req.session.userId = user._id.toString();
    req.session.email = user.email;

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        occupation: user.occupation,
        avatarColor: user.avatarColor,
        profileImage: user.profileImage,
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: 'Could not log out' });
    }
    res.clearCookie('connect.sid');
    res.json({ message: 'Logged out' });
  });
});

// GET /api/auth/me
router.get('/me', protect, async (req, res) => {
  // Backfill avatarColor for existing users who don't have one
  if (!req.user.avatarColor) {
    req.user.avatarColor = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
    await req.user.save();
  }

  res.json({
    user: {
      id: req.user._id,
      email: req.user.email,
      username: req.user.username,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      occupation: req.user.occupation,
      avatarColor: req.user.avatarColor,
      profileImage: req.user.profileImage,
    },
  });
});

module.exports = router;

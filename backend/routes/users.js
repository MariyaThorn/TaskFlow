const express = require('express');
const User = require('../models/User');
const Project = require('../models/Project');
const Board = require('../models/Board');
const protect = require('../middleware/auth');

const router = express.Router();

router.use(protect);

// PUT /api/users/profile — update profile info
router.put('/profile', async (req, res) => {
  try {
    const { firstName, lastName, username, email, occupation } = req.body;

    // Check username uniqueness if changed
    if (username && username !== req.user.username) {
      const existing = await User.findOne({ username: username.toLowerCase(), _id: { $ne: req.user._id } });
      if (existing) {
        return res.status(409).json({ message: 'Username is already taken' });
      }
    }

    // Check email uniqueness if changed
    if (email && email !== req.user.email) {
      const existing = await User.findOne({ email: email.toLowerCase(), _id: { $ne: req.user._id } });
      if (existing) {
        return res.status(409).json({ message: 'Email is already in use' });
      }
    }

    const user = req.user;
    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    if (username !== undefined) user.username = username || undefined;
    if (email !== undefined) user.email = email;
    if (occupation !== undefined) user.occupation = occupation;

    await user.save();

    res.json({
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
    console.error('Profile update error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/users/password — change password
router.put('/password', async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ message: 'New password must be at least 8 characters' });
    }

    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error('Password change error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/users/settings — get user settings
router.get('/settings', async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ settings: user.settings || {} });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/users/settings — update user settings (dark mode, notifications, etc.)
router.put('/settings', async (req, res) => {
  try {
    const allowedFields = ['darkMode', 'emailNotifications', 'pushNotifications', 'weeklyDigest', 'language', 'timezone', 'profileVisibility'];
    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[`settings.${field}`] = req.body[field];
      }
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true }
    );

    res.json({ settings: user.settings });
  } catch (err) {
    console.error('Settings update error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/users/account — delete user account
router.delete('/account', async (req, res) => {
  try {
    const userId = req.user._id;

    // Remove user from all projects
    await Project.updateMany(
      { 'members.user': userId },
      { $pull: { members: { user: userId } } }
    );

    // Delete projects where user was the only member
    const emptyProjects = await Project.find({ members: { $size: 0 } });
    const emptyProjectIds = emptyProjects.map((p) => p._id);

    // Delete boards belonging to empty projects
    if (emptyProjectIds.length > 0) {
      await Board.deleteMany({ project: { $in: emptyProjectIds } });
      await Project.deleteMany({ _id: { $in: emptyProjectIds } });
    }

    // Delete the user
    await User.findByIdAndDelete(userId);

    // Destroy session
    req.session.destroy(() => {});
    res.clearCookie('connect.sid');

    res.json({ message: 'Account deleted successfully' });
  } catch (err) {
    console.error('Account deletion error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

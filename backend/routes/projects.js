const express = require('express');
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const Project = require('../models/Project');
const Board = require('../models/Board');
const User = require('../models/User');
const protect = require('../middleware/auth');

// Configure multer for project background uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'public', 'uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueName = crypto.randomBytes(16).toString('hex') + path.extname(file.originalname);
    cb(null, uniqueName);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    cb(null, true);
  },
});

const router = express.Router();

// All routes require auth
router.use(protect);

// GET /api/projects — list projects the user is a member of
router.get('/', async (req, res) => {
  try {
    const projects = await Project.find({ 'members.user': req.user._id })
      .populate('members.user', 'firstName lastName email username avatarColor profileImage')
      .populate('team', 'name')
      .sort({ updatedAt: -1 });

    // Backfill colors for projects missing one
    for (const p of projects) {
      if (!p.color) {
        p.color = Project.randomColor();
        await p.save();
      }
    }

    res.json({ projects });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/projects — create a new project
router.post('/', async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Project name is required' });
    }

    const project = await Project.create({
      name: name.trim(),
      color: Project.randomColor(),
      members: [{ user: req.user._id, role: 'owner' }],
    });

    const populated = await project.populate('members.user', 'firstName lastName email username avatarColor profileImage');

    res.status(201).json({ project: populated });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/projects/my-invitations — list pending invitations for current user
router.get('/my-invitations', async (req, res) => {
  try {
    const email = req.user.email;
    console.log('DEBUG /my-invitations: user email:', email);

    // Find projects that have invitations for this email
    const projects = await Project.find({ 'invitations.email': email })
      .select('name invitations')
      .populate('invitations.invitedBy', 'firstName lastName');

    const pending = [];
    projects.forEach((proj) => {
      proj.invitations.forEach((inv) => {
        console.log('DEBUG invitation:', inv.email, inv.status);
        if (inv.email === email && inv.status === 'pending') {
          pending.push({
            projectId: proj._id,
            projectName: proj.name,
            invitationId: inv._id,
            role: inv.role,
            invitedBy: inv.invitedBy,
            createdAt: inv.createdAt,
          });
        }
      });
    });

    console.log('DEBUG pending invitations:', pending);
    res.json({ invitations: pending });
  } catch (err) {
    console.error('ERROR in /my-invitations:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/projects/:id — get a single project
router.get('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('members.user', 'firstName lastName email username avatarColor profileImage')
      .populate('invitations.invitedBy', 'firstName lastName');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const isMember = project.members.some(
      (m) => m.user._id.toString() === req.user._id.toString()
    );
    if (!isMember) {
      return res.status(403).json({ message: 'Not a member of this project' });
    }

    // Backfill color for projects created before this field existed
    if (!project.color) {
      project.color = Project.randomColor();
      await project.save();
    }

    res.json({ project });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PATCH /api/projects/:id/appearance — update project color/background
router.patch('/:id/appearance', async (req, res) => {
  try {
    const { color, backgroundImage } = req.body;
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const isMember = project.members.some(
      (m) => m.user.toString() === req.user._id.toString()
    );
    if (!isMember) return res.status(403).json({ message: 'Not a member' });

    if (color !== undefined) project.color = color;
    if (backgroundImage !== undefined) project.backgroundImage = backgroundImage;
    await project.save();

    res.json({ project: { color: project.color, backgroundImage: project.backgroundImage } });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/projects/:id/background — upload a background image
router.post('/:id/background', upload.single('background'), async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const isMember = project.members.some(
      (m) => m.user.toString() === req.user._id.toString()
    );
    if (!isMember) return res.status(403).json({ message: 'Not a member' });

    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const imageUrl = `/uploads/${req.file.filename}`;
    project.backgroundImage = imageUrl;
    await project.save();

    res.json({ backgroundImage: imageUrl });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/projects/:id/invite — invite by email or username
router.post('/:id/invite', async (req, res) => {
  try {
    const { emailOrUsername, role } = req.body;

    if (!emailOrUsername || !emailOrUsername.trim()) {
      return res.status(400).json({ message: 'Email or username is required' });
    }

    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Only owner/admin can invite
    const callerMember = project.members.find(
      (m) => m.user.toString() === req.user._id.toString()
    );
    if (!callerMember || !['owner', 'admin'].includes(callerMember.role)) {
      return res.status(403).json({ message: 'Only admins can invite members' });
    }

    const inviteRole = role === 'admin' ? 'admin' : 'member';
    const query = emailOrUsername.trim().toLowerCase();

    // Try to find user by email or username
    const targetUser = await User.findOne({
      $or: [{ email: query }, { username: query }],
    });

    if (targetUser) {
      // Check if already a member
      const alreadyMember = project.members.some(
        (m) => m.user.toString() === targetUser._id.toString()
      );
      if (alreadyMember) {
        return res.status(409).json({ message: 'User is already a member' });
      }

      // Check if already invited
      const alreadyInvited = project.invitations.some(
        (inv) => inv.email === targetUser.email && inv.status === 'pending'
      );
      if (alreadyInvited) {
        return res.status(409).json({ message: 'Invitation already sent' });
      }

      project.invitations.push({
        email: targetUser.email,
        role: inviteRole,
        invitedBy: req.user._id,
      });
    } else {
      // If looks like an email, create a pending invitation for external user
      if (query.includes('@')) {
        const alreadyInvited = project.invitations.some(
          (inv) => inv.email === query && inv.status === 'pending'
        );
        if (alreadyInvited) {
          return res.status(409).json({ message: 'Invitation already sent' });
        }

        project.invitations.push({
          email: query,
          role: inviteRole,
          invitedBy: req.user._id,
        });
      } else {
        return res.status(404).json({ message: 'User not found' });
      }
    }

    await project.save();

    res.status(201).json({ message: 'Invitation sent' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/projects/:id/invite-link — get the invite URL
router.get('/:id/invite-link', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const callerMember = project.members.find(
      (m) => m.user.toString() === req.user._id.toString()
    );
    if (!callerMember || !['owner', 'admin'].includes(callerMember.role)) {
      return res.status(403).json({ message: 'Only admins can get invite link' });
    }

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
    const inviteUrl = `${frontendUrl}/invite/${project.inviteCode}`;

    res.json({ inviteUrl, inviteCode: project.inviteCode });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/projects/:id/regenerate-invite — regenerate invite code
router.post('/:id/regenerate-invite', async (req, res) => {
  try {
    const crypto = require('crypto');
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const callerMember = project.members.find(
      (m) => m.user.toString() === req.user._id.toString()
    );
    if (!callerMember || !['owner', 'admin'].includes(callerMember.role)) {
      return res.status(403).json({ message: 'Only admins can regenerate invite link' });
    }

    project.inviteCode = crypto.randomBytes(16).toString('hex');
    await project.save();

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
    const inviteUrl = `${frontendUrl}/invite/${project.inviteCode}`;

    res.json({ inviteUrl, inviteCode: project.inviteCode });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/projects/join/:code — join via invite link
router.post('/join/:code', async (req, res) => {
  try {
    const project = await Project.findOne({ inviteCode: req.params.code });
    if (!project) {
      return res.status(404).json({ message: 'Invalid invite link' });
    }

    const alreadyMember = project.members.some(
      (m) => m.user.toString() === req.user._id.toString()
    );
    if (alreadyMember) {
      return res.json({ message: 'Already a member', project: { id: project._id, name: project.name } });
    }

    project.members.push({ user: req.user._id, role: 'member' });

    // Accept any pending invitation for this user's email
    const userEmail = req.user.email;
    const pendingInvite = project.invitations.find(
      (inv) => inv.email === userEmail && inv.status === 'pending'
    );
    if (pendingInvite) {
      pendingInvite.status = 'accepted';
    }

    await project.save();

    res.json({ message: 'Joined project', project: { id: project._id, name: project.name } });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/projects/:id/invitations/:invId/accept — accept an invitation
router.post('/:id/invitations/:invId/accept', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const inv = project.invitations.id(req.params.invId);
    if (!inv) return res.status(404).json({ message: 'Invitation not found' });

    // Only the invited email owner may accept
    if (inv.email !== req.user.email) {
      return res.status(403).json({ message: 'Not authorized to accept this invitation' });
    }

    // Add member if not already
    const alreadyMember = project.members.some(
      (m) => m.user.toString() === req.user._id.toString()
    );
    if (!alreadyMember) {
      project.members.push({ user: req.user._id, role: inv.role || 'member' });
    }

    inv.status = 'accepted';
    await project.save();

    res.json({ message: 'Invitation accepted', project: { id: project._id, name: project.name } });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/projects/:id/invitations/:invId/decline — decline an invitation
router.post('/:id/invitations/:invId/decline', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const inv = project.invitations.id(req.params.invId);
    if (!inv) return res.status(404).json({ message: 'Invitation not found' });

    if (inv.email !== req.user.email) {
      return res.status(403).json({ message: 'Not authorized to decline this invitation' });
    }

    inv.status = 'declined';
    await project.save();

    res.json({ message: 'Invitation declined' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/projects/:id — delete a project (owner only)
router.delete('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const member = project.members.find(m => m.user.toString() === req.user._id.toString());
    if (!member || member.role !== 'owner') {
      return res.status(403).json({ message: 'Only the project owner can delete this project' });
    }

    // Delete all boards associated with this project
    await Board.deleteMany({ project: project._id });

    // Delete the project
    await Project.findByIdAndDelete(project._id);

    res.json({ message: 'Project deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

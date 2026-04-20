const express = require('express');
const Team = require('../models/Team');
const Project = require('../models/Project');
const User = require('../models/User');
const Board = require('../models/Board');
const protect = require('../middleware/auth');

const router = express.Router();

// All routes require auth
router.use(protect);

// GET /api/teams — list teams the user is a member of
router.get('/', async (req, res) => {
  try {
    const teams = await Team.find({ 'members.user': req.user._id })
      .populate('members.user', 'firstName lastName email avatarColor profileImage')
      .populate('projects', 'name')
      .sort({ updatedAt: -1 });

    res.json({ teams });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/teams — create a new team
router.post('/', async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Team name is required' });
    }

    const team = await Team.create({
      name: name.trim(),
      description: (description || '').trim(),
      members: [{ user: req.user._id, role: 'owner' }],
    });

    const populated = await team.populate('members.user', 'firstName lastName email avatarColor profileImage');
    res.status(201).json({ team: populated });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/teams/:id — get team with members and projects
router.get('/:id', async (req, res) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate('members.user', 'firstName lastName email avatarColor profileImage')
      .populate({
        path: 'projects',
        populate: { path: 'members.user', select: 'firstName lastName email' },
      });

    if (!team) return res.status(404).json({ message: 'Team not found' });

    const isMember = team.members.some(m => m.user._id.toString() === req.user._id.toString());
    if (!isMember) return res.status(403).json({ message: 'Not a member of this team' });

    res.json({ team });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/teams/:id — update team info (owner/admin only)
router.put('/:id', async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) return res.status(404).json({ message: 'Team not found' });

    const member = team.members.find(m => m.user.toString() === req.user._id.toString());
    if (!member || (member.role !== 'owner' && member.role !== 'admin')) {
      return res.status(403).json({ message: 'Only owners and admins can update the team' });
    }

    const { name, description } = req.body;
    if (name) team.name = name.trim();
    if (description !== undefined) team.description = description.trim();
    await team.save();

    res.json({ team });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/teams/:id — delete team (owner only)
router.delete('/:id', async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) return res.status(404).json({ message: 'Team not found' });

    const member = team.members.find(m => m.user.toString() === req.user._id.toString());
    if (!member || member.role !== 'owner') {
      return res.status(403).json({ message: 'Only the owner can delete this team' });
    }

    // Unlink projects from this team (don't delete them)
    await Project.updateMany({ team: team._id }, { $set: { team: null } });

    await Team.findByIdAndDelete(team._id);
    res.json({ message: 'Team deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/teams/:id/members — invite a member by email or username
router.post('/:id/members', async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) return res.status(404).json({ message: 'Team not found' });

    const requester = team.members.find(m => m.user.toString() === req.user._id.toString());
    if (!requester || (requester.role !== 'owner' && requester.role !== 'admin')) {
      return res.status(403).json({ message: 'Only owners and admins can invite members' });
    }

    const { emailOrUsername, role } = req.body;
    if (!emailOrUsername) return res.status(400).json({ message: 'Email or username is required' });

    const user = await User.findOne({
      $or: [
        { email: emailOrUsername.toLowerCase().trim() },
        { username: emailOrUsername.trim() },
      ],
    });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const alreadyMember = team.members.some(m => m.user.toString() === user._id.toString());
    if (alreadyMember) return res.status(400).json({ message: 'User is already a team member' });

    const memberRole = role === 'admin' ? 'admin' : 'member';
    team.members.push({ user: user._id, role: memberRole });
    await team.save();

    // Also add this user to all team projects
    for (const projectId of team.projects) {
      const project = await Project.findById(projectId);
      if (!project) continue;
      const inProject = project.members.some(m => m.user.toString() === user._id.toString());
      if (!inProject) {
        project.members.push({ user: user._id, role: 'member' });
        await project.save();
      }
    }

    const populated = await team.populate('members.user', 'firstName lastName email avatarColor profileImage');
    res.json({ team: populated });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/teams/:id/members/:memberId/role — change member role
router.put('/:id/members/:memberId/role', async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) return res.status(404).json({ message: 'Team not found' });

    const requester = team.members.find(m => m.user.toString() === req.user._id.toString());
    if (!requester || requester.role !== 'owner') {
      return res.status(403).json({ message: 'Only the owner can change roles' });
    }

    const member = team.members.id(req.params.memberId);
    if (!member) return res.status(404).json({ message: 'Member not found' });
    if (member.role === 'owner') return res.status(400).json({ message: 'Cannot change the owner role' });

    const { role } = req.body;
    member.role = role === 'admin' ? 'admin' : 'member';
    await team.save();

    const populated = await team.populate('members.user', 'firstName lastName email avatarColor profileImage');
    res.json({ team: populated });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/teams/:id/members/:memberId — remove a member
router.delete('/:id/members/:memberId', async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) return res.status(404).json({ message: 'Team not found' });

    const requester = team.members.find(m => m.user.toString() === req.user._id.toString());
    if (!requester || (requester.role !== 'owner' && requester.role !== 'admin')) {
      return res.status(403).json({ message: 'Only owners and admins can remove members' });
    }

    const member = team.members.id(req.params.memberId);
    if (!member) return res.status(404).json({ message: 'Member not found' });
    if (member.role === 'owner') return res.status(400).json({ message: 'Cannot remove the owner' });

    const removedUserId = member.user.toString();
    team.members.pull({ _id: req.params.memberId });
    await team.save();

    // Remove this user from all team projects (unless they were added individually)
    for (const projectId of team.projects) {
      const project = await Project.findById(projectId);
      if (!project) continue;
      const pm = project.members.find(m => m.user.toString() === removedUserId);
      if (pm && pm.role !== 'owner') {
        project.members.pull({ _id: pm._id });
        await project.save();
      }
    }

    const populated = await team.populate('members.user', 'firstName lastName email avatarColor profileImage');
    res.json({ team: populated });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/teams/:id/projects — create new or import existing project into team
router.post('/:id/projects', async (req, res) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate('members.user', '_id');
    if (!team) return res.status(404).json({ message: 'Team not found' });

    const requester = team.members.find(m => m.user._id.toString() === req.user._id.toString());
    if (!requester || (requester.role !== 'owner' && requester.role !== 'admin')) {
      return res.status(403).json({ message: 'Only owners and admins can add projects' });
    }

    const { projectId, name } = req.body;
    let project;

    if (projectId) {
      // Import existing project into team
      project = await Project.findById(projectId);
      if (!project) return res.status(404).json({ message: 'Project not found' });

      // Verify requester owns or is member of the project
      const inProject = project.members.some(m => m.user.toString() === req.user._id.toString());
      if (!inProject) return res.status(403).json({ message: 'You are not a member of this project' });

      if (project.team) return res.status(400).json({ message: 'Project already belongs to a team' });

      project.team = team._id;

      // Add all team members to the project
      for (const tm of team.members) {
        const userId = tm.user._id.toString();
        const inProject = project.members.some(m => m.user.toString() === userId);
        if (!inProject) {
          project.members.push({ user: tm.user._id, role: 'member' });
        }
      }
      await project.save();
    } else {
      // Create new project
      if (!name || !name.trim()) {
        return res.status(400).json({ message: 'Project name is required' });
      }

      // Build members array from team members
      const projectMembers = team.members.map(tm => ({
        user: tm.user._id,
        role: tm.user._id.toString() === req.user._id.toString() ? 'owner' : 'member',
      }));

      project = await Project.create({
        name: name.trim(),
        team: team._id,
        members: projectMembers,
      });
    }

    // Add project to team.projects array
    if (!team.projects.some(p => p.toString() === project._id.toString())) {
      team.projects.push(project._id);
      await team.save();
    }

    const populated = await project.populate('members.user', 'firstName lastName email avatarColor profileImage');
    res.json({ project: populated });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/teams/:id/projects/:projectId — remove project from team (doesn't delete project)
router.delete('/:id/projects/:projectId', async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) return res.status(404).json({ message: 'Team not found' });

    const requester = team.members.find(m => m.user.toString() === req.user._id.toString());
    if (!requester || (requester.role !== 'owner' && requester.role !== 'admin')) {
      return res.status(403).json({ message: 'Only owners and admins can remove projects' });
    }

    team.projects.pull(req.params.projectId);
    await team.save();

    const project = await Project.findById(req.params.projectId);
    if (project) {
      project.team = null;
      await project.save();
    }

    res.json({ message: 'Project removed from team' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

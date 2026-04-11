const mongoose = require('mongoose');
const crypto = require('crypto');

const memberSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  role: { type: String, enum: ['owner', 'admin', 'member'], default: 'member' },
  joinedAt: { type: Date, default: Date.now },
});

const invitationSchema = new mongoose.Schema({
  email: { type: String, lowercase: true, trim: true },
  role: { type: String, enum: ['admin', 'member'], default: 'member' },
  status: { type: String, enum: ['pending', 'accepted', 'declined'], default: 'pending' },
  invitedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
});

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Project name is required'],
      trim: true,
    },
    members: [memberSchema],
    invitations: [invitationSchema],
    inviteCode: {
      type: String,
      unique: true,
      default: () => crypto.randomBytes(16).toString('hex'),
    },
  },
  { timestamps: true }
);

// Index for fast invite-code lookups
projectSchema.index({ inviteCode: 1 });

module.exports = mongoose.model('Project', projectSchema);

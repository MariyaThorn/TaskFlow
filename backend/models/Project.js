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

const PROJECT_COLORS = [
  'from-purple-500 to-purple-600',
  'from-blue-500 to-blue-600',
  'from-green-500 to-green-600',
  'from-pink-500 to-pink-600',
  'from-orange-500 to-orange-600',
  'from-teal-500 to-teal-600',
  'from-red-500 to-red-600',
  'from-indigo-500 to-indigo-600',
  'from-cyan-500 to-cyan-600',
  'from-rose-500 to-rose-600',
];

function randomProjectColor() {
  return PROJECT_COLORS[Math.floor(Math.random() * PROJECT_COLORS.length)];
}

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Project name is required'],
      trim: true,
    },
    color: {
      type: String,
      default: '',
    },
    backgroundImage: {
      type: String,
      default: '',
    },
    team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', default: null },
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

const ProjectModel = mongoose.model('Project', projectSchema);
ProjectModel.randomColor = randomProjectColor;
module.exports = ProjectModel;

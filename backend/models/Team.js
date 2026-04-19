const mongoose = require('mongoose');

const teamMemberSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  role: { type: String, enum: ['owner', 'admin', 'member'], default: 'member' },
  joinedAt: { type: Date, default: Date.now },
});

const teamSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Team name is required'], trim: true },
    description: { type: String, default: '', trim: true },
    members: [teamMemberSchema],
    projects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Project' }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Team', teamSchema);

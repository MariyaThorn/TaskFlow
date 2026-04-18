const mongoose = require('mongoose');

const cardSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  dueDate: { type: String, default: '' },
  labels: [
    {
      id: String,
      name: String,
      color: String,
    },
  ],
  comments: { type: Number, default: 0 },
  attachments: [
    {
      id: String,
      name: String,
      originalName: String,
      url: String,
      size: Number,
      uploadedAt: { type: Date, default: Date.now },
    },
  ],
  progress: { type: Number, default: 0, min: 0, max: 100 },
  assignee: {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: String,
    avatar: String,
    color: String,
  },
  order: { type: Number, default: 0 },
});

const columnSchema = new mongoose.Schema({
  title: { type: String, required: true },
  cards: [cardSchema],
  order: { type: Number, default: 0 },
});

const boardSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Board name is required'],
      trim: true,
    },
    description: { type: String, default: '', trim: true },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    color: { type: String, default: 'from-blue-500 to-blue-600' },
    backgroundImage: { type: String, default: '' },
    columns: {
      type: [columnSchema],
      default: [
        { title: 'To Do', cards: [], order: 0 },
        { title: 'In Progress', cards: [], order: 1 },
        { title: 'Review', cards: [], order: 2 },
        { title: 'Done', cards: [], order: 3 },
      ],
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

boardSchema.index({ project: 1 });

module.exports = mongoose.model('Board', boardSchema);

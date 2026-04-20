const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const Board = require('../models/Board');
const Project = require('../models/Project');
const auth = require('../middleware/auth');
const { getIO } = require('../socket');

// Configure multer for file uploads
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
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    cb(null, true);
  },
});

// All routes require auth
router.use(auth);

// Helper: check user is a member of the project
async function requireProjectMember(req, res, projectId) {
  const project = await Project.findById(projectId);
  if (!project) {
    res.status(404).json({ message: 'Project not found' });
    return null;
  }
  const isMember = project.members.some(
    (m) => m.user.toString() === req.user._id.toString()
  );
  if (!isMember) {
    res.status(403).json({ message: 'Not a member of this project' });
    return null;
  }
  return project;
}

// GET /api/boards/project/:projectId — list boards for a project
router.get('/project/:projectId', async (req, res) => {
  try {
    const project = await requireProjectMember(req, res, req.params.projectId);
    if (!project) return;

    const boards = await Board.find({ project: req.params.projectId })
      .select('name description color backgroundImage updatedAt')
      .sort({ createdAt: -1 });

    res.json({ boards });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST /api/boards — create a board
router.post('/', async (req, res) => {
  try {
    const { name, description, color, backgroundImage, projectId } = req.body;
    if (!name || !projectId) {
      return res.status(400).json({ message: 'Name and projectId are required' });
    }

    const project = await requireProjectMember(req, res, projectId);
    if (!project) return;

    const board = await Board.create({
      name,
      description: description || '',
      color: color || 'from-blue-500 to-blue-600',
      backgroundImage: backgroundImage || '',
      project: projectId,
      createdBy: req.user._id,
    });

    res.status(201).json({ board });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/boards/:id — get a single board with all columns/cards
router.get('/:id', async (req, res) => {
  try {
    const board = await Board.findById(req.params.id).populate('createdBy', 'firstName lastName email');
    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    // Verify membership and return populated project
    const project = await Project.findById(board.project).populate('members.user', 'firstName lastName email avatarColor profileImage');
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    const isMember = project.members.some(
      (m) => m.user && m.user._id.toString() === req.user._id.toString()
    );
    if (!isMember) {
      return res.status(403).json({ message: 'Not a member of this project' });
    }

    res.json({ board, project });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// PUT /api/boards/:id — update board name/description/color
router.put('/:id', async (req, res) => {
  try {
    const board = await Board.findById(req.params.id);
    if (!board) return res.status(404).json({ message: 'Board not found' });

    const project = await requireProjectMember(req, res, board.project);
    if (!project) return;

    const { name, description, color, backgroundImage } = req.body;
    if (name !== undefined) board.name = name;
    if (description !== undefined) board.description = description;
    if (color !== undefined) board.color = color;
    if (backgroundImage !== undefined) board.backgroundImage = backgroundImage;

    await board.save();
    res.json({ board });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// DELETE /api/boards/:id
router.delete('/:id', async (req, res) => {
  try {
    const board = await Board.findById(req.params.id);
    if (!board) return res.status(404).json({ message: 'Board not found' });

    const project = await requireProjectMember(req, res, board.project);
    if (!project) return;

    await board.deleteOne();
    res.json({ message: 'Board deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST /api/boards/:id/background — upload a custom background image
router.post('/:id/background', upload.single('file'), async (req, res) => {
  try {
    const board = await Board.findById(req.params.id);
    if (!board) return res.status(404).json({ message: 'Board not found' });

    const project = await requireProjectMember(req, res, board.project);
    if (!project) return;

    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const url = `/uploads/${req.file.filename}`;
    board.backgroundImage = url;
    await board.save();

    res.json({ url });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST /api/boards/:id/cards — add a card to a column
router.post('/:id/cards', async (req, res) => {
  try {
    const board = await Board.findById(req.params.id);
    if (!board) return res.status(404).json({ message: 'Board not found' });

    const project = await requireProjectMember(req, res, board.project);
    if (!project) return;

    const { columnId, title, description, dueDate, labels, assignee } = req.body;
    if (!columnId || !title) {
      return res.status(400).json({ message: 'columnId and title are required' });
    }

    const column = board.columns.id(columnId);
    if (!column) return res.status(404).json({ message: 'Column not found' });

    const card = {
      title,
      description: description || '',
      dueDate: dueDate || '',
      labels: labels || [],
      order: column.cards.length,
    };

    if (assignee) {
      card.assignee = assignee;
    }

    column.cards.push(card);
    await board.save();

    const newCard = column.cards[column.cards.length - 1];
    getIO()?.to(`board:${req.params.id}`).emit('board:card-added', { boardId: req.params.id, columnId, card: newCard });
    res.status(201).json({ card: newCard });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// PUT /api/boards/:id/cards/:cardId — update a card
router.put('/:id/cards/:cardId', async (req, res) => {
  try {
    const board = await Board.findById(req.params.id);
    if (!board) return res.status(404).json({ message: 'Board not found' });

    const project = await requireProjectMember(req, res, board.project);
    if (!project) return;

    let card = null;
    for (const col of board.columns) {
      card = col.cards.id(req.params.cardId);
      if (card) break;
    }
    if (!card) return res.status(404).json({ message: 'Card not found' });

    const { title, description, dueDate, labels, assignee, progress } = req.body;
    if (title !== undefined) card.title = title;
    if (description !== undefined) card.description = description;
    if (dueDate !== undefined) card.dueDate = dueDate;
    if (labels !== undefined) card.labels = labels;
    if (assignee !== undefined) card.assignee = assignee;
    if (progress !== undefined) card.progress = Math.min(100, Math.max(0, Number(progress)));

    await board.save();
    getIO()?.to(`board:${req.params.id}`).emit('board:card-updated', { boardId: req.params.id, card });
    res.json({ card });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST /api/boards/:id/cards/:cardId/attachments — upload attachment
router.post('/:id/cards/:cardId/attachments', upload.single('file'), async (req, res) => {
  try {
    const board = await Board.findById(req.params.id);
    if (!board) return res.status(404).json({ message: 'Board not found' });

    const project = await requireProjectMember(req, res, board.project);
    if (!project) return;

    let card = null;
    for (const col of board.columns) {
      card = col.cards.id(req.params.cardId);
      if (card) break;
    }
    if (!card) return res.status(404).json({ message: 'Card not found' });

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const attachment = {
      id: crypto.randomBytes(12).toString('hex'),
      name: req.file.filename,
      originalName: req.file.originalname,
      url: `/uploads/${req.file.filename}`,
      size: req.file.size,
      uploadedAt: new Date(),
    };

    card.attachments.push(attachment);
    await board.save();

    res.status(201).json({ attachment });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// DELETE /api/boards/:id/cards/:cardId/attachments/:attachmentId — delete attachment
router.delete('/:id/cards/:cardId/attachments/:attachmentId', async (req, res) => {
  try {
    const board = await Board.findById(req.params.id);
    if (!board) return res.status(404).json({ message: 'Board not found' });

    const project = await requireProjectMember(req, res, board.project);
    if (!project) return;

    let card = null;
    for (const col of board.columns) {
      card = col.cards.id(req.params.cardId);
      if (card) break;
    }
    if (!card) return res.status(404).json({ message: 'Card not found' });

    card.attachments = card.attachments.filter(
      (a) => a.id !== req.params.attachmentId && a._id?.toString() !== req.params.attachmentId
    );
    await board.save();

    res.json({ message: 'Attachment deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST /api/boards/:id/cards/:cardId/move — move a card between columns
router.post('/:id/cards/:cardId/move', async (req, res) => {
  try {
    const board = await Board.findById(req.params.id);
    if (!board) return res.status(404).json({ message: 'Board not found' });

    const project = await requireProjectMember(req, res, board.project);
    if (!project) return;

    const { targetColumnId } = req.body;
    if (!targetColumnId) {
      return res.status(400).json({ message: 'targetColumnId is required' });
    }

    // Find and remove card from source column
    let cardData = null;
    let sourceColumnId = null;
    for (const col of board.columns) {
      const idx = col.cards.findIndex((c) => c._id.toString() === req.params.cardId);
      if (idx !== -1) {
        // Deep-clone to plain object to strip all Mongoose wrappers
        cardData = JSON.parse(JSON.stringify(col.cards[idx]));
        sourceColumnId = col._id.toString();
        col.cards.splice(idx, 1);
        break;
      }
    }
    if (!cardData) return res.status(404).json({ message: 'Card not found' });

    const targetColumn = board.columns.id(targetColumnId);
    if (!targetColumn) return res.status(404).json({ message: 'Target column not found' });

    targetColumn.cards.push(cardData);
    board.markModified('columns');
    await board.save();
    getIO()?.to(`board:${req.params.id}`).emit('board:card-moved', { boardId: req.params.id, cardId: req.params.cardId, sourceColumnId, targetColumnId });
    res.json({ message: 'Card moved', cardId: req.params.cardId, sourceColumnId, targetColumnId });
  } catch (err) {
    console.error('Move card error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// DELETE /api/boards/:id/cards/:cardId
router.delete('/:id/cards/:cardId', async (req, res) => {
  try {
    const board = await Board.findById(req.params.id);
    if (!board) return res.status(404).json({ message: 'Board not found' });

    const project = await requireProjectMember(req, res, board.project);
    if (!project) return;

    for (const col of board.columns) {
      const idx = col.cards.findIndex((c) => c._id.toString() === req.params.cardId);
      if (idx !== -1) {
        col.cards.splice(idx, 1);
        await board.save();
        getIO()?.to(`board:${req.params.id}`).emit('board:card-deleted', { boardId: req.params.id, cardId: req.params.cardId });
        return res.json({ message: 'Card deleted' });
      }
    }
    res.status(404).json({ message: 'Card not found' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST /api/boards/:id/columns — add a column
router.post('/:id/columns', async (req, res) => {
  try {
    const board = await Board.findById(req.params.id);
    if (!board) return res.status(404).json({ message: 'Board not found' });

    const project = await requireProjectMember(req, res, board.project);
    if (!project) return;

    const { title } = req.body;
    if (!title) {
      return res.status(400).json({ message: 'Column title is required' });
    }

    board.columns.push({ title, cards: [], order: board.columns.length });
    await board.save();

    const newColumn = board.columns[board.columns.length - 1];
    getIO()?.to(`board:${req.params.id}`).emit('board:column-added', { boardId: req.params.id, column: newColumn });
    res.status(201).json({ column: newColumn });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// PUT /api/boards/:id/columns/:columnId — rename a column
router.put('/:id/columns/:columnId', async (req, res) => {
  try {
    const board = await Board.findById(req.params.id);
    if (!board) return res.status(404).json({ message: 'Board not found' });

    const project = await requireProjectMember(req, res, board.project);
    if (!project) return;

    const column = board.columns.id(req.params.columnId);
    if (!column) return res.status(404).json({ message: 'Column not found' });

    const { title } = req.body;
    if (title !== undefined) column.title = title;

    await board.save();
    getIO()?.to(`board:${req.params.id}`).emit('board:column-renamed', { boardId: req.params.id, columnId: req.params.columnId, title });
    res.json({ column });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// DELETE /api/boards/:id/columns/:columnId — delete a column
router.delete('/:id/columns/:columnId', async (req, res) => {
  try {
    const board = await Board.findById(req.params.id);
    if (!board) return res.status(404).json({ message: 'Board not found' });

    const project = await requireProjectMember(req, res, board.project);
    if (!project) return;

    const colIdx = board.columns.findIndex((c) => c._id.toString() === req.params.columnId);
    if (colIdx === -1) return res.status(404).json({ message: 'Column not found' });

    board.columns.splice(colIdx, 1);
    await board.save();
    getIO()?.to(`board:${req.params.id}`).emit('board:column-deleted', { boardId: req.params.id, columnId: req.params.columnId });
    res.json({ message: 'Column deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;

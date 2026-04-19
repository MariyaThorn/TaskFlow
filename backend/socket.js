const { Server } = require('socket.io');

let io = null;

function initSocket(server) {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://26.72.254.233:3001",
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    // Join a board room when client requests it
    socket.on('join-board', async (boardId, userId) => {
      socket.join(`board:${boardId}`);
      socket.data.boardId = boardId;
      socket.data.userId = userId;
      // Broadcast updated presence list
      broadcastPresence(boardId);
    });

    // Leave a board room
    socket.on('leave-board', (boardId) => {
      socket.leave(`board:${boardId}`);
      socket.data.boardId = null;
      socket.data.userId = null;
      broadcastPresence(boardId);
    });

    socket.on('request-presence', (boardId) => {
      if (boardId) broadcastPresence(boardId);
    });

    // Live cursor tracking
    socket.on('cursor-move', (data) => {
      // data: { boardId, userId, userName, userAvatar, userColor, x, y }
      if (data.boardId) {
        socket.to(`board:${data.boardId}`).emit('board:cursor-move', data);
      }
    });

    socket.on('disconnect', () => {
      // Broadcast presence update for the board this socket was on
      if (socket.data.boardId) {
        broadcastPresence(socket.data.boardId);
      }
    });
  });

  return io;
}

async function broadcastPresence(boardId) {
  if (!io) return;
  const room = `board:${boardId}`;
  const sockets = await io.in(room).fetchSockets();
  const activeUserIds = [...new Set(sockets.map((s) => s.data.userId).filter(Boolean))];
  io.to(room).emit('board:presence', { boardId, activeUserIds });
}

function getIO() {
  return io;
}

module.exports = { initSocket, getIO };

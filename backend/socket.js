const { Server } = require('socket.io');

let io = null;

function initSocket(server) {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3001',
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    // Join a board room when client requests it
    socket.on('join-board', (boardId) => {
      socket.join(`board:${boardId}`);
    });

    // Leave a board room
    socket.on('leave-board', (boardId) => {
      socket.leave(`board:${boardId}`);
    });

    socket.on('disconnect', () => {
      // cleanup handled automatically by socket.io
    });
  });

  return io;
}

function getIO() {
  return io;
}

module.exports = { initSocket, getIO };

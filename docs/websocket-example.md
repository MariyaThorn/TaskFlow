# WebSocket Example — Backend + Frontend (Socket.IO)

This file contains minimal, copy-pasteable examples showing how to wire up Socket.IO with an Express backend and a Next.js frontend. Keep socket authentication and server-side validation strict — never trust client events.

---

## Backend (example `backend/socket.js`)

```js
// backend/socket.js
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken'); // optional - if you use JWT
let io;

function init(server) {
  io = new Server(server, {
    cors: { origin: process.env.FRONTEND_ORIGIN || 'http://localhost:3001' },
    path: '/socket.io',
  });

  // Handshake authentication (optional)
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.query?.token;
      if (!token) return next(); // allow anonymous sockets if desired
      const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');
      socket.user = payload; // attach user info to socket
      next();
    } catch (err) {
      // If you require auth, call next(new Error('unauthorized'))
      next();
    }
  });

  io.on('connection', (socket) => {
    console.log('socket connected', socket.id, 'user:', socket.user?.id || 'anon');

    socket.on('join-board', ({ boardId }) => {
      socket.join(`board:${boardId}`);
      io.to(`board:${boardId}`).emit('board:presence', { userId: socket.user?.id, action: 'join' });
    });

    socket.on('leave-board', ({ boardId }) => {
      socket.leave(`board:${boardId}`);
      io.to(`board:${boardId}`).emit('board:presence', { userId: socket.user?.id, action: 'leave' });
    });

    // Example: client asks to create a card — validate and persist on server
    socket.on('card:create', async (payload) => {
      // IMPORTANT: validate payload and persist to DB here
      // const card = await CardModel.create({...payload});
      // then broadcast
      io.to(`board:${payload.boardId}`).emit('board:card-added', payload.card || payload);
    });

    socket.on('disconnect', () => {
      // optional cleanup
    });
  });
}

function getIo() {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
}

module.exports = { init, getIo };
```

### Integrate with your server entry (example `bin/www` or `server.js`)

```js
const http = require('http');
const app = require('./app');
const server = http.createServer(app);
const { init } = require('./socket');

init(server);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log('listening on', PORT));
```

### Emitting from Express routes

In any route handler you can `require('./socket').getIo()` to broadcast after persisting data:

```js
const { getIo } = require('./socket');

app.post('/api/boards/:id/cards', authMiddleware, async (req, res) => {
  const boardId = req.params.id;
  // validate and save card to DB
  const card = await createCardInDb(boardId, req.body);

  // broadcast to connected board clients
  const io = getIo();
  io.to(`board:${boardId}`).emit('board:card-added', card);

  res.status(201).json({ card });
});
```

---

## Frontend (Next.js) — client example

Place this in a client-only module (e.g. `frontend/lib/socket.ts`) and only call from browser code (useEffect).

```ts
// frontend/lib/socket.ts
import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function initSocket(token?: string) {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000', {
      path: '/socket.io',
      autoConnect: false,
      transports: ['websocket'],
      auth: { token }, // passed during handshake
    });
    socket.connect();
  }
  return socket;
}

export function disconnectSocket() {
  if (socket) { socket.disconnect(); socket = null; }
}
```

### Usage inside a board React component

```tsx
import { useEffect } from 'react';
import { initSocket } from '@/lib/socket';

export default function BoardPage({ boardId }) {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('token');
    const socket = initSocket(token);

    socket.emit('join-board', { boardId });

    const handleCardAdded = (card) => {
      // update local state
    };
    socket.on('board:card-added', handleCardAdded);

    return () => {
      socket.emit('leave-board', { boardId });
      socket.off('board:card-added', handleCardAdded);
    };
  }, [boardId]);

  return <div>Board UI</div>;
}
```

---

## Authentication & security notes

- Prefer sending an auth token in the handshake (`auth: { token }`) rather than query string.
- Validate and persist all changes on the server before broadcasting updates.
- Use `io.use()` to verify the token during handshake and attach `socket.user`.
- Rate-limit and validate payload sizes to avoid abuse.

## Quick test/run commands

```powershell
# backend
cd backend
npm run dev    # or: node ./bin/www

# frontend
cd frontend
npm run dev
```

If port 3000 is in use, free it (Windows example):

```powershell
netstat -ano | findstr :3000
taskkill /PID <pid> /F
```

---

If you want, I can:

- add the `backend/socket.js` file to your repo and wire `bin/www` to call `init(server)`,
- add `frontend/lib/socket.ts` and show an integrated board component using your existing `useBoard` hook.

Tell me which action you want next and I will apply it.

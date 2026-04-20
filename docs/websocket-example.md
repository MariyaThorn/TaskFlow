# TaskFlow — Backend & WebSocket Technical Summary

> This document explains exactly how TaskFlow's backend server and real-time WebSocket layer work. Written for presentation and academic explanation.

---

## 1. Backend Overview

TaskFlow's backend is a **Node.js + Express** REST API server running on **port 3000**.

### Startup sequence (`bin/www`)

When the server starts, three things happen in order:

1. `app.js` is loaded — Express is configured with middleware, routes, and session storage.
2. An `http.Server` wraps the Express app.
3. `initSocket(server)` is called — Socket.IO attaches to the **same HTTP server**, so REST and WebSocket traffic share one port.

```
Node.js Process (port 3000)
├── Express HTTP Server  ← handles all /api/* REST requests
└── Socket.IO Server     ← handles ws:// WebSocket connections
```

### Middleware stack (`app.js`)

Every incoming HTTP request passes through these layers in order:

| Layer | Purpose |
|---|---|
| `cors` | Allows requests from the frontend origin (`FRONTEND_URL`) |
| `express-session` | Reads/writes the user's session cookie |
| `express.json()` | Parses JSON request bodies |
| `multer` (on specific routes) | Handles file uploads (board/project backgrounds, attachments) |
| `protect` (auth middleware) | Verifies identity before protected routes |
| Route handlers | The actual business logic |

### Dual Authentication (`middleware/auth.js`)

Every protected route runs the `protect` middleware, which checks identity in two steps:

```
Request arrives
    │
    ▼
1. Is there a valid session cookie?  ──yes──▶  Load user from DB → proceed
    │ no
    ▼
2. Is there a valid JWT Bearer token?  ──yes──▶  Decode JWT → load user → proceed
    │ no
    ▼
   401 Unauthorized
```

- **Sessions** are stored in MongoDB (via `connect-mongo`), expire after 7 days, and use `httpOnly` cookies. This is used by the browser client after login.
- **JWT tokens** are also issued on login and stored in `localStorage`. This lets API clients (mobile apps, Swagger UI, scripts) authenticate without a session cookie.

Both methods produce the same result: `req.user` is set to the full user document from MongoDB before the route handler runs.

### Database (`config/db.js` + Mongoose)

MongoDB is used as the database. There are **4 main collections**:

| Collection | What it stores |
|---|---|
| `users` | Accounts, profile info, settings, hashed passwords |
| `projects` | Projects, member list, invitations, invite codes |
| `boards` | Boards — contains embedded columns and cards |
| `teams` | Teams, member list, linked projects |
| `sessions` | Express session store (managed by `connect-mongo`) |

Boards use **embedded subdocuments** — columns and cards live inside the board document rather than as separate collections. This keeps a full board load to a single MongoDB query.

### REST API Routes

| Prefix | File | Responsibility |
|---|---|---|
| `/api/auth` | `routes/auth.js` | Register, login, logout, get current user |
| `/api/users` | `routes/users.js` | Profile, password, settings, account deletion |
| `/api/projects` | `routes/projects.js` | Project CRUD, invitations, invite links |
| `/api/boards` | `routes/boards.js` | Board CRUD, columns, cards, file uploads |
| `/api/teams` | `routes/teams.js` | Team CRUD, members, team projects |
| `/api/admin` | `routes/admin.js` | Session inspection and termination (admin only) |
| `/api-docs` | `swagger.js` | Interactive Swagger UI documentation |

---

## 2. WebSocket Layer (Real-time)

TaskFlow uses **Socket.IO** to push live updates to all users viewing the same board simultaneously — no polling needed.

### How Socket.IO is initialized

In `bin/www`, `initSocket(server)` is called with the HTTP server:

```js
var server = http.createServer(app);
initSocket(server);   // Socket.IO binds to the same port as Express
```

Socket.IO runs alongside Express on port 3000. A WebSocket connection (`ws://`) is upgraded from a regular HTTP connection by the browser automatically.

### Connection lifecycle

```
Browser opens Board page
        │
        ▼
  socket.connect()  →  server: 'connection' event fires, socket gets unique ID
        │
        ▼
  client emits 'join-board' (boardId, userId)
        │
        ▼
  server: socket.join('board:<boardId>')   ← socket enters a named room
  server: broadcastPresence(boardId)       ← tells everyone who is online
        │
        ▼
  User works on the board (add/move/edit cards)
        │
        ▼
  REST API call (e.g. POST /api/boards/:id/cards)
        │
        ▼
  Route handler saves change to MongoDB
  Route handler calls: io.to('board:<boardId>').emit('board:card-added', card)
        │
        ▼
  ALL other sockets in that board room receive the event instantly
        │
        ▼
  User leaves or closes tab → 'disconnect' event
  server: broadcastPresence(boardId)  ← removes user from presence list
```

### Rooms

Socket.IO **rooms** are the key concept. Every board has its own room named `board:<boardId>`. When a client joins a board, their socket is added to that room. When the server emits an event to `io.to('board:<boardId>')`, only clients in that room receive it.

This means updates to Board A never reach users viewing Board B, even though they're on the same server.

### Events reference

| Direction | Event | Payload | Description |
|---|---|---|---|
| Client → Server | `join-board` | `boardId, userId` | Client enters a board room |
| Client → Server | `leave-board` | `boardId` | Client leaves a board room |
| Client → Server | `cursor-move` | `boardId, userId, userName, userColor, x, y` | Sends cursor position |
| Client → Server | `request-presence` | `boardId` | Asks for current presence list |
| Server → Client | `board:presence` | `{ boardId, activeUserIds[] }` | Who is currently online on the board |
| Server → Client | `board:cursor-move` | `{ boardId, userId, x, y, ... }` | Live cursor positions of other users |
| Server → Client | `board:card-added` | card object | A new card was created |
| Server → Client | `board:card-updated` | card object | A card was edited |
| Server → Client | `board:card-moved` | `{ cardId, sourceColumnId, targetColumnId }` | A card was moved |
| Server → Client | `board:card-deleted` | `{ cardId, columnId }` | A card was removed |
| Server → Client | `board:column-added` | column object | A new column was created |
| Server → Client | `board:column-renamed` | `{ columnId, title }` | A column was renamed |
| Server → Client | `board:column-deleted` | `{ columnId }` | A column was removed |

### Presence tracking (`broadcastPresence`)

The `broadcastPresence` function is called whenever someone joins, leaves, or disconnects:

```js
async function broadcastPresence(boardId) {
  const sockets = await io.in(`board:${boardId}`).fetchSockets();
  const activeUserIds = [...new Set(sockets.map(s => s.data.userId).filter(Boolean))];
  io.to(`board:${boardId}`).emit('board:presence', { boardId, activeUserIds });
}
```

It fetches all sockets currently in the board room, collects their `userId` (stored when they joined), deduplicates, and broadcasts the list. The frontend uses this to show user avatars for who is online.

### Live cursors

When a user moves their mouse, the frontend emits `cursor-move` with their position and identity. The server relays it to everyone else in the room using `socket.to(room)` (which excludes the sender), so users can see each other's cursors in real-time.

---

## 3. How REST and WebSocket work together

REST and WebSocket are complementary — not competing:

- **REST** handles **actions**: creating, updating, deleting data. It validates, saves to MongoDB, and returns a response to the caller.
- **WebSocket** handles **broadcasting**: after REST saves the change, the route emits a socket event so every other connected client updates their UI without refreshing.

Example — user creates a card:

```
Frontend (User A)          Backend                      Frontend (User B)
      │                       │                                │
      │  POST /api/boards/:id/cards                            │
      │──────────────────────▶│                                │
      │                       │ 1. Validate request            │
      │                       │ 2. Save card to MongoDB        │
      │                       │ 3. emit('board:card-added')    │
      │  201 { card }         │──────────────────────────────▶│
      │◀──────────────────────│               board:card-added │
      │                                                        │
      │  Updates own UI from  │              Updates UI from   │
      │  HTTP response        │              socket event      │
```

---

## 4. Running the backend

```powershell
cd backend
npm run dev        # uses nodemon for auto-restart
# or
node ./bin/www     # production start
```

API docs are available at `http://localhost:3000/api-docs` (Swagger UI).


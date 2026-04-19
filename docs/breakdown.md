## 1. Problem Identification & Database Design

### Problem Identification

Traditional project management suffers from three core issues:

1. **Scattered tools** — Teams juggle spreadsheets, chat threads, and sticky notes with no unified view of task status.
2. **No real-time visibility** — Changes made by one member aren't seen by others until they manually refresh; nobody knows who is currently working on what.
3. **Rigid workflows** — Most tools impose fixed pipelines that don't adapt to how teams actually organize work.

**TaskFlow's solution:** A real-time collaborative Kanban board where teams can create projects, organize work into customizable boards with drag-and-drop columns and cards, invite members, and see each other's presence and live cursors — all updating instantly.

---

### Database Design (MongoDB + Mongoose)

TaskFlow uses **4 collections** with embedded subdocuments for performance (no joins needed for board data).

#### User Schema (`backend/models/User.js`)

| Field | Type | Details |
|---|---|---|
| `email` | String | `required`, `unique`, `lowercase`, `trim` |
| `username` | String | `unique` (sparse), `trim`, `lowercase` |
| `password` | String | `required`, `minlength: 8`, `select: false` (excluded from queries by default) |
| `firstName` | String | `trim`, default `''` |
| `lastName` | String | `trim`, default `''` |
| `occupation` | String | `trim`, default `''` |
| `avatarColor` | String | Tailwind gradient class for avatar background |
| `profileImage` | String | URL to uploaded profile image |
| `role` | String | `enum: ['user', 'admin']`, default `'user'` |
| `settings` | Subdocument | `darkMode`, `emailNotifications`, `pushNotifications`, `weeklyDigest`, `language`, `timezone`, `profileVisibility` |

**Pre-save hook:** Automatically hashes password with `bcryptjs` (12 rounds) before saving.  
**Instance method:** `comparePassword(candidate)` — uses `bcrypt.compare` for login verification.  
**Timestamps:** Auto `createdAt` / `updatedAt`.

#### Project Schema (`backend/models/Project.js`)

| Field | Type | Details |
|---|---|---|
| `name` | String | `required`, `trim` |
| `color` | String | Tailwind gradient for project card |
| `backgroundImage` | String | URL to custom background |
| `team` | ObjectId → Team | Optional team association |
| `members[]` | Embedded subdocs | `user` (ObjectId → User), `role` (owner/admin/member), `joinedAt` |
| `invitations[]` | Embedded subdocs | `email`, `role`, `status` (pending/accepted/declined), `invitedBy`, `createdAt` |
| `inviteCode` | String | `unique`, auto-generated via `crypto.randomBytes(16).toString('hex')` |

**Index:** `{ inviteCode: 1 }` for fast invite link lookup.  
**Static method:** `randomColor` — picks from 10 preset Tailwind gradient pairs.

#### Board Schema (`backend/models/Board.js`)

| Field | Type | Details |
|---|---|---|
| `name` | String | `required`, `trim` |
| `description` | String | Optional board description |
| `project` | ObjectId → Project | `required` — which project this board belongs to |
| `color` | String | Board theme color, default `'from-blue-500 to-blue-600'` |
| `backgroundImage` | String | Custom background image URL |
| `columns[]` | Embedded subdocs | Each has `title`, `order`, and `cards[]` |
| `columns[].cards[]` | Deeply embedded | `title`, `description`, `dueDate`, `labels[]`, `attachments[]`, `progress` (0–100), `assignee`, `order` |
| `createdBy` | ObjectId → User | Who created the board |

**Default columns:** "To Do", "In Progress", "Review", "Done" — created automatically on new board.  
**Index:** `{ project: 1 }` for fast lookup of boards per project.  
**Card attachments:** Each stores `name`, `originalName`, `url`, `size`, `uploadedAt`.  
**Card assignee:** Embedded object with `user` (ObjectId → User), `name`, `avatar`, `color`.

#### Team Schema (`backend/models/Team.js`)

| Field | Type | Details |
|---|---|---|
| `name` | String | `required`, `trim` |
| `description` | String | Optional |
| `members[]` | Embedded subdocs | `user` (ObjectId → User), `role` (owner/admin/member), `joinedAt` |
| `projects[]` | ObjectId[] → Project | Array of associated project references |

#### Entity Relationships

```
User ──(members)──► Team ──(projects)──► Project ──(project)──► Board ──(columns)──► Column ──(cards)──► Card
```

- **User ↔ Project:** Many-to-many via `Project.members[]` (embedded with role)
- **User ↔ Team:** Many-to-many via `Team.members[]` (embedded with role)
- **Team ↔ Project:** One-to-many, bidirectional (`Project.team` ref + `Team.projects[]` array)
- **Project → Board:** One-to-many via `Board.project` ref (indexed)
- **Board → Columns → Cards:** Deeply embedded — entire board data in one document for fast reads

**Design rationale:** Embedding columns and cards inside the Board document means a single `findById()` returns the entire board state with no joins, which is critical for real-time performance.

---

## 2. RESTful API & Asynchronous Programming

### RESTful API Architecture

The backend is built with **Express.js** and follows RESTful conventions. Routes are mounted under `/api` in `backend/app.js`:

| Prefix | Module | Description |
|---|---|---|
| `/api/auth` | `routes/auth.js` | Authentication (register, login, logout, me) |
| `/api/projects` | `routes/projects.js` | Project CRUD, invitations, members |
| `/api/boards` | `routes/boards.js` | Board CRUD, cards, columns, attachments |
| `/api/users` | `routes/users.js` | Profile, password, settings, account deletion |
| `/api/teams` | `routes/teams.js` | Team CRUD, members, project linking |
| `/api/admin` | `routes/admin.js` | Session management (admin only) |

### Complete API Endpoints

#### Authentication (`/api/auth`)
| Method | Endpoint | Description |
|---|---|---|
| POST | `/register` | Create account → returns JWT + user object |
| POST | `/login` | Verify credentials → returns JWT + user object |
| POST | `/logout` | Destroy session + clear cookie |
| GET | `/me` | Return current user (requires auth) |

#### Projects (`/api/projects`) — all authenticated
| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | List all projects where current user is a member |
| POST | `/` | Create project (user becomes owner automatically) |
| GET | `/my-invitations` | List pending invitations for current user's email |
| GET | `/:id` | Get single project (membership verified) |
| PATCH | `/:id/appearance` | Update project color / background image |
| POST | `/:id/background` | Upload custom background image via multer |
| POST | `/:id/invite` | Invite user by email or username (owner/admin only) |
| GET | `/:id/invite-link` | Get shareable invite URL (owner/admin only) |
| POST | `/:id/regenerate-invite` | Regenerate invite code (owner/admin only) |
| POST | `/join/:code` | Join project via invite link code |
| POST | `/:id/invitations/:invId/accept` | Accept a pending invitation |
| POST | `/:id/invitations/:invId/decline` | Decline a pending invitation |
| DELETE | `/:id` | Delete project + all boards (owner only) |

#### Boards (`/api/boards`) — all authenticated
| Method | Endpoint | Description |
|---|---|---|
| GET | `/project/:projectId` | List all boards for a project |
| POST | `/` | Create board (body: `name`, `projectId`) |
| GET | `/:id` | Get board with full column/card data + project members |
| PUT | `/:id` | Update board name, description, color, background |
| DELETE | `/:id` | Delete board |
| POST | `/:id/background` | Upload board background image |
| POST | `/:id/cards` | Add card to a column |
| PUT | `/:id/cards/:cardId` | Update card fields |
| POST | `/:id/cards/:cardId/attachments` | Upload file attachment to card |
| DELETE | `/:id/cards/:cardId/attachments/:attachmentId` | Delete attachment |
| POST | `/:id/cards/:cardId/move` | Move card between columns |
| DELETE | `/:id/cards/:cardId` | Delete card |
| POST | `/:id/columns` | Add new column |
| PUT | `/:id/columns/:columnId` | Rename column |
| DELETE | `/:id/columns/:columnId` | Delete column |

#### Users (`/api/users`) — all authenticated
| Method | Endpoint | Description |
|---|---|---|
| PUT | `/profile` | Update name, username, email, occupation |
| PUT | `/password` | Change password (requires current password) |
| GET | `/settings` | Get user settings |
| PUT | `/settings` | Update settings (allowlisted fields only) |
| DELETE | `/account` | Delete account + clean up project/board data |

#### Teams (`/api/teams`) — all authenticated
| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | List teams where user is a member |
| POST | `/` | Create team (user becomes owner) |
| GET | `/:id` | Get team with populated members + projects |
| PUT | `/:id` | Update team info (owner/admin only) |
| DELETE | `/:id` | Delete team, unlink projects (owner only) |
| POST | `/:id/members` | Add member by email/username (owner/admin) |
| PUT | `/:id/members/:memberId/role` | Change member role (owner only) |
| DELETE | `/:id/members/:memberId` | Remove member (owner/admin, can't remove owner) |
| POST | `/:id/projects` | Create or import project into team |
| DELETE | `/:id/projects/:projectId` | Remove project from team |

#### Admin (`/api/admin`) — authenticated + admin role
| Method | Endpoint | Description |
|---|---|---|
| GET | `/sessions` | List all active sessions from MongoDB store |
| DELETE | `/sessions/:sessionId` | Destroy a specific session |
| DELETE | `/sessions/user/:userId` | Destroy all sessions for a user |

### Asynchronous Programming

Every route handler uses **`async/await`** — no callback-based or `.then()` Promise chains.

**Pattern used across all routes:**
```js
router.post('/', protect, async (req, res) => {
  try {
    const project = await Project.create({ ... });
    const board = await Board.findById(id);
    await board.save();
    res.status(201).json(project);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});
```

**Why async/await matters:**
- MongoDB operations (`find`, `findById`, `create`, `save`, `deleteMany`) are I/O-bound and return Promises
- `await` keeps code readable and sequential — no nesting
- `try/catch` provides centralized error handling per route
- The `protect` middleware is also `async` — it `await`s `User.findById()` and `jwt.verify()`

**Optimistic concurrency on the frontend:** The `useBoard` hook in `frontend/app/dashboard/board/[id]/useBoard.ts` updates local React state immediately (optimistic), then `await`s the API call. If the API fails, it calls `fetchBoard()` to re-sync from the server.

---

## 3. Authentication, Security & Validation

### Authentication System

TaskFlow implements a **dual authentication strategy** — both JWT tokens and server-side sessions.

#### JWT Token Flow (`backend/routes/auth.js`)
1. **Registration / Login** → server creates JWT: `jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })`
2. Token is returned in the JSON response body (not a cookie)
3. Frontend stores token in `localStorage` under key `taskflow_token`
4. Every API request attaches: `Authorization: Bearer <token>`

#### Session Flow (`backend/app.js`)
1. On login, the server also stores `userId` and `email` in `req.session`
2. Sessions are persisted to **MongoDB** via `connect-mongo` (collection: `sessions`, TTL: 7 days)
3. Session cookie: `httpOnly: true`, `secure` in production, `sameSite: 'strict'` in production / `'lax'` in dev

#### Auth Middleware — Dual Check (`backend/middleware/auth.js`)
```
Request → Check req.session.userId → found? Attach user
              ↓ not found
         Check Authorization header → extract Bearer token → jwt.verify()
              ↓ verified
         User.findById(decoded.id) → Attach user to req.user
              ↓ not found
         Return 401 Unauthorized
```
The middleware first tries the session (cookie-based), then falls back to the JWT header. This supports both browser navigation (cookies) and programmatic API calls (token header).

### Password Security

| Aspect | Implementation |
|---|---|
| **Hashing library** | `bcryptjs` |
| **Salt rounds** | 12 (in `User` model pre-save hook) |
| **When hashed** | Automatically before every save, only if `password` field was modified |
| **Comparison** | `user.comparePassword(candidate)` uses `bcrypt.compare` (timing-safe) |
| **Minimum length** | 8 characters (enforced at schema level `minlength: 8` AND in route validation) |
| **Query exclusion** | `select: false` on password field — never returned in normal queries |

### Validation

TaskFlow uses **manual inline validation** in route handlers (no external validation library):

**Registration validation (`routes/auth.js`):**
- `email` and `password` are required → 400 if missing
- Password must be ≥ 8 characters → 400 if too short
- Duplicate email check → 409 Conflict
- Duplicate username check → 409 Conflict

**Login validation:**
- `email` and `password` required → 400
- User existence check → 401 "Invalid credentials"
- Password comparison → 401 "Invalid credentials" (same message to prevent user enumeration)

**Password change (`routes/users.js`):**
- `currentPassword` and `newPassword` required
- Current password verified via `comparePassword()`
- New password ≥ 8 characters

**Board/Card operations:**
- `columnId` and `title` required for card creation
- `title` required for column creation
- Board ownership verified via project membership

### Role-Based Access Control (RBAC)

Three levels of roles:

**1. System-level** (`User.role`):
- `user` — standard access
- `admin` — can manage sessions via `/api/admin/*`
- Admin check: middleware rejects non-admin with 403

**2. Project-level** (`Project.members[].role`):
- `owner` — full control (delete project, invite, manage)
- `admin` — can invite members, get/regenerate invite links
- `member` — read/write on boards and cards

**3. Team-level** (`Team.members[].role`):
- `owner` — full control (delete team, change roles, add/remove members)
- `admin` — can add/remove members, manage projects
- `member` — read access

### Security Features Summary

| Feature | How |
|---|---|
| Password hashing | bcryptjs, 12 rounds, auto-hash on save |
| Token security | JWT with secret key, expiry, stored in localStorage |
| Session security | httpOnly cookie, secure in prod, sameSite strict in prod |
| Session storage | MongoDB (server-side), 7-day TTL |
| Password in queries | `select: false` — never leaked in API responses |
| File upload limits | multer with 10 MB max file size |
| CORS | Configured with explicit origin, credentials enabled |
| File naming | `crypto.randomBytes(16)` — randomized filenames prevent path traversal |

---

## 4. UI & Client-Server Interaction

### Frontend Tech Stack

- **Framework:** Next.js (App Router, React Server Components)
- **Language:** TypeScript
- **Styling:** Tailwind CSS with custom brand palette
- **Drag & Drop:** `@hello-pangea/dnd` library
- **Real-time:** Socket.IO client
- **HTTP:** Native `fetch` API (no axios)

### Client-Server Communication Pattern

All API calls use the **native `fetch` API** with a consistent pattern:

```ts
// Token retrieval (frontend/lib/auth.ts)
export function getToken(): string | null {
  return localStorage.getItem("taskflow_token");
}

// Standard request pattern (used everywhere)
const res = await fetch(`${API_URL}/boards/${boardId}`, {
  method: "GET",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
  credentials: "include",  // sends session cookie too
});
const data = await res.json();
```

**Key points:**
- `credentials: "include"` sends the session cookie alongside the JWT header
- Both auth mechanisms are always sent — the server accepts whichever is valid
- Base URL from `NEXT_PUBLIC_API_URL` environment variable

### Auth Utility Functions (`frontend/lib/auth.ts`)

| Function | Purpose |
|---|---|
| `getToken()` | Read JWT from `localStorage("taskflow_token")` |
| `getUser()` | Parse user object from `localStorage("taskflow_user")` |
| `saveAuth(data)` | Store token + user after login/register |
| `clearAuth()` | Remove both keys on logout |
| `isAuthenticated()` | Returns `true` if token exists |
| `login(email, password)` | `POST /auth/login` → save auth → return response |
| `register(email, password, ...)` | `POST /auth/register` → save auth → return response |
| `logout()` | `POST /auth/logout` → clear auth |
| `fetchMe()` | `GET /auth/me` → verify token is still valid |

### State Management — The `useBoard` Hook (`frontend/app/dashboard/board/[id]/useBoard.ts`)

This custom hook manages **all board state** using React's `useState`:

**State variables:**
- `boardName`, `boardColor`, `boardBackgroundImage` — board metadata
- `projectId`, `projectName` — parent project info
- `columns: Column[]` — full kanban data (columns + cards)
- `projectMembers: TeamMember[]` — team members for assignee selection
- `selectedCard` — currently open card in the detail modal

**Optimistic update pattern:**
1. User drags a card or edits something
2. React state is updated **immediately** (no loading spinner)
3. `fetch()` sends the change to the backend
4. If the API call fails → `fetchBoard()` re-syncs the entire board from the server
5. A `pendingOp` ref prevents WebSocket events from causing double-updates during the user's own operations

### Key UI Components & Data Flow

```
BoardPage (page.tsx)
├── Sidebar — navigation (Projects, Teams, Settings)
├── BoardHeader — title, member avatars, background picker
├── KanbanBoard — scrollable column grid
│   ├── KanbanColumn × N — droppable column
│   │   ├── KanbanCard × N — draggable card
│   │   └── AddCardModal — new card form
│   └── "Add another list" button
├── CardDetailModal — full card editor (description, labels, due date, attachments, assignee)
└── LiveCursors — other users' cursor positions (SVG + name label)
```

**Data flow:**
1. `BoardPage` calls `useBoard(boardId)` → fetches `GET /api/boards/:id`
2. Board data populates all child components via props
3. User interactions (drag, edit, add, delete) → call hook methods → optimistic state update + API call
4. WebSocket events from other users → trigger `fetchBoard()` to sync latest data
5. `useBoardPresence(boardId)` → returns `activeUserIds[]` → shown as avatars in `BoardHeader`
6. `useBoardCursors(boardId)` → returns cursor positions → rendered by `LiveCursors`

### Presentation-Worthy UI Features

| Feature | Implementation |
|---|---|
| Drag-and-drop | `@hello-pangea/dnd` — `DragDropContext` wraps board, each column is `Droppable`, each card is `Draggable` |
| Avatar pop-in/out | CSS `@keyframes` scale animation when users join/leave the board |
| Live cursors | Colored SVG cursor + name label, positioned absolutely in the board area |
| Custom backgrounds | Preset images or user-uploaded (multer), stored in DB |
| Responsive sidebar | Collapsible on desktop (saved to localStorage), slide-out drawer on mobile |
| Card progress bars | Visual progress indicator (0–100%) on each card |
| Tooltips | Hover on avatar → shows name below with arrow, colored with user's gradient |

---

## 5. Real-time Features (WebSocket / Socket.IO)

### Technology

- **Library:** Socket.IO (server: `socket.io`, client: `socket.io-client`)
- **Transport:** WebSocket primary, HTTP long-polling fallback
- **Architecture:** Room-based — each board is a room

### Socket.IO Server Setup (`backend/socket.js`)

The socket server attaches to the HTTP server with CORS configured to match the frontend origin. It exports a `getIO()` function so REST routes can also emit events.

### Room Architecture

Every board has a room named `board:{boardId}`. When a user opens a board page:
1. Client emits `join-board` with `(boardId, userId)`
2. Server calls `socket.join("board:<boardId>")` and stores `boardId` + `userId` on `socket.data`
3. Server broadcasts updated presence to the room
4. On page unmount, client emits `leave-board` → server leaves the room and broadcasts again

### Socket Events — Complete Reference

#### Client → Server
| Event | Payload | Purpose |
|---|---|---|
| `join-board` | `(boardId, userId)` | Join board room, announce presence |
| `leave-board` | `(boardId)` | Leave board room |
| `request-presence` | `(boardId)` | Request current active users list |
| `cursor-move` | `{ boardId, userId, userName, userAvatar, userColor, x, y }` | Send cursor position |

#### Server → Client
| Event | Payload | Triggered By |
|---|---|---|
| `board:presence` | `{ boardId, activeUserIds[] }` | join-board, leave-board, disconnect, request-presence |
| `board:cursor-move` | `{ boardId, userId, userName, userAvatar, userColor, x, y }` | Relayed from cursor-move (excludes sender) |
| `board:card-added` | `{ boardId, columnId, card }` | REST: POST card |
| `board:card-updated` | `{ boardId, card }` | REST: PUT card |
| `board:card-moved` | `{ boardId, cardId, sourceColumnId, targetColumnId }` | REST: POST move |
| `board:card-deleted` | `{ boardId, cardId }` | REST: DELETE card |
| `board:column-added` | `{ boardId, column }` | REST: POST column |
| `board:column-renamed` | `{ boardId, columnId, title }` | REST: PUT column |
| `board:column-deleted` | `{ boardId, columnId }` | REST: DELETE column |

### Presence Tracking (`backend/socket.js`)

```js
async function broadcastPresence(boardId) {
  const sockets = await io.in(`board:${boardId}`).fetchSockets();
  const activeUserIds = [...new Set(
    sockets.map(s => s.data.userId).filter(Boolean)
  )];
  io.to(`board:${boardId}`).emit('board:presence', { boardId, activeUserIds });
}
```

- `fetchSockets()` gets all connected sockets in the room
- `new Set()` deduplicates — a user with multiple tabs only appears once
- Called on every join, leave, disconnect, and manual request

### Live Cursor System

**Emit (frontend, `page.tsx`):**
- `mousemove` event listener on the board area div (not the whole page)
- **Throttled to 50ms** — prevents flooding the socket
- Coordinates are **relative to the board area** (`clientX - rect.left`, `clientY - rect.top`)
- Cursors never appear over the sidebar or header

**Relay (server, `socket.js`):**
- `socket.to(room).emit(...)` — sends to all sockets in the room **except** the sender

**Render (frontend, `LiveCursors.tsx`):**
- Absolutely positioned div inside the board area
- Each cursor: colored SVG arrow + name label pill
- Color derived from user's Tailwind gradient class
- `pointer-events-none` so cursors don't block interactions

**Cleanup (frontend, `socket.ts`):**
- Cursors stored in a `Map<userId, CursorData & { ts }>` with timestamps
- `setInterval` every 3 seconds removes cursors not updated in 5 seconds
- Prevents stale cursors from users who navigated away without clean disconnect

### Client-Side Socket Hooks (`frontend/lib/socket.ts`)

| Hook | Returns | Purpose |
|---|---|---|
| `useBoardSocket(boardId, events)` | void | Joins room, listens for 7 board mutation events, calls callbacks |
| `useBoardPresence(boardId)` | `string[]` | Active user IDs in the board, auto-updates on presence changes |
| `useBoardCursors(boardId)` | `{ cursors, emitCursor }` | Live cursor positions + emit function |

**Singleton pattern:** A single socket connection is shared across all hooks via `getSocket()` — no duplicate connections.

### REST + WebSocket Integration

Board mutations follow a **hybrid REST + WebSocket** pattern:

1. User performs action (e.g., adds a card)
2. Frontend sends `POST /api/boards/:id/cards` (REST)
3. Backend saves to MongoDB
4. Backend calls `getIO().to("board:<boardId>").emit("board:card-added", data)` (WebSocket broadcast)
5. All other clients in the room receive the event and update their UI
6. The originating client uses optimistic state (already updated before the API call returned)

This ensures **data consistency** (REST handles persistence with proper validation and auth) while **WebSocket provides instant UI updates** to all collaborators.

---

## Summary Table

| Topics | Key Files |
|---|---|---|
| Problem + Database | `backend/models/User.js`, `Project.js`, `Board.js`, `Team.js` |
| REST API + Async | `backend/routes/auth.js`, `projects.js`, `boards.js`, `users.js`, `teams.js`, `admin.js` |
| Auth + Security | `backend/middleware/auth.js`, `routes/auth.js`, `backend/app.js` (session config) |
| UI + Client-Server | `frontend/lib/auth.ts`, `useBoard.ts`, `page.tsx`, all component files |
| Real-time / WebSocket | `backend/socket.js`, `frontend/lib/socket.ts`, `LiveCursors.tsx` |

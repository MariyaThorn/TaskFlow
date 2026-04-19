# TaskFlow — Local Development Guide

This README explains environment variables and how to run the frontend and backend locally, plus how to access the Swagger docs.

**Quick summary**
- Frontend: `frontend/` (Next.js)
- Backend: `backend/` (Express + Socket.IO)
- Swagger UI: `http://localhost:3000/api-docs` (backend)

---

## Frontend

Location: `frontend/`

Primary env file: `frontend/.env.local`

Example `frontend/.env.local`:

```
# API base used by the frontend to talk to the backend
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# Optional: whitelist origins for CORS (used if you expose dev server remotely)
# WHITELISTED_ORIGINS=http://203.176.133.182,http://26.72.254.233:3001
```

Notes:
- The frontend code stores authentication in localStorage using the keys:
  - `taskflow_token` (JWT)
  - `taskflow_user` (user object; `{ id, email, ... }`)
  - These keys are read by the presence/socket logic — ensure they exist after login.

Dev server (local only):

```bash
cd frontend
npm install
npm run dev      # starts Next dev on port 3001 (bound to 0.0.0.0 if configured)
```

If you want to expose the dev server to other machines on your LAN (for HMR and remote testing), run the host-bound script (the project has a script that binds to 0.0.0.0):

```bash
cd frontend
npm run dev:host   # next dev -H 0.0.0.0 -p 3001
```

Firewall / network notes:
- If you expose the dev server to the network, ensure port `3001` is allowed in your firewall and any router/NAT forwards are configured.
- HMR (Hot Module Reload) uses websocket connections (ws:// or wss://). If HMR fails with a `web-socket.js` or `web-socket.ts` error, ensure the dev server is reachable at the IP:port used in the browser and that protocol (ws/wss) matches the page.

---

## Backend

Location: `backend/`

Primary env file: `backend/.env`

Example `backend/.env` (development):

```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/taskflow
JWT_SECRET=change_this_to_a_strong_random_secret
JWT_EXPIRES_IN=7d
SESSION_SECRET=change_this_to_another_strong_random_secret
FRONTEND_URL=http://localhost:3001

# Optional: comma-separated origins allowed for CORS and socket.io
# WHITELISTED_ORIGINS=http://localhost:3001

# Optional: enable strict IP blocking (checks X-Forwarded-For / remote IP)
# ENABLE_STRICT_IP_BLOCK=true

```

Start backend (development):

```bash
cd backend
npm install
npm run dev      # or however your project starts (inspect package.json)
```

API endpoints are served under `/api` by default (see `NEXT_PUBLIC_API_URL` used by the frontend).

---

## Swagger API Docs

The backend exposes Swagger UI at:

```
http://localhost:3000/api-docs
```

Start the backend then open the URL above to explore API routes and example schemas.

---

## Socket.IO / Presence

- Socket server runs on the same backend host/port as the API (`http://localhost:3000` unless changed).
- The client connects using `socket.io-client` and joins `board:<boardId>` rooms. Presence is broadcast via `board:presence` events.
- Make sure the `taskflow_user` object is saved to `localStorage` after login, because the socket client reads the current user's `id` from `localStorage` to register presence.

---

## Troubleshooting

- HMR / WebSocket errors:
  - Confirm the dev server is listening on the IP and port the browser is trying to reach.
  - For remote testing, bind Next to `0.0.0.0` and open firewall port(s):
    ```bash
    HOST=0.0.0.0 PORT=3001 npm run dev
    # or npm run dev:host if configured
    ```
  - If the page is served over HTTPS, HMR must use `wss://`.

- Presence dot stays gray:
  - Verify `taskflow_user` exists in `localStorage` and contains the correct `id`.
  - Open the browser console and look for these logs (the code adds debug logs):
    - `[BoardPage] currentUserId:`
    - `[socket] emitting join-board` and `[socket] received board:presence`

---


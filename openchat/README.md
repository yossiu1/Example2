# Open Chat

A lightweight real-time group chat web app. No accounts — just pick a nickname and start chatting.

## Stack

| Layer | Tech |
|---|---|
| Frontend | React + Vite |
| Styling | CSS Modules |
| Real-time | Socket.io |
| Backend | Node.js + Express |
| Database | PostgreSQL (Supabase recommended) |
| Hosting | Railway / Render |

---

## Project Structure

```
openchat/
├── server/
│   ├── index.js        # Express + Socket.io server
│   ├── db.js           # PostgreSQL connection pool
│   ├── schema.sql      # Database schema + seed
│   ├── .env.example
│   └── package.json
└── client/
    ├── src/
    │   ├── components/
    │   │   ├── NicknameScreen.jsx
    │   │   ├── Sidebar.jsx
    │   │   ├── ChatArea.jsx
    │   │   ├── MessageList.jsx
    │   │   └── MessageInput.jsx
    │   ├── hooks/
    │   │   └── useChat.js
    │   ├── socket.js
    │   ├── App.jsx
    │   └── main.jsx
    ├── index.html
    ├── vite.config.js
    ├── .env.example
    └── package.json
```

---

## Setup

### 1. Database (Supabase — free tier)

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the contents of `server/schema.sql`
3. Copy your connection string from **Project Settings → Database → Connection string → URI**

### 2. Server

```bash
cd server
cp .env.example .env
# Fill in DATABASE_URL and CLIENT_URL in .env
npm install
npm run dev
```

The server runs on `http://localhost:4000`.

### 3. Client

```bash
cd client
cp .env.example .env
# Set VITE_SERVER_URL=http://localhost:4000
npm install
npm run dev
```

The client runs on `http://localhost:5173`.

---

## Environment Variables

### server/.env

```env
DATABASE_URL=postgresql://user:password@host:5432/openchat
PORT=4000
CLIENT_URL=http://localhost:5173
```

### client/.env

```env
VITE_SERVER_URL=http://localhost:4000
```

---

## Deployment

### Deploy server to Railway

1. Push `server/` to a GitHub repo
2. Create a new project on [railway.app](https://railway.app)
3. Add a PostgreSQL plugin or use your Supabase URL
4. Set environment variables in Railway dashboard
5. Railway auto-detects Node.js and runs `npm start`

### Deploy client to Vercel

1. Push `client/` to a GitHub repo
2. Import on [vercel.com](https://vercel.com)
3. Set `VITE_SERVER_URL` to your Railway server URL
4. Vercel auto-builds with Vite

---

## Features

- Real-time messaging via WebSockets (Socket.io)
- Persistent message history (last 100 messages loaded on join)
- Multiple rooms — create new rooms on the fly
- Online user count per room
- No login — nickname only, stored in React state
- Auto-reconnect on disconnect
- Dark mode support
- Message grouping by author

---

## Extending

Some ideas for next steps:

- **Message deletion** — add a delete button visible only to the author
- **Typing indicators** — emit `typing:start` / `typing:stop` socket events
- **Message reactions** — add an emoji picker and a `reactions` JSONB column
- **Room passwords** — add a `password_hash` column to rooms
- **Rate limiting** — add `express-rate-limit` to prevent spam
- **File sharing** — integrate Supabase Storage for image uploads

# Sandesh

>Real-time messaging platform with end-to-end encrypted conversations, media sharing, and presence awareness.

[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5-blue.svg)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-green.svg)](https://www.mongodb.com/)
[![Socket.io](https://img.shields.io/badge/Socket.io-4+-orange.svg)](https://socket.io/)
[![Clerk](https://img.shields.io/badge/Auth-Clerk-purple.svg)](https://clerk.com/)
[![ImageKit](https://img.shields.io/badge/Media-ImageKit-ff6b6b.svg)](https://imagekit.io/)
[![Docker](https://img.shields.io/badge/Docker-Ready-0db9ed.svg)](https://docker.com/)

---

## 📖 Overview

**Sandesh** is a full-stack, real-time chat application designed for one-on-one private messaging. It combines a Node.js/Express backend with a Vite+React frontend, powered by MongoDB for persistence, Socket.io for real-time event delivery, Clerk for authentication, and ImageKit for media storage.

### Key Capabilities

| Capability | Description |
|------------|-------------|
| **Real-time messaging** | Instant message delivery via WebSocket (Socket.io) with online/offline presence |
| **One-on-one conversations** | Private chats between authenticated users |
| **Media attachments** | Send images and videos, stored via ImageKit with CDN delivery |
| **Conversation sidebar** | Recent-chats list ordered by last activity with partner profile |
| **Clerk authentication** | Secure sign-up/sign-in with automatic user profile syncing via webhooks |
| **Protected API** | JWT-based route protection via Clerk Express middleware |
| **Docker-ready** | Multi-stage production Dockerfile for containerized deployment |
| **Health monitoring** | `/health` endpoint for uptime checks and load balancer probes |

---

## 🏗 Architecture

```
┌─────────────┐      HTTPS/WSS      ┌──────────────────┐
│   Client    │ ◄──────────────────► │   Express API    │
│  (Vite +    │      (Port 5173)    │   (Port 3000)    │
│   React)    │                     │                  │
└─────────────┘                     └────────┬─────────┘
                                            │
                                    ┌───────▼───────┐
                                    │   MongoDB     │
                                    │   (Mongoose)  │
                                    └───────┬───────┘
                                            │
                                    ┌───────▼───────┐
                                    │   ImageKit    │
                                    │  (Media CDN)  │
                                    └───────────────┘
```

### Core Services

- **Express API** — RESTful endpoints for auth, messages, and user lookup
- **Socket.io Server** — Real-time message delivery and online-user presence tracking
- **MongoDB** — Document store for `User` and `Message` collections
- **Clerk** — Identity provider; webhooks sync user records into MongoDB
- **ImageKit** — Secure upload, transformation, and CDN delivery of chat media

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** v18 or newer
- **npm** v9 or newer (or pnpm/yarn)
- **MongoDB** instance (MongoDB Atlas recommended for production)
- **Clerk** account (for authentication)
- **ImageKit** account (for media storage)
- **Docker** (optional, for containerized deployment)

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/sandesh.git
cd sandesh
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create `backend/.env` (copy the example below):

```env
PORT=3000
NODE_ENV=development

MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/Sandesh_db?retryWrites=true&w=majority

CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

IMAGEKIT_PRIVATE_KEY=private_...
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/<your-imagekit-id>/

FRONTEND_URL=http://localhost:5173
```

Start the development server:

```bash
npm run dev        # nodemon with auto-reload
# or
npm start          # production node
```

Backend runs at `http://localhost:3000`.

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

Create `frontend/.env`:

```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
VITE_API_URL=http://localhost:3000
```

Start the development server:

```bash
npm run dev        # Vite dev server (default port 5173)
```

Frontend runs at `http://localhost:5173`.

---

## 🐳 Docker Deployment (Production)

Sandesh includes a multi-stage `Dockerfile` optimized for production:

```dockerfile
# Stage 1: Build Vite frontend
# Stage 2: Build Express backend (src → dist)
# Stage 3: Runtime image with prod deps only
```

### Build & Run

```bash
# Build the image
docker build -t sandesh:latest .

# Run with environment variables
docker run -d \
  --name sandesh \
  -p 3001:3001 \
  -e NODE_ENV=production \
  -e PORT=3001 \
  -e MONGO_URI="mongodb+srv://..." \
  -e CLERK_PUBLISHABLE_KEY="pk_live_..." \
  -e CLERK_SECRET_KEY="sk_live_..." \
  -e IMAGEKIT_PRIVATE_KEY="private_..." \
  -e IMAGEKIT_URL_ENDPOINT="https://ik.imagekit.io/..." \
  -e FRONTEND_URL="https://yourdomain.com" \
  sandesh:latest
```

### Docker Compose (Recommended)

Create a `docker-compose.yml` at the repo root:

```yaml
version: "3.8"

services:
  app:
    build: .
    ports:
      - "3001:3001"
    env_file:
      - .env.production
    restart: unless-stopped
    depends_on:
      - mongo

  mongo:
    image: mongo:7
    volumes:
      - mongo_data:/data/db
    restart: unless-stopped

volumes:
  mongo_data:
```

---

## 📚 API Reference

Base URL: `http://localhost:3000` (dev) or your production host.

All message routes require a valid Clerk session token in the `Authorization` header: `Bearer <clerk_token>`.

### Authentication

#### `GET /api/auth/check`
Verify authentication status and return the current user profile.

**Headers:** `Authorization: Bearer <clerk_token>`

**Response:**
```json
{
  "_id": "64f...",
  "clerkId": "user_2xxx",
  "email": "user@example.com",
  "fullName": "John Doe",
  "profilePic": "https://ik.imagekit.io/...",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

#### `POST /api/webhooks/clerk`
Clerk webhook endpoint for user synchronization (user created/updated/deleted).

**Content-Type:** `application/json` (raw body, not parsed)

**Response:** `200 OK`

---

### Messages

#### `GET /api/messages/users`
List all users (excluding the logged-in user) for the conversation sidebar.

**Auth:** Required

**Response:**
```json
[
  {
    "_id": "64f...",
    "email": "alice@example.com",
    "fullName": "Alice Smith",
    "profilePic": "https://...",
    "createdAt": "...",
    "updatedAt": "..."
  }
]
```

#### `GET /api/messages/conversations`
Get recent conversations ordered by last message timestamp.

**Auth:** Required

**Response:** Array of user objects (conversation partners).

#### `GET /api/messages/:id`
Fetch message history between the logged-in user and the user with `:id`.

**Auth:** Required

**Response:**
```json
[
  {
    "_id": "64f...",
    "senderId": "64f...",
    "receiverId": "64f...",
    "text": "Hello!",
    "image": null,
    "video": null,
    "createdAt": "2024-01-01T10:00:00.000Z",
    "updatedAt": "2024-01-01T10:00:00.000Z"
  }
]
```

#### `POST /api/messages/send/:id`
Send a text message with optional image/video attachment to user `:id`.

**Auth:** Required  
**Content-Type:** `multipart/form-data`

| Field | Type | Description |
|-------|------|-------------|
| `text` | string | Message body (optional if media present) |
| `media` | file | Image or video file (optional) |

**Response:** The created `Message` document. The message is also emitted via Socket.io to the receiver if online.

---

### Health

#### `GET /health`
Liveness/readiness probe.

**Response:**
```json
{ "ok": true }
```

---

## 🔌 Real-Time Events (Socket.io)

The Socket.io server runs alongside Express on the same HTTP server.

### Client → Server

| Event | Payload | Description |
|-------|---------|-------------|
| `connection` | query: `{ userId }` | Register user's socket ID for presence |

### Server → Client

| Event | Payload | Description |
|-------|---------|-------------|
| `newMessage` | `Message` object | New message received (delivered to receiver's socket) |
| `getOnlineUsers` | `string[]` | List of currently online user IDs |

---

## 🗄 Database Models

### User

```js
{
  clerkId:    { type: String, required: true, unique: true },
  email:      { type: String, required: true, unique: true },
  fullName:   { type: String, required: true },
  profilePic: { type: String, default: "" },
  createdAt:  Date,
  updatedAt:  Date
}
```

### Message

```js
{
  senderId:   { type: ObjectId, ref: "User", required: true },
  receiverId: { type: ObjectId, ref: "User", required: true },
  text:       String,
  image:      String,   // ImageKit URL
  video:      String,   // ImageKit URL
  createdAt:  Date,
  updatedAt:  Date
}
```

---

## 🔐 Security

- **Authentication:** All API routes except Clerk webhooks and `/health` require a valid Clerk JWT via `clerkMiddleware()` / `protectRoute`.
- **CORS:** Configured to allow only the `FRONTEND_URL` origin with credentials enabled.
- **Raw webhook body:** Clerk webhook route uses `express.raw()` to preserve signature integrity.
- **Environment secrets:** `CLERK_SECRET_KEY`, `IMAGEKIT_PRIVATE_KEY`, and `MONGO_URI` must never be committed. They are listed in `.gitignore`.
- **File uploads:** Multer handles `multipart/form-data`; media type is validated server-side before ImageKit upload.

### `.gitignore`

```
node_modules
.env
.env.*
dist
dist-ssr
*.local
logs
*.log
.DS_Store
.idea
.vscode/*
```

---

## 🛠 Available Scripts

### Backend (`backend/`)

| Script | Command | Purpose |
|--------|---------|---------|
| `dev` | `nodemon src/index.js` | Development with auto-reload |
| `start` | `node src/index.js` | Production server |
| `build` | `rm -rf dist && cp -R src dist` | Copy ESM source to `dist/` |

### Frontend (`frontend/`)

| Script | Purpose |
|--------|---------|
| `dev` | Start Vite dev server |
| `build` | Production build to `dist/` |
| `preview` | Preview production build locally |

---

## 🧩 Project Structure

```
Sandesh/
├── backend/                      # Node.js + Express API
│   ├── src/
│   │   ├── index.js              # App entry point (Express + Socket.io)
│   │   ├── controllers/
│   │   │   ├── auth.controller.js
│   │   │   └── message.controller.js
│   │   ├── lib/
│   │   │   ├── db.js             # Mongoose connection
│   │   │   ├── socket.js         # Socket.io server + presence map
│   │   │   ├── imagekit.js       # ImageKit client + upload helper
│   │   │   └── cron.js           # Scheduled jobs
│   │   ├── middleware/
│   │   │   ├── auth.middleware.js
│   │   │   └── upload.middleware.js
│   │   ├── models/
│   │   │   ├── user.model.js
│   │   │   └── message.model.js
│   │   ├── routes/
│   │   │   ├── auth.route.js
│   │   │   └── message.route.js
│   │   ├── webhooks/
│   │   │   └── clerk.webhook.js
│   │   └── seeds/
│   │       └── user.seed.js
│   ├── .env
│   ├── package.json
│   └── package-lock.json
├── frontend/                     # Vite + React client
│   ├── index.html
│   ├── eslint.config.js
│   ├── .env
│   └── package.json
├── Dockerfile                    # Multi-stage production build
├── .dockerignore
├── .gitignore
├── LICENSE
└── README.md
```

---

## 📦 Deployment Checklist

- [ ] Set `NODE_ENV=production` in backend `.env`
- [ ] Configure `CLERK_SECRET_KEY` and `CLERK_PUBLISHABLE_KEY` (live mode)
- [ ] Configure `IMAGEKIT_PRIVATE_KEY` and `IMAGEKIT_URL_ENDPOINT`
- [ ] Set `FRONTEND_URL` to your production domain (CORS)
- [ ] Point `MONGO_URI` at a production MongoDB cluster with TLS
- [ ] Build the Docker image and run on your platform (Railway, Render, Fly.io, AWS ECS, etc.)
- [ ] Configure Clerk webhook URL to point to `https://api.yourdomain.com/api/webhooks/clerk`
- [ ] Set up `/health` monitoring for uptime checks

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m "feat: add your feature"`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

Please follow conventional commit messages and ensure all dependencies are listed in `package.json`.

---

## 📄 License

ISC License — see [LICENSE](LICENSE) for details.

---

## 📞 Support

For issues, feature requests, or questions, open a [GitHub Issue](https://github.com/your-username/sandesh/issues).

---

**Sandesh** — Real-time messaging, built for production.
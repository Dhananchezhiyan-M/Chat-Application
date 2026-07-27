# 💬 Real-Time Ephemeral Chat Application (Dockerized)

A production-grade, full-stack, real-time messaging platform built using **Node.js, Express, Socket.IO, MongoDB Atlas, React, and Nginx containerized with Docker**.

This application is engineered for instant, secure, and ephemeral communication. It provides global public chat rooms, private peer-to-peer rooms with auto-generated 6-character room codes, automatic 5-day room expiration, instant creator room deletion with multi-user eviction, real-time debounced typing indicators, sound notifications with toggle controls, Progressive Web App (PWA) installation for mobile devices, and an obsidian glassmorphism dark design system.

---

## 🔗 Live Deployment Links

| Service | Architecture | Live Hosted URL |
| :--- | :--- | :--- |
| **Frontend (Docker)** | Nginx Alpine + React Production Build | [https://chat-application-docker-frontend.onrender.com](https://chat-application-docker-frontend.onrender.com) |
| **Backend (Docker)** | Node.js 20 Alpine + Socket.IO Server | [https://chat-application-docker.onrender.com](https://chat-application-docker.onrender.com) |
| **Frontend (Native)** | Render Static Web Service | [https://chat-application-frontend-e2k7.onrender.com](https://chat-application-frontend-e2k7.onrender.com) |
| **Backend (Native)** | Render Node Web Service | [https://chat-application-fves.onrender.com](https://chat-application-fves.onrender.com) |

---

## 💡 Core Purpose & Why This Project Solves Key Chat App Challenges

### 1. Overcoming Database Memory Bloat & Stale Data (Ephemeral Lifecycle)
* **The Problem**: In standard chat applications, old or abandoned rooms remain stored in database collections indefinitely, consuming storage and cluttering user sessions.
* **How This Project Solves It**: Every private room features a **5-day automated expiration timer**. Additionally, room creators can click **Delete Room**, triggering an immediate purge of all room data and messages across MongoDB Atlas, automatically evicting all connected room members back to the lobby.

### 2. Overcoming Mobile UI Overflow & Squeezed Headers
* **The Problem**: Viewing chat interfaces on mobile screens often breaks top navigation headers due to cramped buttons (Room Code, Timer, Delete Room, Sound Toggle, Logout).
* **How This Project Solves It**: We engineered a custom **Three-Dots Dropdown Menu (`⋮`)** in the header. Important actions—including 1-tap room code copying, live countdown timers, audio notification toggles, room deletion, and session logout—are neatly nested inside a floating menu with click-outside auto-close functionality.

### 3. Overcoming "Works on My Machine" Environment Drift
* **The Problem**: Node.js applications often encounter environment issues when moving from local development (Windows/macOS) to cloud servers (Linux) due to dependency and runtime version mismatches.
* **How This Project Solves It**: Both Backend and Frontend are containerized using **Docker & Nginx**. The container running locally is 100% identical to the production environment running on Render cloud servers.

### 4. Audio Notification Controls
* **The Problem**: Un-silenced chat sounds disrupt users in public environments, while muting system volume silences all other device media.
* **How This Project Solves It**: Includes an in-app **Sound Notification Toggle** (`ON`/`OFF`) in the header menu, suppressing message audio chimes (`send-1.mp3` and `receive-1.mp3`) without affecting device system audio.

---

## 🚀 Comprehensive Feature Breakdown

### 🔌 Real-Time Socket Connection
* **Instant Messaging**: Bi-directional real-time message transmission powered by Socket.IO WebSockets.
* **Debounced Typing Indicators**: Displays real-time typing indicators (e.g. *"Ram is typing..."*) with a 1-second inactivity auto-reset timer.
* **Delivery Statuses**: Tracks message statuses such as `sent`, `delivered`, and `seen`.
* **Formatted Timestamps**: Shows accurate local transmission times using `toLocaleTimeString()`.

### 🔒 Room & Chat Management
* **Public Group Chat**: Seamless entry into global public chat channels.
* **Private Ephemeral Rooms**:
  * **6-Character Room Codes**: Auto-generates unique 6-character access keys (e.g. `X9K2P4`).
  * **1-Tap Room Joining**: Instant room access using generated codes.
  * **Creator Room Deletion**: Creators can destroy rooms, permanently clearing MongoDB records and triggering a 3-second eviction overlay for all active room members.
  * **Automated Expiry**: 5-day lifespan (`432000` seconds) tracked with a live ticking countdown timer (`Xd Xh Xm Xs`).

### 👤 User Accounts, UI/UX & PWA
* **Secure Authentication**: User registration and login with `bcryptjs` password hashing (10 salt rounds).
* **Profile Avatars**: Visual user branding for active chat members.
* **Emoji Keyboard**: Integrated emoji picker powered by `emoji-picker-react`.
* **Sound Notifications**: Custom MP3 audio chimes for sent and received messages with toggle controls.
* **Mobile Three-Dots Menu (`⋮`)**: Header dropdown container storing room codes, timers, sound controls, room deletion, and logout.
* **Progressive Web App (PWA)**: Mobile installable web app shortcut (**"Chat App"**) configured via [`manifest.json`](file:///C:/Users/dhananchezhiyan/Documents/Projects/Chat_application/front_end/public/manifest.json) and iOS web app meta tags.
* **Obsidian Dark Mode**: Modern dark design system with CSS custom properties and glassmorphic card elements (`backdrop-filter: blur(30px)`).

---

## 🌐 Network Architecture & Socket.IO Workflow

The application operates on a **hybrid networking architecture**:

```text
 ┌────────────────┐              HTTP POST /api/auth/login               ┌────────────────┐
 │                │ ───────────────────────────────────────────────────> │                │
 │                │ <─────────────────────────────────────────────────── │                │
 │                │             200 OK (Auth Token / User info)          │                │
 │ React Frontend │                                                      │ Express Server │
 │                │               WebSocket TCP Handshake                │                │
 │                │ ═══════════════════════════════════════════════════> │                │
 │                │ <═══════════════════════════════════════════════════ │                │
 └────────────────┘             Persistent Bi-directional Pipe           └────────────────┘
```

### Workflow Steps:
1. **Authentication (HTTP REST)**: User submits credentials via `/api/auth/login` or `/api/auth/register`. The backend verifies passwords against MongoDB Atlas via `bcryptjs`.
2. **WebSocket Handshake (Socket.IO)**: Upon successful login, the React client initiates `io(API_URL)`, upgrading the connection from HTTP to a persistent TCP WebSocket connection.
3. **Room Subscription**: The client emits `join room` or `join private room`. The backend adds the socket ID to the requested room channel and executes a callback returning past message history.
4. **Real-time Event Pipeline**: Sending a message emits `send private message`. The backend saves the document in MongoDB Atlas and broadcasts `new private message` to all connected room sockets.
5. **Clean Disconnection**: Closing the tab or leaving emits `disconnecting`, prompting the backend to calculate updated online user lists and notify remaining room members.

---

## 🛠️ Technology Stack

### Frontend
* **Core Framework**: React.js (v19)
* **Real-Time Client**: `socket.io-client` (v4.8)
* **Production Web Server**: Nginx Alpine (for Docker container deployment)
* **Styling**: Vanilla CSS & Obsidian Glassmorphism (`backdrop-filter: blur(30px)`)
* **Utilities**: `axios`, `emoji-picker-react`

### Backend
* **Runtime & Framework**: Node.js (v20), Express.js (v5)
* **Real-Time Engine**: `socket.io` (v4.8)
* **Database & ODM**: MongoDB Atlas / Mongoose (v9)
* **Security & Auth**: `bcryptjs` password hashing
* **Config & CORS**: `dotenv`, `cors`

### Containerization & DevOps
* **Docker**: Single-stage backend container (`node:20-alpine`) and two-stage frontend container (`node:20-alpine` build → `nginx:alpine`).
* **Cloud Platform**: Render Cloud Services.

---

## 📂 Project Architecture

```text
Chat_application/
├── README.md                      # Project documentation
├── BACK_END/                      # Node.js Server & APIs
│   ├── config/
│   │   └── db.js                  # MongoDB Atlas connection handler
│   ├── controllers/
│   │   └── authController.js      # Auth controllers (Register, Login)
│   ├── models/
│   │   ├── User.js                # User schema (Username, Hashed Password)
│   │   ├── Message.js             # Message schema (Sender, Content, Room, Timestamp)
│   │   └── Room.js                # Room schema (RoomId, CreatedBy, CreatedAt)
│   ├── routes/
│   │   └── authRoutes.js          # Express REST routes (/api/auth/register, /api/auth/login)
│   ├── sockets/
│   │   └── socketHandler.js       # Real-time event handler module
│   ├── Dockerfile                 # Backend Node.js 20 Alpine Dockerfile
│   ├── package.json               # Backend dependencies
│   ├── server.js                  # Main server entry point
│   └── .env                       # Environment variables (git-ignored)
│
└── front_end/                     # React Single Page Application (SPA)
    ├── public/
    │   ├── index.html             # Main HTML entry point with PWA meta tags
    │   ├── manifest.json          # PWA Web App Manifest file ("Chat App")
    │   ├── logo192.png            # PWA mobile icon (192x192)
    │   └── logo512.png            # PWA mobile icon (512x512)
    └── src/
        ├── audio/
        │   ├── send-1.mp3         # Message sent audio chime
        │   └── receive-1.mp3      # Message received audio chime
        ├── pages/
        │   ├── assets/
        │   │   └── chat.css       # Chat layout, bubbles, and three-dots menu CSS
        │   ├── ChatPage.js        # Public group chat component
        │   ├── ChatSelectionPage.js # Public vs Private selection page
        │   ├── HomePage.js        # Landing home component
        │   ├── LoginPage.js       # Login view component
        │   ├── PrivateChatPage.js # Ephemeral Private Chat component
        │   └── RegisterPage.js    # Registration view component
        ├── App.js                 # React router & state controller
        ├── config.js              # Environment API URL selector
        ├── Dockerfile             # Multi-Stage Frontend Dockerfile
        ├── nginx.conf             # Nginx SPA router configuration
        └── index.js               # DOM entry point
```

Key Source Links:
* **Backend Socket Handler**: [BACK_END/sockets/socketHandler.js](file:///C:/Users/dhananchezhiyan/Documents/Projects/Chat_application/BACK_END/sockets/socketHandler.js)
* **Backend Entry Server**: [BACK_END/server.js](file:///C:/Users/dhananchezhiyan/Documents/Projects/Chat_application/BACK_END/server.js)
* **Backend Dockerfile**: [BACK_END/Dockerfile](file:///C:/Users/dhananchezhiyan/Documents/Projects/Chat_application/BACK_END/Dockerfile)
* **Frontend Controller**: [front_end/src/App.js](file:///C:/Users/dhananchezhiyan/Documents/Projects/Chat_application/front_end/src/App.js)
* **Private Chat Component**: [front_end/src/pages/PrivateChatPage.js](file:///C:/Users/dhananchezhiyan/Documents/Projects/Chat_application/front_end/src/pages/PrivateChatPage.js)
* **Frontend Dockerfile**: [front_end/Dockerfile](file:///C:/Users/dhananchezhiyan/Documents/Projects/Chat_application/front_end/Dockerfile)
* **Nginx Router Config**: [front_end/nginx.conf](file:///C:/Users/dhananchezhiyan/Documents/Projects/Chat_application/front_end/nginx.conf)

---

## 🔌 Socket.IO Event Guide & Contract Reference

Refer to [`BACK_END/sockets/socketHandler.js`](file:///C:/Users/dhananchezhiyan/Documents/Projects/Chat_application/BACK_END/sockets/socketHandler.js) for full backend event handler logic:

| Event Name | Type | Payload Example / Parameters | Description |
|---|---|---|---|
| `join server` | Receive | `username: string` | Registers a connected client socket to a username. |
| `join room` | Receive | `room: string, cb: Function` | Adds socket to room channel. Returns historic messages via callback. |
| `get room users` | Receive | `room: string` | Requests current array of active users inside a room. |
| `room users` | Emit | `users: Array<{id, username}>` | Broadcasts list of active online users in a room. |
| `send message` | Receive | `{ content, sender, senderId, chatName }` | Saves public message to MongoDB Atlas and broadcasts it. |
| `new message` | Emit | `{ content, sender, chatName, senderId, status, timestamp }` | Dispatches new public message to all clients in the room. |
| `create room` | Receive | `username: string, cb: Function` | Generates a 6-character room code, saves Room document, returns metadata. |
| `join private room` | Receive | `roomId: string, cb: Function` | Verifies room code in MongoDB, joins socket, returns past room messages. |
| `send private message` | Receive | `{ content, sender, senderId, roomId }` | Saves private message to MongoDB and broadcasts to room. |
| `new private message` | Emit | `{ content, sender, senderId, timestamp, status }` | Dispatches new private message to room members. |
| `typing` / `stop typing` | Bidirectional | `{ username, room }` | Relays typing status across room members to render typing indicators. |
| `delete room` | Receive | `{ roomId, username }` | Purges Room and all associated Messages from MongoDB. Broadcasts `room deleted`. |
| `room deleted` | Emit | `none` | Triggers a 3-second eviction countdown overlay for all active room members. |
| `leave room` | Receive | `roomId: string` | Removes socket from room channel and updates remaining room user list. |

---

## 🐳 Docker Architecture & Nginx Setup

### 1. Backend Dockerfile ([`BACK_END/Dockerfile`](file:///C:/Users/dhananchezhiyan/Documents/Projects/Chat_application/BACK_END/Dockerfile))
The backend uses a single-stage Docker build based on `node:20-alpine`:

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5000
CMD ["node", "server.js"]
```

* **`FROM node:20-alpine`**: Uses a lightweight Alpine Linux image (~40MB) pre-installed with Node.js 20.
* **`WORKDIR /app`**: Sets the internal container working directory.
* **`COPY package*.json ./` & `RUN npm install`**: Copies package files first to leverage Docker layer caching during dependencies installation.
* **`COPY . .`**: Copies remaining backend source files into the container.
* **`EXPOSE 5000` & `CMD ["node", "server.js"]`**: Documents port 5000 and defines the startup command.

---

### 2. Frontend Multi-Stage Dockerfile ([`front_end/Dockerfile`](file:///C:/Users/dhananchezhiyan/Documents/Projects/Chat_application/front_end/Dockerfile))
The frontend uses a two-stage build to minimize container footprint and boost serving performance:

```dockerfile
# Stage 1: Build React Production Assets
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
ARG REACT_APP_API_URL=https://chat-application-docker.onrender.com
ENV REACT_APP_API_URL=$REACT_APP_API_URL
RUN npm run build

# Stage 2: Serve React Static Assets using Nginx
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### How Multi-Stage Build Works:
1. **Stage 1 (Build)**: Spins up Node 20, installs dependencies, injects `REACT_APP_API_URL`, and executes `npm run build` to compile React JSX into static HTML/JS/CSS assets inside `/app/build`.
2. **Stage 2 (Runtime)**: Docker discards Node.js, `node_modules`, and source files entirely. It initializes a clean `nginx:alpine` image and copies ONLY the compiled `/app/build` static files into Nginx's web root (`/usr/share/nginx/html`).
3. **Result**: Container size drops from **~800MB to ~25MB**, serving static assets at high speed.

---

### 3. Nginx SPA Routing Configuration & Why We Use Nginx ([`front_end/nginx.conf`](file:///C:/Users/dhananchezhiyan/Documents/Projects/Chat_application/front_end/nginx.conf))

```nginx
server {
    listen 80;
    server_name localhost;

    location / {
        root /usr/share/nginx/html;
        index index.html index.htm;
        try_files $uri $uri/ /index.html;
    }
}
```

#### 💡 Core Reasons Why We Use Nginx for the React Frontend:
1. **Development vs. Production Serving**:
   - In local development (`npm start`), React uses Webpack Dev Server (Node.js), consuming ~300MB–800MB RAM. This is slow and not designed for production.
   - In production (`npm run build`), React compiles into static HTML/JS/CSS files. Nginx serves these static files directly without needing a Node.js process.
2. **High Performance & Reduced Container Footprint**:
   - Nginx Alpine is an ultra-fast, lightweight C web server. Using Nginx reduces container RAM usage to under **20MB** and cuts container size from **~800MB to ~25MB**.
3. **Fixing the 404 Refresh Bug (Single Page Application Routing)**:
   - React is a Single Page Application (SPA). If a user refreshes `/chat` directly, traditional servers look for `/chat/index.html` on disk and return a 404 Not Found error.
   - `try_files $uri $uri/ /index.html;` directs Nginx to fallback to `/index.html` whenever a requested path doesn't exist on disk, allowing React Router to manage client-side routing smoothly.

#### 📊 Comparison: Without Nginx vs. With Nginx

| Metric / Feature | Without Nginx (Node / Webpack) | With Nginx |
| :--- | :--- | :--- |
| **Container Size** | ~800 MB | **~25 MB** |
| **RAM Usage** | ~300–500 MB | **< 20 MB** |
| **Page Reloads (`/chat`)** | 404 Not Found Error | **Smooth client-side routing via `try_files`** |
| **Security & Speed** | Dev server unoptimized for production traffic | **Production-grade static asset serving** |

---

## ⚙️ Setup & Installation

### Prerequisites
* [Node.js](https://nodejs.org/) (v18+ recommended)
* [MongoDB](https://www.mongodb.com/) (Local instance or MongoDB Atlas connection string)

### 1. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd BACK_END
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file inside `BACK_END/`:
   ```env
   MONGO_URI=your_mongodb_connection_string
   PORT=5000
   ```
4. Start the backend server:
   ```bash
   node server.js
   ```

### 2. Frontend Setup
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd front_end
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the React development server:
   ```bash
   npm start
   ```

The frontend app will launch at `http://localhost:3000`.

---

## 🛡️ License

This project is open-source and available under the [ISC License](https://opensource.org/licenses/ISC).

# 💬 Real-Time Chat Application

A full-stack, real-time messaging application featuring group rooms, private peer-to-peer chats, secure user authentication, typing indicators, and modern interactive elements. Built with a Node.js/Express backend, Socket.IO, MongoDB, and a React frontend.

---

## 🚀 Features

### 🔌 Real-Time Socket Connection
* **Instant Messaging**: Send and receive messages in real time without refreshing.
* **Typing Indicators**: Displays when a specific user is typing (e.g. *"Ram is typing..."*).
* **Delivery Statuses**: Tracks message statuses such as `sent`, `delivered`, and `seen`.
* **Message Timestamps**: Shows accurate formatted transmission timings (`toLocaleTimeString()`).

### 🔒 Room & Chat Management
* **Group Chat**: Seamless entry into persistent public/group chat rooms.
* **Private Chat Rooms**:
  * Users can create a private room with a secure, auto-generated **6-character room code**.
  * Peer users can instantly join using the generated code.
  * **Delete Room**: Creators can permanently delete their private rooms, clearing all stored messages and configurations from the database.
  * **Room Expiry**: Configured room lifespans and expiry timings.

### 👤 User Accounts & UI/UX
* **Secure Authentication**: Register and login functionalities with password hashing powered by `bcryptjs` and session persistence.
* **Profile Avatars**: Personalized visual identification for active chat members.
* **Emoji Support**: Integrated emoji keyboard picker using `emoji-picker-react`.
* **Sound Notifications**: Audio alerts trigger upon receiving new messages.
* **Dark Mode**: Toggleable dark theme for comfortable low-light screen usage.
* **Responsive Design**: Mobile-friendly, fluid user interface designed for both desktops and handheld devices.

---

## 🛠️ Technology Stack

### Frontend
* **Core**: React.js (v19)
* **Real-time Engine**: [socket.io-client](https://socket.io/)
* **Styling**: `styled-components` & Vanilla CSS
* **Utilities**: `axios`, `immer`, `emoji-picker-react`

### Backend
* **Runtime / Framework**: Node.js, Express (v5)
* **Real-time Server**: [socket.io](https://socket.io/)
* **Database Object Modeling**: Mongoose / MongoDB Atlas
* **Security & Auth**: `bcryptjs` for encryption/hashing
* **Config & CORS**: `dotenv` for environment management, `cors` for API accessibility

---

## 📂 Project Architecture

The codebase is organized into two primary folders representing the decoupled architecture:

```
Chat_application/
├── BACK_END/                      # Node.js Server & APIs
│   ├── config/                    # Configuration files (DB connection)
│   ├── controllers/               # Auth controllers (Register, Login)
│   ├── models/                    # MongoDB schemas (User, Message, Room)
│   ├── routes/                    # API route declarations
│   ├── sockets/                   # Real-time event handler module
│   ├── server.js                  # Main entry point & server setup
│   └── .env                       # Environment config (git-ignored)
└── front_end/                     # React App
    ├── public/                    # Static assets
    └── src/                       # Application code
        ├── audio/                 # Sound notification files
        ├── pages/                 # Route/View components (Chat, Private, Login)
        ├── App.js                 # App routing & component controller
        └── index.js               # Dom entry point
```

Key Source Links:
* **Backend Socket Handler**: [BACK_END/sockets/socketHandler.js](file:///C:/Users/dhananchezhiyan/Documents/Projects/Chat_application/BACK_END/sockets/socketHandler.js)
* **Backend Entry Server**: [BACK_END/server.js](file:///C:/Users/dhananchezhiyan/Documents/Projects/Chat_application/BACK_END/server.js)
* **Frontend Controller**: [front_end/src/App.js](file:///C:/Users/dhananchezhiyan/Documents/Projects/Chat_application/front_end/src/App.js)
* **Group Chat Component**: [front_end/src/pages/ChatPage.js](file:///C:/Users/dhananchezhiyan/Documents/Projects/Chat_application/front_end/src/pages/ChatPage.js)
* **Private Chat Component**: [front_end/src/pages/PrivateChatPage.js](file:///C:/Users/dhananchezhiyan/Documents/Projects/Chat_application/front_end/src/pages/PrivateChatPage.js)

---

## ⚙️ Setup & Installation

### Prerequisites
* [Node.js](https://nodejs.org/) (v16+ recommended)
* [MongoDB](https://www.mongodb.com/) (Local installation or MongoDB Atlas URI)

### 1. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd BACK_END
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file based on the environment variables requirements:
   ```env
   MONGO_URI=your_mongodb_connection_string
   PORT=3000
   ```
4. Start the server:
   ```bash
   node server.js
   ```

### 2. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd ../front_end
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the React development server:
   ```bash
   npm start
   ```

The application will launch on `http://localhost:3000` (Backend) and typically `http://localhost:3001` or `http://localhost:3000` depending on development settings (Frontend).

---

## 🔌 Socket.IO Event Guide

The application utilizes socket communication to synchronize state across clients. Refer to [socketHandler.js](file:///C:/Users/dhananchezhiyan/Documents/Projects/Chat_application/BACK_END/sockets/socketHandler.js) for full backend event handlers:

| Event Name | Type | Payload Example / Parameters | Description |
|---|---|---|---|
| `join server` | Receive | `username: string` | Registers a connected client socket to a username. |
| `join room` | Receive | `room: string, cb: Function` | Adds socket to room. Returns historic messages through callback. |
| `send message` | Receive | `{ content, sender, senderId, chatName }` | Saves message to MongoDB and broadcasts it. |
| `new message` | Emit | `{ content, sender, chatName, senderId, status, timestamp }` | Dispatches new messages in the room. |
| `create room` | Receive | `username: string, cb: Function` | Creates a new private room and returns room metadata. |
| `join private room` | Receive | `roomId: string, cb: Function` | Verifies existence of the private room, adds socket, returns old messages. |
| `typing` / `stop typing` | Bidirectional | `{ username, room }` | Relays typing states to show typing indicators. |
| `delete room` | Receive | `{ roomId, username }` | Deletes room and its messages from DB. Broadcasts room removal. |

---

## 🛡️ License

This project is open-source and available under the [ISC License](https://opensource.org/licenses/ISC).

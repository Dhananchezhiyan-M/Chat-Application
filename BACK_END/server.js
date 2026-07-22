const express = require('express'); // efficient use of node.js
const http = require('http'); // created http will be attached with socket.io
const path = require('path');
const socket = require('socket.io');
const cors = require("cors"); // allows frontend to talk to backend.
const dotenv = require("dotenv"); // reads .env file
const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const socketHandler = require("./sockets/socketHandler");

dotenv.config(); // makes the available of process.env.
connectDB();

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);//In server.js, app.use("/api/auth", authRoutes) means that any request starting with /api/auth will be handled by authRoutes.js, and inside authRoutes.js, router.post("/register", registerUser) means that when a POST request comes to /register, it will call the registerUser() function, so together they form the final route /api/auth/register, which is used to register a new user into MongoDB Atlas.

app.get("/", (req, res) => {
    res.send("Backend server is running");
}); // used for checking.

// 🔥 CREATE HTTP SERVER (IMPORTANT)
const server = http.createServer(app);

// 🔥 SOCKET.IO SETUP
const io = socket(server, {
    cors: {
        origin: "*", // allow frontend
        methods: ["GET", "POST"]
    }
});

// 🔥 USE SOCKET HANDLER
socketHandler(io);

// PORT
const PORT = process.env.PORT || 3000;

// 🔥 IMPORTANT: use server.listen NOT app.listen
server.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
});

// Backend API routes.
// POST /api/auth/login
// POST /api/auth/register
// GET  /api/messages
// POST /api/messages
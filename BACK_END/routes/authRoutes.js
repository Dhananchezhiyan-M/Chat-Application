const express = require("express")
const router = express.Router();

const { registerUser, loginUser} = require("../controllers/authController");
router.post("/register", registerUser);
router.post("/login", loginUser);
module.exports = router; // stores that router.post, get. and we are exporting them.

// POST /register
//      ↓
// server.js(having /api/): app.use("/api/auth", authRoutes);
//      ↓
// authRoutes.js catches it
//      ↓
// calls registerUser()
//      ↓
// authController.js handles username + password
//      ↓
// User.js model saves data into MongoDB Atlas


// User clicks Login
//         │
//         ▼
// LoginPage.jsx
//         │
// axios.post("/api/auth/login")
//         ▼
// ──────────────────────────────────────────────────────
//         HTTP Request
// ──────────────────────────────────────────────────────
//         ▼
// server.js
//         │
//         ▼
// authRoutes.js
//         │
//         ▼
// loginUser() in authController.js
//         │
//         ▼
// User.js
//         │
//         ▼
// MongoDB Atlas
//         │
// Checks username & password
//         ▼
// Controller
//         │
// res.json({
//     success: true,
//     username: ...
// })
//         ▼
// ──────────────────────────────────────────────────────
//         HTTP Response
// ──────────────────────────────────────────────────────
//         ▼
// LoginPage.jsx
// await axios.post(...)
//         │
//         ▼
// if(success)
//         │
// navigate("/chat")
//         ▼
// ChatPage.jsx loads
//         │
// useEffect()
//         │
// socket = io(...)
//         ▼
// Socket.IO connection starts
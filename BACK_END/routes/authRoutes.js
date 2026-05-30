const express = require("express")
const router = express.Router();

const { registerUser, loginUser} = require("../controllers/authController");
router.post("/register", registerUser);
router.post("/login", loginUser);
module.exports = router; // stores that router.post, get. and we are exporting them.

// POST /register
//      ↓
// authRoutes.js catches it
//      ↓
// calls registerUser()
//      ↓
// authController.js handles username + password
//      ↓
// User.js model saves data into MongoDB Atlas
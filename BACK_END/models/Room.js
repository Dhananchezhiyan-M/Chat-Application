const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema({
    roomId: String,     // a8f3k2
    createdBy: String,  // username
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 432000 // 5 days
    }
});

module.exports = mongoose.model("Room", roomSchema);

// room = "general"   → Public chat
// room = "a8f3k2"    → Private chat
const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
    sender: String,
    content: String,
    room: String,
    senderId: String,
    timestamp: {
        type: Date,
        default: Date.now,
        expires: 432000 // 5 days
    }
});

module.exports = mongoose.model("Message", messageSchema);
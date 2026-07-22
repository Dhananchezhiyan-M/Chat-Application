const Message = require("../models/Message");
const Room = require("../models/Room");

let users = [];

const socketHandler = (io) => {
    io.on("connection", (socket) => {
        console.log("New client connected:", socket.id);

        // 🔥 JOIN SERVER
        socket.on("join server", async (username) => {
            try {
                const user = { username, id: socket.id };//also used in the typing part.

                // ✅ prevent duplicate users
                const existingUser = users.find(u => u.id === socket.id);
                if (!existingUser) {
                    users.push(user);
                }
                console.log("Users:", users);

            } catch (err) {
                console.error("Join server error:", err);
            }
        });

        // 🔥 JOIN ROOM
        socket.on("join room", async (room, cb) => {
            try {
                socket.join(room);

                // ✅ UPDATE ROOM USERS
                const roomSockets =
                    await io.in(room).fetchSockets();

                const roomUsers = roomSockets
                    .map((s) => {

                        const user = users.find(
                            (u) => u.id === s.id
                        );

                        return user;

                    })
                    .filter(Boolean);

                io.to(room).emit(
                    "room users",
                    roomUsers
                );

                const oldMessages = await Message.find({ room }).sort({ timestamp: 1 });

                cb(oldMessages); // send old messages to frontend

            } catch (err) {
                console.error("Join room error:", err);
            }
        });

        // 🔥 SEND MESSAGE
        socket.on("send message", async ({ content, sender, senderId, chatName }) => {//on(listens that frontend sends.)
            try {
                const newMessage = new Message({
                    sender,
                    content,
                    room: chatName,
                    senderId
                });

                await newMessage.save();

                io.to(chatName).emit("new message", {
                    content,
                    sender,
                    chatName,
                    senderId,
                    status: "sent",
                    timestamp: newMessage.timestamp
                });

            } catch (err) {
                console.error("Message error:", err);
            }
        });

        // ===============================
        // 🔐 PRIVATE CHAT
        // ===============================

        // CREATE ROOM
        socket.on("create room", async (username, cb) => {
            try {

                const roomId = Math.random()
                    .toString(36)
                    .substring(2, 8);

                const newRoom = new Room({
                    roomId,
                    createdBy: username
                });

                await newRoom.save();

                socket.join(roomId);

                cb({
                    roomId,
                    createdAt: newRoom.createdAt
                });

            } catch (err) {
                console.error("Create room error:", err);
            }
        });


        // JOIN PRIVATE ROOM
        socket.on("join private room", async (roomId, cb) => {
            try {

                const room = await Room.findOne({ roomId });

                if (!room) {
                    return cb({
                        error: "No chat available for this room code"
                    });
                }

                socket.join(roomId);
                // ✅ UPDATE USERS IN ROOM
                const roomSockets =
                    await io.in(roomId).fetchSockets();

                const roomUsers = roomSockets.map((s) => {

                    const user = users.find(
                        (u) => u.id === s.id
                    );

                    return user;

                }).filter(Boolean);

                io.to(roomId).emit(
                    "room users",
                    roomUsers
                );

                const oldMessages = await Message.find({
                    room: roomId
                }).sort({ timestamp: 1 });

                cb({
                    messages: oldMessages,
                    createdAt: room.createdAt
                });

            } catch (err) {
                console.error("Join private room error:", err);
            }
        });


        // SEND PRIVATE MESSAGE
        socket.on(
            "send private message",
            async ({ content, sender, senderId, roomId }) => {

            try {

                    const newMessage = new Message({
                        sender,
                        content,
                        room: roomId,
                        senderId
                    });

                    await newMessage.save();

                    io.to(roomId).emit(
                        "new private message",
                        {
                            content,
                            sender,
                            senderId,
                            timestamp: newMessage.timestamp,
                            status: "sent"
                        }
                    );

                } catch (err) {
                    console.error("Private message error:", err);
                }
            }
        );

        // 🔥 TYPING INDICATOR
        socket.on("typing", ({ username, room }) => {

            socket.to(room).emit("typing", username);

        });

        socket.on("stop typing", ({ username, room }) => {

            socket.to(room).emit("stop typing", username);

        });

        // 🔥 ROOM USERS
        socket.on("get room users", (roomId) => {

            const clients = io.sockets.adapter.rooms.get(roomId);

            if (!clients) {
                return socket.emit("room users", []);
            }

            const roomUsers = users.filter(
                user => clients.has(user.id)
            );

            socket.emit("room users", roomUsers);
        });

        // 🔥 LEAVE ROOM
        socket.on("leave room", async (roomId) => {

            try {

                socket.leave(roomId);

                const roomSockets =
                    await io.in(roomId)
                        .fetchSockets();

                const roomUsers = roomSockets
                    .map((s) => {

                        const user = users.find(
                            (u) => u.id === s.id
                        );

                        return user;

                    })
                    .filter(Boolean);

                io.to(roomId).emit(
                    "room users",
                    roomUsers
                );

            } catch (err) {
                console.error(
                    "Leave room error:",
                    err
                );
            }
        });

        //Delete Room.
        socket.on(
            "delete room",
            async ({ roomId, username }) => {

                try {

                    const room =
                        await Room.findOne({ roomId });

                    if (!room) return;

                    // Only creator can delete
                    if (
                        room.createdBy !== username
                    ) {
                        return;
                    }

                    await Message.deleteMany({
                        room: roomId
                    });

                    await Room.deleteOne({
                        roomId
                    });

                    io.to(roomId).emit(
                        "room deleted"
                    );

                } catch (err) {
                    console.error(
                        "Delete room error:",
                        err
                    );
                }
            }
        );

        // 🔥 DISCONNECT
        socket.on("disconnecting", async () => {
            try {
                const rooms = [...socket.rooms];//gets all the rooms of the particular socket id.

                users = users.filter(u => u.id !== socket.id);

                io.emit("new user", users);

                // ✅ UPDATE ALL ROOMS

                for (const roomId of rooms) {

                    if (roomId === socket.id) continue;//if the room ID matches with the socket id.

                        const roomSockets =
                            await io.in(roomId)
                                .fetchSockets();

                        const roomUsers = roomSockets
                            .map((s) => {

                                const user = users.find(
                                    (u) => u.id === s.id
                                );

                                return user;

                            })
                            .filter(Boolean);

                        io.to(roomId).emit(
                            "room users",
                            roomUsers
                        );
                }


                if (users.length === 0) {
                    console.log("All users left → messages cleared");
                }

                console.log("User disconnected:", socket.id);

            } catch (err) {
                console.error("Disconnect error:", err);
            }
        });
    });
};

module.exports = socketHandler;
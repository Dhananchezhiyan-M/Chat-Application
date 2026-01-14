    const express = require('express');
    const http = require('http'); // created http will be attached with socket.io
    const path = require('path');
    const socket = require('socket.io');

    const app = express();
    const server = http.createServer(app);
    const io = socket(server, {
        cors: {
            origin: "http://localhost:3000",
            methods: ["GET", "POST"]
        }
    });

    const PORT = process.env.PORT || 3000;

    app.use(express.static(path.join(__dirname, 'public')));

    const messages = {
        general: [],
        random: [],
        jokes: [],
        javascript: []
    };

    let users = [];

    io.on('connection', (socket) => {

        socket.on("join server", (username) => {//listening
            const user = {
                username,
                id: socket.id,
            };
            users.push(user); // FIXED: was user.push(user)
            console.log("added new user")
            io.emit("new user", users); // sending to all users.(new client joined).
        });

        socket.on("join room", (roomName, cb) => {//listening
            socket.join(roomName);
            cb(messages[roomName]);
            socket.emit("joined", messages[roomName]);
        });//sending to the connected user only(one client)

        socket.on("send message", ({content, to, sender, chatName, isChannel }) => {//here listening from one client
            if (isChannel) {
                const payload = {
                    content,
                    chatName,
                    sender
                };
                socket.to(to).emit("new message", payload); // The server receives a message from one client and sends it to other clients.
            } else {
                const payload = {
                    content,
                    chatName: sender, // FIXED: was charName
                    sender
                };
                socket.to(to).emit("new message", payload);
            }

            // FIXED: message → messages, charName → chatName
            if (messages[chatName]) {
                messages[chatName].push({
                    sender,
                    content
                });
            }
        });

        socket.on("disconnect", () => { // This listens for a built-in Socket.IO event called "disconnect". triggers when clicking X mark of browser.
            users = users.filter(u => u.id !== socket.id); // removes the user 
            io.emit("new user", users);// after removing the particular user, making others to visible the updated user array.
        });
    });

    server.listen(PORT, () => {
        console.log(`Server listening on http://localhost:${PORT}`);
    });

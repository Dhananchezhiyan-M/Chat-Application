import React from "react";
import { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import "./assets/chat.css";

function ChatPage({ username, logout , goBack}) {
    const [mySocketId, setMySocketId] = useState("");

    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const [users, setUsers] = useState([]);
    const socketRef = useRef();

    useEffect(() => {
        socketRef.current = io("http://localhost:3000");

        socketRef.current.on("connect", () => {
            setMySocketId(socketRef.current.id);
        });

        socketRef.current.emit("join server", username);
        socketRef.current.emit("join room", "general", (msgs) => {
            setMessages(msgs);
        });

        socketRef.current.on("new user", setUsers);

        socketRef.current.on("new message", (msg) => {
            setMessages((prev) => [...prev, msg]);
        });

        return () => socketRef.current.disconnect();
    }, [username]);

    const sendMessage = () => {
        if (!message.trim()) return;

        socketRef.current.emit("send message", {
            content: message,
            sender: username,
            senderId: username,
            chatName: "general"
        });

        setMessage("");
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const sortedUsers = [...users].sort((a, b) => {
        if (a.id === mySocketId) return -1;
        if (b.id === mySocketId) return 1;
        return 0;
    });

    return (
        <div className="chat-container">

            {/* HEADER */}
            <div className="chat-header">
                <div className="header-left">
                    <button onClick={goBack}>Back</button>
                    <div>
                        <h2>Public Chat</h2>
                    </div>
                </div>
                <button onClick={logout}>Logout</button>
            </div>

            {/* MAIN */}
            <div className="chat-main">

                {/* LEFT SIDE - CHAT */}
                <div className="chat-box">

                    {/* MESSAGES */}
                    <div className="messages">
                        {messages.map((msg, i) => {
                            const isMyMessage = msg.sender === username;

                            return (
                                <div
                                    key={i}
                                    className={
                                        isMyMessage
                                            ? "chat-message my-message"
                                            : "chat-message"
                                    }
                                >
                                    <b>{msg.sender}</b>
                                    <p>{msg.content}</p>
                                </div>
                            );
                        })}
                    </div>

                    {/* INPUT AREA */}
                    <div className="input-box">
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Type message..."
                        />
                        <button onClick={sendMessage}>Send</button>
                    </div>

                </div>

                {/* RIGHT SIDE - USERS */}
                <div className="chat-sidebar">
                    <h3>Users Online</h3>

                    {users.length <= 1 ? (
                        <p>No available users</p>
                    ) : (
                        sortedUsers.map((u) => (
                            <p key={u.id}>
                                {u.id === mySocketId ? `You: ${u.username}` : u.username}
                            </p>
                        ))
                    )}
                </div>

            </div>
        </div>
    );
}

export default ChatPage;
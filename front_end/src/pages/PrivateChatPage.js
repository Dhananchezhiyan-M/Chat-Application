import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import "./assets/chat.css";

function PrivateChatPage({ username, logout, goBack }) {
    const socketRef = useRef();

    const [mode, setMode] = useState(""); // create / join
    const [roomId, setRoomId] = useState("");
    const [joined, setJoined] = useState(false);

    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);

    const [users, setUsers] = useState([]);

    const [mySocketId, setMySocketId] = useState("");

    useEffect(() => {
        socketRef.current = io("http://localhost:3000");

        socketRef.current.on("connect", () => {
            setMySocketId(socketRef.current.id);
            socketRef.current.emit("join server",username);
        });

        socketRef.current.on("new private message", (msg) => {
            setMessages((prev) => [...prev, msg]);
        });

        socketRef.current.on("room users", (roomUsers) => {
            setUsers(roomUsers);
        });

        return () => socketRef.current.disconnect();
    }, []);

    // 🔥 CREATE ROOM
    const createRoom = () => {
        socketRef.current.emit("create room", username, (roomId) => {
            setRoomId(roomId);
            setJoined(true);
            socketRef.current.emit("get room users", roomId);
        });
    };

    // 🔥 JOIN ROOM
    const joinRoom = () => {
        if (!roomId.trim()) return alert("Enter room code");

        socketRef.current.emit("join private room", roomId, (res) => {
            if (res.error) {
                alert(res.error);
            } else {
                setMessages(res.messages || []);
                setJoined(true);
                socketRef.current.emit("get room users", roomId);
            }
        });
    };

    // 🔥 SEND MESSAGE
    const sendMessage = () => {
        if (!message.trim()) return;

        socketRef.current.emit("send private message", {
            content: message,
            sender: username,
            senderId: socketRef.current.id,
            roomId
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
                    <div className="room-header">
                        <h2>Private Chat</h2>

                        {joined && (
                            <span class="room-code">
                                Room Code: {roomId}
                            </span>
                        )}
                    </div>
                </div>
                <button onClick={logout}>Logout</button>
            </div>

            {/* NOT JOINED */}
            {!joined ? (
                <div style={{ padding: "40px", textAlign: "center" }}>
                    <h3>Choose Option</h3>

                    <div style={{ marginBottom: "20px" }}>
                        <button onClick={createRoom}>
                            Create Chat
                        </button>

                        <button onClick={() => setMode("join")}>
                            Join Chat
                        </button>
                    </div>

                    {mode === "join" && (
                        <div className="join-room-container">
                            <input
                                type="text"
                                placeholder="Enter Room Code"
                                value={roomId}
                                onChange={(e) => setRoomId(e.target.value)}
                            />

                            <button onClick={joinRoom}>
                                Join
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                /* CHAT UI */
                <div className="chat-main">

                    {/* CHAT BOX */}
                    <div className="chat-box">

                        <div className="messages">
                            {messages.map((msg, i) => {
                                const isMyMessage =
                                    msg.senderId === mySocketId ||
                                    msg.sender === username;

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

                        {/* INPUT */}
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

                            <h3>Users In Room</h3>

                            {users.length <= 1 ? (

                                <p>No available users</p>

                            ) : (

                                sortedUsers.map((u) => (
                                    <p key={u.id}>
                                        {u.id === mySocketId
                                            ? `You: ${u.username}`
                                            : u.username}
                                    </p>
                                ))
                            )}

                        </div>
                </div>
            )}
        </div>
    );
}

export default PrivateChatPage;
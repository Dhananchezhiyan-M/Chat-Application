import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import "./assets/chat.css";
import EmojiPicker from "emoji-picker-react";

import sendSound from "../audio/send-1.mp3";
import receiveSound from "../audio/receive-1.mp3";

function PrivateChatPage({ username, logout, goBack }) {
    const socketRef = useRef();

    const [mode, setMode] = useState(""); // create / join
    const [roomId, setRoomId] = useState("");
    const [joined, setJoined] = useState(false);

    const messagesEndRef = useRef(null);
    const [message, setMessage] = useState("");
    const [typingUsers, setTypingUsers] = useState([]);
    const [messages, setMessages] = useState([]);

    const [users, setUsers] = useState([]);

    const [mySocketId, setMySocketId] = useState("");

    const [showEmoji, setShowEmoji] = useState(false);

    const sendAudio = new Audio(sendSound);
    const receiveAudio = new Audio(receiveSound);

    useEffect(() => {
        socketRef.current = io("http://localhost:3000");

        socketRef.current.on("connect", () => {
            setMySocketId(socketRef.current.id);
            socketRef.current.emit("join server",username);
        });

        socketRef.current.on("new private message", (msg) => {
            setMessages((prev) => [...prev, msg]);
            if (msg.sender !== username) {
                receiveAudio.play();
            }
        });

        socketRef.current.on("room users", (roomUsers) => {
            setUsers(roomUsers);
        });

        // 🔥 USER TYPING
        socketRef.current.on("typing", (username) => {

            setTypingUsers((prev) => {

                if (prev.includes(username)) {
                    return prev;
                }

                return [...prev, username];
            });
        });


        // 🔥 STOP TYPING
        socketRef.current.on("stop typing", (username) => {

            setTypingUsers((prev) =>
                prev.filter((u) => u !== username)
            );
        });

        return () => socketRef.current.disconnect();
    }, []);

    useEffect(() => {
    
            messagesEndRef.current?.scrollIntoView({
                behavior: "smooth"
            });
    
        }, [messages]);

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

    let typingTimeout;

    // 🔥 SEND MESSAGE
    const sendMessage = () => {
        if (!message.trim()) return;

        socketRef.current.emit("send private message", {
            content: message,
            sender: username,
            senderId: socketRef.current.id,
            roomId
        });
        sendAudio.play();
        setMessage("");
    };

    const handleTyping = (e) => {

        setMessage(e.target.value);

        socketRef.current.emit("typing", {
            username,
            room: roomId
        });

        clearTimeout(typingTimeout);

        typingTimeout = setTimeout(() => {

            socketRef.current.emit("stop typing", {
                username,
                room: roomId
            });

        }, 1000);
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

                                        <div className="message-footer">

                                            <small className="message-time">
                                                {new Date(msg.timestamp)
                                                    .toLocaleTimeString([], {
                                                        hour: "2-digit",
                                                        minute: "2-digit"
                                                    })}
                                            </small>

                                            {msg.sender === username && (
                                                <span className="message-status">
                                                    ✓
                                                </span>
                                            )}

                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef}></div>
                        </div>

                    <div className="typing-indicator">

                        {typingUsers.length === 1 &&
                            `${typingUsers[0]} is typing...`}

                        {typingUsers.length === 2 &&
                            `${typingUsers[0]} and ${typingUsers[1]} are typing...`}

                        {typingUsers.length > 2 &&
                            `${typingUsers.length} people are typing...`}

                    </div>                        

                        {/* INPUT AREA */}
                        <div className="input-box">
    
                            <div className="emoji-container">
    
                                <button
                                    className="emoji-btn"
                                    onClick={() => setShowEmoji(!showEmoji)}
                                >
                                    😊
                                </button>
    
                                {showEmoji && (
                                    <div className="emoji-picker">
    
                                        <button
                                            className="close-emoji"
                                            onClick={() => setShowEmoji(false)}
                                        >
                                            ✖
                                        </button>
    
                                        <EmojiPicker
                                            onEmojiClick={(emojiData) => {
    
                                                setMessage(
                                                    prev => prev + emojiData.emoji
                                                );
                                            }}
                                        />
    
                                    </div>
                                )}
    
                            </div>
    
                            <textarea
                                value={message}
                                onChange={handleTyping}
                                onKeyDown={handleKeyDown}
                                placeholder="Type message..."
                            />
    
                            <button onClick={sendMessage}>
                                Send
                            </button>
    
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
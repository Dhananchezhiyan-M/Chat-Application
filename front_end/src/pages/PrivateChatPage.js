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
    const roomIdRef = useRef("");
    const [joined, setJoined] = useState(false);

    const messagesEndRef = useRef(null);
    const [message, setMessage] = useState("");
    const [typingUsers, setTypingUsers] = useState([]);
    const [messages, setMessages] = useState([]);

    const [users, setUsers] = useState([]);

    const [mySocketId, setMySocketId] = useState("");

    const [showEmoji, setShowEmoji] = useState(false);

    const sendAudioRef = useRef(new Audio(sendSound));
    const receiveAudioRef = useRef(new Audio(receiveSound));

    const [roomCreatedAt, setRoomCreatedAt] = useState(null);
    const [expiryTime, setExpiryTime] = useState("");

    const deleteRoom = () => {

    const confirmed =
            window.confirm(
                "Are you sure you want to delete this room?"
            );

        if (!confirmed) return;

        socketRef.current.emit(
            "delete room",
            {
                roomId,
                username
            }
        );
    };

    useEffect(() => {
        socketRef.current = io("http://localhost:3000");

        socketRef.current.on("connect", () => {
            setMySocketId(socketRef.current.id);
            socketRef.current.emit("join server",username);
        });

        socketRef.current.on("new private message", (msg) => {
            setMessages((prev) => [...prev, msg]);
            if (msg.sender !== username) {
                receiveAudioRef.current.currentTime = 0;

                receiveAudioRef.current.play()
                    .catch(err => console.log(err));
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

        socketRef.current.on(
            "room deleted",
            () => {

                alert(
                    "Room deleted by creator"
                );

                setJoined(false);
                setMessages([]);
                setUsers([]);
                setRoomId("");
                setMode("");

            }
        );

        return () => {

            if (roomIdRef.current) {

                socketRef.current.emit(
                    "leave room",
                    roomIdRef.current
                );
            }
            socketRef.current.disconnect();
        };
    }, []);

    useEffect(() => {
        roomIdRef.current = roomId;
    }, [roomId]);

    useEffect(() => {
    
            messagesEndRef.current?.scrollIntoView({
                behavior: "smooth"
            });
    
    }, [messages]);

    useEffect(() => {

        if (!roomCreatedAt) return;

        const expiry =
            new Date(roomCreatedAt).getTime()
            + (432000 * 1000); // 5 days

        const timer = setInterval(() => {

            const now = Date.now();

            const remaining = expiry - now;

            if (remaining <= 0) {
                setExpiryTime("Expired");
                clearInterval(timer);
                return;
            }

            const days = Math.floor(
                remaining / (1000 * 60 * 60 * 24)
            );

            const hours = Math.floor(
                (remaining % (1000 * 60 * 60 * 24))
                / (1000 * 60 * 60)
            );

            const minutes = Math.floor(
                (remaining % (1000 * 60 * 60))
                / (1000 * 60)
            );

            const seconds = Math.floor(
                (remaining % (1000 * 60))
                / 1000
            );

            setExpiryTime(
                `${days}d ${hours}h ${minutes}m ${seconds}s`
            );

        }, 1000);

        return () => clearInterval(timer);

    }, [roomCreatedAt]);

    // 🔥 CREATE ROOM
    const createRoom = () => {
        socketRef.current.emit(
            "create room",
            username,
            (res) => {

                setRoomId(res.roomId);
                setRoomCreatedAt(res.createdAt);

                socketRef.current.emit(
                    "join room",
                    res.roomId,
                    () => {}
                );

                setJoined(true);
            }
        );
    };

    // 🔥 JOIN ROOM
    const joinRoom = () => {
        if (!roomId.trim()) return alert("Enter room code");

        socketRef.current.emit("join private room", roomId, (res) => {
            if (res.error) {
                alert(res.error);
            } else {
                setMessages(res.messages || []);
                setRoomCreatedAt(res.createdAt);
                setJoined(true);
                socketRef.current.emit(
                    "join room",
                    roomId,
                    () => {}
                );
            }
        });
    };

    let typingTimeoutRef;

    // 🔥 SEND MESSAGE
    const sendMessage = () => {
        if (!message.trim()) return;

        socketRef.current.emit("send private message", {
            content: message,
            sender: username,
            senderId: socketRef.current.id,
            roomId
        });
        sendAudioRef.current.currentTime = 0;

        sendAudioRef.current.play()
            .catch(err => console.log(err));
        setMessage("");
    };

    const handleTyping = (e) => {

        setMessage(e.target.value);

        socketRef.current.emit("typing", {
            username,
            room: roomId
        });

        clearTimeout(typingTimeoutRef);

        typingTimeoutRef = setTimeout(() => {

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
                            <span className="room-code">
                                Room Code: {roomId}
                            </span>
                        )}
                        {joined && (
                            <div className="expiry-timer">
                                Expires in: {expiryTime}
                            </div>
                        )}
                        {joined && (
                            <button onClick={deleteRoom}>
                                Delete Room
                            </button>
                        )}
                    </div>
                </div>
                <button onClick={logout}>Logout</button>
            </div>

            {/* NOT JOINED */}
            {!joined ? (
                <div className="welcome-screen">
                    <h3>Choose Option</h3>

                    <div className="option-buttons">
                        <button className="option-btn" onClick={createRoom}>
                            Create Chat
                        </button>

                        <button className="option-btn" onClick={() => setMode("join")}>
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
                                            skinTonesDisabled
                                            onEmojiClick={(emojiData) => {
                                                setMessage(prev => prev + emojiData.emoji);
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

                            {users.length <= 0 ? (

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
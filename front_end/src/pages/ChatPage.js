import React from "react";
import { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import "./assets/chat.css";
import EmojiPicker from "emoji-picker-react";

import sendSound from "../audio/send-1.mp3";
import receiveSound from "../audio/receive-1.mp3";

function ChatPage({ username, logout, goBack}) {
    const [mySocketId, setMySocketId] = useState("");

    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const messagesEndRef = useRef(null);
    const [typingUsers, setTypingUsers] = useState([]);
    const [users, setUsers] = useState([]);
    const socketRef = useRef();

    const [showEmoji, setShowEmoji] = useState(false);

    const sendAudioRef = useRef(new Audio(sendSound));
    const receiveAudioRef = useRef(new Audio(receiveSound));

    useEffect(() => {
        socketRef.current = io("http://localhost:3000");//FrontEnd initiates the TCP connection with the backend server.

        socketRef.current.on("connect", () => {
            setMySocketId(socketRef.current.id);
        });

        socketRef.current.emit("join server", username);//sending the username
        socketRef.current.emit("join room", "general", (msgs) => {
            setMessages(msgs);
        });//sending the room details.

        socketRef.current.emit(
            "get room users",
            "general"
        );//asking backend to calculate and send them.

        socketRef.current.on(
            "room users",
            setUsers
        );//Receiving from the frontend.

        socketRef.current.on("new message", (msg) => {
            setMessages((prev) => [...prev, msg]);
            if (msg.sender !== username) {//if username and sender name matches no receive sound.
                receiveAudioRef.current.currentTime = 0;

                receiveAudioRef.current.play()
                    .catch(err => console.log(err));
            }
        });

        // 🔥 USER TYPING
        socketRef.current.on("typing", (username) => {

            setTypingUsers((prev) => {

                if (prev.includes(username)) {
                    return prev;
                }

                return [...prev, username];
            });
        });//prev stores the previous state of typingUsers. Receiving the name from the backend.


        // 🔥 STOP TYPING
        socketRef.current.on("stop typing", (username) => {

            setTypingUsers((prev) =>
                prev.filter((u) => u !== username)
            );
        });//Updates the typing userList, if any one stops typing, remove the user name.

        return () => {

            socketRef.current.emit(
                "leave room",
                "general"
            );
            socketRef.current.disconnect();//disconnect when closed.
        };
    }, [username]);//backend removes the users array.

    useEffect(() => {

        messagesEndRef.current?.scrollIntoView({
            behavior: "smooth"
        });

    }, [messages]);//Everytime message changes, scroll to the viewable page(bottom).

    const typingTimeoutRef = useRef(null);

    //Sending sound.
    const sendMessage = () => {
        if (!message.trim()) return;

        socketRef.current.emit("send message", {
            content: message,
            sender: username,
            senderId: username,
            chatName: "general"
        });
        sendAudioRef.current.currentTime = 0;

        sendAudioRef.current.play()
            .catch(err => console.log(err));
        setMessage("");
    };

    const handleTyping = (e) => {

        setMessage(e.target.value);

        socketRef.current.emit("typing", {//sending to the backend.
            username,
            room: "general"
        });

        clearTimeout(typingTimeoutRef.current);

        typingTimeoutRef.current = setTimeout(() => {//sending stop typing if for 1 second didn't typed.

            socketRef.current.emit("stop typing", {
                username,
                room: "general"
            });

        }, 1000);
    };

    const handleKeyDown = (e) => {//enter to send the data.
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const sortedUsers = [...users].sort((a, b) => {
        if (a.id === mySocketId) return -1;
        if (b.id === mySocketId) return 1;
        return 0;
    });//pinning the own user in the top of the page.

    return (
        <div className="chat-container">

            {/* HEADER */}
            <div className="chat-header">
                <div className="header-left">
                    <button onClick={goBack}>Back</button>
                    <div>
                        <h2>Public Chat</h2>
                    </div>
                    <div className="expiry-info">
                        Messages auto-delete after 5 days
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
                    <h3>Users Online</h3>

                    {users.length <= 0 ? (
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
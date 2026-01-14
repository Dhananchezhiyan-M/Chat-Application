import React, { useState, useEffect, useRef } from 'react';
import Form from './components/UsernameForm';
import Chat from './components/chat';
import io from 'socket.io-client';
import immer from 'immer';
import './App.css';

const initialMessagesState = {
    general: [],
    random: [],
    jokes: [],
    javascript: []
};

function App() {
    const [username, setUsername] = useState("");
    const [connected, setConnected] = useState(false);
    const [currentChat, setCurrentChat] = useState({ isChannel: true, chatName: "general", receiverId: "" });
    const [connectedRooms, setConnectedRooms] = useState(["general"]);
    const [allUsers, setAllUsers] = useState([]);
    const [messages, setMessages] = useState(initialMessagesState);
    const [message, setMessage] = useState("");
    const socketRef = useRef();

    function handleMessageChange(e) {
        setMessage(e.target.value);//update the message
    }

    useEffect(() => {
        setMessage("");
    }, [messages]);

    function sendMessage() {
        const payload = {
            content: message,
            to: currentChat.isChannel ? currentChat.chatName : currentChat.receiverId,
            sender: username,
            chatName: currentChat.chatName,
            isChannel: currentChat.isChannel
        };

        socketRef.current.emit("send message", payload);

        const newMessages = immer(messages, draft => {
            draft[currentChat.chatName].push({
                sender: username,
                content: message
            });
        });

        setMessages(newMessages);
    }

    function roomJoinCallback(incomingMessages, room) {
        const newMessages = immer(messages, draft => {
            draft[room] = incomingMessages;
        });

        setMessages(newMessages);
    }


    function joinRoom(room) {
        const newConnectedRooms = immer(connectedRooms, draft => {
            draft.push(room);
        });

        socketRef.current.emit("join room", room, (messages) =>
            roomJoinCallback(messages, room)
        );

        setConnectedRooms(newConnectedRooms);
    }

    function toggleChat(currentChat) {
        if (!messages[currentChat.chatName]) {
            const newMessages = immer(messages, draft => {
                draft[currentChat.chatName] = [];
            });
            setMessages(newMessages);
        }
        setCurrentChat(currentChat);
    }

    function handleChange(e) {
        setUsername(e.target.value);
    };

    function connect() {
        console.log("here")
        setConnected(true);
        socketRef.current = io.connect("http://localhost:3000");
        console.log(socketRef.current)

        socketRef.current.emit("join server", username);
        console.log("emitted join server")
        socketRef.current.emit("join room", "general", (messages) => roomJoinCallback(messages, "general"));

        socketRef.current.on("new user", allUsers => {
            console.log(allUsers)
            setAllUsers(allUsers);
        });

        socketRef.current.on("new message", ({ content, sender, chatName }) => {
            setMessages(msgs => {
                const newMessages = immer(msgs, draft => {
                    if (draft[chatName]) {
                        draft[chatName].push({ content, sender });
                    } else {
                        draft[chatName] = [{ content, sender }];
                    }
                });
                return newMessages;
            });
        });
    }

    let body;
    if (connected) {
        body = (
            <Chat
                message={message}
                handleMessageChange={handleMessageChange}
                sendMessage={sendMessage}
                yourId={socketRef.current ? socketRef.current.id : ""}
                allUsers={allUsers}
                joinRoom={joinRoom}
                connectedRooms={connectedRooms}
                currentChat={currentChat}
                toggleChat={toggleChat}
                messages={messages[currentChat.chatName]}
            />
        );
    } else {
        body = (
            <Form username={username} onChange={handleChange} connect={connect} />
        );
    }

    return (
        <div className="App">
            {body}
        </div>
    );
}

export default App;

import React from 'react';
import styled from 'styled-components';

const rooms = [
    "general",
    "JAVA",
    "PYTHON",
    "JAVASCRIPT"
];

const Container = styled.div`
    height: 100vh;
    width: 100%;
    display: flex;
    background-color: #f5f5f5;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
`;

const SideBar = styled.div`
    height: 100%;
    width: 20%;
    background-color: #2c3e50;
    color: white;
    padding: 20px;
    box-shadow: 2px 0 5px rgba(0,0,0,0.1);
`;

const ChatPanel = styled.div`
    height: 100%;
    width: 80%;
    display: flex;
    flex-direction: column;
    background-color: white;
`;

const BodyContainer = styled.div`
    width: 100%;
    height: 75%;
    overflow-y: auto;
    padding: 20px;
    background-color: #f9f9f9;
`;

const TextBox = styled.textarea`
    height: 15%;
    width: 100%;
    border: none;
    border-top: 1px solid #ddd;
    padding: 15px;
    font-size: 16px;
    resize: none;
    outline: none;
    background-color: white;
`;

const ChannelInfo = styled.div`
    height: 10%;
    width: 100%;
    background-color: #34495e;
    color: white;
    display: flex;
    align-items: center;
    padding: 0 20px;
    font-size: 18px;
    font-weight: bold;
    border-bottom: 1px solid #ddd;
`;

const Row = styled.div`
    cursor: pointer;
    padding: 10px;
    margin: 5px 0;
    border-radius: 5px;
    transition: background-color 0.3s;
    &:hover {
        background-color: #34495e;
    }
`;

const Messages = styled.div`
    display: flex;
    flex-direction: column;
    gap: 10px;
`;

const MessageBubble = styled.div`
    max-width: 60%;
    padding: 10px 15px;
    border-radius: 20px;
    font-size: 14px;
    line-height: 1.4;
    word-wrap: break-word;
    align-self: ${props => props.isOwn ? 'flex-end' : 'flex-start'};
    background-color: ${props => props.isOwn ? '#007bff' : '#e9ecef'};
    color: ${props => props.isOwn ? 'white' : 'black'};
`;

const SenderName = styled.div`
    font-weight: bold;
    margin-bottom: 5px;
    color: #555;
`;

function Chat(props) {
    function renderRooms(room) {
        const currentChat = {
            chatName: room,
            isChannel: true,
            receiverId: ""
        };

        return (
            <Row onClick={() => props.toggleChat(currentChat)} key={room}>
                {room}
            </Row>
        );
    }

    function renderUser(user) {
        if (user.id === props.yourId) {
            return (
                <Row key={user.id}>
                    You: {user.username}
                </Row>
            );
        }

        const currentChat = {
            chatName: user.username,
            isChannel: false,
            receiverId: user.id
        };

        return (
            <Row onClick={() => {
                props.toggleChat(currentChat);
            }} key={user.id}>
                {user.username}
            </Row>
        );
    };

    function renderMessages(message, index) {
        const isOwn = message.senderId === props.yourId;
        return (
            <MessageBubble key={index} isOwn={isOwn}>
                {!isOwn && <SenderName>{message.sender}</SenderName>}
                <p>{message.content}</p>
            </MessageBubble>
        );
    }


    let body;
    if ((props.currentChat.isChannel && props.connectedRooms.includes(props.currentChat.chatName)) || !props.currentChat.isChannel) {
        body = (
            <Messages>
                {props.messages ? props.messages.map(renderMessages) : null}
            </Messages>
        );
    } else {
        body = (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <button 
                    onClick={() => props.joinRoom(props.currentChat.chatName)}
                    style={{
                        padding: '10px 20px',
                        fontSize: '16px',
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer'
                    }}
                >
                    Join {props.currentChat.chatName}
                </button>
            </div>
        );
    }

    function handleKeyPress(e) {
        if (e.key === "Enter") {
            props.sendMessage();
        }
    }

    return (
        <Container>
            <SideBar>
                <h3 style={{ marginBottom: '10px', color: '#ecf0f1' }}>Channels</h3>
                {rooms.map(renderRooms)}
                <h3 style={{ marginTop: '20px', marginBottom: '10px', color: '#ecf0f1' }}>All Users</h3>
                {props.allUsers.map(renderUser)}
            </SideBar>

            <ChatPanel>
                <ChannelInfo>
                    {props.currentChat.chatName}
                </ChannelInfo>

                <BodyContainer>
                    {body}
                </BodyContainer>

                <TextBox
                    value={props.message}
                    onChange={props.handleMessageChange}
                    onKeyPress={handleKeyPress}
                    placeholder="Say something I'm giving up on you..."
                />
            </ChatPanel>
        </Container>
    );
};

export default Chat;

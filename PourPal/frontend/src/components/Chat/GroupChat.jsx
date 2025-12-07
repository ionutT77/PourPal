import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import './GroupChat.css';

const GroupChat = ({ hangoutId }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [ws, setWs] = useState(null);
    const [connected, setConnected] = useState(false);
    const messagesEndRef = useRef(null);
    const currentUserId = JSON.parse(localStorage.getItem('user'))?.id;

    // Scroll to bottom of messages
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Fetch message history
    useEffect(() => {
        const loadMessages = async () => {
            try {
                const response = await axios.get(
                    `http://localhost:8000/api/chat/${hangoutId}/messages/`,
                    { withCredentials: true }
                );
                setMessages(response.data);
            } catch (error) {
                console.error('Error loading messages:', error);
            }
        };

        loadMessages();
    }, [hangoutId]);

    // WebSocket connection
    useEffect(() => {
        const websocket = new WebSocket(`ws://localhost:8000/ws/chat/${hangoutId}/`);

        websocket.onopen = () => {
            console.log('WebSocket connected');
            setConnected(true);
        };

        websocket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            setMessages((prevMessages) => [
                ...prevMessages,
                {
                    user_id: data.user_id,
                    user_name: data.user_name,
                    user_photo: data.user_photo,
                    message_text: data.message,
                    timestamp: data.timestamp,
                },
            ]);
        };

        websocket.onerror = (error) => {
            console.error('WebSocket error:', error);
            setConnected(false);
        };

        websocket.onclose = () => {
            console.log('WebSocket disconnected');
            setConnected(false);
        };

        setWs(websocket);

        return () => {
            websocket.close();
        };
    }, [hangoutId]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (newMessage.trim() && ws && connected) {
            ws.send(JSON.stringify({ message: newMessage }));
            setNewMessage('');
        }
    };

    const formatTimestamp = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="group-chat-container">
            <div className="chat-header">
                <h3>💬 Group Chat</h3>
                <span className={`connection-status ${connected ? 'connected' : 'disconnected'}`}>
                    {connected ? '● Connected' : '○ Disconnected'}
                </span>
            </div>

            <div className="messages-container">
                {messages.length === 0 ? (
                    <div className="no-messages">
                        <p>No messages yet. Start the conversation! 👋</p>
                    </div>
                ) : (
                    messages.map((msg, index) => {
                        const isCurrentUser = msg.user_id === currentUserId;
                        return (
                            <div
                                key={index}
                                className={`message ${isCurrentUser ? 'message-current-user' : 'message-other-user'}`}
                            >
                                {!isCurrentUser && (
                                    <div className="message-avatar">
                                        {msg.user_photo ? (
                                            <img src={msg.user_photo} alt={msg.user_name} />
                                        ) : (
                                            <div className="avatar-placeholder">
                                                {msg.user_name.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                )}
                                <div className="message-content">
                                    {!isCurrentUser && <div className="message-sender">{msg.user_name}</div>}
                                    <div className="message-bubble">
                                        <p>{msg.message_text}</p>
                                        <span className="message-time">{formatTimestamp(msg.timestamp)}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            <form className="chat-input-form" onSubmit={handleSendMessage}>
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    disabled={!connected}
                />
                <button type="submit" disabled={!connected || !newMessage.trim()}>
                    Send
                </button>
            </form>
        </div>
    );
};

export default GroupChat;
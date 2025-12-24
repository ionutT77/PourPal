import React, { useState, useEffect, useRef } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import axios from 'axios';
import './PrivateChat.css';
import { API_BASE_URL } from '../../services/api';

const PrivateChat = () => {
    const { userId } = useParams();
    const history = useHistory();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [otherUser, setOtherUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        fetchConversation();
        const interval = setInterval(fetchConversation, 3000); // Poll every 3 seconds
        return () => clearInterval(interval);
    }, [userId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const fetchConversation = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/chat/private/${userId}/`, {
                withCredentials: true
            });
            setMessages(response.data);
            if (response.data.length > 0) {
                const firstMsg = response.data[0];
                const otherUserName = firstMsg.sender_name !== getCurrentUserName()
                    ? firstMsg.sender_name
                    : firstMsg.receiver_name;
                setOtherUser({ name: otherUserName, id: userId });
            }
            setLoading(false);
        } catch (err) {
            console.error('Error fetching conversation:', err);
            setLoading(false);
        }
    };

    const getCurrentUserName = () => {
        // You might want to get this from context or props
        return localStorage.getItem('userName') || 'You';
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || sending) return;

        setSending(true);
        try {
            await axios.post(`${API_BASE_URL}/chat/private/send/`, {
                receiver: userId,
                message: newMessage
            }, {
                withCredentials: true
            });
            setNewMessage('');
            fetchConversation();
        } catch (err) {
            console.error('Error sending message:', err);
            alert(err.response?.data?.error || 'Failed to send message');
        } finally {
            setSending(false);
        }
    };

    if (loading) {
        return <div className="chat-loading">Loading conversation...</div>;
    }

    return (
        <div className="private-chat-container">
            <div className="chat-header">
                <button className="back-btn" onClick={() => history.push('/messages')}>
                    ← Back
                </button>
                <h2>💬 Chat with {otherUser?.name || 'User'}</h2>
            </div>

            <div className="messages-container">
                {messages.length === 0 ? (
                    <div className="no-messages">
                        <p>No messages yet. Start the conversation!</p>
                    </div>
                ) : (
                    messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`message ${msg.sender === parseInt(userId) ? 'received' : 'sent'}`}
                        >
                            <div className="message-content">
                                <p>{msg.message}</p>
                                <span className="message-time">
                                    {new Date(msg.created_at).toLocaleTimeString([], {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </span>
                            </div>
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            <form className="message-input-form" onSubmit={handleSendMessage}>
                <input
                    type="text"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    disabled={sending}
                />
                <button type="submit" disabled={!newMessage.trim() || sending}>
                    {sending ? '...' : '📤 Send'}
                </button>
            </form>
        </div>
    );
};

export default PrivateChat;

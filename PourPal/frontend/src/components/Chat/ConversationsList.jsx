import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './ConversationsList.css';

const ConversationsList = () => {
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchConversations();
        const interval = setInterval(fetchConversations, 5000); // Poll every 5 seconds
        return () => clearInterval(interval);
    }, []);

    const fetchConversations = async () => {
        try {
            const response = await axios.get('http://localhost:8000/api/chat/private/conversations/', {
                withCredentials: true
            });
            setConversations(response.data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching conversations:', err);
            setLoading(false);
        }
    };

    const formatTime = (timestamp) => {
        if (!timestamp) return '';
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;

        if (diff < 86400000) { // Less than 24 hours
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else if (diff < 604800000) { // Less than 7 days
            return date.toLocaleDateString([], { weekday: 'short' });
        } else {
            return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
        }
    };

    if (loading) {
        return <div className="conversations-loading">Loading messages...</div>;
    }

    return (
        <div className="conversations-container">
            <div className="conversations-header">
                <h1>💬 Messages</h1>
            </div>

            {conversations.length === 0 ? (
                <div className="no-conversations">
                    <p>No messages yet</p>
                    <Link to="/friends" className="go-friends-btn">
                        Go to Friends
                    </Link>
                </div>
            ) : (
                <div className="conversations-list">
                    {conversations.map((conv) => (
                        <Link
                            key={conv.user_id}
                            to={`/chat/${conv.user_id}`}
                            className="conversation-item"
                        >
                            <div className="conversation-info">
                                <div className="conversation-header-row">
                                    <h3>{conv.user_name}</h3>
                                    <span className="conversation-time">
                                        {formatTime(conv.last_message_time)}
                                    </span>
                                </div>
                                <p className="last-message">
                                    {conv.last_message || 'No messages'}
                                </p>
                            </div>
                            {conv.unread_count > 0 && (
                                <div className="unread-badge">{conv.unread_count}</div>
                            )}
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ConversationsList;

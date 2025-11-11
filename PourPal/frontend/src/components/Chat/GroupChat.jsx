import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getChatMessages, sendMessage } from '../../services/api';

const GroupChat = () => {
    const { hangoutId } = useParams();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');

    useEffect(() => {
        const loadMessages = async () => {
            const response = await getChatMessages(hangoutId);
            setMessages(response.data);
        };

        loadMessages();
    }, [hangoutId]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (newMessage.trim()) {
            await sendMessage(hangoutId, newMessage);
            setNewMessage('');
            // Optionally reload messages after sending
            const response = await getChatMessages(hangoutId);
            setMessages(response.data);
        }
    };

    return (
        <div className="group-chat">
            <div className="messages">
                {messages.map((msg, index) => (
                    <div key={index} className="message">
                        <strong>{msg.sender}</strong>: {msg.content}
                    </div>
                ))}
            </div>
            <form onSubmit={handleSendMessage}>
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                />
                <button type="submit">Send</button>
            </form>
        </div>
    );
};

export default GroupChat;
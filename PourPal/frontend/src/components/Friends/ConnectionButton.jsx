import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ConnectionButton.css';

const ConnectionButton = ({ userId, userName }) => {
    const [connectionStatus, setConnectionStatus] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchConnectionStatus();
    }, [userId]);

    const fetchConnectionStatus = async () => {
        try {
            const response = await axios.get(`http://localhost:8000/api/users/connections/status/${userId}/`, {
                withCredentials: true
            });
            setConnectionStatus(response.data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching connection status:', err);
            setLoading(false);
        }
    };

    const handleSendRequest = async () => {
        try {
            await axios.post(`http://localhost:8000/api/users/connections/send/${userId}/`, {}, {
                withCredentials: true
            });
            fetchConnectionStatus();
        } catch (err) {
            console.error('Error sending request:', err);
        }
    };

    const handleAccept = async () => {
        try {
            await axios.post(`http://localhost:8000/api/users/connections/${connectionStatus.connection_id}/accept/`, {}, {
                withCredentials: true
            });
            fetchConnectionStatus();
        } catch (err) {
            console.error('Error accepting request:', err);
        }
    };

    const handleReject = async () => {
        try {
            await axios.post(`http://localhost:8000/api/users/connections/${connectionStatus.connection_id}/reject/`, {}, {
                withCredentials: true
            });
            fetchConnectionStatus();
        } catch (err) {
            console.error('Error rejecting request:', err);
        }
    };

    if (loading) return null;

    if (!connectionStatus || connectionStatus.status === 'none') {
        return (
            <button className="connection-btn add-friend" onClick={handleSendRequest}>
                ➕ Add Friend
            </button>
        );
    }

    if (connectionStatus.status === 'pending' && connectionStatus.direction === 'sent') {
        return (
            <button className="connection-btn pending" disabled>
                ⏳ Request Sent
            </button>
        );
    }

    if (connectionStatus.status === 'pending' && connectionStatus.direction === 'received') {
        return (
            <div className="connection-actions">
                <button className="connection-btn accept" onClick={handleAccept}>
                    ✓ Accept
                </button>
                <button className="connection-btn reject" onClick={handleReject}>
                    ✗ Reject
                </button>
            </div>
        );
    }

    if (connectionStatus.status === 'accepted') {
        return (
            <button className="connection-btn friends" disabled>
                ✓ Friends
            </button>
        );
    }

    return null;
};

export default ConnectionButton;

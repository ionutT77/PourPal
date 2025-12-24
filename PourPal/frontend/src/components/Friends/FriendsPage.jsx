import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './FriendsPage.css';
import { API_BASE_URL } from '../../services/api';

const FriendsPage = () => {
    const [friends, setFriends] = useState([]);
    const [pendingRequests, setPendingRequests] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchFriends();
        fetchPendingRequests();
    }, []);

    const fetchFriends = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/users/connections/friends/`, {
                withCredentials: true
            });
            setFriends(response.data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching friends:', err);
            setLoading(false);
        }
    };

    const fetchPendingRequests = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/users/connections/pending/`, {
                withCredentials: true
            });
            setPendingRequests(response.data);
        } catch (err) {
            console.error('Error fetching pending requests:', err);
        }
    };

    const handleSearch = async () => {
        if (searchQuery.length < 2) {
            setError('Please enter at least 2 characters');
            return;
        }

        try {
            const response = await axios.get(`${API_BASE_URL}/users/search/?username=${searchQuery}`, {
                withCredentials: true
            });
            setSearchResults(response.data);
            setError('');
        } catch (err) {
            setError('Search failed');
        }
    };

    const handleSendRequest = async (userId) => {
        try {
            await axios.post(`${API_BASE_URL}/users/connections/send/${userId}/`, {}, {
                withCredentials: true
            });
            setSuccess('Friend request sent!');
            setTimeout(() => setSuccess(''), 3000);
            handleSearch(); // Refresh search results
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to send request');
        }
    };

    const handleAccept = async (connectionId) => {
        try {
            await axios.post(`${API_BASE_URL}/users/connections/${connectionId}/accept/`, {}, {
                withCredentials: true
            });
            setSuccess('Friend request accepted!');
            setTimeout(() => setSuccess(''), 3000);
            fetchFriends();
            fetchPendingRequests();
        } catch (err) {
            setError('Failed to accept request');
        }
    };

    const handleReject = async (connectionId) => {
        try {
            await axios.post(`${API_BASE_URL}/users/connections/${connectionId}/reject/`, {}, {
                withCredentials: true
            });
            setSuccess('Friend request rejected');
            setTimeout(() => setSuccess(''), 3000);
            fetchPendingRequests();
        } catch (err) {
            setError('Failed to reject request');
        }
    };

    const handleRemove = async (connectionId) => {
        if (!window.confirm('Remove this friend?')) return;

        try {
            await axios.delete(`${API_BASE_URL}/users/connections/${connectionId}/remove/`, {
                withCredentials: true
            });
            setSuccess('Friend removed');
            setTimeout(() => setSuccess(''), 3000);
            fetchFriends();
        } catch (err) {
            setError('Failed to remove friend');
        }
    };

    if (loading) {
        return <div className="friends-loading">Loading...</div>;
    }

    return (
        <div className="friends-page-container">
            <h1>👥 Friends</h1>

            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            {/* Search Section */}
            <div className="search-section">
                <h2>🔍 Find Friends</h2>
                <div className="search-bar">
                    <input
                        type="text"
                        placeholder="Search by username..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    <button onClick={handleSearch}>Search</button>
                </div>

                {searchResults.length > 0 && (
                    <div className="search-results">
                        {searchResults.map((user) => (
                            <div key={user.id} className="user-result">
                                <Link to={`/profile/${user.id}`} className="user-name">
                                    {user.first_name} (@{user.username})
                                </Link>
                                {user.connection_status.status === 'none' && (
                                    <button onClick={() => handleSendRequest(user.id)} className="btn-add">
                                        Add Friend
                                    </button>
                                )}
                                {user.connection_status.status === 'pending' && user.connection_status.direction === 'sent' && (
                                    <span className="status-badge">Request Sent</span>
                                )}
                                {user.connection_status.status === 'accepted' && (
                                    <span className="status-badge friends">Friends</span>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Pending Requests */}
            {pendingRequests.length > 0 && (
                <div className="pending-section">
                    <h2>📬 Pending Requests ({pendingRequests.length})</h2>
                    <div className="requests-list">
                        {pendingRequests.map((request) => (
                            <div key={request.id} className="request-item">
                                <Link to={`/profile/${request.user_id}`} className="requester-name">
                                    {request.user_name}
                                </Link>
                                <div className="request-actions">
                                    <button onClick={() => handleAccept(request.id)} className="btn-accept">
                                        Accept
                                    </button>
                                    <button onClick={() => handleReject(request.id)} className="btn-reject">
                                        Reject
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Friends List */}
            <div className="friends-section">
                <h2>✨ My Friends ({friends.length})</h2>
                {friends.length === 0 ? (
                    <p className="no-friends">No friends yet. Search for users above to add friends!</p>
                ) : (
                    <div className="friends-list">
                        {friends.map((friend) => (
                            <div key={friend.id} className="friend-item">
                                <Link to={`/profile/${friend.id}`} className="friend-name">
                                    {friend.first_name} (@{friend.username})
                                </Link>
                                <div className="friend-actions">
                                    <Link to={`/chat/${friend.id}`} className="btn-message">
                                        💬 Message
                                    </Link>
                                    <button onClick={() => handleRemove(friend.connection_id)} className="btn-remove">
                                        Remove
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default FriendsPage;

import React, { useState, useEffect } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { logoutUser } from '../../services/api';
import axios from 'axios';
import './Navbar.css';

const Navbar = () => {
    const history = useHistory();
    const { user, logout } = useAuth();
    const [profileData, setProfileData] = useState(null);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        if (user) {
            fetchProfileData();
            fetchUnreadCount();
            // Poll for unread messages every 10 seconds
            const interval = setInterval(fetchUnreadCount, 10000);
            return () => clearInterval(interval);
        }
    }, [user]);

    const fetchProfileData = async () => {
        try {
            const response = await axios.get('http://localhost:8000/api/users/profile/', {
                withCredentials: true
            });
            setProfileData(response.data);
        } catch (error) {
            console.error('Error fetching profile:', error);
        }
    };

    const fetchUnreadCount = async () => {
        try {
            const response = await axios.get('http://localhost:8000/api/chat/private/conversations/', {
                withCredentials: true
            });
            const total = response.data.reduce((sum, conv) => sum + conv.unread_count, 0);
            setUnreadCount(total);
        } catch (error) {
            console.error('Error fetching unread count:', error);
        }
    };

    const handleLogout = async () => {
        try {
            await logoutUser();
            logout();
            history.push('/login');
        } catch (error) {
            console.error('Logout failed:', error);
            logout();
            history.push('/login');
        }
    };

    const getProfileImage = () => {
        if (profileData?.primary_photo_url) {
            return profileData.primary_photo_url;
        }
        // Default avatar if no photo
        return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Ccircle cx="50" cy="50" r="50" fill="%23667eea"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="white" font-size="40" font-weight="bold"%3E' + (user?.first_name?.[0] || 'U') + '%3C/text%3E%3C/svg%3E';
    };

    const completionPercentage = profileData?.completion_percentage || 0;

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <Link to="/" className="navbar-logo">
                    🍺 PourPal
                </Link>

                <div className="navbar-menu">
                    {user ? (
                        <>
                            <Link to="/hangouts" className="navbar-link">
                                Hangouts
                            </Link>
                            <Link to="/friends" className="navbar-link">
                                Friends
                            </Link>
                            <Link to="/messages" className="navbar-link">
                                Messages
                                {unreadCount > 0 && <span className="unread-badge">{unreadCount}</span>}
                            </Link>
                            <Link to="/create-hangout" className="navbar-link">
                                Create Hangout
                            </Link>
                            <button onClick={handleLogout} className="navbar-button">
                                Logout
                            </button>
                            <Link to="/privacy-policy" className="navbar-link navbar-link-small">
                                Privacy
                            </Link>

                            {/* Profile Picture with Progress Ring */}
                            <Link to="/profile" className="profile-avatar-container">
                                <svg className="progress-ring" width="50" height="50">
                                    {/* Background circle */}
                                    <circle
                                        cx="25"
                                        cy="25"
                                        r="22"
                                        fill="none"
                                        stroke="rgba(255, 255, 255, 0.1)"
                                        strokeWidth="3"
                                    />
                                    {/* Progress circle */}
                                    <circle
                                        cx="25"
                                        cy="25"
                                        r="22"
                                        fill="none"
                                        stroke="url(#gradient)"
                                        strokeWidth="3"
                                        strokeLinecap="round"
                                        strokeDasharray={`${2 * Math.PI * 22}`}
                                        strokeDashoffset={`${2 * Math.PI * 22 * (1 - completionPercentage / 100)}`}
                                        transform="rotate(-90 25 25)"
                                        className="progress-circle"
                                    />
                                    <defs>
                                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" stopColor="#667eea" />
                                            <stop offset="100%" stopColor="#764ba2" />
                                        </linearGradient>
                                    </defs>
                                </svg>
                                <img
                                    src={getProfileImage()}
                                    alt="Profile"
                                    className="profile-avatar-img"
                                />
                            </Link>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="navbar-link">
                                Login
                            </Link>
                            <Link to="/register" className="navbar-link navbar-link-highlight">
                                Register
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;

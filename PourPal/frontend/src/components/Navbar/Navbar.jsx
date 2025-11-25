import React from 'react';
import { Link, useHistory } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { logoutUser } from '../../services/api';
import './Navbar.css';

const Navbar = () => {
    const history = useHistory();
    const { user, logout } = useAuth();

    const handleLogout = async () => {
        try {
            await logoutUser();
            logout();
            history.push('/login');
        } catch (error) {
            console.error('Logout failed:', error);
            // Still logout and redirect
            logout();
            history.push('/login');
        }
    };

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
                            <Link to="/create-hangout" className="navbar-link">
                                Create Hangout
                            </Link>
                            <Link to="/profile" className="navbar-link">
                                Profile
                            </Link>
                            <button onClick={handleLogout} className="navbar-button">
                                Logout
                            </button>
                            <span className="navbar-user">
                                👋 {user.first_name || user.username}
                            </span>
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

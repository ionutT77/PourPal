import React from 'react';
import { Link, useHistory } from 'react-router-dom';
import { logoutUser } from '../../services/api';
import './Navbar.css';

const Navbar = () => {
    const history = useHistory();
    const user = JSON.parse(localStorage.getItem('user') || 'null');

    const handleLogout = async () => {
        try {
            await logoutUser();
            localStorage.removeItem('user');
            history.push('/login');
        } catch (error) {
            console.error('Logout failed:', error);
            // Still remove user from localStorage and redirect
            localStorage.removeItem('user');
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

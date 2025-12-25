import React from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
    return (
        <div className="landing-page">
            <div className="landing-hero">
                <div className="hero-content">
                    <div className="logo-large">🍺</div>
                    <h1 className="hero-title">Welcome to PourPal</h1>
                    <p className="hero-subtitle">
                        Connect with friends, discover new hangouts, and make every moment memorable
                    </p>
                    <p className="hero-description">
                        PourPal helps you organize and join social hangouts with ease.
                        Whether it's grabbing drinks, exploring new venues, or catching up with friends,
                        we've got you covered.
                    </p>

                    <div className="hero-buttons">
                        <Link to="/register" className="btn-hero btn-primary">
                            Get Started
                        </Link>
                        <Link to="/login" className="btn-hero btn-secondary">
                            Sign In
                        </Link>
                    </div>
                </div>

                <div className="features-grid">
                    <div className="feature-card">
                        <div className="feature-icon">🎯</div>
                        <h3>Discover Hangouts</h3>
                        <p>Find exciting events and gatherings near you</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">👥</div>
                        <h3>Connect with Friends</h3>
                        <p>Build your social network and stay connected</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">📸</div>
                        <h3>Share Memories</h3>
                        <p>Capture and share your favorite moments</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">💬</div>
                        <h3>Group Chat</h3>
                        <p>Coordinate plans with real-time messaging</p>
                    </div>
                </div>
            </div>

            <footer className="landing-footer">
                <p>&copy; 2025 PourPal. All rights reserved.</p>
                <Link to="/privacy-policy" className="footer-link">Privacy Policy</Link>
            </footer>
        </div>
    );
};

export default LandingPage;

import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { registerUser } from '../../services/api';
import './Auth.css';

const Register = () => {
    const history = useHistory();
    const [formData, setFormData] = useState({
        email: '',
        username: '',
        first_name: '',
        password: '',
        password_confirm: '',
        is_18_plus: false,
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setFormData({ ...formData, [e.target.name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await registerUser(formData);
            console.log('Registration successful:', response.data);
            alert('Registration successful! Please login.');
            history.push('/login');
        } catch (err) {
            console.error('Registration failed:', err);

            // Handle different error formats
            if (err.response?.data) {
                const errors = err.response.data;
                let errorMessages = [];

                // Collect all error messages
                Object.keys(errors).forEach(key => {
                    if (Array.isArray(errors[key])) {
                        errorMessages.push(...errors[key]);
                    } else if (typeof errors[key] === 'string') {
                        errorMessages.push(errors[key]);
                    } else if (typeof errors[key] === 'object') {
                        // Handle nested errors
                        Object.values(errors[key]).forEach(val => {
                            if (Array.isArray(val)) {
                                errorMessages.push(...val);
                            } else {
                                errorMessages.push(val);
                            }
                        });
                    }
                });

                setError(errorMessages.join(' ') || 'Registration failed. Please try again.');
            } else {
                setError('Registration failed. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2>Join PourPal</h2>
                <p className="auth-subtitle">Connect with friends over drinks!</p>

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="you@example.com"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="username">Username</label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            placeholder="Choose a username"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="first_name">First Name</label>
                        <input
                            type="text"
                            id="first_name"
                            name="first_name"
                            value={formData.first_name}
                            onChange={handleChange}
                            placeholder="Your first name"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Min. 8 characters"
                            minLength="8"
                            required
                        />
                        <small className="form-hint">
                            Must contain: 1 uppercase, 1 number, 1 special character
                        </small>
                    </div>

                    <div className="form-group">
                        <label htmlFor="password_confirm">Confirm Password</label>
                        <input
                            type="password"
                            id="password_confirm"
                            name="password_confirm"
                            value={formData.password_confirm}
                            onChange={handleChange}
                            placeholder="Re-enter password"
                            minLength="8"
                            required
                        />
                    </div>

                    <div className="checkbox-group">
                        <input
                            type="checkbox"
                            id="is_18_plus"
                            name="is_18_plus"
                            checked={formData.is_18_plus}
                            onChange={handleChange}
                            required
                        />
                        <label htmlFor="is_18_plus">I confirm I am 18 years or older</label>
                    </div>

                    <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? 'Creating Account...' : 'Register'}
                    </button>
                </form>

                <p className="auth-footer">
                    Already have an account? <a href="/login">Login here</a>
                </p>
            </div>
        </div>
    );
};

export default Register;
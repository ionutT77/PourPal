import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import LocationAutocomplete from './LocationAutocomplete';
import './CreateHangout.css';

const CreateHangout = () => {
    const history = useHistory();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [friends, setFriends] = useState([]);
    const [selectedFriends, setSelectedFriends] = useState([]);

    const [formData, setFormData] = useState({
        title: '',
        venue_location: '',
        latitude: null,
        longitude: null,
        date_time: '',
        max_group_size: 3,
        description: '',
        category: 'other'
    });

    useEffect(() => {
        fetchFriends();
    }, []);

    const fetchFriends = async () => {
        try {
            const response = await axios.get('http://localhost:8000/api/users/connections/friends/', {
                withCredentials: true
            });
            setFriends(response.data);
        } catch (err) {
            console.error('Error fetching friends:', err);
        }
    };

    const handleFriendToggle = (friendId) => {
        setSelectedFriends(prev =>
            prev.includes(friendId)
                ? prev.filter(id => id !== friendId)
                : [...prev, friendId]
        );
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleLocationSelect = (locationData) => {
        setFormData(prev => ({
            ...prev,
            venue_location: locationData.venue_location,
            latitude: locationData.latitude,
            longitude: locationData.longitude
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Build hangout data with only valid model fields
            const hangoutData = {
                title: formData.title,
                venue_location: formData.venue_location,
                date_time: new Date(formData.date_time).toISOString(),
                max_group_size: formData.max_group_size,
                description: formData.description,
                category: formData.category
            };

            // Only include lat/lon if they exist, and round to 6 decimal places to match backend
            if (formData.latitude) {
                hangoutData.latitude = Number(Number(formData.latitude).toFixed(6));
            }
            if (formData.longitude) {
                hangoutData.longitude = Number(Number(formData.longitude).toFixed(6));
            }

            // Add invited_friends (handled separately in backend)
            if (selectedFriends.length > 0) {
                hangoutData.invited_friends = selectedFriends;
            }

            const response = await axios.post(
                'http://localhost:8000/api/hangouts/',
                hangoutData,
                { withCredentials: true }
            );

            console.log('Hangout created:', response.data);
            setSuccess('Hangout created successfully!');

            // Reset form
            setFormData({
                title: '',
                venue_location: '',
                latitude: null,
                longitude: null,
                date_time: '',
                max_group_size: 3,
                description: '',
                category: 'other'
            });
            setSelectedFriends([]);

            // Redirect to hangouts list after 2 seconds
            setTimeout(() => {
                history.push('/hangouts');
            }, 2000);

        } catch (err) {
            console.error('Error creating hangout:', err);
            setError(err.response?.data?.detail || 'Failed to create hangout. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Get minimum date/time (current time)
    const getMinDateTime = () => {
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        return now.toISOString().slice(0, 16);
    };

    return (
        <div className="create-hangout-container">
            <div className="create-hangout-card">
                <div className="card-header">
                    <h1>🎉 Create a Hangout</h1>
                    <p className="subtitle">Plan your next social gathering</p>
                </div>

                {error && <div className="error-banner">{error}</div>}
                {success && <div className="success-banner">{success}</div>}

                <form onSubmit={handleSubmit} className="hangout-form">
                    {/* Title */}
                    <div className="form-section">
                        <label htmlFor="title">
                            <span className="label-icon">📝</span>
                            Hangout Title
                        </label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="e.g., Coffee & Chat, Weekend Brunch, Game Night"
                            required
                        />
                    </div>

                    {/* Venue */}
                    <div className="form-section">
                        <label htmlFor="venue_location">
                            <span className="label-icon">📍</span>
                            Venue / Location
                        </label>
                        <LocationAutocomplete
                            value={formData.venue_location}
                            onChange={(value) => setFormData(prev => ({ ...prev, venue_location: value }))}
                            onLocationSelect={handleLocationSelect}
                        />
                    </div>

                    {/* Date & Time and Group Size Grid */}
                    <div className="form-grid">
                        <div className="form-section">
                            <label htmlFor="date_time">
                                <span className="label-icon">📅</span>
                                Date & Time
                            </label>
                            <input
                                type="datetime-local"
                                id="date_time"
                                name="date_time"
                                value={formData.date_time}
                                onChange={handleChange}
                                min={getMinDateTime()}
                                required
                            />
                        </div>

                        <div className="form-section">
                            <label htmlFor="max_group_size">
                                <span className="label-icon">👥</span>
                                Max Group Size
                            </label>
                            <select
                                id="max_group_size"
                                name="max_group_size"
                                value={formData.max_group_size}
                                onChange={handleChange}
                                required
                            >
                                <option value={2}>2 people</option>
                                <option value={3}>3 people</option>
                                <option value={4}>4 people</option>
                                <option value={5}>5 people</option>
                                <option value={6}>6 people</option>
                                <option value={8}>8 people</option>
                                <option value={10}>10 people</option>
                            </select>
                        </div>
                    </div>

                    {/* Category */}
                    <div className="form-section">
                        <label htmlFor="category">
                            <span className="label-icon">🏷️</span>
                            Category
                        </label>
                        <select
                            id="category"
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            required
                        >
                            <option value="drinks">🍻 Drinks & Bar</option>
                            <option value="food">🍕 Food & Dining</option>
                            <option value="sports">⚽ Sports & Fitness</option>
                            <option value="arts">🎨 Arts & Culture</option>
                            <option value="music">🎵 Music & Concerts</option>
                            <option value="outdoor">🏕️ Outdoor Activities</option>
                            <option value="gaming">🎮 Gaming</option>
                            <option value="other">📌 Other</option>
                        </select>
                    </div>

                    {/* Invite Friends */}
                    {friends.length > 0 && (
                        <div className="form-section">
                            <label>
                                <span className="label-icon">👥</span>
                                Invite Friends (Optional)
                            </label>
                            <div className="friends-selector">
                                {friends.map(friend => (
                                    <div
                                        key={friend.id}
                                        className={`friend-chip ${selectedFriends.includes(friend.id) ? 'selected' : ''}`}
                                        onClick={() => handleFriendToggle(friend.id)}
                                    >
                                        <span>{friend.first_name}</span>
                                        {selectedFriends.includes(friend.id) && <span className="check-icon">✓</span>}
                                    </div>
                                ))}
                            </div>
                            {selectedFriends.length > 0 && (
                                <small className="friend-count">
                                    {selectedFriends.length} friend{selectedFriends.length > 1 ? 's' : ''} selected
                                </small>
                            )}
                        </div>
                    )}

                    {/* Description */}
                    <div className="form-section">
                        <label htmlFor="description">
                            <span className="label-icon">💬</span>
                            Description
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Tell people what this hangout is about, what to expect, dress code, etc..."
                            rows="5"
                            required
                        />
                        <small className="char-count">
                            {formData.description.length} characters
                        </small>
                    </div>

                    {/* Info Box */}
                    <div className="info-box">
                        <div className="info-icon">ℹ️</div>
                        <div className="info-content">
                            <strong>Good to know:</strong>
                            <ul>
                                <li>Your hangout will automatically end after 3 days</li>
                                <li>You can manually end it anytime</li>
                                <li>After it ends, participants can add photos to create memories</li>
                            </ul>
                        </div>
                    </div>

                    {/* Preview Card */}
                    {formData.title && (
                        <div className="preview-section">
                            <h3>Preview</h3>
                            <div className="hangout-preview-card">
                                <div className="preview-header">
                                    <h4>{formData.title}</h4>
                                    <span className="preview-badge">
                                        {formData.max_group_size} max
                                    </span>
                                </div>
                                <div className="preview-details">
                                    {formData.venue_location && (
                                        <div className="preview-item">
                                            <span className="preview-icon">📍</span>
                                            {formData.venue_location}
                                        </div>
                                    )}
                                    {formData.date_time && (
                                        <div className="preview-item">
                                            <span className="preview-icon">📅</span>
                                            {new Date(formData.date_time).toLocaleString()}
                                        </div>
                                    )}
                                </div>
                                {formData.description && (
                                    <p className="preview-description">
                                        {formData.description}
                                    </p>
                                )}
                                <div className="preview-creator">
                                    <span className="creator-badge">
                                        Created by {user?.first_name || 'You'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Submit Buttons */}
                    <div className="form-actions">
                        <button
                            type="submit"
                            className="submit-btn"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="spinner"></span>
                                    Creating...
                                </>
                            ) : (
                                <>
                                    🚀 Create Hangout
                                </>
                            )}
                        </button>
                        <button
                            type="button"
                            className="cancel-btn"
                            onClick={() => history.push('/hangouts')}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateHangout;
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { getHangouts, API_BASE_URL } from '../../services/api';
import './HangoutList.css';
import HangoutFilters from './HangoutFilters';

const CATEGORIES = [
    { value: 'all', label: 'All Categories', icon: '🌟' },
    { value: 'drinks', label: 'Drinks & Bar', icon: '🍻' },
    { value: 'food', label: 'Food & Dining', icon: '🍕' },
    { value: 'sports', label: 'Sports & Fitness', icon: '⚽' },
    { value: 'arts', label: 'Arts & Culture', icon: '🎨' },
    { value: 'music', label: 'Music & Concerts', icon: '🎵' },
    { value: 'outdoor', label: 'Outdoor Activities', icon: '🏕️' },
    { value: 'gaming', label: 'Gaming', icon: '🎮' },
    { value: 'other', label: 'Other', icon: '📌' },
];

const HangoutList = () => {
    const [hangouts, setHangouts] = useState([]);
    const [filteredHangouts, setFilteredHangouts] = useState([]);
    const [recommendedHangouts, setRecommendedHangouts] = useState([]);
    const [recommendationMessage, setRecommendationMessage] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeFilters, setActiveFilters] = useState({});

    const fetchHangouts = async (filters = {}) => {
        setLoading(true);
        try {
            // Combine category filter with advanced filters
            const params = { ...filters };
            if (selectedCategory !== 'all') {
                params.category = selectedCategory;
            }

            const [hangoutsRes, recommendedRes] = await Promise.all([
                getHangouts(params),
                axios.get(`${API_BASE_URL}/hangouts/recommended/`, { withCredentials: true })
            ]);

            setHangouts(hangoutsRes.data);
            setFilteredHangouts(hangoutsRes.data);
            setRecommendedHangouts(recommendedRes.data.recommended || []);
            setRecommendationMessage(recommendedRes.data.message || '');
        } catch (err) {
            console.error("Error fetching data:", err);
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHangouts(activeFilters);
    }, [selectedCategory]); // Re-fetch when category changes

    const handleFilterChange = (newFilters) => {
        setActiveFilters(newFilters);
        fetchHangouts(newFilters);
    };

    const getCategoryInfo = (categoryValue) => {
        return CATEGORIES.find(c => c.value === categoryValue) || CATEGORIES[CATEGORIES.length - 1];
    };

    if (loading && !hangouts.length) {
        return (
            <div className="hangouts-container">
                <div className="hangouts-header">
                    <h1>Loading hangouts...</h1>
                </div>
            </div>
        );
    }

    return (
        <div className="hangouts-container">
            <div className="hangouts-header">
                <h1>🍻 Upcoming Hangouts</h1>
                <p>Find and join exciting hangouts in your area</p>
            </div>

            {/* Advanced Filters */}
            <HangoutFilters onFilterChange={handleFilterChange} initialFilters={activeFilters} />

            {/* Recommended Section */}
            {(recommendedHangouts.length > 0 || recommendationMessage) && (
                <div className="recommended-section">
                    <div className="section-header">
                        <h2>✨ Recommended for You</h2>
                        <p>Based on your hobbies</p>
                    </div>

                    {recommendedHangouts.length > 0 ? (
                        <div className="recommended-grid">
                            {recommendedHangouts.map(hangout => {
                                const categoryInfo = getCategoryInfo(hangout.category);
                                return (
                                    <Link
                                        key={hangout.id}
                                        to={`/hangouts/${hangout.id}`}
                                        className={`hangout-card recommended-card ${hangout.is_user_participant ? 'joined' : ''}`}
                                    >
                                        <div className="recommended-badge">Recommended</div>
                                        <div className="hangout-card-header">
                                            <h3>{hangout.title}</h3>
                                            <div className="badges">
                                                <span className="category-badge">
                                                    {categoryInfo.icon} {categoryInfo.label}
                                                </span>
                                                {hangout.is_user_participant && (
                                                    <span className="joined-badge">Joined</span>
                                                )}
                                            </div>
                                        </div>
                                        <p>{hangout.description}</p>
                                        <div className="hangout-info">
                                            <div className="hangout-info-item">
                                                <span>📅</span>
                                                <span>{new Date(hangout.date_time).toLocaleDateString()}</span>
                                            </div>
                                            <div className="hangout-info-item">
                                                <span>📍</span>
                                                <span>{hangout.venue_location}</span>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="no-recommendations">
                            <p>{recommendationMessage || "No matches found yet. Try adding more hobbies!"}</p>
                            <Link to="/profile" className="add-hobbies-btn">Update Profile</Link>
                        </div>
                    )}
                </div>
            )}

            {/* Category Filter */}
            <div className="category-filter">
                {CATEGORIES.map((category) => (
                    <button
                        key={category.value}
                        className={`category-btn ${selectedCategory === category.value ? 'active' : ''}`}
                        onClick={() => setSelectedCategory(category.value)}
                    >
                        <span className="category-icon">{category.icon}</span>
                        <span className="category-label">{category.label}</span>
                    </button>
                ))}
            </div>

            {error && (
                <div className="error-message">
                    Error loading hangouts: {error.message}
                </div>
            )}

            {filteredHangouts.length === 0 ? (
                <div className="no-hangouts">
                    <h2>No hangouts available</h2>
                    <p>Try adjusting your filters or create a new hangout!</p>
                </div>
            ) : (
                <div className="hangouts-grid">
                    {filteredHangouts.map(hangout => {
                        const categoryInfo = getCategoryInfo(hangout.category);
                        return (
                            <Link
                                key={hangout.id}
                                to={`/hangouts/${hangout.id}`}
                                className={`hangout-card ${hangout.is_ended ? 'ended' : ''} ${hangout.is_user_participant ? 'joined' : ''}`}
                            >
                                <div className="hangout-card-header">
                                    <h3>{hangout.title}</h3>
                                    <div className="badges">
                                        <span className="category-badge">
                                            {categoryInfo.icon} {categoryInfo.label}
                                        </span>
                                        {hangout.is_user_participant && (
                                            <span className="joined-badge">Joined</span>
                                        )}
                                        {hangout.is_ended && (
                                            <span className="ended-badge-small">Ended</span>
                                        )}
                                        {hangout.is_full && !hangout.is_ended && (
                                            <span className="full-badge">Full</span>
                                        )}
                                    </div>
                                </div>
                                <p>{hangout.description}</p>

                                <div className="hangout-info">
                                    <div className="hangout-info-item">
                                        <span>📅</span>
                                        <span>{new Date(hangout.date_time).toLocaleString()}</span>
                                    </div>
                                    <div className="hangout-info-item">
                                        <span>📍</span>
                                        <span>{hangout.venue_location}</span>
                                    </div>
                                    <div className="hangout-info-item">
                                        <span>👥</span>
                                        <span>
                                            <strong>{hangout.participant_count}</strong> / {hangout.max_group_size} participants
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default HangoutList;
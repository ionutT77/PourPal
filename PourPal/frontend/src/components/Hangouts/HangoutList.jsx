import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getHangouts } from '../../services/api';
import './HangoutList.css';

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
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchHangouts = async () => {
            try {
                const response = await getHangouts();
                setHangouts(response.data);
                setFilteredHangouts(response.data);
            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchHangouts();
    }, []);

    useEffect(() => {
        if (selectedCategory === 'all') {
            setFilteredHangouts(hangouts);
        } else {
            setFilteredHangouts(hangouts.filter(h => h.category === selectedCategory));
        }
    }, [selectedCategory, hangouts]);

    const getCategoryInfo = (categoryValue) => {
        return CATEGORIES.find(c => c.value === categoryValue) || CATEGORIES[CATEGORIES.length - 1];
    };

    if (loading) {
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
                    <p>{selectedCategory === 'all' ? 'Be the first to create one!' : `No ${getCategoryInfo(selectedCategory).label.toLowerCase()} hangouts yet`}</p>
                </div>
            ) : (
                <div className="hangouts-grid">
                    {filteredHangouts.map(hangout => {
                        const categoryInfo = getCategoryInfo(hangout.category);
                        return (
                            <Link
                                key={hangout.id}
                                to={`/hangouts/${hangout.id}`}
                                className={`hangout-card ${hangout.is_ended ? 'ended' : ''}`}
                            >
                                <div className="hangout-card-header">
                                    <h3>{hangout.title}</h3>
                                    <div className="badges">
                                        <span className="category-badge">
                                            {categoryInfo.icon} {categoryInfo.label}
                                        </span>
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
import React, { useEffect, useState } from 'react';
import { getHangouts } from '../../services/api';
import './HangoutList.css';

const HangoutList = () => {
    const [hangouts, setHangouts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchHangouts = async () => {
            try {
                const response = await getHangouts();
                setHangouts(response.data);
            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchHangouts();
    }, []);

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

            {error && (
                <div className="error-message">
                    Error loading hangouts: {error.message}
                </div>
            )}

            {hangouts.length === 0 ? (
                <div className="no-hangouts">
                    <h2>No hangouts available yet</h2>
                    <p>Be the first to create one!</p>
                </div>
            ) : (
                <div className="hangouts-grid">
                    {hangouts.map(hangout => (
                        <div key={hangout.id} className="hangout-card">
                            <h3>{hangout.title}</h3>
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
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default HangoutList;
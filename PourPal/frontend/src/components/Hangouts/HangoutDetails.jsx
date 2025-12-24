import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import HangoutMemoryUpload from './HangoutMemoryUpload';
import GroupChat from '../Chat/GroupChat';
import './HangoutDetails.css';

const HangoutDetails = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const [hangout, setHangout] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchHangoutDetails();
    }, [id]);

    const fetchHangoutDetails = async () => {
        try {
            const response = await axios.get(
                `http://localhost:8000/api/hangouts/${id}/`,
                { withCredentials: true }
            );
            setHangout(response.data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching hangout details:', err);
            setError('Failed to load hangout details');
            setLoading(false);
        }
    };

    const handleJoin = async () => {
        try {
            await axios.post(
                `http://localhost:8000/api/hangouts/${id}/join/`,
                {},
                { withCredentials: true }
            );
            setSuccess('Successfully joined hangout!');
            setTimeout(() => setSuccess(''), 3000);
            fetchHangoutDetails();
        } catch (err) {
            console.error('Error joining hangout:', err);
            setError(err.response?.data?.error || 'Failed to join hangout');
        }
    };

    const handleLeave = async () => {
        if (!window.confirm('Are you sure you want to leave this hangout?')) {
            return;
        }

        try {
            await axios.post(
                `http://localhost:8000/api/hangouts/${id}/leave/`,
                {},
                { withCredentials: true }
            );
            setSuccess('Successfully left hangout');
            setTimeout(() => setSuccess(''), 3000);
            fetchHangoutDetails();
        } catch (err) {
            console.error('Error leaving hangout:', err);
            setError(err.response?.data?.error || 'Failed to leave hangout');
        }
    };

    const handleEndHangout = async () => {
        if (!window.confirm('Are you sure you want to end this hangout? This action cannot be undone.')) {
            return;
        }

        try {
            await axios.post(
                `http://localhost:8000/api/hangouts/${id}/end/`,
                {},
                { withCredentials: true }
            );
            setSuccess('Hangout ended successfully!');
            setTimeout(() => setSuccess(''), 3000);
            fetchHangoutDetails();
        } catch (err) {
            console.error('Error ending hangout:', err);
            setError(err.response?.data?.error || 'Failed to end hangout');
        }
    };

    if (loading) {
        return <div className="hangout-details-loading">Loading hangout details...</div>;
    }

    if (error && !hangout) {
        return <div className="hangout-details-error">{error}</div>;
    }

    const isParticipant = hangout?.participants?.some(p => p.id === user?.id);
    const isCreator = hangout?.creator?.id === user?.id;
    const isFull = hangout?.participant_count >= hangout?.max_group_size;

    return (
        <div className="hangout-details-container">
            <div className="hangout-details-header">
                <Link to="/hangouts" className="back-link">← Back to Hangouts</Link>
                <h1>{hangout.title}</h1>
                {hangout.is_ended && (
                    <span className="ended-badge">Ended</span>
                )}
            </div>

            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            <div className="hangout-details-content">
                {/* Main Info Card */}
                <div className="info-card">
                    <div className="info-row">
                        <span className="info-icon">📍</span>
                        <div>
                            <label>Venue</label>
                            <p>{hangout.venue_location}</p>
                        </div>
                    </div>

                    <div className="info-row">
                        <span className="info-icon">📅</span>
                        <div>
                            <label>Date & Time</label>
                            <p>{new Date(hangout.date_time).toLocaleString()}</p>
                        </div>
                    </div>

                    <div className="info-row">
                        <span className="info-icon">👥</span>
                        <div>
                            <label>Group Size</label>
                            <p>{hangout.participant_count} / {hangout.max_group_size}</p>
                        </div>
                    </div>

                    <div className="info-row">
                        <span className="info-icon">✍️</span>
                        <div>
                            <label>Description</label>
                            <p>{hangout.description}</p>
                        </div>
                    </div>

                    <div className="info-row">
                        <span className="info-icon">👤</span>
                        <div>
                            <label>Organized by</label>
                            <p>{hangout.creator.first_name}</p>
                        </div>
                    </div>
                </div>

                {/* Participants Card */}
                <div className="participants-card">
                    <h3>👥 Participants ({hangout.participant_count})</h3>
                    <div className="participants-list">
                        {hangout.participants.map((participant) => (
                            <div key={participant.id} className="participant-item">
                                {participant.id === user?.id ? (
                                    <span className="participant-name">
                                        {participant.first_name} (You)
                                        {participant.id === hangout.creator.id && (
                                            <span className="creator-badge">Creator</span>
                                        )}
                                    </span>
                                ) : (
                                    <Link
                                        to={`/profile/${participant.id}`}
                                        className="participant-name participant-link"
                                    >
                                        {participant.first_name}
                                        {participant.id === hangout.creator.id && (
                                            <span className="creator-badge">Creator</span>
                                        )}
                                    </Link>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Action Buttons */}
                {!hangout.is_ended && user && (
                    <div className="action-buttons">
                        {!isParticipant ? (
                            <button
                                className="join-btn"
                                onClick={handleJoin}
                                disabled={isFull}
                            >
                                {isFull ? '🔒 Hangout Full' : '✓ Count Me In!'}
                            </button>
                        ) : !isCreator ? (
                            <button
                                className="leave-btn"
                                onClick={handleLeave}
                            >
                                Leave Hangout
                            </button>
                        ) : (
                            <button
                                className="end-btn"
                                onClick={handleEndHangout}
                            >
                                🏁 End Hangout
                            </button>
                        )}
                    </div>
                )}

                {/* Memory Upload Section - Show for ended hangouts or participants */}
                {(hangout.is_ended || isParticipant) && (
                    <HangoutMemoryUpload
                        hangoutId={id}
                        isParticipant={isParticipant}
                    />
                )}

                {/* Group Chat - Show for participants only */}
                {isParticipant && !hangout.is_ended && (
                    <GroupChat hangoutId={id} />
                )}
            </div>
        </div>
    );
};

export default HangoutDetails;
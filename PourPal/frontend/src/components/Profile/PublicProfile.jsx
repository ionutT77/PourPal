import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import ReportButton from '../Report/ReportButton';
import ConnectionButton from '../Friends/ConnectionButton';
import './PublicProfile.css';
import { API_BASE_URL } from '../../services/api';

const PublicProfile = () => {
    const { userId } = useParams();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchPublicProfile();
    }, [userId]);

    const fetchPublicProfile = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/users/profile/${userId}/`, {
                withCredentials: true
            });
            setProfile(response.data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching public profile:', err);
            setError(err.response?.data?.error || 'Failed to load profile');
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="profile-loading">Loading profile...</div>;
    }

    if (error) {
        return <div className="profile-error">{error}</div>;
    }

    if (!profile) {
        return <div className="profile-error">Profile not found</div>;
    }

    return (
        <div className="public-profile-container">
            <div className="public-profile-header">
                <h1>👤 {profile.user_name}'s Profile</h1>
                <div className="header-actions">
                    <ConnectionButton
                        userId={profile.user_id}
                        userName={profile.user_name}
                    />
                    <ReportButton
                        userId={profile.user_id}
                        userName={profile.user_name}
                    />
                </div>
            </div>

            {/* Profile Photo */}
            {profile.primary_photo_url && (
                <div className="public-profile-photo">
                    <img src={profile.primary_photo_url} alt={`${profile.user_name}'s profile`} />
                </div>
            )}

            {/* Photo Gallery */}
            {profile.photos && profile.photos.length > 0 && (
                <div className="profile-section">
                    <h2>📸 Photos ({profile.photo_count})</h2>
                    <div className="photo-gallery">
                        {profile.photos.map((photo) => (
                            <div key={photo.id} className="gallery-photo">
                                <img src={photo.image_url} alt="Profile photo" />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Bio */}
            {profile.bio && (
                <div className="profile-section">
                    <h2>📝 About</h2>
                    <p className="bio-text">{profile.bio}</p>
                </div>
            )}

            {/* Age */}
            {profile.age && (
                <div className="profile-section">
                    <h2>🎂 Age</h2>
                    <p className="age-text">{profile.age} years old</p>
                </div>
            )}

            {/* Hobbies */}
            {profile.hobbies && profile.hobbies.length > 0 && (
                <div className="profile-section">
                    <h2>🎯 Hobbies</h2>
                    <div className="hobbies-list">
                        {profile.hobbies.map((hobby, index) => (
                            <span key={index} className="hobby-tag">{hobby}</span>
                        ))}
                    </div>
                </div>
            )}

            {/* Interests */}
            {profile.interests && profile.interests.length > 0 && (
                <div className="profile-section">
                    <h2>💡 Interests</h2>
                    <div className="interests-list">
                        {profile.interests.map((interest, index) => (
                            <span key={index} className="interest-tag">{interest}</span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default PublicProfile;

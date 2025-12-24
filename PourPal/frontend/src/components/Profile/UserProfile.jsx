import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import AgeVerification from './AgeVerification';
import './UserProfile.css';

const PREDEFINED_HOBBIES = [
    'Reading', 'Gaming', 'Cooking', 'Traveling', 'Photography',
    'Music', 'Sports', 'Hiking', 'Yoga', 'Dancing',
    'Painting', 'Writing', 'Gardening', 'Cycling', 'Swimming',
    'Movies', 'Theater', 'Crafts', 'Fitness', 'Meditation',
    'Board Games', 'Volunteering', 'Collecting', 'Fishing', 'Camping'
];

const UserProfile = () => {
    const { user } = useAuth();
    const [profile, setProfile] = useState(null);
    const [photos, setPhotos] = useState([]);
    const [hangouts, setHangouts] = useState({ upcoming: [], past: [] });
    const [activeHangoutTab, setActiveHangoutTab] = useState('upcoming');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [activePhotoIndex, setActivePhotoIndex] = useState(0);
    const [isEditing, setIsEditing] = useState(false);
    const [draggedPhotoIndex, setDraggedPhotoIndex] = useState(null);

    // Form state
    const [formData, setFormData] = useState({
        bio: '',
        age: '',
        interests: [],
        hobbies: [],
        favorite_drinks: [],
        favorite_food: '',
        instagram: '',
        twitter: '',
        facebook: '',
        linkedin: '',
        snapchat: ''
    });

    // Temporary inputs
    const [interestInput, setInterestInput] = useState('');
    const [drinkInput, setDrinkInput] = useState('');
    const [customHobby, setCustomHobby] = useState('');

    useEffect(() => {
        fetchProfile();
        fetchMyHangouts();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await axios.get('http://localhost:8000/api/users/profile/', {
                withCredentials: true
            });
            setProfile(response.data);
            setPhotos(response.data.photos || []);
            setFormData({
                bio: response.data.bio || '',
                age: response.data.age || '',
                interests: response.data.interests || [],
                hobbies: response.data.hobbies || [],
                favorite_drinks: response.data.favorite_drinks || [],
                favorite_food: response.data.favorite_food || '',
                instagram: response.data.instagram || '',
                twitter: response.data.twitter || '',
                facebook: response.data.facebook || '',
                linkedin: response.data.linkedin || '',
                snapchat: response.data.snapchat || ''
            });
            setLoading(false);
        } catch (err) {
            console.error('Error fetching profile:', err);
            setError('Failed to load profile');
            setLoading(false);
        }
    };

    const fetchMyHangouts = async () => {
        try {
            const response = await axios.get('http://localhost:8000/api/hangouts/my-hangouts/', {
                withCredentials: true
            });
            setHangouts({
                upcoming: response.data.upcoming || [],
                past: response.data.past || []
            });
        } catch (err) {
            console.error('Error fetching hangouts:', err);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePhotoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (photos.length >= 4) {
            setError('Maximum 4 photos allowed');
            return;
        }

        // Validate image dimensions
        const img = new Image();
        const objectUrl = URL.createObjectURL(file);

        img.onload = async () => {
            URL.revokeObjectURL(objectUrl);

            const aspectRatio = img.width / img.height;

            // Check if aspect ratio is too extreme (too tall or too wide)
            // Allow reasonable aspect ratios between 1:3 and 3:1
            if (aspectRatio < 0.33 || aspectRatio > 3) {
                setError('⚠️ Photo aspect ratio is too extreme. Please choose a photo with more balanced dimensions (not too tall or too wide).');
                setTimeout(() => setError(''), 5000);
                return;
            }

            const formDataObj = new FormData();
            formDataObj.append('image', file);
            formDataObj.append('order', photos.length);

            try {
                const response = await axios.post(
                    'http://localhost:8000/api/users/profile/photos/',
                    formDataObj,
                    {
                        withCredentials: true,
                        headers: { 'Content-Type': 'multipart/form-data' }
                    }
                );
                setPhotos([...photos, response.data]);
                setSuccess('Photo uploaded successfully!');
                setTimeout(() => setSuccess(''), 3000);
            } catch (err) {
                console.error('Error uploading photo:', err);
                setError('Failed to upload photo');
            }
        };

        img.onerror = () => {
            URL.revokeObjectURL(objectUrl);
            setError('Failed to load image. Please try another file.');
        };

        img.src = objectUrl;
    };

    const handleDeletePhoto = async (photoId) => {
        try {
            await axios.delete(`http://localhost:8000/api/users/profile/photos/${photoId}/`, {
                withCredentials: true
            });
            setPhotos(photos.filter(p => p.id !== photoId));
            setSuccess('Photo deleted successfully!');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            console.error('Error deleting photo:', err);
            setError('Failed to delete photo');
        }
    };

    // Drag and Drop Handlers
    const handleDragStart = (e, index) => {
        setDraggedPhotoIndex(index);
        e.dataTransfer.effectAllowed = 'move';
        // Optional: Set a custom drag image if needed
    };

    const handleDragOver = (e, index) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = async (e, dropIndex) => {
        e.preventDefault();
        if (draggedPhotoIndex === null || draggedPhotoIndex === dropIndex) return;

        const newPhotos = [...photos];
        const [draggedItem] = newPhotos.splice(draggedPhotoIndex, 1);
        newPhotos.splice(dropIndex, 0, draggedItem);

        setPhotos(newPhotos);
        setDraggedPhotoIndex(null);
        setActivePhotoIndex(dropIndex); // Update active photo to the dropped one

        // Update order in backend
        try {
            const photoIds = newPhotos.map(p => p.id);
            await axios.post(
                'http://localhost:8000/api/users/profile/photos/reorder/',
                { photo_ids: photoIds },
                { withCredentials: true }
            );
        } catch (err) {
            console.error('Error reordering photos:', err);
            setError('Failed to save photo order');
            // Revert on error (optional, but good UX)
            fetchProfile();
        }
    };

    const handleDragEnd = () => {
        setDraggedPhotoIndex(null);
    };

    const addInterest = () => {
        if (interestInput.trim() && !formData.interests.includes(interestInput.trim())) {
            setFormData(prev => ({
                ...prev,
                interests: [...prev.interests, interestInput.trim()]
            }));
            setInterestInput('');
        }
    };

    const removeInterest = (interest) => {
        setFormData(prev => ({
            ...prev,
            interests: prev.interests.filter(i => i !== interest)
        }));
    };

    const toggleHobby = (hobby) => {
        if (formData.hobbies.includes(hobby)) {
            setFormData(prev => ({
                ...prev,
                hobbies: prev.hobbies.filter(h => h !== hobby)
            }));
        } else {
            if (formData.hobbies.length < 3) {
                setFormData(prev => ({
                    ...prev,
                    hobbies: [...prev.hobbies, hobby]
                }));
            } else {
                setError('Maximum 3 hobbies allowed');
                setTimeout(() => setError(''), 3000);
            }
        }
    };

    const addCustomHobby = () => {
        if (customHobby.trim() && !formData.hobbies.includes(customHobby.trim())) {
            if (formData.hobbies.length < 3) {
                setFormData(prev => ({
                    ...prev,
                    hobbies: [...prev.hobbies, customHobby.trim()]
                }));
                setCustomHobby('');
            } else {
                setError('Maximum 3 hobbies allowed');
                setTimeout(() => setError(''), 3000);
            }
        }
    };

    const addDrink = () => {
        if (drinkInput.trim() && !formData.favorite_drinks.includes(drinkInput.trim())) {
            setFormData(prev => ({
                ...prev,
                favorite_drinks: [...prev.favorite_drinks, drinkInput.trim()]
            }));
            setDrinkInput('');
        }
    };

    const removeDrink = (drink) => {
        setFormData(prev => ({
            ...prev,
            favorite_drinks: prev.favorite_drinks.filter(d => d !== drink)
        }));
    };

    const handleSave = async () => {
        setSaving(true);
        setError('');

        try {
            await axios.put(
                'http://localhost:8000/api/users/profile/',
                formData,
                { withCredentials: true }
            );
            setSuccess('Profile updated successfully!');
            setIsEditing(false);
            setTimeout(() => setSuccess(''), 3000);
            fetchProfile();
        } catch (err) {
            console.error('Error updating profile:', err);
            setError(err.response?.data?.detail || 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="profile-loading">Loading profile...</div>;
    }

    return (
        <div className="profile-container">
            <div className="profile-header">
                <h1>👤 My Profile</h1>
                <button
                    className="edit-toggle-btn"
                    onClick={() => setIsEditing(!isEditing)}
                >
                    {isEditing ? '❌ Cancel' : '✏️ Edit Profile'}
                </button>
            </div>

            {/* Profile Completion Progress */}
            {profile && (
                <div className="completion-section">
                    <div className="completion-header">
                        <span className="completion-label">Profile Completion</span>
                        <span className="completion-percentage">{profile.completion_percentage}%</span>
                    </div>
                    <div className="progress-bar">
                        <div
                            className="progress-fill"
                            style={{ width: `${profile.completion_percentage}%` }}
                        ></div>
                    </div>
                    {profile.completion_percentage < 100 && (
                        <p className="completion-hint">
                            💡 Complete your profile to increase your chances of finding great hangouts!
                        </p>
                    )}
                </div>
            )}

            {error && <div className="error-banner">{error}</div>}
            {success && <div className="success-banner">{success}</div>}

            {/* Age Verification Section */}
            <AgeVerification />

            {/* Photo Section */}
            <div className="profile-section photo-section">
                <h2>📸 Photos ({photos.length}/4)</h2>
                <div className="photo-carousel">
                    {photos.length > 0 ? (
                        <>
                            <div className="main-photo">
                                <img
                                    src={photos[activePhotoIndex]?.image_url}
                                    alt={`Photo ${activePhotoIndex + 1}`}
                                />
                                {isEditing && (
                                    <button
                                        className="delete-photo-btn"
                                        onClick={() => handleDeletePhoto(photos[activePhotoIndex].id)}
                                    >
                                        🗑️ Delete
                                    </button>
                                )}
                            </div>
                            <div className="photo-thumbnails">
                                {photos.map((photo, index) => (
                                    <div
                                        key={photo.id}
                                        className={`thumbnail ${index === activePhotoIndex ? 'active' : ''} ${isEditing ? 'draggable' : ''}`}
                                        onClick={() => setActivePhotoIndex(index)}
                                        draggable={isEditing}
                                        onDragStart={(e) => handleDragStart(e, index)}
                                        onDragOver={(e) => handleDragOver(e, index)}
                                        onDrop={(e) => handleDrop(e, index)}
                                        onDragEnd={handleDragEnd}
                                        title={isEditing ? "Drag to reorder" : ""}
                                    >
                                        <img src={photo.image_url} alt={`Thumbnail ${index + 1}`} />
                                        {isEditing && (
                                            <button
                                                className="thumbnail-delete-btn"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeletePhoto(photo.id);
                                                }}
                                                title="Delete this photo"
                                            >
                                                ×
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="no-photos">No photos uploaded yet</div>
                    )}

                    {isEditing && photos.length < 4 && (
                        <div className="upload-section">
                            <label className="upload-btn">
                                📤 Upload Photo
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handlePhotoUpload}
                                    style={{ display: 'none' }}
                                />
                            </label>
                        </div>
                    )}
                </div>
            </div>

            {/* Basic Info */}
            <div className="profile-section">
                <h2>👤 Basic Info</h2>
                <div className="form-grid">
                    <div className="form-field">
                        <label>Name</label>
                        <input
                            type="text"
                            value={user?.first_name || ''}
                            disabled
                        />
                    </div>
                    <div className="form-field">
                        <label>Age</label>
                        <input
                            type="number"
                            name="age"
                            value={formData.age}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            min="18"
                            max="120"
                        />
                    </div>
                </div>
                <div className="form-field">
                    <label>Bio</label>
                    <textarea
                        name="bio"
                        value={formData.bio}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        placeholder="Tell us about yourself..."
                        rows="4"
                    />
                </div>
            </div>

            {/* Hobbies */}
            <div className="profile-section">
                <h2>🎯 Hobbies (Max 3)</h2>
                <div className="selected-items">
                    {formData.hobbies.map(hobby => (
                        <span key={hobby} className="tag hobby-tag">
                            {hobby}
                            {isEditing && (
                                <button onClick={() => toggleHobby(hobby)}>×</button>
                            )}
                        </span>
                    ))}
                </div>
                {isEditing && (
                    <>
                        <div className="hobby-grid">
                            {PREDEFINED_HOBBIES.map(hobby => (
                                <button
                                    key={hobby}
                                    className={`hobby-option ${formData.hobbies.includes(hobby) ? 'selected' : ''}`}
                                    onClick={() => toggleHobby(hobby)}
                                    disabled={!formData.hobbies.includes(hobby) && formData.hobbies.length >= 3}
                                >
                                    {hobby}
                                </button>
                            ))}
                        </div>
                        <div className="custom-hobby-input">
                            <input
                                type="text"
                                value={customHobby}
                                onChange={(e) => setCustomHobby(e.target.value)}
                                placeholder="Add custom hobby..."
                                onKeyPress={(e) => e.key === 'Enter' && addCustomHobby()}
                            />
                            <button onClick={addCustomHobby}>Add Custom</button>
                        </div>
                    </>
                )}
            </div>

            {/* Interests */}
            <div className="profile-section">
                <h2>💡 Interests</h2>
                <div className="selected-items">
                    {formData.interests.map(interest => (
                        <span key={interest} className="tag interest-tag">
                            {interest}
                            {isEditing && (
                                <button onClick={() => removeInterest(interest)}>×</button>
                            )}
                        </span>
                    ))}
                </div>
                {isEditing && (
                    <div className="add-item-input">
                        <input
                            type="text"
                            value={interestInput}
                            onChange={(e) => setInterestInput(e.target.value)}
                            placeholder="Add an interest..."
                            onKeyPress={(e) => e.key === 'Enter' && addInterest()}
                        />
                        <button onClick={addInterest}>Add</button>
                    </div>
                )}
            </div>

            {/* Favorites */}
            <div className="profile-section">
                <h2>🍹 Favorites</h2>
                <div className="form-field">
                    <label>Favorite Drinks</label>
                    <div className="selected-items">
                        {formData.favorite_drinks.map(drink => (
                            <span key={drink} className="tag drink-tag">
                                {drink}
                                {isEditing && (
                                    <button onClick={() => removeDrink(drink)}>×</button>
                                )}
                            </span>
                        ))}
                    </div>
                    {isEditing && (
                        <div className="add-item-input">
                            <input
                                type="text"
                                value={drinkInput}
                                onChange={(e) => setDrinkInput(e.target.value)}
                                placeholder="Add a favorite drink..."
                                onKeyPress={(e) => e.key === 'Enter' && addDrink()}
                            />
                            <button onClick={addDrink}>Add</button>
                        </div>
                    )}
                </div>
                <div className="form-field">
                    <label>Favorite Food</label>
                    <input
                        type="text"
                        name="favorite_food"
                        value={formData.favorite_food}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        placeholder="Pizza, Sushi, etc..."
                    />
                </div>
            </div>

            {/* Social Media */}
            <div className="profile-section">
                <h2>🔗 Social Media (Optional)</h2>
                <div className="social-grid">
                    <div className="form-field">
                        <label>📷 Instagram</label>
                        <input
                            type="url"
                            name="instagram"
                            value={formData.instagram}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            placeholder="https://instagram.com/username"
                        />
                    </div>
                    <div className="form-field">
                        <label>🐦 Twitter</label>
                        <input
                            type="url"
                            name="twitter"
                            value={formData.twitter}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            placeholder="https://twitter.com/username"
                        />
                    </div>
                    <div className="form-field">
                        <label>👥 Facebook</label>
                        <input
                            type="url"
                            name="facebook"
                            value={formData.facebook}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            placeholder="https://facebook.com/username"
                        />
                    </div>
                    <div className="form-field">
                        <label>💼 LinkedIn</label>
                        <input
                            type="url"
                            name="linkedin"
                            value={formData.linkedin}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            placeholder="https://linkedin.com/in/username"
                        />
                    </div>
                    <div className="form-field">
                        <label>👻 Snapchat</label>
                        <input
                            type="text"
                            name="snapchat"
                            value={formData.snapchat}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            placeholder="username"
                        />
                    </div>
                </div>
            </div>

            {/* My Hangouts Section */}
            <div className="profile-section">
                <h2>🍻 My Hangouts</h2>

                {/* Tabs */}
                <div className="hangout-tabs">
                    <button
                        className={`tab-btn ${activeHangoutTab === 'upcoming' ? 'active' : ''}`}
                        onClick={() => setActiveHangoutTab('upcoming')}
                    >
                        Upcoming ({hangouts.upcoming.length})
                    </button>
                    <button
                        className={`tab-btn ${activeHangoutTab === 'past' ? 'active' : ''}`}
                        onClick={() => setActiveHangoutTab('past')}
                    >
                        Past ({hangouts.past.length})
                    </button>
                </div>

                {/* Hangout Cards */}
                <div className="my-hangouts-grid">
                    {activeHangoutTab === 'upcoming' && hangouts.upcoming.length === 0 && (
                        <p className="no-hangouts-message">No upcoming hangouts yet</p>
                    )}
                    {activeHangoutTab === 'past' && hangouts.past.length === 0 && (
                        <p className="no-hangouts-message">No past hangouts yet</p>
                    )}

                    {(activeHangoutTab === 'upcoming' ? hangouts.upcoming : hangouts.past).map((hangout) => (
                        <a
                            key={hangout.id}
                            href={`/hangouts/${hangout.id}`}
                            className="my-hangout-card"
                        >
                            <div className="my-hangout-header">
                                <h4>{hangout.title}</h4>
                                {hangout.is_ended && (
                                    <span className="ended-badge-mini">Ended</span>
                                )}
                            </div>
                            <p className="my-hangout-desc">{hangout.description}</p>
                            <div className="my-hangout-info">
                                <span>📅 {new Date(hangout.date_time).toLocaleDateString()}</span>
                                <span>📍 {hangout.venue_location}</span>
                                <span>👥 {hangout.participant_count} participants</span>
                            </div>
                        </a>
                    ))}
                </div>
            </div>

            {/* Save Button */}
            {isEditing && (
                <div className="profile-actions">
                    <button
                        className="save-btn"
                        onClick={handleSave}
                        disabled={saving}
                    >
                        {saving ? 'Saving...' : '💾 Save Profile'}
                    </button>
                    <button
                        className="cancel-btn"
                        onClick={() => {
                            setIsEditing(false);
                            fetchProfile();
                        }}
                    >
                        Cancel
                    </button>
                </div>
            )}
        </div>
    );
};

export default UserProfile;
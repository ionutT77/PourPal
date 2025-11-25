import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
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
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [activePhotoIndex, setActivePhotoIndex] = useState(0);
    const [isEditing, setIsEditing] = useState(false);

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
                <h1>My Profile</h1>
                <button
                    className="edit-toggle-btn"
                    onClick={() => setIsEditing(!isEditing)}
                >
                    {isEditing ? '👁️ View Mode' : '✏️ Edit Profile'}
                </button>
            </div>

            {error && <div className="error-banner">{error}</div>}
            {success && <div className="success-banner">{success}</div>}

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
                                        className={`thumbnail ${index === activePhotoIndex ? 'active' : ''}`}
                                        onClick={() => setActivePhotoIndex(index)}
                                    >
                                        <img src={photo.image_url} alt={`Thumbnail ${index + 1}`} />
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
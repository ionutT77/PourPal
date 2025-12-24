import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './HangoutMemoryUpload.css';
import { API_BASE_URL } from '../../services/api';

const HangoutMemoryUpload = ({ hangoutId, isParticipant }) => {
    const [memories, setMemories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [caption, setCaption] = useState('');
    const [previewImage, setPreviewImage] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);

    useEffect(() => {
        fetchMemories();
    }, [hangoutId]);

    const fetchMemories = async () => {
        try {
            const response = await axios.get(
                `${API_BASE_URL}/hangouts/${hangoutId}/memories/`,
                { withCredentials: true }
            );
            setMemories(response.data.photos || []);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching memories:', err);
            setLoading(false);
        }
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setError('Please select an image file');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            setError('Image size must be less than 5MB');
            return;
        }

        setSelectedFile(file);

        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreviewImage(reader.result);
        };
        reader.readAsDataURL(file);
        setError('');
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            setError('Please select an image first');
            return;
        }

        if (memories.length >= 3) {
            setError('Maximum 3 memory photos allowed');
            return;
        }

        setUploading(true);
        setError('');

        const formData = new FormData();
        formData.append('image', selectedFile);
        formData.append('caption', caption);

        try {
            const response = await axios.post(
                `${API_BASE_URL}/hangouts/${hangoutId}/memories/upload/`,
                formData,
                {
                    withCredentials: true,
                    headers: { 'Content-Type': 'multipart/form-data' }
                }
            );

            setMemories([...memories, response.data]);
            setSuccess('Memory photo uploaded successfully!');
            setSelectedFile(null);
            setPreviewImage(null);
            setCaption('');

            setTimeout(() => setSuccess(''), 3000);
            // Refresh memories to get the full image URL
            fetchMemories();
        } catch (err) {
            console.error('Error uploading photo:', err);
            setError(err.response?.data?.error || 'Failed to upload photo');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (photoId) => {
        if (!window.confirm('Are you sure you want to delete this memory photo?')) {
            return;
        }

        try {
            await axios.delete(
                `${API_BASE_URL}/hangouts/${hangoutId}/memories/${photoId}/delete/`,
                { withCredentials: true }
            );

            setMemories(memories.filter(m => m.id !== photoId));
            setSuccess('Memory photo deleted successfully!');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            console.error('Error deleting photo:', err);
            setError(err.response?.data?.error || 'Failed to delete photo');
        }
    };

    const cancelUpload = () => {
        setSelectedFile(null);
        setPreviewImage(null);
        setCaption('');
        setError('');
    };

    if (loading) {
        return <div className="memory-loading">Loading memories...</div>;
    }

    return (
        <div className="memory-upload-container">
            <h3>📸 Hangout Memories ({memories.length}/3)</h3>

            {error && <div className="memory-error">{error}</div>}
            {success && <div className="memory-success">{success}</div>}

            {/* Display existing memories */}
            {memories.length > 0 && (
                <div className="memory-grid">
                    {memories.map((memory) => (
                        <div key={memory.id} className="memory-card">
                            <img
                                src={memory.image_url || memory.image}
                                alt={memory.caption || 'Memory photo'}
                                onError={(e) => {
                                    console.error('Image failed to load:', memory);
                                    e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23ddd" width="200" height="200"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EImage not found%3C/text%3E%3C/svg%3E';
                                }}
                            />
                            {memory.caption && (
                                <p className="memory-caption">{memory.caption}</p>
                            )}
                            <div className="memory-meta">
                                <span className="memory-uploader">
                                    By: {memory.uploaded_by.first_name}
                                </span>
                                {isParticipant && (
                                    <button
                                        className="delete-memory-btn"
                                        onClick={() => handleDelete(memory.id)}
                                    >
                                        🗑️
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {memories.length === 0 && (
                <p className="no-memories">No memories uploaded yet. Be the first to share!</p>
            )}

            {/* Upload section - only for participants */}
            {isParticipant && memories.length < 3 && (
                <div className="upload-section">
                    {!previewImage ? (
                        <label className="upload-label">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileSelect}
                                style={{ display: 'none' }}
                            />
                            <div className="upload-placeholder">
                                <span className="upload-icon">📤</span>
                                <span>Click to upload a memory photo</span>
                            </div>
                        </label>
                    ) : (
                        <div className="upload-preview">
                            <img src={previewImage} alt="Preview" />
                            <div className="upload-form">
                                <input
                                    type="text"
                                    placeholder="Add a caption (optional)..."
                                    value={caption}
                                    onChange={(e) => setCaption(e.target.value)}
                                    maxLength={200}
                                />
                                <div className="upload-actions">
                                    <button
                                        className="upload-btn"
                                        onClick={handleUpload}
                                        disabled={uploading}
                                    >
                                        {uploading ? 'Uploading...' : '✓ Upload'}
                                    </button>
                                    <button
                                        className="cancel-btn"
                                        onClick={cancelUpload}
                                        disabled={uploading}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default HangoutMemoryUpload;

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AgeVerification.css';

const AgeVerification = () => {
    const [verification, setVerification] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchVerificationStatus();
    }, []);

    const fetchVerificationStatus = async () => {
        try {
            const response = await axios.get(
                'http://localhost:8000/api/users/age-verification/status/',
                { withCredentials: true }
            );
            if (response.data.status !== 'not_uploaded') {
                setVerification(response.data);
            }
        } catch (err) {
            console.error('Error fetching verification status:', err);
        }
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                setError('Please select an image file');
                return;
            }
            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                setError('File size must be less than 5MB');
                return;
            }

            setSelectedFile(file);
            setError('');

            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            setError('Please select a document first');
            return;
        }

        setUploading(true);
        setError('');
        setSuccess('');

        const formData = new FormData();
        formData.append('document', selectedFile);

        try {
            const response = await axios.post(
                'http://localhost:8000/api/users/age-verification/upload/',
                formData,
                {
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );
            setSuccess('Document uploaded successfully! Awaiting review.');
            setSelectedFile(null);
            setPreview(null);
            setVerification(response.data);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to upload document');
        } finally {
            setUploading(false);
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'pending':
                return <span className="status-badge status-pending">⏳ Pending Review</span>;
            case 'approved':
                return <span className="status-badge status-approved">✅ Verified</span>;
            case 'rejected':
                return <span className="status-badge status-rejected">❌ Rejected</span>;
            default:
                return <span className="status-badge">Not Uploaded</span>;
        }
    };

    return (
        <div className="age-verification-container">
            <h3>🔒 Age Verification</h3>

            {verification && verification.status === 'approved' ? (
                <div className="verification-approved">
                    <div className="approved-icon">✅</div>
                    <h4>Age Verified</h4>
                    <p>Your account is verified. You'll see a verification badge on your profile.</p>
                    <div className="verified-date">
                        Verified on: {new Date(verification.verified_at).toLocaleDateString()}
                    </div>
                </div>
            ) : verification && verification.status === 'pending' ? (
                <div className="verification-pending">
                    <div className="pending-icon">⏳</div>
                    <h4>Verification Pending</h4>
                    <p>Your age verification is being reviewed. This usually takes 1-2 business days.</p>
                    <div className="pending-date">
                        Uploaded on: {new Date(verification.uploaded_at).toLocaleDateString()}
                    </div>
                </div>
            ) : verification && verification.status === 'rejected' ? (
                <div className="verification-rejected">
                    <div className="rejected-icon">❌</div>
                    <h4>Verification Rejected</h4>
                    <p className="rejection-reason">
                        <strong>Reason:</strong> {verification.rejection_reason}
                    </p>
                    <p>Please upload a clearer document.</p>
                    <button
                        className="reupload-btn"
                        onClick={() => setVerification(null)}
                    >
                        Re-upload Document
                    </button>
                </div>
            ) : (
                <div className="upload-section">
                    <p className="upload-instruction">
                        Upload a photo of your government-issued ID to verify your age (18+).
                        Your document will be reviewed by our admin team.
                    </p>

                    {preview && (
                        <div className="image-preview">
                            <img src={preview} alt="Document preview" />
                        </div>
                    )}

                    <div className="file-input-wrapper">
                        <input
                            type="file"
                            id="document-upload"
                            accept="image/*"
                            onChange={handleFileSelect}
                            disabled={uploading}
                        />
                        <label htmlFor="document-upload" className="file-input-label">
                            📄 {selectedFile ? selectedFile.name : 'Choose Document'}
                        </label>
                    </div>

                    {error && <div className="error-message">{error}</div>}
                    {success && <div className="success-message">{success}</div>}

                    <button
                        className="upload-btn"
                        onClick={handleUpload}
                        disabled={!selectedFile || uploading}
                    >
                        {uploading ? 'Uploading...' : 'Upload Document'}
                    </button>

                    <div className="privacy-note">
                        <small>
                            🔒 Your document is securely stored and only accessible to admin staff for verification purposes.
                        </small>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AgeVerification;

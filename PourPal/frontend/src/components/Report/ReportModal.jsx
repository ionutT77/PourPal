import React, { useState } from 'react';
import axios from 'axios';
import './ReportModal.css';

const ReportModal = ({ isOpen, onClose, reportedUserId, reportedUserName }) => {
    const [reason, setReason] = useState('');
    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const reasonOptions = [
        { value: 'inappropriate', label: 'Inappropriate Content' },
        { value: 'harassment', label: 'Harassment or Bullying' },
        { value: 'fake', label: 'Fake Profile' },
        { value: 'spam', label: 'Spam' },
        { value: 'underage', label: 'Underage User' },
        { value: 'other', label: 'Other' },
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!reason) {
            setError('Please select a reason for the report');
            return;
        }

        if (!description.trim()) {
            setError('Please provide a description');
            return;
        }

        setIsSubmitting(true);
        setError('');
        setSuccess('');

        try {
            await axios.post(
                'http://localhost:8000/api/users/reports/',
                {
                    reported_user: reportedUserId,
                    reason: reason,
                    description: description
                },
                { withCredentials: true }
            );

            setSuccess('Report submitted successfully. Our team will review it shortly.');
            setTimeout(() => {
                onClose();
                // Reset form
                setReason('');
                setDescription('');
                setSuccess('');
            }, 2000);
        } catch (err) {
            console.error('Error submitting report:', err);
            // Handle different error response formats
            let errorMessage = 'Failed to submit report. Please try again.';

            if (err.response?.data) {
                // Check for non_field_errors (Django REST framework format)
                if (err.response.data.non_field_errors) {
                    errorMessage = err.response.data.non_field_errors[0];
                }
                // Check for general error message
                else if (err.response.data.error) {
                    errorMessage = err.response.data.error;
                }
                // Check for detail message
                else if (err.response.data.detail) {
                    errorMessage = err.response.data.detail;
                }
                // If it's a string, use it directly
                else if (typeof err.response.data === 'string') {
                    errorMessage = err.response.data;
                }
            }

            setError(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="report-modal-overlay" onClick={onClose}>
            <div className="report-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="report-modal-header">
                    <h2>🚨 Report User</h2>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                <div className="report-modal-body">
                    {reportedUserName && (
                        <p className="reporting-user">
                            You are reporting: <strong>{reportedUserName}</strong>
                        </p>
                    )}

                    {error && <div className="error-message">{error}</div>}
                    {success && <div className="success-message">{success}</div>}

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="reason">Reason for Report *</label>
                            <select
                                id="reason"
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                required
                                disabled={isSubmitting}
                            >
                                <option value="">Select a reason...</option>
                                {reasonOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="description">Description *</label>
                            <textarea
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Please provide details about why you're reporting this user..."
                                rows="5"
                                required
                                disabled={isSubmitting}
                            />
                            <small className="char-count">
                                {description.length} characters
                            </small>
                        </div>

                        <div className="report-modal-footer">
                            <button
                                type="button"
                                className="btn-cancel"
                                onClick={onClose}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn-submit"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Submitting...' : 'Submit Report'}
                            </button>
                        </div>
                    </form>

                    <p className="report-disclaimer">
                        ⚠️ False reports may result in account suspension. All reports are reviewed by our moderation team.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ReportModal;

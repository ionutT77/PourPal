import React, { useState } from 'react';
import ReportModal from './ReportModal';
import './ReportButton.css';

const ReportButton = ({ userId, userName, className = '' }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <>
            <button
                className={`report-button ${className}`}
                onClick={() => setIsModalOpen(true)}
                title="Report this user"
            >
                🚨 Report
            </button>

            <ReportModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                reportedUserId={userId}
                reportedUserName={userName}
            />
        </>
    );
};

export default ReportButton;

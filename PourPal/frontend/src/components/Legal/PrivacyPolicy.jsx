import React from 'react';
import { Link } from 'react-router-dom';
import './PrivacyPolicy.css';

const PrivacyPolicy = () => {
    return (
        <div className="privacy-policy-container">
            <div className="privacy-header">
                <h1>🔒 Privacy Policy</h1>
                <p className="last-updated">Last Updated: December 24, 2024</p>
            </div>

            <div className="privacy-content">
                <section className="privacy-section">
                    <h2>1. Introduction</h2>
                    <p>
                        Welcome to PourPal. We respect your privacy and are committed to protecting your personal data.
                        This privacy policy explains how we collect, use, and safeguard your information when you use our platform.
                    </p>
                </section>

                <section className="privacy-section">
                    <h2>2. Information We Collect</h2>
                    <h3>2.1 Personal Information</h3>
                    <ul>
                        <li><strong>Account Information:</strong> Email address, username, first name, password (encrypted)</li>
                        <li><strong>Profile Information:</strong> Age, bio, hobbies, interests, photos, social media links</li>
                        <li><strong>Age Verification:</strong> Government-issued ID photos (securely stored and only accessible to admin staff)</li>
                    </ul>

                    <h3>2.2 Usage Information</h3>
                    <ul>
                        <li>Hangout participation and creation history</li>
                        <li>Friend connections and requests</li>
                        <li>Messages and interactions with other users</li>
                        <li>Reports submitted or received</li>
                    </ul>

                    <h3>2.3 Technical Information</h3>
                    <ul>
                        <li>IP address and device information</li>
                        <li>Browser type and version</li>
                        <li>Cookies and session data</li>
                    </ul>
                </section>

                <section className="privacy-section">
                    <h2>3. How We Use Your Information</h2>
                    <p>We use your information to:</p>
                    <ul>
                        <li>Provide and maintain our services</li>
                        <li>Verify your age (18+ requirement)</li>
                        <li>Connect you with other users for hangouts</li>
                        <li>Enable friend connections and messaging</li>
                        <li>Improve user experience and platform features</li>
                        <li>Ensure platform safety and handle reports</li>
                        <li>Send important notifications about your account</li>
                    </ul>
                </section>

                <section className="privacy-section">
                    <h2>4. Information Sharing</h2>
                    <h3>4.1 Public Information</h3>
                    <p>The following information is visible to other users:</p>
                    <ul>
                        <li>First name, username, age</li>
                        <li>Profile photos, bio, hobbies, and interests</li>
                        <li>Hangout participation (for hangout members)</li>
                    </ul>

                    <h3>4.2 Private Information</h3>
                    <p>The following information is NOT shared publicly:</p>
                    <ul>
                        <li>Email address</li>
                        <li>Social media links (only visible to friends)</li>
                        <li>Age verification documents</li>
                        <li>Private messages</li>
                    </ul>

                    <h3>4.3 Third Parties</h3>
                    <p>We do not sell your personal information to third parties. We may share data with:</p>
                    <ul>
                        <li>Service providers (hosting, analytics) under strict confidentiality agreements</li>
                        <li>Law enforcement when required by law</li>
                    </ul>
                </section>

                <section className="privacy-section">
                    <h2>5. Data Security</h2>
                    <p>We implement security measures to protect your data:</p>
                    <ul>
                        <li>Password encryption using industry-standard hashing</li>
                        <li>Secure HTTPS connections</li>
                        <li>Age verification documents stored securely with admin-only access</li>
                        <li>Regular security audits and updates</li>
                    </ul>
                </section>

                <section className="privacy-section">
                    <h2>6. Your Rights</h2>
                    <p>You have the right to:</p>
                    <ul>
                        <li><strong>Access:</strong> Request a copy of your personal data</li>
                        <li><strong>Update:</strong> Modify your profile information at any time</li>
                        <li><strong>Delete:</strong> Request account deletion (contact support)</li>
                        <li><strong>Object:</strong> Opt-out of certain data processing activities</li>
                        <li><strong>Portability:</strong> Request your data in a portable format</li>
                    </ul>
                </section>

                <section className="privacy-section">
                    <h2>7. Age Requirement</h2>
                    <p>
                        PourPal is strictly for users aged 18 and above. We require age verification through
                        government-issued ID to ensure compliance. Accounts found to be under 18 will be immediately terminated.
                    </p>
                </section>

                <section className="privacy-section">
                    <h2>8. Cookies</h2>
                    <p>
                        We use cookies to maintain your session and improve user experience. By using PourPal,
                        you consent to our use of cookies. You can disable cookies in your browser settings,
                        but this may affect platform functionality.
                    </p>
                </section>

                <section className="privacy-section">
                    <h2>9. Changes to This Policy</h2>
                    <p>
                        We may update this privacy policy from time to time. We will notify users of significant
                        changes via email or platform notification. Continued use of PourPal after changes
                        constitutes acceptance of the updated policy.
                    </p>
                </section>

                <section className="privacy-section">
                    <h2>10. Contact Us</h2>
                    <p>If you have questions about this privacy policy or your data, please contact us:</p>
                    <ul>
                        <li><strong>Email:</strong> privacy@pourpal.com</li>
                        <li><strong>Support:</strong> support@pourpal.com</li>
                    </ul>
                </section>

                <div className="privacy-footer">
                    <p>By using PourPal, you agree to this Privacy Policy.</p>
                    <Link to="/" className="back-home-btn">← Back to Home</Link>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;

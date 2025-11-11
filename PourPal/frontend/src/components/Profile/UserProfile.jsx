import React, { useState, useEffect } from 'react';
import axios from 'axios';

const UserProfile = () => {
    const [user, setUser] = useState({
        firstName: '',
        bio: '',
        profilePicture: ''
    });

    useEffect(() => {
        // Fetch user profile data from the API
        const fetchUserProfile = async () => {
            try {
                const response = await axios.get('/api/user/profile'); // Adjust the endpoint as necessary
                setUser(response.data);
            } catch (error) {
                console.error('Error fetching user profile:', error);
            }
        };

        fetchUserProfile();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUser({ ...user, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.put('/api/user/profile', user); // Adjust the endpoint as necessary
            alert('Profile updated successfully!');
        } catch (error) {
            console.error('Error updating profile:', error);
        }
    };

    return (
        <div className="user-profile">
            <h2>User Profile</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>First Name:</label>
                    <input
                        type="text"
                        name="firstName"
                        value={user.firstName}
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <label>Bio:</label>
                    <textarea
                        name="bio"
                        value={user.bio}
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <label>Profile Picture URL:</label>
                    <input
                        type="text"
                        name="profilePicture"
                        value={user.profilePicture}
                        onChange={handleChange}
                    />
                </div>
                <button type="submit">Update Profile</button>
            </form>
        </div>
    );
};

export default UserProfile;
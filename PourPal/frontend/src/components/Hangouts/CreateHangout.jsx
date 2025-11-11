import React, { useState } from 'react';
import axios from 'axios';

const CreateHangout = () => {
    const [title, setTitle] = useState('');
    const [venue, setVenue] = useState('');
    const [dateTime, setDateTime] = useState('');
    const [maxGroupSize, setMaxGroupSize] = useState(2);
    const [description, setDescription] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('/api/hangouts/', {
                title,
                venue,
                date_time: dateTime,
                max_group_size: maxGroupSize,
                description,
            });
            console.log('Hangout created:', response.data);
            // Reset form fields
            setTitle('');
            setVenue('');
            setDateTime('');
            setMaxGroupSize(2);
            setDescription('');
        } catch (error) {
            console.error('Error creating hangout:', error);
        }
    };

    return (
        <div>
            <h2>Create a New Hangout</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Title:</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Venue:</label>
                    <input
                        type="text"
                        value={venue}
                        onChange={(e) => setVenue(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Date & Time:</label>
                    <input
                        type="datetime-local"
                        value={dateTime}
                        onChange={(e) => setDateTime(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Max Group Size:</label>
                    <input
                        type="number"
                        value={maxGroupSize}
                        onChange={(e) => setMaxGroupSize(e.target.value)}
                        min="2"
                        max="5"
                        required
                    />
                </div>
                <div>
                    <label>Description:</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                    />
                </div>
                <button type="submit">Create Hangout</button>
            </form>
        </div>
    );
};

export default CreateHangout;
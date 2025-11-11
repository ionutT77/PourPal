import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getHangoutDetails, joinHangout, leaveHangout } from '../../services/api';

const HangoutDetails = () => {
    const { id } = useParams();
    const [hangout, setHangout] = useState(null);
    const [participants, setParticipants] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHangoutDetails = async () => {
            try {
                const response = await getHangoutDetails(id);
                setHangout(response.data);
                setParticipants(response.data.participants || []);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching hangout details:', error);
                setLoading(false);
            }
        };

        fetchHangoutDetails();
    }, [id]);

    const handleJoin = async () => {
        try {
            await joinHangout(id);
            // Reload hangout details to get updated participants
            const response = await getHangoutDetails(id);
            setParticipants(response.data.participants || []);
        } catch (error) {
            console.error('Error joining hangout:', error);
        }
    };

    const handleLeave = async () => {
        try {
            await leaveHangout(id);
            // Reload hangout details to get updated participants
            const response = await getHangoutDetails(id);
            setParticipants(response.data.participants || []);
        } catch (error) {
            console.error('Error leaving hangout:', error);
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <h1>{hangout.title}</h1>
            <p>{hangout.description}</p>
            <p>Venue: {hangout.venue}</p>
            <p>Date & Time: {new Date(hangout.dateTime).toLocaleString()}</p>
            <h2>Participants</h2>
            <ul>
                {participants.map(participant => (
                    <li key={participant.id}>
                        <Link to={`/profile/${participant.id}`}>{participant.name}</Link>
                    </li>
                ))}
            </ul>
            <button onClick={handleJoin}>Count Me In!</button>
            <button onClick={handleLeave}>Leave Hangout</button>
        </div>
    );
};

export default HangoutDetails;
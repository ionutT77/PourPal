import axios from 'axios';

export const API_BASE_URL = (process.env.REACT_APP_API_URL || 'http://localhost:8000') + '/api';
export const WS_BASE_URL = (process.env.REACT_APP_API_URL || 'http://localhost:8000').replace(/^http/, 'ws');

// Set up axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // Enable credentials for cookies
});

// User authentication
export const registerUser = async (userData) => {
    return await api.post('/users/register/', userData);
};

export const loginUser = async (credentials) => {
    return await api.post('/users/login/', credentials);
};

export const logoutUser = async () => {
    return await api.post('/users/logout/');
};

// User profile management
export const getUserProfile = async (userId) => {
    return await api.get(`/users/${userId}/`);
};

export const updateUserProfile = async (userId, profileData) => {
    return await api.put(`/users/${userId}/`, profileData);
};

// Hangout management
export const createHangout = async (hangoutData) => {
    return await api.post('/hangouts/', hangoutData);
};

export const getHangouts = async (params = {}) => {
    return await api.get('/hangouts/', { params });
};

export const getHangoutDetails = async (hangoutId) => {
    return await api.get(`/hangouts/${hangoutId}/`);
};

export const joinHangout = async (hangoutId) => {
    return await api.post(`/hangouts/${hangoutId}/join/`);
};

export const leaveHangout = async (hangoutId) => {
    return await api.post(`/hangouts/${hangoutId}/leave/`);
};

// Chat functionality
export const sendMessage = async (chatId, messageData) => {
    return await api.post(`/chat/${chatId}/messages/`, messageData);
};

export const getChatMessages = async (chatId) => {
    return await api.get(`/chat/${chatId}/messages/`);
};
// api.js
// Utility file to configure an Axios instance with JWT token handling and error interception.
// Helps manage API requests consistently across the app.

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '@env';

// Create an Axios instance with the base URL
const api = axios.create({
    baseURL: API_URL, // Set base URL from environment variable
});

// Add request interceptor to include JWT token in headers
api.interceptors.request.use(async (config) => {
    const token = await AsyncStorage.getItem('userToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`; // Add Bearer token for authenticated requests
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// Add response interceptor to handle errors, especially 401 (unauthorized)
api.interceptors.response.use(
    (response) => response, // Return successful responses as-is
    async (error) => {
        if (error.response?.status === 401) { // Handle unauthorized errors
            await AsyncStorage.removeItem('userToken'); // Clear expired token
            console.log('Token expired, redirecting to login...');
            // Note: Navigation redirect isn't automatic here—handle it in components or use a global context
        }
        return Promise.reject(error);
    }
);

export default api;
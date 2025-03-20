// src/services/api.js
// Utility file to configure an Axios instance for API requests with JWT token handling.
// All requests use a hardcoded base URL and include interceptors for authentication and error handling.

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define the base URL for all API requests (no trailing slash to avoid double slashes)
const API_BASE_URL = 'https://basilandbyte.onrender.com/api/recipes';

// Sanity check to ensure the base URL is defined
if (!API_BASE_URL) {
    throw new Error('API_BASE_URL is not defined!');
}

// Log the base URL for debugging during initialization
console.log('Initializing api.js - API_BASE_URL:', API_BASE_URL);

// Create an Axios instance with predefined configuration
const api = axios.create({
    baseURL: API_BASE_URL, // Base URL for all requests
    timeout: 10000, // 10-second timeout for requests
});

// Log the configured baseURL to confirm instantiation
console.log('Axios instance created with baseURL:', api.defaults.baseURL);

// Request interceptor to attach JWT token to every request
api.interceptors.request.use(async (config) => {
    const token = await AsyncStorage.getItem('userToken'); // Retrieve token from storage
    console.log('Request Interceptor - Token:', token ? 'Present' : 'Absent');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`; // Add token to Authorization header
    } else {
        console.warn('No token available for request'); // Warn if no token is found
    }
    console.log('Request Interceptor - Full URL:', config.baseURL + config.url); // Log the full request URL
    return config; // Return modified config
}, (error) => {
    console.error('Request Interceptor - Error:', error.message); // Log any interceptor errors
    return Promise.reject(error); // Reject the promise with the error
});

// Response interceptor to handle successful responses and errors
api.interceptors.response.use(
    (response) => {
        console.log('Response Interceptor - Success:', response.status, response.config.url); // Log successful response
        return response; // Return the response unchanged
    },
    async (error) => {
        if (error.response) {
            console.error('Response Interceptor - Error:', { // Log detailed error info
                status: error.response.status,
                data: error.response.data,
                url: error.response.config.url,
            });
            if (error.response.status === 401) { // Handle unauthorized errors
                console.log('401 Detected - Clearing token');
                await AsyncStorage.removeItem('userToken'); // Clear invalid token
                console.log('Token expired, redirecting to login...');
            } else if (error.response.status === 500) { // Log server errors
                console.error('Server Error 500 - Check backend logs');
            }
        } else {
            console.error('Response Interceptor - Network Error:', error.message); // Log network errors
        }
        return Promise.reject(error); // Reject the promise with the error
    }
);

// Fetch user info from /user-info/
export const getUserInfo = async () => {
    console.log('Executing getUserInfo');
    try {
        const response = await api.get('/user-info/');
        console.log('getUserInfo - Response:', response.status, response.data);
        return response.data; // Return user data
    } catch (error) {
        console.error('getUserInfo - Error:', error.message);
        throw error; // Rethrow error for caller to handle
    }
};

// Fetch all recipes from root endpoint (/)
export const fetchRecipes = async () => {
    console.log('Executing fetchRecipes');
    try {
        const response = await api.get('/');
        console.log('fetchRecipes - Response:', response.status, response.data);
        return response.data || []; // Return recipes or empty array if no data
    } catch (error) {
        console.error('fetchRecipes - Error:', error.message);
        throw error;
    }
};

// Add a recipe to /add/
export const addRecipe = async (formData) => {
    console.log('Executing addRecipe');
    try {
        const response = await api.post('/add/', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }, // Required for file uploads
        });
        console.log('addRecipe - Response:', response.status, response.data);
        return response.data;
    } catch (error) {
        console.error('addRecipe - Error:', error.message);
        throw error;
    }
};

// Update a recipe at /update/<recipeId>/
export const updateRecipe = async (recipeId, formData) => {
    console.log('Executing updateRecipe for ID:', recipeId);
    try {
        const response = await api.put(`/update/${recipeId}/`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        console.log('updateRecipe - Response:', response.status, response.data);
        return response.data;
    } catch (error) {
        console.error('updateRecipe - Error:', error.message);
        throw error;
    }
};

// Delete a recipe at /delete/<recipeId>/
export const deleteRecipe = async (recipeId) => {
    console.log('Executing deleteRecipe for ID:', recipeId);
    try {
        const response = await api.delete(`/delete/${recipeId}/`);
        console.log('deleteRecipe - Response:', response.status);
        return response.status === 204; // Return true for successful deletion
    } catch (error) {
        console.error('deleteRecipe - Error:', error.message);
        throw error;
    }
};

// Save a recipe to /save/
export const saveRecipe = async (recipeId) => {
    console.log('Executing saveRecipe for ID:', recipeId);
    try {
        const response = await api.post('/save/', { recipe_id: recipeId });
        console.log('saveRecipe - Response:', response.status, response.data);
        return response.data;
    } catch (error) {
        console.error('saveRecipe - Error:', error.message);
        throw error;
    }
};

// Fetch saved recipes from /saved-recipes/
export const getSavedRecipes = async () => {
    console.log('Executing getSavedRecipes');
    try {
        const response = await api.get('/saved-recipes/');
        console.log('getSavedRecipes - Response:', response.status, response.data);
        return response.data || [];
    } catch (error) {
        console.error('getSavedRecipes - Error:', error.message);
        throw error;
    }
};

// Unsave a recipe at /save/<savedItemId>/
export const unsaveRecipe = async (savedItemId) => {
    console.log('Executing unsaveRecipe for ID:', savedItemId);
    try {
        const response = await api.delete(`/save/${savedItemId}/`);
        console.log('unsaveRecipe - Response:', response.status);
        return true;
    } catch (error) {
        console.error('unsaveRecipe - Error:', error.message);
        throw error;
    }
};

// Add a recipe to weekly plan at /weekly-plan/add/
export const addToWeeklyPlan = async (recipeId, day, mealType) => {
    console.log('Executing addToWeeklyPlan', { recipeId, day, mealType });
    try {
        const response = await api.post('/weekly-plan/add/', { recipe_id: recipeId, day, meal_type: mealType });
        console.log('addToWeeklyPlan - Response:', response.status, response.data);
        return response.data;
    } catch (error) {
        console.error('addToWeeklyPlan - Error:', error.message);
        throw error;
    }
};

// Fetch weekly plan from /weekly-plan/
export const getWeeklyPlan = async () => {
    console.log('Executing getWeeklyPlan');
    try {
        const response = await api.get('/weekly-plan/');
        console.log('getWeeklyPlan - Response:', response.status, response.data);
        return response.data || {};
    } catch (error) {
        console.error('getWeeklyPlan - Error:', error.message);
        throw error;
    }
};

// Clear all meals for the week at /weekly-plan/clear/
export const clearWeeklyPlan = async () => {
    console.log('Executing clearWeeklyPlan');
    try {
        const response = await api.delete('/weekly-plan/clear/');
        console.log('clearWeeklyPlan - Response:', response.status);
        return true;
    } catch (error) {
        console.error('clearWeeklyPlan - Error:', error.message);
        throw error;
    }
};

// Clear meals for a specific day at /weekly-plan/clear/<day>/
export const clearDayPlan = async (day) => {
    console.log('Executing clearDayPlan for day:', day);
    try {
        const response = await api.delete(`/weekly-plan/clear/${day}/`);
        console.log('clearDayPlan - Response:', response.status);
        return true;
    } catch (error) {
        console.error('clearDayPlan - Error:', error.message);
        throw error;
    }
};

// Register a new user at /register/
export const registerUser = async (username, password, firstName, lastName, email) => {
    console.log('Executing registerUser for username:', username);
    try {
        const response = await api.post('/register/', {
            username,
            password,
            first_name: firstName,
            last_name: lastName,
            email,
        });
        console.log('registerUser - Response:', response.status, response.data);
        const { access, refresh } = response.data.token || {};
        if (access) {
            await AsyncStorage.setItem('userToken', access); // Store access token
            await AsyncStorage.setItem('refreshToken', refresh || ''); // Store refresh token if present
        }
        return response.data;
    } catch (error) {
        console.error('registerUser - Error:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
        });
        throw error;
    }
};

// Log in a user at /login/
export const loginUser = async (username, password) => {
    console.log('Executing loginUser for username:', username);
    try {
        const response = await api.post('/login/', { username, password });
        console.log('loginUser - Response:', response.status, response.data);
        const { access, refresh } = response.data.token;
        await AsyncStorage.setItem('userToken', access); // Store access token
        await AsyncStorage.setItem('refreshToken', refresh); // Store refresh token
        return response.data;
    } catch (error) {
        console.error('loginUser - Error:', error.message);
        throw error;
    }
};

export default api;
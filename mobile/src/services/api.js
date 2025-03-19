// src/services/api.js
// Utility file to configure an Axios instance with JWT token handling and error interception.
// Manages API requests consistently across the mobile app, including weekly planner endpoints.

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '@env'; // Base URL from environment (e.g., http://10.0.0.150:8000)

console.log('Initializing api.js - API_URL:', API_URL || 'Not set in .env');

// Create an Axios instance with the base URL
const api = axios.create({
    baseURL: API_URL || 'http://10.0.0.150:8000', // Fallback URL
    timeout: 10000, // 10-second timeout
});

console.log('Axios instance created with baseURL:', api.defaults.baseURL);

// Request interceptor to add JWT token to headers
api.interceptors.request.use(async (config) => {
    const token = await AsyncStorage.getItem('userToken');
    console.log('Request Interceptor - Token:', token ? 'Present' : 'Absent');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    } else {
        console.warn('No token available for request');
    }
    return config;
}, (error) => {
    console.error('Request Interceptor - Error:', error.message);
    return Promise.reject(error);
});

// Response interceptor to handle errors
api.interceptors.response.use(
    (response) => {
        console.log('Response Interceptor - Success:', response.status, response.config.url);
        return response;
    },
    async (error) => {
        if (error.response) {
            console.error('Response Interceptor - Error:', {
                status: error.response.status,
                data: error.response.data,
                url: error.response.config.url,
            });
            if (error.response.status === 401) {
                console.log('401 Detected - Clearing token');
                await AsyncStorage.removeItem('userToken');
                console.log('Token expired, redirecting to login...');
            } else if (error.response.status === 500) {
                console.error('Server Error 500 - Check backend logs');
            }
        } else {
            console.error('Response Interceptor - Network Error:', error.message);
        }
        return Promise.reject(error);
    }
);

// Fetch saved recipes
export const getSavedRecipes = async () => {
    console.log('Executing getSavedRecipes');
    try {
        const response = await api.get('/api/recipes/saved-recipes/');
        console.log('getSavedRecipes - Response:', response.status, response.data);
        return response.data || []; // Return empty array if no data
    } catch (error) {
        console.error('getSavedRecipes - Error:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
        });
        throw new Error(`Failed to fetch saved recipes: ${error.message}`);
    }
};

// Unsave a recipe
export const unsaveRecipe = async (savedItemId) => {
    console.log('Executing unsaveRecipe for ID:', savedItemId);
    try {
        const response = await api.delete(`/api/recipes/save/${savedItemId}/`);
        console.log('unsaveRecipe - Response:', response.status);
        return true;
    } catch (error) {
        console.error('unsaveRecipe - Error:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
        });
        throw new Error(`Failed to unsave recipe: ${error.message}`);
    }
};

// Fetch all recipes (for recipe details)
export const fetchRecipes = async () => {
    console.log('Executing fetchRecipes');
    try {
        const response = await api.get('/api/recipes/');
        console.log('fetchRecipes - Response:', response.status, response.data);
        return response.data || [];
    } catch (error) {
        console.error('fetchRecipes - Error:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
        });
        throw new Error(`Failed to fetch recipes: ${error.message}`);
    }
};

// Add a recipe to the weekly planner
export const addToWeeklyPlan = async (recipeId, day, mealType) => {
    console.log('Executing addToWeeklyPlan for recipeId:', recipeId, 'day:', day, 'mealType:', mealType);
    try {
        const response = await api.post(
            '/api/recipes/weekly-plan/add/',
            { recipe_id: recipeId, day, meal_type: mealType }
        );
        console.log('addToWeeklyPlan - Response:', response.status, response.data);
        return response.data;
    } catch (error) {
        console.error('addToWeeklyPlan - Error:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
        });
        throw new Error(`Failed to add to weekly plan: ${error.message}`);
    }
};

// Fetch the weekly plan
export const getWeeklyPlan = async () => {
    console.log('Executing getWeeklyPlan');
    try {
        const response = await api.get('/api/recipes/weekly-plan/');
        console.log('getWeeklyPlan - Response:', response.status, response.data);
        return response.data || {};
    } catch (error) {
        console.error('getWeeklyPlan - Error:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
        });
        throw new Error(`Failed to fetch weekly plan: ${error.message}`);
    }
};

// Clear all meals for the week
export const clearWeeklyPlan = async () => {
    console.log('Executing clearWeeklyPlan');
    try {
        const response = await api.delete('/api/recipes/weekly-plan/clear/');
        console.log('clearWeeklyPlan - Response:', response.status);
        return true;
    } catch (error) {
        console.error('clearWeeklyPlan - Error:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
        });
        throw new Error(`Failed to clear weekly plan: ${error.message}`);
    }
};

// Clear meals for a specific day
export const clearDayPlan = async (day) => {
    console.log('Executing clearDayPlan for day:', day);
    try {
        const response = await api.delete(`/api/recipes/weekly-plan/clear/${day}/`);
        console.log('clearDayPlan - Response:', response.status);
        return true;
    } catch (error) {
        console.error('clearDayPlan - Error:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
        });
        throw new Error(`Failed to clear day plan: ${error.message}`);
    }
};

export default api;

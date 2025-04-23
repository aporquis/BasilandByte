// src/services/api.js
// Utility file to configure an Axios instance for API requests with JWT token handling.
// All requests use the production base URL with interceptors for authentication and error handling.

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
    timeout: 15000, // Increased to 15-second timeout for production
});

// Log the configured baseURL to confirm instantiation
console.log('Axios instance created with baseURL:', api.defaults.baseURL);

// Request interceptor to attach JWT token to every request
api.interceptors.request.use(async (config) => {
    const token = await AsyncStorage.getItem('userToken');
    console.log('Request Interceptor - Token:', token ? 'Present' : 'Absent');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    } else {
        console.warn('No token available for request');
    }
    console.log('Request Interceptor - Full URL:', config.baseURL + config.url);
    return config;
}, (error) => {
    console.error('Request Interceptor - Error:', error.message);
    return Promise.reject(error);
});

// Response interceptor to handle successful responses and errors
api.interceptors.response.use(
    (response) => {
        console.log('Response Interceptor - Success:', response.status, response.config.url);
        return response;
    },
    async (error) => {
        const status = error.response?.status || 500;
        const data = error.response?.data || { error: error.message };
        console.error('Response Interceptor - Error:', {
            status,
            data,
            url: error.response?.config.url || error.config?.url,
        });

        if (status === 401) {
            console.log('401 Detected - Clearing token');
            await AsyncStorage.removeItem('userToken');
            return Promise.reject(new Error(data.error || data.detail || 'Unauthorized: Invalid credentials'));
        } else if (status === 500) {
            console.error('Server Error 500 - Check backend logs');
            return Promise.reject(new Error(data.error || data.detail || 'Server error: Please try again later'));
        } else if (!error.response) {
            console.error('Response Interceptor - Network Error:', error.message, {
                code: error.code,
                config: error.config?.url,
            });
            return Promise.reject(new Error('Network error: Unable to connect to server. Check your internet or server status.'));
        }

        return Promise.reject(new Error(data.error || data.detail || 'Server error'));
    }
);

// Fetch user info from /user-info/
export const getUserInfo = async () => {
    console.log('Executing getUserInfo');
    try {
        const response = await api.get('/user-info/');
        console.log('getUserInfo - Response:', response.status, response.data);
        return response.data;
    } catch (error) {
        console.error('getUserInfo - Error:', error.message);
        throw error;
    }
};

// Fetch all recipes from root endpoint (/)
export const fetchRecipes = async () => {
    console.log('Executing fetchRecipes');
    try {
        const response = await api.get('/');
        console.log('fetchRecipes - Response:', response.status, response.data);
        return response.data || [];
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
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        console.log('addRecipe - Response:', response.status, response.data);
        return response.data;
    } catch (error) {
        console.error('addRecipe - Error:', error.message);
        throw error;
    }
};

// Add a recipe ingredient at /add-ingredient/
export const addRecipeIngredient = async (recipeId, ingredientData) => {
    console.log('Executing addRecipeIngredient for Recipe ID:', recipeId, 'Data:', ingredientData);
    try {
        const response = await api.post('/add-ingredient/', {
            recipe_id: recipeId,
            ...ingredientData,
        });
        console.log('addRecipeIngredient - Response:', response.status, response.data);
        return response.data;
    } catch (error) {
        console.error('addRecipeIngredient - Error:', error.message);
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
        console.log('deleteRecipe - Response:', response.status, response.data);
        return response;
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
            await AsyncStorage.setItem('userToken', access);
            await AsyncStorage.setItem('refreshToken', refresh || '');
        }
        return response.data;
    } catch (error) {
        console.error('registerUser - Error:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
        });
        throw new Error(error.response?.data?.error || 'Registration failed');
    }
};

// Log in a user at /login/
export const loginUser = async (username, password) => {
    console.log('Executing loginUser for username:', username);
    try {
        const response = await api.post('/login/', { username, password });
        console.log('loginUser - Response:', response.status, response.data);
        const { access, refresh } = response.data.token || {};
        if (!access) {
            throw new Error('No access token received');
        }
        await AsyncStorage.setItem('userToken', access);
        await AsyncStorage.setItem('refreshToken', refresh || '');
        return response.data;
    } catch (error) {
        console.error('loginUser - Error:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
        });
        throw new Error(error.response?.data?.error || 'Network error: Unable to connect to login endpoint');
    }
};

// Log a login event at /log-login/ for GDPR compliance
export const logLoginEvent = async (username, outcome, source) => {
    console.log('Executing logLoginEvent for username:', username);
    try {
        const response = await api.post('/log-login/', { username, outcome, source });
        console.log('logLoginEvent - Response:', response.status, response.data);
        return response.data;
    } catch (error) {
        console.error('logLoginEvent - Error:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
        });
        return null;
    }
};

// Personal Pantry Functions

// Fetch user inventory from /inventory/
export const getUserInventory = async () => {
    console.log('Executing getUserInventory');
    try {
        const response = await api.get('/inventory/');
        console.log('getUserInventory - Response:', response.status, response.data);
        return response.data || [];
    } catch (error) {
        console.error('getUserInventory - Error:', error.message);
        throw error;
    }
};

// Add an item to inventory at /inventory/add/
export const addToInventory = async (itemData) => {
    console.log('Executing addToInventory', itemData);
    try {
        const response = await api.post('/inventory/add/', itemData);
        console.log('addToInventory - Response:', response.status, response.data);
        return response.data;
    } catch (error) {
        console.error('addToInventory - Error:', error.message);
        throw error;
    }
};

// Update an inventory item at /inventory/update/<inventoryId>/
export const updateInventoryItem = async (inventoryId, data) => {
    console.log('Executing updateInventoryItem for ID:', inventoryId);
    try {
        const response = await api.put(`/inventory/update/${inventoryId}/`, data);
        console.log('updateInventoryItem - Response:', response.status, response.data);
        return response.data;
    } catch (error) {
        console.error('updateInventoryItem - Error:', error.message);
        throw error;
    }
};

// Delete an inventory item at /inventory/delete/<inventoryId>/
export const deleteInventoryItem = async (inventoryId) => {
    console.log('Executing deleteInventoryItem for ID:', inventoryId);
    try {
        const response = await api.delete(`/inventory/delete/${inventoryId}/`);
        console.log('deleteInventoryItem - Response:', response.status);
        return response.status === 204;
    } catch (error) {
        console.error('deleteInventoryItem - Error:', error.message);
        throw error;
    }
};

// Suggest recipes based on inventory at /recipes/suggest/
export const suggestRecipes = async () => {
    console.log('Executing suggestRecipes');
    try {
        const response = await api.get('/recipes/suggest/');
        console.log('suggestRecipes - Response:', response.status, response.data);
        return response.data || { suggested_recipes: [] };
    } catch (error) {
        console.error('suggestRecipes - Error:', error.message);
        throw error;
    }
};

// Shopping List Functions

// Add an item to the shopping list at /shopping-list/add/
export const addToShoppingList = async (itemData) => {
    console.log('Executing addToShoppingList', itemData);
    try {
        const response = await api.post('/shopping-list/add/', itemData);
        console.log('addToShoppingList - Response:', response.status, response.data);
        return response.data;
    } catch (error) {
        console.error('addToShoppingList - Error:', error.message);
        throw error;
    }
};

// Fetch the shopping list from /shopping-list/
export const getShoppingList = async () => {
    console.log('Executing getShoppingList');
    try {
        const response = await api.get('/shopping-list/');
        console.log('getShoppingList - Response:', response.status, response.data);
        return response.data || [];
    } catch (error) {
        console.error('getShoppingList - Error:', error.message);
        throw error;
    }
};

// Update a shopping list item at /shopping-list/update/<itemId>/
export const updateShoppingListItem = async (itemId, data) => {
    console.log('Executing updateShoppingListItem for ID:', itemId);
    try {
        const response = await api.put(`/shopping-list/update/${itemId}/`, data);
        console.log('updateShoppingListItem - Response:', response.status, response.data);
        return response.data;
    } catch (error) {
        console.error('updateShoppingListItem - Error:', error.message);
        throw error;
    }
};

// Delete a shopping list item at /shopping-list/delete/<itemId>/
export const deleteShoppingListItem = async (itemId) => {
    console.log('Executing deleteShoppingListItem for ID:', itemId);
    try {
        const response = await api.delete(`/shopping-list/delete/${itemId}/`);
        console.log('deleteShoppingListItem - Response:', response.status);
        return response.status === 204;
    } catch (error) {
        console.error('deleteShoppingListItem - Error:', error.message);
        throw error;
    }
};

// Add missing ingredients from a recipe to the shopping list at /shopping-list/add-missing/<recipeId>/
export const addMissingIngredientsToShoppingList = async (recipeId) => {
    console.log('Executing addMissingIngredientsToShoppingList for recipe ID:', recipeId);
    try {
        const response = await api.post(`/shopping-list/add-missing/${recipeId}/`);
        console.log('addMissingIngredientsToShoppingList - Response:', response.status, response.data);
        return response.data;
    } catch (error) {
        console.error('addMissingIngredientsToShoppingList - Error:', error.message);
        throw error;
    }
};

export default api;
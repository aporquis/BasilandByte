// frontend/src/api.js
// Utility file to configure an Axios instance for the web frontend.
// Manages API requests to the Django backend with token authentication and refresh logic.
// Uses a hardcoded base URL matching the mobile app setup.

import axios from "axios";
import { data } from "react-router-dom";

// Hardcode the base URL to the hosted backend on Render
export const API_BASE_URL = 'https://basilandbyte.onrender.com/api/recipes';

// Log the base URL for debugging during initialization
console.log('Initializing api.js - API_BASE_URL:', API_BASE_URL);

// Create an Axios instance with predefined configuration
const api = axios.create({
  baseURL: API_BASE_URL, // Base URL for all requests
  timeout: 10000, // 10-second timeout for requests
});

// Request interceptor to attach JWT token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token"); // Retrieve access token from localStorage
    console.log('Request Interceptor - Token:', token ? 'Present' : 'Absent');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`; // Add token to Authorization header
    } else {
      console.warn('No token available for request'); // Warn if no token is found
    }
    console.log('Request Interceptor - Full URL:', config.baseURL + config.url); // Log full request URL
    return config;
  },
  (error) => {
    console.error('Request Interceptor - Error:', error.message); // Log interceptor errors
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh on 401 errors
api.interceptors.response.use(
  (response) => {
    console.log('Response Interceptor - Success:', response.status, response.config.url); // Log successful response
    return response;
  },
  async (error) => {
    if (error.response && error.response.status === 401) { // Handle unauthorized errors
      console.log('401 Detected - Attempting token refresh');
      const refresh = localStorage.getItem("refresh_token"); // Get refresh token
      if (refresh) {
        try {
          const response = await axios.post(`${API_BASE_URL}/token/refresh/`, { refresh }); // Refresh token
          const newAccessToken = response.data.access;
          localStorage.setItem("access_token", newAccessToken); // Store new access token
          console.log('Token refreshed successfully:', newAccessToken);
          error.config.headers.Authorization = `Bearer ${newAccessToken}`; // Update original request
          return api(error.config); // Retry the original request
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError.response?.data || refreshError);
          localStorage.removeItem("access_token"); // Clear tokens on failure
          localStorage.removeItem("refresh_token");
          return Promise.reject(new Error("Authentication failed. Please log in again."));
        }
      } else {
        console.error('No refresh token available');
        localStorage.removeItem("access_token");
        return Promise.reject(new Error("No refresh token available. Please log in."));
      }
    }
    console.error('Response Interceptor - Error:', error.response?.data || error.message); // Log other errors
    return Promise.reject(error);
  }
);

// Fetch all recipes from root endpoint (/)
export const fetchRecipes = async () => {
  try {
    const response = await api.get('/');
    console.log('fetchRecipes - Response:', response.data);
    return response.data || []; // Return recipes or empty array if no data
  } catch (error) {
    console.error('Error fetching recipes:', error.message);
    return [];
  }
};

// Add a new recipe to /add/
export const addRecipe = async (recipeData) => {
  try {
    const response = await api.post('/add/', recipeData); 
    return response.data;
  } catch (error) {
    console.error('Error adding recipe:', error.response?.data || error.message);
    throw error;
  }
};

// Add an ingredient to a recipe at /add-ingredient/
export const addRecipeIngredient = async (recipeId, ingredientData) => {
  try {
    const response = await api.post('/add-ingredient/', { recipe_id: recipeId, ...ingredientData });
    console.log('addRecipeIngredient - Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error adding ingredient:', error.message);
    throw error;
  }
};

// Edit an existing recipe at /update/<id>/
export const editRecipe = async (id, formData) => {
  try {
    const response = await api.put(`/update/${id}/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    console.log('editRecipe - Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error updating recipe:', error.message);
    throw error;
  }
};

// Delete a recipe at /delete/<id>/
export const deleteRecipe = async (id) => {
  try {
    await api.delete(`/delete/${id}/`);
    console.log('deleteRecipe - Success');
    return true;
  } catch (error) {
    console.error('Error deleting recipe:', error.message);
    throw error;
  }
};

// Save a recipe to /save/
export const saveRecipe = async (recipeId) => {
  try {
    const response = await api.post('/save/', { recipe_id: recipeId });
    console.log('saveRecipe - Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error saving recipe:', error.message);
    throw error;
  }
};

// Fetch saved recipes from /saved-recipes/
export const getSavedRecipes = async () => {
  try {
    const response = await api.get('/saved-recipes/');
    console.log('getSavedRecipes - Response:', response.data);
    return response.data || [];
  } catch (error) {
    console.error('Error fetching saved recipes:', error.message);
    return [];
  }
};

// Unsave a recipe at /save/<savedItemId>/
export const unsaveRecipe = async (savedItemId) => {
  try {
    await api.delete(`/save/${savedItemId}/`);
    console.log('unsaveRecipe - Success');
    return true;
  } catch (error) {
    console.error('Error unsaving recipe:', error.message);
    throw error;
  }
};

// Add a recipe to the weekly planner at /weekly-plan/add/
export const addToWeeklyPlan = async (recipeId, day, mealType) => {
  try {
    const response = await api.post('/weekly-plan/add/', { recipe_id: recipeId, day, meal_type: mealType });
    console.log('addToWeeklyPlan - Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error adding to weekly plan:', error.message);
    throw error;
  }
};

// Fetch the weekly plan from /weekly-plan/
export const getWeeklyPlan = async () => {
  try {
    const response = await api.get('/weekly-plan/');
    console.log('getWeeklyPlan - Response:', response.data);
    return response.data || {};
  } catch (error) {
    console.error('Error fetching weekly plan:', error.message);
    return {};
  }
};

// Clear all meals for the week at /weekly-plan/clear/
export const clearWeeklyPlan = async () => {
  try {
    await api.delete('/weekly-plan/clear/');
    console.log('clearWeeklyPlan - Success');
    return true;
  } catch (error) {
    console.error('Error clearing weekly plan:', error.message);
    throw error;
  }
};

// Clear meals for a specific day at /weekly-plan/clear/<day>/
export const clearDayPlan = async (day) => {
  try {
    await api.delete(`/weekly-plan/clear/${day}/`);
    console.log('clearDayPlan - Success');
    return true;
  } catch (error) {
    console.error(`Error clearing plan for ${day}:`, error.message);
    throw error;
  }
};

// Register a new user at /register/
export const registerUser = async (username, password, firstName, lastName, email) => {
  try {
    const response = await api.post('/register/', { username, password, first_name: firstName, last_name: lastName, email });
    console.log('registerUser - Response:', response.data);
    const { access, refresh } = response.data.token || {};
    if (access) {
      localStorage.setItem("access_token", access); // Store access token
      localStorage.setItem("refresh_token", refresh || ''); // Store refresh token if present
    }
    return response.data;
  } catch (error) {
    console.error('Registration error:', error.message);
    throw error;
  }
};

// Log in a user at /login/
export const loginUser = async (username, password, source = "web") => {
  try {
    const response = await api.post('/login/', { username, password });
    console.log('loginUser - Response:', response.data);
    const { access, refresh } = response.data.token;
    localStorage.setItem("access_token", access); // Store access token
    localStorage.setItem("refresh_token", refresh); // Store refresh token
    return response.data;
  } catch (error) {
    console.error('Login error:', error.message);
    throw error;
  }
};

// Fetch user info from /user-info/
export const getUserInfo = async () => {
  const token = localStorage.getItem("access_token");
  if (!token) {
    throw new Error("No access token found.");
  }

  try {
    const response = await api.get('/user-info/', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching user info:', error.message);
    throw error;
  }
};

// Export user data from /export-user-data/
export const exportUserData = async () => {
  try {
    const response = await api.get('/export-user-data/', {
      responseType: 'blob', // Handle file download
    });
    console.log('exportUserData - Success');
    return response.data; // Return blob for file handling
  } catch (error) {
    console.error('Error exporting user data:', error.message);
    throw error;
  }
};

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
    // Don’t throw error to avoid blocking login; log and proceed
    return null; // Return null to indicate failure but allow login to continue
  }
};

export const addMissingIngredientsToShoppingList = async (recipeId) => {
  try {
    const response = await api.post(`/shopping-list/add-missing/${recipeId}/`);
    console.log('addMissingIngredientsToShoppingList - Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error adding missing ingredients:', error.message);
    throw error;
  }
};

export const addToShoppingList = async (itemData) => {
  try {
    const response = await api.post('/shopping-list/add/', itemData);
    console.log('addToShoppingList - Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error adding to shopping list:', error.message);
    throw error;
  }
};

export const getShoppingList = async () => {
  try {
    const response = await api.get('/shopping-list/');
    console.log('getShoppingList - Response:', response.data);
    return response.data || [];
  } catch (error) {
    console.error('Error fetching shopping list:', error.message);
    return [];
  }
};

export const updateShoppingListItem = async (itemId, data) => {
  try {
    const response = await api.put(`/shopping-list/update/${itemId}/`, data);
    console.log('updateShoppingListItem - Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error updating shopping list item:', error.message);
    throw error;
  }
};

export const deleteShoppingListItem = async (itemId) => {
  try {
    await api.delete(`/shopping-list/delete/${itemId}/`);
    console.log('deleteShoppingListItem - Success');
    return true;
  } catch (error) {
    console.error('Error deleting shopping list item:', error.message);
    throw error;
  }
};

export default api;
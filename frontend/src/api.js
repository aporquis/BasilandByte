import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL + "/api/recipes/";


//fetch recipes and show them to the screen of the WEBSITE for the users to use.
export const fetchRecipes = async () => {
    try {
        const response = await axios.get(API_BASE_URL);
        return response.data;
    } catch (error) {
        console.error("Error fetching recipes:", error);
        return [];
    }
};

//add a recipe to the database via the website using a form, this will give the recipe a specific ID number for easy look up, primary key type stuff 
export const addRecipe = async (formData) => {
    try {
        const response = await axios.post(`${API_BASE_URL}add/`, formData, {
            headers: { "Content-Type": "multipart/form-data" }
        });
        return response.data;
    } catch (error) {
        console.error("Error adding recipe:", error);
        return null;
    }
};

//edit a recipe that we have already added into the database by ID
export const editRecipe = async (id, formData) => {
    try {
        const response = await axios.put(`${API_BASE_URL}update/${id}/`, formData, {
            headers: { "Content-Type": "multipart/form-data" }
        });
        return response.data;
    } catch (error) {
        console.error("Error updating recipe:", error);
        return null;
    }
};

//delete a recipe that we have already added into the database by ID
export const deleteRecipe = async (id) => {
    try {
        await axios.delete(`${API_BASE_URL}delete/${id}/`);
        return true;
    } catch (error) {
        console.error("Error deleting recipe:", error);
        return false;
    }
};

// User Registration - Allows users to create an account in the system.
export const registerUser = async (username, password) => {
    try {
        const response = await axios.post(`${API_BASE_URL}register/`, { username, password });
        return response.data; // Returns success message and user token.
    } catch (error) {
        console.error("Registration error:", error.response?.data || error);
        throw error;
    }
};

// User Login - Authenticates users and returns a JWT token for further API requests.
export const loginUser = async (username, password) => {
    try {
        const response = await axios.post(`${API_BASE_URL}login/`, { username, password });
        const token = response.data.token.access; // Get the access token.
        localStorage.setItem("token", token); // Store token for authentication.
        return response.data;
    } catch (error) {
        console.error("Login error:", error.response?.data || error);
        throw error;
    }
};

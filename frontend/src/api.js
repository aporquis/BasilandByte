import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000/api/recipes/";

// Fetch all recipes
export const fetchRecipes = async () => {
    try {
        const response = await axios.get(`${API_URL}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching recipes:", error);
        return [];
    }
};

// Add a new recipe
export const addRecipe = async (recipe) => {
    try {
        const response = await axios.post(`${API_URL}add/`, recipe);
        return response.data;
    } catch (error) {
        console.error("Error adding recipe:", error);
        return null;
    }
};

// Edit an existing recipe
export const editRecipe = async (id, updatedRecipe) => {
    try {
        const response = await axios.put(`${API_URL}update/${id}/`, updatedRecipe);
        return response.data;
    } catch (error) {
        console.error("Error updating recipe:", error);
        return null;
    }
};

// Delete a recipe
export const deleteRecipe = async (id) => {
    try {
        await axios.delete(`${API_URL}delete/${id}/`);
        return true;
    } catch (error) {
        console.error("Error deleting recipe:", error);
        return false;
    }
};

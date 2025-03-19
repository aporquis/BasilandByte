import axios from "axios";

<<<<<<< HEAD
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
=======
const API_BASE_URL = (process.env.REACT_APP_API_BASE_URL || "http://localhost:8000").replace(/\/+$/, "") + "/api/recipes/";

const getAuthHeaders = () => {
  const token = localStorage.getItem("access_token");
  console.log("Sending token in headers:", token);
  if (!token) {
    console.error("No token available for request!");
    throw new Error("No access token found");
  }
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  };
};

const refreshToken = async () => {
  const refresh = localStorage.getItem("refresh_token");
  if (!refresh) {
    console.error("No refresh token available!");
    return null;
  }
  try {
    const response = await axios.post(
      `${(process.env.REACT_APP_API_BASE_URL || "http://localhost:8000").replace(/\/+$/, "")}/api/token/refresh/`,
      { refresh }
    );
    const newAccessToken = response.data.access;
    localStorage.setItem("access_token", newAccessToken);
    console.log("Token refreshed successfully:", newAccessToken);
    return newAccessToken;
  } catch (error) {
    console.error("Token refresh failed:", error.response?.data || error);
    return null;
  }
};

export const fetchRecipes = async () => {
  try {
    const response = await axios.get(API_BASE_URL);
    return response.data;
  } catch (error) {
    console.error("Error fetching recipes:", error);
    return [];
  }
};

export const addRecipe = async (formData) => {
  try {
    console.log("Posting to:", `${API_BASE_URL}add/`);
    for (let [key, value] of formData.entries()) {
      console.log(`FormData - ${key}:`, value);
    }
    const response = await axios.post(`${API_BASE_URL}add/`, formData, getAuthHeaders());
    return response.data;
  } catch (error) {
    if (error.response?.status === 401) {
      const newToken = await refreshToken();
      if (newToken) {
        const retryResponse = await axios.post(`${API_BASE_URL}add/`, formData, getAuthHeaders());
        return retryResponse.data;
      }
      throw new Error("Authentication failed. Please log in again.");
    }
    console.error("Error adding recipe:", error.response?.status, error.response?.data || error);
    return null;
  }
};

export const addRecipeIngredient = async (recipeId, ingredientData) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}add-ingredient/`,
      { recipe_id: recipeId, ...ingredientData },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error adding ingredient:", error.response?.data || error);
    return null;
  }
};

export const editRecipe = async (id, formData) => {
  try {
    const response = await axios.put(`${API_BASE_URL}update/${id}/`, formData, getAuthHeaders());
    return response.data;
  } catch (error) {
    if (error.response?.status === 401) {
      const newToken = await refreshToken();
      if (newToken) {
        const retryResponse = await axios.put(`${API_BASE_URL}update/${id}/`, formData, getAuthHeaders());
        return retryResponse.data;
      }
      throw new Error("Authentication failed. Please log in again.");
    }
    console.error("Error updating recipe:", error.response?.data || error);
    return null;
  }
};

export const deleteRecipe = async (id) => {
  try {
    await axios.delete(`${API_BASE_URL}delete/${id}/`, getAuthHeaders());
    return true;
  } catch (error) {
    if (error.response?.status === 401) {
      const newToken = await refreshToken();
      if (newToken) {
        await axios.delete(`${API_BASE_URL}delete/${id}/`, getAuthHeaders());
        return true;
      }
      throw new Error("Authentication failed. Please log in again.");
    }
    console.error("Error deleting recipe:", error.response?.data || error);
    return false;
  }
};

export const saveRecipe = async (recipeId) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}save/`,
      { recipe_id: recipeId },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error saving recipe:", error.response?.data || error);
    return null;
  }
};

export const getSavedRecipes = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}saved-recipes/`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching saved recipes:", error.response?.data || error);
    return [];
  }
};

export const unsaveRecipe = async (savedItemId) => {
  try {
    await axios.delete(`${API_BASE_URL}save/${savedItemId}/`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
    });
    return true;
  } catch (error) {
    console.error("Error unsaving recipe:", error.response?.data || error);
    return false;
  }
};

// Add a recipe to the weekly planner
export const addToWeeklyPlan = async (recipeId, day, mealType) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}weekly-plan/add/`,
      { recipe_id: recipeId, day, meal_type: mealType },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error adding to weekly plan:", error.response?.data || error);
    return null;
  }
};

// Fetch the weekly plan
export const getWeeklyPlan = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}weekly-plan/`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
    });
    return response.data; // Expected: { "Monday": [...], "Tuesday": [...], ... }
  } catch (error) {
    console.error("Error fetching weekly plan:", error.response?.data || error);
    return {};
  }
};

// Clear all meals for the week
export const clearWeeklyPlan = async () => {
  try {
    await axios.delete(`${API_BASE_URL}weekly-plan/clear/`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
    });
    return true;
  } catch (error) {
    console.error("Error clearing weekly plan:", error.response?.data || error);
    return false;
  }
};

// Clear meals for a specific day
export const clearDayPlan = async (day) => {
  try {
    await axios.delete(`${API_BASE_URL}weekly-plan/clear/${day}/`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
    });
    return true;
  } catch (error) {
    console.error(`Error clearing plan for ${day}:`, error.response?.data || error);
    return false;
  }
};

export const registerUser = async (username, password) => {
  try {
    const response = await axios.post(`${API_BASE_URL}register/`, { username, password });
    return response.data;
  } catch (error) {
    console.error("Registration error:", error.response?.data || error);
    throw error;
  }
};

export const loginUser = async (username, password) => {
  try {
    const response = await axios.post(`${API_BASE_URL}login/`, { username, password });
    const token = response.data.token.access;
    localStorage.setItem("token", token);
    return response.data;
  } catch (error) {
    console.error("Login error:", error.response?.data || error);
    throw error;
  }
};
>>>>>>> origin/main

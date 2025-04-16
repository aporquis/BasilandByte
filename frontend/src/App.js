// frontend/src/App.js
// Main application component managing routing and recipe data.
// Displays a list of recipes with search and filter options.
// Uses BrowserRouter for navigation and integrates with api.js functions.

import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import { fetchRecipes, saveRecipe, getSavedRecipes, unsaveRecipe } from "./api"; // Import API functions
import Navbar from "./Navbar";
import Home from "./Home";
import Login from "./Login";
import Register from "./Register";
import Dashboard from "./Dashboard";
import AddRecipe from "./AddRecipe";
import SavedRecipes from "./SavedRecipes";
import WeeklyPlanner from "./WeeklyPlanner";
import BasilBytePolices from "./BasilBytePolicies";
import PersonalPantry from "./PersonalPantry";
import { API_BASE_URL } from "./api";

function RecipeApp() {
  // State for recipes, saved recipes, and filters
  const [recipes, setRecipes] = useState([]);
  const [savedRecipes, setSavedRecipes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem("access_token"); // Check login status

  // Fetch recipes and saved recipes on mount or login status change
  useEffect(() => {
    const loadData = async () => {
      const recipeData = await fetchRecipes(); // Fetch all recipes
      if (recipeData) setRecipes(recipeData);

      if (isLoggedIn) {
        const savedData = await getSavedRecipes(); // Fetch saved recipes if logged in
        if (savedData) setSavedRecipes(savedData);
      }
    };
    loadData();
  }, [isLoggedIn]);

  // Filter recipes based on search term and category
  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch =
      recipe.recipe_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recipe.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || recipe.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Save a recipe and update state
  const handleSaveRecipe = async (recipeId) => {
    try {
      const savedData = await saveRecipe(recipeId);
      if (savedData) setSavedRecipes([...savedRecipes, savedData]);
    } catch (error) {
      console.error("Error saving recipe:", error.message);
    }
  };

  // Unsave a recipe and update state
  const handleUnsaveRecipe = async (savedItemId) => {
    try {
      const success = await unsaveRecipe(savedItemId);
      if (success) setSavedRecipes(savedRecipes.filter(sr => sr.id !== savedItemId));
    } catch (error) {
      console.error("Error unsaving recipe:", error.message);
    }
  };

  // Check if a recipe is saved
  const isRecipeSaved = (recipeId) => savedRecipes.some(sr => sr.recipe === recipeId);

  // Get the saved item ID for unsaving
  const getSavedItemId = (recipeId) => {
    const saved = savedRecipes.find(sr => sr.recipe === recipeId);
    return saved ? saved.id : null;
  };

  return (
    <div>
      {/* Search and filter controls */}
      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Search recipes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ marginRight: "10px", padding: "5px" }}
        />
        <button onClick={() => setSelectedCategory("All")}>All</button>
        <button onClick={() => setSelectedCategory("Breakfast")}>Breakfast</button>
        <button onClick={() => setSelectedCategory("Lunch")}>Lunch</button>
        <button onClick={() => setSelectedCategory("Dinner")}>Dinner</button>
        <button onClick={() => setSelectedCategory("Side Dishes")}>Side Dishes</button>
      </div>

      {/* Recipe list */}
      <h2>All Recipes</h2>
      <ul>
        {filteredRecipes.map((recipe) => (
          <li key={recipe.id}>
            <strong>{recipe.recipe_name} | <em>Created by:</em> {recipe.username}</strong> - {recipe.description}
            <br />
            <br />
            <em class="Ingredients">Ingredients:</em><br></br> {recipe.recipe_ingredients && recipe.recipe_ingredients.length > 0 ? (
              <ul>
                {recipe.recipe_ingredients.map(ing => (
                  <li key={ing.id}>{ing.quantity} {ing.unit} {ing.ingredient_name}</li>
                ))}
              </ul>
            ) : "No ingredients listed"}
            <br />
            <em class="Instructions">Instructions:</em> {recipe.instructions}
            <br />
            {recipe.image && (
              <img
                src={`${API_BASE_URL}/${recipe.image}`} // Use hardcoded URL
                alt={recipe.recipe_name}
                style={{ width: "200px", height: "150px", objectFit: "cover", marginTop: "10px" }}
              />
            )}
            <br />
            {isLoggedIn && (
              <>
                {isRecipeSaved(recipe.id) ? (
                  <button onClick={() => handleUnsaveRecipe(getSavedItemId(recipe.id))}>Unsave</button>
                ) : (
                  <button onClick={() => handleSaveRecipe(recipe.id)}>Save</button>
                )}
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

// Main app with routing
function MainApp() {
  const isLoggedIn = !!localStorage.getItem("access_token"); //added this to ensure that users are logged in to access the nav bar features
  return (
    <Router>
      <Navbar /> {/* Navigation bar */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/recipes" element={<RecipeApp />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={isLoggedIn ? <Dashboard /> : <Login />} /> //adjusted on 4/2/2025 to ensure that a user is logged in properly
        <Route path="/add-recipe" element={isLoggedIn ? <AddRecipe /> : <Login />} /> //must be logged in to add recipe
        <Route path="/saved-recipes" element={isLoggedIn ? <SavedRecipes /> : <Login />} />
        <Route path="/weekly-planner" element={isLoggedIn ? <WeeklyPlanner /> : <Login />} />
        <Route path="/policies" element={isLoggedIn ? <BasilBytePolices /> : <Login />} />//new as of 4/2/2025 for our new policies page
        <Route path="/pantry" element={isLoggedIn ? <PersonalPantry /> : <Login />} />//new as of 4/2/2025 for our pantry page
      </Routes>
    </Router>
  );
}

export default MainApp;
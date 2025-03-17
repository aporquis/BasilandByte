import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import { fetchRecipes, saveRecipe, getSavedRecipes, unsaveRecipe } from "./api";
import Navbar from "./Navbar";
import Home from "./Home";
import Login from "./Login";
import Register from "./Register";
import Dashboard from "./Dashboard";
import AddRecipe from "./AddRecipe";
import SavedRecipes from "./SavedRecipes";
import WeeklyPlanner from "./WeeklyPlanner"; // New import

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8000";

function RecipeApp() {
  const [recipes, setRecipes] = useState([]);
  const [savedRecipes, setSavedRecipes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem("access_token");

  useEffect(() => {
    const loadData = async () => {
      const recipeData = await fetchRecipes();
      if (recipeData) setRecipes(recipeData);

      if (isLoggedIn) {
        const savedData = await getSavedRecipes();
        if (savedData) setSavedRecipes(savedData);
      }
    };
    loadData();
  }, [isLoggedIn]);

  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch =
      recipe.recipe_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recipe.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || recipe.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSaveRecipe = async (recipeId) => {
    try {
      const savedData = await saveRecipe(recipeId);
      if (savedData) setSavedRecipes([...savedRecipes, savedData]);
    } catch (error) {
      console.error("Error saving recipe:", error);
    }
  };

  const handleUnsaveRecipe = async (savedItemId) => {
    try {
      const success = await unsaveRecipe(savedItemId);
      if (success) setSavedRecipes(savedRecipes.filter(sr => sr.id !== savedItemId));
    } catch (error) {
      console.error("Error unsaving recipe:", error);
    }
  };

  const isRecipeSaved = (recipeId) => savedRecipes.some(sr => sr.recipe === recipeId);
  const getSavedItemId = (recipeId) => {
    const saved = savedRecipes.find(sr => sr.recipe === recipeId);
    return saved ? saved.id : null;
  };

  return (
    <div>
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

      <h2>All Recipes</h2>
      <ul>
        {filteredRecipes.map((recipe) => (
          <li key={recipe.id}>
            <strong>{recipe.recipe_name}</strong> - {recipe.description}
            <br />
            <em>Created by:</em> {recipe.username}
            <br />
            <em>Ingredients:</em> {recipe.recipe_ingredients && recipe.recipe_ingredients.length > 0 ? (
              <ul>
                {recipe.recipe_ingredients.map(ing => (
                  <li key={ing.id}>{ing.quantity} {ing.unit} {ing.ingredient_name}</li>
                ))}
              </ul>
            ) : "No ingredients listed"}
            <br />
            <em>Instructions:</em> {recipe.instructions}
            <br />
            {recipe.image && (
              <img
                src={`${API_BASE_URL}/${recipe.image}`}
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

function MainApp() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/recipes" element={<RecipeApp />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/add-recipe" element={<AddRecipe />} />
        <Route path="/saved-recipes" element={<SavedRecipes />} />
        <Route path="/weekly-planner" element={<WeeklyPlanner />} /> {/* New route */}
      </Routes>
    </Router>
  );
}

export default MainApp;
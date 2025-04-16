// frontend/src/SavedRecipes.js
// Component to display and manage saved recipes.
// Allows unsaving recipes and adding them to the weekly planner.
// Uses api.js functions for data fetching and updates.

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchRecipes, getSavedRecipes, unsaveRecipe, addToWeeklyPlan } from "./api"; // Import API functions

function SavedRecipes() {
  const [recipes, setRecipes] = useState([]); // State for all recipes (for lookup)
  const [savedRecipes, setSavedRecipes] = useState([]); // State for saved recipes
  const [selectedDay, setSelectedDay] = useState(""); // State for selected day in planner
  const [selectedMeal, setSelectedMeal] = useState(""); // State for selected meal type in planner
  const navigate = useNavigate(); // Hook for navigation
  const isLoggedIn = !!localStorage.getItem("access_token"); // Check login status

  // Fetch recipes and saved recipes on mount
  useEffect(() => {
    const loadData = async () => {
      if (!isLoggedIn) {
        navigate("/login"); // Redirect to login if not authenticated
        return;
      }
      const recipeData = await fetchRecipes(); // Fetch all recipes
      if (recipeData) setRecipes(recipeData);
      const savedData = await getSavedRecipes(); // Fetch saved recipes
      if (savedData) setSavedRecipes(savedData);
    };
    loadData();
  }, [isLoggedIn, navigate]);

  // Handle unsaving a recipe
  const handleUnsaveRecipe = async (savedItemId) => {
    try {
      const success = await unsaveRecipe(savedItemId); // Call API to unsave
      if (success) setSavedRecipes(savedRecipes.filter(sr => sr.id !== savedItemId)); // Update state
    } catch (error) {
      console.error("Error unsaving recipe:", error.message); // Log error
    }
  };

  // Handle adding a recipe to the weekly planner
  const handleAddToPlan = async (recipeId) => {
    if (!selectedDay || !selectedMeal) {
      alert("Please select a day and meal type."); // Validate selection
      return;
    }
    try {
      await addToWeeklyPlan(recipeId, selectedDay, selectedMeal); // Call API to add to plan
      alert(`Added to ${selectedDay} - ${selectedMeal}`); // Notify user
      setSelectedDay(""); // Reset day selection
      setSelectedMeal(""); // Reset meal selection
    } catch (error) {
      console.error("Error adding to plan:", error.message); // Log error
    }
  };

  return (
    <div>
      <h2>Your Saved Recipes</h2>
      {isLoggedIn ? (
        <>
          {/* Dropdowns for selecting day and meal type */}
          <div style={{ marginBottom: "20px" }}>
            <select
              value={selectedDay}
              onChange={(e) => setSelectedDay(e.target.value)}
              style={{ marginRight: "10px" }}
            >
              <option value="">Select Day</option>
              <option value="Monday">Monday</option>
              <option value="Tuesday">Tuesday</option>
              <option value="Wednesday">Wednesday</option>
              <option value="Thursday">Thursday</option>
              <option value="Friday">Friday</option>
              <option value="Saturday">Saturday</option>
              <option value="Sunday">Sunday</option>
            </select>
            <select
              value={selectedMeal}
              onChange={(e) => setSelectedMeal(e.target.value)}
            >
              <option value="">Select Meal</option>
              <option value="Breakfast">Breakfast</option>
              <option value="Lunch">Lunch</option>
              <option value="Dinner">Dinner</option>
            </select>
          </div>
          {/* List of saved recipes */}
          <ul>
            {savedRecipes.map((saved) => {
              const recipe = recipes.find(r => r.id === saved.recipe); // Match saved recipe to full recipe
              if (!recipe) return null; // Skip if no match
              return (
                <li key={saved.id}>
                  <strong>{recipe.recipe_name}</strong>
                  <br />
                  <em>Created by:</em> {recipe.username}
                    - {recipe.description}
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
                      src={`https://basilandbyte.onrender.com/api/recipes/${recipe.image}`} // Hardcoded URL
                      alt={recipe.recipe_name}
                      style={{ width: "200px", height: "150px", objectFit: "cover", marginTop: "10px" }}
                    />
                  )}
                  <br />
                  <button onClick={() => handleUnsaveRecipe(saved.id)}>Unsave</button>
                  <button onClick={() => handleAddToPlan(recipe.id)}>Add to Plan</button>
                </li>
              );
            })}
          </ul>
        </>
      ) : (
        <p>Please log in to view your saved recipes.</p> // Message for unauthenticated users
      )}
    </div>
  );
}

export default SavedRecipes;
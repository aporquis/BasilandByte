// frontend/src/WeeklyPlanner.js
// Component to display and manage the weekly meal planner.
// Fetches recipes and weekly plan data using api.js functions.
// Allows clearing all meals or specific days, with color-coded day indicators.

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchRecipes, getWeeklyPlan, clearWeeklyPlan, clearDayPlan } from "./api"; // Import API functions

function WeeklyPlanner() {
  const [recipes, setRecipes] = useState([]); // State for all recipes (for lookup)
  const [weeklyPlan, setWeeklyPlan] = useState({}); // State for weekly plan data
  const navigate = useNavigate(); // Hook for navigation
  const isLoggedIn = !!localStorage.getItem("access_token"); // Check login status

  // Array of days for consistent display
  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  // Fetch recipes and weekly plan on component mount
  useEffect(() => {
    const loadData = async () => {
      if (!isLoggedIn) {
        navigate("/login"); // Redirect to login if not authenticated
        return;
      }
      const recipeData = await fetchRecipes(); // Fetch all recipes
      if (recipeData) setRecipes(recipeData);
      const planData = await getWeeklyPlan(); // Fetch weekly plan
      if (planData) setWeeklyPlan(planData);
    };
    loadData();
  }, [isLoggedIn, navigate]);

  // Determine background color for each day based on meal count
  const getDayColor = (day) => {
    const meals = weeklyPlan[day] || [];
    if (meals.length === 0) return "red"; // No meals planned
    if (meals.length <= 2) return "yellow"; // 1-2 meals
    return "green"; // 3 or more meals
  };

  // Clear all meals for the week
  const handleClearAll = async () => {
    try {
      const success = await clearWeeklyPlan(); // Call API to clear weekly plan
      if (success) setWeeklyPlan({}); // Reset state on success
    } catch (error) {
      console.error("Error clearing all meals:", error.message); // Log error
    }
  };

  // Clear meals for a specific day
  const handleClearDay = async (day) => {
    try {
      const success = await clearDayPlan(day); // Call API to clear day
      if (success) {
        setWeeklyPlan(prev => {
          const newPlan = { ...prev };
          delete newPlan[day]; // Remove day from state
          return newPlan;
        });
      }
    } catch (error) {
      console.error(`Error clearing ${day}:`, error.message); // Log error
    }
  };

  return (
    <div>
      <h2>Weekly Planner</h2>
      {isLoggedIn ? (
        <>
          {/* Display day boxes with color indicators */}
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
            {daysOfWeek.map(day => (
              <div
                key={day}
                style={{
                  width: "100px",
                  height: "50px",
                  backgroundColor: getDayColor(day),
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "4px",
                  color: "white",
                  fontWeight: "bold",
                }}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Button to clear all meals */}
          <button onClick={handleClearAll}>Clear All Meals</button>

          {/* Display meals for each day */}
          {daysOfWeek.map(day => (
            <div key={day} style={{ marginTop: "20px" }}>
              <h3>
                {day} <button onClick={() => handleClearDay(day)}>Clear Day</button>
              </h3>
              <ul>
                {(weeklyPlan[day] || []).map((plan, index) => {
                  const recipe = recipes.find(r => r.id === plan.recipe); // Match plan to recipe
                  return recipe ? (
                    <li key={index}>
                      <strong>{recipe.recipe_name}</strong> - {plan.meal_type}
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
                          src={`https://basilandbyte.onrender.com/api/recipes/${recipe.image}`} // Hardcoded URL
                          alt={recipe.recipe_name}
                          style={{ width: "200px", height: "150px", objectFit: "cover", marginTop: "10px" }}
                        />
                      )}
                    </li>
                  ) : null;
                })}
              </ul>
            </div>
          ))}
        </>
      ) : (
        <p>Please log in to view your weekly planner.</p> // Message for unauthenticated users
      )}
    </div>
  );
}

export default WeeklyPlanner;
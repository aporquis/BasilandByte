import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchRecipes, getWeeklyPlan, clearWeeklyPlan, clearDayPlan } from "./api";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8000";

function WeeklyPlanner() {
  const [recipes, setRecipes] = useState([]); // All recipes for lookup
  const [weeklyPlan, setWeeklyPlan] = useState({}); // Weekly plan data
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem("access_token");

  // Days of the week for display
  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  // Load weekly plan and recipes on mount
  useEffect(() => {
    const loadData = async () => {
      if (!isLoggedIn) {
        navigate("/login");
        return;
      }
      const recipeData = await fetchRecipes();
      if (recipeData) setRecipes(recipeData);
      const planData = await getWeeklyPlan();
      if (planData) setWeeklyPlan(planData);
    };
    loadData();
  }, [isLoggedIn, navigate]);

  // Determine color for each day based on number of meals planned
  const getDayColor = (day) => {
    const meals = weeklyPlan[day] || [];
    if (meals.length === 0) return "red"; // No meals
    if (meals.length <= 2) return "yellow"; // 1-2 meals
    return "green"; // 3 meals
  };

  // Handle clearing all meals for the week
  const handleClearAll = async () => {
    try {
      const success = await clearWeeklyPlan();
      if (success) setWeeklyPlan({});
    } catch (error) {
      console.error("Error clearing all meals:", error);
    }
  };

  // Handle clearing meals for a specific day
  const handleClearDay = async (day) => {
    try {
      const success = await clearDayPlan(day);
      if (success) {
        setWeeklyPlan(prev => {
          const newPlan = { ...prev };
          delete newPlan[day];
          return newPlan;
        });
      }
    } catch (error) {
      console.error(`Error clearing ${day}:`, error);
    }
  };

  return (
    <div>
      <h2>Weekly Planner</h2>
      {isLoggedIn ? (
        <>
          {/* Day boxes at the top */}
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

          {/* Clear All Meals button */}
          <button onClick={handleClearAll}>Clear All Meals</button>

          {/* Weekly plan display */}
          {daysOfWeek.map(day => (
            <div key={day} style={{ marginTop: "20px" }}>
              <h3>{day} <button onClick={() => handleClearDay(day)}>Clear Day</button></h3>
              <ul>
                {(weeklyPlan[day] || []).map((plan, index) => {
                  const recipe = recipes.find(r => r.id === plan.recipe);
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
                          src={`${API_BASE_URL}/${recipe.image}`}
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
        <p>Please log in to view your weekly planner.</p>
      )}
    </div>
  );
}

export default WeeklyPlanner;
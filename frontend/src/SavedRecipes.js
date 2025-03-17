import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchRecipes, getSavedRecipes, unsaveRecipe, addToWeeklyPlan } from "./api";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8000";

function SavedRecipes() {
  const [recipes, setRecipes] = useState([]);
  const [savedRecipes, setSavedRecipes] = useState([]);
  const [selectedDay, setSelectedDay] = useState(""); // For planning
  const [selectedMeal, setSelectedMeal] = useState(""); // For planning
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem("access_token");

  useEffect(() => {
    const loadData = async () => {
      if (!isLoggedIn) {
        navigate("/login");
        return;
      }
      const recipeData = await fetchRecipes();
      if (recipeData) setRecipes(recipeData);
      const savedData = await getSavedRecipes();
      if (savedData) setSavedRecipes(savedData);
    };
    loadData();
  }, [isLoggedIn, navigate]);

  const handleUnsaveRecipe = async (savedItemId) => {
    try {
      const success = await unsaveRecipe(savedItemId);
      if (success) setSavedRecipes(savedRecipes.filter(sr => sr.id !== savedItemId));
    } catch (error) {
      console.error("Error unsaving recipe:", error);
    }
  };

  const handleAddToPlan = async (recipeId) => {
    if (!selectedDay || !selectedMeal) {
      alert("Please select a day and meal type.");
      return;
    }
    try {
      await addToWeeklyPlan(recipeId, selectedDay, selectedMeal);
      alert(`Added to ${selectedDay} - ${selectedMeal}`);
      setSelectedDay(""); // Reset selection
      setSelectedMeal("");
    } catch (error) {
      console.error("Error adding to plan:", error);
    }
  };

  return (
    <div>
      <h2>Your Saved Recipes</h2>
      {isLoggedIn ? (
        <>
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
          <ul>
            {savedRecipes.map((saved) => {
              const recipe = recipes.find(r => r.id === saved.recipe);
              if (!recipe) return null;
              return (
                <li key={saved.id}>
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
                  <button onClick={() => handleUnsaveRecipe(saved.id)}>Unsave</button>
                  <button onClick={() => handleAddToPlan(recipe.id)}>Add to Plan</button>
                </li>
              );
            })}
          </ul>
        </>
      ) : (
        <p>Please log in to view your saved recipes.</p>
      )}
    </div>
  );
}

export default SavedRecipes;
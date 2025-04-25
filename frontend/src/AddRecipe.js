// frontend/src/AddRecipe.js
// Component to add a new recipe with ingredients.
// Uses addRecipe and addRecipeIngredient from api.js for backend interaction.
// Navigates to /recipes on successful submission.

import axios from "axios";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { addRecipe, addRecipeIngredient } from "./api"; // Import API functions
import UploadImage from "./components/UploadImage"; // needed to store the url to images

function AddRecipe() {
  // State for recipe form fields
  const [recipeName, setRecipeName] = useState("");
  const [description, setDescription] = useState("");
  const [ingredients, setIngredients] = useState([{ name: "", whole: "", fraction: "", unit: "" }]);
  const [instructions, setInstructions] = useState("");
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");
  const navigate = useNavigate();

  // Add a new empty ingredient field
  const handleAddIngredient = () => {
    setIngredients([...ingredients, { name: "", whole: "", fraction: "", unit: "" }]);
  };

  // Update ingredient field values
  const handleIngredientChange = (index, field, value) => {
    const newIngredients = [...ingredients];
    newIngredients[index][field] = value;
    setIngredients(newIngredients);
  };
  // To handle uploaded image result
  const handleImageUpload = (url) => {
    setUploadedImageUrl(url);
  };

  // Handle form submission to add recipe and ingredients
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission
    /*
    const formData = new FormData();
    formData.append("recipe_name", recipeName);
    formData.append("description", description);
    formData.append("instructions", instructions);
    if (image) formData.append("image", image); // Add image if selected
    */
    const recipeData = {
      recipe_name: recipeName,
      description: description,
      instructions: instructions,
    };
    if(uploadedImageUrl){
      recipeData.image_url = uploadedImageUrl;
    }

    try {
      const addedRecipe = await addRecipe(recipeData); // Add recipe via API
      if (addedRecipe) {
        // Add each ingredient if all fields are filled
        for (const ingr of ingredients) {
          const hasQuantity = ingr.whole || ingr.fraction;
          if (ingr.name && hasQuantity && ingr.unit){
            let quantityString = "";
            if (ingr.whole && ingr.fraction){
              quantityString = `${ingr.whole} ${ingr.fraction}`;
            } else if (ingr.whole){
              quantityString = `${ingr.whole}`;
            } else {
              quantityString = `${ingr.fraction}`;
            }
            await addRecipeIngredient(addedRecipe.id, {
              ingredient_name: ingr.name,
              quantity: quantityString,
              unit: ingr.unit,
            });
          }
        }
        // Reset form fields
        setRecipeName("");
        setDescription("");
        setIngredients([{ name: "", whole: "", fraction: "", unit: "" }]);
        setInstructions("");
        setUploadedImageUrl("");
        navigate("/recipes"); // Redirect to recipes page
      }
    } catch (error) {
      console.error("Error adding recipe:", error.message);
      alert("Failed to add recipe. Please try again."); // Show error to user
    }
  };

  return (
    <div>
      <h2>Add a Recipe</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Recipe Name"
          value={recipeName}
          onChange={(e) => setRecipeName(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Recipe Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
        <div>
          <h3>Ingredients</h3>
          {ingredients.map((ing, index) => (
            <div key={index} style={{ marginBottom: "10px" }}>
              <input
                type="text"
                placeholder="Ingredient Name"
                value={ing.name}
                onChange={(e) => handleIngredientChange(index, "name", e.target.value)}
                required
                style={{ marginRight: "10px" }}
              />
              <input
                type="number"
                placeholder="Whole"
                value={ing.whole}
                onChange={(e) => handleIngredientChange(index, "whole", e.target.value)}
                min="0"
                style={{ width: "80px", marginRight: "5px" }}
              />
              <select
                value={ing.fraction}
                onChange={(e) => handleIngredientChange(index, "fraction", e.target.value)}
                style={{ marginRight: "10px" }}
              >
                <option value="">-</option>
                <option value="1/8">1/8</option>
                <option value="1/4">1/4</option>
                <option value="1/3">1/3</option>
                <option value="1/2">1/2</option>
                <option value="2/3">2/3</option>
                <option value="3/4">3/4</option>
              </select>
              <select
                value={ing.unit}
                onChange={(e) => handleIngredientChange(index, "unit", e.target.value)}
                required
                style={{ marginRight: "10px" }}
              >
                <option value="">Select Unit</option>
                <option value="whole">Whole</option>
                <option value="cups">Cups</option>
                <option value="tablespoons">Tablespoons</option>
                <option value="teaspoons">Teaspoons</option>
                <option value="lbs">Pounds</option>
                <option value="oz">Ounces</option>
                <option value="g">Grams</option>
              </select>
            </div>
          ))}
          <button type="button" onClick={handleAddIngredient}>Add Another Ingredient</button>
        </div>
        <input
          type="text"
          placeholder="Instructions"
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
        />
        <UploadImage onUploadSuccess={handleImageUpload} />
        <button type="submit" disabled={!recipeName}>Add Recipe</button>
      </form>
    </div>
  );
}

export default AddRecipe;
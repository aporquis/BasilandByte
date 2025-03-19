import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { addRecipe, addRecipeIngredient } from "./api";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8000";

function AddRecipe() {
  const [recipeName, setRecipeName] = useState("");
  const [description, setDescription] = useState("");
  const [ingredients, setIngredients] = useState([{ name: "", quantity: "", unit: "" }]);
  const [instructions, setInstructions] = useState("");
  const [image, setImage] = useState(null);
  const navigate = useNavigate();

  const handleAddIngredient = () => {
    setIngredients([...ingredients, { name: "", quantity: "", unit: "" }]);
  };

  const handleIngredientChange = (index, field, value) => {
    const newIngredients = [...ingredients];
    newIngredients[index][field] = value;
    setIngredients(newIngredients);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("recipe_name", recipeName);
    formData.append("description", description);
    formData.append("instructions", instructions);
    if (image) formData.append("image", image);

    try {
      const addedRecipe = await addRecipe(formData);
      if (addedRecipe) {
        for (const ingr of ingredients) {
          if (ingr.name && ingr.quantity && ingr.unit) {
            await addRecipeIngredient(addedRecipe.id, {
              ingredient_name: ingr.name,
              quantity: parseFloat(ingr.quantity),
              unit: ingr.unit,
            });
          }
        }
        setRecipeName("");
        setDescription("");
        setIngredients([{ name: "", quantity: "", unit: "" }]);
        setInstructions("");
        setImage(null);
        navigate("/recipes");
      }
    } catch (error) {
      console.error("Error adding recipe:", error.message || error);
      alert("Failed to add recipe. Please try again.");
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
                placeholder="Quantity"
                value={ing.quantity}
                onChange={(e) => handleIngredientChange(index, "quantity", e.target.value)}
                required
                step="0.1"
                min="0"
                style={{ width: "80px", marginRight: "10px" }}
              />
              <select
                value={ing.unit}
                onChange={(e) => handleIngredientChange(index, "unit", e.target.value)}
                required
                style={{ marginRight: "10px" }}
              >
                <option value="">Select Unit</option>
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
          required
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files[0])}
        />
        <button type="submit">Add Recipe</button>
      </form>
    </div>
  );
}

export default AddRecipe;
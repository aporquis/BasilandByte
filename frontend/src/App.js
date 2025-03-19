<<<<<<< HEAD
// App.js
import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import { fetchRecipes, addRecipe, editRecipe, deleteRecipe } from "./api";
=======
import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import { fetchRecipes, saveRecipe, getSavedRecipes, unsaveRecipe } from "./api";
>>>>>>> origin/main
import Navbar from "./Navbar";
import Home from "./Home";
import Login from "./Login";
import Register from "./Register";
import Dashboard from "./Dashboard";
<<<<<<< HEAD

// Use environment variable for API base URL (Make sure this is set in .env if this is not working please get ahold of Lyric ASAP, instructions are in the sprint 3)
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8000";
console.log("API Base URL:", API_BASE_URL);

function RecipeApp() {
  // State variables for recipes and form inputs
  const [recipes, setRecipes] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [instructions, setInstructions] = useState("");
  const [image, setImage] = useState(null);
  const [editingId, setEditingId] = useState(null);

  // New state variables for search and filtering
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Determine if the user is logged in
  const isLoggedIn = !!localStorage.getItem("access_token");

  // Fetch recipes on component mount
  useEffect(() => {
    const loadRecipes = async () => {
      const data = await fetchRecipes();
      if (data) {
        setRecipes(data);
      } else {
        console.error("Failed to fetch recipes.");
      }
    };
    loadRecipes();
  }, []);

  // Filter recipes based on search term and selected category.
  // Assumes each recipe has a "category" field.
  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch =
      recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recipe.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || recipe.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Handle adding a new recipe
  const handleAddRecipe = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("ingredients", ingredients);
    formData.append("instructions", instructions);
    if (image) formData.append("image", image);

    try {
      const addedRecipe = await addRecipe(formData);
      if (addedRecipe) {
        setRecipes([...recipes, addedRecipe]);
        resetForm();
      }
    } catch (error) {
      console.error("Error adding recipe:", error);
    }
  };

  // Handle editing an existing recipe
  const handleEditRecipe = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("ingredients", ingredients);
    formData.append("instructions", instructions);
    if (image) formData.append("image", image);

    try {
      const updatedRecipe = await editRecipe(editingId, formData);
      if (updatedRecipe) {
        setRecipes(
          recipes.map((recipe) =>
            recipe.id === editingId ? updatedRecipe : recipe
          )
        );
      }
      setEditingId(null);
      resetForm();
    } catch (error) {
      console.error("Error updating recipe:", error);
    }
  };

  // Handle deleting a recipe
  const handleDeleteRecipe = async (id) => {
    try {
      const success = await deleteRecipe(id);
      if (success) {
        setRecipes(recipes.filter((recipe) => recipe.id !== id));
      }
    } catch (error) {
      console.error("Error deleting recipe:", error);
    }
  };

  // Reset form fields
  const resetForm = () => {
    setTitle("");
    setDescription("");
    setIngredients("");
    setInstructions("");
    setImage(null);
  };

  return (
      <div>
          <p>Please log in to add or modify recipes.</p>
      {/* Search and Filter Controls */}
=======
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
>>>>>>> origin/main
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

<<<<<<< HEAD
      {/* Recipe List */}
      <ul>
        {filteredRecipes.map((recipe) => (
          <li key={recipe.id}>
            <strong>{recipe.title}</strong> - {recipe.description}
            <br />
            <em>Ingredients:</em> {recipe.ingredients}
=======
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
>>>>>>> origin/main
            <br />
            <em>Instructions:</em> {recipe.instructions}
            <br />
            {recipe.image && (
              <img
                src={`${API_BASE_URL}/${recipe.image}`}
<<<<<<< HEAD
                alt={recipe.title}
                style={{
                  width: "200px",
                  height: "150px",
                  objectFit: "cover",
                  marginTop: "10px",
                }}
              />
            )}
            <br />
            {/* Only show Edit/Delete buttons if logged in this makes it so you can only edit and delete if you are logged in */}
            {isLoggedIn && (
              <>
                <button
                  onClick={() => {
                    setEditingId(recipe.id);
                    setTitle(recipe.title);
                    setDescription(recipe.description);
                    setIngredients(recipe.ingredients);
                    setInstructions(recipe.instructions);
                  }}
                >
                  Edit
                </button>
                <button onClick={() => handleDeleteRecipe(recipe.id)}>
                  Delete
                </button>
=======
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
>>>>>>> origin/main
              </>
            )}
          </li>
        ))}
      </ul>
<<<<<<< HEAD

      {/* Conditionally render the Add/Edit Recipe form if logged in renders once you are logged in successfully */}
      {isLoggedIn ? (
        <>
          <h2>{editingId ? "Edit Recipe" : "Add a Recipe"}</h2>
          <form onSubmit={editingId ? handleEditRecipe : handleAddRecipe}>
            <input
              type="text"
              placeholder="Recipe Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Recipe Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Ingredients"
              value={ingredients}
              onChange={(e) => setIngredients(e.target.value)}
              required
            />
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
            <button type="submit">
              {editingId ? "Update Recipe" : "Add Recipe"}
            </button>
          </form>
        </>
      ) : (
        <p>Please log in to add or modify recipes.</p>
      )}
=======
>>>>>>> origin/main
    </div>
  );
}

function MainApp() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/recipes" element={<RecipeApp />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
<<<<<<< HEAD
        {/*Fallback route*/}
        <Route path="*" element={<Home />} />
=======
>>>>>>> origin/main
      </Routes>
    </Router>
  );
}

<<<<<<< HEAD
export default MainApp;
=======
export default MainApp;
>>>>>>> origin/main

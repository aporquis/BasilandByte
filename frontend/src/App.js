import React, { useEffect, useState } from "react";
import { fetchRecipes, addRecipe, editRecipe, deleteRecipe } from "./api"; // Import API functions

// 🛠️ Use environment variable for API base URL (Make sure this is set in .env)
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8000";
console.log("API Base URL:", API_BASE_URL);

function App() {
    // 🔹 State variables for recipes and form inputs
    const [recipes, setRecipes] = useState([]); 
    const [title, setTitle] = useState(""); 
    const [description, setDescription] = useState(""); 
    const [ingredients, setIngredients] = useState(""); 
    const [instructions, setInstructions] = useState(""); 
    const [image, setImage] = useState(null); // Stores uploaded image
    const [editingId, setEditingId] = useState(null); // Track which recipe is being edited

    // 🛠️ Fetch recipes on component mount
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

    // 🛠️ Handle adding a new recipe
    const handleAddRecipe = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append("title", title);
        formData.append("description", description);
        formData.append("ingredients", ingredients);
        formData.append("instructions", instructions);
        if (image) formData.append("image", image); // Only append image if selected

        try {
            const addedRecipe = await addRecipe(formData);
            if (addedRecipe) {
                setRecipes([...recipes, addedRecipe]); // Update UI
                resetForm();
            }
        } catch (error) {
            console.error("Error adding recipe:", error);
        }
    };

    // 🛠️ Handle editing an existing recipe
    const handleEditRecipe = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append("title", title);
        formData.append("description", description);
        formData.append("ingredients", ingredients);
        formData.append("instructions", instructions);
        if (image) formData.append("image", image); // Allow image update

        try {
            const updatedRecipe = await editRecipe(editingId, formData);
            if (updatedRecipe) {
                setRecipes(recipes.map(recipe =>
                    recipe.id === editingId ? updatedRecipe : recipe
                ));
            }
            setEditingId(null);
            resetForm();
        } catch (error) {
            console.error("Error updating recipe:", error);
        }
    };

    // 🛠️ Handle deleting a recipe
    const handleDeleteRecipe = async (id) => {
        try {
            const success = await deleteRecipe(id);
            if (success) {
                setRecipes(recipes.filter(recipe => recipe.id !== id));
            }
        } catch (error) {
            console.error("Error deleting recipe:", error);
        }
    };

    // 🛠️ Reset form fields
    const resetForm = () => {
        setTitle("");
        setDescription("");
        setIngredients("");
        setInstructions("");
        setImage(null);
    };

    return (
        <div>
            <h1>Recipe List</h1>
            <ul>
                {recipes.map(recipe => (
                    <li key={recipe.id}>
                        <strong>{recipe.title}</strong> - {recipe.description}
                        <br />
                        <em>Ingredients:</em> {recipe.ingredients}
                        <br />
                        <em>Instructions:</em> {recipe.instructions}
                        <br />
                        {/* 🖼️ Display image if it exists */}
                        {recipe.image && (
                            <img 
                                src={`${API_BASE_URL}/${recipe.image}`} // Ensure correct URL
                                alt={recipe.title} 
                                style={{ width: "200px", height: "150px", objectFit: "cover", marginTop: "10px" }}
                            />
                        )}
                        <br />
                        <button onClick={() => { 
                            setEditingId(recipe.id);
                            setTitle(recipe.title);
                            setDescription(recipe.description);
                            setIngredients(recipe.ingredients);
                            setInstructions(recipe.instructions);
                        }}>
                            Edit
                        </button>
                        <button onClick={() => handleDeleteRecipe(recipe.id)}>Delete</button>
                    </li>
                ))}
            </ul>

            {/* ➕ Add/Edit Recipe Form */}
            <h2>{editingId ? "Edit Recipe" : "Add a Recipe"}</h2>
            <form onSubmit={editingId ? handleEditRecipe : handleAddRecipe}>
                <input type="text" placeholder="Recipe Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
                <input type="text" placeholder="Recipe Description" value={description} onChange={(e) => setDescription(e.target.value)} required />
                <input type="text" placeholder="Ingredients" value={ingredients} onChange={(e) => setIngredients(e.target.value)} required />
                <input type="text" placeholder="Instructions" value={instructions} onChange={(e) => setInstructions(e.target.value)} required />
                
                {/* 🖼️ Image Upload */}
                <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} />

                <button type="submit">{editingId ? "Update Recipe" : "Add Recipe"}</button>
            </form>
        </div>
    );
}

export default App;

import React, { useEffect, useState } from "react";
import { fetchRecipes, addRecipe, editRecipe, deleteRecipe } from "./api"; // Import API functions

function App() {
    const [recipes, setRecipes] = useState([]); 
    const [title, setTitle] = useState(""); 
    const [description, setDescription] = useState(""); 
    const [ingredients, setIngredients] = useState(""); 
    const [instructions, setInstructions] = useState(""); 
    const [editingId, setEditingId] = useState(null); 

    // 🔹 Fetch recipes on load
    useEffect(() => {
        const loadRecipes = async () => {
            const data = await fetchRecipes();
            setRecipes(data);
        };
        loadRecipes();
    }, []);

    // 🔹 Handle adding a new recipe
    const handleAddRecipe = async (e) => {
        e.preventDefault();
        const newRecipe = { title, description, ingredients, instructions };
        const addedRecipe = await addRecipe(newRecipe);
        if (addedRecipe) setRecipes([...recipes, addedRecipe]);
        resetForm();
    };

    // 🔹 Handle updating an existing recipe
    const handleEditRecipe = async (e) => {
        e.preventDefault();
        const updatedRecipe = await editRecipe(editingId, { title, description, ingredients, instructions });
        if (updatedRecipe) {
            setRecipes(recipes.map(recipe => 
                recipe.id === editingId ? updatedRecipe : recipe
            ));
        }
        setEditingId(null);
        resetForm();
    };

    // 🔹 Handle deleting a recipe
    const handleDeleteRecipe = async (id) => {
        const success = await deleteRecipe(id);
        if (success) setRecipes(recipes.filter(recipe => recipe.id !== id));
    };

    // 🔹 Reset form fields
    const resetForm = () => {
        setTitle("");
        setDescription("");
        setIngredients("");
        setInstructions("");
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

            {/* Add/Edit Recipe Form */}
            <h2>{editingId ? "Edit Recipe" : "Add a Recipe"}</h2>
            <form onSubmit={editingId ? handleEditRecipe : handleAddRecipe}>
                <input type="text" placeholder="Recipe Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
                <input type="text" placeholder="Recipe Description" value={description} onChange={(e) => setDescription(e.target.value)} required />
                <input type="text" placeholder="Ingredients" value={ingredients} onChange={(e) => setIngredients(e.target.value)} required />
                <input type="text" placeholder="Instructions" value={instructions} onChange={(e) => setInstructions(e.target.value)} required />
                <button type="submit">{editingId ? "Update Recipe" : "Add Recipe"}</button>
            </form>
        </div>
    );
}

export default App;

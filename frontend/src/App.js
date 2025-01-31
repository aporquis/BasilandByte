import React, { useEffect, useState } from "react"; // Import React and hooks
import axios from "axios"; // Import Axios for API requests

function App() {
    // 🔹 State variables for recipes and form inputs
    const [recipes, setRecipes] = useState([]); // Holds the list of recipes
    const [title, setTitle] = useState(""); // Stores recipe title
    const [description, setDescription] = useState(""); // Stores recipe description
    const [ingredients, setIngredients] = useState(""); // Stores recipe ingredients
    const [instructions, setInstructions] = useState(""); // Stores recipe instructions
    const [editingId, setEditingId] = useState(null); // Track which recipe is being edited

    // 🔹 Fetch recipes from the backend when the page loads
    useEffect(() => {
    axios.get("http://127.0.0.1:8000/recipes/") // Call the correct backend URL
        .then(response => {
            console.log("Fetched recipes:", response.data);  // Debugging
            setRecipes(response.data); // Update state with fetched recipes
        })
        .catch(error => console.error("Error fetching recipes:", error));
}, []);


    // 🔹 Function to add a new recipe
    const addRecipe = async (e) => {
        e.preventDefault(); // Prevents form refresh

        try {
            const response = await axios.post("http://127.0.0.1:8000/recipes/add-recipe/", { 
                title, description, ingredients, instructions 
            });

            setRecipes([...recipes, response.data]); // Add new recipe to the list
            setTitle(""); setDescription(""); setIngredients(""); setInstructions(""); // Clear form
        } catch (error) {
            console.error("Error adding recipe:", error.response ? error.response.data : error.message);
        }
    };

    const editRecipe = async (id) => {
    try {
        const response = await axios.put(`http://127.0.0.1:8000/recipes/update/${id}/`, {
            title, description, ingredients, instructions
        });

        // Update the UI with the modified recipe
        setRecipes(recipes.map(recipe => 
            recipe.id === id ? { ...recipe, title, description, ingredients, instructions } : recipe
        ));

        setEditingId(null); // Exit edit mode
        setTitle(""); setDescription(""); setIngredients(""); setInstructions("");
    } catch (error) {
        console.error("Error updating recipe:", error.response ? error.response.data : error.message);
    }
};


const deleteRecipe = async (id) => {
    try {
        await axios.delete(`http://127.0.0.1:8000/recipes/delete/${id}/`);
        setRecipes(recipes.filter(recipe => recipe.id !== id)); // Remove from UI by the ID, if the IDs dont line up then we will have a problem. 
    } catch (error) {
        console.error("Error deleting recipe:", error.response ? error.response.data : error.message);
    }
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
                        {/* Edit and Delete buttons */}
                        <button onClick={() => setEditingId(recipe.id)}>Edit</button>
                        <button onClick={() => deleteRecipe(recipe.id)}>Delete</button>
                    </li>
                ))}
            </ul>

            {/* Add/Edit Recipe Form */}
            <h2>{editingId ? "Edit Recipe" : "Add a Recipe"}</h2>
            <form onSubmit={editingId ? () => editRecipe(editingId) : addRecipe}>
                <input type="text" placeholder="Recipe Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
                <input type="text" placeholder="Recipe Description" value={description} onChange={(e) => setDescription(e.target.value)} required />
                <input type="text" placeholder="Ingredients" value={ingredients} onChange={(e) => setIngredients(e.target.value)} required />
                <input type="text" placeholder="Instructions" value={instructions} onChange={(e) => setInstructions(e.target.value)} required />
                <button type="submit">{editingId ? "Update Recipe" : "Add Recipe"}</button>
            </form>
        </div>
    );
}

export default App; // Export the App component

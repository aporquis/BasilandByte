// PersonalPantry.js
import React, { useEffect, useState } from 'react';
import api from './api'; // Adjust path based on your structure (e.g., '../api' if in src/)
import './PersonalPantry.css';

const PersonalPantry = ({ token }) => {
  const [inventory, setInventory] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [newItem, setNewItem] = useState({
    ingredient_name: '',
    quantity: '',
    unit: '',
    storage_location: 'pantry',
    expires_at: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchInventory();
  }, [token]);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const response = await api.get('/inventory/');
      setInventory(response.data);
      fetchSuggestions();
    } catch (err) {
      setError('Failed to load inventory');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSuggestions = async () => {
    try {
      const response = await api.get('/recipes/suggest/');
      setSuggestions(response.data.suggested_recipes);
    } catch (err) {
      setError('Failed to load recipe suggestions');
      console.error(err);
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const normalizedItem = {
        ...newItem,
        ingredient_name: newItem.ingredient_name.trim().replace(/\b\w/g, char => char.toUpperCase()),
      };
      const response = await api.post('/inventory/add/', normalizedItem);
      setInventory([...inventory, response.data]);
      setNewItem({ ingredient_name: '', quantity: '', unit: '', storage_location: 'pantry', expires_at: '' });
      fetchSuggestions();
    } catch (err) {
      setError('Failed to add item: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async (id) => {
    setLoading(true);
    try {
      await api.delete(`/inventory/delete/${id}/`);
      setInventory(inventory.filter(item => item.id !== id));
      fetchSuggestions();
    } catch (err) {
      setError('Failed to delete item');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="personal-pantry">
      <h1>Personal Pantry</h1>
      {error && <p className="error">{error}</p>}
      {loading && <p>Loading...</p>}

      {/* Inventory Section */}
      <section>
        <h2>My Inventory</h2>
        {inventory.length === 0 ? (
          <p>No items in your pantry yet.</p>
        ) : (
          <ul className="inventory-list">
            {inventory.map(item => (
              <li key={item.id}>
                {item.ingredient_name} - {item.quantity} {item.unit} ({item.storage_location})
                {item.expires_at && ` - Expires: ${item.expires_at}`}
                <button onClick={() => handleDeleteItem(item.id)} disabled={loading}>Delete</button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Add Item Form */}
      <section>
        <h2>Add Item to Pantry</h2>
        <form onSubmit={handleAddItem} className="add-item-form">
          <input
            type="text"
            placeholder="Ingredient Name"
            value={newItem.ingredient_name}
            onChange={(e) => setNewItem({ ...newItem, ingredient_name: e.target.value })}
            maxLength={100}
            required
          />
          <input
            type="number"
            placeholder="Quantity"
            value={newItem.quantity}
            onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
            step="0.01"
            min="0"
            max="999.99"
            required
          />
          <input
            type="text"
            placeholder="Unit (e.g., cups)"
            value={newItem.unit}
            onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
            maxLength={50}
            required
          />
          <select
            value={newItem.storage_location}
            onChange={(e) => setNewItem({ ...newItem, storage_location: e.target.value })}
          >
            <option value="pantry">Pantry</option>
            <option value="fridge">Fridge</option>
            <option value="freezer">Freezer</option>
          </select>
          <input
            type="date"
            value={newItem.expires_at}
            onChange={(e) => setNewItem({ ...newItem, expires_at: e.target.value })}
          />
          <button type="submit" disabled={loading}>Add Item</button>
        </form>
      </section>

      {/* Suggested Recipes Section */}
      <section>
        <h2>Suggested Recipes</h2>
        {suggestions.length === 0 ? (
          <p>No recipe suggestions yet. Add more items to your pantry!</p>
        ) : (
          <ul className="suggestions-list">
            {suggestions.map((suggestion, index) => (
              <li key={index}>
                <h3>{suggestion.recipe.recipe_name}</h3>
                <p>{suggestion.recipe.description}</p>
                {suggestion.can_make ? (
                  <p className="can-make"><strong>You can make this!</strong></p>
                ) : (
                  <div>
                    <p><strong>Missing Ingredients:</strong></p>
                    <ul>
                      {suggestion.missing_ingredients.map((missing, idx) => (
                        <li key={idx}>
                          {missing.ingredient_name}: {missing.required_quantity} {missing.unit}
                          {missing.available_quantity !== undefined && (
                            <> (You have {missing.available_quantity} {missing.available_unit})</>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

export default PersonalPantry;
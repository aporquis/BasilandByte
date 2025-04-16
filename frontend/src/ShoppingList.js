// frontend/src/ShoppingList.js
import React, { useEffect, useState } from 'react';
import { addToShoppingList, getShoppingList, updateShoppingListItem, deleteShoppingListItem } from './api';
import './ShoppingList.css';

function ShoppingList() {
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState({
    ingredient_name: '',
    quantity: '',
    unit: '',
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const data = await getShoppingList();
        setItems(data);
      } catch (err) {
        setError("Failed to load shopping list");
        console.error('fetchShoppingList - Error:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleAddItem = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const itemData = {
        ingredient_name: newItem.ingredient_name.trim().replace(/\b\w/g, char => char.toUpperCase()),
        quantity: parseFloat(newItem.quantity) || null,
        unit: newItem.unit,
      };
      if (!itemData.quantity || !itemData.unit) {
        setError("Please provide quantity and unit");
        return;
      }
      console.log('Adding to shopping list:', itemData);
      const response = await addToShoppingList(itemData);
      setItems([...items, response]);
      setNewItem({ ingredient_name: '', quantity: '', unit: '' });
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.response?.data || err.message;
      setError(`Failed to add item: ${JSON.stringify(errorMsg)}`);
      console.error('addToShoppingList - Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePurchased = async (itemId, isPurchased) => {
    setLoading(true);
    try {
      const response = await updateShoppingListItem(itemId, { is_purchased: !isPurchased });
      setItems(items.map(item => item.id === itemId ? response : item));
    } catch (err) {
      setError("Failed to update item");
      console.error('updateShoppingListItem - Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async (itemId) => {
    setLoading(true);
    try {
      await deleteShoppingListItem(itemId);
      setItems(items.filter(item => item.id !== itemId));
    } catch (err) {
      setError("Failed to delete item");
      console.error('deleteShoppingListItem - Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="shopping-list">
      <h1>Shopping List</h1>
      {error && <p className="error">{error}</p>}
      {loading && <p>Loading...</p>}
      <section>
        <h2>Add Item</h2>
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
          <button type="submit" disabled={loading}>Add Item</button>
        </form>
      </section>
      <section>
        <h2>My Shopping List</h2>
        {items.length === 0 ? (
          <p>No items in your shopping list.</p>
        ) : (
          <ul className="shopping-list-items">
            {items.map(item => (
              <li key={item.id} className={item.is_purchased ? 's-purchased' : ''}>
                <input
                  type="checkbox"
                  checked={item.is_purchased}
                  onChange={() => handleTogglePurchased(item.id, item.is_purchased)}
                  disabled={loading}
                />
                {item.ingredient_name} - {item.quantity} {item.unit}
                <button onClick={() => handleDeleteItem(item.id)} disabled={loading}>Delete</button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

export default ShoppingList;
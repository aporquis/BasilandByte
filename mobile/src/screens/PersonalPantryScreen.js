// src/screens/PersonalPantryScreen.js
// Displays and manages the user's pantry inventory and suggested recipes.
// Fetches inventory and suggestions, allows adding and deleting items.

import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { getUserInventory, addToInventory, deleteInventoryItem, suggestRecipes } from '../services/api';

// Debug imports
console.log('Imported getUserInventory:', typeof getUserInventory === 'function' ? 'Function' : getUserInventory);
console.log('Imported addToInventory:', typeof addToInventory === 'function' ? 'Function' : addToInventory);
console.log('Imported deleteInventoryItem:', typeof deleteInventoryItem === 'function' ? 'Function' : deleteInventoryItem);
console.log('Imported suggestRecipes:', typeof suggestRecipes === 'function' ? 'Function' : suggestRecipes);

const PersonalPantryScreen = () => {
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
    }, []);

    const fetchInventory = async () => {
        setLoading(true);
        try {
            if (typeof getUserInventory !== 'function') {
                throw new Error('getUserInventory is not a function');
            }
            const response = await getUserInventory();
            setInventory(response);
            fetchSuggestions();
        } catch (err) {
            setError('Failed to load inventory: ' + err.message);
            console.error('fetchInventory - Error:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchSuggestions = async () => {
        try {
            if (typeof suggestRecipes !== 'function') {
                throw new Error('suggestRecipes is not a function');
            }
            const response = await suggestRecipes();
            setSuggestions(response.suggested_recipes || []);
        } catch (err) {
            setError('Failed to load recipe suggestions: ' + err.message);
            console.error('fetchSuggestions - Error:', err);
        }
    };

    const handleAddItem = async () => {
        if (!newItem.ingredient_name || !newItem.quantity || !newItem.unit) {
            setError('Please provide ingredient name, quantity, and unit');
            return;
        }
        setLoading(true);
        try {
            if (typeof addToInventory !== 'function') {
                throw new Error('addToInventory is not a function');
            }
            const normalizedItem = {
                ...newItem,
                ingredient_name: newItem.ingredient_name.trim().replace(/\b\w/g, char => char.toUpperCase()),
                quantity: parseFloat(newItem.quantity),
            };
            const response = await addToInventory(normalizedItem);
            setInventory([...inventory, response]);
            setNewItem({ ingredient_name: '', quantity: '', unit: '', storage_location: 'pantry', expires_at: '' });
            fetchSuggestions();
            setError(null);
        } catch (err) {
            setError('Failed to add item: ' + (err.response?.data?.error || err.message));
            console.error('handleAddItem - Error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteItem = async (id) => {
        setLoading(true);
        try {
            if (typeof deleteInventoryItem !== 'function') {
                throw new Error('deleteInventoryItem is not a function');
            }
            await deleteInventoryItem(id);
            setInventory(inventory.filter(item => item.id !== id));
            fetchSuggestions();
            setError(null);
        } catch (err) {
            setError('Failed to delete item: ' + (err.response?.data?.error || err.message));
            console.error('handleDeleteItem - Error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.card}>
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={true}
                >
                    <Text style={styles.title}>Personal Pantry</Text>
                    {error && <Text style={styles.error}>{error}</Text>}
                    {loading && <Text style={styles.loading}>Loading...</Text>}

                    {/* Inventory Section */}
                    <Text style={styles.sectionTitle}>My Inventory</Text>
                    {inventory.length === 0 ? (
                        <Text style={styles.noData}>No items in your pantry yet.</Text>
                    ) : (
                        inventory.map(item => (
                            <View key={item.id} style={styles.item}>
                                <Text style={styles.itemText}>
                                    {item.ingredient_name} - {item.quantity} {item.unit} ({item.storage_location})
                                    {item.expires_at && ` - Expires: ${item.expires_at}`}
                                </Text>
                                <TouchableOpacity onPress={() => handleDeleteItem(item.id)} style={styles.deleteButton}>
                                    <Text style={styles.buttonText}>Delete</Text>
                                </TouchableOpacity>
                            </View>
                        ))
                    )}

                    {/* Add Item Form */}
                    <Text style={styles.sectionTitle}>Add Item to Pantry</Text>
                    <View style={styles.form}>
                        <TextInput
                            style={styles.input}
                            placeholder="Ingredient Name"
                            value={newItem.ingredient_name}
                            onChangeText={(text) => setNewItem({ ...newItem, ingredient_name: text })}
                            maxLength={100}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Quantity"
                            value={newItem.quantity}
                            onChangeText={(text) => setNewItem({ ...newItem, quantity: text })}
                            keyboardType="numeric"
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Unit (e.g., cups)"
                            value={newItem.unit}
                            onChangeText={(text) => setNewItem({ ...newItem, unit: text })}
                            maxLength={50}
                        />
                        <View style={styles.pickerContainer}>
                            <Picker
                                selectedValue={newItem.storage_location}
                                style={styles.picker}
                                onValueChange={(value) => setNewItem({ ...newItem, storage_location: value })}
                            >
                                <Picker.Item label="Pantry" value="pantry" />
                                <Picker.Item label="Fridge" value="fridge" />
                                <Picker.Item label="Freezer" value="freezer" />
                            </Picker>
                        </View>
                        <TextInput
                            style={styles.input}
                            placeholder="Expiration Date (YYYY-MM-DD)"
                            value={newItem.expires_at}
                            onChangeText={(text) => setNewItem({ ...newItem, expires_at: text })}
                        />
                        <TouchableOpacity onPress={handleAddItem} style={styles.addButton} disabled={loading}>
                            <Text style={styles.buttonText}>Add Item</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Suggested Recipes Section */}
                    <Text style={styles.sectionTitle}>Suggested Recipes</Text>
                    {suggestions.length === 0 ? (
                        <Text style={styles.noData}>No recipe suggestions yet. Add more items to your pantry!</Text>
                    ) : (
                        suggestions.map((suggestion, index) => (
                            <View key={index} style={styles.suggestion}>
                                <Text style={styles.suggestionTitle}>{suggestion.recipe.recipe_name}</Text>
                                <Text style={styles.paragraph}>{suggestion.recipe.description}</Text>
                                {suggestion.can_make ? (
                                    <Text style={styles.canMake}>You can make this!</Text>
                                ) : (
                                    <View>
                                        <Text style={styles.subSectionTitle}>Missing Ingredients:</Text>
                                        {suggestion.missing_ingredients.map((missing, idx) => (
                                            <Text key={idx} style={styles.listItem}>
                                                • {missing.ingredient_name}: {missing.required_quantity} {missing.unit}
                                                {missing.available_quantity !== undefined && (
                                                    <Text> (You have {missing.available_quantity} {missing.available_unit})</Text>
                                                )}
                                            </Text>
                                        ))}
                                    </View>
                                )}
                            </View>
                        ))
                    )}
                </ScrollView>
            </View>
        </View>
    );
};

const windowWidth = Dimensions.get('window').width;
const containerWidth = Math.min(windowWidth, 800);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ece6db',
        alignItems: 'center',
        padding: 20,
    },
    card: {
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: '#2e5436',
        borderRadius: 8,
        width: containerWidth - 40,
        shadowColor: '#000',
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 5,
        flex: 1, // Ensure card takes up available space
    },
    scrollContent: {
        padding: 20, // Padding inside ScrollView to match card's internal spacing
        paddingBottom: 40, // Extra padding at the bottom to avoid content being cut off
    },
    title: {
        fontFamily: 'Merriweather-Bold',
        fontSize: 24,
        color: '#555',
        marginBottom: 15,
    },
    sectionTitle: {
        fontFamily: 'Merriweather-Regular',
        fontSize: 20,
        color: '#555',
        marginVertical: 10,
    },
    subSectionTitle: {
        fontFamily: 'Merriweather-Regular',
        fontSize: 18,
        color: '#777',
        marginVertical: 8,
    },
    item: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        padding: 10,
        marginVertical: 5,
        borderRadius: 5,
        borderWidth: 1,
        borderColor: '#2e5436',
        shadowColor: '#000',
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },
    itemText: {
        fontFamily: 'FiraCode-Regular',
        fontSize: 16,
        color: '#272727',
    },
    form: {
        marginBottom: 20,
    },
    input: {
        fontFamily: 'FiraCode-Regular',
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 4,
        padding: 10,
        marginVertical: 5,
        width: '100%',
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 4,
        marginVertical: 5,
    },
    picker: {
        fontFamily: 'FiraCode-Regular',
        fontSize: 16,
        color: '#272727',
    },
    addButton: {
        backgroundColor: '#007bff',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 4,
        alignItems: 'center',
        marginVertical: 5,
    },
    deleteButton: {
        backgroundColor: '#dc3545',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 4,
        alignItems: 'center',
    },
    buttonText: {
        fontFamily: 'FiraCode-Regular',
        fontSize: 16,
        color: '#ffffff',
    },
    suggestion: {
        backgroundColor: '#ffffff',
        padding: 10,
        marginVertical: 5,
        borderRadius: 5,
        borderWidth: 1,
        borderColor: '#2e5436',
        shadowColor: '#000',
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },
    suggestionTitle: {
        fontFamily: 'Merriweather-Bold',
        fontSize: 18,
        color: '#2e5436',
        marginBottom: 5,
    },
    canMake: {
        fontFamily: 'FiraCode-Regular',
        fontSize: 16,
        color: '#4CD964',
    },
    paragraph: {
        fontFamily: 'FiraCode-Regular',
        fontSize: 16,
        color: '#272727',
        lineHeight: 24,
        marginBottom: 10,
    },
    listItem: {
        fontFamily: 'FiraCode-Regular',
        fontSize: 16,
        color: '#272727',
        lineHeight: 24,
        marginBottom: 5,
    },
    error: {
        fontFamily: 'FiraCode-Regular',
        fontSize: 16,
        color: 'red',
        textAlign: 'center',
        marginBottom: 10,
    },
    loading: {
        fontFamily: 'FiraCode-Regular',
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 10,
    },
    noData: {
        fontFamily: 'FiraCode-Regular',
        fontSize: 16,
        color: '#888',
        textAlign: 'center',
        marginVertical: 10,
    },
});

export default PersonalPantryScreen;
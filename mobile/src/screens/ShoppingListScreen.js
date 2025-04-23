// src/screens/ShoppingListScreen.js
// Displays and manages the user's shopping list.
// Allows adding, toggling purchased status, and deleting items.

import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { addToShoppingList, getShoppingList, updateShoppingListItem, deleteShoppingListItem } from '../services/api';

const ShoppingListScreen = () => {
    const [items, setItems] = useState([]);
    const [newItem, setNewItem] = useState({
        ingredient_name: '',
        quantity: '',
        unit: '',
    });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchShoppingList();
    }, []);

    const fetchShoppingList = async () => {
        setLoading(true);
        try {
            const data = await getShoppingList();
            setItems(data);
            setError(null);
        } catch (err) {
            setError('Failed to load shopping list');
            console.error('fetchShoppingList - Error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddItem = async () => {
        if (!newItem.ingredient_name || !newItem.quantity || !newItem.unit) {
            setError('Please provide ingredient name, quantity, and unit');
            return;
        }
        setLoading(true);
        try {
            const itemData = {
                ingredient_name: newItem.ingredient_name.trim().replace(/\b\w/g, char => char.toUpperCase()),
                quantity: parseFloat(newItem.quantity),
                unit: newItem.unit,
            };
            const response = await addToShoppingList(itemData);
            setItems([...items, response]);
            setNewItem({ ingredient_name: '', quantity: '', unit: '' });
            setError(null);
        } catch (err) {
            setError('Failed to add item: ' + (err.response?.data?.error || err.message));
            console.error('handleAddItem - Error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleTogglePurchased = async (itemId, isPurchased) => {
        setLoading(true);
        try {
            const response = await updateShoppingListItem(itemId, { is_purchased: !isPurchased });
            setItems(items.map(item => item.id === itemId ? response : item));
            setError(null);
        } catch (err) {
            setError('Failed to update item');
            console.error('handleTogglePurchased - Error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteItem = async (itemId) => {
        setLoading(true);
        try {
            await deleteShoppingListItem(itemId);
            setItems(items.filter(item => item.id !== itemId));
            setError(null);
        } catch (err) {
            setError('Failed to delete item');
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
                    <Text style={styles.title}>Shopping List</Text>
                    {error && <Text style={styles.error}>{error}</Text>}
                    {loading && <Text style={styles.loading}>Loading...</Text>}

                    {/* Add Item Form */}
                    <Text style={styles.sectionTitle}>Add Item</Text>
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
                        <TouchableOpacity
                            style={styles.addButton}
                            onPress={handleAddItem}
                            disabled={loading}
                        >
                            <Text style={styles.buttonText}>Add Item</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Shopping List Section */}
                    <Text style={styles.sectionTitle}>My Shopping List</Text>
                    {items.length === 0 ? (
                        <Text style={styles.noData}>No items in your shopping list.</Text>
                    ) : (
                        items.map(item => (
                            <View key={item.id} style={[styles.item, item.is_purchased ? styles.purchased : null]}>
                                <TouchableOpacity
                                    onPress={() => handleTogglePurchased(item.id, item.is_purchased)}
                                    style={styles.checkbox}
                                >
                                    <Text>{item.is_purchased ? '☑' : '☐'}</Text>
                                </TouchableOpacity>
                                <Text style={styles.itemText}>
                                    {item.ingredient_name} - {item.quantity} {item.unit}
                                </Text>
                                <TouchableOpacity
                                    style={styles.deleteButton}
                                    onPress={() => handleDeleteItem(item.id)}
                                    disabled={loading}
                                >
                                    <Text style={styles.buttonText}>Delete</Text>
                                </TouchableOpacity>
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
        padding: windowWidth < 768 ? 16 : 20,
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
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: '#2e5436',
        borderRadius: 5,
        padding: 10,
        marginVertical: 5,
        shadowColor: '#000',
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },
    purchased: {
        backgroundColor: '#e0e0e0',
    },
    checkbox: {
        marginRight: 10,
    },
    itemText: {
        flex: 1,
        fontFamily: 'FiraCode-Regular',
        fontSize: 16,
        color: '#272727',
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

export default ShoppingListScreen;
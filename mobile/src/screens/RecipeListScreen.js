// RecipeListScreen.js
// Displays a list of all recipes, allowing authenticated users to add, edit, or delete their own recipes.
// Unauthenticated users can only view the list.

import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, Button, Image, StyleSheet } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { API_URL } from '@env';

// RecipeListScreen component receives navigation prop for navigation actions
const RecipeListScreen = ({ navigation }) => {
    // State for recipes, user ID, authentication status, and errors
    const [recipes, setRecipes] = useState([]);
    const [userId, setUserId] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [error, setError] = useState('');

    // Fetch all recipes from the backend
    const fetchRecipes = async () => {
        const url = `${API_URL}/`;
        console.log('Fetching recipes from:', url); // Debug log
        try {
            const response = await axios.get(url, {
                timeout: 5000, // Add timeout to catch slow responses
            });
            console.log('Recipes response:', response.data); // Debug log
            setRecipes(response.data);
            setError(''); // Clear any previous errors
        } catch (error) {
            const errorMsg = error.response ? error.response.data : error.message;
            console.error('Error fetching recipes:', errorMsg, error.config); // Detailed error logging
            setError('Failed to load recipes. Please check your network or try again.');
        }
    };

    // Fetch the current user's ID if authenticated
    const fetchUserId = async () => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            if (!token) {
                setIsAuthenticated(false);
                return;
            }
            setIsAuthenticated(true);
            const response = await axios.get(`${API_URL}/user-info/`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setUserId(response.data.id);
        } catch (error) {
            console.error('Error fetching user ID:', error.message);
            setIsAuthenticated(false);
        }
    };

    // Use useFocusEffect to refresh data when the screen is focused
    useFocusEffect(
        useCallback(() => {
            fetchRecipes();
            fetchUserId();
        }, [])
    );

    // Handle recipe deletion for authenticated users
    const deleteRecipe = async (recipeId) => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            await axios.delete(`${API_URL}/delete/${recipeId}/`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            fetchRecipes(); // Refresh the recipe list after deletion
        } catch (error) {
            console.error('Error deleting recipe:', error.message);
        }
    };

    return (
        <View style={styles.container}>
            {/* Recipes title wrapped in <Text> */}
            <Text style={styles.title}>Recipes</Text>
            {/* Display error message if there is one, wrapped in <Text> */}
            {error ? <Text style={styles.error}>{error}</Text> : null}
            {/* Show "Add Recipe" button only for authenticated users */}
            {isAuthenticated && (
                <Button
                    title="Add Recipe"
                    onPress={() => navigation.navigate('Add Recipe')}
                    style={styles.addButton}
                />
            )}
            {/* FlatList to display recipes */}
            <FlatList
                data={recipes}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <View style={styles.recipeItem}>
                        {/* Recipe name wrapped in <Text> */}
                        <Text style={styles.recipeName}>{item.recipe_name}</Text>
                        {/* Recipe image */}
                        <Image
                            source={{ uri: `${API_URL.replace('/api/recipes', '')}${item.image}` }}
                            style={styles.image}
                            resizeMode="cover"
                        />
                        {/* Recipe description wrapped in <Text> */}
                        <Text>{item.description}</Text>
                        {/* Edit and Delete buttons for authenticated users who own the recipe */}
                        {isAuthenticated && userId && item.user === userId && (
                            <View style={styles.buttonContainer}>
                                <Button
                                    title="Edit"
                                    onPress={() => navigation.navigate('Edit Recipe', { recipe: item })}
                                />
                                <Button
                                    title="Delete"
                                    onPress={() => deleteRecipe(item.id)}
                                    color="red"
                                />
                            </View>
                        )}
                    </View>
                )}
            />
        </View>
    );
};

// Styles for the RecipeListScreen layout
const styles = StyleSheet.create({
    container: {
        flex: 1, // Takes full screen height
        padding: 10, // Adds padding around the content
    },
    title: {
        fontSize: 20, // Medium font for the title
        fontWeight: 'bold', // Bold text for emphasis
        textAlign: 'center', // Centers the text
        marginVertical: 10, // Vertical margin for spacing
    },
    error: {
        color: 'red', // Red color for error messages
        textAlign: 'center', // Centers the text
        marginBottom: 10, // Adds spacing below the error
    },
    addButton: {
        marginBottom: 10, // Adds spacing below the button
    },
    recipeItem: {
        padding: 10, // Adds padding around each recipe item
        borderBottomWidth: 1, // Adds a bottom border
        borderBottomColor: '#ccc', // Light gray border color
    },
    recipeName: {
        fontSize: 18, // Medium font for recipe name
        fontWeight: 'bold', // Bold text for emphasis
    },
    image: {
        width: 150, // Image width
        height: 150, // Image height
        marginTop: 10, // Adds spacing above the image
    },
    buttonContainer: {
        flexDirection: 'row', // Horizontal layout for buttons
        justifyContent: 'space-between', // Evenly space buttons
        marginTop: 10, // Adds spacing above buttons
    },
});

export default RecipeListScreen;
// src/screens/MyPostedRecipesScreen.js
// Displays a list of recipes posted by the logged-in user, with options to delete or edit each recipe.

import React, { useState, useEffect } from 'react'; // Import React and hooks
import { View, Text, FlatList, StyleSheet, Image, TouchableOpacity, Alert } from 'react-native'; // UI components
import AsyncStorage from '@react-native-async-storage/async-storage'; // For token storage
import axios from 'axios'; // HTTP client for API requests
import { API_URL } from '@env'; // Environment variable for API endpoint
import { useNavigation } from '@react-navigation/native'; // Navigation hook

const MyPostedRecipesScreen = () => {
    const [recipes, setRecipes] = useState([]); // State to store fetched recipes
    const [error, setError] = useState(''); // State to store error messages
    const [isLoading, setIsLoading] = useState(false); // State to track loading status
    const navigation = useNavigation(); // Hook for navigation

    // Fetch recipes posted by the logged-in user
    const fetchMyRecipes = async () => {
        setIsLoading(true); // Set loading state
        const token = await AsyncStorage.getItem('userToken'); // Retrieve authentication token
        if (!token) {
            setError('Please log in to view your recipes.'); // Set error if no token
            setIsLoading(false);
            return;
        }

        try {
            const response = await axios.get(`${API_URL}/`, {
                headers: { Authorization: `Bearer ${token}` }, // Include token in request
                params: { user: true }, // Filter by current user
            });
            console.log('Fetched my posted recipes:', response.data); // Debug log
            setRecipes(response.data); // Update state with fetched recipes
            setError(''); // Clear any previous errors
        } catch (err) {
            console.error('Error fetching my recipes:', err.message); // Log error details
            setError('Failed to fetch your recipes. Please try again.'); // User-friendly error
        } finally {
            setIsLoading(false); // Reset loading state
        }
    };

    // Delete a recipe by its ID with retry mechanism
    const deleteRecipe = async (recipeId, retries = 2) => {
        const token = await AsyncStorage.getItem('userToken'); // Retrieve authentication token
        if (!token) {
            setError('Please log in to delete recipes.');
            return;
        }

        try {
            const url = `${API_URL}/delete/${recipeId}/`;
            console.log(`Attempting to delete recipe at: ${url}, retries left: ${retries}`); // Debug log
            const response = await axios.delete(url, {
                headers: { Authorization: `Bearer ${token}` }, // Include token in request
                timeout: 15000, // 15-second timeout
                validateStatus: (status) => status === 204 || status === 200, // Accept 204 as success
            });
            console.log('Delete response:', response.status, response.data || 'No content'); // Log response
            Alert.alert('Success', 'Recipe deleted successfully!');
            fetchMyRecipes(); // Refresh the list immediately
        } catch (err) {
            console.error('Error deleting recipe:', {
                message: err.message,
                code: err.code,
                response: err.response?.data,
                config: err.config?.url, // Log the requested URL
                stack: err.stack, // Include stack trace
            }); // Log detailed error
            if (err.code === 'ECONNABORTED' && retries > 0) {
                console.log(`Retrying deletion for recipe ${recipeId}, ${retries} attempts left`);
                await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
                return deleteRecipe(recipeId, retries - 1); // Retry
            } else if (err.response?.status === 404) {
                Alert.alert('Info', 'Recipe not found, it may have already been deleted. Refreshing list...');
                fetchMyRecipes(); // Refresh if already deleted
            } else {
                Alert.alert('Error', 'Failed to delete recipe: ' + (err.response?.data?.error || err.message || 'Network issue, check server.'));
            }
        }
    };

    // Confirm deletion with the user
    const confirmDelete = (recipeId, recipeName) => {
        Alert.alert(
            'Delete Recipe',
            `Are you sure you want to delete "${recipeName}"? This action cannot be undone.`,
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', style: 'destructive', onPress: () => deleteRecipe(recipeId) },
            ]
        );
    };

    // Navigate to EditRecipeScreen with the recipe data
    const editRecipe = (recipe) => {
        navigation.navigate('AuthenticatedTabs', {
            screen: 'Tab_Recipes',
            params: {
                screen: 'Recipe_Edit',
                params: { recipe }, // Pass the recipe data
            },
        });
    };

    // Fetch recipes when component mounts
    useEffect(() => {
        fetchMyRecipes();
    }, []);

    // Use focus effect to refresh when returning from EditRecipeScreen
    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            console.log('Screen focused, refetching my recipes'); // Debug log
            fetchMyRecipes(); // Refresh when screen is focused
        });
        return unsubscribe;
    }, [navigation]);

    const renderRecipeItem = ({ item }) => (
        <View style={styles.recipeItem}>
            {/* Display recipe name with fallback */}
            <Text style={styles.recipeName}>{item.recipe_name || 'No Name'}</Text>
            {/* Display username of the recipe's author */}
            <Text style={styles.username}>Posted by: {item.username || 'Unknown User'}</Text>
            {/* Display description with fallback */}
            <Text style={styles.recipeDescription}>{item.description || 'No Description'}</Text>
            {/* Display instructions with fallback */}
            <Text style={styles.recipeInstructions}>{item.instructions || 'No Instructions'}</Text>
            {/* Display image if available */}
            {item.image && (
                <Image
                    source={{ uri: `${API_URL}${item.image}` }}
                    style={styles.recipeImage}
                    resizeMode="cover"
                />
            )}
            {/* Buttons for editing and deleting */}
            <View style={styles.buttonContainer}>
                {/* Edit button */}
                <TouchableOpacity
                    style={[styles.button, styles.editButton]}
                    onPress={() => editRecipe(item)}
                >
                    <Text style={styles.buttonText}>Edit</Text>
                </TouchableOpacity>
                {/* Delete button */}
                <TouchableOpacity
                    style={[styles.button, styles.deleteButton]}
                    onPress={() => confirmDelete(item.id, item.recipe_name)}
                >
                    <Text style={styles.buttonText}>Delete</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            {/* Title for the my posted recipes screen */}
            <Text style={styles.header}>My Posted Recipes</Text>
            {/* Display error message if any */}
            {error ? <Text style={styles.error}>{error}</Text> : null}
            {/* Show loading indicator */}
            {isLoading ? <Text style={styles.loadingText}>Loading...</Text> : null}
            {/* FlatList to render recipe items */}
            <FlatList
                data={recipes}
                renderItem={renderRecipeItem}
                keyExtractor={(item) => item.id.toString()} // Unique key for each item
                ListEmptyComponent={<Text style={styles.emptyText}>No recipes posted yet.</Text>}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1, // Use full screen height
        padding: 10, // Add padding around content
    },
    header: {
        fontSize: 24, // Large header text
        fontWeight: 'bold', // Bold header
        textAlign: 'center', // Center align
        marginVertical: 10, // Vertical margin
    },
    recipeItem: {
        padding: 15, // Padding inside each recipe item
        borderWidth: 1, // Border width
        borderColor: '#ccc', // Light gray border
        borderRadius: 5, // Rounded corners
        marginBottom: 10, // Margin between items
        backgroundColor: '#f9f9f9', // Light background
    },
    recipeName: {
        fontSize: 18, // Larger text for name
        fontWeight: 'bold', // Bold name
        marginBottom: 5, // Margin below name
        color: '#333', // Darker text for contrast
    },
    username: {
        fontSize: 14, // Smaller text for username
        color: '#666', // Neutral color for username
        marginBottom: 5, // Margin below username
        fontStyle: 'italic', // Italicize for distinction
    },
    recipeDescription: {
        fontSize: 16, // Medium text for description
        marginBottom: 5, // Margin below description
        color: '#555', // Slightly lighter text
    },
    recipeInstructions: {
        fontSize: 14, // Smaller text for instructions
        color: '#777', // Lighter text for distinction
        marginBottom: 10, // Margin below instructions
    },
    recipeImage: {
        width: '100%', // Full width of container
        height: 150, // Fixed height for image
        marginTop: 5, // Margin above image
        borderRadius: 5, // Rounded corners for image
        marginBottom: 10, // Margin below image
    },
    buttonContainer: {
        flexDirection: 'row', // Align buttons horizontally
        justifyContent: 'space-between', // Space buttons evenly
    },
    button: {
        padding: 10, // Padding inside button
        borderRadius: 5, // Rounded corners
        width: '48%', // Slightly less than half to account for spacing
        alignItems: 'center', // Center text
    },
    editButton: {
        backgroundColor: '#007AFF', // Blue for edit
    },
    deleteButton: {
        backgroundColor: '#FF3B30', // Red for delete
    },
    buttonText: {
        color: 'white', // White text
        fontSize: 14, // Readable text size
        fontWeight: 'bold', // Bold text
    },
    error: {
        color: 'red', // Red error text
        textAlign: 'center', // Center align
        marginBottom: 10, // Margin below error
    },
    emptyText: {
        textAlign: 'center', // Center align
        color: '#888', // Light gray color
        marginTop: 20, // Margin above empty text
    },
    loadingText: {
        textAlign: 'center', // Center align
        color: '#666', // Neutral loading color
        marginVertical: 10, // Vertical margin
    },
});

export default MyPostedRecipesScreen;
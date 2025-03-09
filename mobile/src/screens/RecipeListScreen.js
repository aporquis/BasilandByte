// src/screens/RecipeListScreen.js
// Displays a list of all recipes for authenticated users, including the posting user.

import React, { useState, useEffect } from 'react'; // Import React and hooks
import { View, Text, FlatList, StyleSheet, Image } from 'react-native'; // UI components
import AsyncStorage from '@react-native-async-storage/async-storage'; // For token storage
import axios from 'axios'; // HTTP client for API requests
import { API_URL } from '@env'; // Environment variable for API endpoint
import { useNavigation, useFocusEffect } from '@react-navigation/native'; // Navigation and focus hooks

const RecipeListScreen = () => {
    const [recipes, setRecipes] = useState([]); // State to store fetched recipes
    const [error, setError] = useState(''); // State to store error messages
    const [isLoading, setIsLoading] = useState(false); // State to track loading status
    const navigation = useNavigation(); // Hook for navigation

    // Fetch recipes from the API
    const fetchRecipes = async () => {
        setIsLoading(true); // Set loading state
        const token = await AsyncStorage.getItem('userToken'); // Retrieve authentication token
        if (!token) {
            setError('Please log in to view recipes.'); // Set error if no token
            navigation.navigate('Login'); // Navigate to login if unauthenticated
            setIsLoading(false);
            return;
        }

        try {
            const response = await axios.get(`${API_URL}/`, {
                headers: { Authorization: `Bearer ${token}` }, // Include token in request
            });
            console.log('Fetched recipes:', response.data); // Debug log
            setRecipes(response.data); // Update state with fetched recipes
            setError(''); // Clear any previous errors
        } catch (err) {
            console.error('Error fetching recipes:', err.message); // Log error details
            setError('Failed to fetch recipes. Please try again.'); // User-friendly error
        } finally {
            setIsLoading(false); // Reset loading state
        }
    };

    // Use useFocusEffect to re-fetch recipes when the screen is focused
    useFocusEffect(
        React.useCallback(() => {
            fetchRecipes(); // Re-fetch recipes on focus
        }, []) // Empty dependency array ensures it runs on every focus
    );

    // Initial fetch when component mounts
    useEffect(() => {
        fetchRecipes(); // Fetch recipes on mount
    }, [navigation]); // Include navigation as dependency to avoid warnings

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
        </View>
    );

    return (
        <View style={styles.container}>
            {/* Header for the recipes list */}
            <Text style={styles.header}>Recipes</Text>
            {/* Display error message if any */}
            {error ? <Text style={styles.error}>{error}</Text> : null}
            {/* Show loading indicator */}
            {isLoading ? <Text style={styles.loadingText}>Loading...</Text> : null}
            {/* FlatList to render recipe items */}
            <FlatList
                data={recipes}
                renderItem={renderRecipeItem}
                keyExtractor={(item) => item.id.toString()} // Unique key for each item
                ListEmptyComponent={<Text style={styles.emptyText}>No recipes available.</Text>}
                refreshing={isLoading} // Optional: Enable pull-to-refresh
                onRefresh={fetchRecipes} // Optional: Trigger refresh on pull
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
        marginBottom: 5, // Margin below instructions
    },
    recipeImage: {
        width: '100', // Full width of container
        height: 150, // Fixed height for image
        marginTop: 5, // Margin above image
        borderRadius: 5, // Rounded corners for image
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

export default RecipeListScreen;
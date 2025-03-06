// EditRecipeScreen.js
// Allows authenticated users to edit their own recipes.
// Only text fields are editable here (no image editing for simplicity).

import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_URL } from '@env';

// EditRecipeScreen component receives route (for recipe data) and navigation props
const EditRecipeScreen = ({ route, navigation }) => {
    const { recipe } = route.params; // Get the recipe data from navigation params
    // State for recipe details and errors
    const [recipeName, setRecipeName] = useState(recipe.recipe_name);
    const [description, setDescription] = useState(recipe.description);
    const [instructions, setInstructions] = useState(recipe.instructions);
    const [error, setError] = useState('');

    useEffect(() => {
        // Check authentication status when the screen mounts
        const checkAuth = async () => {
            const token = await AsyncStorage.getItem('userToken');
            if (!token) {
                Alert.alert('Authentication Required', 'Please log in to edit this recipe.', [
                    { text: 'OK', onPress: () => navigation.navigate('Login') },
                ]);
            }
        };
        checkAuth();
    }, [navigation]); // Dependency on navigation for redirect

    // Handle recipe update submission to the backend
    const updateRecipe = async () => {
        // Validate all fields are filled
        if (!recipeName || !description || !instructions) {
            setError('All fields are required!');
            return;
        }

        const token = await AsyncStorage.getItem('userToken');
        if (!token) {
            navigation.navigate('Login');
            return;
        }

        try {
            // Send PUT request to update the recipe
            await axios.put(
                `${API_URL}/update/${recipe.id}/`,
                { recipe_name: recipeName, description, instructions },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            Alert.alert('Success', 'Recipe updated successfully.');
            navigation.goBack(); // Return to previous screen after success
        } catch (error) {
            console.error('Error updating recipe:', error.response?.data || error.message);
            setError('Failed to update recipe');
        }
    };

    return (
        <View style={styles.container}>
            {/* Edit Recipe title wrapped in <Text> */}
            <Text style={styles.title}>Edit Recipe</Text>
            {/* Display error message if there is one, wrapped in <Text> */}
            {error ? <Text style={styles.error}>{error}</Text> : null}
            {/* Recipe name input */}
            <TextInput
                value={recipeName}
                onChangeText={setRecipeName}
                style={styles.input}
            />
            {/* Description input */}
            <TextInput
                value={description}
                onChangeText={setDescription}
                style={styles.input}
            />
            {/* Instructions input */}
            <TextInput
                value={instructions}
                onChangeText={setInstructions}
                style={styles.input}
                multiline // Allow multiple lines
            />
            {/* Update button */}
            <Button title="Update Recipe" onPress={updateRecipe} />
        </View>
    );
};

// Styles for the EditRecipeScreen layout
const styles = StyleSheet.create({
    container: {
        padding: 20, // Adds padding around the content
        flex: 1, // Takes full screen height
    },
    title: {
        fontSize: 20, // Medium font for the title
        fontWeight: 'bold', // Bold text for emphasis
        textAlign: 'center', // Centers the text
        marginBottom: 20, // Adds spacing below the title
    },
    error: {
        color: 'red', // Red color for error messages
        textAlign: 'center', // Centers the text
        marginBottom: 10, // Adds spacing below the error
    },
    input: {
        borderBottomWidth: 1, // Underline for input fields
        marginVertical: 10, // Vertical margin for spacing
        padding: 5, // Padding inside the input
    },
});

export default EditRecipeScreen;
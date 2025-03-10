// src/screens/EditRecipeScreen.js
// Allows users to edit an existing recipe.

import React, { useState, useEffect } from 'react'; // Import React and hooks
import { View, Text, TextInput, Button, StyleSheet, Alert, Platform } from 'react-native'; // UI components
import AsyncStorage from '@react-native-async-storage/async-storage'; // For token storage
import axios from 'axios'; // HTTP client for API requests
import { API_URL } from '@env'; // Environment variable for API endpoint
import * as ImagePicker from 'react-native-image-picker'; // For image selection

const EditRecipeScreen = ({ route, navigation }) => {
    const { recipe } = route.params; // Get recipe data from navigation params
    const [recipeName, setRecipeName] = useState(recipe.recipe_name || ''); // State for recipe name
    const [description, setDescription] = useState(recipe.description || ''); // State for description
    const [instructions, setInstructions] = useState(recipe.instructions || ''); // State for instructions
    const [image, setImage] = useState(recipe.image || null); // State for image URI
    const [error, setError] = useState(''); // State for error messages

    // Handle image picking
    const pickImage = async () => {
        const options = {
            mediaType: 'photo',
            quality: 1,
        };

        ImagePicker.launchImageLibrary(options, (response) => {
            if (response.didCancel) {
                console.log('User cancelled image picker');
            } else if (response.errorCode) {
                console.log('ImagePicker Error: ', response.errorMessage);
                setError('Failed to pick image: ' + response.errorMessage);
            } else if (response.assets && response.assets.length > 0) {
                setImage(response.assets[0].uri); // Set the image URI
            }
        });
    };

    // Handle updating the recipe
    const updateRecipe = async () => {
        if (!recipeName || !description || !instructions) {
            setError('Recipe name, description, and instructions are required!');
            return;
        }

        const token = await AsyncStorage.getItem('userToken'); // Retrieve authentication token
        if (!token) {
            navigation.navigate('Login'); // Navigate to login if unauthenticated
            return;
        }

        let formData = new FormData();
        formData.append('recipe_name', recipeName);
        formData.append('description', description);
        formData.append('instructions', instructions);
        if (image && image !== recipe.image) { // Only append if image has changed
            formData.append('image', {
                uri: image,
                type: 'image/jpeg',
                name: 'recipe.jpg',
            });
        }

        try {
            const url = `${API_URL}/update/${recipe.id}/`; // Ensure full path
            console.log('Attempting to update recipe at:', url); // Debug log
            const response = await axios.put(url, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`,
                },
            });
            console.log('Update response:', response.data); // Debug log
            Alert.alert('Success', 'Recipe updated successfully!');
            navigation.goBack(); // Navigate back to MyPostedRecipesScreen
        } catch (err) {
            console.error('Error updating recipe:', {
                message: err.message,
                code: err.code,
                response: err.response?.data,
                config: err.config?.url, // Log the requested URL
                stack: err.stack, // Include stack trace
            }); // Log detailed error
            setError('Failed to update recipe: ' + (err.response?.data?.detail || err.message));
        }
    };

    return (
        <View style={styles.container}>
            {/* Title for the edit recipe screen */}
            <Text style={styles.title}>Edit Recipe</Text>
            {/* Display error message if any */}
            {error ? <Text style={styles.error}>{error}</Text> : null}
            {/* Recipe name input */}
            <TextInput
                placeholder="Recipe Name"
                value={recipeName}
                onChangeText={setRecipeName}
                style={styles.input}
            />
            {/* Description input */}
            <TextInput
                placeholder="Description"
                value={description}
                onChangeText={setDescription}
                style={styles.input}
                multiline
            />
            {/* Instructions input */}
            <TextInput
                placeholder="Instructions"
                value={instructions}
                onChangeText={setInstructions}
                style={styles.input}
                multiline
            />
            {/* Button to pick an image */}
            <Button title="Pick an Image" onPress={pickImage} />
            {/* Update recipe button */}
            <Button title="Update Recipe" onPress={updateRecipe} style={styles.submitButton} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1, // Use full screen height
        padding: 20, // Padding around content
    },
    title: {
        fontSize: 24, // Large title text
        fontWeight: 'bold', // Bold title
        textAlign: 'center', // Center align
        marginBottom: 20, // Margin below title
    },
    error: {
        color: 'red', // Red error text
        textAlign: 'center', // Center align
        marginBottom: 10, // Margin below error
    },
    input: {
        borderWidth: 1, // Border width
        borderColor: '#ccc', // Light gray border
        borderRadius: 4, // Rounded corners
        padding: 10, // Padding inside input
        marginVertical: 10, // Vertical margin
        fontSize: 16, // Readable text size
    },
    submitButton: {
        marginTop: 10, // Margin above submit button
    },
});

export default EditRecipeScreen;
// AddRecipeScreen.js
// Allows authenticated users to add new recipes, including an optional image, to the backend.
// Unauthenticated users are prompted to log in.

import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Image, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_URL } from '@env';

// AddRecipeScreen component receives navigation prop for navigation actions
const AddRecipeScreen = ({ navigation }) => {
    // State for recipe details, image, and errors
    const [recipeName, setRecipeName] = useState('');
    const [description, setDescription] = useState('');
    const [instructions, setInstructions] = useState('');
    const [image, setImage] = useState(null); // Image is now optional
    const [error, setError] = useState('');

    useEffect(() => {
        // Check authentication status when the screen mounts
        const checkAuth = async () => {
            const token = await AsyncStorage.getItem('userToken');
            if (!token) {
                Alert.alert('Authentication Required', 'Please log in to add a recipe.', [
                    { text: 'OK', onPress: () => navigation.navigate('Login') },
                ]);
            }
        };
        checkAuth();
    }, [navigation]); // Dependency on navigation for redirect

    // Handle image selection from the device library
    const pickImage = async () => {
        const options = {
            mediaType: 'photo', // Only allow photos
            quality: 1, // Highest quality
        };

        launchImageLibrary(options, (response) => {
            if (response.didCancel) {
                console.log('User cancelled image picker');
            } else if (response.error) {
                console.error('ImagePicker Error:', response.error);
            } else {
                setImage(response.assets[0].uri); // Set the selected image URI
            }
        });
    };

    // Handle recipe submission to the backend
    const addRecipe = async () => {
        // Validate all required fields (recipeName, description, instructions are required, image is optional)
        if (!recipeName || !description || !instructions) {
            setError('Recipe name, description, and instructions are required!');
            return;
        }

        const token = await AsyncStorage.getItem('userToken');
        if (!token) {
            navigation.navigate('Login');
            return;
        }

        // Create FormData for multipart/form-data request
        let formData = new FormData();
        formData.append('recipe_name', recipeName);
        formData.append('description', description);
        formData.append('instructions', instructions);

        // Only append image if one is selected
        if (image) {
            formData.append('image', {
                uri: image,
                type: 'image/jpeg',
                name: 'recipe.jpg',
            });
        }

        try {
            // Send POST request to add the recipe
            await axios.post(`${API_URL}/add/`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data', // Required for file upload
                    Authorization: `Bearer ${token}`, // Include JWT token
                },
            });
            navigation.goBack(); // Return to previous screen after success
        } catch (error) {
            console.error('Error adding recipe:', error.response?.data || error.message);
            setError('Failed to add recipe');
        }
    };

    return (
        <View style={styles.container}>
            {/* Add Recipe title wrapped in <Text> */}
            <Text style={styles.title}>Add Recipe</Text>
            {/* Display error message if there is one, wrapped in <Text> */}
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
            />
            {/* Instructions input */}
            <TextInput
                placeholder="Instructions"
                value={instructions}
                onChangeText={setInstructions}
                style={styles.input}
                multiline // Allow multiple lines
            />
            {/* Optional button to pick an image */}
            <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
                <Text style={styles.imageText}>Pick an Image (Optional)</Text>
            </TouchableOpacity>
            {/* Display selected image preview if available */}
            {image && <Image source={{ uri: image }} style={styles.image} />}
            {/* Submit button for adding the recipe */}
            <Button title="Add Recipe" onPress={addRecipe} />
        </View>
    );
};

// Styles for the AddRecipeScreen layout
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
    imagePicker: {
        alignItems: 'center', // Centers the text horizontally
        marginVertical: 10, // Vertical margin for spacing
    },
    imageText: {
        color: 'blue', // Blue color for the text
        fontSize: 16, // Medium font for the text
    },
    image: {
        width: 100, // Image width
        height: 100, // Image height
        alignSelf: 'center', // Centers the image horizontally
        marginVertical: 10, // Vertical margin for spacing
    },
});

export default AddRecipeScreen;
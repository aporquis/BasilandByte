// src/screens/EditRecipeScreen.js
// Allows users to edit an existing recipe.
// Uses updateRecipe from api.js to send updates to /api/recipes/update/<recipe_id>/.
// Handles image updates and form submission, clearing image to avoid deletion errors.

import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { updateRecipe } from '../services/api'; // Import from api.js
import * as ImagePicker from 'react-native-image-picker';

const EditRecipeScreen = ({ route, navigation }) => {
    const { recipe } = route.params;
    const [recipeName, setRecipeName] = useState(recipe.recipe_name || '');
    const [description, setDescription] = useState(recipe.description || '');
    const [instructions, setInstructions] = useState(recipe.instructions || '');
    const [image, setImage] = useState(recipe.image || null);
    const [clearImage, setClearImage] = useState(false); // Flag to clear image
    const [error, setError] = useState('');
    const DEBUG_MODE = true; // Set to false to disable debug logging

    // Log received recipe for debugging
    useEffect(() => {
        if (DEBUG_MODE) console.log('EditRecipeScreen - Received recipe:', recipe);
    }, [recipe]);

    // Handle image selection
    const pickImage = async () => {
        const options = { mediaType: 'photo', quality: 1 };
        ImagePicker.launchImageLibrary(options, (response) => {
            if (response.didCancel) {
                console.log('User cancelled image picker');
            } else if (response.errorCode) {
                setError('Failed to pick image: ' + response.errorMessage);
            } else if (response.assets && response.assets.length > 0) {
                setImage(response.assets[0].uri);
                setClearImage(false); // New image selected, don't clear
            }
        });
    };

    // Clear image explicitly
    const clearImageField = () => {
        setImage(null);
        setClearImage(true);
        if (DEBUG_MODE) console.log('Image field cleared');
    };

    // Submit updated recipe
    const handleUpdateRecipe = async () => {
        if (!recipeName || !description || !instructions) {
            setError('Recipe name, description, and instructions are required!');
            return;
        }

        const token = await AsyncStorage.getItem('userToken');
        if (!token) {
            setError('No authentication token found. Please log in.');
            navigation.navigate('Login');
            return;
        }

        const formData = new FormData();
        formData.append('recipe_name', recipeName);
        formData.append('description', description);
        formData.append('instructions', instructions);
        // Only append image if a new one is selected, else clear
        if (image && image !== recipe.image && image.startsWith('file://')) {
            formData.append('image', {
                uri: image,
                type: 'image/jpeg',
                name: `recipe_${recipe.id}.jpg`,
            });
        } else if (clearImage) {
            formData.append('image', ''); // Send empty string to clear image_url
        }

        try {
            if (DEBUG_MODE) console.log('Updating recipe with data:', {
                recipeId: recipe.id,
                recipeName,
                description,
                instructions,
                image: image ? 'Image included' : clearImage ? 'Image cleared' : 'No image change',
            });
            const response = await updateRecipe(recipe.id, formData);
            if (DEBUG_MODE) console.log('Update response:', response);
            Alert.alert('Success', 'Recipe updated successfully!');
            navigation.goBack();
        } catch (error) {
            const errorMessage = error.response?.data?.detail || error.response?.data?.error || error.message;
            console.error('Update error:', errorMessage, error.response?.data);
            setError(`Failed to update recipe: ${errorMessage}`);
            Alert.alert('Error', `Failed to update recipe: ${errorMessage}`);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Edit Recipe</Text>
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <TextInput
                placeholder="Recipe Name"
                value={recipeName}
                onChangeText={setRecipeName}
                style={styles.input}
            />
            <TextInput
                placeholder="Description"
                value={description}
                onChangeText={setDescription}
                style={styles.input}
                multiline
            />
            <TextInput
                placeholder="Instructions"
                value={instructions}
                onChangeText={setInstructions}
                style={styles.input}
                multiline
            />
            <Button title="Pick an Image" onPress={pickImage} />
            <Button title="Clear Image" onPress={clearImageField} />
            <Button title="Update Recipe" onPress={handleUpdateRecipe} style={styles.submitButton} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
    },
    error: {
        color: 'red',
        textAlign: 'center',
        marginBottom: 10,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 4,
        padding: 10,
        marginVertical: 10,
        fontSize: 16,
    },
    submitButton: {
        marginTop: 10,
    },
});

export default EditRecipeScreen;
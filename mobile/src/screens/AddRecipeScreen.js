// src/screens/AddRecipeScreen.js
// Allows authenticated users to add new recipes with an optional image.
// Uses the addRecipe function from api.js to post to /api/recipes/add/.
// Includes error handling and navigation to Login if unauthenticated.

import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Image, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { addRecipe } from '../services/api'; // Import from api.js

const AddRecipeScreen = ({ navigation }) => {
    const [recipeName, setRecipeName] = useState('');
    const [description, setDescription] = useState('');
    const [instructions, setInstructions] = useState('');
    const [image, setImage] = useState(null);
    const [error, setError] = useState('');

    // Check authentication status on mount
    useEffect(() => {
        const checkAuth = async () => {
            const token = await AsyncStorage.getItem('userToken');
            if (!token) {
                Alert.alert('Authentication Required', 'Please log in to add a recipe.', [
                    { text: 'OK', onPress: () => navigation.navigate('Login') },
                ]);
            }
        };
        checkAuth();
    }, [navigation]);

    // Handle image selection from the device library
    const pickImage = async () => {
        const options = { mediaType: 'photo', quality: 1 };
        launchImageLibrary(options, (response) => {
            if (response.didCancel) {
                console.log('User cancelled image picker');
            } else if (response.error) {
                console.error('ImagePicker Error:', response.error);
            } else {
                setImage(response.assets[0].uri);
            }
        });
    };

    // Submit the new recipe to the backend
    const handleAddRecipe = async () => {
        if (!recipeName || !description || !instructions) {
            setError('Recipe name, description, and instructions are required!');
            return;
        }

        const formData = new FormData();
        formData.append('recipe_name', recipeName);
        formData.append('description', description);
        formData.append('instructions', instructions);
        if (image) {
            formData.append('image', { uri: image, type: 'image/jpeg', name: 'recipe.jpg' });
        }

        try {
            const data = await addRecipe(formData);
            Alert.alert('Success', `Recipe added successfully! Recipe ID: ${data.id || 'Not returned'}`);
            navigation.goBack();
        } catch (error) {
            const errorMessage = error.response?.data?.error || error.message;
            setError(`Failed to add recipe: ${errorMessage}`);
            Alert.alert('Error', `Failed to add recipe: ${errorMessage}`);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Add Recipe</Text>
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
            />
            <TextInput
                placeholder="Instructions"
                value={instructions}
                onChangeText={setInstructions}
                style={styles.input}
                multiline
            />
            <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
                <Text style={styles.imageText}>Pick an Image (Optional)</Text>
            </TouchableOpacity>
            {image && <Image source={{ uri: image }} style={styles.image} />}
            <Button title="Add Recipe" onPress={handleAddRecipe} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 20,
        flex: 1,
    },
    title: {
        fontSize: 20,
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
        borderBottomWidth: 1,
        marginVertical: 10,
        padding: 5,
    },
    imagePicker: {
        alignItems: 'center',
        marginVertical: 10,
    },
    imageText: {
        color: 'blue',
        fontSize: 16,
    },
    image: {
        width: 100,
        height: 100,
        alignSelf: 'center',
        marginVertical: 10,
    },
});

export default AddRecipeScreen;
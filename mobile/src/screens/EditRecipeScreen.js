// EditRecipeScreen.js
// Allows users to edit an existing recipe.
// Fixed: Updated endpoint to /api/recipes/update/<int:recipe_id>/ to match Django urls.py.

import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_URL } from '@env';
import * as ImagePicker from 'react-native-image-picker';

const EditRecipeScreen = ({ route, navigation }) => {
    const { recipe } = route.params;
    const [recipeName, setRecipeName] = useState(recipe.recipe_name || '');
    const [description, setDescription] = useState(recipe.description || '');
    const [instructions, setInstructions] = useState(recipe.instructions || '');
    const [image, setImage] = useState(recipe.image || null);
    const [error, setError] = useState('');

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
                setImage(response.assets[0].uri);
            }
        });
    };

    const updateRecipe = async () => {
        if (!recipeName || !description || !instructions) {
            setError('Recipe name, description, and instructions are required!');
            return;
        }

        const token = await AsyncStorage.getItem('userToken');
        if (!token) {
            navigation.navigate('Login');
            return;
        }

        let formData = new FormData();
        formData.append('recipe_name', recipeName);
        formData.append('description', description);
        formData.append('instructions', instructions);
        if (image && image !== recipe.image) {
            formData.append('image', {
                uri: image,
                type: 'image/jpeg',
                name: 'recipe.jpg',
            });
        }

        try {
            const url = `${API_URL}/api/recipes/update/${recipe.id}/`; // Fixed endpoint
            console.log('📡 Attempting to update recipe at:', url);
            const response = await axios.put(url, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`,
                },
            });
            console.log('📡 Update Response:', response.data);
            Alert.alert('Success', 'Recipe updated successfully!');
            navigation.goBack();
        } catch (err) {
            console.error('Error updating recipe:', {
                message: err.message,
                code: err.code,
                response: err.response?.data,
                status: err.response?.status,
                config: err.config?.url,
            });
            setError('Failed to update recipe: ' + (err.response?.data?.detail || err.message));
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
            <Button title="Update Recipe" onPress={updateRecipe} style={styles.submitButton} />
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
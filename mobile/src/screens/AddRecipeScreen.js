import React, { useState } from 'react';
import { View, TextInput, Button, Text } from 'react-native';
import axios from 'axios';

const AddRecipeScreen = ({ navigation }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [ingredients, setIngredients] = useState('');
    const [instructions, setInstructions] = useState('');
    const [error, setError] = useState('');

    const addRecipe = async () => {
        if (!title || !description || !ingredients || !instructions) {
            setError('All fields are required!');
            return;
        }

        try {
            const response = await axios.post('http://10.0.0.150:8000/api/recipes/add/', {
                title,
                description,
                ingredients,
                instructions
            });

            console.log('Recipe added:', response.data);
            navigation.goBack(); // Go back to recipe list
        } catch (error) {
            console.error('Error adding recipe:', error.response?.data || error.message);
            setError('Failed to add recipe');
        }
    };

    return (
        <View>
            <Text style={{ fontSize: 20, fontWeight: 'bold', textAlign: 'center' }}>Add Recipe</Text>
            {error ? <Text style={{ color: 'red', textAlign: 'center' }}>{error}</Text> : null}
            <TextInput placeholder="Title" value={title} onChangeText={setTitle} style={{ borderBottomWidth: 1, margin: 10 }} />
            <TextInput placeholder="Description" value={description} onChangeText={setDescription} style={{ borderBottomWidth: 1, margin: 10 }} />
            <TextInput placeholder="Ingredients" value={ingredients} onChangeText={setIngredients} style={{ borderBottomWidth: 1, margin: 10 }} />
            <TextInput placeholder="Instructions" value={instructions} onChangeText={setInstructions} style={{ borderBottomWidth: 1, margin: 10 }} />
            <Button title="Add Recipe" onPress={addRecipe} />
        </View>
    );
};

export default AddRecipeScreen;

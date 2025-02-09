import React, { useState } from 'react';
import { View, TextInput, Button, Text } from 'react-native';
import axios from 'axios';

const EditRecipeScreen = ({ route, navigation }) => {
    const { recipe } = route.params;
    
    const [title, setTitle] = useState(recipe.title);
    const [description, setDescription] = useState(recipe.description);
    const [ingredients, setIngredients] = useState(recipe.ingredients);
    const [instructions, setInstructions] = useState(recipe.instructions);
    const [error, setError] = useState('');

    const updateRecipe = async () => {
        if (!title || !description || !ingredients || !instructions) {
            setError('All fields are required!');
            return;
        }

        try {
            await axios.put(`http://10.0.0.150:8000/api/recipes/update/${recipe.id}/`, {
                title,
                description,
                ingredients,
                instructions
            });

            console.log('Recipe updated');
            navigation.goBack(); // Return to recipe list
        } catch (error) {
            console.error('Error updating recipe:', error.response?.data || error.message);
            setError('Failed to update recipe');
        }
    };

    return (
        <View>
            <Text style={{ fontSize: 20, fontWeight: 'bold', textAlign: 'center' }}>Edit Recipe</Text>
            {error ? <Text style={{ color: 'red', textAlign: 'center' }}>{error}</Text> : null}
            <TextInput value={title} onChangeText={setTitle} style={{ borderBottomWidth: 1, margin: 10 }} />
            <TextInput value={description} onChangeText={setDescription} style={{ borderBottomWidth: 1, margin: 10 }} />
            <TextInput value={ingredients} onChangeText={setIngredients} style={{ borderBottomWidth: 1, margin: 10 }} />
            <TextInput value={instructions} onChangeText={setInstructions} style={{ borderBottomWidth: 1, margin: 10 }} />
            <Button title="Update Recipe" onPress={updateRecipe} />
        </View>
    );
};

export default EditRecipeScreen;

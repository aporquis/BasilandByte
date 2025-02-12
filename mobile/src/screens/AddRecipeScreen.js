import React, { useState } from 'react';
import { View, TextInput, Button, Text, Image, TouchableOpacity } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import axios from 'axios';

const AddRecipeScreen = ({ navigation }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [ingredients, setIngredients] = useState('');
    const [instructions, setInstructions] = useState('');
    const [image, setImage] = useState(null);
    const [error, setError] = useState('');

    const pickImage = async () => {
        const options = {
            mediaType: 'photo',
            quality: 1,
        };

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

    const addRecipe = async () => {
        if (!title || !description || !ingredients || !instructions || !image) {
            setError('All fields and an image are required!');
            return;
        }

        let formData = new FormData();
        formData.append("title", title);
        formData.append("description", description);
        formData.append("ingredients", ingredients);
        formData.append("instructions", instructions);
        formData.append("image", {
            uri: image,
            type: "image/jpeg",
            name: "recipe.jpg",
        });

        try {
            const response = await axios.post('http://10.0.0.150:8000/api/recipes/add/', formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            console.log('Recipe added:', response.data);
            navigation.goBack();
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
            
            <TouchableOpacity onPress={pickImage} style={{ alignItems: "center", marginVertical: 10 }}>
                <Text style={{ color: "blue" }}>Pick an Image</Text>
            </TouchableOpacity>

            {image && <Image source={{ uri: image }} style={{ width: 100, height: 100, alignSelf: "center" }} />}
            
            <Button title="Add Recipe" onPress={addRecipe} />
        </View>
    );
};

export default AddRecipeScreen;

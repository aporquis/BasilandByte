// src/screens/AddRecipeScreen.js
// Allows authenticated users to add new recipes with ingredients and an optional image.
// Uses addRecipe and addRecipeIngredient from api.js to post to /api/recipes/add/ and /api/recipes/add-ingredient/.
// Includes enhanced error handling, debugging, and navigation to Login if unauthenticated.

import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, Alert, StyleSheet, Dimensions, ScrollView, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { launchImageLibrary } from 'react-native-image-picker'; // Fixed typo: removed "Hsp"
import AsyncStorage from '@react-native-async-storage/async-storage';
import { addRecipe, addRecipeIngredient } from '../services/api';

const AddRecipeScreen = ({ navigation }) => {
    const [recipeName, setRecipeName] = useState('');
    const [description, setDescription] = useState('');
    const [instructions, setInstructions] = useState('');
    const [ingredients, setIngredients] = useState([{ name: '', quantity: '', unit: '' }]);
    const [image, setImage] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            const token = await AsyncStorage.getItem('userToken');
            console.log('AddRecipeScreen - Token:', token ? 'Present' : 'Absent');
            if (!token) {
                Alert.alert('Authentication Required', 'Please log in to add a recipe.', [
                    { text: 'OK', onPress: () => navigation.navigate('Login') },
                ]);
            }
        };
        checkAuth();
    }, [navigation]);

    const pickImage = async () => {
        const options = { mediaType: 'photo', quality: 1 };
        launchImageLibrary(options, (response) => {
            if (response.didCancel) {
                console.log('User cancelled image picker');
            } else if (response.errorCode) {
                console.error('ImagePicker Error:', response.errorCode, response.errorMessage);
                setError('Failed to pick image: ' + response.errorMessage);
            } else if (response.assets && response.assets.length > 0) {
                let uri = response.assets[0].uri;
                // On Android, ensure the URI starts with 'file://' if needed
                if (Platform.OS === 'android' && !uri.startsWith('file://')) {
                    uri = 'file://' + uri;
                }
                console.log('Selected Image URI:', uri);
                setImage(uri);
            } else {
                console.error('ImagePicker - No assets returned');
                setError('No image selected');
            }
        });
    };

    const handleAddIngredient = () => {
        setIngredients([...ingredients, { name: '', quantity: '', unit: '' }]);
    };

    const handleIngredientChange = (index, field, value) => {
        const newIngredients = [...ingredients];
        newIngredients[index][field] = value;
        setIngredients(newIngredients);
    };

    const handleAddRecipe = async () => {
        // Reset error state
        setError('');
        setLoading(true);

        // Validate required fields
        if (!recipeName || !description || !instructions) {
            setError('Recipe name, description, and instructions are required!');
            setLoading(false);
            return;
        }

        // Validate ingredients
        const validIngredients = ingredients.filter(
            ing => ing.name && !isNaN(parseFloat(ing.quantity)) && ing.unit
        );
        if (validIngredients.length === 0) {
            setError('At least one ingredient with name, quantity, and unit is required!');
            setLoading(false);
            return;
        }

        // Prepare FormData
        const formData = new FormData();
        formData.append('recipe_name', recipeName);
        formData.append('description', description);
        formData.append('instructions', instructions);

        // Handle image
        if (image) {
            try {
                // Validate image URI by attempting to fetch it
                const response = await fetch(image);
                if (!response.ok) throw new Error('Invalid image URI');
                formData.append('image', {
                    uri: image,
                    type: 'image/jpeg',
                    name: 'recipe.jpg',
                });
            } catch (imageError) {
                console.error('Image Validation Error:', imageError.message);
                setError('Invalid image selected: ' + imageError.message);
                setLoading(false);
                return;
            }
        }

        // Log FormData for debugging
        console.log('FormData Contents:');
        for (let [key, value] of formData._parts) {
            console.log(`${key}:`, value);
        }

        try {
            // Add the recipe
            console.log('Adding recipe...');
            const addedRecipe = await addRecipe(formData);
            console.log('Added Recipe Response:', JSON.stringify(addedRecipe, null, 2));

            if (addedRecipe && addedRecipe.id) {
                // Add each valid ingredient
                for (const ingr of validIngredients) {
                    const ingredientData = {
                        ingredient_name: ingr.name,
                        quantity: parseFloat(ingr.quantity),
                        unit: ingr.unit,
                    };
                    console.log('Adding Ingredient:', ingredientData);
                    try {
                        const ingredientResponse = await addRecipeIngredient(addedRecipe.id, ingredientData);
                        console.log('Ingredient Response:', JSON.stringify(ingredientResponse, null, 2));
                    } catch (ingredientError) {
                        console.error('Failed to add ingredient:', ingr.name, ingredientError.message);
                        setError(`Failed to add ingredient ${ingr.name}: ${ingredientError.message}`);
                        Alert.alert('Error', `Failed to add ingredient ${ingr.name}`);
                        setLoading(false);
                        return;
                    }
                }

                // Success
                Alert.alert('Success', `Recipe added successfully! Recipe ID: ${addedRecipe.id}`);
                // Reset form fields
                setRecipeName('');
                setDescription('');
                setInstructions('');
                setIngredients([{ name: '', quantity: '', unit: '' }]);
                setImage(null);
                setError('');
                navigation.goBack();
            } else {
                setError('Recipe added but no ID returned');
                Alert.alert('Error', 'Recipe added but no ID returned');
            }
        } catch (error) {
            const errorMessage = error.message || 'Unknown error';
            console.error('Add Recipe Error:', errorMessage, error);
            setError(`Failed to add recipe: ${errorMessage}`);
            Alert.alert('Error', `Failed to add recipe: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.card}>
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={true}
                >
                    <Text style={styles.title}>Add Recipe</Text>
                    {error ? <Text style={styles.error}>{error}</Text> : null}
                    {loading ? <Text style={styles.loading}>Adding recipe...</Text> : null}
                    <TextInput
                        placeholder="Recipe Name"
                        value={recipeName}
                        onChangeText={setRecipeName}
                        style={styles.input}
                        editable={!loading}
                    />
                    <TextInput
                        placeholder="Description"
                        value={description}
                        onChangeText={setDescription}
                        style={styles.input}
                        multiline
                        editable={!loading}
                    />
                    <Text style={styles.sectionTitle}>Ingredients</Text>
                    {ingredients.map((ing, index) => (
                        <View key={index} style={styles.ingredientContainer}>
                            <TextInput
                                placeholder="Ingredient Name"
                                value={ing.name}
                                onChangeText={(text) => handleIngredientChange(index, 'name', text)}
                                style={[styles.input, styles.ingredientInput]}
                                editable={!loading}
                            />
                            <TextInput
                                placeholder="Quantity"
                                value={ing.quantity}
                                onChangeText={(text) => handleIngredientChange(index, 'quantity', text)}
                                keyboardType="numeric"
                                style={[styles.input, styles.quantityInput]}
                                editable={!loading}
                            />
                            <View style={styles.pickerContainer}>
                                <Picker
                                    selectedValue={ing.unit}
                                    onValueChange={(value) => handleIngredientChange(index, 'unit', value)}
                                    style={styles.picker}
                                    enabled={!loading}
                                >
                                    <Picker.Item label="Select Unit" value="" />
                                    <Picker.Item label="Cups" value="cups" />
                                    <Picker.Item label="Tablespoons" value="tablespoons" />
                                    <Picker.Item label="Teaspoons" value="teaspoons" />
                                    <Picker.Item label="Pounds" value="lbs" />
                                    <Picker.Item label="Ounces" value="oz" />
                                    <Picker.Item label="Grams" value="g" />
                                </Picker>
                            </View>
                        </View>
                    ))}
                    <TouchableOpacity onPress={handleAddIngredient} style={styles.addIngredientButton} disabled={loading}>
                        <Text style={styles.buttonText}>Add Another Ingredient</Text>
                    </TouchableOpacity>
                    <TextInput
                        placeholder="Instructions"
                        value={instructions}
                        onChangeText={setInstructions}
                        style={styles.input}
                        multiline
                        editable={!loading}
                    />
                    <TouchableOpacity onPress={pickImage} style={styles.imagePicker} disabled={loading}>
                        <Text style={styles.imageText}>Pick an Image (Optional)</Text>
                    </TouchableOpacity>
                    {image && <Image source={{ uri: image }} style={styles.image} />}
                    <TouchableOpacity onPress={handleAddRecipe} style={styles.submitButton} disabled={loading}>
                        <Text style={styles.buttonText}>{loading ? 'Adding...' : 'Add Recipe'}</Text>
                    </TouchableOpacity>
                </ScrollView>
            </View>
        </View>
    );
};

const windowWidth = Dimensions.get('window').width;
const containerWidth = Math.min(windowWidth, 800);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ece6db',
        alignItems: 'center',
        padding: 20,
    },
    card: {
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: '#2e5436',
        borderRadius: 8,
        width: containerWidth - 40,
        shadowColor: '#000',
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 5,
        flex: 1,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    title: {
        fontFamily: 'Merriweather-Bold',
        fontSize: 24,
        color: '#555',
        textAlign: 'center',
        marginBottom: 20,
    },
    sectionTitle: {
        fontFamily: 'Merriweather-Regular',
        fontSize: 20,
        color: '#555',
        marginVertical: 10,
    },
    error: {
        fontFamily: 'FiraCode-Regular',
        fontSize: 16,
        color: 'red',
        textAlign: 'center',
        marginBottom: 10,
    },
    loading: {
        fontFamily: 'FiraCode-Regular',
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 10,
    },
    input: {
        fontFamily: 'FiraCode-Regular',
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 4,
        padding: 10,
        marginVertical: 10,
        width: '100%',
    },
    ingredientContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    ingredientInput: {
        flex: 1,
        marginRight: 10,
    },
    quantityInput: {
        width: 80,
        marginRight: 10,
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 4,
        flex: 1,
    },
    picker: {
        fontFamily: 'FiraCode-Regular',
        fontSize: 16,
        color: '#272727',
    },
    addIngredientButton: {
        backgroundColor: '#2e5436',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 4,
        alignItems: 'center',
        marginBottom: 20,
    },
    imagePicker: {
        alignItems: 'center',
        marginVertical: 10,
    },
    imageText: {
        fontFamily: 'FiraCode-Regular',
        fontSize: 16,
        color: '#007bff',
    },
    image: {
        width: 100,
        height: 100,
        alignSelf: 'center',
        marginVertical: 10,
        borderRadius: 5,
    },
    submitButton: {
        backgroundColor: '#2e5436',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 4,
        alignItems: 'center',
        marginTop: 10,
    },
    buttonText: {
        fontFamily: 'FiraCode-Regular',
        fontSize: 16,
        color: '#ffffff',
    },
});

export default AddRecipeScreen;
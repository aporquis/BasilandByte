// src/screens/RecipeListScreen.js
// Displays a list of all recipes with a save option.
// Uses fetchRecipes and saveRecipe from api.js.
// Refreshes on focus and pull-to-refresh.

import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Image, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchRecipes, saveRecipe } from '../services/api'; // Import from api.js
import { useNavigation, useFocusEffect } from '@react-navigation/native';

const RecipeListScreen = () => {
    const [recipes, setRecipes] = useState([]);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigation = useNavigation();

    // Fetch all recipes
    const fetchAllRecipes = async () => {
        setIsLoading(true);
        const token = await AsyncStorage.getItem('userToken');
        if (!token) {
            setError('Please log in to view recipes.');
            navigation.navigate('Login');
            setIsLoading(false);
            return;
        }

        try {
            const data = await fetchRecipes();
            setRecipes(data);
            setError('');
        } catch (error) {
            setError('Failed to fetch recipes: ' + (error.response?.data?.error || error.message));
        } finally {
            setIsLoading(false);
        }
    };

    // Save a recipe
    const handleSaveRecipe = async (recipeId) => {
        const token = await AsyncStorage.getItem('userToken');
        if (!token) {
            navigation.navigate('Login');
            return;
        }

        try {
            const data = await saveRecipe(recipeId);
            Alert.alert('Success', data.message || 'Recipe saved!');
        } catch (error) {
            Alert.alert('Error', 'Failed to save recipe: ' + (error.response?.data?.error || error.message));
        }
    };

    useFocusEffect(React.useCallback(() => {
        fetchAllRecipes();
    }, []));

    useEffect(() => {
        fetchAllRecipes();
    }, [navigation]);

    const renderRecipeItem = ({ item }) => (
        <View style={styles.recipeItem}>
            <Text style={styles.recipeName}>{item.recipe_name || 'No Name'}</Text>
            <Text style={styles.username}>Posted by: {item.username || 'Unknown User'}</Text>
            <Text style={styles.recipeDescription}>{item.description || 'No Description'}</Text>
            <Text style={styles.recipeInstructions}>{item.instructions || 'No Instructions'}</Text>
            {item.image && <Image source={{ uri: `https://basilandbyte.onrender.com${item.image}` }} style={styles.recipeImage} resizeMode="cover" />}
            <TouchableOpacity style={styles.saveButton} onPress={() => handleSaveRecipe(item.id)}>
                <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Recipes</Text>
            {error ? <Text style={styles.error}>{error}</Text> : null}
            {isLoading ? <Text style={styles.loadingText}>Loading...</Text> : null}
            <FlatList
                data={recipes}
                renderItem={renderRecipeItem}
                keyExtractor={(item) => item.id.toString()}
                ListEmptyComponent={<Text style={styles.emptyText}>No recipes available.</Text>}
                refreshing={isLoading}
                onRefresh={fetchAllRecipes}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginVertical: 10,
    },
    recipeItem: {
        padding: 15,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        marginBottom: 10,
        backgroundColor: '#f9f9f9',
    },
    recipeName: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5,
        color: '#333',
    },
    username: {
        fontSize: 14,
        color: '#666',
        marginBottom: 5,
        fontStyle: 'italic',
    },
    recipeDescription: {
        fontSize: 16,
        marginBottom: 5,
        color: '#555',
    },
    recipeInstructions: {
        fontSize: 14,
        color: '#777',
        marginBottom: 5,
    },
    recipeImage: {
        width: '100%',
        height: 150,
        marginTop: 5,
        borderRadius: 5,
    },
    saveButton: {
        backgroundColor: '#4CD964',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
        marginTop: 10,
    },
    saveButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    error: {
        color: 'red',
        textAlign: 'center',
        marginBottom: 10,
    },
    emptyText: {
        textAlign: 'center',
        color: '#888',
        marginTop: 20,
    },
    loadingText: {
        textAlign: 'center',
        color: '#666',
        marginVertical: 10,
    },
});

export default RecipeListScreen;
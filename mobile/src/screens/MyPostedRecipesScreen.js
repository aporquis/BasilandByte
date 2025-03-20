// src/screens/MyPostedRecipesScreen.js
// Displays recipes posted by the authenticated user with edit and delete options.
// Uses fetchRecipes and deleteRecipe from api.js.
// Filters recipes by a hardcoded username (adjust as needed).

import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Image, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchRecipes, deleteRecipe } from '../services/api'; // Import from api.js
import { useNavigation } from '@react-navigation/native';

const MyPostedRecipesScreen = () => {
    const [recipes, setRecipes] = useState([]);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigation = useNavigation();

    // Fetch user's posted recipes
    const fetchMyRecipes = async () => {
        setIsLoading(true);
        const token = await AsyncStorage.getItem('userToken');
        if (!token) {
            setError('Please log in to view your recipes.');
            setIsLoading(false);
            return;
        }

        try {
            const allRecipes = await fetchRecipes();
            // Filter by username; adjust 'ljchrislock' to dynamic user if needed
            const userRecipes = allRecipes.filter(recipe => recipe.username === 'ljchrislock');
            setRecipes(userRecipes);
            setError('');
        } catch (error) {
            setError('Failed to fetch your recipes: ' + (error.response?.data?.error || error.message));
        } finally {
            setIsLoading(false);
        }
    };

    // Delete a recipe with confirmation
    const handleDeleteRecipe = async (recipeId) => {
        try {
            await deleteRecipe(recipeId);
            Alert.alert('Success', 'Recipe deleted successfully!');
            fetchMyRecipes();
        } catch (error) {
            const status = error.response?.status;
            if (status === 403) Alert.alert('Error', 'You do not have permission to delete this recipe.');
            else if (status === 404) Alert.alert('Info', 'Recipe not found, it may have already been deleted.');
            else Alert.alert('Error', 'Failed to delete recipe: ' + (error.response?.data?.error || error.message));
            fetchMyRecipes();
        }
    };

    const confirmDelete = (recipeId, recipeName) => {
        Alert.alert('Delete Recipe', `Are you sure you want to delete "${recipeName}"?`, [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Delete', style: 'destructive', onPress: () => handleDeleteRecipe(recipeId) },
        ]);
    };

    // Navigate to edit screen
    const editRecipe = (recipe) => {
        navigation.navigate('AuthenticatedTabs', {
            screen: 'Tab_Recipes',
            params: { screen: 'Recipe_Edit', params: { recipe } },
        });
    };

    useEffect(() => {
        fetchMyRecipes();
    }, []);

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', fetchMyRecipes);
        return unsubscribe;
    }, [navigation]);

    const renderRecipeItem = ({ item }) => (
        <View style={styles.recipeItem}>
            <Text style={styles.recipeName}>{item.recipe_name || 'No Name'}</Text>
            <Text style={styles.username}>Posted by: {item.username || 'Unknown User'}</Text>
            <Text style={styles.recipeDescription}>{item.description || 'No Description'}</Text>
            <Text style={styles.recipeInstructions}>{item.instructions || 'No Instructions'}</Text>
            {item.image && <Image source={{ uri: `https://basilandbyte.onrender.com${item.image}` }} style={styles.recipeImage} resizeMode="cover" />}
            <View style={styles.buttonContainer}>
                <TouchableOpacity style={[styles.button, styles.editButton]} onPress={() => editRecipe(item)}>
                    <Text style={styles.buttonText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.button, styles.deleteButton]} onPress={() => confirmDelete(item.id, item.recipe_name)}>
                    <Text style={styles.buttonText}>Delete</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.header}>My Posted Recipes</Text>
            {error ? <Text style={styles.error}>{error}</Text> : null}
            {isLoading ? <Text style={styles.loadingText}>Loading...</Text> : null}
            <FlatList
                data={recipes}
                renderItem={renderRecipeItem}
                keyExtractor={(item) => item.id.toString()}
                ListEmptyComponent={<Text style={styles.emptyText}>No recipes posted yet.</Text>}
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
        marginBottom: 10,
    },
    recipeImage: {
        width: '100%',
        height: 150,
        marginTop: 5,
        borderRadius: 5,
        marginBottom: 10,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    button: {
        padding: 10,
        borderRadius: 5,
        width: '48%',
        alignItems: 'center',
    },
    editButton: {
        backgroundColor: '#007AFF',
    },
    deleteButton: {
        backgroundColor: '#FF3B30',
    },
    buttonText: {
        color: 'white',
        fontSize: 14,
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

export default MyPostedRecipesScreen;
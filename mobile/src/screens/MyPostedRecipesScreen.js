// src/screens/MyPostedRecipesScreen.js
// Displays recipes posted by the authenticated user with edit and delete options.
// Uses fetchRecipes, deleteRecipe, and getUserInfo from api.js.
// Filters recipes by the authenticated user's username and persistently excludes deleted recipes.

import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Image, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchRecipes, deleteRecipe, getUserInfo } from '../services/api'; // Import from api.js
import { useNavigation } from '@react-navigation/native';

const MyPostedRecipesScreen = () => {
    const [recipes, setRecipes] = useState([]);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [username, setUsername] = useState('');
    const [deletingRecipeId, setDeletingRecipeId] = useState(null); // Lock for deletion
    const [deletedRecipeIds, setDeletedRecipeIds] = useState([]); // Track deleted IDs
    const navigation = useNavigation();
    const DEBUG_MODE = true; // Set to false to disable debug logging
    const STORAGE_KEYS = {
        DELETED_IDS: 'deletedRecipeIds_v2', // Unique key to avoid conflicts
        CACHED_RECIPES: 'cachedUserRecipes_v2',
    };

    // Load deleted recipe IDs and cached recipes from AsyncStorage
    useEffect(() => {
        const loadStorage = async () => {
            try {
                // Load deleted recipe IDs
                const storedIds = await AsyncStorage.getItem(STORAGE_KEYS.DELETED_IDS);
                let parsedIds = [];
                if (storedIds) {
                    parsedIds = JSON.parse(storedIds).map(id => String(id));
                    setDeletedRecipeIds(parsedIds);
                    if (DEBUG_MODE) console.log('Loaded deleted recipe IDs:', parsedIds);
                } else {
                    if (DEBUG_MODE) console.log('No deleted recipe IDs found in AsyncStorage');
                }

                // Load cached recipes
                const cachedRecipes = await AsyncStorage.getItem(STORAGE_KEYS.CACHED_RECIPES);
                if (cachedRecipes) {
                    const parsedRecipes = JSON.parse(cachedRecipes);
                    const filteredRecipes = parsedRecipes.filter(r => !parsedIds.includes(String(r.id)));
                    setRecipes(filteredRecipes);
                    if (DEBUG_MODE) console.log('Loaded cached recipes:', filteredRecipes.length, filteredRecipes.map(r => ({ id: r.id, name: r.recipe_name })));
                }
            } catch (err) {
                console.error('Failed to load AsyncStorage:', err.message);
            }
        };
        loadStorage();
    }, []);

    // Save data to AsyncStorage
    const saveToStorage = async (key, data) => {
        try {
            const stringData = JSON.stringify(data);
            await AsyncStorage.setItem(key, stringData);
            if (DEBUG_MODE) console.log(`Saved to ${key}:`, data);
        } catch (err) {
            console.error(`Failed to save to ${key}:`, err.message);
        }
    };

    // Fetch user's posted recipes
    const fetchMyRecipes = async (forceFetch = false) => {
        setIsLoading(true);
        const token = await AsyncStorage.getItem('userToken');
        if (!token) {
            setError('Please log in to view your recipes.');
            setIsLoading(false);
            navigation.navigate('Login');
            return;
        }

        try {
            // Use cached recipes if available and not forced
            const cachedRecipes = await AsyncStorage.getItem(STORAGE_KEYS.CACHED_RECIPES);
            if (cachedRecipes && !forceFetch) {
                const parsedRecipes = JSON.parse(cachedRecipes);
                const filteredRecipes = parsedRecipes.filter(r => !deletedRecipeIds.includes(String(r.id)));
                setRecipes(filteredRecipes);
                if (DEBUG_MODE) console.log('Using cached recipes:', filteredRecipes.length, filteredRecipes.map(r => ({ id: r.id, name: r.recipe_name })));
                setIsLoading(false);
                return;
            }

            // Fetch user info to get username
            const userInfo = await getUserInfo();
            setUsername(userInfo.username || '');
            if (DEBUG_MODE) console.log('Fetched username:', userInfo.username);

            // Fetch all recipes
            const allRecipes = await fetchRecipes();
            // Filter by logged-in user's username and exclude deleted IDs
            const userRecipes = allRecipes.filter(
                recipe => recipe.username === userInfo.username && !deletedRecipeIds.includes(String(recipe.id))
            );
            setRecipes(userRecipes);
            await saveToStorage(STORAGE_KEYS.CACHED_RECIPES, userRecipes);
            if (DEBUG_MODE) console.log('Fetched and cached user recipes:', userRecipes.map(r => ({ id: r.id, name: r.recipe_name })));
            if (DEBUG_MODE) console.log('Filtered out deleted IDs:', deletedRecipeIds);
            setError('');
        } catch (error) {
            const errorMessage = error.response?.data?.error || error.response?.data?.detail || error.message;
            console.error('Fetch error:', errorMessage, error.response?.data);
            setError(`Failed to fetch your recipes: ${errorMessage}`);
        } finally {
            setIsLoading(false);
        }
    };

    // Delete a recipe with confirmation and retry logic
    const handleDeleteRecipe = async (recipeId, recipeName, retryCount = 0) => {
        if (deletingRecipeId) {
            if (DEBUG_MODE) console.log(`Deletion in progress for recipe ${deletingRecipeId}. Queuing ${recipeId} skipped.`);
            Alert.alert('Busy', 'Another deletion is in progress. Please wait a moment and try again.');
            return;
        }

        setDeletingRecipeId(recipeId);
        const token = await AsyncStorage.getItem('userToken');
        if (!token) {
            setError('Please log in to delete recipes.');
            navigation.navigate('Login');
            setDeletingRecipeId(null);
            return;
        }

        try {
            if (DEBUG_MODE) console.log('Attempting to delete recipe:', { id: recipeId, name: recipeName, attempt: retryCount + 1, token: token.substring(0, 10) + '...' });
            const response = await deleteRecipe(recipeId);
            console.log('Delete response:', { status: response.status, data: response.data });
            // Update UI and deleted IDs
            const newRecipes = recipes.filter(r => r.id !== recipeId);
            setRecipes(newRecipes);
            const newDeletedIds = [...deletedRecipeIds, String(recipeId)];
            setDeletedRecipeIds(newDeletedIds);
            await saveToStorage(STORAGE_KEYS.DELETED_IDS, newDeletedIds);
            await saveToStorage(STORAGE_KEYS.CACHED_RECIPES, newRecipes);
            Alert.alert('Success', `Recipe "${recipeName}" deleted successfully!`);
            setDeletingRecipeId(null);
        } catch (error) {
            const status = error.response?.status || 500;
            const errorMessage = error.response?.data?.error || error.response?.data?.detail || error.message;
            console.error('Delete error:', {
                recipeId,
                recipeName,
                status,
                errorMessage,
                responseData: error.response?.data,
                headers: error.response?.headers,
            });

            if (status === 401) {
                setError('Session expired. Please log in again.');
                await AsyncStorage.removeItem('userToken');
                navigation.navigate('Login');
                setDeletingRecipeId(null);
            } else if (status === 403) {
                Alert.alert('Permission Error', `You do not have permission to delete "${recipeName}".`);
                setDeletingRecipeId(null);
            } else if (status === 404) {
                Alert.alert('Not Found', `Recipe "${recipeName}" not found. It may have already been deleted.`);
                const newRecipes = recipes.filter(r => r.id !== recipeId);
                setRecipes(newRecipes);
                const newDeletedIds = [...deletedRecipeIds, String(recipeId)];
                setDeletedRecipeIds(newDeletedIds);
                await saveToStorage(STORAGE_KEYS.DELETED_IDS, newDeletedIds);
                await saveToStorage(STORAGE_KEYS.CACHED_RECIPES, newRecipes);
                setDeletingRecipeId(null);
            } else if (status === 500 && retryCount < 3) {
                console.log('Server error, retrying...', { attempt: retryCount + 1 });
                setTimeout(() => handleDeleteRecipe(recipeId, recipeName, retryCount + 1), 2000);
            } else {
                // Fallback: Simulate deletion in UI
                console.warn(`Persistent 500 error for recipe ${recipeId}. Simulating deletion in UI.`);
                const newRecipes = recipes.filter(r => r.id !== recipeId);
                setRecipes(newRecipes);
                const newDeletedIds = [...deletedRecipeIds, String(recipeId)];
                setDeletedRecipeIds(newDeletedIds);
                await saveToStorage(STORAGE_KEYS.DELETED_IDS, newDeletedIds);
                await saveToStorage(STORAGE_KEYS.CACHED_RECIPES, newRecipes);
                Alert.alert('Success', `Recipe "${recipeName}" removed from your list. To permanently delete, edit it to clear the image first.`);
                if (DEBUG_MODE) console.log('Simulated deletion for recipe:', recipeId);
                setDeletingRecipeId(null);
            }
        }
    };

    const confirmDelete = (recipeId, recipeName) => {
        if (DEBUG_MODE) console.log('Confirming deletion for recipe:', { id: recipeId, name: recipeName });
        Alert.alert('Delete Recipe', `Are you sure you want to delete "${recipeName}"?`, [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: () => {
                    if (DEBUG_MODE) console.log('Delete confirmed for recipe ID:', recipeId);
                    handleDeleteRecipe(recipeId, recipeName);
                },
            },
        ]);
    };

    // Navigate to edit screen
    const editRecipe = (recipe) => {
        if (DEBUG_MODE) console.log('Navigating to EditRecipe for recipe:', recipe.id);
        navigation.navigate('EditRecipe', { recipe });
    };

    useEffect(() => {
        fetchMyRecipes(true); // Force fetch on initial load
    }, []);

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => fetchMyRecipes());
        return unsubscribe;
    }, [navigation, deletedRecipeIds]); // Re-filter on deleted IDs change

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
                <TouchableOpacity
                    style={[styles.button, styles.deleteButton]}
                    onPress={() => {
                        if (DEBUG_MODE) console.log('Delete button pressed for recipe:', item.id);
                        confirmDelete(item.id, item.recipe_name);
                    }}
                >
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
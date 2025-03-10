// mobile/src/screens/MyPostedRecipesScreen.js
// Displays a list of recipes posted by the logged-in user, with options to delete or edit each recipe.
// Fixed: Updated endpoint to /api/recipes/ and added user filtering logic.
// Fixed: Updated delete endpoint to /api/recipes/delete/<int:recipe_id>/.
// Fixed: Handle 204 responses, network errors, and 404 retries for delete operation.
// Enhanced: Refine retry logic, reduce retries to 1, and improve feedback for network issues.

import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Image, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_URL } from '@env';
import { useNavigation } from '@react-navigation/native';

const MyPostedRecipesScreen = () => {
    const [recipes, setRecipes] = useState([]);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigation = useNavigation();

    const fetchMyRecipes = async () => {
        setIsLoading(true);
        const token = await AsyncStorage.getItem('userToken');
        if (!token) {
            setError('Please log in to view your recipes.');
            setIsLoading(false);
            return;
        }

        try {
            console.log('📡 Requesting My Recipes:', `${API_URL}/api/recipes/`);
            const response = await axios.get(`${API_URL}/api/recipes/`, {
                headers: { Authorization: `Bearer ${token}` },
                timeout: 30000,
            });
            console.log('📡 Fetched My Posted Recipes:', response.data);
            const userRecipes = response.data.filter(recipe => recipe.username === 'ljchrislock');
            setRecipes(userRecipes);
            setError('');
        } catch (err) {
            console.error('Error fetching my recipes:', {
                message: err.message,
                response: err.response?.data,
                status: err.response?.status,
                config: err.config?.url,
            });
            setError('Failed to fetch your recipes. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const deleteRecipe = async (recipeId, retries = 1) => {
        const token = await AsyncStorage.getItem('userToken');
        if (!token) {
            setError('Please log in to delete recipes.');
            return;
        }

        try {
            const url = `${API_URL}/api/recipes/delete/${recipeId}/`;
            console.log(`📡 Attempting to delete recipe at: ${url}, retries left: ${retries}`);
            const response = await axios.delete(url, {
                headers: { Authorization: `Bearer ${token}` },
                timeout: 30000,
                validateStatus: (status) => status === 204 || status === 404,
            });
            console.log('📡 Delete Response:', response.status, response.data || 'No content');
            if (response.status === 204) {
                Alert.alert('Success', 'Recipe deleted successfully!');
            } else if (response.status === 404) {
                Alert.alert('Info', 'Recipe not found, it may have already been deleted.');
            }
        } catch (err) {
            console.error('Error deleting recipe:', {
                message: err.message,
                code: err.code,
                response: err.response?.data,
                status: err.response?.status,
                config: err.config?.url,
            });

            if (err.code === 'ERR_NETWORK' || err.code === 'ECONNABORTED') {
                if (retries > 0) {
                    console.log(`Retrying deletion for recipe ${recipeId}, ${retries} attempts left`);
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    return deleteRecipe(recipeId, retries - 1);
                } else {
                    await fetchMyRecipes();
                    if (!recipes.find(recipe => recipe.id === recipeId)) {
                        Alert.alert('Success', 'Recipe deleted successfully despite network issue.');
                    } else {
                        Alert.alert('Warning', 'Network issue occurred, deletion may have failed. Please try again.');
                    }
                }
            } else if (err.response?.status === 403) {
                Alert.alert('Error', 'You do not have permission to delete this recipe.');
            } else {
                Alert.alert('Error', 'Failed to delete recipe: ' + (err.response?.data?.error || err.message || 'Network issue, check server.'));
            }
        } finally {
            fetchMyRecipes();
        }
    };

    const confirmDelete = (recipeId, recipeName) => {
        Alert.alert(
            'Delete Recipe',
            `Are you sure you want to delete "${recipeName}"? This action cannot be undone.`,
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', style: 'destructive', onPress: () => deleteRecipe(recipeId) },
            ]
        );
    };

    const editRecipe = (recipe) => {
        navigation.navigate('AuthenticatedTabs', {
            screen: 'Tab_Recipes',
            params: {
                screen: 'Recipe_Edit',
                params: { recipe },
            },
        });
    };

    useEffect(() => {
        fetchMyRecipes();
    }, []);

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            console.log('Screen focused, refetching my recipes');
            fetchMyRecipes();
        });
        return unsubscribe;
    }, [navigation]);

    const renderRecipeItem = ({ item }) => (
        <View style={styles.recipeItem}>
            <Text style={styles.recipeName}>{item.recipe_name || 'No Name'}</Text>
            <Text style={styles.username}>Posted by: {item.username || 'Unknown User'}</Text>
            <Text style={styles.recipeDescription}>{item.description || 'No Description'}</Text>
            <Text style={styles.recipeInstructions}>{item.instructions || 'No Instructions'}</Text>
            {item.image && (
                <Image
                    source={{ uri: `${API_URL}${item.image}` }}
                    style={styles.recipeImage}
                    resizeMode="cover"
                />
            )}
            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={[styles.button, styles.editButton]}
                    onPress={() => editRecipe(item)}
                >
                    <Text style={styles.buttonText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.button, styles.deleteButton]}
                    onPress={() => confirmDelete(item.id, item.recipe_name)}
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
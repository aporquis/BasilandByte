// src/screens/RecipeListScreen.js
// Displays a list of all recipes for authenticated users, including the posting user.
// Enhanced: Added Save button to save recipes to user's saved list.

import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Image, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_URL } from '@env';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

const RecipeListScreen = () => {
    const [recipes, setRecipes] = useState([]);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigation = useNavigation();

    const fetchRecipes = async () => {
        setIsLoading(true);
        const token = await AsyncStorage.getItem('userToken');
        if (!token) {
            setError('Please log in to view recipes.');
            navigation.navigate('Login');
            setIsLoading(false);
            return;
        }

        try {
            console.log('📡 Requesting Recipes:', `${API_URL}/api/recipes/`);
            const response = await axios.get(`${API_URL}/api/recipes/`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            console.log('📡 Fetched Recipes:', response.data);
            setRecipes(response.data);
            setError('');
        } catch (err) {
            console.error('Error fetching recipes:', {
                message: err.message,
                response: err.response?.data,
                status: err.response?.status,
                config: err.config?.url,
            });
            setError('Failed to fetch recipes. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const saveRecipe = async (recipeId) => {
        const token = await AsyncStorage.getItem('userToken');
        if (!token) {
            setError('Please log in to save recipes.');
            navigation.navigate('Login');
            return;
        }

        try {
            console.log('📡 Saving Recipe:', `${API_URL}/api/recipes/save/`);
            const response = await axios.post(`${API_URL}/api/recipes/save/`, { recipe_id: recipeId }, {
                headers: { Authorization: `Bearer ${token}` },
                timeout: 30000,
            });
            console.log('📡 Save Recipe Response:', response.data);
            Alert.alert('Success', response.data.message);
        } catch (err) {
            console.error('❌ Error saving recipe:', {
                message: err.message,
                response: err.response?.data,
                status: err.response?.status,
                config: err.config?.url,
            });
            Alert.alert('Error', 'Failed to save recipe: ' + (err.response?.data?.error || err.message));
        }
    };

    useFocusEffect(
        React.useCallback(() => {
            fetchRecipes();
        }, [])
    );

    useEffect(() => {
        fetchRecipes();
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
            <TouchableOpacity
                style={styles.saveButton}
                onPress={() => saveRecipe(item.id)}
            >
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
                onRefresh={fetchRecipes}
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
        width: '100%', // Fixed from '100'
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
import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, Image, TouchableOpacity, Alert, Dimensions, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchRecipes, saveRecipe } from '../services/api';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

const RecipeListScreen = () => {
    const [recipes, setRecipes] = useState([]);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [savingIds, setSavingIds] = useState(new Set());
    const navigation = useNavigation();

    const fetchAllRecipes = useCallback(async () => {
        setIsLoading(true);
        try {
            const token = await AsyncStorage.getItem('userToken');
            if (!token) {
                setError('Please log in to view recipes.');
                navigation.navigate('Login');
                return;
            }

            const data = await fetchRecipes();
            setRecipes(data);
            setError('');
        } catch (error) {
            console.error('RecipeListScreen - Fetch error:', error);
            setError('Failed to fetch recipes: ' + (error.response?.data?.error || error.message));
        } finally {
            setIsLoading(false);
        }
    }, [navigation]);

    const handleSaveRecipe = async (recipeId) => {
        setSavingIds(prev => new Set(prev).add(recipeId));
        try {
            const token = await AsyncStorage.getItem('userToken');
            if (!token) {
                navigation.navigate('Login');
                return;
            }

            const data = await saveRecipe(recipeId);
            Alert.alert('Success', data.message || 'Recipe saved!');
        } catch (error) {
            Alert.alert('Error', 'Failed to save recipe: ' + (error.response?.data?.error || error.message));
        } finally {
            setSavingIds(prev => {
                const newSet = new Set(prev);
                newSet.delete(recipeId);
                return newSet;
            });
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchAllRecipes();
            return () => setError('');
        }, [fetchAllRecipes])
    );

    const renderRecipeItem = ({ item }) => {
        const imageUrl = item.image_url || item.image || null;
        return (
            <TouchableOpacity
                style={styles.recipeItem}
                onPress={() => navigation.navigate('RecipeDetail', { recipe: item })}
            >
                <Text style={styles.recipeName}>{item.recipe_name || 'No Name'}</Text>
                {imageUrl ? (
                    <Image
                        source={{ uri: imageUrl }}
                        style={styles.recipeImage}
                        resizeMode="cover"
                        onError={(e) => console.log('RecipeListScreen - Image load error:', e.nativeEvent.error)}
                    />
                ) : (
                    <Text style={styles.noData}>No image available.</Text>
                )}
                <TouchableOpacity
                    style={[styles.saveButton, savingIds.has(item.id) && styles.saveButtonDisabled]}
                    onPress={() => handleSaveRecipe(item.id)}
                    disabled={savingIds.has(item.id)}
                >
                    {savingIds.has(item.id) ? (
                        <ActivityIndicator size="small" color="#ffffff" />
                    ) : (
                        <Text style={styles.saveButtonText}>Save</Text>
                    )}
                </TouchableOpacity>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.card}>
                <Text style={styles.header}>Recipes</Text>
                {error ? <Text style={styles.error}>{error}</Text> : null}
                {isLoading && !recipes.length ? (
                    <ActivityIndicator size="large" color="#2e5436" style={styles.loading} />
                ) : (
                    <FlatList
                        data={recipes}
                        renderItem={renderRecipeItem}
                        keyExtractor={(item) => item.id.toString()}
                        ListEmptyComponent={<Text style={styles.emptyText}>No recipes available.</Text>}
                        refreshing={isLoading}
                        onRefresh={fetchAllRecipes}
                    />
                )}
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
        padding: windowWidth < 768 ? 16 : 20,
    },
    card: {
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: '#2e5436',
        borderRadius: 8,
        padding: 20,
        width: containerWidth - 40,
        shadowColor: '#000',
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 5,
    },
    header: {
        fontFamily: 'Merriweather-Bold',
        fontSize: 24,
        color: '#555',
        textAlign: 'center',
        marginVertical: 10,
    },
    recipeItem: {
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: '#2e5436',
        borderRadius: 8,
        padding: 15,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },
    recipeName: {
        fontFamily: 'Merriweather-Bold',
        fontSize: 18,
        color: '#2e5436',
        marginBottom: 10,
    },
    recipeImage: {
        width: '100%',
        height: 150,
        borderRadius: 5,
        marginBottom: 10,
    },
    saveButton: {
        backgroundColor: '#4CD964',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 4,
        alignItems: 'center',
    },
    saveButtonDisabled: {
        backgroundColor: '#a0d0a8',
    },
    saveButtonText: {
        fontFamily: 'FiraCode-Regular',
        fontSize: 16,
        color: '#ffffff',
        fontWeight: 'bold',
    },
    error: {
        fontFamily: 'FiraCode-Regular',
        fontSize: 16,
        color: 'red',
        textAlign: 'center',
        marginBottom: 10,
    },
    emptyText: {
        fontFamily: 'FiraCode-Regular',
        fontSize: 16,
        color: '#888',
        textAlign: 'center',
        marginTop: 20,
    },
    loading: {
        marginVertical: 20,
    },
    noData: {
        fontFamily: 'FiraCode-Regular',
        fontSize: 16,
        color: '#888',
        marginVertical: 10,
        textAlign: 'center',
    },
});

export default RecipeListScreen;
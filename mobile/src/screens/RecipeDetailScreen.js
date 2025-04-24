// src/screens/RecipeDetailScreen.js
// Displays detailed view of a recipe including name, image, ingredients, and instructions.
// Fetches recipe data by ID if only partial data is provided via navigation params.
// Uses image_url (Cloudinary URL) with fallback to image and missing image text.

import React, { useState, useEffect } from 'react';
import { View, Text, Image, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { fetchRecipes } from '../services/api';

const RecipeDetailScreen = ({ route }) => {
    const { recipe: initialRecipe } = route.params;
    const [recipe, setRecipe] = useState(initialRecipe);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchRecipeDetails = async () => {
            try {
                // If initialRecipe has all required fields, use it directly
                if (
                    initialRecipe.recipe_ingredients &&
                    initialRecipe.instructions &&
                    (initialRecipe.image_url || initialRecipe.image)
                ) {
                    setLoading(false);
                    return;
                }

                // Otherwise, fetch full recipe details using recipe ID
                const recipeId = initialRecipe.recipe || initialRecipe.id;
                if (!recipeId) {
                    throw new Error('No recipe ID provided');
                }
                console.log('Fetching recipe details for ID:', recipeId);
                const recipes = await fetchRecipes();
                const fullRecipe = recipes.find(r => r.id === recipeId);
                if (!fullRecipe) {
                    throw new Error('Recipe not found');
                }
                console.log('Fetched recipe:', JSON.stringify(fullRecipe, null, 2));
                setRecipe(fullRecipe);
                setLoading(false);
            } catch (err) {
                console.error('RecipeDetailScreen - Fetch error:', err.message);
                setError('Failed to load recipe details');
                setLoading(false);
            }
        };

        fetchRecipeDetails();
    }, [initialRecipe]);

    const imageUrl = recipe.image_url || recipe.image || null;
    console.log('RecipeDetailScreen - Recipe data:', JSON.stringify(recipe, null, 2));
    console.log('RecipeDetailScreen - Image URL:', imageUrl);

    if (loading) {
        return (
            <View style={styles.container}>
                <Text style={styles.noData}>Loading...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.container}>
                <Text style={styles.error}>{error}</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.card}>
                <Text style={styles.title}>{recipe.recipe_name || 'No Name'}</Text>
                {imageUrl ? (
                    <Image
                        source={{ uri: imageUrl }}
                        style={styles.image}
                        resizeMode="cover"
                        onError={(e) => console.log('RecipeDetailScreen - Image load error:', e.nativeEvent.error)}
                    />
                ) : (
                    <Text style={styles.noData}>No image available.</Text>
                )}
                <Text style={styles.sectionTitle}>Ingredients</Text>
                {recipe.recipe_ingredients && recipe.recipe_ingredients.length > 0 ? (
                    recipe.recipe_ingredients.map((ingredient, index) => (
                        <Text key={index} style={styles.ingredient}>
                            • {ingredient.ingredient_name}: {ingredient.quantity} {ingredient.unit}
                        </Text>
                    ))
                ) : (
                    <Text style={styles.noData}>No ingredients available.</Text>
                )}
                <Text style={styles.sectionTitle}>Instructions</Text>
                <Text style={styles.instructions}>
                    {recipe.instructions || 'No instructions available.'}
                </Text>
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
        padding: 20,
        width: containerWidth - 40,
        shadowColor: '#000',
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 5,
    },
    title: {
        fontFamily: 'Merriweather-Bold',
        fontSize: 24,
        color: '#555',
        marginBottom: 15,
    },
    image: {
        width: '100%',
        height: 200,
        borderRadius: 10,
        marginBottom: 15,
    },
    sectionTitle: {
        fontFamily: 'Merriweather-Regular',
        fontSize: 20,
        color: '#555',
        marginVertical: 10,
    },
    ingredient: {
        fontFamily: 'FiraCode-Regular',
        fontSize: 16,
        color: '#272727',
        marginVertical: 2,
        lineHeight: 24,
    },
    instructions: {
        fontFamily: 'FiraCode-Regular',
        fontSize: 16,
        color: '#272727',
        lineHeight: 24,
        marginBottom: 20,
    },
    noData: {
        fontFamily: 'FiraCode-Regular',
        fontSize: 16,
        color: '#888',
        textAlign: 'center',
        marginVertical: 10,
    },
    error: {
        fontFamily: 'FiraCode-Regular',
        fontSize: 16,
        color: 'red',
        textAlign: 'center',
        marginVertical: 10,
    },
});

export default RecipeDetailScreen;
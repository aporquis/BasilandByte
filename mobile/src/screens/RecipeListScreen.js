import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, Button } from 'react-native';
import axios from 'axios';
import { useFocusEffect } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import EditRecipeScreen from './EditRecipeScreen';

const Stack = createStackNavigator();

const RecipeList = ({ navigation }) => {
    const [recipes, setRecipes] = useState([]);

    const fetchRecipes = async () => {
        try {
            const response = await axios.get('http://10.0.0.150:8000/api/recipes/');
            setRecipes(response.data);
        } catch (error) {
            console.error('Error fetching recipes:', error);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchRecipes();  // Refresh list when screen is focused
        }, [])
    );

    const deleteRecipe = async (id) => {
        try {
            await axios.delete(`http://10.0.0.150:8000/api/recipes/delete/${id}/`);
            fetchRecipes();
        } catch (error) {
            console.error('Error deleting recipe:', error);
        }
    };

    return (
        <View>
            <Text style={{ fontSize: 20, fontWeight: 'bold', textAlign: 'center' }}>Recipes</Text>
            <FlatList
                data={recipes}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <View style={{ padding: 10, borderBottomWidth: 1 }}>
                        <Text style={{ fontSize: 18 }}>{item.title}</Text>
                        <Text>{item.description}</Text>
                        <Button title="Edit" onPress={() => navigation.navigate('EditRecipe', { recipe: item })} />
                        <Button title="Delete" onPress={() => deleteRecipe(item.id)} color="red" />
                    </View>
                )}
            />
        </View>
    );
};

// ✅ Stack Navigator for Recipes
const RecipesScreen = () => {
    return (
        <Stack.Navigator>
            <Stack.Screen name="RecipeList" component={RecipeList} options={{ headerShown: false }} />
            <Stack.Screen name="EditRecipe" component={EditRecipeScreen} />
        </Stack.Navigator>
    );
};

export default RecipesScreen;

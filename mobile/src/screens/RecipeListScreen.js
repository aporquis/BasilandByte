import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, Button, Image } from 'react-native';
import axios from 'axios';
import { useFocusEffect } from '@react-navigation/native';

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

    return (
        <View>
            <Text style={{ fontSize: 20, fontWeight: 'bold', textAlign: 'center' }}>Recipes</Text>
            <FlatList
                data={recipes}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <View style={{ padding: 10, borderBottomWidth: 1 }}>
                        <Text style={{ fontSize: 18 }}>{item.title}</Text>
                        <Image 
                            source={{ uri: `http://10.0.0.150:8000${item.image}` }} 
                            style={{ width: 150, height: 150, marginTop: 10 }} 
                            resizeMode="cover"
                        />
                        <Text>{item.description}</Text>
                        <Button title="Edit" onPress={() => navigation.navigate('EditRecipe', { recipe: item })} />
                        <Button title="Delete" onPress={() => deleteRecipe(item.id)} color="red" />
                    </View>
                )}
            />
        </View>
    );
};

export default RecipeList;

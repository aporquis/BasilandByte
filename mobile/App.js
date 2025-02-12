import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from './src/screens/HomeScreen';
import RecipesScreen from './src/screens/RecipeListScreen';
import AddRecipeScreen from './src/screens/AddRecipeScreen';

const Tab = createBottomTabNavigator();

export default function App() {
    return (
        <NavigationContainer>
            <Tab.Navigator>
                <Tab.Screen name="Home" component={HomeScreen} />
                <Tab.Screen name="Recipes" component={RecipesScreen} />
                <Tab.Screen name="Add Recipe" component={AddRecipeScreen} />
            </Tab.Navigator>
        </NavigationContainer>
    );
}

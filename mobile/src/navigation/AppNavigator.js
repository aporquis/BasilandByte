// src/navigation/AppNavigator.js
// Manages the navigation structure for the app, handling both authenticated and unauthenticated states.
// Uses Stack and Tab navigators to switch between screens based on authentication status.

import React, { useState, useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import WelcomeScreen from '../screens/WelcomeScreen';
import HomeScreen from '../screens/HomeScreen';
import RecipeListScreen from '../screens/RecipeListScreen';
import AddRecipeScreen from '../screens/AddRecipeScreen';
import EditRecipeScreen from '../screens/EditRecipeScreen';
import ProfileStackNavigator from '../screens/ProfileScreen';
import DashboardScreen from '../screens/DashboardScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import SavedRecipesScreen from '../screens/SavedRecipesScreen';
import WeeklyPlannerScreen from '../screens/WeeklyPlannerScreen';
import Icon from 'react-native-vector-icons/Ionicons';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Stack navigator for recipes
const RecipeStack = () => (
    <Stack.Navigator>
        <Stack.Screen
            name="Recipe_List"
            component={RecipeListScreen}
            options={{ headerTitle: () => <Text>Recipe List</Text> }}
        />
        <Stack.Screen
            name="Recipe_Add"
            component={AddRecipeScreen}
            options={{ headerTitle: () => <Text>Add Recipe</Text> }}
        />
        <Stack.Screen
            name="Recipe_Edit"
            component={EditRecipeScreen}
            options={{ headerTitle: () => <Text>Edit Recipe</Text> }}
        />
    </Stack.Navigator>
);

// Tab navigator for authenticated users
const AuthenticatedTabs = () => (
    <Tab.Navigator screenOptions={{ headerShown: true }}>
        <Tab.Screen
            name="Tab_Dashboard"
            component={DashboardScreen}
            options={{
                tabBarIcon: ({ color, size }) => (
                    <Icon name="grid" color={color} size={size} />
                ),
                headerTitle: () => <Text>Dashboard</Text>,
                tabBarLabel: () => <Text>Dashboard</Text>,
            }}
        />
        <Tab.Screen
            name="Tab_Recipes"
            component={RecipeStack}
            options={{
                tabBarIcon: ({ color, size }) => (
                    <Icon name="book" color={color} size={size} />
                ),
                headerTitle: () => <Text>Recipes</Text>,
                tabBarLabel: () => <Text>Recipes</Text>,
            }}
        />
        <Tab.Screen
            name="Tab_AddRecipe"
            component={AddRecipeScreen}
            options={{
                tabBarIcon: ({ color, size }) => (
                    <Icon name="add-circle" color={color} size={size} />
                ),
                headerTitle: () => <Text>Add Recipe</Text>,
                tabBarLabel: () => <Text>Add Recipe</Text>,
            }}
        />
        <Tab.Screen
            name="Tab_Profile"
            component={ProfileStackNavigator}
            options={{
                tabBarIcon: ({ color, size }) => (
                    <Icon name="person" color={color} size={size} />
                ),
                headerTitle: () => <Text>Profile</Text>,
                tabBarLabel: () => <Text>Profile</Text>,
            }}
        />
    </Tab.Navigator>
);

// Main app navigator
const AppNavigator = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(null);

    useEffect(() => {
        const checkAuth = async () => {
            const token = await AsyncStorage.getItem('userToken');
            setIsAuthenticated(!!token);
        };
        checkAuth();
    }, []);

    if (isAuthenticated === null) {
        return <Text>Loading...</Text>;
    }

    return (
        <Stack.Navigator initialRouteName={isAuthenticated ? 'AuthenticatedTabs' : 'Welcome'}>
            <Stack.Screen
                name="Welcome"
                component={WelcomeScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="Login"
                component={LoginScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="Register"
                component={RegisterScreen}
                options={{ headerShown: false }}
            />
            {isAuthenticated && (
                <Stack.Screen
                    name="AuthenticatedTabs"
                    component={AuthenticatedTabs}
                    options={{ headerShown: false }}
                />
            )}
            <Stack.Screen
                name="SavedRecipes"
                component={SavedRecipesScreen}
                options={{ headerTitle: () => <Text>Saved Recipes</Text> }}
            />
            <Stack.Screen
                name="WeeklyPlanner"
                component={WeeklyPlannerScreen}
                options={{ headerTitle: () => <Text>Weekly Planner</Text> }}
            />
        </Stack.Navigator>
    );
};

export default AppNavigator;

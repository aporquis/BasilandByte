// src/navigation/AppNavigator.js
// Defines the navigation structure for the app using Stack and Tab navigators.
// Switches between authenticated and unauthenticated flows based on token presence.
// Uses Text components to avoid rendering warnings.

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

// Stack navigator for recipe-related screens
const RecipeStack = () => (
    <Stack.Navigator>
        <Stack.Screen
            name="Recipe_List"
            component={RecipeListScreen}
            options={{ headerTitle: () => <Text>Recipe List</Text> }} // Wrapped in Text to avoid warning
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
                    <Icon name="grid" color={color} size={size} /> // Dashboard icon
                ),
                headerTitle: () => <Text>Dashboard</Text>,
                tabBarLabel: ({ focused }) => <Text style={{ color: focused ? '#007AFF' : '#666' }}>Dashboard</Text>, // Wrapped in Text
            }}
        />
        <Tab.Screen
            name="Tab_Recipes"
            component={RecipeStack}
            options={{
                tabBarIcon: ({ color, size }) => (
                    <Icon name="book" color={color} size={size} /> // Recipes icon
                ),
                headerTitle: () => <Text>Recipes</Text>,
                tabBarLabel: ({ focused }) => <Text style={{ color: focused ? '#007AFF' : '#666' }}>Recipes</Text>,
            }}
        />
        <Tab.Screen
            name="Tab_AddRecipe"
            component={AddRecipeScreen}
            options={{
                tabBarIcon: ({ color, size }) => (
                    <Icon name="add-circle" color={color} size={size} /> // Add recipe icon
                ),
                headerTitle: () => <Text>Add Recipe</Text>,
                tabBarLabel: ({ focused }) => <Text style={{ color: focused ? '#007AFF' : '#666' }}>Add Recipe</Text>,
            }}
        />
        <Tab.Screen
            name="Tab_Profile"
            component={ProfileStackNavigator}
            options={{
                tabBarIcon: ({ color, size }) => (
                    <Icon name="person" color={color} size={size} /> // Profile icon
                ),
                headerTitle: () => <Text>Profile</Text>,
                tabBarLabel: ({ focused }) => <Text style={{ color: focused ? '#007AFF' : '#666' }}>Profile</Text>,
            }}
        />
    </Tab.Navigator>
);

// Main app navigator managing authentication state
const AppNavigator = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(null); // Null until auth check completes

    // Check authentication status on mount
    useEffect(() => {
        const checkAuth = async () => {
            const token = await AsyncStorage.getItem('userToken'); // Check for token
            setIsAuthenticated(!!token); // Set true if token exists, false otherwise
        };
        checkAuth();
    }, []);

    // Show loading state while checking authentication
    if (isAuthenticated === null) {
        return <Text>Loading...</Text>;
    }

    // Define the navigation stack based on authentication status
    return (
        <Stack.Navigator initialRouteName={isAuthenticated ? 'AuthenticatedTabs' : 'Welcome'}>
            <Stack.Screen
                name="Welcome"
                component={WelcomeScreen}
                options={{ headerShown: false }} // No header for welcome screen
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
            <Stack.Screen
                name="Home"
                component={HomeScreen}
                options={{ headerShown: false }} // Accessible post-registration
            />
            <Stack.Screen
                name="AuthenticatedTabs"
                component={AuthenticatedTabs}
                options={{ headerShown: false }} // Main app tabs for authenticated users
            />
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
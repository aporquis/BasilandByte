// AppNavigator.js
// Manages the navigation structure for the app, handling both authenticated and unauthenticated states.
// Uses Stack and Tab navigators to switch between screens based on authentication status.

import React, { useState, useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Text } from 'react-native'; // Add this import for the Text component
import AsyncStorage from '@react-native-async-storage/async-storage';
import WelcomeScreen from '../screens/WelcomeScreen';
import HomeScreen from '../screens/HomeScreen';
import RecipeListScreen from '../screens/RecipeListScreen';
import AddRecipeScreen from '../screens/AddRecipeScreen';
import EditRecipeScreen from '../screens/EditRecipeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import DashboardScreen from '../screens/DashboardScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import Icon from 'react-native-vector-icons/Ionicons';

// Create navigation instances
const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Stack navigator for recipes, used within authenticated tabs
const RecipeStack = () => (
    <Stack.Navigator>
        <Stack.Screen name="Recipe List" component={RecipeListScreen} options={{ headerTitle: () => <Text>Recipe List</Text> }} />
        <Stack.Screen name="Edit Recipe" component={EditRecipeScreen} options={{ headerTitle: () => <Text>Edit Recipe</Text> }} />
    </Stack.Navigator>
);

// Tab navigator for authenticated users, providing access to Dashboard, Recipes, Add Recipe, and Profile
const AuthenticatedTabs = () => (
    <Tab.Navigator screenOptions={{ headerShown: true }}>
        <Tab.Screen
            name="Dashboard"
            component={DashboardScreen}
            options={{
                tabBarIcon: ({ color, size }) => (
                    <Icon name="grid" color={color} size={size} />
                ),
                headerTitle: () => <Text>Dashboard</Text>, // Ensure Text is imported and used correctly
                tabBarLabel: () => <Text>Dashboard</Text>, // Ensure Text is imported and used correctly
            }}
        />
        <Tab.Screen
            name="Recipes"
            component={RecipeStack}
            options={{
                tabBarIcon: ({ color, size }) => (
                    <Icon name="book" color={color} size={size} />
                ),
                headerTitle: () => <Text>Recipes</Text>, // Ensure Text is imported and used correctly
                tabBarLabel: () => <Text>Recipes</Text>, // Ensure Text is imported and used correctly
            }}
        />
        <Tab.Screen
            name="Add Recipe"
            component={AddRecipeScreen}
            options={{
                tabBarIcon: ({ color, size }) => (
                    <Icon name="add-circle" color={color} size={size} />
                ),
                headerTitle: () => <Text>Add Recipe</Text>, // Ensure Text is imported and used correctly
                tabBarLabel: () => <Text>Add Recipe</Text>, // Ensure Text is imported and used correctly
            }}
        />
        <Tab.Screen
            name="Profile"
            component={ProfileScreen}
            options={{
                tabBarIcon: ({ color, size }) => (
                    <Icon name="person" color={color} size={size} />
                ),
                headerTitle: () => <Text>Profile</Text>, // Ensure Text is imported and used correctly
                tabBarLabel: () => <Text>Profile</Text>, // Ensure Text is imported and used correctly
            }}
        />
    </Tab.Navigator>
);

// Main app navigator, handling authentication state
const AppNavigator = () => {
    // State to track authentication status
    const [isAuthenticated, setIsAuthenticated] = useState(null);

    useEffect(() => {
        // Check authentication status on mount
        const checkAuth = async () => {
            const token = await AsyncStorage.getItem('userToken');
            setIsAuthenticated(!!token);
        };
        checkAuth();
    }, []); // Empty dependency array ensures this runs only once on mount

    // Show loading state while checking authentication
    if (isAuthenticated === null) {
        return null; // Optionally show a loading spinner here
    }

    return (
        <Stack.Navigator initialRouteName="Welcome">
            <Stack.Screen
                name="Welcome"
                component={WelcomeScreen}
                options={{ headerShown: false, headerTitle: () => <Text>Welcome</Text> }} // Ensure Text is imported and used correctly
            />
            <Stack.Screen
                name="Login"
                component={LoginScreen}
                options={{ headerShown: false, headerTitle: () => <Text>Login</Text> }} // Ensure Text is imported and used correctly
            />
            <Stack.Screen
                name="Register"
                component={RegisterScreen}
                options={{ headerShown: false, headerTitle: () => <Text>Register</Text> }} // Ensure Text is imported and used correctly
            />
            {isAuthenticated ? (
                <Stack.Screen
                    name="Home"
                    component={HomeScreen}
                    options={{ headerShown: false, headerTitle: () => <Text>Home</Text> }} // Ensure Text is imported and used correctly
                />
            ) : null}
            <Stack.Screen
                name="Dashboard"
                component={AuthenticatedTabs}
                options={{ headerShown: false, headerTitle: () => <Text>Dashboard</Text> }} // Ensure Text is imported and used correctly
            />
            <Stack.Screen
                name="Recipes"
                component={RecipeListScreen}
                options={{ headerShown: true, headerTitle: () => <Text>Recipes</Text> }} // Ensure Text is imported and used correctly
            />
            <Stack.Screen
                name="Add Recipe"
                component={AddRecipeScreen}
                options={{ headerShown: true, headerTitle: () => <Text>Add Recipe</Text> }} // Ensure Text is imported and used correctly
            />
            <Stack.Screen
                name="Profile"
                component={ProfileScreen}
                options={{ headerShown: true, headerTitle: () => <Text>Profile</Text> }} // Ensure Text is imported and used correctly
            />
        </Stack.Navigator>
    );
};

export default AppNavigator;
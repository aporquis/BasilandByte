// AppNavigator.js
// Manages the navigation structure for the app, handling both authenticated and unauthenticated states.
// Uses Stack and Tab navigators to switch between screens based on authentication status.

import React, { useState, useEffect } from 'react'; // Import React and hooks for state and side effects
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'; // Tab navigation for authenticated users
import { createStackNavigator } from '@react-navigation/stack'; // Stack navigation for screen transitions
import { Text } from 'react-native'; // Import Text component for header titles
import AsyncStorage from '@react-native-async-storage/async-storage'; // For storing and retrieving authentication tokens
import WelcomeScreen from '../screens/WelcomeScreen'; // Initial welcome screen
import HomeScreen from '../screens/HomeScreen'; // Home screen for authenticated users
import RecipeListScreen from '../screens/RecipeListScreen'; // Screen to list all recipes
import AddRecipeScreen from '../screens/AddRecipeScreen'; // Screen to add new recipes
import EditRecipeScreen from '../screens/EditRecipeScreen'; // Screen to edit existing recipes
import ProfileScreen from '../screens/ProfileScreen'; // User profile screen
import DashboardScreen from '../screens/DashboardScreen'; // Dashboard screen
import LoginScreen from '../screens/LoginScreen'; // Login screen
import RegisterScreen from '../screens/RegisterScreen'; // Register screen
import Icon from 'react-native-vector-icons/Ionicons'; // Icons for tab navigation

// Create navigation instances
const Tab = createBottomTabNavigator(); // Tab navigator instance
const Stack = createStackNavigator(); // Stack navigator instance

// Stack navigator for recipes, used within authenticated tabs
const RecipeStack = () => (
    <Stack.Navigator>
        {/* Screen for listing recipes */}
        <Stack.Screen
            name="Recipe_List"
            component={RecipeListScreen}
            options={{ headerTitle: () => <Text>Recipe List</Text> }}
        />
        {/* Screen for adding new recipes */}
        <Stack.Screen
            name="Recipe_Add"
            component={AddRecipeScreen}
            options={{ headerTitle: () => <Text>Add Recipe</Text> }}
        />
        {/* Screen for editing existing recipes */}
        <Stack.Screen
            name="Recipe_Edit"
            component={EditRecipeScreen}
            options={{ headerTitle: () => <Text>Edit Recipe</Text> }}
        />
    </Stack.Navigator>
);

// Tab navigator for authenticated users, providing access to Dashboard, Recipes, Add Recipe, and Profile
const AuthenticatedTabs = () => (
    <Tab.Navigator screenOptions={{ headerShown: true }}>
        {/* Dashboard tab */}
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
        {/* Recipes tab with nested RecipeStack */}
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
        {/* Add Recipe tab (separate for direct access) */}
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
        {/* Profile tab */}
        <Tab.Screen
            name="Tab_Profile"
            component={ProfileScreen}
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
        <Stack.Navigator initialRouteName={isAuthenticated ? 'AuthenticatedTabs' : 'Welcome'}>
            {/* Welcome screen for initial app entry (shown if not authenticated) */}
            <Stack.Screen
                name="Welcome"
                component={WelcomeScreen}
                options={{ headerShown: false, headerTitle: () => <Text>Welcome</Text> }}
            />
            {/* Login screen for unauthenticated users */}
            <Stack.Screen
                name="Login"
                component={LoginScreen}
                options={{ headerShown: false, headerTitle: () => <Text>Login</Text> }}
            />
            {/* Register screen for new users */}
            <Stack.Screen
                name="Register"
                component={RegisterScreen}
                options={{ headerShown: false, headerTitle: () => <Text>Register</Text> }}
            />
            {/* Authenticated tabs for main app navigation (shown if authenticated) */}
            {isAuthenticated && (
                <Stack.Screen
                    name="AuthenticatedTabs"
                    component={AuthenticatedTabs}
                    options={{ headerShown: false, headerTitle: () => <Text>Dashboard</Text> }}
                />
            )}
        </Stack.Navigator>
    );
};

export default AppNavigator;
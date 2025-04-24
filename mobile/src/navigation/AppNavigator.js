import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import WelcomeScreen from '../screens/WelcomeScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import DashboardScreen from '../screens/DashboardScreen';
import HomeScreen from '../screens/HomeScreen';
import AddRecipeScreen from '../screens/AddRecipeScreen';
import EditRecipeScreen from '../screens/EditRecipeScreen';
import MyPostedRecipesScreen from '../screens/MyPostedRecipesScreen';
import ProfileScreen from '../screens/ProfileScreen';
import RecipeDetailScreen from '../screens/RecipeDetailScreen';
import RecipeListScreen from '../screens/RecipeListScreen';
import SavedRecipesScreen from '../screens/SavedRecipesScreen';
import WeeklyPlannerScreen from '../screens/WeeklyPlannerScreen';
import PersonalPantryScreen from '../screens/PersonalPantryScreen';
import ShoppingListScreen from '../screens/ShoppingListScreen';
import PoliciesScreen from '../screens/PoliciesScreen';

const Stack = createStackNavigator();

const AppNavigator = () => (
    <Stack.Navigator
        initialRouteName="Welcome"
        screenOptions={{
            headerStyle: {
                backgroundColor: '#ece6db',
                borderBottomColor: '#2e5436',
                borderBottomWidth: 1,
            },
            headerTintColor: '#2e5436',
            headerTitleStyle: {
                fontFamily: 'Merriweather-Bold',
                fontSize: 20,
            },
            // Explicitly disable gestures
            gestureEnabled: false,
        }}
    >
        <Stack.Screen
            name="Welcome"
            component={WelcomeScreen}
            options={{ headerShown: false }}
        />
        <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ title: 'Login' }}
        />
        <Stack.Screen
            name="Register"
            component={RegisterScreen}
            options={{ title: 'Register' }}
        />
        <Stack.Screen
            name="Dashboard"
            component={DashboardScreen}
            options={{ title: 'Dashboard' }}
        />
        <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{ title: 'Home' }}
        />
        <Stack.Screen
            name="AddRecipe"
            component={AddRecipeScreen}
            options={{ title: 'Add Recipe' }}
        />
        <Stack.Screen
            name="EditRecipe"
            component={EditRecipeScreen}
            options={{ title: 'Edit Recipe' }}
        />
        <Stack.Screen
            name="MyPostedRecipes"
            component={MyPostedRecipesScreen}
            options={{ title: 'My Posted Recipes' }}
        />
        <Stack.Screen
            name="Profile"
            component={ProfileScreen}
            options={{ title: 'Profile' }}
        />
        <Stack.Screen
            name="RecipeDetail"
            component={RecipeDetailScreen}
            options={{ title: 'Recipe Details' }}
        />
        <Stack.Screen
            name="RecipeList"
            component={RecipeListScreen}
            options={{ title: 'Recipes' }}
        />
        <Stack.Screen
            name="SavedRecipes"
            component={SavedRecipesScreen}
            options={{ title: 'Saved Recipes' }}
        />
        <Stack.Screen
            name="WeeklyPlanner"
            component={WeeklyPlannerScreen}
            options={{ title: 'Weekly Planner' }}
        />
        <Stack.Screen
            name="PersonalPantry"
            component={PersonalPantryScreen}
            options={{ title: 'Personal Pantry' }}
        />
        <Stack.Screen
            name="ShoppingList"
            component={ShoppingListScreen}
            options={{ title: 'Shopping List' }}
        />
        <Stack.Screen
            name="Policies"
            component={PoliciesScreen}
            options={{ title: 'Policies' }}
        />
    </Stack.Navigator>
);

export default AppNavigator;
// src/screens/ProfileScreen.js
// Displays user profile information and navigation buttons for saved recipes, posted recipes, and weekly planner.
// Uses a nested Stack Navigator to handle navigation to new screens.

import React, { useState, useEffect } from 'react'; // Import React and hooks
import { View, Text, Button, StyleSheet, TouchableOpacity } from 'react-native'; // UI components
import AsyncStorage from '@react-native-async-storage/async-storage'; // For token storage
import axios from 'axios'; // HTTP client for API requests
import { API_URL } from '@env'; // Environment variable for API endpoint
import { createStackNavigator } from '@react-navigation/stack'; // Stack navigator for nested navigation
import SavedRecipesScreen from './SavedRecipesScreen'; // Import saved recipes screen
import MyPostedRecipesScreen from './MyPostedRecipesScreen'; // Import my posted recipes screen
import WeeklyPlannerScreen from './WeeklyPlannerScreen'; // Import weekly planner screen

// Create a Stack Navigator for profile-related screens
const ProfileStack = createStackNavigator();

const ProfileScreen = ({ navigation }) => { // Accept navigation prop from ProfileStack
    const [username, setUsername] = useState(''); // State to store username
    const [error, setError] = useState(''); // State to store error messages

    useEffect(() => {
        // Fetch user info when component mounts
        const fetchUserInfo = async () => {
            const token = await AsyncStorage.getItem('userToken'); // Retrieve authentication token
            if (!token) {
                setError('Please log in to view your profile.'); // Set error if no token
                navigation.navigate('Login'); // Navigate to login if unauthenticated
                return;
            }

            try {
                const response = await axios.get(`${API_URL}/user-info/`, {
                    headers: { Authorization: `Bearer ${token}` }, // Include token in request
                });
                setUsername(response.data.username); // Update state with username
                setError(''); // Clear any previous errors
            } catch (err) {
                console.error('Error fetching user info:', err.message); // Log error details
                setError('Failed to fetch user info. Please try again.'); // User-friendly error
            }
        };
        fetchUserInfo();
    }, [navigation]);

    return (
        <View style={styles.container}>
            {/* Title for the profile screen */}
            <Text style={styles.title}>Profile</Text>
            {/* Display error message if any */}
            {error ? <Text style={styles.error}>{error}</Text> : null}
            {/* Display username */}
            <Text style={styles.username}>Welcome, {username || 'Guest'}!</Text>
            {/* Button to navigate to Saved Recipes */}
            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('SavedRecipes')}>
                <Text style={styles.buttonText}>Saved Recipes</Text>
            </TouchableOpacity>
            {/* Button to navigate to My Posted Recipes */}
            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('MyPostedRecipes')}>
                <Text style={styles.buttonText}>My Posted Recipes</Text>
            </TouchableOpacity>
            {/* Button to navigate to Weekly Planner */}
            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('WeeklyPlanner')}>
                <Text style={styles.buttonText}>Weekly Planner</Text>
            </TouchableOpacity>
        </View>
    );
};

// ProfileStackNavigator component to wrap the nested navigator
const ProfileStackNavigator = () => (
    <ProfileStack.Navigator initialRouteName="Profile">
        {/* Profile screen as the initial route */}
        <ProfileStack.Screen
            name="Profile"
            component={ProfileScreen}
            options={{ headerShown: false }} // Hide header for the initial profile screen
        />
        {/* Saved Recipes screen */}
        <ProfileStack.Screen
            name="SavedRecipes"
            component={SavedRecipesScreen}
            options={{ headerTitle: () => <Text>Saved Recipes</Text> }}
        />
        {/* My Posted Recipes screen */}
        <ProfileStack.Screen
            name="MyPostedRecipes"
            component={MyPostedRecipesScreen}
            options={{ headerTitle: () => <Text>My Posted Recipes</Text> }}
        />
        {/* Weekly Planner screen */}
        <ProfileStack.Screen
            name="WeeklyPlanner"
            component={WeeklyPlannerScreen}
            options={{ headerTitle: () => <Text>Weekly Planner</Text> }}
        />
    </ProfileStack.Navigator>
);

const styles = StyleSheet.create({
    container: {
        flex: 1, // Use full screen height
        padding: 20, // Padding around content
        justifyContent: 'center', // Center content vertically
        alignItems: 'center', // Center content horizontally
    },
    title: {
        fontSize: 24, // Large title text
        fontWeight: 'bold', // Bold title
        marginBottom: 20, // Margin below title
    },
    username: {
        fontSize: 18, // Readable text size
        color: '#333', // Dark text for contrast
        marginBottom: 20, // Margin below username
    },
    error: {
        color: 'red', // Red error text
        textAlign: 'center', // Center align
        marginBottom: 10, // Margin below error
    },
    button: {
        backgroundColor: '#007AFF', // Blue button color
        padding: 15, // Padding inside button
        borderRadius: 5, // Rounded corners
        width: '80%', // Width for better visibility
        alignItems: 'center', // Center text
        marginVertical: 10, // Vertical margin between buttons
    },
    buttonText: {
        color: 'white', // White text
        fontSize: 16, // Readable text size
        fontWeight: 'bold', // Bold text
    },
});

export default ProfileStackNavigator; // Export the navigator instead of the screen
// HomeScreen.js
// This is the entry screen for authenticated users after login or registration, displaying a welcome message and a button to access the app’s main features.
// It navigates to the Dashboard (tabbed navigation) for authenticated users.

import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// HomeScreen component receives navigation prop for navigation actions
const HomeScreen = ({ navigation }) => {
    // Handle navigation to Dashboard for authenticated users
    const handleContinue = async () => {
        try {
            // Log navigation state for debugging
            console.log('Navigation state:', navigation);
            // Ensure navigation is defined
            if (!navigation) {
                console.error('Navigation prop is undefined');
                return;
            }

            // Retrieve the user token from AsyncStorage (optional, for verification)
            const token = await AsyncStorage.getItem('userToken');
            console.log('Token found:', token);
            // Navigate to Dashboard (tabbed navigation)
            if (navigation.replace) {
                navigation.replace('Dashboard');
            } else {
                navigation.navigate('Dashboard');
            }
        } catch (error) {
            console.error('Error in handleContinue:', error.message);
            // Fallback to stay on HomeScreen or navigate to Login if token is invalid
            if (!token) {
                if (navigation.replace) {
                    navigation.replace('Login');
                } else {
                    navigation.navigate('Login');
                }
            }
        }
    };

    return (
        <View style={styles.container}>
            {/* Welcome title wrapped in <Text> */}
            <Text style={styles.title}>Welcome to Your Recipe App!</Text>
            {/* Description wrapped in <Text> */}
            <Text style={styles.description}>You’re now logged in. Explore your recipes and more!</Text>
            {/* Button to continue to the main app features */}
            <Button title="Continue to Dashboard" onPress={handleContinue} />
        </View>
    );
};

// Styles for the HomeScreen layout
const styles = StyleSheet.create({
    container: {
        flex: 1, // Takes full screen height
        justifyContent: 'center', // Centers content vertically
        alignItems: 'center', // Centers content horizontally
        padding: 20, // Adds padding around the content
    },
    title: {
        fontSize: 24, // Large font for the title
        fontWeight: 'bold', // Bold text for emphasis
        textAlign: 'center', // Centers the text
        marginBottom: 20, // Adds spacing below the title
    },
    description: {
        fontSize: 16, // Medium font for description
        textAlign: 'center', // Centers the text
        marginVertical: 10, // Adds vertical margin for spacing
    },
});

export default HomeScreen;

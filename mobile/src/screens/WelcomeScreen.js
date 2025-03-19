// WelcomeScreen.js
// Displays the app's welcome screen with a logo and two buttons: "Current Users Login" and "Register."
// Serves as the initial entry point for users before navigating to Login or Register screens.

import React from 'react';
import { View, Text, Button, Image, StyleSheet } from 'react-native';

// WelcomeScreen component receives navigation prop for navigation actions
const WelcomeScreen = ({ navigation }) => {
    // Log navigation prop for debugging
    console.log('Navigation prop:', navigation);

    // Placeholder for your app logo (replace with your actual logo URL or local asset)
    const logoSource = require('../assets/logo.png'); // Update this path to your logo asset

    // Handle navigation with a safeguard to ensure navigation is ready
    const handleNavigate = (screenName) => {
        console.log(`Navigating to ${screenName}`);
        if (navigation && navigation.navigate) {
            navigation.navigate(screenName);
        } else {
            console.error(`Navigation not available for ${screenName}`);
        }
    };

    return (
        <View style={styles.container}>
            {/* App logo */}
            <Image source={logoSource} style={styles.logo} resizeMode="contain" />
            {/* Welcome title wrapped in <Text> */}
            <Text style={styles.title}>Welcome to the Recipe App!</Text>
            {/* Buttons for login and registration */}
            <Button
                title="Current Users Login"
                onPress={() => handleNavigate('Login')}
                style={styles.button}
            />
            <Button
                title="Register"
                onPress={() => handleNavigate('Register')}
                style={styles.button}
                color="#4CAF50" // Green color for the Register button to differentiate
            />
        </View>
    );
};

// Styles for the WelcomeScreen layout
const styles = StyleSheet.create({
    container: {
        flex: 1, // Takes full screen height
        justifyContent: 'center', // Centers content vertically
        alignItems: 'center', // Centers content horizontally
        padding: 20, // Adds padding around the content
        backgroundColor: '#F5F5F5', // Light background for a clean look
    },
    logo: {
        width: 200, // Logo width
        height: 200, // Logo height
        marginBottom: 20, // Space below the logo
    },
    title: {
        fontSize: 24, // Large font for the title
        fontWeight: 'bold', // Bold text for emphasis
        textAlign: 'center', // Centers the text
        marginBottom: 30, // Adds spacing below the title
        color: '#333', // Dark gray for readability
    },
    button: {
        marginVertical: 10, // Vertical margin between buttons
        width: 200, // Fixed button width for consistency
    },
});

export default WelcomeScreen;
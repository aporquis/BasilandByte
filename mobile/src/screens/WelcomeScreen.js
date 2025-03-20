// src/screens/WelcomeScreen.js
// Displays the app's welcome screen with a logo and buttons for Login and Register.
// No API calls, just navigation handling.
// Uses a local logo asset (update path as needed).

import React from 'react';
import { View, Text, Button, Image, StyleSheet } from 'react-native';

const WelcomeScreen = ({ navigation }) => {
    // Log navigation prop for debugging
    console.log('Navigation prop:', navigation);

    // Placeholder for your app logo (replace with your actual logo asset)
    const logoSource = require('../assets/logo.png'); // Update this path to your logo asset

    // Handle navigation with a safeguard
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
            <Image source={logoSource} style={styles.logo} resizeMode="contain" />
            <Text style={styles.title}>Welcome to the Recipe App!</Text>
            <Button
                title="Current Users Login"
                onPress={() => handleNavigate('Login')}
                style={styles.button}
            />
            <Button
                title="Register"
                onPress={() => handleNavigate('Register')}
                style={styles.button}
                color="#4CAF50"
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#F5F5F5',
    },
    logo: {
        width: 200,
        height: 200,
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 30,
        color: '#333',
    },
    button: {
        marginVertical: 10,
        width: 200,
    },
});

export default WelcomeScreen;
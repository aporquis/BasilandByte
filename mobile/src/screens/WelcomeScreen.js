// src/screens/WelcomeScreen.js
// Displays the app's welcome screen with a logo and buttons for Login and Register.
// No API calls, just navigation handling.
// Uses a local logo asset (update path as needed).

import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Dimensions } from 'react-native';

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
            <View style={styles.card}>
                <Image source={logoSource} style={styles.logo} resizeMode="contain" />
                <Text style={styles.title}>Welcome to the Recipe App!</Text>
                <TouchableOpacity
                    style={styles.button}
                    onPress={() => handleNavigate('Login')}
                >
                    <Text style={styles.buttonText}>Current Users Login</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.button, styles.registerButton]}
                    onPress={() => handleNavigate('Register')}
                >
                    <Text style={styles.buttonText}>Register</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const windowWidth = Dimensions.get('window').width;
const containerWidth = Math.min(windowWidth, 800);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ece6db',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    card: {
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: '#2e5436',
        borderRadius: 8,
        padding: 20,
        width: containerWidth - 40,
        shadowColor: '#000',
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 5,
        alignItems: 'center',
    },
    logo: {
        width: 200,
        height: 200,
        marginBottom: 20,
    },
    title: {
        fontFamily: 'Merriweather-Bold',
        fontSize: 24,
        color: '#555',
        textAlign: 'center',
        marginBottom: 30,
    },
    button: {
        backgroundColor: '#2e5436',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 4,
        width: 200,
        alignItems: 'center',
        marginVertical: 10,
    },
    registerButton: {
        backgroundColor: '#4CAF50',
    },
    buttonText: {
        fontFamily: 'FiraCode-Regular',
        fontSize: 16,
        color: '#ffffff',
    },
});

export default WelcomeScreen;
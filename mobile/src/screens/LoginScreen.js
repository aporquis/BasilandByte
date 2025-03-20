// src/screens/LoginScreen.js
// Handles user login by calling loginUser from api.js.
// Navigates to AuthenticatedTabs on success using replace instead of reset.
// Includes input validation and error handling.

import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { loginUser } from '../services/api'; // Import login function from api.js

const LoginScreen = ({ navigation }) => {
    // State for form inputs and UI control
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    // Handle login form submission
    const handleLogin = async () => {
        if (!username || !password) { // Validate inputs
            setError('Username and password are required!');
            return;
        }

        try {
            await loginUser(username, password); // Attempt login via API
            setIsLoggedIn(true); // Update UI state
            setError(''); // Clear any previous errors
            navigation.replace('AuthenticatedTabs'); // Navigate to authenticated tabs
        } catch (error) {
            const errorMessage = error.response?.data?.error || error.message; // Extract error message
            setError(`Login failed: ${errorMessage}`); // Display error to user
        }
    };

    // Navigate to dashboard if token is present
    const continueToDashboard = async () => {
        const token = await AsyncStorage.getItem('userToken'); // Check for stored token
        if (token) {
            navigation.replace('AuthenticatedTabs', { screen: 'Tab_Dashboard' }); // Navigate to dashboard
        } else {
            setError('Token not found. Please log in again.'); // Show error if no token
            setIsLoggedIn(false); // Reset login state
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Login</Text>
            {error ? <Text style={styles.error}>{error}</Text> : null} {/* Display error if present */}
            <TextInput
                placeholder="Username"
                value={username}
                onChangeText={setUsername}
                style={styles.input}
            />
            <TextInput
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                style={styles.input}
            />
            <Button title="Login" onPress={handleLogin} /> {/* Trigger login */}
            {isLoggedIn && <Button title="Continue to Dashboard" onPress={continueToDashboard} />} {/* Optional dashboard button */}
            <Text style={styles.registerLink} onPress={() => navigation.navigate('Register')}>
                Don't have an account? Register
            </Text>
        </View>
    );
};

// Styles for the LoginScreen layout
const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        justifyContent: 'center', // Center content vertically
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20, // Space below title
    },
    error: {
        color: 'red',
        textAlign: 'center',
        marginBottom: 10, // Space below error
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 4,
        padding: 10,
        marginVertical: 10, // Vertical spacing between inputs
        fontSize: 16,
    },
    continueButton: {
        marginTop: 10, // Space above continue button
    },
    registerLink: {
        color: 'blue',
        textAlign: 'center',
        marginTop: 20, // Space above register link
    },
});

export default LoginScreen;
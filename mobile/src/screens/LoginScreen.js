// LoginScreen.js
// Handles user login by sending credentials to the backend, storing the JWT token, and navigating to the HomeScreen.
// Only unauthenticated users can access this screen.
// Includes a "Back to Welcome" button to return to WelcomeScreen.

import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_URL } from '@env';

// LoginScreen component receives navigation prop for navigation actions
const LoginScreen = ({ navigation }) => {
    // State for username, password, and error messages
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    // Handle login submission
    const handleLogin = async () => {
        // Validate input fields
        if (!username || !password) {
            setError('Both fields are required!');
            return;
        }

        try {
            // Send login request to backend
            const response = await axios.post(`${API_URL}/login/`, { username, password });
            // Check if the response contains a valid token
            if (response.data.token && response.data.token.access) {
                // Store the access token in AsyncStorage
                await AsyncStorage.setItem('userToken', response.data.token.access);
                // Navigate to the HomeScreen
                navigation.replace('Home');
            } else {
                setError('Invalid credentials');
            }
        } catch (err) {
            // Handle login failure
            console.error('Login error:', err.response?.data || err.message);
            setError('Login failed. Check credentials and try again.');
        }
    };

    // Handle navigation back to WelcomeScreen
    const handleBackToWelcome = () => {
        navigation.replace('Welcome');
    };

    return (
        <View style={styles.container}>
            {/* Login title wrapped in <Text> */}
            <Text style={styles.title}>Login</Text>
            {/* Display error message if there is one, wrapped in <Text> */}
            {error ? <Text style={styles.error}>{error}</Text> : null}
            {/* Username input field */}
            <TextInput
                placeholder="Username"
                value={username}
                onChangeText={setUsername}
                style={styles.input}
            />
            {/* Password input field with secure text entry */}
            <TextInput
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                style={styles.input}
            />
            {/* Login button */}
            <Button title="Login" onPress={handleLogin} />
            {/* Back to Welcome button */}
            <Button title="Back to Welcome" onPress={handleBackToWelcome} color="#666" />
        </View>
    );
};

// Styles for the LoginScreen layout
const styles = StyleSheet.create({
    container: {
        padding: 20, // Adds padding around the content
        flex: 1, // Takes full screen height
        justifyContent: 'center', // Centers content vertically
    },
    title: {
        fontSize: 24, // Large font for the title
        fontWeight: 'bold', // Bold text for emphasis
        textAlign: 'center', // Centers the text
        marginBottom: 20, // Adds spacing below the title
    },
    error: {
        color: 'red', // Red color for error messages
        textAlign: 'center', // Centers the text
        marginBottom: 10, // Adds spacing below the error
    },
    input: {
        borderBottomWidth: 1, // Underline for input fields
        marginVertical: 10, // Vertical margin for spacing
        padding: 5, // Padding inside the input
    },
});

export default LoginScreen;
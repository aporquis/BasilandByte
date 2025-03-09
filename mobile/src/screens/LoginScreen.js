// LoginScreen.js
// Allows users to log in with their username and password.
// On successful login, stores the token and navigates to the authenticated tabs.

import React, { useState } from 'react'; // Import React and useState hook
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native'; // UI components
import AsyncStorage from '@react-native-async-storage/async-storage'; // For token storage
import axios from 'axios'; // HTTP client for API requests
import { API_URL } from '@env'; // Environment variable for API endpoint

// LoginScreen component receives navigation prop for navigation actions
const LoginScreen = ({ navigation }) => {
    // State for login form inputs and error messages
    const [username, setUsername] = useState(''); // State for username input
    const [password, setPassword] = useState(''); // State for password input
    const [error, setError] = useState(''); // State for error messages
    const [isLoggedIn, setIsLoggedIn] = useState(false); // State to track login success

    // Log API_URL for debugging
    console.log('API_URL:', API_URL);

    // Handle login submission to the backend
    const handleLogin = async () => {
        // Validate inputs
        if (!username || !password) {
            setError('Username and password are required!');
            return;
        }

        setError(''); // Clear previous errors before attempting login
        try {
            console.log('Attempting to login to:', `${API_URL}/login/`); // Debug log
            // Make POST request to login endpoint (matches urls.py under /api/recipes/)
            const response = await axios.post(`${API_URL}/login/`, {
                username,
                password,
            }, {
                timeout: 10000, // 10 seconds timeout to avoid hanging
            });

            console.log('Login response:', response.data); // Debug log
            // Extract token from response (matches views.py response)
            const { access } = response.data.token; // Adjust if response structure differs
            if (access) {
                // Store the token in AsyncStorage
                await AsyncStorage.setItem('userToken', access);
                setIsLoggedIn(true); // Update state to show continue button
                setError(''); // Clear any previous errors
                // Trigger re-render of AppNavigator to check authentication
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'AuthenticatedTabs' }],
                });
            } else {
                setError('Login failed: No token received.');
            }
        } catch (err) {
            console.error('Login error:', {
                message: err.message,
                code: err.code,
                response: err.response?.data,
                config: err.config?.url, // Log the requested URL for debugging
                stack: err.stack, // Include stack trace for deeper debugging
            }); // Log detailed error
            if (err.code === 'ECONNABORTED') {
                setError('Request timed out. Check your network or server.');
            } else if (err.response) {
                setError(`Login failed: ${err.response.data.error || err.message}`);
            } else {
                setError('Network error. Ensure the server is running and reachable at ' + (err.config?.url || API_URL));
            }
        }
    };

    // Handle navigation to the dashboard after successful login (optional, can remove if reset works)
    const continueToDashboard = async () => {
        const token = await AsyncStorage.getItem('userToken'); // Verify token exists
        if (token) {
            console.log('Navigating to AuthenticatedTabs with token:', token); // Debug log
            navigation.reset({
                index: 0,
                routes: [{ name: 'AuthenticatedTabs', params: { screen: 'Tab_Dashboard' } }],
            });
        } else {
            setError('Token not found. Please log in again.');
            setIsLoggedIn(false);
        }
    };

    return (
        <View style={styles.container}>
            {/* Title for the login screen */}
            <Text style={styles.title}>Login</Text>
            {/* Display error message if any */}
            {error ? <Text style={styles.error}>{error}</Text> : null}
            {/* Username input */}
            <TextInput
                placeholder="Username"
                value={username}
                onChangeText={setUsername}
                style={styles.input}
            />
            {/* Password input */}
            <TextInput
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                style={styles.input}
            />
            {/* Login button */}
            <Button title="Login" onPress={handleLogin} />
            {/* Continue to Dashboard button, shown after successful login (optional) */}
            {isLoggedIn && (
                <Button
                    title="Continue to Dashboard"
                    onPress={continueToDashboard}
                    style={styles.continueButton}
                />
            )}
            {/* Link to register screen */}
            <Text style={styles.registerLink} onPress={() => navigation.navigate('Register')}>
                Don't have an account? Register
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1, // Use full screen height
        padding: 20, // Padding around content
        justifyContent: 'center', // Center content vertically
    },
    title: {
        fontSize: 24, // Large title text
        fontWeight: 'bold', // Bold title
        textAlign: 'center', // Center align
        marginBottom: 20, // Margin below title
    },
    error: {
        color: 'red', // Red error text
        textAlign: 'center', // Center align
        marginBottom: 10, // Margin below error
    },
    input: {
        borderWidth: 1, // Border width
        borderColor: '#ccc', // Light gray border
        borderRadius: 4, // Rounded corners
        padding: 10, // Padding inside input
        marginVertical: 10, // Vertical margin
        fontSize: 16, // Readable text size
    },
    continueButton: {
        marginTop: 10, // Margin above continue button
    },
    registerLink: {
        color: 'blue', // Blue link text
        textAlign: 'center', // Center align
        marginTop: 20, // Margin above link
    },
});

export default LoginScreen;
// RegisterScreen.js
// Allows new users to register by sending registration data to the backend’s /register/ endpoint.
// Navigates to HomeScreen after successful registration.
// Includes a "Back to Welcome" button to return to WelcomeScreen.

import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_URL } from '@env';

// RegisterScreen component receives navigation prop for navigation actions
const RegisterScreen = ({ navigation }) => {
    // State for registration form fields and errors
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');

    // Handle registration submission
    const handleRegister = async () => {
        // Validate all fields are filled
        if (!username || !password || !firstName || !lastName || !email) {
            setError('All fields are required!');
            return;
        }

        try {
            // Send registration request to backend
            const response = await axios.post(`${API_URL}/register/`, {
                username,
                password,
                first_name: firstName,
                last_name: lastName,
                email,
            });
            // On success, store the token (if returned) and navigate to HomeScreen
            if (response.data.token && response.data.token.access) {
                await AsyncStorage.setItem('userToken', response.data.token.access);
                navigation.replace('Home');
            } else {
                Alert.alert('Success', 'Registration successful! Please log in.', [
                    { text: 'OK', onPress: () => navigation.replace('Login') },
                ]);
            }
        } catch (err) {
            // Handle registration failure
            console.error('Registration error:', err.response?.data || err.message);
            if (err.response?.data?.error) {
                setError(err.response.data.error);
            } else {
                setError('Registration failed. Please try again.');
            }
        }
    };

    // Handle navigation back to WelcomeScreen
    const handleBackToWelcome = () => {
        navigation.replace('Welcome');
    };

    return (
        <View style={styles.container}>
            {/* Register title wrapped in <Text> */}
            <Text style={styles.title}>Register</Text>
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
            {/* First Name input field */}
            <TextInput
                placeholder="First Name"
                value={firstName}
                onChangeText={setFirstName}
                style={styles.input}
            />
            {/* Last Name input field */}
            <TextInput
                placeholder="Last Name"
                value={lastName}
                onChangeText={setLastName}
                style={styles.input}
            />
            {/* Email input field */}
            <TextInput
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.input}
            />
            {/* Register button */}
            <Button title="Register" onPress={handleRegister} />
            {/* Back to Welcome button */}
            <Button title="Back to Welcome" onPress={handleBackToWelcome} color="#666" />
        </View>
    );
};

// Styles for the RegisterScreen layout
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

export default RegisterScreen;
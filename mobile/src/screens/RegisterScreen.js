// src/screens/RegisterScreen.js
// Allows new users to register by sending data to /api/recipes/register/ via api.js.
// Includes first_name, last_name, and email fields in the registration request.
// Navigates to HomeScreen on success or Login if no token is returned.

import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { registerUser } from '../services/api'; // Import from api.js

const RegisterScreen = ({ navigation }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');

    // Handle registration submission
    const handleRegister = async () => {
        if (!username || !password || !firstName || !lastName || !email) {
            setError('All fields are required!');
            return;
        }

        try {
            const response = await registerUser(username, password, firstName, lastName, email);
            // Check if token is returned and stored
            const token = await AsyncStorage.getItem('userToken');
            if (token) {
                navigation.replace('Home');
            } else {
                Alert.alert('Success', 'Registration successful! Please log in.', [
                    { text: 'OK', onPress: () => navigation.replace('Login') },
                ]);
            }
        } catch (err) {
            const errorMessage = err.response?.data?.error || err.message;
            setError(`Registration failed: ${errorMessage}`);
            console.error('Registration error:', errorMessage);
        }
    };

    // Navigate back to WelcomeScreen
    const handleBackToWelcome = () => {
        navigation.replace('Welcome');
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Register</Text>
            {error ? <Text style={styles.error}>{error}</Text> : null}
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
            <TextInput
                placeholder="First Name"
                value={firstName}
                onChangeText={setFirstName}
                style={styles.input}
            />
            <TextInput
                placeholder="Last Name"
                value={lastName}
                onChangeText={setLastName}
                style={styles.input}
            />
            <TextInput
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.input}
            />
            <Button title="Register" onPress={handleRegister} />
            <Button title="Back to Welcome" onPress={handleBackToWelcome} color="#666" />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 20,
        flex: 1,
        justifyContent: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
    },
    error: {
        color: 'red',
        textAlign: 'center',
        marginBottom: 10,
    },
    input: {
        borderBottomWidth: 1,
        marginVertical: 10,
        padding: 5,
    },
});

export default RegisterScreen;
// src/screens/RegisterScreen.js
// Allows new users to register by sending data to /api/recipes/register/ via api.js.
// Includes first_name, last_name, and email fields in the registration request.
// Navigates to HomeScreen on success or Login if no token is returned.

import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Dimensions, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { registerUser } from '../services/api';

const RegisterScreen = ({ navigation }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');

    const handleRegister = async () => {
        if (!username || !password || !firstName || !lastName || !email) {
            setError('All fields are required!');
            return;
        }

        try {
            const response = await registerUser(username, password, firstName, lastName, email);
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

    const handleBackToWelcome = () => {
        navigation.replace('Welcome');
    };

    return (
        <View style={styles.container}>
            <View style={styles.card}>
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={true}
                >
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
                    <TouchableOpacity
                        style={styles.button}
                        onPress={handleRegister}
                    >
                        <Text style={styles.buttonText}>Register</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.button, styles.backButton]}
                        onPress={handleBackToWelcome}
                    >
                        <Text style={styles.buttonText}>Back to Welcome</Text>
                    </TouchableOpacity>
                </ScrollView>
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
        padding: windowWidth < 768 ? 16 : 20,
    },
    card: {
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: '#2e5436',
        borderRadius: 8,
        width: containerWidth - 40,
        shadowColor: '#000',
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 5,
        flex: 1,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    title: {
        fontFamily: 'Merriweather-Bold',
        fontSize: 24,
        color: '#555',
        textAlign: 'center',
        marginBottom: 20,
    },
    error: {
        fontFamily: 'FiraCode-Regular',
        fontSize: 16,
        color: 'red',
        textAlign: 'center',
        marginBottom: 10,
    },
    input: {
        fontFamily: 'FiraCode-Regular',
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 4,
        padding: 10,
        marginVertical: 10,
        width: '100%',
    },
    button: {
        backgroundColor: '#2e5436',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 4,
        alignItems: 'center',
        marginVertical: 10,
    },
    backButton: {
        backgroundColor: '#666',
    },
    buttonText: {
        fontFamily: 'FiraCode-Regular',
        fontSize: 16,
        color: '#ffffff',
    },
});

export default RegisterScreen;
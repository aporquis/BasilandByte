// LoginScreen.js
// Allows users to log in with their username and password.
// On successful login, stores the token and navigates to the authenticated tabs.
// Fixed: Updated endpoint to /api/recipes/login/ to match Django urls.py.
// Note: Requires @react-native-async-storage/async-storage to be installed.

import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Now resolved with installed package
import axios from 'axios';
import { API_URL } from '@env';

const LoginScreen = ({ navigation }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    console.log('API_URL:', API_URL);

    const handleLogin = async () => {
        if (!username || !password) {
            setError('Username and password are required!');
            return;
        }

        setError('');
        try {
            console.log('Attempting to login to:', `${API_URL}/api/recipes/login/`);
            const response = await axios.post(`${API_URL}/api/recipes/login/`, {
                username,
                password,
            }, {
                timeout: 10000,
            });

            console.log('Login response:', response.data);
            const { access, refresh } = response.data.token;
            if (access) {
                await AsyncStorage.setItem('userToken', access);
                await AsyncStorage.setItem('refresh_token', refresh);
                console.log('🔑 Stored access token:', access);
                console.log('🔑 Stored refresh token:', refresh);
                setIsLoggedIn(true);
                setError('');
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
                config: err.config?.url,
                stack: err.stack,
            });
            if (err.code === 'ECONNABORTED') {
                setError('Request timed out. Check your network or server.');
            } else if (err.response) {
                setError(`Login failed: ${err.response.data.error || err.message}`);
            } else {
                setError('Network error. Ensure the server is running and reachable at ' + (err.config?.url || API_URL));
            }
        }
    };

    const continueToDashboard = async () => {
        const token = await AsyncStorage.getItem('userToken');
        if (token) {
            console.log('Navigating to AuthenticatedTabs with token:', token);
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
            <Text style={styles.title}>Login</Text>
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
            <Button title="Login" onPress={handleLogin} />
            {isLoggedIn && (
                <Button
                    title="Continue to Dashboard"
                    onPress={continueToDashboard}
                    style={styles.continueButton}
                />
            )}
            <Text style={styles.registerLink} onPress={() => navigation.navigate('Register')}>
                Don't have an account? Register
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
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
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 4,
        padding: 10,
        marginVertical: 10,
        fontSize: 16,
    },
    continueButton: {
        marginTop: 10,
    },
    registerLink: {
        color: 'blue',
        textAlign: 'center',
        marginTop: 20,
    },
});

export default LoginScreen;
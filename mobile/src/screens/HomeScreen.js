// src/screens/HomeScreen.js
// Entry screen for authenticated users after login or registration.
// Displays a welcome message and navigates to Dashboard.
// No API calls, just navigation handling.

import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const HomeScreen = ({ navigation }) => {
    // Handle navigation to Dashboard
    const handleContinue = async () => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            if (!token) {
                navigation.replace('Login');
                return;
            }
            navigation.replace('Dashboard');
        } catch (error) {
            console.error('Error in handleContinue:', error.message);
            navigation.navigate('Login');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Welcome to Your Recipe App!</Text>
            <Text style={styles.description}>You’re now logged in. Explore your recipes and more!</Text>
            <Button title="Continue to Dashboard" onPress={handleContinue} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
    },
    description: {
        fontSize: 16,
        textAlign: 'center',
        marginVertical: 10,
    },
});

export default HomeScreen;
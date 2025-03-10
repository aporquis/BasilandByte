// ProfileScreen.js
// Displays user profile information and navigation buttons for saved recipes, posted recipes, and weekly planner.
// Uses a nested Stack Navigator to handle navigation to new screens.
// Fixed: Updated endpoint to /api/recipes/user-info/ to match Django urls.py.

import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_URL } from '@env';
import { createStackNavigator } from '@react-navigation/stack';
import SavedRecipesScreen from './SavedRecipesScreen';
import MyPostedRecipesScreen from './MyPostedRecipesScreen';
import WeeklyPlannerScreen from './WeeklyPlannerScreen';

const ProfileStack = createStackNavigator();

const ProfileScreen = ({ navigation }) => {
    const [username, setUsername] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchUserInfo = async () => {
            const token = await AsyncStorage.getItem('userToken');
            if (!token) {
                setError('Please log in to view your profile.');
                navigation.navigate('Login');
                return;
            }

            try {
                console.log('📡 Requesting Profile Info:', `${API_URL}/api/recipes/user-info/`); // Debug log
                const response = await axios.get(`${API_URL}/api/recipes/user-info/`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                console.log('📡 Profile Data Response:', response.data);
                setUsername(response.data.username);
                setError('');
            } catch (err) {
                console.error('Error fetching user info:', {
                    message: err.message,
                    response: err.response?.data,
                    status: err.response?.status,
                    config: err.config?.url,
                });
                setError('Failed to fetch user info. Please try again.');
            }
        };
        fetchUserInfo();
    }, [navigation]);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Profile</Text>
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <Text style={styles.username}>Welcome, {username || 'Guest'}!</Text>
            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('SavedRecipes')}>
                <Text style={styles.buttonText}>Saved Recipes</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('MyPostedRecipes')}>
                <Text style={styles.buttonText}>My Posted Recipes</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('WeeklyPlanner')}>
                <Text style={styles.buttonText}>Weekly Planner</Text>
            </TouchableOpacity>
        </View>
    );
};

const ProfileStackNavigator = () => (
    <ProfileStack.Navigator initialRouteName="Profile">
        <ProfileStack.Screen
            name="Profile"
            component={ProfileScreen}
            options={{ headerShown: false }}
        />
        <ProfileStack.Screen
            name="SavedRecipes"
            component={SavedRecipesScreen}
            options={{ headerTitle: () => <Text>Saved Recipes</Text> }}
        />
        <ProfileStack.Screen
            name="MyPostedRecipes"
            component={MyPostedRecipesScreen}
            options={{ headerTitle: () => <Text>My Posted Recipes</Text> }}
        />
        <ProfileStack.Screen
            name="WeeklyPlanner"
            component={WeeklyPlannerScreen}
            options={{ headerTitle: () => <Text>Weekly Planner</Text> }}
        />
    </ProfileStack.Navigator>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    username: {
        fontSize: 18,
        color: '#333',
        marginBottom: 20,
    },
    error: {
        color: 'red',
        textAlign: 'center',
        marginBottom: 10,
    },
    button: {
        backgroundColor: '#007AFF',
        padding: 15,
        borderRadius: 5,
        width: '80%',
        alignItems: 'center',
        marginVertical: 10,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default ProfileStackNavigator;
// src/screens/ProfileScreen.js
// Displays user profile info and navigation buttons to sub-screens.
// Uses getUserInfo from api.js to fetch username.
// Sets up a stack navigator for SavedRecipes, MyPostedRecipes, and WeeklyPlanner.

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUserInfo } from '../services/api'; // Import from api.js
import { createStackNavigator } from '@react-navigation/stack';
import SavedRecipesScreen from './SavedRecipesScreen';
import MyPostedRecipesScreen from './MyPostedRecipesScreen';
import WeeklyPlannerScreen from './WeeklyPlannerScreen';

const ProfileStack = createStackNavigator();

const ProfileScreen = ({ navigation }) => {
    const [username, setUsername] = useState('');
    const [error, setError] = useState('');

    // Fetch user info on mount
    useEffect(() => {
        const fetchUserInfo = async () => {
            const token = await AsyncStorage.getItem('userToken');
            if (!token) {
                setError('Please log in to view your profile.');
                navigation.navigate('Login');
                return;
            }

            try {
                const data = await getUserInfo();
                setUsername(data.username);
                setError('');
            } catch (error) {
                setError('Failed to fetch user info: ' + (error.response?.data?.detail || error.message));
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
        <ProfileStack.Screen name="Profile" component={ProfileScreen} options={{ headerShown: false }} />
        <ProfileStack.Screen name="SavedRecipes" component={SavedRecipesScreen} options={{ headerTitle: () => <Text>Saved Recipes</Text> }} />
        <ProfileStack.Screen name="MyPostedRecipes" component={MyPostedRecipesScreen} options={{ headerTitle: () => <Text>My Posted Recipes</Text> }} />
        <ProfileStack.Screen name="WeeklyPlanner" component={WeeklyPlannerScreen} options={{ headerTitle: () => <Text>Weekly Planner</Text> }} />
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
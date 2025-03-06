// DashboardScreen.js
// Displays a welcome message for authenticated users with a logout option.
// Accessible only after successful login.
// Navigates to WelcomeScreen after logout.

import React, { useState, useEffect } from 'react';
import { View, Text, Button, ActivityIndicator, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_URL } from '@env';

// DashboardScreen component receives navigation prop for navigation actions
const DashboardScreen = ({ navigation }) => {
    // State for user data and loading status
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch user data when the component mounts
        const fetchUserData = async () => {
            try {
                // Get the authentication token
                const token = await AsyncStorage.getItem('userToken');
                if (!token) {
                    // If no token, redirect to WelcomeScreen
                    navigation.replace('Welcome');
                    return;
                }

                // Fetch user info from backend
                const response = await axios.get(`${API_URL}/user-info/`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setUserData(response.data);
            } catch (error) {
                console.error('Error fetching user data:', error.message);
            } finally {
                setLoading(false); // End loading state
            }
        };

        fetchUserData();
    }, [navigation]); // Dependency on navigation for redirect

    // Handle logout by removing the token and navigating to WelcomeScreen
    const handleLogout = async () => {
        await AsyncStorage.removeItem('userToken');
        navigation.replace('Welcome');
    };

    // Show loading indicator while fetching data
    if (loading) {
        return <ActivityIndicator size="large" color="#0000ff" style={styles.loading} />;
    }

    return (
        <View style={styles.container}>
            {/* Dashboard title wrapped in <Text> */}
            <Text style={styles.title}>Dashboard</Text>
            {userData ? (
                <>
                    {/* Welcome message with username wrapped in <Text> */}
                    <Text style={styles.welcome}>Welcome, {userData.username}!</Text>
                    {/* Logout button */}
                    <Button title="Logout" onPress={handleLogout} />
                </>
            ) : (
                // Error message wrapped in <Text>
                <Text>Error loading user data.</Text>
            )}
        </View>
    );
};

// Styles for the DashboardScreen layout
const styles = StyleSheet.create({
    container: {
        padding: 20, // Adds padding around the content
        alignItems: 'center', // Centers content horizontally
        flex: 1, // Takes full screen height
        justifyContent: 'center', // Centers content vertically
    },
    title: {
        fontSize: 24, // Large font for the title
        fontWeight: 'bold', // Bold text for emphasis
        marginBottom: 20, // Adds spacing below the title
    },
    welcome: {
        marginVertical: 10, // Vertical margin for spacing
        fontSize: 18, // Medium font for welcome message
    },
    loading: {
        flex: 1, // Takes full screen height
        justifyContent: 'center', // Centers the loader vertically
    },
});

export default DashboardScreen;
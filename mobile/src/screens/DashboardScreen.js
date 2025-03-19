// src/screens/DashboardScreen.js
// Dashboard screen for authenticated users with welcome message, time display, meal time, and navigation to Weekly Planner.

import React, { useState, useEffect } from 'react';
import { View, Text, Button, ActivityIndicator, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_URL } from '@env';
import { useNavigation } from '@react-navigation/native';

const DashboardScreen = () => {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentTime, setCurrentTime] = useState(new Date());
    const [mealTime, setMealTime] = useState('');
    const navigation = useNavigation(); // Added for navigation

    // Fetch user data and handle token refresh on mount
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const token = await AsyncStorage.getItem('userToken');
                console.log('🔑 Retrieved Token:', token);
                if (!token) {
                    console.error('❌ No token found, redirecting to Login');
                    navigation.replace('Login');
                    return;
                }

                console.log('📡 Requesting:', `${API_URL}/api/recipes/user-info/`);
                const response = await axios.get(`${API_URL}/api/recipes/user-info/`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                console.log('📡 User Data Response:', response.data);
                setUserData(response.data);
            } catch (error) {
                console.error('❌ Error fetching user data:', {
                    message: error.message,
                    response: error.response?.data,
                    status: error.response?.status,
                    config: error.config?.url,
                });
                setError('Failed to fetch user info: ' + (error.response?.data?.detail || error.message));
                if (error.response?.status === 401) {
                    console.log('🔓 Token expired, attempting to refresh...');
                    try {
                        const newToken = await refreshToken();
                        const response = await axios.get(`${API_URL}/api/recipes/user-info/`, {
                            headers: { Authorization: `Bearer ${newToken}` },
                        });
                        console.log('📡 User Data Response after refresh:', response.data);
                        setUserData(response.data);
                        setError('');
                    } catch (refreshError) {
                        console.error('🔴 Refresh failed:', refreshError.message);
                        await AsyncStorage.removeItem('userToken');
                        await AsyncStorage.removeItem('refresh_token');
                        navigation.replace('Login');
                    }
                }
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [navigation]);

    // Update current time every minute and determine meal time
    useEffect(() => {
        const updateTimeAndMeal = () => {
            const now = new Date();
            setCurrentTime(now);

            // Determine meal time based on hour
            const hour = now.getHours();
            if (hour >= 5 && hour < 11) {
                setMealTime('Breakfast Time!');
            } else if (hour >= 11 && hour < 16) {
                setMealTime('Lunch Time!');
            } else if (hour >= 16 && hour < 22) {
                setMealTime('Dinner Time!');
            } else {
                setMealTime('Late Night Snack Time!');
            }
        };

        updateTimeAndMeal(); // Initial call
        const timer = setInterval(updateTimeAndMeal, 60000); // Update every minute

        return () => clearInterval(timer); // Cleanup on unmount
    }, []);

    // Refresh token if access token expires
    const refreshToken = async () => {
        const refresh = await AsyncStorage.getItem('refresh_token');
        console.log('🔄 Attempting to refresh with:', refresh);
        if (!refresh) throw new Error('No refresh token available');
        const response = await axios.post(`${API_URL}/api/token/refresh/`, { refresh });
        const { access } = response.data;
        await AsyncStorage.setItem('userToken', access);
        console.log('🔑 Refreshed token:', access);
        return access;
    };

    // Handle logout by clearing tokens and navigating to Welcome
    const handleLogout = async () => {
        await AsyncStorage.removeItem('userToken');
        await AsyncStorage.removeItem('refresh_token');
        navigation.replace('Welcome');
    };

    if (loading) {
        return <ActivityIndicator size="large" color="#0000ff" style={styles.loading} />;
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Dashboard</Text>
            {error ? <Text style={styles.error}>{error}</Text> : null}
            {userData ? (
                <>
                    <Text style={styles.welcome}>Welcome, {userData.username}!</Text>
                    <Text style={styles.time}>
                        Current Time: {currentTime.toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: 'numeric',
                            hour12: true,
                        })}
                    </Text>
                    <Text style={styles.mealTime}>{mealTime}</Text>
                    <Button title="Weekly Planner" onPress={() => navigation.navigate('WeeklyPlanner')} />
                    <Button title="Logout" onPress={handleLogout} />
                </>
            ) : (
                <Text>Error loading user data.</Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 20,
        alignItems: 'center',
        flex: 1,
        justifyContent: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    welcome: {
        marginVertical: 10,
        fontSize: 18,
    },
    time: {
        fontSize: 16,
        color: '#555',
        marginVertical: 5,
    },
    mealTime: {
        fontSize: 16,
        fontStyle: 'italic',
        color: '#007AFF',
        marginVertical: 5,
    },
    error: {
        color: 'red',
        marginBottom: 10,
    },
    loading: {
        flex: 1,
        justifyContent: 'center',
    },
});

export default DashboardScreen;
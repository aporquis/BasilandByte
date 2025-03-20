// src/screens/DashboardScreen.js
// Displays a welcome message, current time, and meal time for authenticated users.
// Uses getUserInfo from api.js to fetch user data.
// Includes logout functionality and navigation to WeeklyPlanner.

import React, { useState, useEffect } from 'react';
import { View, Text, Button, ActivityIndicator, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUserInfo } from '../services/api'; // Import from api.js
import { useNavigation } from '@react-navigation/native';

const DashboardScreen = () => {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentTime, setCurrentTime] = useState(new Date());
    const [mealTime, setMealTime] = useState('');
    const navigation = useNavigation();

    // Fetch user data on mount
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const token = await AsyncStorage.getItem('userToken');
                if (!token) {
                    navigation.replace('Login');
                    return;
                }
                const data = await getUserInfo();
                setUserData(data);
            } catch (error) {
                setError('Failed to fetch user info: ' + (error.response?.data?.detail || error.message));
                if (error.response?.status === 401) {
                    await AsyncStorage.removeItem('userToken');
                    await AsyncStorage.removeItem('refresh_token');
                    navigation.replace('Login');
                }
            } finally {
                setLoading(false);
            }
        };
        fetchUserData();
    }, [navigation]);

    // Update time and meal time every minute
    useEffect(() => {
        const updateTimeAndMeal = () => {
            const now = new Date();
            setCurrentTime(now);
            const hour = now.getHours();
            if (hour >= 5 && hour < 11) setMealTime('Breakfast Time!');
            else if (hour >= 11 && hour < 16) setMealTime('Lunch Time!');
            else if (hour >= 16 && hour < 22) setMealTime('Dinner Time!');
            else setMealTime('Late Night Snack Time!');
        };
        updateTimeAndMeal();
        const timer = setInterval(updateTimeAndMeal, 60000);
        return () => clearInterval(timer);
    }, []);

    // Handle logout by clearing tokens
    const handleLogout = async () => {
        await AsyncStorage.removeItem('userToken');
        await AsyncStorage.removeItem('refresh_token');
        navigation.replace('Welcome');
    };

    if (loading) return <ActivityIndicator size="large" color="#0000ff" style={styles.loading} />;

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Dashboard</Text>
            {error ? <Text style={styles.error}>{error}</Text> : null}
            {userData ? (
                <>
                    <Text style={styles.welcome}>Welcome, {userData.username}!</Text>
                    <Text style={styles.time}>
                        Current Time: {currentTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })}
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
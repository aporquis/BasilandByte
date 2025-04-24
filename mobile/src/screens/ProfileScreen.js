// src/screens/ProfileScreen.js
// Displays the user profile with buttons to navigate to Saved Recipes, Personal Pantry, Policies, Shopping List, Add Recipe, Weekly Planner, and My Recipes.
// Shows basic user info.

import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getUserInfo } from '../services/api';

const ProfileScreen = () => {
    const navigation = useNavigation();
    const [userInfo, setUserInfo] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const data = await getUserInfo();
                setUserInfo(data);
            } catch (err) {
                setError('Failed to load user info');
                console.error('fetchUserInfo - Error:', err);
            }
        };
        fetchUserInfo();
    }, []);

    return (
        <View style={styles.container}>
            <View style={styles.card}>
                <Text style={styles.title}>Profile</Text>
                {error && <Text style={styles.error}>{error}</Text>}
                {userInfo ? (
                    <Text style={styles.info}>Username: {userInfo.username}</Text>
                ) : (
                    <Text style={styles.loading}>Loading user info...</Text>
                )}
                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        onPress={() => navigation.navigate('SavedRecipes')}
                        style={styles.button}
                    >
                        <Text style={styles.buttonText}>Saved Recipes</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => navigation.navigate('PersonalPantry')}
                        style={styles.button}
                    >
                        <Text style={styles.buttonText}>Personal Pantry</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => navigation.navigate('Policies')}
                        style={styles.button}
                    >
                        <Text style={styles.buttonText}>View Policies</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => navigation.navigate('ShoppingList')}
                        style={styles.button}
                    >
                        <Text style={styles.buttonText}>Shopping List</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => navigation.navigate('Tab_AddRecipe')}
                        style={styles.button}
                    >
                        <Text style={styles.buttonText}>Add Recipe</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => navigation.navigate('WeeklyPlanner')}
                        style={styles.button}
                    >
                        <Text style={styles.buttonText}>Weekly Planner</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => navigation.navigate('MyPostedRecipes')}
                        style={styles.button}
                    >
                        <Text style={styles.buttonText}>My Recipes</Text>
                    </TouchableOpacity>
                </View>
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
        padding: 20,
    },
    card: {
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: '#2e5436',
        borderRadius: 8,
        padding: 20,
        width: containerWidth - 40,
        shadowColor: '#000',
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 5,
    },
    title: {
        fontFamily: 'Merriweather-Bold',
        fontSize: 24,
        color: '#555',
        textAlign: 'center',
        marginBottom: 15,
    },
    info: {
        fontFamily: 'FiraCode-Regular',
        fontSize: 18,
        color: '#272727',
        textAlign: 'center',
        marginBottom: 20,
    },
    buttonContainer: {
        marginTop: 20,
        alignItems: 'center',
        gap: 10,
    },
    button: {
        backgroundColor: '#2e5436',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 4,
        width: '100%',
        alignItems: 'center',
    },
    buttonText: {
        fontFamily: 'FiraCode-Regular',
        fontSize: 16,
        color: '#ffffff',
    },
    error: {
        fontFamily: 'FiraCode-Regular',
        fontSize: 16,
        color: 'red',
        textAlign: 'center',
        marginBottom: 10,
    },
    loading: {
        fontFamily: 'FiraCode-Regular',
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 10,
    },
});

export default ProfileScreen;
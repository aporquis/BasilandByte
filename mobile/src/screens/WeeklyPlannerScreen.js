// src/screens/WeeklyPlannerScreen.js
// Displays a weekly meal planner synced with the backend, with day status boxes and clear options.

import React, { useState, useEffect } from 'react';
import { View, Text, Button, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Added import
import { useNavigation } from '@react-navigation/native';
import { getWeeklyPlan, clearWeeklyPlan, clearDayPlan, fetchRecipes } from '../services/api';

const WeeklyPlannerScreen = () => {
    const [weeklyPlan, setWeeklyPlan] = useState({});
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigation = useNavigation();

    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const mealTypes = ['Breakfast', 'Lunch', 'Dinner'];

    // Fetch weekly plan and recipes on mount
    useEffect(() => {
        const loadData = async () => {
            try {
                const token = await AsyncStorage.getItem('userToken');
                if (!token) {
                    setError('Please log in to view the weekly planner.');
                    navigation.navigate('Login');
                    return;
                }

                console.log('📡 Fetching Weekly Plan');
                const planData = await getWeeklyPlan();
                setWeeklyPlan(planData);

                console.log('📡 Fetching Recipes');
                const recipeData = await fetchRecipes();
                setRecipes(recipeData);
            } catch (err) {
                setError('Failed to load planner: ' + (err.message || 'Unknown error'));
                console.error('❌ Error loading planner:', err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [navigation]);

    // Calculate the number of meals planned for a day
    const getMealCount = (day) => {
        return (weeklyPlan[day] || []).length;
    };

    // Determine the color of the day box based on meal count
    const getDayBoxColor = (day) => {
        const mealCount = getMealCount(day);
        if (mealCount === 0) return '#FF3B30'; // Red: No meals
        if (mealCount < 3) return '#FFCC00'; // Yellow: 1-2 meals
        return '#4CD964'; // Green: 3 meals
    };

    // Render meals for a specific day
    const renderMeals = (day) => (
        <FlatList
            data={weeklyPlan[day] || []}
            keyExtractor={(item) => `${day}-${item.id}`}
            renderItem={({ item }) => {
                const recipe = recipes.find(r => r.id === item.recipe);
                return recipe ? (
                    <View style={styles.mealItem}>
                        <Text style={styles.mealText}>{recipe.recipe_name} - {item.meal_type}</Text>
                        <TouchableOpacity
                            style={styles.removeButton}
                            onPress={() => Alert.alert(
                                'Notice',
                                'Individual meal removal not supported. Use Clear Day or Refresh Week.',
                                [{ text: 'OK', style: 'cancel' }]
                            )}
                        >
                            <Text style={styles.removeButtonText}>Remove</Text>
                        </TouchableOpacity>
                    </View>
                ) : null;
            }}
            ListEmptyComponent={<Text style={styles.emptyText}>No meals planned yet.</Text>}
            scrollEnabled={false}
        />
    );

    // Render a single day's section
    const renderDay = ({ item: day }) => (
        <View style={styles.dayContainer}>
            <Text style={styles.dayTitle}>{day}</Text>
            {renderMeals(day)}
            <TouchableOpacity
                style={styles.removeButton}
                onPress={() => {
                    Alert.alert(
                        'Confirm Clear',
                        `Are you sure you want to clear all meals for ${day}?`,
                        [
                            { text: 'Cancel', style: 'cancel' },
                            {
                                text: 'Clear',
                                style: 'destructive',
                                onPress: async () => {
                                    try {
                                        const success = await clearDayPlan(day);
                                        if (success) {
                                            setWeeklyPlan(prev => {
                                                const newPlan = { ...prev };
                                                delete newPlan[day];
                                                return newPlan;
                                            });
                                        }
                                    } catch (err) {
                                        Alert.alert('Error', `Failed to clear ${day}.`);
                                        console.error('❌ Error clearing day:', err);
                                    }
                                },
                            },
                        ]
                    );
                }}
            >
                <Text style={styles.removeButtonText}>Clear Day</Text>
            </TouchableOpacity>
        </View>
    );

    // Header with day boxes and refresh button
    const renderHeader = () => (
        <View>
            <Text style={styles.title}>Weekly Planner</Text>
            <View style={styles.dayBoxContainer}>
                {daysOfWeek.map(day => (
                    <View
                        key={day}
                        style={[styles.dayBox, { backgroundColor: getDayBoxColor(day) }]}
                    >
                        <Text style={styles.dayBoxText}>{day.slice(0, 3)}</Text>
                    </View>
                ))}
            </View>
            <Button title="Refresh Week" onPress={() => {
                Alert.alert(
                    'Confirm Refresh',
                    'Are you sure you want to reset the weekly plan? This will delete all meals.',
                    [
                        { text: 'Cancel', style: 'cancel' },
                        {
                            text: 'Reset',
                            style: 'destructive',
                            onPress: async () => {
                                try {
                                    const success = await clearWeeklyPlan();
                                    if (success) setWeeklyPlan({});
                                } catch (err) {
                                    Alert.alert('Error', 'Failed to clear weekly plan.');
                                    console.error('❌ Error clearing weekly plan:', err);
                                }
                            },
                        },
                    ]
                );
            }} color="#FF3B30" />
        </View>
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Loading...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={daysOfWeek}
                renderItem={renderDay}
                keyExtractor={item => item}
                ListHeaderComponent={renderHeader}
                contentContainerStyle={styles.flatListContent}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    flatListContent: {
        paddingBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    dayBoxContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    dayBox: {
        width: 40,
        height: 40,
        borderRadius: 5,
        justifyContent: 'center',
        alignItems: 'center',
    },
    dayBoxText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 12,
    },
    dayContainer: {
        marginBottom: 20,
    },
    dayTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    mealItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 10,
        backgroundColor: '#f9f9f9',
        borderRadius: 5,
        marginBottom: 5,
    },
    mealText: {
        fontSize: 16,
        color: '#333',
    },
    removeButton: {
        backgroundColor: '#FF3B30',
        padding: 5,
        borderRadius: 5,
    },
    removeButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    emptyText: {
        fontSize: 14,
        color: '#888',
        textAlign: 'center',
        marginTop: 5,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        fontSize: 18,
        color: '#666',
    },
});

export default WeeklyPlannerScreen;
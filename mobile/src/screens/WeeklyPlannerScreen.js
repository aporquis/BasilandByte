// src/screens/WeeklyPlannerScreen.js
// Displays a weekly meal planner with day status boxes and clear options.
// Uses getWeeklyPlan, clearWeeklyPlan, clearDayPlan, and fetchRecipes from api.js.
// Syncs with the backend and updates UI on changes.

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Alert, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
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

    useEffect(() => {
        const loadData = async () => {
            try {
                const token = await AsyncStorage.getItem('userToken');
                if (!token) {
                    setError('Please log in to view the weekly planner.');
                    navigation.navigate('Login');
                    return;
                }

                const planData = await getWeeklyPlan();
                setWeeklyPlan(planData);

                const recipeData = await fetchRecipes();
                setRecipes(recipeData);
            } catch (err) {
                setError('Failed to load planner: ' + (err.response?.data?.error || err.message));
                console.error('❌ Error loading planner:', err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [navigation]);

    const getMealCount = (day) => {
        return (weeklyPlan[day] || []).length;
    };

    const getDayBoxColor = (day) => {
        const mealCount = getMealCount(day);
        if (mealCount === 0) return '#FF3B30';
        if (mealCount < 3) return '#FFCC00';
        return '#4CD964';
    };

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
                                        await clearDayPlan(day);
                                        setWeeklyPlan(prev => {
                                            const newPlan = { ...prev };
                                            delete newPlan[day];
                                            return newPlan;
                                        });
                                    } catch (err) {
                                        Alert.alert('Error', `Failed to clear ${day}: ${err.message}`);
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
            <TouchableOpacity
                style={styles.refreshButton}
                onPress={() => {
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
                                        await clearWeeklyPlan();
                                        setWeeklyPlan({});
                                    } catch (err) {
                                        Alert.alert('Error', 'Failed to clear weekly plan: ' + (err.message || 'Unknown error'));
                                        console.error('❌ Error clearing weekly plan:', err);
                                    }
                                },
                            },
                        ]
                    );
                }}
            >
                <Text style={styles.buttonText}>Refresh Week</Text>
            </TouchableOpacity>
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
            <View style={styles.card}>
                <FlatList
                    data={daysOfWeek}
                    renderItem={renderDay}
                    keyExtractor={item => item}
                    ListHeaderComponent={renderHeader}
                    contentContainerStyle={styles.flatListContent}
                />
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
        padding: windowWidth < 768 ? 16 : 20,
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
    flatListContent: {
        paddingBottom: 20,
    },
    title: {
        fontFamily: 'Merriweather-Bold',
        fontSize: 24,
        color: '#555',
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
        fontFamily: 'FiraCode-Regular',
        color: '#ffffff',
        fontSize: 12,
    },
    dayContainer: {
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: '#2e5436',
        borderRadius: 8,
        padding: 15,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },
    dayTitle: {
        fontFamily: 'Merriweather-Regular',
        fontSize: 20,
        color: '#555',
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
        fontFamily: 'FiraCode-Regular',
        fontSize: 16,
        color: '#272727',
    },
    removeButton: {
        backgroundColor: '#FF3B30',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 4,
        alignItems: 'center',
    },
    refreshButton: {
        backgroundColor: '#FF3B30',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 4,
        alignItems: 'center',
        marginBottom: 20,
    },
    buttonText: {
        fontFamily: 'FiraCode-Regular',
        fontSize: 16,
        color: '#ffffff',
    },
    emptyText: {
        fontFamily: 'FiraCode-Regular',
        fontSize: 14,
        color: '#888',
        textAlign: 'center',
        marginTop: 5,
    },
    loadingContainer: {
        flex: 1,
        backgroundColor: '#ece6db',
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        fontFamily: 'FiraCode-Regular',
        fontSize: 18,
        color: '#666',
    },
});

export default WeeklyPlannerScreen;
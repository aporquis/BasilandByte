// src/screens/WeeklyPlannerScreen.js
// Displays a weekly meal planner with meals passed from SavedRecipesScreen, organized by day and meal type, with day status boxes.

import React, { useState, useEffect } from 'react';
import { View, Text, Button, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRoute } from '@react-navigation/native';

const WeeklyPlannerScreen = () => {
    const route = useRoute();
    const { meals: incomingMeals } = route.params || {};

    // State to manage meals for each day of the week, organized by meal type
    const [meals, setMeals] = useState(
        incomingMeals || {
            Monday: { Breakfast: [], Lunch: [], Dinner: [] },
            Tuesday: { Breakfast: [], Lunch: [], Dinner: [] },
            Wednesday: { Breakfast: [], Lunch: [], Dinner: [] },
            Thursday: { Breakfast: [], Lunch: [], Dinner: [] },
            Friday: { Breakfast: [], Lunch: [], Dinner: [] },
            Saturday: { Breakfast: [], Lunch: [], Dinner: [] },
            Sunday: { Breakfast: [], Lunch: [], Dinner: [] },
        }
    );

    // Log incoming meals and update state
    useEffect(() => {
        console.log('📋 Received Meals in WeeklyPlanner:', incomingMeals);
        if (incomingMeals) {
            setMeals(prevMeals => ({ ...prevMeals, ...incomingMeals }));
        }
    }, [incomingMeals]);

    // Remove a meal from the selected day and meal type
    const removeMeal = (day, mealType, mealIndex) => {
        Alert.alert(
            'Confirm Remove',
            'Are you sure you want to remove this meal?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Remove',
                    style: 'destructive',
                    onPress: () => {
                        setMeals(prevMeals => ({
                            ...prevMeals,
                            [day]: {
                                ...prevMeals[day],
                                [mealType]: prevMeals[day][mealType].filter((_, index) => index !== mealIndex),
                            },
                        }));
                    },
                },
            ]
        );
    };

    // Refresh the entire week, resetting all meals
    const refreshWeek = () => {
        Alert.alert(
            'Confirm Refresh',
            'Are you sure you want to reset the weekly plan? This will delete all meals.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Reset',
                    style: 'destructive',
                    onPress: () => {
                        setMeals({
                            Monday: { Breakfast: [], Lunch: [], Dinner: [] },
                            Tuesday: { Breakfast: [], Lunch: [], Dinner: [] },
                            Wednesday: { Breakfast: [], Lunch: [], Dinner: [] },
                            Thursday: { Breakfast: [], Lunch: [], Dinner: [] },
                            Friday: { Breakfast: [], Lunch: [], Dinner: [] },
                            Saturday: { Breakfast: [], Lunch: [], Dinner: [] },
                            Sunday: { Breakfast: [], Lunch: [], Dinner: [] },
                        });
                    },
                },
            ]
        );
    };

    // Calculate the number of meals planned for a day
    const getMealCount = (day) => {
        const breakfastCount = meals[day].Breakfast.length;
        const lunchCount = meals[day].Lunch.length;
        const dinnerCount = meals[day].Dinner.length;
        return breakfastCount + lunchCount + dinnerCount;
    };

    // Determine the color of the day box based on meal count
    const getDayBoxColor = (day) => {
        const mealCount = getMealCount(day);
        if (mealCount === 0) return '#FF3B30'; // Red: No meals
        if (mealCount < 3) return '#FFCC00'; // Yellow: Some meals (1 or 2)
        return '#4CD964'; // Green: 3 or more meals
    };

    // Render meals for a specific day and meal type
    const renderMeals = (day, mealType) => (
        <FlatList
            data={meals[day][mealType]}
            keyExtractor={(item, index) => `${day}-${mealType}-${index}`}
            renderItem={({ item, index }) => (
                <View style={styles.mealItem}>
                    <Text style={styles.mealText}>{item}</Text>
                    <TouchableOpacity
                        style={styles.removeButton}
                        onPress={() => removeMeal(day, mealType, index)}
                    >
                        <Text style={styles.removeButtonText}>Remove</Text>
                    </TouchableOpacity>
                </View>
            )}
            ListEmptyComponent={<Text style={styles.emptyText}>No {mealType.toLowerCase()} planned yet.</Text>}
            scrollEnabled={false} // Disable inner scrolling to let outer FlatList handle it
        />
    );

    // Render a single day's section
    const renderDay = ({ item: day }) => (
        <View style={styles.dayContainer}>
            <Text style={styles.dayTitle}>{day}</Text>
            {mealTypes.map(mealType => (
                <View key={`${day}-${mealType}`} style={styles.mealTypeContainer}>
                    <Text style={styles.mealTypeTitle}>{mealType}</Text>
                    {renderMeals(day, mealType)}
                </View>
            ))}
        </View>
    );

    // Header component with day boxes and refresh button
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
            <Button title="Refresh Week" onPress={refreshWeek} color="#FF3B30" />
        </View>
    );

    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const mealTypes = ['Breakfast', 'Lunch', 'Dinner'];

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
        paddingBottom: 20, // Ensure content isn’t cut off at the bottom
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
    mealTypeContainer: {
        marginBottom: 10,
    },
    mealTypeTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
        color: '#555',
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
});

export default WeeklyPlannerScreen;
// src/screens/SavedRecipesScreen.js
// Displays a list of saved recipes for the authenticated user with options to unsave and add to planner with day/meal selection.

import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_URL } from '@env';
import { useNavigation } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';

const SavedRecipesScreen = () => {
    const [savedRecipes, setSavedRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedRecipe, setSelectedRecipe] = useState(null);
    const [selectedDay, setSelectedDay] = useState('Monday');
    const [selectedMeal, setSelectedMeal] = useState('Breakfast');
    const navigation = useNavigation();

    // State to manage meals for the planner
    const [meals, setMeals] = useState({
        Monday: { Breakfast: [], Lunch: [], Dinner: [] },
        Tuesday: { Breakfast: [], Lunch: [], Dinner: [] },
        Wednesday: { Breakfast: [], Lunch: [], Dinner: [] },
        Thursday: { Breakfast: [], Lunch: [], Dinner: [] },
        Friday: { Breakfast: [], Lunch: [], Dinner: [] },
        Saturday: { Breakfast: [], Lunch: [], Dinner: [] },
        Sunday: { Breakfast: [], Lunch: [], Dinner: [] },
    });

    useEffect(() => {
        const fetchSavedRecipes = async () => {
            try {
                const token = await AsyncStorage.getItem('userToken');
                if (!token) {
                    setError('Please log in to view saved recipes.');
                    setLoading(false);
                    navigation.navigate('Login');
                    return;
                }

                console.log('📡 Requesting Saved Recipes:', `${API_URL}/api/recipes/saved-recipes/`);
                const response = await axios.get(`${API_URL}/api/recipes/saved-recipes/`, {
                    headers: { Authorization: `Bearer ${token}` },
                    timeout: 30000,
                });
                console.log('📡 Fetched Saved Recipes:', response.data);
                setSavedRecipes(response.data);
            } catch (err) {
                console.error('❌ Error fetching saved recipes:', {
                    message: err.message,
                    response: err.response?.data,
                    status: err.response?.status,
                    config: err.config?.url,
                });
                setError('Failed to fetch saved recipes: ' + (err.response?.data?.error || err.message));
            } finally {
                setLoading(false);
            }
        };

        fetchSavedRecipes();
    }, [navigation]);

    const unsaveRecipe = async (savedItemId) => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            if (!token) {
                setError('Please log in to unsave recipes.');
                navigation.navigate('Login');
                return;
            }

            console.log('📡 Unsaving Recipe:', `${API_URL}/api/recipes/save/${savedItemId}/`);
            await axios.delete(`${API_URL}/api/recipes/save/${savedItemId}/`, {
                headers: { Authorization: `Bearer ${token}` },
                timeout: 30000,
            });
            setSavedRecipes(prevRecipes => prevRecipes.filter(item => item.id !== savedItemId));
            Alert.alert('Success', 'Recipe unsaved successfully!');
        } catch (err) {
            console.error('❌ Error unsaving recipe:', {
                message: err.message,
                response: err.response?.data,
                status: err.response?.status,
                config: err.config?.url,
            });
            setError('Failed to unsave recipe: ' + (err.response?.data?.error || err.message));
            Alert.alert('Error', 'Failed to unsave recipe: ' + (err.response?.data?.error || err.message));
        }
    };

    const openPlannerModal = (recipe) => {
        setSelectedRecipe(recipe);
        setModalVisible(true);
    };

    const addToPlanner = () => {
        if (selectedRecipe && selectedDay && selectedMeal) {
            const newMeals = {
                ...meals,
                [selectedDay]: {
                    ...meals[selectedDay],
                    [selectedMeal]: [...meals[selectedDay][selectedMeal], selectedRecipe.recipe_name],
                },
            };
            setMeals(newMeals);
            console.log('📋 Sending Meals to WeeklyPlanner:', newMeals); // Debug log
            navigation.navigate('WeeklyPlanner', { meals: newMeals });
            setModalVisible(false);
            setSelectedDay('Monday'); // Reset for next use
            setSelectedMeal('Breakfast'); // Reset for next use
        }
    };

    const renderSavedRecipe = ({ item }) => (
        <View style={styles.recipeItem}>
            <Text style={styles.recipeName}>{item.recipe_name}</Text>
            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={styles.unsaveButton}
                    onPress={() => unsaveRecipe(item.id)}
                >
                    <Text style={styles.unsaveButtonText}>Unsave</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.plannerButton}
                    onPress={() => openPlannerModal(item)}
                >
                    <Text style={styles.plannerButtonText}>Add to Planner</Text>
                </TouchableOpacity>
            </View>
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
            <Text style={styles.title}>Saved Recipes</Text>
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <FlatList
                data={savedRecipes}
                renderItem={renderSavedRecipe}
                keyExtractor={item => item.id.toString()}
                ListEmptyComponent={<Text style={styles.emptyText}>No saved recipes yet.</Text>}
            />
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalView}>
                        <Text style={styles.modalTitle}>Add to Weekly Planner</Text>
                        <Text style={styles.modalSubtitle}>Select Day:</Text>
                        <Picker
                            selectedValue={selectedDay}
                            style={styles.picker}
                            onValueChange={(itemValue) => setSelectedDay(itemValue)}
                        >
                            <Picker.Item label="Monday" value="Monday" />
                            <Picker.Item label="Tuesday" value="Tuesday" />
                            <Picker.Item label="Wednesday" value="Wednesday" />
                            <Picker.Item label="Thursday" value="Thursday" />
                            <Picker.Item label="Friday" value="Friday" />
                            <Picker.Item label="Saturday" value="Saturday" />
                            <Picker.Item label="Sunday" value="Sunday" />
                        </Picker>
                        <Text style={styles.modalSubtitle}>Select Meal:</Text>
                        <Picker
                            selectedValue={selectedMeal}
                            style={styles.picker}
                            onValueChange={(itemValue) => setSelectedMeal(itemValue)}
                        >
                            <Picker.Item label="Breakfast" value="Breakfast" />
                            <Picker.Item label="Lunch" value="Lunch" />
                            <Picker.Item label="Dinner" value="Dinner" />
                        </Picker>
                        <View style={styles.modalButtonContainer}>
                            <TouchableOpacity
                                style={styles.modalButton}
                                onPress={addToPlanner}
                            >
                                <Text style={styles.modalButtonText}>Add</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.cancelButton]}
                                onPress={() => setModalVisible(false)}
                            >
                                <Text style={styles.modalButtonText}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    recipeItem: {
        padding: 15,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        marginBottom: 10,
        backgroundColor: '#f9f9f9',
    },
    recipeName: {
        fontSize: 16,
        color: '#333',
        marginBottom: 10,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    unsaveButton: {
        backgroundColor: '#FF3B30',
        padding: 5,
        borderRadius: 5,
        width: '45%',
        alignItems: 'center',
    },
    unsaveButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    plannerButton: {
        backgroundColor: '#007AFF',
        padding: 5,
        borderRadius: 5,
        width: '45%',
        alignItems: 'center',
    },
    plannerButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    error: {
        color: 'red',
        textAlign: 'center',
        marginBottom: 10,
    },
    emptyText: {
        textAlign: 'center',
        color: '#888',
        marginTop: 20,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        textAlign: 'center',
        color: '#666',
        marginVertical: 10,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalView: {
        width: 300,
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    modalSubtitle: {
        fontSize: 16,
        marginBottom: 10,
    },
    picker: {
        width: '100%',
        height: 50,
        marginBottom: 15,
    },
    modalButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    modalButton: {
        backgroundColor: '#007AFF',
        padding: 10,
        borderRadius: 5,
        width: '45%',
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: '#FF3B30',
    },
    modalButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
});

export default SavedRecipesScreen;
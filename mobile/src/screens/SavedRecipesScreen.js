// src/screens/SavedRecipesScreen.js
// Displays a list of saved recipes with unsave and add-to-planner options.
// Uses getSavedRecipes, unsaveRecipe, and addToWeeklyPlan from api.js.
// Includes a modal for selecting day and meal type.
// Modified to navigate to RecipeDetailScreen on recipe click.

import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, Modal, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import { getSavedRecipes, unsaveRecipe, addToWeeklyPlan } from '../services/api';

const SavedRecipesScreen = () => {
    const [savedRecipes, setSavedRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedRecipe, setSelectedRecipe] = useState(null);
    const [selectedDay, setSelectedDay] = useState('Monday');
    const [selectedMeal, setSelectedMeal] = useState('Breakfast');
    const navigation = useNavigation();

    useEffect(() => {
        const fetchSavedRecipes = async () => {
            try {
                const token = await AsyncStorage.getItem('userToken');
                if (!token) {
                    setError('Please log in to view saved recipes.');
                    navigation.navigate('Login');
                    return;
                }
                const data = await getSavedRecipes();
                setSavedRecipes(Array.isArray(data) ? data : []);
            } catch (error) {
                setError('Failed to fetch saved recipes: ' + (error.response?.data?.error || error.message));
            } finally {
                setLoading(false);
            }
        };
        fetchSavedRecipes();
    }, [navigation]);

    const handleUnsaveRecipe = async (savedItemId) => {
        try {
            await unsaveRecipe(savedItemId);
            setSavedRecipes(prev => prev.filter(item => item.id !== savedItemId));
            Alert.alert('Success', 'Recipe unsaved successfully!');
        } catch (error) {
            setError('Failed to unsave recipe: ' + (error.response?.data?.error || error.message));
            Alert.alert('Error', 'Failed to unsave recipe.');
        }
    };

    const openPlannerModal = (recipe) => {
        setSelectedRecipe(recipe);
        setModalVisible(true);
    };

    const handleAddToPlanner = async () => {
        if (selectedRecipe && selectedDay && selectedMeal) {
            try {
                await addToWeeklyPlan(selectedRecipe.recipe, selectedDay, selectedMeal);
                Alert.alert('Success', `Added to ${selectedDay} - ${selectedMeal}`);
                setModalVisible(false);
                setSelectedDay('Monday');
                setSelectedMeal('Breakfast');
            } catch (error) {
                setError('Failed to add to planner: ' + (error.response?.data?.error || error.message));
                Alert.alert('Error', 'Failed to add to planner.');
            }
        } else {
            Alert.alert('Error', 'Please select a day and meal type.');
        }
    };

    const renderSavedRecipe = ({ item }) => (
        <TouchableOpacity
            style={styles.recipeItem}
            onPress={() => navigation.navigate('RecipeDetail', { recipe: item })}
            activeOpacity={0.7}
        >
            <Text style={styles.recipeName}>{item?.recipe_name || 'Unnamed Recipe'}</Text>
            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={styles.unsaveButton}
                    onPress={() => handleUnsaveRecipe(item.id)}
                    disabled={!item?.id}
                >
                    <Text style={styles.buttonText}>Unsave</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.plannerButton}
                    onPress={() => openPlannerModal(item)}
                    disabled={!item?.recipe}
                >
                    <Text style={styles.buttonText}>Add to Planner</Text>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );

    if (loading) return (
        <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading...</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.card}>
                <Text style={styles.title}>Saved Recipes</Text>
                {error ? <Text style={styles.error}>{error}</Text> : null}
                <FlatList
                    data={savedRecipes}
                    renderItem={renderSavedRecipe}
                    keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
                    ListEmptyComponent={<Text style={styles.emptyText}>No saved recipes yet.</Text>}
                />
                <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
                    <View style={styles.modalContainer}>
                        <View style={styles.modalView}>
                            <Text style={styles.modalTitle}>Add to Weekly Planner</Text>
                            <Text style={styles.modalSubtitle}>Select Day:</Text>
                            <View style={styles.pickerContainer}>
                                <Picker
                                    selectedValue={selectedDay}
                                    style={styles.picker}
                                    onValueChange={setSelectedDay}
                                >
                                    <Picker.Item label="Monday" value="Monday" />
                                    <Picker.Item label="Tuesday" value="Tuesday" />
                                    <Picker.Item label="Wednesday" value="Wednesday" />
                                    <Picker.Item label="Thursday" value="Thursday" />
                                    <Picker.Item label="Friday" value="Friday" />
                                    <Picker.Item label="Saturday" value="Saturday" />
                                    <Picker.Item label="Sunday" value="Sunday" />
                                </Picker>
                            </View>
                            <Text style={styles.modalSubtitle}>Select Meal:</Text>
                            <View style={styles.pickerContainer}>
                                <Picker
                                    selectedValue={selectedMeal}
                                    style={styles.picker}
                                    onValueChange={setSelectedMeal}
                                >
                                    <Picker.Item label="Breakfast" value="Breakfast" />
                                    <Picker.Item label="Lunch" value="Lunch" />
                                    <Picker.Item label="Dinner" value="Dinner" />
                                </Picker>
                            </View>
                            <View style={styles.modalButtonContainer}>
                                <TouchableOpacity
                                    style={styles.modalButton}
                                    onPress={handleAddToPlanner}
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
    title: {
        fontFamily: 'Merriweather-Bold',
        fontSize: 24,
        color: '#555',
        marginBottom: 20,
        textAlign: 'center',
    },
    recipeItem: {
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
    recipeName: {
        fontFamily: 'Merriweather-Bold',
        fontSize: 16,
        color: '#2e5436',
        marginBottom: 10,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    unsaveButton: {
        backgroundColor: '#FF3B30',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 4,
        width: '45%',
        alignItems: 'center',
    },
    plannerButton: {
        backgroundColor: '#007AFF',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 4,
        width: '45%',
        alignItems: 'center',
    },
    buttonText: {
        fontFamily: 'FiraCode-Regular',
        fontSize: 14,
        color: '#ffffff',
    },
    error: {
        fontFamily: 'FiraCode-Regular',
        fontSize: 16,
        color: 'red',
        textAlign: 'center',
        marginBottom: 10,
    },
    emptyText: {
        fontFamily: 'FiraCode-Regular',
        fontSize: 16,
        color: '#888',
        textAlign: 'center',
        marginTop: 20,
    },
    loadingContainer: {
        flex: 1,
        backgroundColor: '#ece6db',
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        fontFamily: 'FiraCode-Regular',
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
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
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: '#2e5436',
        borderRadius: 10,
        padding: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 5,
    },
    modalTitle: {
        fontFamily: 'Merriweather-Bold',
        fontSize: 20,
        color: '#555',
        marginBottom: 15,
    },
    modalSubtitle: {
        fontFamily: 'FiraCode-Regular',
        fontSize: 16,
        color: '#272727',
        marginBottom: 10,
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 4,
        marginBottom: 15,
        width: '100%',
    },
    picker: {
        fontFamily: 'FiraCode-Regular',
        width: '100%',
        height: 50,
        color: '#272727',
    },
    modalButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    modalButton: {
        backgroundColor: '#007AFF',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 5,
        width: '45%',
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: '#FF3B30',
    },
    modalButtonText: {
        fontFamily: 'FiraCode-Regular',
        color: '#ffffff',
        fontSize: 16,
    },
});

export default SavedRecipesScreen;
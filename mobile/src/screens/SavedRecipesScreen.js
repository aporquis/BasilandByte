// src/screens/SavedRecipesScreen.js
// Displays a list of recipes saved by the user (placeholder implementation).

import React from 'react'; // Import React
import { View, Text, StyleSheet } from 'react-native'; // UI components

const SavedRecipesScreen = () => {
    return (
        <View style={styles.container}>
            {/* Title for the saved recipes screen */}
            <Text style={styles.title}>Saved Recipes</Text>
            {/* Placeholder content */}
            <Text style={styles.placeholder}>This page will show your saved recipes.</Text>
            <Text style={styles.placeholder}>Feature to be implemented (e.g., save recipes via a button on RecipeListScreen).</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1, // Use full screen height
        padding: 20, // Padding around content
        justifyContent: 'center', // Center content vertically
        alignItems: 'center', // Center content horizontally
    },
    title: {
        fontSize: 24, // Large title text
        fontWeight: 'bold', // Bold title
        marginBottom: 20, // Margin below title
    },
    placeholder: {
        fontSize: 16, // Readable text size
        color: '#666', // Neutral color
        textAlign: 'center', // Center align
        marginVertical: 10, // Vertical margin
    },
});

export default SavedRecipesScreen;
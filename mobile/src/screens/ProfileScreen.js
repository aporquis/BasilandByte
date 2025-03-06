// ProfileScreen.js
// Placeholder screen for user profile functionality, to be expanded later.
// Currently shows a simple message indicating future development.

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// ProfileScreen component
const ProfileScreen = () => {
    return (
        <View style={styles.container}>
            {/* Profile title wrapped in <Text> */}
            <Text style={styles.title}>Profile</Text>
            {/* Placeholder message wrapped in <Text> */}
            <Text>Profile screen coming soon!</Text>
        </View>
    );
};

// Styles for the ProfileScreen layout
const styles = StyleSheet.create({
    container: {
        flex: 1, // Takes full screen height
        justifyContent: 'center', // Centers content vertically
        alignItems: 'center', // Centers content horizontally
    },
    title: {
        fontSize: 24, // Large font for the title
        fontWeight: 'bold', // Bold text for emphasis
        marginBottom: 20, // Adds spacing below the title
    },
});

export default ProfileScreen;
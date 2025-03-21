// App.js
// The root component of the React Native app, wrapping the navigation in a NavigationContainer.
// Sets up the main app structure using AppNavigator for authentication and navigation handling.

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator'; // Updated import path to match project structure

// App component
const App = () => (
    <NavigationContainer>
        <AppNavigator /> {/* Use the complex navigation setup with authentication and tabs */}
    </NavigationContainer>
);

export default App;
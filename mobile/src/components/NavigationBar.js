// src/components/NavigationBar.js
   // Custom navigation bar for switching between main screens.

   import React from 'react';
   import { View, TouchableOpacity, StyleSheet } from 'react-native';
   import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

   const NavigationBar = ({ navigation, activeScreen }) => {
       const screens = [
           { name: 'Dashboard', icon: 'view-dashboard' },
           { name: 'Recipes', icon: 'book-open' },
           { name: 'AddRecipe', icon: 'plus-box' },
           { name: 'Profile', icon: 'account' },
       ];

       return (
           <View style={styles.container}>
               {screens.map(screen => (
                   <TouchableOpacity
                       key={screen.name}
                       style={[
                           styles.button,
                           activeScreen === screen.name && styles.activeButton,
                       ]}
                       onPress={() => navigation.navigate(screen.name)}
                   >
                       <Icon
                           name={screen.icon}
                           size={24}
                           color={activeScreen === screen.name ? '#2e5436' : '#666'}
                       />
                   </TouchableOpacity>
               ))}
           </View>
       );
   };

   const styles = StyleSheet.create({
       container: {
           flexDirection: 'row',
           justifyContent: 'space-around',
           backgroundColor: '#ece6db',
           paddingVertical: 10,
           borderBottomWidth: 1,
           borderBottomColor: '#2e5436',
       },
       button: {
           padding: 10,
       },
       activeButton: {
           borderBottomWidth: 2,
           borderBottomColor: '#2e5436',
       },
   });

   export default NavigationBar;
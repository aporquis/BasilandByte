// src/screens/DashboardScreen.js
   // Dashboard screen for authenticated users.
   // Displays a welcome message, navigation bar, and navigation options.

   import React from 'react';
   import { View, Text, TouchableOpacity, StyleSheet, Dimensions, ScrollView } from 'react-native';
   import NavigationBar from '../components/NavigationBar';

   const DashboardScreen = ({ navigation }) => {
       return (
           <View style={styles.container}>
               <NavigationBar navigation={navigation} activeScreen="Dashboard" />
               <View style={styles.card}>
                   <ScrollView
                       contentContainerStyle={styles.scrollContent}
                       showsVerticalScrollIndicator={true}
                   >
                       <Text style={styles.title}>Dashboard</Text>
                       <Text style={styles.paragraph}>Welcome to Basil and Byte! This app is your one stop shop for adding and exploring Recipes! Need to Plan a meal? We got you covered!</Text>
                       <TouchableOpacity
                           style={styles.button}
                           onPress={() => navigation.navigate('RecipeList')}
                       >
                           <Text style={styles.buttonText}>View Recipes</Text>
                       </TouchableOpacity>
                       <TouchableOpacity
                           style={styles.button}
                           onPress={() => navigation.navigate('AddRecipe')}
                       >
                           <Text style={styles.buttonText}>Add a Recipe</Text>
                       </TouchableOpacity>
                       <TouchableOpacity
                           style={styles.button}
                           onPress={() => navigation.navigate('Profile')}
                       >
                           <Text style={styles.buttonText}>Go to Profile</Text>
                       </TouchableOpacity>
                   </ScrollView>
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
       },
       card: {
           backgroundColor: '#ffffff',
           borderWidth: 1,
           borderColor: '#2e5436',
           borderRadius: 8,
           width: containerWidth - 40,
           shadowColor: '#000',
           shadowOffset: { width: 2, height: 2 },
           shadowOpacity: 0.1,
           shadowRadius: 5,
           elevation: 5,
           flex: 1,
           marginBottom: 16,
           marginTop: 10,
       },
       scrollContent: {
           padding: 20,
           paddingBottom: 40,
       },
       title: {
           fontFamily: 'Merriweather-Bold',
           fontSize: 24,
           color: '#555',
           textAlign: 'center',
           marginBottom: 20,
       },
       paragraph: {
           fontFamily: 'FiraCode-Regular',
           fontSize: 16,
           color: '#272727',
           textAlign: 'center',
           marginBottom: 20,
       },
       button: {
           backgroundColor: '#2e5436',
           paddingVertical: 8,
           paddingHorizontal: 16,
           borderRadius: 4,
           alignItems: 'center',
           marginVertical: 10,
       },
       buttonText: {
           fontFamily: 'FiraCode-Regular',
           fontSize: 16,
           color: '#ffffff',
       },
   });

   export default DashboardScreen;
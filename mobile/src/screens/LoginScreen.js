// src/screens/LoginScreen.js
   // Handles user login by calling loginUser from api.js.
   // Navigates to Dashboard on success using replace instead of reset.
   // Includes input validation and error handling.

   import React, { useState } from 'react';
   import { View, Text, TextInput, TouchableOpacity, StyleSheet, Dimensions, ScrollView } from 'react-native';
   import { loginUser, logLoginEvent } from '../services/api';

   const LoginScreen = ({ navigation }) => {
       const [username, setUsername] = useState('');
       const [password, setPassword] = useState('');
       const [error, setError] = useState('');
       const [isLoggedIn, setIsLoggedIn] = useState(false);

       const handleLogin = async () => {
           if (!username || !password) {
               setError('Username and password are required!');
               await logLoginEvent(username || 'unknown', 'failure', 'mobile');
               return;
           }

           try {
               await logLoginEvent(username, 'attempt', 'mobile');
               await loginUser(username, password);
               await logLoginEvent(username, 'success', 'mobile');
               setIsLoggedIn(true);
               setError('');
               navigation.replace('Dashboard');
           } catch (error) {
               const errorMessage = error.message || 'Unknown error';
               await logLoginEvent(username, 'failure', 'mobile');
               setError(`Login failed: ${errorMessage}`);
               console.error('Login error:', error);
           }
       };

       const handleRegisterRedirect = () => {
           navigation.navigate('Register');
       };

       return (
           <View style={styles.container}>
               <View style={styles.card}>
                   <ScrollView
                       contentContainerStyle={styles.scrollContent}
                       showsVerticalScrollIndicator={true}
                   >
                       <Text style={styles.title}>Login</Text>
                       {error ? <Text style={styles.error}>{error}</Text> : null}
                       <TextInput
                           placeholder="Username"
                           value={username}
                           onChangeText={setUsername}
                           style={styles.input}
                       />
                       <TextInput
                           placeholder="Password"
                           value={password}
                           onChangeText={setPassword}
                           secureTextEntry
                           style={styles.input}
                       />
                       <TouchableOpacity
                           style={styles.button}
                           onPress={handleLogin}
                       >
                           <Text style={styles.buttonText}>Login</Text>
                       </TouchableOpacity>
                       <TouchableOpacity
                           style={[styles.button, styles.registerButton]}
                           onPress={handleRegisterRedirect}
                       >
                           <Text style={styles.buttonText}>Register</Text>
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
           justifyContent: 'center',
           padding: windowWidth < 768 ? 16 : 20,
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
       error: {
           fontFamily: 'FiraCode-Regular',
           fontSize: 16,
           color: 'red',
           textAlign: 'center',
           marginBottom: 10,
       },
       input: {
           fontFamily: 'FiraCode-Regular',
           fontSize: 16,
           borderWidth: 1,
           borderColor: '#ccc',
           borderRadius: 4,
           padding: 10,
           marginVertical: 10,
           width: '100%',
       },
       button: {
           backgroundColor: '#2e5436',
           paddingVertical: 8,
           paddingHorizontal: 16,
           borderRadius: 4,
           alignItems: 'center',
           marginVertical: 10,
       },
       registerButton: {
           backgroundColor: '#666',
       },
       buttonText: {
           fontFamily: 'FiraCode-Regular',
           fontSize: 16,
           color: '#ffffff',
       },
   });

   export default LoginScreen;
import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HomeScreen from "../screens/HomeScreen";
import RecipeListScreen from "../screens/RecipeListScreen";
import AddRecipeScreen from "../screens/AddRecipeScreen";
import Icon from "react-native-vector-icons/Ionicons";

const Tab = createBottomTabNavigator();

const AppNavigator = () => {
  return (
    <Tab.Navigator screenOptions={{ headerShown: true }}>
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ tabBarIcon: ({ color, size }) => (<Icon name="home" color={color} size={size} />) }}
      />
      <Tab.Screen 
        name="Recipes" 
        component={RecipeListScreen} 
        options={{ tabBarIcon: ({ color, size }) => (<Icon name="book" color={color} size={size} />) }}
      />
      <Tab.Screen 
        name="Add Recipe" 
        component={AddRecipeScreen} 
        options={{ tabBarIcon: ({ color, size }) => (<Icon name="add-circle" color={color} size={size} />) }}
      />
    </Tab.Navigator>
  );
};

export default AppNavigator;

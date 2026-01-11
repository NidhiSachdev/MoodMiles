import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import LoginScreen from './LoginScreen';
import HomeScreen from './HomeScreen';
import TripDetailsScreen from './TripDetailsScreen';
import SavedTripsScreen from './SavedTripsScreen';
import ProfileScreen from './ProfileScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#000000',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: 'MoodMiles' }}
        />
        <Stack.Screen
          name="TripDetails"
          component={TripDetailsScreen}
          options={{ title: 'Trip Details' }}
        />
        <Stack.Screen
          name="SavedTrips"
          component={SavedTripsScreen}
          options={{ title: 'My Saved Trips' }}
        />
        <Stack.Screen
          name="Profile"
          component={ProfileScreen}
          options={{ title: 'My Profile' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
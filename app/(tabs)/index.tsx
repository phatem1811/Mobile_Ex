import React from 'react';
import { NavigationContainer } from '@react-navigation/native'; 
import { createStackNavigator } from '@react-navigation/stack';

import IntroPage from './introduce'; 
import HomePage from './homepage'; 

const Stack = createStackNavigator();

export default function App() {

  return (
    <Stack.Navigator initialRouteName="Intro">
        <Stack.Screen name="Intro" component={IntroPage} />
        <Stack.Screen name="Home" component={HomePage} />
    </Stack.Navigator>
); 
}

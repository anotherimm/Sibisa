// src/navigation/AppNavigator.js
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/HomeScreen';
import NasabahScreen from '../screens/NasabahScreen';
import SetoranScreen from '../screens/SetoranScreen';
import MonitoringScreen from '../screens/MonitoringScreen';
import HasilSetoranScreen from '../screens/HasilSetoranScreen';

const Stack = createStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator initialRouteName="Home">
      <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Nasabah" component={NasabahScreen} options={{ title: 'Nasabah' }} />
      <Stack.Screen name="Setoran" component={SetoranScreen} options={{ title: 'Setoran Sampah' }} />
      <Stack.Screen name="Monitoring" component={MonitoringScreen} options={{ title: 'Monitoring Fermentasi Pupuk' }} />
      <Stack.Screen name="HasilSetoran" component={HasilSetoranScreen} options={{ title: 'Hasil Setoran' }}/>
    </Stack.Navigator>
  );
}

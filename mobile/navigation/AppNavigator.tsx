import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import PracticeScreen from '../src/screens/PracticeScreen';
import RecordingScreen from '../screens/RecordingScreen';

export type RootStackParamList = {
  Voice: undefined;
  Recording: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Voice"
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#FAFAFA' },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="Voice" component={PracticeScreen} />
        <Stack.Screen name="Recording" component={RecordingScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

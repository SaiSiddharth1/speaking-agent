import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import PracticeScreen from '../src/screens/PracticeScreen';

export type RootStackParamList = {
  Voice: undefined;
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
      </Stack.Navigator>
    </NavigationContainer>
  );
}

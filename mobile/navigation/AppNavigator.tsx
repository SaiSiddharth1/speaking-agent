import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import PracticeScreen from '../src/screens/PracticeScreen';
import ConversationScreen from '../app/conversation';

export type RootStackParamList = {
  Conversation: undefined;
  Voice: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Conversation"
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#0F0F1A' },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="Conversation" component={ConversationScreen} />
        <Stack.Screen name="Voice" component={PracticeScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

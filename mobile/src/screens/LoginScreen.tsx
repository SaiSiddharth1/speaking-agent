import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { login as apiLogin, register as apiRegister } from '../api/auth';

export default function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isRegister, setIsRegister] = useState(false);

  const handleSubmit = async () => {
    try {
      if (isRegister) {
        const data = await apiRegister(name, email, password);
        await login(data.access_token, data.user);
      } else {
        const data = await apiLogin(email, password);
        await login(data.access_token, data.user);
      }
    } catch (err: any) {
      Alert.alert('Authentication Error', err.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Speaking Agent</Text>
      {isRegister && (
        <TextInput
          style={styles.input}
          placeholder="Name"
          value={name}
          onChangeText={setName}
        />
      )}
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TouchableOpacity style={styles.btn} onPress={handleSubmit}>
        <Text style={styles.btnText}>{isRegister ? 'Sign Up' : 'Sign In'}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => setIsRegister(!isRegister)}>
        <Text style={styles.toggleText}>
          {isRegister ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#FFF' },
  title: { fontSize: 28, fontWeight: '800', textAlign: 'center', marginBottom: 32, color: '#6366F1' },
  input: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, padding: 14, fontSize: 15, marginBottom: 16 },
  btn: { backgroundColor: '#6366F1', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  btnText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
  toggleText: { textAlign: 'center', color: '#6366F1', marginTop: 16 }
});

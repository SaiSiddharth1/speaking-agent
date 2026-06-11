import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';

export default function RegisterScreen() {
  const router = useRouter();
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert('Missing fields', 'Please fill all fields.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Weak password', 'Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      await register(email.trim(), password, name.trim());
      router.replace('/');
    } catch {
      Alert.alert('Registration failed', 'Try a different email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Text style={styles.title}>Create account</Text>
      <Text style={styles.subtitle}>Start improving your English today</Text>

      <TextInput style={styles.input} placeholder="Full name" value={name} onChangeText={setName} placeholderTextColor="#9CA3AF" />
      <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholderTextColor="#9CA3AF" />
      <TextInput style={styles.input} placeholder="Password (min 6 chars)" value={password} onChangeText={setPassword} secureTextEntry placeholderTextColor="#9CA3AF" />

      <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Create account</Text>}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.link}>Already have an account? Sign in</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center', backgroundColor: '#F9FAFB' },
  title: { fontSize: 28, fontWeight: '700', color: '#111827', marginBottom: 6 },
  subtitle: { fontSize: 15, color: '#6B7280', marginBottom: 32 },
  input: {
    borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12,
    padding: 14, fontSize: 15, backgroundColor: '#FFFFFF',
    marginBottom: 14, color: '#111827',
  },
  button: {
    backgroundColor: '#6C63FF', borderRadius: 12,
    padding: 16, alignItems: 'center', marginTop: 6, marginBottom: 20,
  },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  link: { textAlign: 'center', color: '#6C63FF', fontSize: 14 },
});

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function DashboardScreen({ navigation }: any) {
  const { user, logout } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.welcome}>Welcome back, {user?.name || 'User'}!</Text>
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('Conversation')}
      >
        <Text style={styles.cardTitle}>Start Practice Session</Text>
        <Text style={styles.cardDesc}>Improve your English with interactive AI feedback.</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
        <Text style={styles.logoutText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#F3F4F6', justifyContent: 'center' },
  welcome: { fontSize: 24, fontWeight: '700', color: '#1E293B', marginBottom: 32 },
  card: { backgroundColor: '#FFF', borderRadius: 12, padding: 24, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, marginBottom: 32 },
  cardTitle: { fontSize: 18, fontWeight: '700', color: '#6366F1', marginBottom: 8 },
  cardDesc: { fontSize: 14, color: '#64748B' },
  logoutBtn: { paddingVertical: 12, alignItems: 'center' },
  logoutText: { color: '#EF4444', fontWeight: '600' }
});

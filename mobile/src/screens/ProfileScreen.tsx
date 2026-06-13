import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../api/client';

interface ProfileData {
  id: number;
  name: string;
  email: string;
  level: string;
  total_sessions: number;
  avg_overall: number;
}

export default function ProfileScreen() {
  const { logout } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get<ProfileData>('/api/profile/me')
      .then((data) => {
        setProfile(data);
        setName(data.name);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleUpdate = () => {
    apiClient.put('/api/profile/me', { name })
      .then(() => Alert.alert('Success', 'Profile updated successfully!'));
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {profile && (
        <View style={styles.card}>
          <Text style={styles.title}>Your Profile</Text>

          <Text style={styles.label}>Email</Text>
          <Text style={styles.email}>{profile.email}</Text>

          <Text style={styles.label}>Name</Text>
          <TextInput style={styles.input} value={name} onChangeText={setName} />

          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statVal}>{profile.level}</Text>
              <Text style={styles.statLbl}>Level</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statVal}>{profile.avg_overall}</Text>
              <Text style={styles.statLbl}>Avg Score</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.saveBtn} onPress={handleUpdate}>
            <Text style={styles.btnText}>Save Changes</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.saveBtn, styles.logoutBtn]} onPress={logout}>
            <Text style={styles.btnText}>Logout</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6', padding: 20, justifyContent: 'center' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: { backgroundColor: '#FFF', borderRadius: 16, padding: 24, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 },
  title: { fontSize: 20, fontWeight: '700', color: '#111827', marginBottom: 20 },
  label: { fontSize: 12, fontWeight: '600', color: '#374151', marginBottom: 6 },
  email: { fontSize: 15, color: '#6B7280', marginBottom: 16 },
  input: { borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, padding: 10, fontSize: 15, marginBottom: 20, backgroundColor: '#FFF' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', marginVertical: 10, paddingVertical: 14, borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#F3F4F6' },
  stat: { alignItems: 'center' },
  statVal: { fontSize: 16, fontWeight: '700', color: '#4B5563' },
  statLbl: { fontSize: 11, color: '#9CA3AF', marginTop: 2 },
  saveBtn: { backgroundColor: '#6366F1', paddingVertical: 12, borderRadius: 8, alignItems: 'center', marginTop: 16 },
  logoutBtn: { backgroundColor: '#EF4444' },
  btnText: { color: '#FFF', fontWeight: '600', fontSize: 15 },
});

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface StatCardProps {
  label: string;
  value: string | number;
  color?: string;
  icon?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, color = '#6366F1', icon }) => (
  <View style={styles.card}>
    {icon && <Text style={[styles.icon, { color }]}>{icon}</Text>}
    <Text style={[styles.value, { color }]}>{value}</Text>
    <Text style={styles.label}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    flex: 1,
    alignItems: 'center',
    margin: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  icon: { fontSize: 22, marginBottom: 6 },
  value: { fontSize: 24, fontWeight: '700' },
  label: { fontSize: 11, color: '#9CA3AF', marginTop: 4, textAlign: 'center' },
});

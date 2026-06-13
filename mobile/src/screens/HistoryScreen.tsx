import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { sessionApi, SessionData } from '../api/sessions';
import { formatDistanceToNow } from 'date-fns';

export default function HistoryScreen() {
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    sessionApi.list()
      .then(setSessions)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={sessions}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No completed sessions yet. Start speaking!</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.item}>
            <View style={styles.headerRow}>
              <Text style={styles.date}>
                {formatDistanceToNow(new Date(item.started_at), { addSuffix: true })}
              </Text>
              <Text style={styles.turns}>{item.turn_count} turns</Text>
            </View>
            <View style={styles.scoresRow}>
              <Text style={styles.score}>Grammar: {item.grammar_score ?? 0}</Text>
              <Text style={styles.score}>Fluency: {item.fluency_score ?? 0}</Text>
              <Text style={styles.score}>Overall: {item.overall_score ?? 0}</Text>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6', padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  item: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  date: { fontSize: 13, color: '#6B7280' },
  turns: { fontSize: 13, fontWeight: '600', color: '#6366F1' },
  scoresRow: { flexDirection: 'row', justifyContent: 'space-between' },
  score: { fontSize: 14, color: '#374151', fontWeight: '500' },
  empty: { flex: 1, alignItems: 'center', padding: 40 },
  emptyText: { color: '#9CA3AF' },
});

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { fetchProgressSummary, fetchScoreHistory } from '../api/progress';

export default function ProgressScreen() {
  const [summary, setSummary] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    fetchProgressSummary().then(setSummary);
    fetchScoreHistory().then(setHistory);
  }, []);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Your Progress</Text>
      {summary && (
        <View style={styles.stats}>
          <Text style={styles.statVal}>{summary.streak_days} Days</Text>
          <Text style={styles.statLbl}>Current Streak</Text>
          <Text style={styles.statVal}>{summary.total_minutes} Mins</Text>
          <Text style={styles.statLbl}>Practice Time</Text>
          <Text style={styles.statVal}>{summary.avg_overall}</Text>
          <Text style={styles.statLbl}>Average Score</Text>
        </View>
      )}
      <Text style={styles.subtitle}>Recent Scores</Text>
      {history.map((h, idx) => (
        <View key={idx} style={styles.scoreRow}>
          <Text style={styles.date}>{h.date}</Text>
          <Text style={styles.score}>Overall: {h.overall}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6', padding: 24 },
  title: { fontSize: 24, fontWeight: '700', color: '#111827', marginBottom: 20 },
  stats: { backgroundColor: '#FFF', borderRadius: 12, padding: 20, marginBottom: 24 },
  statVal: { fontSize: 22, fontWeight: '800', color: '#4F46E5', marginTop: 10 },
  statLbl: { fontSize: 13, color: '#6B7280' },
  subtitle: { fontSize: 18, fontWeight: '600', color: '#111827', marginBottom: 12 },
  scoreRow: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#FFF', padding: 16, borderRadius: 8, marginBottom: 8 },
  date: { fontSize: 14, color: '#4B5563' },
  score: { fontSize: 14, fontWeight: '600', color: '#10B981' }
});

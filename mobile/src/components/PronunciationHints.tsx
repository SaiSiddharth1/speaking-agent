import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Hint {
  word: string;
  phonetic: string;
  tip: string;
}

export const PronunciationHints: React.FC<{ hints: Hint[] }> = ({ hints }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pronunciation Coach</Text>
      {hints.map((h, idx) => (
        <View key={idx} style={styles.hintRow}>
          <Text style={styles.word}>{h.word}</Text>
          <Text style={styles.phonetic}>[{h.phonetic}]</Text>
          <Text style={styles.tip}>{h.tip}</Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { backgroundColor: '#F8FAFC', borderRadius: 12, padding: 16, marginVertical: 12 },
  title: { fontSize: 16, fontWeight: '700', color: '#0F172A', marginBottom: 12 },
  hintRow: { marginBottom: 10 },
  word: { fontSize: 15, fontWeight: '600', color: '#4F46E5' },
  phonetic: { fontSize: 13, fontStyle: 'italic', color: '#64748B', marginVertical: 2 },
  tip: { fontSize: 13, color: '#334155' }
});

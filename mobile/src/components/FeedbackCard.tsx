import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface FeedbackProps {
  score: {
    grammar_score: number;
    fluency_score: number;
    overall_score: number;
    feedback_tips: string[];
  };
}

export const FeedbackCard: React.FC<FeedbackProps> = ({ score }) => {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Session Performance</Text>
      <View style={styles.row}>
        <View style={styles.scoreBox}>
          <Text style={styles.scoreVal}>{score.overall_score}</Text>
          <Text style={styles.scoreLbl}>Overall</Text>
        </View>
        <View style={styles.scoreBox}>
          <Text style={styles.scoreVal}>{score.grammar_score}</Text>
          <Text style={styles.scoreLbl}>Grammar</Text>
        </View>
        <View style={styles.scoreBox}>
          <Text style={styles.scoreVal}>{score.fluency_score}</Text>
          <Text style={styles.scoreLbl}>Fluency</Text>
        </View>
      </View>
      <Text style={styles.tipsTitle}>AI Advice</Text>
      {score.feedback_tips.map((tip, idx) => (
        <Text key={idx} style={styles.tipText}>
          • {tip}
        </Text>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 20, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2, marginVertical: 10 },
  title: { fontSize: 18, fontWeight: '700', color: '#1e293b', marginBottom: 15 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  scoreBox: { alignItems: 'center', flex: 1 },
  scoreVal: { fontSize: 24, fontWeight: '800', color: '#6366f1' },
  scoreLbl: { fontSize: 12, color: '#64748b', marginTop: 4 },
  tipsTitle: { fontSize: 15, fontWeight: '600', color: '#334155', marginBottom: 8 },
  tipText: { fontSize: 14, color: '#475569', lineHeight: 20, marginBottom: 4 }
});

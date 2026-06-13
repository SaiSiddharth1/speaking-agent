import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ScoreGauge } from './ScoreGauge';

interface ScoreData {
  grammar_score: number;
  fluency_score: number;
  overall_score: number;
  feedback_tips?: string[];
  feedback?: string[]; // Support both aliases
}

interface ScoreCardProps {
  data: ScoreData;
}

export const ScoreCard: React.FC<ScoreCardProps> = ({ data }) => {
  const tips = data.feedback_tips ?? data.feedback ?? [];
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Your Score</Text>

      <View style={styles.gaugesRow}>
        <ScoreGauge score={data.grammar_score} label="Grammar" color="#6366F1" />
        <ScoreGauge score={data.fluency_score} label="Fluency" color="#10B981" />
        <ScoreGauge score={data.overall_score} label="Overall" color="#F59E0B" />
      </View>

      <View style={styles.feedbackSection}>
        <Text style={styles.feedbackTitle}>Tips to Improve</Text>
        {tips.length > 0 ? (
          tips.map((tip, i) => (
            <View key={i} style={styles.tipRow}>
              <Text style={styles.tipBullet}>•</Text>
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.tipText}>No feedback tips generated for this turn. Great job!</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 20,
  },
  gaugesRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
  },
  feedbackSection: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 14,
  },
  feedbackTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 10,
  },
  tipRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  tipBullet: {
    color: '#6366F1',
    fontSize: 14,
    marginRight: 8,
    lineHeight: 20,
  },
  tipText: {
    fontSize: 13,
    color: '#6B7280',
    flex: 1,
    lineHeight: 20,
  },
});

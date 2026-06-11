import React, { useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Animated, ScrollView,
} from 'react-native';

interface ScoreResult {
  grammar_score: number;
  fluency_score: number;
  overall_score: number;
  feedback_tips: string[];
}

interface Props {
  score: ScoreResult;
  onDismiss: () => void;
}

function ScoreBar({ label, value, color }: { label: string; value: number; color: string }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: value / 10,
      duration: 600,
      useNativeDriver: false,
    }).start();
  }, [value]);

  return (
    <View style={styles.barRow}>
      <Text style={styles.barLabel}>{label}</Text>
      <View style={styles.barTrack}>
        <Animated.View
          style={[
            styles.barFill,
            { backgroundColor: color, width: anim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) },
          ]}
        />
      </View>
      <Text style={[styles.barValue, { color }]}>{value.toFixed(1)}</Text>
    </View>
  );
}

export default function FeedbackCard({ score, onDismiss }: Props) {
  const slideAnim = useRef(new Animated.Value(200)).current;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: 0,
      tension: 80,
      friction: 12,
      useNativeDriver: true,
    }).start();
  }, []);

  const overallColor =
    score.overall_score >= 7 ? '#10B981' :
    score.overall_score >= 5 ? '#F59E0B' : '#EF4444';

  return (
    <Animated.View style={[styles.card, { transform: [{ translateY: slideAnim }] }]}>
      <View style={styles.header}>
        <Text style={styles.cardTitle}>Your score</Text>
        <View style={[styles.overallBadge, { backgroundColor: overallColor + '20' }]}>
          <Text style={[styles.overallText, { color: overallColor }]}>
            {score.overall_score.toFixed(1)} / 10
          </Text>
        </View>
        <TouchableOpacity onPress={onDismiss} style={styles.closeBtn}>
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>
      </View>

      <ScoreBar label="Grammar" value={score.grammar_score} color="#6C63FF" />
      <ScoreBar label="Fluency" value={score.fluency_score} color="#3B82F6" />
      <ScoreBar label="Overall" value={score.overall_score} color={overallColor} />

      {score.feedback_tips.length > 0 && (
        <View style={styles.tipsSection}>
          <Text style={styles.tipsTitle}>Tips to improve</Text>
          {score.feedback_tips.map((tip, i) => (
            <View key={i} style={styles.tipRow}>
              <Text style={styles.tipBullet}>•</Text>
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          ))}
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 10,
    zIndex: 100,
  },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  cardTitle: { fontSize: 17, fontWeight: '700', color: '#111827', flex: 1 },
  overallBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginRight: 12 },
  overallText: { fontSize: 14, fontWeight: '700' },
  closeBtn: { padding: 4 },
  closeText: { fontSize: 16, color: '#9CA3AF' },
  barRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  barLabel: { width: 64, fontSize: 13, color: '#6B7280', fontWeight: '500' },
  barTrack: {
    flex: 1, height: 8, backgroundColor: '#F3F4F6',
    borderRadius: 4, overflow: 'hidden', marginHorizontal: 10,
  },
  barFill: { height: '100%', borderRadius: 4 },
  barValue: { width: 28, fontSize: 13, fontWeight: '700', textAlign: 'right' },
  tipsSection: { marginTop: 14, paddingTop: 14, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  tipsTitle: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 8 },
  tipRow: { flexDirection: 'row', gap: 8, marginBottom: 6 },
  tipBullet: { fontSize: 14, color: '#6C63FF', marginTop: 1 },
  tipText: { flex: 1, fontSize: 13, color: '#4B5563', lineHeight: 19 },
});

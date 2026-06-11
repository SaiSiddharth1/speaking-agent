import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, SafeAreaView,
  TouchableOpacity, ActivityIndicator, Dimensions,
} from 'react-native';
import { getSessions, getProgress } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const { width } = Dimensions.get('window');

interface ProgressData {
  avg_overall_7d: number;
  avg_grammar_7d: number;
  avg_fluency_7d: number;
  total_sessions: number;
  streak_days: number;
  scores_over_time: { date: string; overall: number }[];
}

function MiniChart({ data }: { data: { date: string; overall: number }[] }) {
  if (data.length < 2) {
    return (
      <View style={chartStyles.empty}>
        <Text style={chartStyles.emptyText}>Keep practicing to see your trend!</Text>
      </View>
    );
  }

  const chartWidth = width - 64;
  const chartHeight = 80;
  const max = 10;
  const points = data.map((d, i) => ({
    x: (i / (data.length - 1)) * chartWidth,
    y: chartHeight - (d.overall / max) * chartHeight,
  }));

  return (
    <View style={chartStyles.container}>
      <Text style={chartStyles.label}>Overall score — last 30 days</Text>
      {/* Simple SVG-like chart using Views */}
      <View style={{ height: chartHeight, position: 'relative' }}>
        {[0, 5, 10].map((v) => (
          <View
            key={v}
            style={[chartStyles.gridLine, { bottom: (v / 10) * chartHeight }]}
          >
            <Text style={chartStyles.gridLabel}>{v}</Text>
          </View>
        ))}
        {points.map((p, i) => (
          <View
            key={i}
            style={[
              chartStyles.dot,
              { left: p.x - 4, top: p.y - 4 },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const chartStyles = StyleSheet.create({
  container: { marginTop: 8 },
  label: { fontSize: 12, color: '#9CA3AF', marginBottom: 8 },
  gridLine: {
    position: 'absolute', left: 0, right: 0,
    borderTopWidth: 1, borderTopColor: '#F3F4F6', flexDirection: 'row',
  },
  gridLabel: { fontSize: 10, color: '#D1D5DB', marginTop: -8 },
  dot: {
    position: 'absolute', width: 8, height: 8,
    borderRadius: 4, backgroundColor: '#6C63FF',
  },
  empty: { alignItems: 'center', padding: 20 },
  emptyText: { fontSize: 13, color: '#9CA3AF' },
});

function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={[dashStyles.statCard, { borderLeftColor: color }]}>
      <Text style={dashStyles.statValue}>{value}</Text>
      <Text style={dashStyles.statLabel}>{label}</Text>
    </View>
  );
}

export default function DashboardScreen() {
  const { logout } = useAuth();
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getProgress(), getSessions()])
      .then(([prog, sess]) => {
        setProgress(prog);
        setSessions(sess);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={dashStyles.safe}>
        <ActivityIndicator size="large" color="#6C63FF" style={{ marginTop: 80 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={dashStyles.safe}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={dashStyles.header}>
          <View>
            <Text style={dashStyles.title}>Your progress</Text>
            <Text style={dashStyles.subtitle}>Keep up the great work!</Text>
          </View>
          <TouchableOpacity onPress={logout} style={dashStyles.logoutBtn}>
            <Text style={dashStyles.logoutText}>Sign out</Text>
          </TouchableOpacity>
        </View>

        {/* Streak + Total */}
        <View style={dashStyles.statsRow}>
          <StatCard
            label="Day streak"
            value={`🔥 ${progress?.streak_days ?? 0}`}
            color="#F59E0B"
          />
          <StatCard
            label="Total sessions"
            value={`${progress?.total_sessions ?? 0}`}
            color="#6C63FF"
          />
        </View>

        {/* This week scores */}
        <View style={dashStyles.section}>
          <Text style={dashStyles.sectionTitle}>This week (avg)</Text>
          <View style={dashStyles.scoreRow}>
            {[
              { label: 'Overall', value: progress?.avg_overall_7d ?? 0, color: '#10B981' },
              { label: 'Grammar', value: progress?.avg_grammar_7d ?? 0, color: '#6C63FF' },
              { label: 'Fluency', value: progress?.avg_fluency_7d ?? 0, color: '#3B82F6' },
            ].map(({ label, value, color }) => (
              <View key={label} style={dashStyles.scoreItem}>
                <Text style={[dashStyles.scoreNum, { color }]}>{value.toFixed(1)}</Text>
                <Text style={dashStyles.scoreLabel}>{label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Chart */}
        <View style={dashStyles.section}>
          <MiniChart data={progress?.scores_over_time ?? []} />
        </View>

        {/* Recent sessions */}
        <View style={dashStyles.section}>
          <Text style={dashStyles.sectionTitle}>Recent sessions</Text>
          {sessions.length === 0 ? (
            <Text style={dashStyles.emptyText}>No sessions yet. Start speaking!</Text>
          ) : (
            sessions.slice(0, 10).map((s) => (
              <View key={s.id} style={dashStyles.sessionRow}>
                <View>
                  <Text style={dashStyles.sessionDate}>
                    {new Date(s.created_at).toLocaleDateString('en-US', {
                      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                    })}
                  </Text>
                  <Text style={dashStyles.sessionMsgs}>
                    {s.messages?.length ?? 0} messages
                  </Text>
                </View>
                <View style={dashStyles.sessionScores}>
                  <Text style={[dashStyles.sessionScore, { color: '#10B981' }]}>
                    {s.overall_score?.toFixed(1)}
                  </Text>
                  <Text style={dashStyles.sessionScoreLabel}>/ 10</Text>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const dashStyles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F9FAFB' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-start', paddingHorizontal: 24, paddingTop: 16, paddingBottom: 8,
  },
  title: { fontSize: 24, fontWeight: '700', color: '#111827' },
  subtitle: { fontSize: 14, color: '#6B7280', marginTop: 2 },
  logoutBtn: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8, backgroundColor: '#FEF2F2' },
  logoutText: { fontSize: 13, color: '#EF4444', fontWeight: '500' },
  statsRow: { flexDirection: 'row', gap: 12, paddingHorizontal: 16, marginTop: 12 },
  statCard: {
    flex: 1, backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16,
    borderLeftWidth: 3, shadowColor: '#000', shadowOpacity: 0.05,
    shadowRadius: 6, elevation: 2,
  },
  statValue: { fontSize: 22, fontWeight: '700', color: '#111827' },
  statLabel: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  section: {
    backgroundColor: '#FFFFFF', borderRadius: 16, margin: 16, marginTop: 0,
    marginBottom: 12, padding: 16, shadowColor: '#000', shadowOpacity: 0.04,
    shadowRadius: 8, elevation: 2,
  },
  sectionTitle: { fontSize: 15, fontWeight: '600', color: '#111827', marginBottom: 12 },
  scoreRow: { flexDirection: 'row', justifyContent: 'space-around' },
  scoreItem: { alignItems: 'center', gap: 4 },
  scoreNum: { fontSize: 28, fontWeight: '700' },
  scoreLabel: { fontSize: 12, color: '#6B7280' },
  emptyText: { fontSize: 14, color: '#9CA3AF', textAlign: 'center', paddingVertical: 12 },
  sessionRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F9FAFB',
  },
  sessionDate: { fontSize: 14, color: '#374151', fontWeight: '500' },
  sessionMsgs: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
  sessionScores: { flexDirection: 'row', alignItems: 'baseline', gap: 2 },
  sessionScore: { fontSize: 20, fontWeight: '700' },
  sessionScoreLabel: { fontSize: 12, color: '#9CA3AF' },
});

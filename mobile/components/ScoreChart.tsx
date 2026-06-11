import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

interface ScoreDataPoint {
  date: string;
  overall: number;
  grammar?: number;
  fluency?: number;
}

interface Props {
  data: ScoreDataPoint[];
  title?: string;
}

export default function ScoreChart({ data, title = 'Overall score — last 30 days' }: Props) {
  if (data.length < 2) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>Keep practicing to see your trend!</Text>
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
    <View style={styles.container}>
      <Text style={styles.label}>{title}</Text>
      <View style={{ height: chartHeight, position: 'relative' }}>
        {[0, 5, 10].map((v) => (
          <View
            key={v}
            style={[styles.gridLine, { bottom: (v / 10) * chartHeight }]}
          >
            <Text style={styles.gridLabel}>{v}</Text>
          </View>
        ))}
        {points.map((p, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              { left: p.x - 4, top: p.y - 4 },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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

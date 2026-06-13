import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

interface ScoreGaugeProps {
  score: number; // 0-100
  label: string;
  color: string;
}

export const ScoreGauge: React.FC<ScoreGaugeProps> = ({ score, label, color }) => {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDash = (score / 100) * circumference;

  return (
    <View style={styles.container}>
      <Svg width={90} height={90} viewBox="0 0 90 90">
        {/* Background circle */}
        <Circle cx="45" cy="45" r={radius} stroke="#E5E7EB" strokeWidth="8" fill="none" />
        {/* Progress circle */}
        <Circle
          cx="45"
          cy="45"
          r={radius}
          stroke={color}
          strokeWidth="8"
          fill="none"
          strokeDasharray={`${strokeDash} ${circumference}`}
          strokeLinecap="round"
          rotation="-90"
          origin="45, 45"
        />
      </Svg>
      <View style={styles.labelContainer}>
        <Text style={[styles.scoreText, { color }]}>{score}</Text>
        <Text style={styles.labelText}>{label}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    position: 'relative',
  },
  labelContainer: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreText: {
    fontSize: 18,
    fontWeight: '700',
  },
  labelText: {
    fontSize: 10,
    color: '#6B7280',
    marginTop: 2,
  },
});

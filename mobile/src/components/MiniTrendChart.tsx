import React from 'react';
import { View, Dimensions, StyleSheet } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

interface MiniTrendChartProps {
  trend: { date: string; overall: number }[];
}

export const MiniTrendChart: React.FC<MiniTrendChartProps> = ({ trend }) => {
  if (trend.length < 2) return null;

  const data = trend.map((t) => t.overall);
  const labels = trend.map((_, i) => `#${i + 1}`);

  return (
    <View style={styles.container}>
      <LineChart
        data={{
          labels,
          datasets: [{ data }],
        }}
        width={Dimensions.get('window').width - 40}
        height={160}
        yAxisInterval={1}
        chartConfig={{
          backgroundColor: '#FFFFFF',
          backgroundGradientFrom: '#FFFFFF',
          backgroundGradientTo: '#FFFFFF',
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
          style: { borderRadius: 16 },
          propsForDots: {
            r: '4',
            strokeWidth: '2',
            stroke: '#4F46E5',
          },
        }}
        bezier
        style={styles.chart}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
    alignItems: 'center',
  },
  chart: {
    borderRadius: 16,
  },
});

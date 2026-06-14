import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Linking,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

export default function AboutScreen() {
  const { theme } = useTheme();

  const handleGitHubPress = () => {
    Linking.openURL('https://github.com/SaiSiddharth1/speaking-agent');
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
        {/* Header Title */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>About Our Work</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Speaking Agent — Your AI English Coach
          </Text>
        </View>

        {/* Feature Cards / Tech Pipeline */}
        <View style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
          <View style={styles.cardHeader}>
            <Ionicons name="git-network-outline" size={24} color={theme.primary} />
            <Text style={[styles.cardTitle, { color: theme.text }]}>Our Voice Pipeline</Text>
          </View>
          <Text style={[styles.cardText, { color: theme.textSecondary }]}>
            Our speech coach operates on a state-of-the-art multi-stage AI pipeline:
          </Text>

          <View style={styles.steps}>
            <View style={styles.stepRow}>
              <View style={[styles.stepDot, { backgroundColor: theme.primary }]} />
              <Text style={[styles.stepText, { color: theme.text }]}>
                <Text style={{ fontWeight: '700' }}>1. Whisper STT: </Text>
                Transcribes your spoken audio into clean text.
              </Text>
            </View>

            <View style={styles.stepRow}>
              <View style={[styles.stepDot, { backgroundColor: theme.primary }]} />
              <Text style={[styles.stepText, { color: theme.text }]}>
                <Text style={{ fontWeight: '700' }}>2. LLaMA LLM Coach: </Text>
                Evaluates grammar, fluency, vocabulary, and generates natural human-like responses.
              </Text>
            </View>

            <View style={styles.stepRow}>
              <View style={[styles.stepDot, { backgroundColor: theme.primary }]} />
              <Text style={[styles.stepText, { color: theme.text }]}>
                <Text style={{ fontWeight: '700' }}>3. Kokoro TTS: </Text>
                Converts the coach's replies into spoken voice.
              </Text>
            </View>

            <View style={styles.stepRow}>
              <View style={[styles.stepDot, { backgroundColor: theme.primary }]} />
              <Text style={[styles.stepText, { color: theme.text }]}>
                <Text style={{ fontWeight: '700' }}>4. Instant Feedback: </Text>
                Calculates metrics and gives correction tips immediately.
              </Text>
            </View>
          </View>
        </View>

        {/* Core Features */}
        <View style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
          <View style={styles.cardHeader}>
            <Ionicons name="sparkles-outline" size={24} color={theme.primary} />
            <Text style={[styles.cardTitle, { color: theme.text }]}>Key Features</Text>
          </View>

          <View style={styles.featureGrid}>
            <View style={styles.featureItem}>
              <Ionicons name="mic-circle-outline" size={32} color={theme.primary} />
              <Text style={[styles.featureLabel, { color: theme.text }]}>Voice Loops</Text>
              <Text style={[styles.featureDesc, { color: theme.textSecondary }]}>
                Natural human-like speaking turns with AI.
              </Text>
            </View>

            <View style={styles.featureItem}>
              <Ionicons name="play-circle-outline" size={32} color={theme.primary} />
              <Text style={[styles.featureLabel, { color: theme.text }]}>Playback</Text>
              <Text style={[styles.featureDesc, { color: theme.textSecondary }]}>
                Play back your own recordings to refine accent.
              </Text>
            </View>

            <View style={styles.featureItem}>
              <Ionicons name="analytics-outline" size={32} color={theme.primary} />
              <Text style={[styles.featureLabel, { color: theme.text }]}>Metrics</Text>
              <Text style={[styles.featureDesc, { color: theme.textSecondary }]}>
                Grammar & fluency charts over time.
              </Text>
            </View>

            <View style={styles.featureItem}>
              <Ionicons name="color-palette-outline" size={32} color={theme.primary} />
              <Text style={[styles.featureLabel, { color: theme.text }]}>Themes</Text>
              <Text style={[styles.featureDesc, { color: theme.textSecondary }]}>
                Dynamic Dark & Light premium theme toggle.
              </Text>
            </View>
          </View>
        </View>

        {/* About Us / Mission */}
        <View style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
          <View style={styles.cardHeader}>
            <Ionicons name="people-outline" size={24} color={theme.primary} />
            <Text style={[styles.cardTitle, { color: theme.text }]}>About Us</Text>
          </View>
          <Text style={[styles.cardText, { color: theme.textSecondary, lineHeight: 22 }]}>
            Speaking Agent was built with a simple goal: to make English language coaching accessible, interactive, and personalized. We leverage cutting-edge generative AI to offer instant, judgment-free practice spaces for learners worldwide.
          </Text>

          <TouchableOpacity style={[styles.gitBtn, { backgroundColor: theme.primary }]} onPress={handleGitHubPress}>
            <Ionicons name="logo-github" size={20} color="#FFF" />
            <Text style={styles.gitBtnText}>Visit GitHub Repository</Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.footerText, { color: theme.textSecondary }]}>
          Speaking Agent v1.0.0
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { padding: 20, paddingBottom: 40 },
  header: { marginBottom: 24 },
  title: { fontSize: 28, fontWeight: '800', tracking: -0.5 },
  subtitle: { fontSize: 14, marginTop: 4, fontWeight: '500' },
  card: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  cardTitle: { fontSize: 18, fontWeight: '700' },
  cardText: { fontSize: 14, marginBottom: 12 },
  steps: { gap: 14, marginTop: 8 },
  stepRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  stepDot: { width: 6, height: 6, borderRadius: 3, marginTop: 8 },
  stepText: { fontSize: 13, flex: 1, lineHeight: 18 },
  featureGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginTop: 12 },
  featureItem: { width: '47%', gap: 4, marginBottom: 8 },
  featureLabel: { fontSize: 14, fontWeight: '600', marginTop: 4 },
  featureDesc: { fontSize: 12, lineHeight: 16 },
  gitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 12,
    gap: 8,
    marginTop: 16,
  },
  gitBtnText: { color: '#FFF', fontSize: 14, fontWeight: '600' },
  footerText: { textAlign: 'center', fontSize: 11, marginTop: 12 },
});

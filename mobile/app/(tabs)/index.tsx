import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import RecordButton from '../../components/RecordButton';
import FeedbackCard from '../../components/FeedbackCard';
import { sendAudioToBackend } from '../../services/api';
import { playBase64Audio, playLocalAudio } from '../../utils/audio';
import { TouchableOpacity } from 'react-native';

interface Message {
  id: string;
  role: 'user' | 'coach';
  text: string;
  audioUri?: string;
}

interface ScoreResult {
  grammar_score: number;
  fluency_score: number;
  overall_score: number;
  feedback_tips: string[];
}

import { useTheme } from '../../context/ThemeContext';

export default function VoiceScreen() {
  const { theme } = useTheme();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [score, setScore] = useState<ScoreResult | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const handleRecordingComplete = async (uri: string) => {
    setLoading(true);
    setShowFeedback(false);

    try {
      const history = messages.map((m) => ({
        role: m.role === 'coach' ? 'assistant' : 'user',
        content: m.text,
      }));

      const result = await sendAudioToBackend(uri, history);

      const userMsg: Message = {
        id: Date.now().toString(),
        role: 'user',
        text: result.user_text,
        audioUri: uri,
      };
      const coachMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'coach',
        text: result.coach_text,
      };

      setMessages((prev) => [...prev, userMsg, coachMsg]);
      setScore(result.score);
      setShowFeedback(true);

      if (result.audio_base64) {
        await playBase64Audio(result.audio_base64);
      }

      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    } catch (err) {
      console.error('Pipeline error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <Text style={[styles.title, { color: theme.text }]}>Speaking Agent</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Your AI English Coach</Text>
      </View>

      <ScrollView
        ref={scrollRef}
        style={styles.chat}
        contentContainerStyle={styles.chatContent}
        showsVerticalScrollIndicator={false}
      >
        {messages.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, { color: theme.text }]}>Tap the button and start speaking.</Text>
            <Text style={[styles.emptyHint, { color: theme.textSecondary }]}>Your coach will respond and score you.</Text>
          </View>
        )}

        {messages.map((msg) => (
          <View
            key={msg.id}
            style={[
              styles.bubble,
              msg.role === 'user'
                ? [styles.bubbleUser, { backgroundColor: theme.primary }]
                : [styles.bubbleCoach, { backgroundColor: theme.cardBackground, borderColor: theme.border, borderWidth: 1 }],
            ]}
          >
            <View style={styles.messageRow}>
              <Text style={[
                styles.bubbleText,
                msg.role === 'user' ? styles.bubbleTextUser : [styles.bubbleTextCoach, { color: theme.text }],
                msg.audioUri ? { marginRight: 8 } : null,
              ]}>
                {msg.text}
              </Text>
              {msg.role === 'user' && msg.audioUri && (
                <TouchableOpacity
                  style={styles.playButton}
                  onPress={() => playLocalAudio(msg.audioUri!)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.playIcon}>▶️</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))}
      </ScrollView>

      {showFeedback && score && (
        <FeedbackCard score={score} onDismiss={() => setShowFeedback(false)} />
      )}

      <View style={[styles.controls, { backgroundColor: theme.cardBackground, borderTopColor: theme.border }]}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.primary} />
            <Text style={[styles.loadingText, { color: theme.textSecondary }]}>Coach is thinking...</Text>
          </View>
        ) : (
          <RecordButton onRecordingComplete={handleRecordingComplete} disabled={loading} />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 12 },
  title: { fontSize: 24, fontWeight: '700', color: '#111827' },
  subtitle: { fontSize: 14, color: '#6B7280', marginTop: 2 },
  chat: { flex: 1, paddingHorizontal: 16 },
  chatContent: { paddingVertical: 12, gap: 10 },
  emptyState: { flex: 1, alignItems: 'center', paddingTop: 60, gap: 8 },
  emptyText: { fontSize: 16, color: '#374151', fontWeight: '500' },
  emptyHint: { fontSize: 13, color: '#9CA3AF' },
  bubble: {
    maxWidth: '80%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
  },
  bubbleUser: {
    alignSelf: 'flex-end',
    backgroundColor: '#6C63FF',
    borderBottomRightRadius: 4,
  },
  bubbleCoach: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  bubbleText: { fontSize: 15, lineHeight: 22 },
  bubbleTextUser: { color: '#FFFFFF' },
  bubbleTextCoach: { color: '#111827' },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  playButton: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  playIcon: {
    fontSize: 12,
    lineHeight: 14,
    color: '#FFFFFF',
  },
  controls: {
    paddingVertical: 24,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: { alignItems: 'center', gap: 12 },
  loadingText: { fontSize: 14, color: '#6B7280' },
});

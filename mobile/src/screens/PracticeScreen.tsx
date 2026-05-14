import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import { RecordButton } from '../components/RecordButton';
import { AudioPlayer } from '../components/AudioPlayer';
import { transcribeAudio } from '../services/speechApi';
import { useConversation } from '../hooks/useConversation';

export const PracticeScreen = () => {
  const {
    isRecording,
    recordingUri,
    elapsedSeconds,
    startRecording,
    stopRecording,
  } = useAudioRecorder();
  
  const [sttLoading, setSttLoading] = useState(false);
  const {
    history,
    isLoading: isChatLoading,
    handleSendMessage,
  } = useConversation();

  const formatTime = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const handleToggle = async () => {
    if (isRecording) {
      const uri = await stopRecording();
      if (uri) {
        handleTranscribe(uri);
      }
    } else {
      startRecording();
    }
  };

  const handleTranscribe = async (uri: string) => {
    setSttLoading(true);
    try {
      const text = await transcribeAudio(uri);
      if (text && text.trim()) {
        // Dispatch the transcribed text directly to the Groq LLM conversation engine
        await handleSendMessage(text);
      }
    } catch (error) {
      console.error('Transcription error:', error);
    } finally {
      setSttLoading(false);
    }
  };

  const isAnyLoading = sttLoading || isChatLoading;
  const loadingStatusText = sttLoading
    ? 'Listening & Transcribing...'
    : 'Coach Alex is thinking...';

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Speaking Agent</Text>
        <Text style={styles.headerSubtitle}>AI English Coach Alex</Text>
      </View>

      {/* Chat Conversation History Area */}
      <ScrollView
        style={styles.chatContainer}
        contentContainerStyle={styles.chatContent}
      >
        {history.length === 0 && !isAnyLoading && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateEmoji}>💬</Text>
            <Text style={styles.emptyStateTitle}>Start Speaking!</Text>
            <Text style={styles.emptyStateDesc}>
              Tap the microphone below to introduce yourself or practice speaking in English. Coach Alex will respond with advice and tips.
            </Text>
          </View>
        )}

        {history.map((msg, index) => {
          const isUser = msg.role === 'user';
          return (
            <View
              key={index}
              style={[
                styles.bubbleContainer,
                isUser ? styles.userBubble : styles.coachBubble,
              ]}
            >
              <Text style={styles.senderLabel}>
                {isUser ? 'You' : 'Coach Alex'}
              </Text>
              <Text
                style={[
                  styles.bubbleText,
                  isUser ? styles.userBubbleText : styles.coachBubbleText,
                ]}
              >
                {msg.content}
              </Text>
            </View>
          );
        })}

        {isAnyLoading && (
          <View style={styles.loadingBubble}>
            <ActivityIndicator size="small" color="#6366F1" />
            <Text style={styles.loadingBubbleText}>{loadingStatusText}</Text>
          </View>
        )}
      </ScrollView>

      {/* Bottom Controls Area */}
      <View style={styles.controlsContainer}>
        <Text style={styles.timer}>{formatTime(elapsedSeconds)}</Text>
        <RecordButton isRecording={isRecording} onPress={handleToggle} />
        <AudioPlayer uri={recordingUri} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1E293B',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '500',
  },
  chatContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  chatContent: {
    paddingVertical: 16,
    gap: 12,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
    paddingHorizontal: 24,
  },
  emptyStateEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 8,
  },
  emptyStateDesc: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
  },
  bubbleContainer: {
    maxWidth: '85%',
    padding: 14,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#6366F1',
    borderBottomRightRadius: 4,
  },
  coachBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderBottomLeftRadius: 4,
  },
  senderLabel: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 4,
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  bubbleText: {
    fontSize: 15,
    lineHeight: 22,
  },
  userBubbleText: {
    color: '#FFFFFF',
  },
  coachBubbleText: {
    color: '#1E293B',
  },
  loadingBubble: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 16,
    gap: 8,
    marginTop: 4,
  },
  loadingBubbleText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  controlsContainer: {
    paddingVertical: 20,
    paddingHorizontal: 24,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    gap: 16,
  },
  timer: {
    fontSize: 40,
    fontWeight: '200',
    color: '#0F172A',
    letterSpacing: 2,
    fontVariant: ['tabular-nums'],
  },
});

export default PracticeScreen;

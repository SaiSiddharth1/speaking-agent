/**
 * conversation.tsx — Day 30: Full Voice Loop Screen
 *
 * The main conversation screen that implements the complete
 * Record → Transcribe → Coach → Speak cycle.
 *
 * Flow:
 * 1. User taps mic button to start recording
 * 2. User taps again to stop → audio file URI captured
 * 3. Audio + history sent to POST /api/conversation/respond
 * 4. Backend returns reply_text + audio_base64 + updated_history
 * 5. Coach text displayed in chat bubbles
 * 6. Base64 audio decoded → written to temp file → played back
 * 7. Conversation history maintained across turns
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  ScrollView,
  Animated,
  Dimensions,
} from 'react-native';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system/legacy';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import { RecordButton } from '../components/RecordButton';
import {
  sendAudioMessage,
  Message,
  ConversationResponse,
} from '../services/conversationService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ── Status states for the pipeline ──
type PipelineStatus = 'idle' | 'recording' | 'thinking' | 'speaking' | 'error';

const STATUS_CONFIG: Record<PipelineStatus, { icon: string; label: string; subtitle: string; color: string }> = {
  idle: {
    icon: '🎤',
    label: 'Ready to Speak',
    subtitle: 'Tap the microphone to start your conversation',
    color: '#6366F1',
  },
  recording: {
    icon: '🔴',
    label: 'Listening...',
    subtitle: 'Tap the button to stop recording',
    color: '#EF4444',
  },
  thinking: {
    icon: '🧠',
    label: 'Thinking...',
    subtitle: 'Coach Alex is processing your message',
    color: '#F59E0B',
  },
  speaking: {
    icon: '🔊',
    label: 'Speaking...',
    subtitle: 'Coach Alex is responding',
    color: '#10B981',
  },
  error: {
    icon: '❌',
    label: 'Something went wrong',
    subtitle: 'Tap the mic to try again',
    color: '#EF4444',
  },
};

// Format seconds → "00:12"
const formatDuration = (seconds: number) => {
  const m = String(Math.floor(seconds / 60)).padStart(2, '0');
  const s = String(seconds % 60).padStart(2, '0');
  return `${m}:${s}`;
};

export default function ConversationScreen() {
  // ── Conversation state ──
  const [messages, setMessages] = useState<Message[]>([]);
  const [status, setStatus] = useState<PipelineStatus>('idle');
  const [isLoading, setIsLoading] = useState(false);

  // ── Audio recorder hook ──
  const { isRecording, elapsedSeconds, startRecording, stopRecording } = useAudioRecorder();

  // ── Audio playback ref ──
  const soundRef = useRef<Audio.Sound | null>(null);

  // ── ScrollView ref for auto-scroll ──
  const scrollViewRef = useRef<ScrollView>(null);

  // ── Animations ──
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  // Request mic permission on mount
  useEffect(() => {
    (async () => {
      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) {
        console.warn('Microphone permission not granted');
      }
    })();

    // Animate entrance
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // Cleanup sound on unmount
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync().catch(() => {});
      }
    };
  }, []);

  // Sync recording status with pipeline status
  useEffect(() => {
    if (isRecording) {
      setStatus('recording');
    }
  }, [isRecording]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollViewRef.current && messages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  /**
   * Play base64-encoded audio by writing to temp file and loading with expo-av
   */
  const playBase64Audio = async (base64Audio: string): Promise<void> => {
    try {
      // Unload previous sound if any
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }

      // Write base64 to a temp file
      const fileUri = FileSystem.documentDirectory + `response_${Date.now()}.mp3`;
      await FileSystem.writeAsStringAsync(fileUri, base64Audio, {
        encoding: 'base64',
      });

      // Set audio mode for playback (speaker output)
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
      });

      // Load and play
      const { sound } = await Audio.Sound.createAsync(
        { uri: fileUri },
        { shouldPlay: true }
      );
      soundRef.current = sound;

      // Listen for playback completion to unload and free memory
      sound.setOnPlaybackStatusUpdate((playbackStatus) => {
        if (playbackStatus.isLoaded && playbackStatus.didJustFinish) {
          setStatus('idle');
          sound.unloadAsync().catch(() => {});
          if (soundRef.current === sound) {
            soundRef.current = null;
          }
          // Clean up temp file
          FileSystem.deleteAsync(fileUri, { idempotent: true }).catch(() => {});
        }
      });
    } catch (error) {
      console.error('Audio playback error:', error);
      setStatus('error');
    }
  };

  /**
   * Core handler: Record toggle → Send → Play response
   */
  const handleRecordPress = async () => {
    if (isLoading) return; // Prevent double-tap during processing

    if (isRecording) {
      // ── Stop recording & send through pipeline ──
      const uri = await stopRecording();
      if (!uri) return;

      setIsLoading(true);
      setStatus('thinking');

      try {
        // Stop any currently playing audio
        if (soundRef.current) {
          await soundRef.current.stopAsync().catch(() => {});
          await soundRef.current.unloadAsync().catch(() => {});
          soundRef.current = null;
        }

        // Send audio + history to backend
        const response: ConversationResponse = await sendAudioMessage(uri, messages);

        // Update conversation history
        setMessages(response.updated_history);

        // Play TTS response
        setStatus('speaking');
        await playBase64Audio(response.audio_base64);
      } catch (error) {
        console.error('Voice pipeline error:', error);
        setStatus('error');
        setTimeout(() => setStatus('idle'), 3000);
      } finally {
        setIsLoading(false);
      }
    } else {
      // ── Start new recording ──
      // Stop any currently playing audio first
      if (soundRef.current) {
        try {
          await soundRef.current.stopAsync();
          await soundRef.current.unloadAsync();
        } catch (e) {
          console.error('Error stopping playback:', e);
        }
        soundRef.current = null;
      }
      setStatus('recording');
      startRecording();
    }
  };

  /**
   * Clear conversation and start fresh
   */
  const handleNewConversation = () => {
    setMessages([]);
    setStatus('idle');
    if (soundRef.current) {
      soundRef.current.unloadAsync().catch(() => {});
      soundRef.current = null;
    }
  };

  const statusConfig = STATUS_CONFIG[status];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F0F1A" />

      <Animated.View
        style={[
          styles.innerContainer,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        {/* ── Header ── */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.headerTitle}>Speaking Agent</Text>
              <Text style={styles.headerSubtitle}>AI Conversation Coach</Text>
            </View>
            {messages.length > 0 && (
              <TouchableOpacity
                style={styles.newChatButton}
                onPress={handleNewConversation}
              >
                <Text style={styles.newChatText}>✨ New Chat</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* ── Conversation History ── */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.chatContainer}
          contentContainerStyle={styles.chatContent}
          showsVerticalScrollIndicator={false}
        >
          {messages.length === 0 && !isLoading && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>💬</Text>
              <Text style={styles.emptyTitle}>Start Speaking!</Text>
              <Text style={styles.emptyDesc}>
                Tap the microphone below to start practicing English with Coach Alex.
                Speak naturally — the AI will respond with voice!
              </Text>
            </View>
          )}

          {messages.map((msg, index) => {
            const isUser = msg.role === 'user';
            return (
              <View
                key={index}
                style={[
                  styles.messageBubble,
                  isUser ? styles.userBubble : styles.assistantBubble,
                ]}
              >
                <Text
                  style={[
                    styles.messageRole,
                    isUser ? styles.userRole : styles.assistantRole,
                  ]}
                >
                  {isUser ? '🧑  You' : '🤖  Coach Alex'}
                </Text>
                <Text
                  style={[
                    styles.messageText,
                    isUser ? styles.userText : styles.assistantText,
                  ]}
                >
                  {msg.content}
                </Text>
              </View>
            );
          })}

          {/* Loading bubble */}
          {isLoading && (
            <View style={styles.loadingBubble}>
              <ActivityIndicator size="small" color="#818CF8" />
              <Text style={styles.loadingText}>Coach Alex is thinking...</Text>
            </View>
          )}
        </ScrollView>

        {/* ── Bottom Controls ── */}
        <View style={styles.controlsContainer}>
          {/* Status indicator */}
          <View style={styles.statusContainer}>
            <View
              style={[
                styles.statusDot,
                { backgroundColor: statusConfig.color },
              ]}
            />
            <View style={styles.statusTextContainer}>
              <Text style={styles.statusLabel}>
                {statusConfig.icon}  {statusConfig.label}
              </Text>
              <Text style={styles.statusSubtitle}>{statusConfig.subtitle}</Text>
            </View>
          </View>

          {/* Timer (while recording) */}
          {isRecording && (
            <Text style={styles.timer}>{formatDuration(elapsedSeconds)}</Text>
          )}

          {/* Record Button */}
          <RecordButton
            isRecording={isRecording}
            onPress={handleRecordPress}
          />

          {/* Turn counter */}
          <Text style={styles.turnCounter}>
            {Math.floor(messages.length / 2)} turn{Math.floor(messages.length / 2) !== 1 ? 's' : ''}
          </Text>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

// ═══════════════════════════════════════════════════════════════
// Styles
// ═══════════════════════════════════════════════════════════════

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F1A',
  },
  innerContainer: {
    flex: 1,
  },

  // ── Header ──
  header: {
    paddingTop: 16,
    paddingBottom: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '500',
  },
  newChatButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
  },
  newChatText: {
    fontSize: 12,
    color: '#818CF8',
    fontWeight: '600',
  },

  // ── Chat History ──
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
    marginTop: 80,
    paddingHorizontal: 32,
  },
  emptyEmoji: {
    fontSize: 56,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#E2E8F0',
    marginBottom: 8,
  },
  emptyDesc: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
  },

  // ── Message Bubbles ──
  messageBubble: {
    maxWidth: '85%',
    padding: 14,
    borderRadius: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#6366F1',
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#1E1E2E',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  messageRole: {
    fontSize: 10,
    fontWeight: '700',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  userRole: {
    color: 'rgba(255,255,255,0.7)',
  },
  assistantRole: {
    color: '#818CF8',
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  userText: {
    color: '#FFFFFF',
  },
  assistantText: {
    color: '#CBD5E1',
  },

  // ── Loading Bubble ──
  loadingBubble: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1E2E',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 18,
    gap: 10,
    marginTop: 4,
  },
  loadingText: {
    fontSize: 13,
    color: '#818CF8',
    fontWeight: '500',
  },

  // ── Bottom Controls ──
  controlsContainer: {
    paddingVertical: 20,
    paddingHorizontal: 24,
    alignItems: 'center',
    backgroundColor: '#161625',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
    gap: 12,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusTextContainer: {
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E2E8F0',
  },
  statusSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
    textAlign: 'center',
  },
  timer: {
    fontSize: 44,
    fontWeight: '200',
    color: '#FFFFFF',
    fontVariant: ['tabular-nums'],
    letterSpacing: 3,
  },
  turnCounter: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '500',
    marginTop: 4,
  },
});

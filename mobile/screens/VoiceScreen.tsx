import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Audio } from 'expo-av';
import { RecordButton } from '../components/RecordButton';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import { API_BASE_URL } from '../services/api';
import { generateSessionId } from '../services/chatService';

// Format seconds → "00:12"
const formatDuration = (seconds: number) => {
  const m = String(Math.floor(seconds / 60)).padStart(2, '0');
  const s = String(seconds % 60).padStart(2, '0');
  return `${m}:${s}`;
};

export default function VoiceScreen() {
  // ── Session state ──
  const [sessionId] = useState(() => generateSessionId());

  // ── Conversation state ──
  const [transcript, setTranscript] = useState('');
  const [aiReply, setAiReply] = useState('');
  const [loading, setLoading] = useState(false);
  const [pipelineStep, setPipelineStep] = useState('');
  const [isPlayingResponse, setIsPlayingResponse] = useState(false);

  // ── Conversation history (display only) ──
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([]);

  // ── Audio playback ref ──
  const soundRef = useRef<Audio.Sound | null>(null);

  // ── Recording timer ──
  const [duration, setDuration] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const {
    isRecording,
    audioUri,
    startRecording,
    stopRecording,
  } = useAudioRecorder();

  // Timer for recording duration
  useEffect(() => {
    if (isRecording) {
      setDuration(0);
      timerRef.current = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  // Cleanup sound on unmount
  useEffect(() => {
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  /**
   * Core handler: Record → Send → Play response
   */
  const handleRecordPress = async () => {
    if (isRecording) {
      // ── Stop recording & send through pipeline ──
      const uri = await stopRecording();
      if (uri) {
        await handleVoicePipeline(uri);
      }
    } else {
      // ── Start new recording ──
      setTranscript('');
      setAiReply('');
      setPipelineStep('');
      startRecording();
    }
  };

  /**
   * Full voice pipeline: Send audio → get AI audio response → play it
   */
  const handleVoicePipeline = async (uri: string) => {
    setLoading(true);

    try {
      // Step 1: Send audio to backend
      setPipelineStep('🎙️ Transcribing your voice...');

      const formData = new FormData();
      formData.append('audio', {
        uri: uri,
        type: 'audio/m4a',
        name: 'recording.m4a',
      } as any);
      formData.append('session_id', sessionId);

      const response = await fetch(`${API_BASE_URL}/api/chat/voice`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Pipeline failed:', response.status, errorText);
        throw new Error(`Pipeline failed: ${response.status}`);
      }

      // Extract transcript and AI reply from headers
      const transcriptHeader = response.headers.get('X-Transcript');
      const aiReplyHeader = response.headers.get('X-AI-Reply');

      const userText = transcriptHeader ? decodeURIComponent(transcriptHeader) : '';
      const replyText = aiReplyHeader ? decodeURIComponent(aiReplyHeader) : '';

      setTranscript(userText);
      setAiReply(replyText);

      // Update conversation history for display
      if (userText) {
        setMessages((prev) => [
          ...prev,
          { role: 'user', content: userText },
          { role: 'assistant', content: replyText },
        ]);
      }

      // Step 2: Play the response audio
      setPipelineStep('🔊 Playing AI response...');

      const audioBlob = await response.blob();

      // Convert blob to base64 data URI for expo-av
      const reader = new FileReader();
      const audioDataUri = await new Promise<string>((resolve, reject) => {
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(audioBlob);
      });

      // Unload previous sound if any
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
      }

      // Set audio mode for playback
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
      });

      // Load and play
      const { sound } = await Audio.Sound.createAsync(
        { uri: audioDataUri },
        { shouldPlay: true }
      );
      soundRef.current = sound;
      setIsPlayingResponse(true);

      // Listen for playback completion
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setIsPlayingResponse(false);
          setPipelineStep('');
        }
      });

    } catch (error) {
      console.error('Voice pipeline error:', error);
      setPipelineStep('❌ Something went wrong. Try again.');
      setTimeout(() => setPipelineStep(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Clear conversation and start fresh
   */
  const handleNewConversation = () => {
    setMessages([]);
    setTranscript('');
    setAiReply('');
    setPipelineStep('');
  };

  // Status label
  const getStatusInfo = () => {
    if (loading) return { label: '⏳  Processing...', subtitle: pipelineStep };
    if (isPlayingResponse) return { label: '🔊  Coach is speaking...', subtitle: 'Listen to the response' };
    if (isRecording) return { label: '🔴  Recording...', subtitle: 'Tap the button to stop' };
    if (aiReply) return { label: '✅  Response received', subtitle: 'Tap mic to continue talking' };
    return { label: '🎤  Ready to Speak', subtitle: 'Tap the mic to start your conversation' };
  };

  const { label, subtitle } = getStatusInfo();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Speaking Agent</Text>
        <Text style={styles.headerSubtitle}>AI Conversation Coach</Text>
        {messages.length > 0 && (
          <TouchableOpacity style={styles.newChatButton} onPress={handleNewConversation}>
            <Text style={styles.newChatText}>🔄 New Chat</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Conversation History */}
      {messages.length > 0 && (
        <ScrollView style={styles.chatContainer} contentContainerStyle={styles.chatContent}>
          {messages.map((msg, index) => (
            <View
              key={index}
              style={[
                styles.messageBubble,
                msg.role === 'user' ? styles.userBubble : styles.assistantBubble,
              ]}
            >
              <Text style={styles.messageRole}>
                {msg.role === 'user' ? '🧑 You' : '🤖 Coach Alex'}
              </Text>
              <Text style={[
                styles.messageText,
                msg.role === 'user' ? styles.userText : styles.assistantText,
              ]}>
                {msg.content}
              </Text>
            </View>
          ))}
        </ScrollView>
      )}

      {/* Content Area */}
      <View style={styles.content}>
        {/* Status */}
        <Text style={styles.statusLabel}>{label}</Text>
        <Text style={styles.statusSubtitle}>{subtitle}</Text>

        {/* Timer (while recording) */}
        {isRecording && (
          <Text style={styles.timer}>{formatDuration(duration)}</Text>
        )}

        {/* Record Button */}
        <RecordButton
          isRecording={isRecording}
          onPress={handleRecordPress}
        />

        {/* Loading Indicator */}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#6366F1" />
            <Text style={styles.loadingText}>{pipelineStep}</Text>
          </View>
        )}

        {/* Latest Transcript & Reply */}
        {!loading && transcript ? (
          <View style={styles.resultContainer}>
            <View style={styles.resultCard}>
              <Text style={styles.resultLabel}>YOUR WORDS</Text>
              <Text style={styles.resultText}>{transcript}</Text>
            </View>
            {aiReply ? (
              <View style={[styles.resultCard, styles.replyCard]}>
                <Text style={styles.resultLabel}>COACH ALEX</Text>
                <Text style={styles.resultText}>{aiReply}</Text>
              </View>
            ) : null}
          </View>
        ) : null}
      </View>

      {/* Session Info (Debug) */}
      <View style={styles.sessionInfo}>
        <Text style={styles.sessionText}>
          Session: {sessionId.slice(0, 8)}... • {messages.length} messages
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  // ── Header ──
  header: {
    paddingTop: 20,
    paddingBottom: 12,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1F2937',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 4,
    fontWeight: '500',
  },
  newChatButton: {
    marginTop: 8,
    paddingVertical: 6,
    paddingHorizontal: 16,
    backgroundColor: '#EEF2FF',
    borderRadius: 20,
  },
  newChatText: {
    fontSize: 12,
    color: '#6366F1',
    fontWeight: '600',
  },
  // ── Chat History ──
  chatContainer: {
    maxHeight: 200,
    marginHorizontal: 16,
    marginBottom: 8,
  },
  chatContent: {
    paddingVertical: 8,
  },
  messageBubble: {
    padding: 12,
    borderRadius: 16,
    marginBottom: 8,
    maxWidth: '85%',
  },
  userBubble: {
    backgroundColor: '#6366F1',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: '#FFFFFF',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  messageRole: {
    fontSize: 10,
    fontWeight: '700',
    marginBottom: 4,
    opacity: 0.7,
    color: '#6B7280',
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  userText: {
    color: '#FFFFFF',
  },
  assistantText: {
    color: '#374151',
  },
  // ── Content ──
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 24,
  },
  statusLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
  },
  statusSubtitle: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: -8,
    textAlign: 'center',
  },
  timer: {
    fontSize: 48,
    fontWeight: '200',
    color: '#1F2937',
    fontVariant: ['tabular-nums'],
    letterSpacing: 2,
  },
  // ── Loading ──
  loadingContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  loadingText: {
    fontSize: 14,
    color: '#6366F1',
    marginTop: 8,
    fontWeight: '500',
  },
  // ── Result Cards ──
  resultContainer: {
    width: '100%',
    gap: 8,
  },
  resultCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  replyCard: {
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  resultLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#9CA3AF',
    letterSpacing: 1,
    marginBottom: 6,
  },
  resultText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#374151',
  },
  // ── Session Info ──
  sessionInfo: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  sessionText: {
    fontSize: 10,
    color: '#D1D5DB',
    fontWeight: '500',
  },
});

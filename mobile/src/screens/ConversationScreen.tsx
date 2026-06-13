import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system/legacy';
import { useAuth } from '../context/AuthContext';
import { sessionApi } from '../api/sessions';
import { showToast } from '../components/Toast';
import { LoadingOverlay } from '../components/LoadingOverlay';

const BASE_URL = 'http://192.168.29.37:8000';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ScoreItem {
  grammar: number;
  fluency: number;
  overall: number;
  tips: string[];
}

async function callConversationAPI(
  audioUri: string,
  history: Message[],
  baseUrl: string,
  token: string,
): Promise<{ transcript: string; reply: string; audio_base64: string; score: any }> {
  const fileData = await FileSystem.uploadAsync(
    `${baseUrl}/api/conversation/respond`,
    audioUri,
    {
      fieldName: 'file',
      httpMethod: 'POST',
      uploadType: FileSystem.FileSystemUploadType.MULTIPART,
      headers: {
        Authorization: `Bearer ${token}`,
      },
      parameters: {
        conversation_history: JSON.stringify(history),
      },
    }
  );

  if (fileData.status !== 200) {
    throw new Error(fileData.body || 'Failed to upload audio');
  }

  const res = JSON.parse(fileData.body);
  return {
    transcript: res.user_transcript ?? res.user_text ?? '',
    reply: res.reply_text ?? res.coach_text ?? '',
    audio_base64: res.audio_base64 ?? '',
    score: res.score,
  };
}

export default function ConversationScreen({ navigation }: any) {
  const { token } = useAuth();
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [scores, setScores] = useState<ScoreItem[]>([]);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [recordingStatus, setRecordingStatus] = useState<'idle' | 'recording' | 'processing'>('idle');
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [loading, setLoading] = useState(false);

  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    // Start session on mount
    setLoading(true);
    sessionApi.start()
      .then((session) => {
        setSessionId(session.id);
        // Initial coach message
        setMessages([{ role: 'assistant', content: "Hello! Let's practice speaking today. How are you doing?" }]);
      })
      .catch(() => {
        showToast.error('Error', 'Failed to initialize session');
        navigation.goBack();
      })
      .finally(() => setLoading(false));

    return () => {
      if (sound) sound.unloadAsync();
      if (recording) recording.stopAndUnloadAsync();
    };
  }, []);

  const startRecording = async () => {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(newRecording);
      setRecordingStatus('recording');
    } catch (err) {
      showToast.error('Mic Error', 'Could not access microphone');
    }
  };

  const stopRecording = async () => {
    if (!recording) return;
    setRecordingStatus('processing');
    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);

      if (!uri || !sessionId || !token) {
        setRecordingStatus('idle');
        return;
      }

      setLoading(true);
      const result = await callConversationAPI(uri, messages, BASE_URL, token);

      // Add user transcript and coach response
      const updatedMessages: Message[] = [
        ...messages,
        { role: 'user', content: result.transcript },
        { role: 'assistant', content: result.reply },
      ];
      setMessages(updatedMessages);

      // Save scoring for this turn
      if (result.score) {
        setScores([
          ...scores,
          {
            grammar: result.score.grammar_score ?? 0,
            fluency: result.score.fluency_score ?? 0,
            overall: result.score.overall_score ?? 0,
            tips: result.score.feedback_tips ?? result.score.feedback ?? [],
          },
        ]);
      }

      // Play coach audio
      if (result.audio_base64) {
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: `data:audio/mp3;base64,${result.audio_base64}` },
          { shouldPlay: true }
        );
        setSound(newSound);
      }
    } catch (err: any) {
      showToast.error('Pipeline Error', err.message ?? 'An error occurred');
    } finally {
      setRecordingStatus('idle');
      setLoading(false);
    }
  };

  const endSession = async () => {
    if (!sessionId) return;
    if (scores.length === 0) {
      Alert.alert('Cancel Session', 'Do you want to exit without saving?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Exit', style: 'destructive', onPress: () => navigation.goBack() },
      ]);
      return;
    }

    setLoading(true);
    try {
      const avgGrammar = Math.round(scores.reduce((a, b) => a + b.grammar, 0) / scores.length);
      const avgFluency = Math.round(scores.reduce((a, b) => a + b.fluency, 0) / scores.length);
      const avgOverall = Math.round(scores.reduce((a, b) => a + b.overall, 0) / scores.length);
      const allTips = Array.from(new Set(scores.flatMap((s) => s.tips))).slice(0, 5);

      await sessionApi.end(sessionId, {
        grammar_score: avgGrammar,
        fluency_score: avgFluency,
        overall_score: avgOverall,
        turn_count: scores.length,
      });

      navigation.navigate('Score', {
        score: {
          grammar_score: avgGrammar,
          fluency_score: avgFluency,
          overall_score: avgOverall,
          feedback_tips: allTips,
        },
      });
    } catch (err) {
      showToast.error('Save Error', 'Failed to save session results');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <LoadingOverlay visible={loading} />

      <ScrollView
        ref={scrollViewRef}
        style={styles.chatContainer}
        contentContainerStyle={styles.chatContent}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.map((m, i) => (
          <View key={i} style={[styles.bubble, m.role === 'user' ? styles.userBubble : styles.coachBubble]}>
            <Text style={styles.roleLabel}>{m.role === 'user' ? 'You' : 'Coach'}</Text>
            <Text style={styles.messageText}>{m.content}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.controls}>
        {recordingStatus === 'recording' ? (
          <TouchableOpacity style={[styles.micBtn, styles.recordingBtn]} onPress={stopRecording}>
            <Text style={styles.btnText}>Tap to Stop</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.micBtn} onPress={startRecording} disabled={recordingStatus === 'processing'}>
            <Text style={styles.btnText}>Hold to Speak</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.endBtn} onPress={endSession}>
          <Text style={styles.endBtnText}>Finish Practice</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  chatContainer: { flex: 1, padding: 16 },
  chatContent: { paddingBottom: 20 },
  bubble: { padding: 14, borderRadius: 16, marginBottom: 12, maxWidth: '80%' },
  userBubble: { backgroundColor: '#6366F1', alignSelf: 'flex-end' },
  coachBubble: { backgroundColor: '#FFFFFF', alignSelf: 'flex-start', borderTopLeftRadius: 4 },
  roleLabel: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', color: '#9CA3AF', marginBottom: 4 },
  messageText: { fontSize: 15, color: '#374151', lineHeight: 20 },
  controls: { padding: 20, backgroundColor: '#FFF', borderTopWidth: 1, borderColor: '#E5E7EB' },
  micBtn: { backgroundColor: '#6366F1', borderRadius: 28, height: 56, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  recordingBtn: { backgroundColor: '#EF4444' },
  btnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  endBtn: { paddingVertical: 12, alignItems: 'center' },
  endBtnText: { color: '#4B5563', fontSize: 14, fontWeight: '600' },
});

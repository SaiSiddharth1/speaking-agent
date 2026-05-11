import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import { transcribeAudio } from '../services/api';

export default function RecordingScreen() {
  const { isRecording, audioUri, startRecording, stopRecording } = useAudioRecorder();
  const [transcript, setTranscript] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handlePress = async () => {
    if (isRecording) {
      const uri = await stopRecording();
      if (uri) {
        setLoading(true);
        try {
          const text = await transcribeAudio(uri);
          setTranscript(text);
        } catch (e) {
          console.error("STT error:", e);
        } finally {
          setLoading(false);
        }
      }
    } else {
      setTranscript("");
      await startRecording();
    }
  };

  const status = isRecording ? '🔴 Recording...' : audioUri ? '✅ Done' : '⚪ Idle';

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Speaking Agent</Text>
      <Text style={styles.status}>{status}</Text>

      <TouchableOpacity
        style={[styles.button, isRecording && styles.buttonActive]}
        onPress={handlePress}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? '⌛ ...' : isRecording ? '⏹ Stop' : '🎤 Speak'}
        </Text>
      </TouchableOpacity>

      {loading && <ActivityIndicator size="large" color="#4F46E5" style={{ marginTop: 20 }} />}
      
      {transcript ? (
        <View style={styles.transcriptContainer}>
          <Text style={styles.transcriptLabel}>Transcript:</Text>
          <Text style={styles.transcriptText}>{transcript}</Text>
        </View>
      ) : null}

      {/* Debug only — remove later */}
      {audioUri && !transcript && !loading && <Text style={styles.uri}>{audioUri}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  title:     { fontSize: 28, fontWeight: 'bold', marginBottom: 16 },
  status:    { fontSize: 16, marginBottom: 32, color: '#555' },
  button:    { backgroundColor: '#4F46E5', padding: 24, borderRadius: 80 },
  buttonActive: { backgroundColor: '#DC2626' },
  buttonText:   { color: '#fff', fontSize: 18, fontWeight: '600' },
  uri:       { marginTop: 24, fontSize: 11, color: '#aaa', textAlign: 'center' },
  transcriptContainer: { marginTop: 32, padding: 16, backgroundColor: '#f3f4f6', borderRadius: 12, width: '100%' },
  transcriptLabel: { fontSize: 12, color: '#6b7280', marginBottom: 4, fontWeight: 'bold', textTransform: 'uppercase' },
  transcriptText: { fontSize: 16, color: '#111827', lineHeight: 24 },
});

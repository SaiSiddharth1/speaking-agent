import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useAudioRecorder } from '../hooks/useAudioRecorder';

export default function RecordingScreen() {
  const { isRecording, audioUri, startRecording, stopRecording } = useAudioRecorder();

  const handlePress = () => {
    isRecording ? stopRecording() : startRecording();
  };

  const status = isRecording ? '🔴 Recording...' : audioUri ? '✅ Done' : '⚪ Idle';

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Speaking Agent</Text>
      <Text style={styles.status}>{status}</Text>

      <TouchableOpacity
        style={[styles.button, isRecording && styles.buttonActive]}
        onPress={handlePress}
      >
        <Text style={styles.buttonText}>{isRecording ? '⏹ Stop' : '🎤 Speak'}</Text>
      </TouchableOpacity>

      {/* Debug only — remove later */}
      {audioUri && <Text style={styles.uri}>{audioUri}</Text>}
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
});

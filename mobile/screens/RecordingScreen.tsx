import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useAudioRecorder } from '../hooks/useAudioRecorder';

export default function RecordingScreen() {
  const { isRecording, audioUri, error, startRecording, stopRecording } =
    useAudioRecorder();

  const handlePress = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const getStatus = () => {
    if (error) return `❌ ${error}`;
    if (isRecording) return '🔴 Recording... tap to stop';
    if (audioUri) return '✅ Done! Ready to analyze';
    return '🎙️ Press to speak';
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Speaking Agent</Text>

      <TouchableOpacity
        style={[styles.button, isRecording && styles.buttonActive]}
        onPress={handlePress}
      >
        <Text style={styles.buttonText}>
          {isRecording ? '⏹ Stop' : '🎤 Speak'}
        </Text>
      </TouchableOpacity>

      <Text style={styles.status}>{getStatus()}</Text>

      {/* DEV ONLY — remove before production */}
      {audioUri && (
        <Text style={styles.uri} numberOfLines={2}>
          URI: {audioUri}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  title:     { fontSize: 24, fontWeight: 'bold', marginBottom: 48 },
  button:    { backgroundColor: '#4F46E5', padding: 24, borderRadius: 80 },
  buttonActive: { backgroundColor: '#DC2626' },
  buttonText:   { color: '#fff', fontSize: 18, fontWeight: '600' },
  status:    { marginTop: 24, fontSize: 16, color: '#555' },
  uri:       { marginTop: 16, fontSize: 11, color: '#aaa', textAlign: 'center' },
});

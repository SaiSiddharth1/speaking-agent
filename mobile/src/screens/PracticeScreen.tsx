import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ActivityIndicator, ScrollView } from 'react-native';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import { RecordButton } from '../components/RecordButton';
import { AudioPlayer } from '../components/AudioPlayer';
import { transcribeAudio } from '../services/speechApi';

export const PracticeScreen = () => {
  const { isRecording, recordingUri, elapsedSeconds, startRecording, stopRecording } = useAudioRecorder();
  const [transcript, setTranscript] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const formatTime = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const handleToggle = async () => {
    if (isRecording) {
      const uri = await stopRecording();
      if (uri) {
        handleTranscribe(uri);
      }
    } else {
      setTranscript('');
      startRecording();
    }
  };

  const handleTranscribe = async (uri: string) => {
    setIsLoading(true);
    try {
      const text = await transcribeAudio(uri);
      setTranscript(text);
    } catch (error) {
      console.error("Transcription error:", error);
      setTranscript("Error: Failed to transcribe audio.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.timer}>{formatTime(elapsedSeconds)}</Text>
        <RecordButton isRecording={isRecording} onPress={handleToggle} />
        
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>Transcribing...</Text>
          </View>
        )}

        {!isLoading && transcript !== '' && (
          <ScrollView style={styles.transcriptContainer}>
            <Text style={styles.transcriptTitle}>Transcript:</Text>
            <Text style={styles.transcriptText}>{transcript}</Text>
          </ScrollView>
        )}

        <AudioPlayer uri={recordingUri} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 24, paddingHorizontal: 20 },
  timer: { fontSize: 48, fontWeight: '200', letterSpacing: 4 },
  loadingContainer: { alignItems: 'center', gap: 8 },
  loadingText: { color: '#666', fontSize: 16 },
  transcriptContainer: { 
    maxHeight: 200, 
    width: '100%', 
    backgroundColor: '#f9f9f9', 
    padding: 16, 
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eee'
  },
  transcriptTitle: { fontWeight: 'bold', marginBottom: 8, color: '#333' },
  transcriptText: { fontSize: 16, color: '#444', lineHeight: 24 },
});

export default PracticeScreen;

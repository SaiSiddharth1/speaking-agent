import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import { RecordButton } from '../components/RecordButton';
import { sendAudioToBackend } from '../../services/api';

export const ConversationScreen = () => {
  const { isRecording, startRecording, stopRecording } = useAudioRecorder();
  
  const [transcript, setTranscript] = useState("");
  const [aiReply, setAiReply] = useState("");
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    if (isRecording) {
      // 1. Stop recording (your existing code)
      const uri = await stopRecording(); // returns local file URI
      if (!uri) return;

      // 2. Send to backend
      setLoading(true);
      try {
        const result = await sendAudioToBackend(uri);
        setTranscript(result.transcript);
        setAiReply(result.ai_reply);
      } catch (err) {
        console.error("Error:", err);
        Alert.alert("Error", "Could not process audio");
      } finally {
        setLoading(false);
      }
    } else {
      startRecording();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {loading && <ActivityIndicator size="large" color="#4A90E2" style={styles.loader} />}

        {transcript !== "" && (
          <View style={styles.card}>
            <Text style={styles.label}>You said:</Text>
            <Text style={styles.transcript}>{transcript}</Text>
          </View>
        )}

        {aiReply !== "" && (
          <View style={styles.card}>
            <Text style={styles.label}>Coach:</Text>
            <Text style={styles.reply}>{aiReply}</Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.controls}>
        <RecordButton isRecording={isRecording} onPress={handleToggle} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  loader: {
    marginVertical: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  label: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 8,
    fontWeight: 'bold',
  },
  transcript: {
    fontSize: 16,
    color: '#1E293B',
    lineHeight: 24,
  },
  reply: {
    fontSize: 16,
    color: '#4A90E2',
    lineHeight: 24,
  },
  controls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
});

export default ConversationScreen;

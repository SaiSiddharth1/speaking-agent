import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import { RecordButton } from '../components/RecordButton';
import { transcribeAudio, API_BASE_URL } from '../../services/api';

export const ConversationScreen = () => {
  const { isRecording, startRecording, stopRecording } = useAudioRecorder();
  
  const [transcript, setTranscript] = useState("");
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);
  const [isLoadingFeedback, setIsLoadingFeedback] = useState(false);

  const sendForFeedback = async (transcribedText: string) => {
    setIsLoadingFeedback(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: transcribedText })
      });
      if (!response.ok) {
        throw new Error("Failed to get feedback");
      }
      const data = await response.json();
      setFeedback(data.feedback);
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Could not get feedback");
    } finally {
      setIsLoadingFeedback(false);
    }
  };

  const handleToggle = async () => {
    if (isRecording) {
      const uri = await stopRecording();
      if (!uri) return;

      setLoading(true);
      try {
        const text = await transcribeAudio(uri);
        setTranscript(text);
        if (text && text.trim()) {
            await sendForFeedback(text);
        }
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
        {loading && (
            <View style={styles.loader}>
                <ActivityIndicator size="large" color="#4A90E2" />
                <Text style={{textAlign: 'center', marginTop: 10}}>Listening & Transcribing...</Text>
            </View>
        )}

        {transcript !== "" && (
          <View style={styles.card}>
            <Text style={styles.label}>You said:</Text>
            <Text style={styles.transcript}>{transcript}</Text>
          </View>
        )}

        {isLoadingFeedback && (
            <View style={styles.loader}>
                <ActivityIndicator size="large" color="#6366F1" />
                <Text style={{textAlign: 'center', marginTop: 10}}>Getting feedback...</Text>
            </View>
        )}

        {feedback !== "" && (
          <View style={styles.card}>
            <Text style={styles.label}>Coach:</Text>
            <Text style={styles.reply}>{feedback}</Text>
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

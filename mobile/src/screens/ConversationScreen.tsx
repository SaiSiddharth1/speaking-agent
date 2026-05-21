import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import { RecordButton } from '../components/RecordButton';
import { transcribeAudio } from '../../services/api';
import { sendMessage, Message } from '../services/chatService';
export const ConversationScreen = () => {
  const { isRecording, startRecording, stopRecording } = useAudioRecorder();
  
  const [history, setHistory] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [aiReply, setAiReply] = useState("");


  const handleToggle = async () => {
    if (isRecording) {
      const uri = await stopRecording();
      if (!uri) return;

      setLoading(true);
      try {
        const text = await transcribeAudio(uri);
        if (text && text.trim()) {
            const updatedHistory: Message[] = [
              ...history,
              { role: "user", content: text }
            ];
            
            setHistory(updatedHistory);
            
            const response = await sendMessage(updatedHistory);
            
            setHistory(response.updated_history);
            setAiReply(response.reply);
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

        {history.filter(m => m.role === "user").length > 0 && (
          <View style={styles.card}>
            <Text style={styles.label}>You said:</Text>
            <Text style={styles.transcript}>{history[history.length - 2]?.content || history[history.length - 1]?.content}</Text>
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

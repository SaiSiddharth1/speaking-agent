import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import { RecordButton } from '../components/RecordButton';
import { AudioPlayer } from '../components/AudioPlayer';

export const PracticeScreen = () => {
  const { isRecording, recordingUri, elapsedSeconds, startRecording, stopRecording } = useAudioRecorder();

  const formatTime = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const handleToggle = () => isRecording ? stopRecording() : startRecording();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.timer}>{formatTime(elapsedSeconds)}</Text>
        <RecordButton isRecording={isRecording} onPress={handleToggle} />
        <AudioPlayer uri={recordingUri} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 24 },
  timer: { fontSize: 48, fontWeight: '200', letterSpacing: 4 },
});

export default PracticeScreen;

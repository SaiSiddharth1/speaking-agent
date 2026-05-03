import { View, Text, StyleSheet } from 'react-native';
import { RecordButton } from '../../components/RecordButton';
import { useAudioRecorder } from '../../hooks/useAudioRecorder';

// Helper: format seconds → "00:12"
const formatDuration = (seconds: number) => {
  const m = String(Math.floor(seconds / 60)).padStart(2, '0');
  const s = String(seconds % 60).padStart(2, '0');
  return `${m}:${s}`;
};

export default function RecordScreen() {
  const {
    isRecording,
    hasPermission,
    duration,
    recordingUri,
    startRecording,
    stopRecording,
  } = useAudioRecorder();

  const handlePress = () => {
    if (isRecording) stopRecording();
    else startRecording();
  };

  if (!hasPermission) {
    return (
      <View style={styles.container}>
        <Text>Microphone permission denied.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>

      <Text style={styles.status}>
        {isRecording ? 'Recording...' : recordingUri ? 'Done! ✅' : 'Tap to speak'}
      </Text>

      <Text style={styles.timer}>{formatDuration(duration)}</Text>

      <RecordButton isRecording={isRecording} onPress={handlePress} />

      {/* Debug: show file URI after recording */}
      {recordingUri && (
        <Text style={styles.uri} numberOfLines={2}>
          📁 {recordingUri}
        </Text>
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
    padding: 20,
  },
  status: {
    fontSize: 20,
    fontWeight: '600',
  },
  timer: {
    fontSize: 48,
    fontWeight: 'bold',
    fontVariant: ['tabular-nums'],
  },
  uri: {
    fontSize: 11,
    color: '#888',
    textAlign: 'center',
    marginTop: 16,
  },
});

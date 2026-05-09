import { TouchableOpacity, Text, StyleSheet } from 'react-native';

interface Props {
  isRecording: boolean;
  onPress: () => void;
}

export const RecordButton = ({ isRecording, onPress }: Props) => (
  <TouchableOpacity
    style={[styles.button, isRecording && styles.recording]}
    onPress={onPress}
  >
    <Text style={styles.icon}>{isRecording ? '⏹' : '🎤'}</Text>
    <Text style={styles.label}>{isRecording ? 'Stop' : 'Record'}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  button: { 
    alignItems: 'center', 
    justifyContent: 'center',
    width: 100,
    height: 100,
    borderRadius: 50, 
    backgroundColor: '#4F46E5' 
  },
  recording: { backgroundColor: '#DC2626' },
  icon: { fontSize: 32 },
  label: { color: '#fff', marginTop: 4, fontWeight: '600' },
});

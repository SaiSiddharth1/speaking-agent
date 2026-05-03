import { TouchableOpacity, Text, StyleSheet } from 'react-native';

type Props = {
  isRecording: boolean;
  onPress: () => void;
};

export const RecordButton = ({ isRecording, onPress }: Props) => {
  return (
    <TouchableOpacity
      style={[styles.button, isRecording && styles.recording]}
      onPress={onPress}
    >
      <Text style={styles.icon}>{isRecording ? '⏹' : '🎤'}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recording: {
    backgroundColor: '#DC2626',   // red when recording
  },
  icon: {
    fontSize: 32,
  },
});

import { useState } from 'react';
import { Audio } from 'expo-av';
import { Alert } from 'react-native';

export function useAudioRecorder() {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [audioUri, setAudioUri] = useState<string | null>(null);

  const startRecording = async () => {
    try {
      // Step 1: Ask permission
      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) {
        Alert.alert('Permission Denied', 'Microphone access is required.');
        return;
      }

      // Step 2: Set audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      // Step 3: Create + start recording
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecording(recording);
      setIsRecording(true);
      setAudioUri(null);

    } catch (err) {
      console.error('Start recording error:', err);
    }
  };

  const stopRecording = async (): Promise<string | null> => {
    if (!recording) return null;
    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setAudioUri(uri);
      setRecording(null);
      setIsRecording(false);
      return uri;
    } catch (err) {
      console.error('Stop recording error:', err);
      return null;
    }
  };

  return { isRecording, audioUri, startRecording, stopRecording };
}

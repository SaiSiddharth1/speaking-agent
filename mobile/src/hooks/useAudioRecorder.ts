import { useState, useRef } from 'react';
import { Audio } from 'expo-av';
import { Alert } from 'react-native';

export const useAudioRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const recordingRef = useRef<Audio.Recording | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = async () => {
    try {
      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) {
        Alert.alert('Permission denied', 'Microphone access is required.');
        return;
      }

      await Audio.setAudioModeAsync({ allowsRecordingIOS: true });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      recordingRef.current = recording;
      setIsRecording(true);
      setElapsedSeconds(0);

      timerRef.current = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);

    } catch (err) {
      console.error('Start recording failed:', err);
    }
  };

  const stopRecording = async (): Promise<string | null> => {
    try {
      if (!recordingRef.current) return null;

      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();
      setRecordingUri(uri);
      recordingRef.current = null;

      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
      return uri;

    } catch (err) {
      console.error('Stop recording failed:', err);
      return null;
    }
  };

  return { isRecording, recordingUri, elapsedSeconds, startRecording, stopRecording };
};

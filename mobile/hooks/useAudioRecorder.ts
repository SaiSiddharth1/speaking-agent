import { useState, useRef, useEffect, useCallback } from 'react';
import { Audio } from 'expo-av';

export type RecordingStatus = 'idle' | 'recording' | 'stopped';

export const useAudioRecorder = () => {
  const [status, setStatus] = useState<RecordingStatus>('idle');
  const [hasPermission, setHasPermission] = useState(false);
  const [duration, setDuration] = useState(0);
  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const recordingRef = useRef<Audio.Recording | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Request permission on mount
  useEffect(() => {
    (async () => {
      const { granted } = await Audio.requestPermissionsAsync();
      setHasPermission(granted);
    })();

    // Cleanup on unmount
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  const startRecording = useCallback(async () => {
    if (!hasPermission) {
      // Try requesting again
      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) {
        alert('Microphone permission is required to record audio.');
        return;
      }
      setHasPermission(true);
    }

    try {
      // Unload any previous playback sound
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
        setIsPlaying(false);
      }

      // Set audio mode for recording (important for iOS)
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      // Create and start recording
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      recordingRef.current = recording;
      setStatus('recording');
      setDuration(0);
      setRecordingUri(null);

      // Start duration timer
      timerRef.current = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Failed to start recording:', err);
    }
  }, [hasPermission]);

  const stopRecording = useCallback(async () => {
    if (!recordingRef.current) return;

    try {
      // Stop the timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      // Stop and unload the recording — MUST happen before getURI()
      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();
      console.log('Recording saved at:', uri);

      recordingRef.current = null;
      setRecordingUri(uri ?? null);
      setStatus('stopped');

      // Reset audio mode so playback works on iOS
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });
    } catch (err) {
      console.error('Failed to stop recording:', err);
    }
  }, []);

  const playRecording = useCallback(async () => {
    if (!recordingUri) return;

    try {
      // If already playing, stop it
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
        setIsPlaying(false);
        return;
      }

      const { sound } = await Audio.Sound.createAsync(
        { uri: recordingUri },
        { shouldPlay: true }
      );

      soundRef.current = sound;
      setIsPlaying(true);

      // Listen for when playback finishes
      sound.setOnPlaybackStatusUpdate((playbackStatus) => {
        if (playbackStatus.isLoaded && playbackStatus.didJustFinish) {
          setIsPlaying(false);
          sound.unloadAsync();
          soundRef.current = null;
        }
      });
    } catch (err) {
      console.error('Failed to play recording:', err);
      setIsPlaying(false);
    }
  }, [recordingUri]);

  const resetRecording = useCallback(() => {
    if (soundRef.current) {
      soundRef.current.unloadAsync();
      soundRef.current = null;
    }
    setStatus('idle');
    setDuration(0);
    setRecordingUri(null);
    setIsPlaying(false);
  }, []);

  return {
    status,
    isRecording: status === 'recording',
    hasPermission,
    duration,
    recordingUri,
    isPlaying,
    startRecording,
    stopRecording,
    playRecording,
    resetRecording,
  };
};

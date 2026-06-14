import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system/legacy';

export async function playBase64Audio(base64: string): Promise<void> {
  try {
    // Write base64 to a temp file
    const tempUri = FileSystem.cacheDirectory + `tts_${Date.now()}.mp3`;
    await FileSystem.writeAsStringAsync(tempUri, base64, {
      encoding: 'base64',
    });

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
    });

    const { sound } = await Audio.Sound.createAsync({ uri: tempUri });

    await sound.playAsync();

    // Clean up after playback finishes
    sound.setOnPlaybackStatusUpdate(async (status) => {
      if ('didJustFinish' in status && status.didJustFinish) {
        await sound.unloadAsync();
        await FileSystem.deleteAsync(tempUri, { idempotent: true });
      }
    });
  } catch (err) {
    console.error('Audio playback error:', err);
    throw err;
  }
}

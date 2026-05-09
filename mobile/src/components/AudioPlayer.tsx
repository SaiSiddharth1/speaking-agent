import { useState, useEffect, useRef } from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Audio } from 'expo-av';

interface Props {
  uri: string | null;
}

export const AudioPlayer = ({ uri }: Props) => {
  const soundRef = useRef<Audio.Sound | null>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    // cleanup on unmount
    return () => {
      soundRef.current?.unloadAsync();
    };
  }, []);

  const handlePlay = async () => {
    if (!uri) return;
    
    try {
      const { sound } = await Audio.Sound.createAsync({ uri });
      soundRef.current = sound;
      setPlaying(true);
      await sound.playAsync();
      
      sound.setOnPlaybackStatusUpdate(status => {
        if (status.isLoaded && status.didJustFinish) {
          setPlaying(false);
        }
      });
    } catch (error) {
      console.error('Playback failed', error);
    }
  };

  return (
    <TouchableOpacity 
      style={[styles.button, (!uri || playing) && styles.disabled]} 
      onPress={handlePlay} 
      disabled={!uri || playing}
    >
      <Text style={styles.text}>{playing ? '🔊 Playing...' : '▶️ Play Recording'}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: 16,
    backgroundColor: '#E0E7FF',
    borderRadius: 12,
    marginTop: 20,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    color: '#4338CA',
    fontWeight: '600',
  }
});

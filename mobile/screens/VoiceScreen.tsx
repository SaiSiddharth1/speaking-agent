import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { RecordButton } from '../components/RecordButton';
import { useAudioRecorder } from '../hooks/useAudioRecorder';

// Format seconds → "00:12"
const formatDuration = (seconds: number) => {
  const m = String(Math.floor(seconds / 60)).padStart(2, '0');
  const s = String(seconds % 60).padStart(2, '0');
  return `${m}:${s}`;
};

export default function VoiceScreen() {
  const {
    status,
    isRecording,
    hasPermission,
    duration,
    recordingUri,
    isPlaying,
    startRecording,
    stopRecording,
    playRecording,
    resetRecording,
  } = useAudioRecorder();

  const handleRecordPress = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  // Status label + subtitle
  const getStatusInfo = () => {
    switch (status) {
      case 'recording':
        return { label: '🔴  Recording...', subtitle: 'Tap the button to stop' };
      case 'stopped':
        return { label: '✅  Recording Saved', subtitle: 'Play it back or record again' };
      default:
        return { label: '🎤  Ready to Record', subtitle: 'Tap the mic to start' };
    }
  };

  const { label, subtitle } = getStatusInfo();

  if (!hasPermission) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.permissionBox}>
          <Text style={styles.permissionIcon}>🔒</Text>
          <Text style={styles.permissionTitle}>Microphone Access Required</Text>
          <Text style={styles.permissionSubtitle}>
            Speaking Agent needs microphone permission to record your voice.
          </Text>
          <TouchableOpacity
            style={styles.permissionButton}
            onPress={startRecording}
          >
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Speaking Agent</Text>
        <Text style={styles.headerSubtitle}>Voice Recorder</Text>
      </View>

      {/* Content Area */}
      <View style={styles.content}>
        {/* Status */}
        <Text style={styles.statusLabel}>{label}</Text>
        <Text style={styles.statusSubtitle}>{subtitle}</Text>

        {/* Timer */}
        <Text style={styles.timer}>{formatDuration(duration)}</Text>

        {/* Record Button */}
        <RecordButton isRecording={isRecording} onPress={handleRecordPress} />

        {/* Action Buttons (after recording) */}
        {status === 'stopped' && recordingUri && (
          <View style={styles.actionRow}>
            {/* Playback Button */}
            <TouchableOpacity
              style={[styles.actionButton, isPlaying && styles.actionButtonActive]}
              onPress={playRecording}
            >
              <Text style={styles.actionIcon}>{isPlaying ? '⏸' : '▶️'}</Text>
              <Text style={styles.actionText}>
                {isPlaying ? 'Pause' : 'Play'}
              </Text>
            </TouchableOpacity>

            {/* Re-record Button */}
            <TouchableOpacity
              style={styles.actionButton}
              onPress={resetRecording}
            >
              <Text style={styles.actionIcon}>🔄</Text>
              <Text style={styles.actionText}>Re-record</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Debug: File URI */}
      {recordingUri && (
        <View style={styles.uriContainer}>
          <Text style={styles.uriLabel}>Recording File:</Text>
          <Text style={styles.uri} numberOfLines={2}>
            {recordingUri}
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  // ----- Permission State -----
  permissionBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  permissionIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  permissionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  permissionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 32,
  },
  permissionButton: {
    backgroundColor: '#6366F1',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  permissionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  // ----- Header -----
  header: {
    paddingTop: 20,
    paddingBottom: 12,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1F2937',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 4,
    fontWeight: '500',
  },
  // ----- Content -----
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    paddingHorizontal: 24,
  },
  statusLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
  },
  statusSubtitle: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: -12,
  },
  timer: {
    fontSize: 56,
    fontWeight: '200',
    color: '#1F2937',
    fontVariant: ['tabular-nums'],
    letterSpacing: 2,
  },
  // ----- Action Buttons -----
  actionRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 14,
    gap: 8,
    // Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  actionButtonActive: {
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#6366F1',
  },
  actionIcon: {
    fontSize: 18,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  // ----- URI Debug -----
  uriContainer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  uriLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  uri: {
    fontSize: 11,
    color: '#6B7280',
    backgroundColor: '#F3F4F6',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    overflow: 'hidden',
  },
});

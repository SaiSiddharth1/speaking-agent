import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, ScrollView } from 'react-native';

export default function SettingsScreen() {
  const [maleVoice, setMaleVoice] = useState(false);
  const [generalTopic, setGeneralTopic] = useState(true);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Preferences</Text>
      <View style={styles.row}>
        <Text style={styles.label}>Use Male Voice (TTS)</Text>
        <Switch value={maleVoice} onValueChange={setMaleVoice} />
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Focus on General Topics</Text>
        <Switch value={generalTopic} onValueChange={setGeneralTopic} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6', padding: 24 },
  title: { fontSize: 24, fontWeight: '700', color: '#111827', marginBottom: 24 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFF', padding: 16, borderRadius: 8, marginBottom: 12 },
  label: { fontSize: 16, color: '#374151' }
});

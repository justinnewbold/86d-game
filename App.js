import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet,
  SafeAreaView, StatusBar
} from 'react-native';

const colors = {
  background: '#0D0D0D', surface: '#1A1A1A', surfaceLight: '#252525',
  primary: '#F59E0B', accent: '#DC2626', success: '#10B981',
  textPrimary: '#FFFFFF', textSecondary: '#A3A3A3', textMuted: '#737373', border: '#333333',
};

export default function App() {
  const [counter, setCounter] = useState(0);
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.content}>
        <Text style={styles.title}>86'd</Text>
        <Text style={styles.subtitle}>Restaurant Business Simulator</Text>
        <Text style={styles.counter}>Test Counter: {counter}</Text>
        <TouchableOpacity 
          style={styles.button}
          onPress={() => setCounter(c => c + 1)}
        >
          <Text style={styles.buttonText}>TAP ME</Text>
        </TouchableOpacity>
        <Text style={styles.status}>✅ App is working!</Text>
        <Text style={styles.version}>Minimal Test v1.0</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },
  title: { fontSize: 72, fontWeight: '900', color: colors.primary, letterSpacing: -3 },
  subtitle: { fontSize: 16, color: colors.textSecondary, marginTop: 10 },
  counter: { fontSize: 24, color: colors.textPrimary, marginTop: 30 },
  button: { backgroundColor: colors.primary, paddingHorizontal: 40, paddingVertical: 16, borderRadius: 8, marginTop: 20 },
  buttonText: { color: colors.background, fontSize: 16, fontWeight: '700' },
  status: { fontSize: 18, color: colors.success, marginTop: 40 },
  version: { fontSize: 12, color: colors.textMuted, marginTop: 20 },
});

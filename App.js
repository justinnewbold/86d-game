import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar } from 'react-native';

const colors = {
  background: '#0D0D0D',
  surface: '#1A1A1A',
  primary: '#F59E0B',
  textPrimary: '#FFFFFF',
  textSecondary: '#A3A3A3',
};

export default function App() {
  const [screen, setScreen] = useState('welcome');
  const [cash, setCash] = useState(100000);

  if (screen === 'welcome') {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={styles.welcome}>
          <Text style={styles.title}>86'd</Text>
          <Text style={styles.subtitle}>Restaurant Business Simulator</Text>
          <Text style={styles.tagline}>"The restaurant business doesn't care about your dreams."</Text>
          <TouchableOpacity style={styles.button} onPress={() => setScreen('game')}>
            <Text style={styles.buttonText}>BUILD YOUR EMPIRE</Text>
          </TouchableOpacity>
          <Text style={styles.version}>v8.5.0 • Medium Test</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.welcome}>
        <Text style={styles.title}>Game Screen</Text>
        <Text style={styles.subtitle}>Cash: ${cash.toLocaleString()}</Text>
        <TouchableOpacity style={styles.button} onPress={() => setCash(c => c + 10000)}>
          <Text style={styles.buttonText}>ADD $10K</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, {backgroundColor: '#666'}]} onPress={() => setScreen('welcome')}>
          <Text style={styles.buttonText}>BACK</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  welcome: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 64, fontWeight: 'bold', color: colors.primary, marginBottom: 10 },
  subtitle: { fontSize: 18, color: colors.textSecondary, marginBottom: 20, textAlign: 'center' },
  tagline: { fontSize: 14, color: colors.textSecondary, fontStyle: 'italic', marginBottom: 40, textAlign: 'center' },
  button: { backgroundColor: colors.primary, paddingVertical: 16, paddingHorizontal: 32, borderRadius: 8, marginBottom: 10 },
  buttonText: { color: '#000', fontSize: 18, fontWeight: 'bold' },
  version: { marginTop: 20, color: colors.textSecondary, fontSize: 12 },
});

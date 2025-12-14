import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, TextInput, ScrollView, StyleSheet,
  SafeAreaView, StatusBar, Modal, Dimensions, ActivityIndicator, Animated,
} from 'react-native';

const { width } = Dimensions.get('window');

const colors = {
  background: '#0D0D0D', surface: '#1A1A1A', surfaceLight: '#252525',
  primary: '#F59E0B', accent: '#DC2626', success: '#10B981', warning: '#F97316',
  info: '#3B82F6', purple: '#8B5CF6', pink: '#EC4899', cyan: '#06B6D4',
  textPrimary: '#FFFFFF', textSecondary: '#A3A3A3', textMuted: '#737373', border: '#333333',
};

const formatCurrency = (v) => v >= 1000000 ? `$${(v/1000000).toFixed(1)}M` : v >= 1000 ? `$${(v/1000).toFixed(0)}K` : `$${Math.round(v).toLocaleString()}`;

const LOCATION_TYPES = [
  { id: 'downtown', name: 'Downtown', rent: 8000, traffic: 1.3 },
  { id: 'suburban', name: 'Suburban Strip', rent: 4500, traffic: 1.0 },
  { id: 'mall', name: 'Mall Food Court', rent: 6000, traffic: 1.4 },
];

const CONCEPTS = [
  { id: 'fast_casual', name: 'Fast Casual', icon: '🍔', baseRevenue: 15000, complexity: 1 },
  { id: 'casual_dining', name: 'Casual Dining', icon: '🍽️', baseRevenue: 25000, complexity: 1.3 },
  { id: 'fine_dining', name: 'Fine Dining', icon: '🥂', baseRevenue: 45000, complexity: 1.8 },
];

export default function App() {
  const [screen, setScreen] = useState('welcome');
  const [setup, setSetup] = useState({
    restaurantName: '',
    concept: 'fast_casual',
    location: 'suburban',
    capital: 150000,
  });

  // Welcome Screen
  if (screen === 'welcome') {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <ScrollView contentContainerStyle={styles.welcome}>
          <Text style={styles.welcomeTitle}>86'd</Text>
          <Text style={styles.welcomeSubtitle}>Restaurant Business Simulator</Text>
          <Text style={styles.welcomeTagline}>"The restaurant business doesn't care about your dreams."</Text>
          <TouchableOpacity style={styles.startButton} onPress={() => setScreen('setup')}>
            <Text style={styles.startButtonText}>BUILD YOUR EMPIRE</Text>
          </TouchableOpacity>
          <Text style={styles.version}>v8.5.0 • Phase 6 • Welcome Test</Text>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Setup Screen
  if (screen === 'setup') {
    const selectedConcept = CONCEPTS.find(c => c.id === setup.concept);
    const selectedLocation = LOCATION_TYPES.find(l => l.id === setup.location);
    
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <ScrollView style={styles.setupContainer}>
          <Text style={styles.setupTitle}>New Restaurant</Text>
          
          <Text style={styles.label}>Restaurant Name</Text>
          <TextInput
            style={styles.input}
            value={setup.restaurantName}
            onChangeText={(t) => setSetup(s => ({ ...s, restaurantName: t }))}
            placeholder="Enter name..."
            placeholderTextColor={colors.textMuted}
          />
          
          <Text style={styles.label}>Concept</Text>
          <View style={styles.optionRow}>
            {CONCEPTS.map(c => (
              <TouchableOpacity
                key={c.id}
                style={[styles.optionCard, setup.concept === c.id && styles.optionSelected]}
                onPress={() => setSetup(s => ({ ...s, concept: c.id }))}
              >
                <Text style={styles.optionIcon}>{c.icon}</Text>
                <Text style={styles.optionName}>{c.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <Text style={styles.label}>Location</Text>
          <View style={styles.optionRow}>
            {LOCATION_TYPES.map(l => (
              <TouchableOpacity
                key={l.id}
                style={[styles.optionCard, setup.location === l.id && styles.optionSelected]}
                onPress={() => setSetup(s => ({ ...s, location: l.id }))}
              >
                <Text style={styles.optionName}>{l.name}</Text>
                <Text style={styles.optionDetail}>{formatCurrency(l.rent)}/mo</Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <Text style={styles.label}>Starting Capital: {formatCurrency(setup.capital)}</Text>
          <TextInput
            style={[styles.input, {textAlign: 'center'}]}
            value={String(setup.capital)}
            onChangeText={(v) => setSetup(s => ({ ...s, capital: parseInt(v) || 50000 }))}
            keyboardType="numeric"
            placeholder="Starting Capital"
            placeholderTextColor={colors.textMuted}
          />
          
          <TouchableOpacity 
            style={[styles.startButton, !setup.restaurantName && styles.buttonDisabled]} 
            onPress={() => setScreen('game')}
            disabled={!setup.restaurantName}
          >
            <Text style={styles.startButtonText}>OPEN RESTAURANT</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.backButton} onPress={() => setScreen('welcome')}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Game Screen (placeholder)
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.welcome}>
        <Text style={styles.welcomeTitle}>{setup.restaurantName}</Text>
        <Text style={styles.welcomeSubtitle}>Cash: {formatCurrency(setup.capital)}</Text>
        <TouchableOpacity style={styles.startButton} onPress={() => setScreen('welcome')}>
          <Text style={styles.startButtonText}>RESTART</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  welcome: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, minHeight: 600 },
  welcomeTitle: { fontSize: 72, fontWeight: 'bold', color: colors.primary, marginBottom: 10 },
  welcomeSubtitle: { fontSize: 18, color: colors.textSecondary, marginBottom: 8 },
  welcomeTagline: { fontSize: 14, color: colors.textMuted, fontStyle: 'italic', marginBottom: 40, textAlign: 'center' },
  startButton: { backgroundColor: colors.primary, paddingVertical: 16, paddingHorizontal: 32, borderRadius: 8, marginBottom: 20 },
  startButtonText: { color: '#000', fontSize: 18, fontWeight: 'bold' },
  buttonDisabled: { opacity: 0.5 },
  version: { color: colors.textMuted, fontSize: 12 },
  setupContainer: { flex: 1, padding: 20 },
  setupTitle: { fontSize: 28, fontWeight: 'bold', color: colors.textPrimary, marginBottom: 20, textAlign: 'center' },
  label: { color: colors.textSecondary, fontSize: 14, marginBottom: 8, marginTop: 16 },
  input: { backgroundColor: colors.surface, borderRadius: 8, padding: 12, color: colors.textPrimary, fontSize: 16, borderWidth: 1, borderColor: colors.border },
  optionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  optionCard: { backgroundColor: colors.surface, borderRadius: 8, padding: 12, minWidth: 100, alignItems: 'center', borderWidth: 2, borderColor: 'transparent' },
  optionSelected: { borderColor: colors.primary },
  optionIcon: { fontSize: 24, marginBottom: 4 },
  optionName: { color: colors.textPrimary, fontSize: 12, fontWeight: '600' },
  optionDetail: { color: colors.textMuted, fontSize: 10 },
  backButton: { padding: 16, alignItems: 'center' },
  backButtonText: { color: colors.textSecondary, fontSize: 16 },
});

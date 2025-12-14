import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, TextInput, ScrollView, StyleSheet,
  SafeAreaView, StatusBar, Modal, Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');

const colors = {
  background: '#0D0D0D', surface: '#1A1A1A', surfaceLight: '#252525',
  primary: '#F59E0B', accent: '#DC2626', success: '#10B981', warning: '#F97316',
  info: '#3B82F6', purple: '#8B5CF6', pink: '#EC4899', cyan: '#06B6D4',
  textPrimary: '#FFFFFF', textSecondary: '#A3A3A3', textMuted: '#737373', border: '#333333',
};

const formatCurrency = (v) => v >= 1000000 ? `$${(v/1000000).toFixed(1)}M` : v >= 1000 ? `$${(v/1000).toFixed(0)}K` : `$${Math.round(v).toLocaleString()}`;

const CONCEPTS = [
  { id: 'fast_casual', name: 'Fast Casual', icon: '🍔', baseRevenue: 15000, laborNeed: 8 },
  { id: 'casual_dining', name: 'Casual Dining', icon: '🍽️', baseRevenue: 25000, laborNeed: 12 },
  { id: 'fine_dining', name: 'Fine Dining', icon: '🥂', baseRevenue: 45000, laborNeed: 18 },
];

const LOCATION_TYPES = [
  { id: 'downtown', name: 'Downtown', rent: 8000, traffic: 1.3 },
  { id: 'suburban', name: 'Suburban Strip', rent: 4500, traffic: 1.0 },
  { id: 'mall', name: 'Mall Food Court', rent: 6000, traffic: 1.4 },
];

const STAFF_ROLES = [
  { id: 'line_cook', name: 'Line Cook', wage: 16, skill: 1 },
  { id: 'prep_cook', name: 'Prep Cook', wage: 14, skill: 0.8 },
  { id: 'server', name: 'Server', wage: 12, skill: 1 },
  { id: 'dishwasher', name: 'Dishwasher', wage: 11, skill: 0.5 },
  { id: 'manager', name: 'Shift Manager', wage: 22, skill: 1.5 },
];

const SCENARIOS = [
  { id: 'health_inspection', title: '🏥 Health Inspection', description: 'The health inspector is here for a surprise visit.', choices: [
    { text: 'Be confident (you maintain standards)', cost: 0, risk: 0.2, outcome: 'Passed with flying colors!' },
    { text: 'Offer a "facility tour fee" ($500)', cost: 500, risk: 0.1, outcome: 'Inspector seemed satisfied.' },
  ]},
  { id: 'equipment_failure', title: '🔧 Equipment Breakdown', description: 'Your main fryer just died during the lunch rush.', choices: [
    { text: 'Emergency repair ($800)', cost: 800, risk: 0, outcome: 'Back in business within hours.' },
    { text: 'Buy used replacement ($1,500)', cost: 1500, risk: 0.1, outcome: 'Replacement installed.' },
  ]},
  { id: 'staff_drama', title: '😤 Staff Conflict', description: 'Two of your best employees are having a major disagreement.', choices: [
    { text: 'Mediate personally', cost: 0, risk: 0.3, outcome: 'Tensions eased... for now.' },
    { text: 'Let them work it out', cost: 0, risk: 0.5, outcome: 'Morale took a hit.' },
  ]},
];

const createInitialGameState = (setup) => ({
  week: 1,
  cash: setup.capital,
  reputation: 50,
  staff: [],
  weeklyRevenue: 0,
  weeklyExpenses: 0,
  totalRevenue: 0,
  isOpen: true,
  morale: 70,
});

export default function App() {
  const [screen, setScreen] = useState('welcome');
  const [setup, setSetup] = useState({
    restaurantName: '',
    concept: 'fast_casual',
    location: 'suburban',
    capital: 150000,
  });
  const [game, setGame] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [scenario, setScenario] = useState(null);
  const [notification, setNotification] = useState(null);

  const concept = CONCEPTS.find(c => c.id === setup.concept);
  const location = LOCATION_TYPES.find(l => l.id === setup.location);

  const startGame = () => {
    setGame(createInitialGameState(setup));
    setScreen('game');
  };

  const hireStaff = (roleId) => {
    const role = STAFF_ROLES.find(r => r.id === roleId);
    if (!role || game.cash < role.wage * 40) return;
    
    setGame(g => ({
      ...g,
      cash: g.cash - (role.wage * 40), // Hiring bonus
      staff: [...g.staff, { id: Date.now(), role: roleId, name: `${role.name} #${g.staff.length + 1}`, wage: role.wage, skill: role.skill, weeksEmployed: 0 }],
    }));
    showNotification(`Hired ${role.name}!`);
  };

  const fireStaff = (staffId) => {
    setGame(g => ({
      ...g,
      staff: g.staff.filter(s => s.id !== staffId),
      morale: Math.max(0, g.morale - 5),
    }));
    showNotification('Staff member let go.');
  };

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 2000);
  };

  const calculateWeeklyFinances = () => {
    const staffCount = game.staff.length;
    const laborCapacity = Math.min(1, staffCount / concept.laborNeed);
    const baseRevenue = concept.baseRevenue * location.traffic * laborCapacity;
    const reputationMult = 0.5 + (game.reputation / 100);
    const revenue = Math.round(baseRevenue * reputationMult * (0.9 + Math.random() * 0.2));
    
    const laborCost = game.staff.reduce((sum, s) => sum + s.wage * 40, 0);
    const rent = location.rent;
    const foodCost = Math.round(revenue * 0.32);
    const utilities = 800;
    const expenses = laborCost + rent + foodCost + utilities;
    
    return { revenue, expenses, laborCost, rent, foodCost, utilities, laborCapacity };
  };

  const advanceWeek = () => {
    // Random scenario (20% chance)
    if (Math.random() < 0.2 && !scenario) {
      const randomScenario = SCENARIOS[Math.floor(Math.random() * SCENARIOS.length)];
      setScenario(randomScenario);
      return;
    }

    const finances = calculateWeeklyFinances();
    const profit = finances.revenue - finances.expenses;

    setGame(g => ({
      ...g,
      week: g.week + 1,
      cash: g.cash + profit,
      weeklyRevenue: finances.revenue,
      weeklyExpenses: finances.expenses,
      totalRevenue: g.totalRevenue + finances.revenue,
      reputation: Math.min(100, Math.max(0, g.reputation + (profit > 0 ? 1 : -2))),
      staff: g.staff.map(s => ({ ...s, weeksEmployed: s.weeksEmployed + 1 })),
      isOpen: g.cash + profit > 0,
    }));

    if (game.cash + profit <= 0) {
      setScreen('gameover');
    }
  };

  const handleScenarioChoice = (choice) => {
    setGame(g => ({
      ...g,
      cash: g.cash - choice.cost,
      reputation: g.reputation + (Math.random() > choice.risk ? 2 : -5),
    }));
    showNotification(choice.outcome);
    setScenario(null);
  };

  // WELCOME SCREEN
  if (screen === 'welcome') {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <ScrollView contentContainerStyle={styles.welcome}>
          <Text style={styles.welcomeTitle}>86'd</Text>
          <Text style={styles.welcomeSubtitle}>Restaurant Business Simulator</Text>
          <Text style={styles.welcomeTagline}>"The restaurant business doesn't care about your dreams."</Text>
          <TouchableOpacity style={styles.primaryButton} onPress={() => setScreen('setup')}>
            <Text style={styles.primaryButtonText}>BUILD YOUR EMPIRE</Text>
          </TouchableOpacity>
          <Text style={styles.version}>v8.5.0 • 500-Line Test</Text>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // SETUP SCREEN
  if (screen === 'setup') {
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
          
          <TouchableOpacity 
            style={[styles.primaryButton, !setup.restaurantName && styles.buttonDisabled]} 
            onPress={startGame}
            disabled={!setup.restaurantName}
          >
            <Text style={styles.primaryButtonText}>OPEN RESTAURANT</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // GAME OVER SCREEN
  if (screen === 'gameover') {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={styles.welcome}>
          <Text style={styles.welcomeTitle}>86'd</Text>
          <Text style={styles.welcomeSubtitle}>Your restaurant has closed.</Text>
          <Text style={styles.stat}>Survived {game?.week || 0} weeks</Text>
          <Text style={styles.stat}>Total Revenue: {formatCurrency(game?.totalRevenue || 0)}</Text>
          <TouchableOpacity style={styles.primaryButton} onPress={() => { setGame(null); setScreen('welcome'); }}>
            <Text style={styles.primaryButtonText}>TRY AGAIN</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // GAME SCREEN
  if (!game) return null;
  const finances = calculateWeeklyFinances();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.restaurantName}>{setup.restaurantName}</Text>
          <Text style={styles.weekText}>Week {game.week}</Text>
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.cashText}>{formatCurrency(game.cash)}</Text>
          <Text style={styles.repText}>⭐ {game.reputation}</Text>
        </View>
      </View>

      {/* Notification */}
      {notification && (
        <View style={styles.notification}>
          <Text style={styles.notificationText}>{notification}</Text>
        </View>
      )}

      {/* Tabs */}
      <View style={styles.tabs}>
        {['overview', 'staff', 'finances'].map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <ScrollView style={styles.content}>
        {activeTab === 'overview' && (
          <View>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Weekly Summary</Text>
              <Text style={styles.stat}>Revenue: {formatCurrency(game.weeklyRevenue)}</Text>
              <Text style={styles.stat}>Expenses: {formatCurrency(game.weeklyExpenses)}</Text>
              <Text style={[styles.stat, { color: game.weeklyRevenue - game.weeklyExpenses >= 0 ? colors.success : colors.accent }]}>
                Profit: {formatCurrency(game.weeklyRevenue - game.weeklyExpenses)}
              </Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Status</Text>
              <Text style={styles.stat}>Staff: {game.staff.length} / {concept.laborNeed} needed</Text>
              <Text style={styles.stat}>Labor Capacity: {Math.round(finances.laborCapacity * 100)}%</Text>
              <Text style={styles.stat}>Morale: {game.morale}%</Text>
            </View>
          </View>
        )}

        {activeTab === 'staff' && (
          <View>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Hire Staff</Text>
              <View style={styles.optionRow}>
                {STAFF_ROLES.map(role => (
                  <TouchableOpacity
                    key={role.id}
                    style={styles.hireCard}
                    onPress={() => hireStaff(role.id)}
                  >
                    <Text style={styles.optionName}>{role.name}</Text>
                    <Text style={styles.optionDetail}>${role.wage}/hr</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Current Staff ({game.staff.length})</Text>
              {game.staff.length === 0 ? (
                <Text style={styles.emptyText}>No staff hired yet</Text>
              ) : (
                game.staff.map(s => (
                  <View key={s.id} style={styles.staffRow}>
                    <View>
                      <Text style={styles.staffName}>{s.name}</Text>
                      <Text style={styles.staffDetail}>${s.wage}/hr • {s.weeksEmployed} weeks</Text>
                    </View>
                    <TouchableOpacity onPress={() => fireStaff(s.id)}>
                      <Text style={styles.fireButton}>Fire</Text>
                    </TouchableOpacity>
                  </View>
                ))
              )}
            </View>
          </View>
        )}

        {activeTab === 'finances' && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Weekly Breakdown</Text>
            <Text style={[styles.stat, { color: colors.success }]}>Revenue: +{formatCurrency(finances.revenue)}</Text>
            <Text style={[styles.stat, { color: colors.accent }]}>Labor: -{formatCurrency(finances.laborCost)}</Text>
            <Text style={[styles.stat, { color: colors.accent }]}>Rent: -{formatCurrency(finances.rent)}</Text>
            <Text style={[styles.stat, { color: colors.accent }]}>Food Cost: -{formatCurrency(finances.foodCost)}</Text>
            <Text style={[styles.stat, { color: colors.accent }]}>Utilities: -{formatCurrency(finances.utilities)}</Text>
            <View style={styles.divider} />
            <Text style={[styles.stat, { fontWeight: 'bold', color: finances.revenue - finances.expenses >= 0 ? colors.success : colors.accent }]}>
              Net: {formatCurrency(finances.revenue - finances.expenses)}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Advance Week Button */}
      <TouchableOpacity style={styles.advanceButton} onPress={advanceWeek}>
        <Text style={styles.advanceButtonText}>ADVANCE WEEK →</Text>
      </TouchableOpacity>

      {/* Scenario Modal */}
      <Modal visible={!!scenario} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{scenario?.title}</Text>
            <Text style={styles.modalDescription}>{scenario?.description}</Text>
            {scenario?.choices.map((choice, i) => (
              <TouchableOpacity
                key={i}
                style={styles.choiceButton}
                onPress={() => handleScenarioChoice(choice)}
              >
                <Text style={styles.choiceText}>{choice.text}</Text>
                {choice.cost > 0 && <Text style={styles.choiceCost}>-{formatCurrency(choice.cost)}</Text>}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  welcome: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, minHeight: 600 },
  welcomeTitle: { fontSize: 72, fontWeight: 'bold', color: colors.primary, marginBottom: 10 },
  welcomeSubtitle: { fontSize: 18, color: colors.textSecondary, marginBottom: 8 },
  welcomeTagline: { fontSize: 14, color: colors.textMuted, fontStyle: 'italic', marginBottom: 40, textAlign: 'center' },
  primaryButton: { backgroundColor: colors.primary, paddingVertical: 16, paddingHorizontal: 32, borderRadius: 8, marginBottom: 20 },
  primaryButtonText: { color: '#000', fontSize: 18, fontWeight: 'bold' },
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
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border },
  restaurantName: { fontSize: 18, fontWeight: 'bold', color: colors.primary },
  weekText: { fontSize: 12, color: colors.textMuted },
  headerRight: { alignItems: 'flex-end' },
  cashText: { fontSize: 18, fontWeight: 'bold', color: colors.success },
  repText: { fontSize: 12, color: colors.primary },
  notification: { backgroundColor: colors.primary, padding: 10, alignItems: 'center' },
  notificationText: { color: '#000', fontWeight: '600' },
  tabs: { flexDirection: 'row', backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderBottomColor: colors.primary },
  tabText: { color: colors.textMuted, fontSize: 14 },
  tabTextActive: { color: colors.primary, fontWeight: '600' },
  content: { flex: 1, padding: 16 },
  card: { backgroundColor: colors.surface, borderRadius: 12, padding: 16, marginBottom: 16 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: colors.textPrimary, marginBottom: 12 },
  stat: { fontSize: 14, color: colors.textSecondary, marginBottom: 4 },
  emptyText: { color: colors.textMuted, fontStyle: 'italic' },
  hireCard: { backgroundColor: colors.surfaceLight, borderRadius: 8, padding: 12, minWidth: 100, alignItems: 'center' },
  staffRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.border },
  staffName: { color: colors.textPrimary, fontWeight: '600' },
  staffDetail: { color: colors.textMuted, fontSize: 12 },
  fireButton: { color: colors.accent, fontWeight: '600' },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 8 },
  advanceButton: { backgroundColor: colors.primary, padding: 16, alignItems: 'center', margin: 16, borderRadius: 8 },
  advanceButtonText: { color: '#000', fontSize: 16, fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { backgroundColor: colors.surface, borderRadius: 16, padding: 24, width: '100%', maxWidth: 400 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: colors.textPrimary, marginBottom: 12 },
  modalDescription: { fontSize: 14, color: colors.textSecondary, marginBottom: 20 },
  choiceButton: { backgroundColor: colors.surfaceLight, borderRadius: 8, padding: 16, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between' },
  choiceText: { color: colors.textPrimary, flex: 1 },
  choiceCost: { color: colors.accent, fontWeight: '600' },
});

// ============================================
// WELCOME SCREEN COMPONENT
// ============================================

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { useGameStore } from '../stores/gameStore';
import { DIFFICULTY_MODES } from '../constants';

// Alias for backwards compatibility
const DIFFICULTY_LEVELS = DIFFICULTY_MODES;
import { AccessibleButton, AccessibleText, announceForAccessibility } from '../components/common/A11yWrapper';

// Get colors from theme
const colors = {
  background: '#0F172A',
  card: '#1E293B',
  primary: '#F59E0B',
  accent: '#DC2626',
  success: '#10B981',
  text: '#F8FAFC',
  textSecondary: '#94A3B8',
  border: '#334155',
};

const { width } = Dimensions.get('window');

interface WelcomeScreenProps {
  onStartGame: () => void;
  onLoadGame: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onStartGame,
  onLoadGame,
}) => {
  const { savedGames, setSetup, setup } = useGameStore();
  const [fadeAnim] = useState(new Animated.Value(0));
  const [selectedDifficulty, setSelectedDifficulty] = useState(setup.difficulty);

  useEffect(() => {
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    // Announce screen for accessibility
    announceForAccessibility('Welcome to 86\'d Restaurant Simulator. Choose your difficulty and start a new game, or load a saved game.');
  }, [fadeAnim]);

  const handleDifficultySelect = (difficultyId: string) => {
    setSelectedDifficulty(difficultyId);
    setSetup((prev) => ({ ...prev, difficulty: difficultyId }));

    const difficulty = DIFFICULTY_LEVELS.find((d) => d.id === difficultyId);
    if (difficulty) {
      announceForAccessibility(`Selected ${difficulty.name} difficulty: ${difficulty.description}`);
    }
  };

  const handleStartGame = () => {
    announceForAccessibility('Starting new game. Navigating to restaurant setup.');
    onStartGame();
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      accessible={false}
    >
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* Logo and Title */}
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>86'd</Text>
          <AccessibleText style={styles.tagline} role="text">
            Restaurant Business Simulator
          </AccessibleText>
        </View>

        {/* Description */}
        <View style={styles.descriptionContainer}>
          <AccessibleText style={styles.description} role="text">
            Build your restaurant empire from the ground up. Manage staff, control costs,
            and make the tough decisions that separate successful restaurateurs from those who get 86'd.
          </AccessibleText>
        </View>

        {/* Difficulty Selection */}
        <View style={styles.section}>
          <AccessibleText style={styles.sectionTitle} role="header" level={2}>
            Select Difficulty
          </AccessibleText>
          <View style={styles.difficultyGrid}>
            {DIFFICULTY_LEVELS.map((difficulty) => (
              <TouchableOpacity
                key={difficulty.id}
                style={[
                  styles.difficultyCard,
                  selectedDifficulty === difficulty.id && styles.difficultyCardSelected,
                ]}
                onPress={() => handleDifficultySelect(difficulty.id)}
                accessible={true}
                accessibilityLabel={`${difficulty.name} difficulty`}
                accessibilityHint={difficulty.description}
                accessibilityRole="button"
                accessibilityState={{ selected: selectedDifficulty === difficulty.id }}
              >
                <Text style={styles.difficultyIcon}>{difficulty.icon}</Text>
                <Text style={styles.difficultyName}>{difficulty.name}</Text>
                <Text style={styles.difficultyDesc}>{difficulty.description}</Text>
                {selectedDifficulty === difficulty.id && (
                  <View style={styles.selectedIndicator}>
                    <Text style={styles.selectedText}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <AccessibleButton
            onPress={handleStartGame}
            label="Start New Game"
            hint="Begin a new restaurant journey"
            style={styles.primaryButton}
            textStyle={styles.primaryButtonText}
          />

          {savedGames.length > 0 && (
            <AccessibleButton
              onPress={onLoadGame}
              label={`Load Game (${savedGames.length} saved)`}
              hint="Continue from a previously saved game"
              style={styles.secondaryButton}
              textStyle={styles.secondaryButtonText}
            />
          )}
        </View>

        {/* Credits */}
        <View style={styles.credits}>
          <AccessibleText style={styles.creditsText} role="text">
            Created by Justin Newbold
          </AccessibleText>
          <AccessibleText style={styles.creditsSubtext} role="text">
            Owner of Patty Shack burger chain
          </AccessibleText>
        </View>

        {/* Version Info */}
        <AccessibleText style={styles.version} role="text">
          v2.4.0
        </AccessibleText>
      </Animated.View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    flexGrow: 1,
    padding: 20,
    alignItems: 'center',
  },
  content: {
    width: '100%',
    maxWidth: 600,
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 20,
  },
  logo: {
    fontSize: 72,
    fontWeight: '900',
    color: colors.primary,
    textShadowColor: 'rgba(245, 158, 11, 0.3)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 10,
  },
  tagline: {
    fontSize: 18,
    color: colors.textSecondary,
    marginTop: 8,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  descriptionContainer: {
    marginVertical: 24,
    paddingHorizontal: 20,
  },
  description: {
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
    lineHeight: 24,
  },
  section: {
    width: '100%',
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  difficultyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  difficultyCard: {
    width: width > 500 ? '45%' : '100%',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
    minHeight: 44, // Minimum touch target
  },
  difficultyCardSelected: {
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}15`,
  },
  difficultyIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  difficultyName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  difficultyDesc: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  selectedIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedText: {
    color: '#000',
    fontWeight: '700',
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
    marginTop: 24,
  },
  primaryButton: {
    width: '100%',
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    minHeight: 56,
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },
  secondaryButton: {
    width: '100%',
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.border,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    minHeight: 56,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  credits: {
    marginTop: 40,
    alignItems: 'center',
  },
  creditsText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  creditsSubtext: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
    fontStyle: 'italic',
  },
  version: {
    marginTop: 16,
    fontSize: 12,
    color: colors.border,
  },
});

export default WelcomeScreen;

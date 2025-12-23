// ============================================
// GAME END SCREEN COMPONENT
// Handles both Win and Game Over states
// ============================================

import React, { memo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
} from 'react-native';
import { colors, ACHIEVEMENTS } from '../constants';
import { StatRow, Divider, PrimaryButton, SecondaryButton } from '../components/ui';
import { AccessibleText, AccessibleButton, announceForAccessibility } from '../components/common/A11yWrapper';

// Format helper
const formatCurrency = (v: number): string =>
  v >= 1000000 ? `$${(v / 1000000).toFixed(1)}M` : v >= 1000 ? `$${(v / 1000).toFixed(0)}K` : `$${Math.round(v).toLocaleString()}`;

// Types
interface GameState {
  week: number;
  locations: Array<{ id: string; name: string }>;
  franchises: Array<{ id: string }>;
  empireValuation: number;
  totalRevenue: number;
  achievements: string[];
  stats?: {
    peakWeeklyRevenue?: number;
    employeesHired?: number;
    locationsOpened?: number;
    locationsClosed?: number;
  };
}

interface GameEndScreenProps {
  isWin: boolean;
  game: GameState | null;
  onRestart: () => void;
  onNewGamePlus?: () => void;
  onOpenAIChat?: () => void;
}

// ============================================
// STATS DISPLAY COMPONENT
// ============================================

interface GameStatsProps {
  game: GameState;
  isWin: boolean;
}

const GameStats = memo<GameStatsProps>(({ game, isWin }) => {
  const totalUnits = (game.locations?.length || 0) + (game.franchises?.length || 0);
  const achievementCount = game.achievements?.length || 0;
  const totalAchievements = Object.keys(ACHIEVEMENTS).length;

  return (
    <View style={styles.statsContainer}>
      <StatRow label="Weeks Survived" value={game.week} />
      <StatRow label="Locations Owned" value={game.locations?.length || 0} />
      <StatRow label="Franchises" value={game.franchises?.length || 0} />
      <StatRow label="Total Units" value={totalUnits} />
      <StatRow
        label="Empire Valuation"
        value={formatCurrency(game.empireValuation || 0)}
        valueColor={colors.success}
      />
      <StatRow
        label="Total Revenue"
        value={formatCurrency(game.totalRevenue || 0)}
      />
      <StatRow
        label="Achievements"
        value={`${achievementCount}/${totalAchievements}`}
        valueColor={achievementCount > 0 ? colors.primary : colors.textSecondary}
      />
      {game.stats?.peakWeeklyRevenue && (
        <StatRow
          label="Peak Weekly Revenue"
          value={formatCurrency(game.stats.peakWeeklyRevenue)}
        />
      )}
      {game.stats?.employeesHired && (
        <StatRow
          label="Total Employees Hired"
          value={game.stats.employeesHired}
        />
      )}
    </View>
  );
});

// ============================================
// WIN CONTENT
// ============================================

const WinContent = memo(() => (
  <>
    <Text style={styles.icon}>🏆</Text>
    <Text
      style={[styles.title, { color: colors.success }]}
      accessible={true}
      accessibilityRole="header"
    >
      EMPIRE BUILT!
    </Text>
    <AccessibleText style={styles.subtitle} role="text">
      You achieved your goal
    </AccessibleText>
    <Divider color={colors.success} style={styles.divider} />
  </>
));

// ============================================
// GAME OVER CONTENT
// ============================================

const GameOverContent = memo(() => (
  <>
    <Text style={styles.icon}>💀</Text>
    <Text
      style={[styles.title, { color: colors.accent }]}
      accessible={true}
      accessibilityRole="header"
    >
      86'd
    </Text>
    <AccessibleText style={styles.subtitle} role="text">
      Your empire has collapsed
    </AccessibleText>
    <Divider color={colors.accent} style={styles.divider} />
  </>
));

// ============================================
// MAIN COMPONENT
// ============================================

export const GameEndScreen: React.FC<GameEndScreenProps> = ({
  isWin,
  game,
  onRestart,
  onNewGamePlus,
  onOpenAIChat,
}) => {
  // Announce screen for accessibility
  React.useEffect(() => {
    const message = isWin
      ? 'Congratulations! You have built your restaurant empire!'
      : 'Game over. Your restaurant empire has collapsed.';
    announceForAccessibility(message);
  }, [isWin]);

  const handleRestart = useCallback(() => {
    announceForAccessibility('Starting new game');
    onRestart();
  }, [onRestart]);

  const handleNewGamePlus = useCallback(() => {
    if (onNewGamePlus) {
      announceForAccessibility('Starting New Game Plus with prestige bonuses');
      onNewGamePlus();
    }
  }, [onNewGamePlus]);

  if (!game) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={styles.content}>
          <Text style={styles.subtitle}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          {/* Header */}
          {isWin ? <WinContent /> : <GameOverContent />}

          {/* Stats */}
          <GameStats game={game} isWin={isWin} />

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.restartButton, { backgroundColor: isWin ? colors.success : colors.primary }]}
              onPress={handleRestart}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={isWin ? 'Play again' : 'Try again'}
            >
              <Text style={styles.restartButtonText}>
                {isWin ? 'PLAY AGAIN' : 'TRY AGAIN'}
              </Text>
            </TouchableOpacity>

            {onNewGamePlus && isWin && (
              <TouchableOpacity
                style={styles.newGamePlusButton}
                onPress={handleNewGamePlus}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Start New Game Plus with prestige bonuses"
              >
                <Text style={styles.newGamePlusButtonText}>NEW GAME+</Text>
                <Text style={styles.newGamePlusSubtext}>Keep prestige bonuses</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* AI Chat Prompt */}
          {onOpenAIChat && (
            <TouchableOpacity
              style={styles.aiChatPrompt}
              onPress={onOpenAIChat}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={isWin ? 'Celebrate with Chef Marcus' : 'Debrief with Chef Marcus'}
            >
              <Text style={styles.aiChatIcon}>👨‍🍳</Text>
              <View style={styles.aiChatTextContainer}>
                <Text style={styles.aiChatTitle}>
                  {isWin ? 'Celebrate with Chef Marcus' : 'Debrief with Chef Marcus'}
                </Text>
                <Text style={styles.aiChatSubtitle}>
                  {isWin
                    ? 'Discuss your success and plan your next empire'
                    : 'Learn what went wrong and how to improve'}
                </Text>
              </View>
            </TouchableOpacity>
          )}

          {/* Motivational Quote */}
          <View style={styles.quoteContainer}>
            <Text style={styles.quote}>
              {isWin
                ? '"Success in the restaurant business isn\'t about the destination - it\'s about the journey and the lessons learned along the way."'
                : '"Every failed restaurant teaches lessons that successful ones can\'t. The question is: will you apply them?"'}
            </Text>
            <Text style={styles.quoteAuthor}>— Chef Marcus</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 80,
    marginBottom: 16,
  },
  title: {
    fontSize: 36,
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: 8,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 18,
    marginBottom: 8,
  },
  divider: {
    width: 100,
    height: 3,
    marginVertical: 24,
  },
  statsContainer: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 400,
    gap: 12,
  },
  restartButton: {
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  restartButtonText: {
    color: colors.background,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 1,
  },
  newGamePlusButton: {
    backgroundColor: colors.purple,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  newGamePlusButtonText: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  newGamePlusSubtext: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 4,
  },
  aiChatPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceLight,
    padding: 16,
    borderRadius: 12,
    marginTop: 24,
    width: '100%',
    maxWidth: 400,
  },
  aiChatIcon: {
    fontSize: 40,
    marginRight: 16,
  },
  aiChatTextContainer: {
    flex: 1,
  },
  aiChatTitle: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  aiChatSubtitle: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 4,
  },
  quoteContainer: {
    marginTop: 32,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  quote: {
    color: colors.textMuted,
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 22,
  },
  quoteAuthor: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 8,
  },
});

export default GameEndScreen;

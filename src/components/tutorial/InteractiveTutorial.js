// ============================================
// INTERACTIVE TUTORIAL COMPONENT
// ============================================
// Step-by-step guided tutorial with tooltips

import React, { memo, useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  Modal,
} from 'react-native';

const { width, height } = Dimensions.get('window');

// Tutorial steps configuration
const TUTORIAL_STEPS = [
  {
    id: 'welcome',
    title: 'Welcome to 86\'d!',
    message: 'Let\'s walk through the basics of running your restaurant empire. This tutorial will teach you everything you need to know.',
    target: null,
    position: 'center',
    icon: '👋',
  },
  {
    id: 'dashboard',
    title: 'Your Dashboard',
    message: 'This is your main dashboard. Here you can see your restaurant\'s key metrics at a glance - cash, reputation, and staff morale.',
    target: 'dashboard',
    position: 'bottom',
    icon: '📊',
  },
  {
    id: 'advance_week',
    title: 'Advancing Time',
    message: 'Tap the "ADVANCE WEEK" button to progress time. Each week, your restaurant will serve customers and generate revenue.',
    target: 'advanceWeekButton',
    position: 'top',
    highlight: true,
    icon: '⏩',
  },
  {
    id: 'staff_tab',
    title: 'Managing Staff',
    message: 'The Staff tab lets you hire, train, and manage your team. Good staff means better service and happier customers!',
    target: 'staffTab',
    position: 'top',
    icon: '👨‍🍳',
  },
  {
    id: 'hire_staff',
    title: 'Hiring Staff',
    message: 'Tap "HIRE STAFF" to see available candidates. Look for high skill levels, but balance it with their wage demands.',
    target: 'hireButton',
    position: 'top',
    icon: '➕',
  },
  {
    id: 'ops_tab',
    title: 'Operations',
    message: 'The Ops tab is where you manage your menu, equipment, and upgrades. 86 items that aren\'t selling well!',
    target: 'opsTab',
    position: 'top',
    icon: '🍽️',
  },
  {
    id: 'menu_management',
    title: 'Your Menu',
    message: 'Tap any menu item to "86" it (remove from availability). Use this strategically to manage inventory and focus on profitable items.',
    target: 'menuSection',
    position: 'top',
    icon: '📋',
  },
  {
    id: 'finance_tab',
    title: 'Finances',
    message: 'The Finance tab shows detailed financial data. You can also take out loans here if you need capital for expansion.',
    target: 'financeTab',
    position: 'top',
    icon: '💰',
  },
  {
    id: 'empire_tab',
    title: 'Empire Building',
    message: 'Once you\'re profitable, use the Empire tab to open new locations, sell franchises, and build your restaurant empire!',
    target: 'empireTab',
    position: 'top',
    icon: '🏰',
  },
  {
    id: 'ai_mentor',
    title: 'Meet Chef Marcus',
    message: 'I\'m Chef Marcus, your AI mentor. I\'ll pop up with advice and tips as you play. Don\'t hesitate to make bold moves - that\'s how empires are built!',
    target: 'aiMentor',
    position: 'top',
    icon: '👨‍🍳',
  },
  {
    id: 'complete',
    title: 'You\'re Ready!',
    message: 'That\'s the basics! Remember: keep your staff happy, customers happier, and always watch your cash flow. Good luck, chef!',
    target: null,
    position: 'center',
    icon: '🎉',
  },
];

const InteractiveTutorial = memo(function InteractiveTutorial({
  isActive,
  currentStep,
  onNextStep,
  onPrevStep,
  onSkip,
  onComplete,
  targetRefs, // Map of element refs for highlighting
}) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  const step = TUTORIAL_STEPS[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === TUTORIAL_STEPS.length - 1;

  useEffect(() => {
    if (isActive) {
      // Animate in
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          speed: 12,
          bounciness: 6,
          useNativeDriver: true,
        }),
      ]).start();

      // Start pulse animation for highlight
      if (step?.highlight) {
        Animated.loop(
          Animated.sequence([
            Animated.timing(pulseAnim, {
              toValue: 1.05,
              duration: 500,
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnim, {
              toValue: 1,
              duration: 500,
              useNativeDriver: true,
            }),
          ])
        ).start();
      }
    } else {
      fadeAnim.setValue(0);
      slideAnim.setValue(50);
    }
  }, [isActive, currentStep]);

  const handleNext = useCallback(() => {
    if (isLastStep) {
      onComplete?.();
    } else {
      // Animate out then in
      Animated.timing(slideAnim, {
        toValue: -50,
        duration: 150,
        useNativeDriver: true,
      }).start(() => {
        slideAnim.setValue(50);
        onNextStep?.();
      });
    }
  }, [isLastStep, onComplete, onNextStep]);

  const handlePrev = useCallback(() => {
    Animated.timing(slideAnim, {
      toValue: 50,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      slideAnim.setValue(-50);
      onPrevStep?.();
    });
  }, [onPrevStep]);

  if (!isActive || !step) {
    return null;
  }

  return (
    <Modal visible={isActive} transparent animationType="none">
      {/* Backdrop */}
      <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
        <TouchableOpacity
          style={styles.backdropTouch}
          onPress={onSkip}
          activeOpacity={1}
          accessible={true}
          accessibilityLabel="Tap to skip tutorial"
        />
      </Animated.View>

      {/* Tooltip */}
      <Animated.View
        style={[
          styles.tooltipContainer,
          step.position === 'center' && styles.tooltipCenter,
          step.position === 'top' && styles.tooltipTop,
          step.position === 'bottom' && styles.tooltipBottom,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <View style={styles.tooltip}>
          {/* Icon */}
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>{step.icon}</Text>
          </View>

          {/* Content */}
          <View style={styles.content}>
            <Text style={styles.title}>{step.title}</Text>
            <Text style={styles.message}>{step.message}</Text>
          </View>

          {/* Progress */}
          <View style={styles.progressContainer}>
            <View style={styles.progressDots}>
              {TUTORIAL_STEPS.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.dot,
                    index === currentStep && styles.dotActive,
                    index < currentStep && styles.dotCompleted,
                  ]}
                />
              ))}
            </View>
            <Text style={styles.progressText}>
              {currentStep + 1} / {TUTORIAL_STEPS.length}
            </Text>
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            {!isFirstStep && (
              <TouchableOpacity
                style={styles.prevButton}
                onPress={handlePrev}
                accessible={true}
                accessibilityLabel="Previous tip"
                accessibilityRole="button"
              >
                <Text style={styles.prevButtonText}>← Back</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.skipButton}
              onPress={onSkip}
              accessible={true}
              accessibilityLabel="Skip tutorial"
              accessibilityRole="button"
            >
              <Text style={styles.skipButtonText}>Skip</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.nextButton}
              onPress={handleNext}
              accessible={true}
              accessibilityLabel={isLastStep ? 'Complete tutorial' : 'Next tip'}
              accessibilityRole="button"
            >
              <Text style={styles.nextButtonText}>
                {isLastStep ? 'Start Playing!' : 'Next →'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    </Modal>
  );
});

// Tooltip that can be shown contextually during gameplay
const TutorialTip = memo(function TutorialTip({
  visible,
  message,
  position = 'bottom',
  onDismiss,
  autoHide = true,
  duration = 5000,
}) {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();

      if (autoHide) {
        const timer = setTimeout(() => {
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }).start(() => onDismiss?.());
        }, duration);

        return () => clearTimeout(timer);
      }
    } else {
      fadeAnim.setValue(0);
    }
  }, [visible, autoHide, duration]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.tipContainer,
        position === 'top' && styles.tipTop,
        position === 'bottom' && styles.tipBottom,
        { opacity: fadeAnim },
      ]}
    >
      <TouchableOpacity
        style={styles.tip}
        onPress={onDismiss}
        accessible={true}
        accessibilityLabel={`Tip: ${message}. Tap to dismiss.`}
      >
        <Text style={styles.tipIcon}>💡</Text>
        <Text style={styles.tipText}>{message}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
  },
  backdropTouch: {
    flex: 1,
  },
  tooltipContainer: {
    position: 'absolute',
    left: 16,
    right: 16,
  },
  tooltipCenter: {
    top: '50%',
    transform: [{ translateY: -150 }],
  },
  tooltipTop: {
    top: 100,
  },
  tooltipBottom: {
    bottom: 100,
  },
  tooltip: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#F59E0B',
    padding: 20,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  icon: {
    fontSize: 48,
  },
  content: {
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 15,
    color: '#A3A3A3',
    textAlign: 'center',
    lineHeight: 22,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    gap: 12,
  },
  progressDots: {
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#333333',
  },
  dotActive: {
    backgroundColor: '#F59E0B',
    transform: [{ scale: 1.2 }],
  },
  dotCompleted: {
    backgroundColor: '#10B981',
  },
  progressText: {
    color: '#737373',
    fontSize: 12,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  prevButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  prevButtonText: {
    color: '#A3A3A3',
    fontSize: 14,
    fontWeight: '500',
  },
  skipButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  skipButtonText: {
    color: '#737373',
    fontSize: 14,
  },
  nextButton: {
    backgroundColor: '#F59E0B',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  // Contextual tip styles
  tipContainer: {
    position: 'absolute',
    left: 16,
    right: 16,
  },
  tipTop: {
    top: 80,
  },
  tipBottom: {
    bottom: 80,
  },
  tip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#252525',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
    padding: 12,
    gap: 10,
  },
  tipIcon: {
    fontSize: 20,
  },
  tipText: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 13,
  },
});

export { InteractiveTutorial, TutorialTip, TUTORIAL_STEPS };

// ============================================
// ENHANCED INTERACTIVE TUTORIAL COMPONENT
// ============================================

import React, { useState, useEffect, useRef, memo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Modal,
  Dimensions,
  Platform,
} from 'react-native';
import { colors } from '../../constants';
import { playSound, triggerHaptic } from '../../services/soundManager';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Tutorial step definition
export interface TutorialStep {
  id: string;
  title: string;
  message: string;
  target?: string; // Element ID to highlight
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  action?: 'tap' | 'swipe' | 'type' | 'wait';
  tip?: string;
  image?: string;
  skipable?: boolean;
  onEnter?: () => void;
  onExit?: () => void;
}

// Tutorial configuration
export interface TutorialConfig {
  steps: TutorialStep[];
  onComplete: () => void;
  onSkip?: () => void;
  showProgress?: boolean;
  allowSkip?: boolean;
}

interface InteractiveTutorialProps {
  config: TutorialConfig;
  visible: boolean;
  currentStep?: number;
  onStepChange?: (step: number) => void;
}

// ============================================
// SPOTLIGHT OVERLAY
// ============================================

interface SpotlightProps {
  targetRect?: { x: number; y: number; width: number; height: number };
  visible: boolean;
}

const Spotlight = memo<SpotlightProps>(({ targetRect, visible }) => {
  if (!visible || !targetRect) return null;

  // Create a "hole" in the overlay for the target element
  const padding = 8;

  return (
    <View style={styles.spotlightContainer} pointerEvents="none">
      {/* Top section */}
      <View style={[styles.spotlightDim, { height: targetRect.y - padding }]} />

      {/* Middle section */}
      <View style={styles.spotlightMiddle}>
        {/* Left */}
        <View style={[styles.spotlightDim, { width: targetRect.x - padding }]} />
        {/* Hole */}
        <View
          style={[
            styles.spotlightHole,
            {
              width: targetRect.width + padding * 2,
              height: targetRect.height + padding * 2,
            },
          ]}
        />
        {/* Right */}
        <View style={styles.spotlightDim} />
      </View>

      {/* Bottom section */}
      <View style={styles.spotlightDim} />
    </View>
  );
});

// ============================================
// TOOLTIP BUBBLE
// ============================================

interface TooltipProps {
  step: TutorialStep;
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
  currentStep: number;
  totalSteps: number;
  showProgress: boolean;
  allowSkip: boolean;
}

const Tooltip = memo<TooltipProps>(({
  step,
  position,
  onNext,
  onPrev,
  onSkip,
  currentStep,
  totalSteps,
  showProgress,
  allowSkip,
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 8,
      tension: 40,
      useNativeDriver: true,
    }).start();

    // Pulse animation for action hints
    if (step.action) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }

    return () => {
      scaleAnim.setValue(0);
    };
  }, [step, scaleAnim, pulseAnim]);

  const getPositionStyle = () => {
    switch (position) {
      case 'top':
        return { bottom: SCREEN_HEIGHT * 0.6 };
      case 'bottom':
        return { top: SCREEN_HEIGHT * 0.6 };
      case 'center':
      default:
        return { top: SCREEN_HEIGHT * 0.3 };
    }
  };

  const getActionIcon = () => {
    switch (step.action) {
      case 'tap':
        return '👆';
      case 'swipe':
        return '👈';
      case 'type':
        return '⌨️';
      default:
        return null;
    }
  };

  return (
    <Animated.View
      style={[
        styles.tooltip,
        getPositionStyle(),
        { transform: [{ scale: scaleAnim }] },
      ]}
    >
      {/* Progress indicator */}
      {showProgress && (
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${((currentStep + 1) / totalSteps) * 100}%` },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {currentStep + 1} / {totalSteps}
          </Text>
        </View>
      )}

      {/* Title */}
      <Text style={styles.tooltipTitle}>{step.title}</Text>

      {/* Message */}
      <Text style={styles.tooltipMessage}>{step.message}</Text>

      {/* Action hint */}
      {step.action && (
        <Animated.View
          style={[styles.actionHint, { transform: [{ scale: pulseAnim }] }]}
        >
          <Text style={styles.actionIcon}>{getActionIcon()}</Text>
          <Text style={styles.actionText}>
            {step.action === 'tap' && 'Tap to continue'}
            {step.action === 'swipe' && 'Swipe to see more'}
            {step.action === 'type' && 'Enter your input'}
            {step.action === 'wait' && 'Please wait...'}
          </Text>
        </Animated.View>
      )}

      {/* Tip */}
      {step.tip && (
        <View style={styles.tipContainer}>
          <Text style={styles.tipIcon}>💡</Text>
          <Text style={styles.tipText}>{step.tip}</Text>
        </View>
      )}

      {/* Navigation buttons */}
      <View style={styles.buttonContainer}>
        {currentStep > 0 && (
          <TouchableOpacity style={styles.prevButton} onPress={onPrev}>
            <Text style={styles.prevButtonText}>← Back</Text>
          </TouchableOpacity>
        )}

        <View style={styles.buttonSpacer} />

        {allowSkip && step.skipable !== false && (
          <TouchableOpacity style={styles.skipButton} onPress={onSkip}>
            <Text style={styles.skipButtonText}>Skip Tutorial</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.nextButton} onPress={onNext}>
          <Text style={styles.nextButtonText}>
            {currentStep === totalSteps - 1 ? "Let's Go!" : 'Next →'}
          </Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
});

// ============================================
// MAIN COMPONENT
// ============================================

export const InteractiveTutorialV2: React.FC<InteractiveTutorialProps> = ({
  config,
  visible,
  currentStep: controlledStep,
  onStepChange,
}) => {
  const [internalStep, setInternalStep] = useState(0);
  const currentStep = controlledStep ?? internalStep;

  const step = config.steps[currentStep];

  const handleNext = useCallback(() => {
    playSound('click');
    triggerHaptic('light');

    step?.onExit?.();

    if (currentStep < config.steps.length - 1) {
      const nextStep = currentStep + 1;
      setInternalStep(nextStep);
      onStepChange?.(nextStep);
      config.steps[nextStep]?.onEnter?.();
    } else {
      config.onComplete();
    }
  }, [currentStep, config, step, onStepChange]);

  const handlePrev = useCallback(() => {
    playSound('click');
    triggerHaptic('light');

    if (currentStep > 0) {
      step?.onExit?.();
      const prevStep = currentStep - 1;
      setInternalStep(prevStep);
      onStepChange?.(prevStep);
      config.steps[prevStep]?.onEnter?.();
    }
  }, [currentStep, config, step, onStepChange]);

  const handleSkip = useCallback(() => {
    playSound('click');
    config.onSkip?.();
    config.onComplete();
  }, [config]);

  // Call onEnter for first step
  useEffect(() => {
    if (visible && currentStep === 0) {
      config.steps[0]?.onEnter?.();
    }
  }, [visible, config.steps, currentStep]);

  if (!visible || !step) return null;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.container}>
        {/* Dim overlay */}
        <View style={styles.overlay} />

        {/* Spotlight (if targeting an element) */}
        {step.target && (
          <Spotlight
            targetRect={undefined} // Would need to measure actual element
            visible={true}
          />
        )}

        {/* Tooltip */}
        <Tooltip
          step={step}
          position={step.position || 'center'}
          onNext={handleNext}
          onPrev={handlePrev}
          onSkip={handleSkip}
          currentStep={currentStep}
          totalSteps={config.steps.length}
          showProgress={config.showProgress ?? true}
          allowSkip={config.allowSkip ?? true}
        />
      </View>
    </Modal>
  );
};

// ============================================
// CONTEXTUAL TIP COMPONENT
// ============================================

interface ContextualTipProps {
  tip: string;
  visible: boolean;
  onDismiss: () => void;
  position?: { top?: number; bottom?: number; left?: number; right?: number };
}

export const ContextualTip = memo<ContextualTipProps>(({
  tip,
  visible,
  onDismiss,
  position,
}) => {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, opacity]);

  if (!visible) return null;

  return (
    <Animated.View style={[styles.contextualTip, position, { opacity }]}>
      <TouchableOpacity onPress={onDismiss} style={styles.contextualTipContent}>
        <Text style={styles.contextualTipIcon}>💡</Text>
        <Text style={styles.contextualTipText}>{tip}</Text>
        <Text style={styles.contextualTipDismiss}>✕</Text>
      </TouchableOpacity>
    </Animated.View>
  );
});

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
  },
  spotlightContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  spotlightDim: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
  },
  spotlightMiddle: {
    flexDirection: 'row',
  },
  spotlightHole: {
    backgroundColor: 'transparent',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  tooltip: {
    position: 'absolute',
    left: 20,
    right: 20,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 24,
    borderWidth: 2,
    borderColor: colors.primary,
    ...Platform.select({
      web: {
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
      },
      default: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 10,
      },
    }),
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: colors.surfaceLight,
    borderRadius: 2,
    marginRight: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  progressText: {
    color: colors.textMuted,
    fontSize: 12,
  },
  tooltipTitle: {
    color: colors.primary,
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 12,
  },
  tooltipMessage: {
    color: colors.textSecondary,
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
  },
  actionHint: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceLight,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  actionIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  actionText: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '500',
  },
  tipContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.primary + '20',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  tipIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  tipText: {
    flex: 1,
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonSpacer: {
    flex: 1,
  },
  prevButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  prevButtonText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  skipButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginRight: 8,
  },
  skipButtonText: {
    color: colors.textMuted,
    fontSize: 14,
  },
  nextButton: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  nextButtonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: '700',
  },

  // Contextual tip
  contextualTip: {
    position: 'absolute',
    zIndex: 1000,
  },
  contextualTipContent: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: colors.info,
    maxWidth: 300,
  },
  contextualTipIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  contextualTipText: {
    flex: 1,
    color: colors.textSecondary,
    fontSize: 13,
  },
  contextualTipDismiss: {
    color: colors.textMuted,
    fontSize: 16,
    marginLeft: 8,
    padding: 4,
  },
});

export default InteractiveTutorialV2;

// ============================================
// TUTORIAL / ONBOARDING COMPONENT
// ============================================
// Guides new players through key restaurant concepts
// Educational: Teaches the fundamentals that determine success

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Animated,
} from 'react-native';

interface TutorialProps {
  visible: boolean;
  onComplete: () => void;
  onSkip: () => void;
  colors: {
    background: string;
    card: string;
    textPrimary: string;
    textSecondary: string;
    success: string;
    danger: string;
    warning: string;
    accent: string;
  };
}

interface TutorialStep {
  id: string;
  title: string;
  icon: string;
  content: string;
  keyTakeaway: string;
  realWorldExample?: string;
  quiz?: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Restaurant Ownership',
    icon: '🍽️',
    content: `Congratulations on starting your restaurant journey!

Before you dive in, let's cover the fundamentals that separate successful restaurants from the 60% that fail within 5 years.

This isn't just a game - it's a realistic simulation based on actual restaurant economics.`,
    keyTakeaway: '60% of restaurants fail by year 5. Knowledge is your best defense.',
  },
  {
    id: 'prime_cost',
    title: 'The Most Important Number',
    icon: '📊',
    content: `PRIME COST = Food Cost + Labor Cost

This is THE number that determines if your restaurant survives.

Industry standard: Under 60% of revenue
Warning zone: 60-70%
Danger zone: Over 70%

If your prime cost is over 60%, you're likely losing money - even if your restaurant is busy.`,
    keyTakeaway: 'Prime cost over 60% = trouble. Every percentage point matters.',
    quiz: {
      question: 'If your revenue is $10,000 and prime cost is $7,000, what is your prime cost percentage?',
      options: ['60%', '70%', '30%', '40%'],
      correctIndex: 1,
      explanation: '$7,000 ÷ $10,000 = 70%. This is in the danger zone!',
    },
  },
  {
    id: 'cash_vs_profit',
    title: 'Cash Flow vs. Profit',
    icon: '💰',
    content: `This is the #1 killer of new restaurants: Being profitable on paper but running out of cash.

How it happens:
• You buy inventory before customers pay
• Rent is due before revenue comes in
• Delivery platforms hold your money for a week
• Big bills come due all at once

You can be "profitable" and still close because you can't make payroll.`,
    keyTakeaway: 'Profit ≠ Cash. Track your actual cash, not just your P&L.',
    realWorldExample: "A Chicago restaurant closed overnight in 2019 despite being 'profitable' - they couldn't make payroll after a slow holiday week.",
  },
  {
    id: 'runway',
    title: 'Cash Runway',
    icon: '🛫',
    content: `Runway = How many weeks you can survive with your current cash

The math: Cash on Hand ÷ Weekly Expenses

Healthy: 12+ weeks
Warning: 4-12 weeks
Critical: Under 4 weeks

Most successful restaurant owners start with 6+ months of expenses in reserve. Not 4 weeks - 6 MONTHS.`,
    keyTakeaway: 'Build reserves before you need them. 6 months minimum.',
    quiz: {
      question: 'You have $20,000 cash and spend $4,000/week. How long is your runway?',
      options: ['4 weeks', '5 weeks', '6 weeks', '8 weeks'],
      correctIndex: 1,
      explanation: '$20,000 ÷ $4,000 = 5 weeks. This is in the warning zone!',
    },
  },
  {
    id: 'menu_engineering',
    title: 'Not All Dishes Are Equal',
    icon: '📋',
    content: `70% of your profit comes from 20% of your menu. Know which items:

⭐ STARS: High margin, high sales
   → Feature these prominently

🧩 PUZZLES: High margin, low sales
   → Promote more or improve placement

🐴 PLOW HORSES: Low margin, high sales
   → Consider raising prices

🐕 DOGS: Low margin, low sales
   → Remove from menu`,
    keyTakeaway: 'Your best items pay for your worst. Know the difference.',
  },
  {
    id: 'location',
    title: 'Location Is Destiny',
    icon: '📍',
    content: `Before signing a lease, know your market:

• Minimum wage varies 50%+ between states
• Rent in NYC can be 3x rent in Houston
• Competition density affects everyone

The same restaurant concept that thrives in Austin might fail in San Francisco due to costs alone.

Research your market BEFORE committing.`,
    keyTakeaway: 'Low rent with bad traffic = failure. High rent with great traffic might also = failure.',
    realWorldExample: 'Successful restaurant groups often pilot in lower-cost markets before expanding to expensive cities.',
  },
  {
    id: 'staff',
    title: 'Your Team Makes or Breaks You',
    icon: '👥',
    content: `Staff morale directly affects:
• Food quality
• Customer service
• Turnover costs
• Your stress level

Low morale warning signs:
• Morale under 40%
• Staff working 50+ hours/week
• Missing payroll (even once)

The best employees leave first - they have options.`,
    keyTakeaway: 'Pay fairly, schedule reasonably, never miss payroll.',
    quiz: {
      question: 'What happens if you miss payroll?',
      options: [
        'Nothing, staff understands',
        'Small fine from the government',
        'Best employees leave, morale crashes',
        'Staff works extra hard to help out',
      ],
      correctIndex: 2,
      explanation: 'Your best employees leave first because they have other options. Remaining staff morale crashes.',
    },
  },
  {
    id: 'final',
    title: 'You\'re Ready!',
    icon: '🎓',
    content: `You now know more than most first-time restaurant owners:

✅ Prime cost must stay under 60%
✅ Cash flow ≠ profit
✅ Build 6+ months of reserves
✅ Know your Stars from your Dogs
✅ Location costs vary dramatically
✅ Staff morale is critical

This simulation will teach you by experience. Every failure is a lesson. Every success teaches what works.

Good luck, restaurateur!`,
    keyTakeaway: 'The goal is to learn, not just to win. Real restaurants fail - learn why.',
  },
];

const Tutorial: React.FC<TutorialProps> = ({
  visible,
  onComplete,
  onSkip,
  colors,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [quizAnswered, setQuizAnswered] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);

  const step = TUTORIAL_STEPS[currentStep];
  const isLastStep = currentStep === TUTORIAL_STEPS.length - 1;
  const hasQuiz = !!step.quiz;
  const quizCorrect = selectedAnswer === step.quiz?.correctIndex;

  const handleNext = useCallback(() => {
    if (hasQuiz && !quizAnswered) {
      // Force quiz answer before continuing
      return;
    }

    setQuizAnswered(false);
    setSelectedAnswer(null);

    if (isLastStep) {
      onComplete();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  }, [hasQuiz, quizAnswered, isLastStep, onComplete]);

  const handlePrevious = useCallback(() => {
    setQuizAnswered(false);
    setSelectedAnswer(null);
    setCurrentStep(prev => Math.max(0, prev - 1));
  }, []);

  const handleQuizAnswer = useCallback((index: number) => {
    setSelectedAnswer(index);
    setQuizAnswered(true);
  }, []);

  const canProceed = !hasQuiz || quizAnswered;

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={[styles.progressTrack, { backgroundColor: colors.card }]}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${((currentStep + 1) / TUTORIAL_STEPS.length) * 100}%`,
                  backgroundColor: colors.accent,
                },
              ]}
            />
          </View>
          <Text style={[styles.progressText, { color: colors.textSecondary }]}>
            {currentStep + 1} / {TUTORIAL_STEPS.length}
          </Text>
        </View>

        {/* Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Icon and Title */}
          <Text style={styles.icon}>{step.icon}</Text>
          <Text style={[styles.title, { color: colors.textPrimary }]}>
            {step.title}
          </Text>

          {/* Main Content */}
          <Text style={[styles.contentText, { color: colors.textSecondary }]}>
            {step.content}
          </Text>

          {/* Real World Example */}
          {step.realWorldExample && (
            <View style={[styles.exampleBox, { backgroundColor: colors.card }]}>
              <Text style={[styles.exampleLabel, { color: colors.warning }]}>
                📰 Real World Example
              </Text>
              <Text style={[styles.exampleText, { color: colors.textSecondary }]}>
                {step.realWorldExample}
              </Text>
            </View>
          )}

          {/* Quiz */}
          {step.quiz && (
            <View style={[styles.quizContainer, { backgroundColor: colors.card }]}>
              <Text style={[styles.quizQuestion, { color: colors.textPrimary }]}>
                🧠 Quick Check
              </Text>
              <Text style={[styles.quizQuestionText, { color: colors.textSecondary }]}>
                {step.quiz.question}
              </Text>

              {step.quiz.options.map((option, index) => {
                const isSelected = selectedAnswer === index;
                const showResult = quizAnswered;
                const isCorrect = index === step.quiz!.correctIndex;

                let optionStyle = {};
                if (showResult) {
                  if (isCorrect) {
                    optionStyle = { backgroundColor: colors.success, borderColor: colors.success };
                  } else if (isSelected && !isCorrect) {
                    optionStyle = { backgroundColor: colors.danger, borderColor: colors.danger };
                  }
                } else if (isSelected) {
                  optionStyle = { borderColor: colors.accent };
                }

                return (
                  <TouchableOpacity
                    key={index}
                    style={[styles.quizOption, optionStyle]}
                    onPress={() => !quizAnswered && handleQuizAnswer(index)}
                    disabled={quizAnswered}
                  >
                    <Text
                      style={[
                        styles.quizOptionText,
                        { color: showResult && (isCorrect || isSelected) ? '#fff' : colors.textPrimary },
                      ]}
                    >
                      {option}
                    </Text>
                  </TouchableOpacity>
                );
              })}

              {quizAnswered && (
                <View style={styles.quizExplanation}>
                  <Text style={[styles.quizResult, { color: quizCorrect ? colors.success : colors.danger }]}>
                    {quizCorrect ? '✅ Correct!' : '❌ Not quite...'}
                  </Text>
                  <Text style={[styles.quizExplanationText, { color: colors.textSecondary }]}>
                    {step.quiz.explanation}
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Key Takeaway */}
          <View style={[styles.takeawayBox, { borderColor: colors.accent }]}>
            <Text style={[styles.takeawayLabel, { color: colors.accent }]}>
              💡 Key Takeaway
            </Text>
            <Text style={[styles.takeawayText, { color: colors.textPrimary }]}>
              {step.keyTakeaway}
            </Text>
          </View>
        </ScrollView>

        {/* Navigation */}
        <View style={styles.navigation}>
          {currentStep > 0 ? (
            <TouchableOpacity
              style={[styles.navButton, { backgroundColor: colors.card }]}
              onPress={handlePrevious}
            >
              <Text style={[styles.navButtonText, { color: colors.textPrimary }]}>
                ← Back
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.navButton, { backgroundColor: 'transparent' }]}
              onPress={onSkip}
            >
              <Text style={[styles.skipText, { color: colors.textSecondary }]}>
                Skip Tutorial
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[
              styles.navButton,
              styles.nextButton,
              {
                backgroundColor: canProceed ? colors.accent : colors.card,
                opacity: canProceed ? 1 : 0.5,
              },
            ]}
            onPress={handleNext}
            disabled={!canProceed}
          >
            <Text style={[styles.navButtonText, { color: canProceed ? '#fff' : colors.textSecondary }]}>
              {isLastStep ? 'Start Playing! 🎮' : hasQuiz && !quizAnswered ? 'Answer Quiz' : 'Next →'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
  },
  progressContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  icon: {
    fontSize: 64,
    textAlign: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
  },
  contentText: {
    fontSize: 16,
    lineHeight: 26,
    marginBottom: 20,
  },
  exampleBox: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  exampleLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  exampleText: {
    fontSize: 14,
    lineHeight: 22,
    fontStyle: 'italic',
  },
  quizContainer: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  quizQuestion: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  quizQuestionText: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 16,
  },
  quizOption: {
    padding: 14,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'rgba(128, 128, 128, 0.3)',
    marginBottom: 10,
  },
  quizOptionText: {
    fontSize: 15,
    textAlign: 'center',
  },
  quizExplanation: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(128, 128, 128, 0.2)',
  },
  quizResult: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  quizExplanationText: {
    fontSize: 14,
    lineHeight: 20,
  },
  takeawayBox: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    marginBottom: 30,
  },
  takeawayLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  takeawayText: {
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 24,
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(128, 128, 128, 0.2)',
  },
  navButton: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    minWidth: 120,
    alignItems: 'center',
  },
  nextButton: {
    minWidth: 160,
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  skipText: {
    fontSize: 14,
  },
});

export default Tutorial;

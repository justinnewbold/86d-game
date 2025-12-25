// ============================================
// ONBOARDING SCREEN COMPONENT
// ============================================

import React, { useState, useCallback, memo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  SafeAreaView,
  StatusBar,
  Dimensions,
} from 'react-native';
import {
  colors,
  CUISINES,
  LOCATION_TYPES,
  GOALS,
  US_STATES,
  US_CITIES,
  searchCities,
  getCityData,
  getLocationImpactSummary,
  CITY_TIERS,
  getPopularCities,
} from '../constants';
import { ProgressBar, PrimaryButton } from '../components/ui';
import { getBaseLocationData, researchLocationData } from '../services/locationResearch';
import { AccessibleButton, AccessibleText, announceForAccessibility } from '../components/common/A11yWrapper';

const { width } = Dimensions.get('window');

// Format helpers
const formatCurrency = (v: number): string =>
  v >= 1000000 ? `$${(v / 1000000).toFixed(1)}M` : v >= 1000 ? `$${(v / 1000).toFixed(0)}K` : `$${Math.round(v).toLocaleString()}`;
const formatPct = (v: number): string => `${(v * 100).toFixed(1)}%`;

// Types
interface SetupState {
  name: string;
  cuisine: string;
  capital: number;
  location: string;
  goal: string;
  difficulty: string;
  experience: string;
  city: string;
  state: string;
  locationData?: any;
  locationResearchStatus?: 'pending' | 'loading' | 'complete' | 'error';
}

interface OnboardingScreenProps {
  setup: SetupState;
  setSetup: (updater: (prev: SetupState) => SetupState) => void;
  onComplete: () => void;
  onBack?: () => void;
}

interface OnboardingStep {
  title: string;
  key: 'cuisine' | 'capital' | 'name' | 'cityState' | 'location' | 'goal';
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  { title: 'Choose Your Cuisine', key: 'cuisine' },
  { title: 'Starting Capital', key: 'capital' },
  { title: 'Name Your Restaurant', key: 'name' },
  { title: 'Choose Your City', key: 'cityState' },
  { title: 'Location Type', key: 'location' },
  { title: 'Set Your Goal', key: 'goal' },
];

const CAPITAL_PRESETS = [
  { label: '$50K', value: 50000 },
  { label: '$100K', value: 100000 },
  { label: '$250K', value: 250000 },
  { label: '$500K', value: 500000 },
  { label: '$1M', value: 1000000 },
  { label: '$2.5M', value: 2500000 },
  { label: '$5M', value: 5000000 },
  { label: '$10M', value: 10000000 },
];

// ============================================
// STEP COMPONENTS
// ============================================

interface CuisineStepProps {
  setup: SetupState;
  setSetup: (updater: (prev: SetupState) => SetupState) => void;
  onOpenModal: () => void;
}

const CuisineStep = memo<CuisineStepProps>(({ setup, setSetup, onOpenModal }) => {
  const selectedCuisine = CUISINES.find(c => c.id === setup.cuisine);

  return (
    <>
      <TouchableOpacity style={styles.dropdownButton} onPress={onOpenModal}>
        {selectedCuisine ? (
          <Text style={styles.dropdownText}>
            {selectedCuisine.icon} {selectedCuisine.name}
          </Text>
        ) : (
          <Text style={styles.dropdownPlaceholder}>Select cuisine type...</Text>
        )}
        <Text style={styles.dropdownArrow}>▼</Text>
      </TouchableOpacity>
      {selectedCuisine && (
        <View style={styles.selectedCuisine}>
          <Text style={styles.selectedIcon}>{selectedCuisine.icon}</Text>
          <View>
            <Text style={styles.selectedName}>{selectedCuisine.name}</Text>
            <Text style={styles.selectedStats}>
              Food Cost: {formatPct(selectedCuisine.foodCost)} • Avg Ticket: {formatCurrency(selectedCuisine.avgTicket)}
            </Text>
          </View>
        </View>
      )}
    </>
  );
});

interface CapitalStepProps {
  setup: SetupState;
  setSetup: (updater: (prev: SetupState) => SetupState) => void;
}

const CapitalStep = memo<CapitalStepProps>(({ setup, setSetup }) => {
  const [customMode, setCustomMode] = useState(false);
  const [customInput, setCustomInput] = useState('');

  const getTierInfo = useCallback((capital: number) => {
    if (capital < 75000) return { name: 'BOOTSTRAP', desc: "Tight. One location, no safety net. True bootstrap mode.", color: colors.accent };
    if (capital < 250000) return { name: 'STANDARD', desc: "Solid start. Room to breathe and handle surprises.", color: colors.warning };
    if (capital < 500000) return { name: 'WELL-FUNDED', desc: "Good runway for location #1 + reserve for expansion.", color: colors.success };
    if (capital < 1000000) return { name: 'EMPIRE READY', desc: "Ready to scale fast. Multiple locations from day one.", color: colors.purple };
    if (capital < 5000000) return { name: 'TYCOON', desc: "Serious investor money. Build a regional chain immediately.", color: '#FFD700' };
    return { name: 'UNLIMITED', desc: "Unlimited mode. Focus on strategy, not survival.", color: '#E5E4E2' };
  }, []);

  const tierInfo = getTierInfo(setup.capital);

  const handleCustomApply = useCallback(() => {
    const amount = parseInt(customInput) || 50000;
    setSetup(s => ({ ...s, capital: Math.max(50000, Math.min(100000000, amount)) }));
    setCustomMode(false);
    setCustomInput('');
  }, [customInput, setSetup]);

  const handleIncrement = useCallback((increment: boolean) => {
    setSetup(s => {
      const step = s.capital >= 1000000 ? 500000 : s.capital >= 250000 ? 100000 : 25000;
      const newValue = increment
        ? Math.min(100000000, s.capital + step)
        : Math.max(50000, s.capital - step);
      return { ...s, capital: newValue };
    });
  }, [setSetup]);

  if (customMode) {
    return (
      <View style={styles.capitalDisplay}>
        <Text style={styles.customCapitalLabel}>Enter Custom Amount</Text>
        <View style={styles.customInputRow}>
          <Text style={styles.dollarSign}>$</Text>
          <TextInput
            style={styles.customInput}
            placeholder="1,000,000"
            placeholderTextColor={colors.textMuted}
            value={customInput}
            onChangeText={(t) => setCustomInput(t.replace(/[^0-9]/g, ''))}
            keyboardType="numeric"
            autoFocus
          />
        </View>
        <View style={styles.customButtonRow}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => { setCustomMode(false); setCustomInput(''); }}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.applyButton} onPress={handleCustomApply}>
            <Text style={styles.applyButtonText}>Apply</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <>
      <View style={styles.capitalDisplay}>
        <Text style={[styles.capitalAmount, { color: tierInfo.color }]}>
          {setup.capital >= 1000000 ? `$${(setup.capital / 1000000).toFixed(1)}M` : formatCurrency(setup.capital)}
        </Text>
        <View style={[styles.tierBadge, { backgroundColor: tierInfo.color }]}>
          <Text style={[styles.tierText, { color: setup.capital >= 5000000 ? '#333' : '#fff' }]}>
            {tierInfo.name}
          </Text>
        </View>
        <Text style={styles.tierDesc}>{tierInfo.desc}</Text>
        <TouchableOpacity style={styles.customModeLink} onPress={() => setCustomMode(true)}>
          <Text style={styles.customModeLinkText}>Enter custom amount →</Text>
        </TouchableOpacity>
      </View>

      {/* Preset buttons */}
      <View style={styles.presetGrid}>
        {CAPITAL_PRESETS.map(preset => (
          <TouchableOpacity
            key={preset.value}
            style={[
              styles.presetButton,
              setup.capital === preset.value && styles.presetButtonActive,
            ]}
            onPress={() => setSetup(s => ({ ...s, capital: preset.value }))}
          >
            <Text style={[
              styles.presetButtonText,
              setup.capital === preset.value && styles.presetButtonTextActive,
            ]}>
              {preset.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Increment/Decrement */}
      <View style={styles.incrementRow}>
        <TouchableOpacity style={styles.incrementButton} onPress={() => handleIncrement(false)}>
          <Text style={styles.incrementButtonText}>
            - {setup.capital > 1000000 ? '$500K' : setup.capital > 250000 ? '$100K' : '$25K'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.incrementButton} onPress={() => handleIncrement(true)}>
          <Text style={styles.incrementButtonText}>
            + {setup.capital >= 1000000 ? '$500K' : setup.capital >= 250000 ? '$100K' : '$25K'}
          </Text>
        </TouchableOpacity>
      </View>
      <View style={styles.sliderLabels}>
        <Text style={styles.sliderLabel}>$50K</Text>
        <Text style={styles.sliderLabel}>$100M</Text>
      </View>
    </>
  );
});

interface NameStepProps {
  setup: SetupState;
  setSetup: (updater: (prev: SetupState) => SetupState) => void;
}

const NameStep = memo<NameStepProps>(({ setup, setSetup }) => (
  <TextInput
    style={styles.textInput}
    placeholder="e.g., The Golden Fork"
    placeholderTextColor={colors.textMuted}
    value={setup.name}
    onChangeText={(t) => setSetup(s => ({ ...s, name: t }))}
    accessible={true}
    accessibilityLabel="Restaurant name"
  />
));

interface CityStateStepProps {
  setup: SetupState;
  setSetup: (updater: (prev: SetupState) => SetupState) => void;
}

const CityStateStep = memo<CityStateStepProps>(({ setup, setSetup }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showStateModal, setShowStateModal] = useState(false);
  const [showCityModal, setShowCityModal] = useState(false);
  const [customCity, setCustomCity] = useState('');

  // Get search results
  const searchResults = searchQuery.length >= 2 ? searchCities(searchQuery) : [];

  // Get city data for display
  const selectedCityData = setup.city && setup.state
    ? getCityData(setup.city, setup.state)
    : null;

  // Get tier info
  const tierInfo = selectedCityData
    ? CITY_TIERS[selectedCityData.tier as keyof typeof CITY_TIERS]
    : null;

  // Get impact summary
  const impacts = selectedCityData ? getLocationImpactSummary(selectedCityData) : null;

  // Popular cities for quick selection
  const popularCities = getPopularCities();

  const handleCitySelect = useCallback((city: string, state: string) => {
    setSetup(s => ({
      ...s,
      city,
      state,
      locationData: getBaseLocationData(city, state),
      locationResearchStatus: 'pending',
    }));
    setSearchQuery('');
    setShowCityModal(false);
  }, [setSetup]);

  const handleStateSelect = useCallback((stateCode: string) => {
    setSetup(s => ({ ...s, state: stateCode, city: '' }));
    setShowStateModal(false);
  }, [setSetup]);

  const handleCustomCitySubmit = useCallback(() => {
    if (customCity.trim() && setup.state) {
      handleCitySelect(customCity.trim(), setup.state);
      setCustomCity('');
    }
  }, [customCity, setup.state, handleCitySelect]);

  return (
    <View style={styles.cityStateContainer}>
      {/* Quick Search */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search any US city..."
          placeholderTextColor={colors.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="words"
        />
        {searchResults.length > 0 && (
          <View style={styles.searchResults}>
            <ScrollView style={styles.searchResultsList} keyboardShouldPersistTaps="handled">
              {searchResults.map((city, index) => (
                <TouchableOpacity
                  key={`${city.city}-${city.state}-${index}`}
                  style={styles.searchResultItem}
                  onPress={() => handleCitySelect(city.city, city.state)}
                >
                  <Text style={styles.searchResultIcon}>{city.icon || '📍'}</Text>
                  <View style={styles.searchResultInfo}>
                    <Text style={styles.searchResultCity}>{city.city}</Text>
                    <Text style={styles.searchResultState}>{city.state}</Text>
                  </View>
                  <View style={[styles.tierBadgeSmall, { backgroundColor: CITY_TIERS[city.tier as keyof typeof CITY_TIERS]?.color || colors.primary }]}>
                    <Text style={styles.tierBadgeSmallText}>Tier {city.tier}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </View>

      {/* Or select manually */}
      <Text style={styles.orDivider}>OR SELECT MANUALLY</Text>

      {/* State Selection */}
      <TouchableOpacity
        style={styles.dropdownButton}
        onPress={() => setShowStateModal(true)}
      >
        <Text style={setup.state ? styles.dropdownText : styles.dropdownPlaceholder}>
          {setup.state
            ? US_STATES.find(s => s.code === setup.state)?.name || setup.state
            : 'Select State...'}
        </Text>
        <Text style={styles.dropdownArrow}>▼</Text>
      </TouchableOpacity>

      {/* City Input (after state is selected) */}
      {setup.state && (
        <View style={styles.customCityRow}>
          <TextInput
            style={[styles.textInput, styles.cityInput]}
            placeholder={`Enter city in ${setup.state}...`}
            placeholderTextColor={colors.textMuted}
            value={customCity}
            onChangeText={setCustomCity}
            onSubmitEditing={handleCustomCitySubmit}
            autoCapitalize="words"
          />
          <TouchableOpacity
            style={[styles.setButton, !customCity.trim() && styles.setButtonDisabled]}
            onPress={handleCustomCitySubmit}
            disabled={!customCity.trim()}
          >
            <Text style={styles.setButtonText}>Set</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Popular Cities Quick Select */}
      <Text style={styles.popularLabel}>POPULAR CITIES</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.popularScroll}>
        {popularCities.slice(0, 8).map((city) => (
          <TouchableOpacity
            key={`${city.city}-${city.state}`}
            style={[
              styles.popularCity,
              setup.city === city.city && setup.state === city.state && styles.popularCityActive,
            ]}
            onPress={() => handleCitySelect(city.city, city.state)}
          >
            <Text style={styles.popularCityIcon}>{city.icon}</Text>
            <Text style={[
              styles.popularCityText,
              setup.city === city.city && setup.state === city.state && styles.popularCityTextActive,
            ]}>{city.city}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Selected City Info */}
      {setup.city && setup.state && (
        <View style={styles.selectedCityCard}>
          <View style={styles.selectedCityHeader}>
            <Text style={styles.selectedCityIcon}>{selectedCityData?.icon || '📍'}</Text>
            <View style={styles.selectedCityInfo}>
              <Text style={styles.selectedCityName}>{setup.city}, {setup.state}</Text>
              {tierInfo && (
                <View style={[styles.tierBadge, { backgroundColor: tierInfo.color }]}>
                  <Text style={styles.tierText}>{tierInfo.name}</Text>
                </View>
              )}
            </View>
          </View>

          {tierInfo && (
            <Text style={styles.tierDesc}>{tierInfo.desc}</Text>
          )}

          {/* Economic Impacts */}
          {impacts && impacts.length > 0 && (
            <View style={styles.impactsList}>
              {impacts.map((impact, index) => (
                <View key={index} style={styles.impactItem}>
                  <Text style={[
                    styles.impactDot,
                    { color: impact.type === 'success' ? colors.success : colors.warning }
                  ]}>●</Text>
                  <Text style={styles.impactText}>{impact.text}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Research Status */}
          {setup.locationResearchStatus === 'loading' && (
            <View style={styles.researchingBanner}>
              <Text style={styles.researchingText}>
                Researching local market data...
              </Text>
            </View>
          )}
        </View>
      )}

      {/* State Selection Modal */}
      <Modal visible={showStateModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select State</Text>
              <TouchableOpacity onPress={() => setShowStateModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.stateList}>
              {US_STATES.map(state => (
                <TouchableOpacity
                  key={state.code}
                  style={[styles.stateOption, setup.state === state.code && styles.stateOptionSelected]}
                  onPress={() => handleStateSelect(state.code)}
                >
                  <Text style={[styles.stateName, setup.state === state.code && styles.stateNameSelected]}>
                    {state.name}
                  </Text>
                  <Text style={styles.stateCode}>{state.code}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
});

interface LocationStepProps {
  setup: SetupState;
  setSetup: (updater: (prev: SetupState) => SetupState) => void;
}

const LocationStep = memo<LocationStepProps>(({ setup, setSetup }) => (
  <View style={styles.goalOptions}>
    {LOCATION_TYPES.slice(0, 6).map(loc => (
      <TouchableOpacity
        key={loc.id}
        style={[styles.goalButton, setup.location === loc.id && styles.goalButtonActive]}
        onPress={() => setSetup(s => ({ ...s, location: loc.id }))}
        accessible={true}
        accessibilityRole="button"
        accessibilityState={{ selected: setup.location === loc.id }}
      >
        <Text style={styles.locationIcon}>{loc.icon}</Text>
        <View style={styles.locationInfo}>
          <Text style={[styles.goalText, setup.location === loc.id && styles.goalTextActive]}>
            {loc.name}
          </Text>
          <Text style={styles.goalDesc}>
            Rent: {loc.rentMod > 1 ? '+' : ''}{Math.round((loc.rentMod - 1) * 100)}% •
            Traffic: {loc.trafficMod > 1 ? '+' : ''}{Math.round((loc.trafficMod - 1) * 100)}% •
            Buildout: {formatCurrency(loc.buildoutCost)}
          </Text>
        </View>
      </TouchableOpacity>
    ))}
  </View>
));

interface GoalStepProps {
  setup: SetupState;
  setSetup: (updater: (prev: SetupState) => SetupState) => void;
}

const GoalStep = memo<GoalStepProps>(({ setup, setSetup }) => (
  <View style={styles.goalOptions}>
    {GOALS.map(g => (
      <TouchableOpacity
        key={g.id}
        style={[styles.goalButton, setup.goal === g.id && styles.goalButtonActive]}
        onPress={() => setSetup(s => ({ ...s, goal: g.id }))}
        accessible={true}
        accessibilityRole="button"
        accessibilityState={{ selected: setup.goal === g.id }}
      >
        <Text style={[styles.goalText, setup.goal === g.id && styles.goalTextActive]}>
          {g.name}
        </Text>
        <Text style={styles.goalDesc}>{g.desc} • {g.difficulty}</Text>
      </TouchableOpacity>
    ))}
  </View>
));

// ============================================
// CUISINE MODAL
// ============================================

interface CuisineModalProps {
  visible: boolean;
  onClose: () => void;
  setup: SetupState;
  setSetup: (updater: (prev: SetupState) => SetupState) => void;
}

const CuisineModal = memo<CuisineModalProps>(({ visible, onClose, setup, setSetup }) => {
  const [search, setSearch] = useState('');

  const filteredCuisines = CUISINES.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = useCallback((cuisineId: string) => {
    setSetup(s => ({ ...s, cuisine: cuisineId }));
    onClose();
  }, [setSetup, onClose]);

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Cuisine</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.modalClose}>✕</Text>
            </TouchableOpacity>
          </View>
          <TextInput
            style={styles.searchInput}
            placeholder="Search cuisines..."
            placeholderTextColor={colors.textMuted}
            value={search}
            onChangeText={setSearch}
          />
          <ScrollView style={styles.cuisineList}>
            {filteredCuisines.map(c => (
              <TouchableOpacity
                key={c.id}
                style={[styles.cuisineOption, setup.cuisine === c.id && styles.cuisineOptionSelected]}
                onPress={() => handleSelect(c.id)}
              >
                <Text style={styles.cuisineIcon}>{c.icon}</Text>
                <View style={styles.cuisineInfo}>
                  <Text style={[styles.cuisineName, setup.cuisine === c.id && styles.cuisineNameSelected]}>
                    {c.name}
                  </Text>
                  <Text style={styles.cuisineStats}>
                    Food: {formatPct(c.foodCost)} • Ticket: {formatCurrency(c.avgTicket)} • {c.difficulty}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
});

// ============================================
// MAIN COMPONENT
// ============================================

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({
  setup,
  setSetup,
  onComplete,
  onBack,
}) => {
  const [step, setStep] = useState(0);
  const [cuisineModalVisible, setCuisineModalVisible] = useState(false);

  const currentStep = ONBOARDING_STEPS[step];
  const progress = (step + 1) / ONBOARDING_STEPS.length;

  const canContinue = useCallback(() => {
    switch (currentStep.key) {
      case 'cuisine':
        return !!setup.cuisine;
      case 'name':
        return setup.name.length > 0;
      case 'cityState':
        return setup.city.length > 0 && setup.state.length > 0;
      default:
        return true;
    }
  }, [currentStep.key, setup.cuisine, setup.name, setup.city, setup.state]);

  const handleContinue = useCallback(() => {
    if (step < ONBOARDING_STEPS.length - 1) {
      setStep(s => s + 1);
      announceForAccessibility(`Step ${step + 2} of ${ONBOARDING_STEPS.length}: ${ONBOARDING_STEPS[step + 1].title}`);
    } else {
      announceForAccessibility('Starting game. Opening your restaurant doors.');
      onComplete();
    }
  }, [step, onComplete]);

  const handleBack = useCallback(() => {
    if (step > 0) {
      setStep(s => s - 1);
      announceForAccessibility(`Step ${step} of ${ONBOARDING_STEPS.length}: ${ONBOARDING_STEPS[step - 1].title}`);
    } else if (onBack) {
      onBack();
    }
  }, [step, onBack]);

  const getStepMessage = useCallback(() => {
    switch (currentStep.key) {
      case 'cuisine':
        return "What type of food will you build your empire on? This affects everything - food costs, average ticket, and complexity.";
      case 'capital':
        return "How much are you starting with? This is your war chest - first location plus corporate reserve.";
      case 'name':
        return "What's your brand? This will be the foundation of your empire.";
      case 'cityState':
        return "Which US city will you open in? Location matters - wages, rent, and ticket prices all vary by market.";
      case 'location':
        return "What type of space? Downtown rent is high but traffic is too. Ghost kitchens are cheap but delivery-only.";
      case 'goal':
        return "How big do you want to build? Single location survival or multi-state empire?";
      default:
        return "";
    }
  }, [currentStep.key]);

  const renderStepContent = useCallback(() => {
    switch (currentStep.key) {
      case 'cuisine':
        return (
          <CuisineStep
            setup={setup}
            setSetup={setSetup}
            onOpenModal={() => setCuisineModalVisible(true)}
          />
        );
      case 'capital':
        return <CapitalStep setup={setup} setSetup={setSetup} />;
      case 'name':
        return <NameStep setup={setup} setSetup={setSetup} />;
      case 'cityState':
        return <CityStateStep setup={setup} setSetup={setSetup} />;
      case 'location':
        return <LocationStep setup={setup} setSetup={setSetup} />;
      case 'goal':
        return <GoalStep setup={setup} setSetup={setSetup} />;
      default:
        return null;
    }
  }, [currentStep.key, setup, setSetup]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          {/* Progress */}
          <View style={styles.progressContainer}>
            <ProgressBar progress={progress} />
          </View>
          <AccessibleText style={styles.stepText} role="text">
            STEP {step + 1} OF {ONBOARDING_STEPS.length}
          </AccessibleText>

          {/* Message */}
          <View style={styles.messageBox}>
            <AccessibleText style={styles.messageText} role="text">
              {getStepMessage()}
            </AccessibleText>
          </View>

          {/* Step Content */}
          {renderStepContent()}

          {/* Continue Button */}
          <TouchableOpacity
            style={[styles.continueButton, !canContinue() && styles.continueButtonDisabled]}
            onPress={handleContinue}
            disabled={!canContinue()}
          >
            <Text style={[styles.continueButtonText, !canContinue() && styles.continueButtonTextDisabled]}>
              {step < ONBOARDING_STEPS.length - 1 ? 'CONTINUE' : 'OPEN YOUR DOORS'}
            </Text>
          </TouchableOpacity>

          {/* Back Button */}
          {(step > 0 || onBack) && (
            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
              <Text style={styles.backButtonText}>← Back</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* Cuisine Modal */}
      <CuisineModal
        visible={cuisineModalVisible}
        onClose={() => setCuisineModalVisible(false)}
        setup={setup}
        setSetup={setSetup}
      />
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
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  progressContainer: {
    marginBottom: 10,
  },
  stepText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 20,
  },
  messageBox: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  messageText: {
    color: colors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
  },

  // Dropdown
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dropdownText: {
    color: colors.textPrimary,
    fontSize: 16,
  },
  dropdownPlaceholder: {
    color: colors.textMuted,
    fontSize: 16,
  },
  dropdownArrow: {
    color: colors.textMuted,
    fontSize: 12,
  },

  // Selected cuisine
  selectedCuisine: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceLight,
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
  },
  selectedIcon: {
    fontSize: 40,
    marginRight: 16,
  },
  selectedName: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '600',
  },
  selectedStats: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 4,
  },

  // Capital
  capitalDisplay: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 24,
    borderRadius: 12,
    marginBottom: 16,
  },
  capitalAmount: {
    fontSize: 48,
    fontWeight: '700',
    marginBottom: 12,
  },
  tierBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 12,
  },
  tierText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  tierDesc: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  customModeLink: {
    marginTop: 12,
    padding: 8,
  },
  customModeLinkText: {
    color: colors.primary,
    fontSize: 14,
  },
  customCapitalLabel: {
    color: colors.textPrimary,
    fontSize: 16,
    marginBottom: 16,
  },
  customInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  dollarSign: {
    color: colors.textPrimary,
    fontSize: 24,
    marginRight: 8,
  },
  customInput: {
    backgroundColor: colors.surfaceLight,
    color: colors.textPrimary,
    fontSize: 24,
    textAlign: 'center',
    padding: 12,
    borderRadius: 8,
    width: 180,
  },
  customButtonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    backgroundColor: colors.surface,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  cancelButtonText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  applyButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  applyButtonText: {
    color: colors.background,
    fontSize: 14,
    fontWeight: '600',
  },
  presetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
  },
  presetButton: {
    backgroundColor: colors.surface,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    minWidth: 70,
    alignItems: 'center',
  },
  presetButtonActive: {
    backgroundColor: colors.primary,
  },
  presetButtonText: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '500',
  },
  presetButtonTextActive: {
    color: colors.background,
    fontWeight: '700',
  },
  incrementRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  incrementButton: {
    backgroundColor: colors.surface,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  incrementButtonText: {
    color: colors.textPrimary,
    fontSize: 16,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  sliderLabel: {
    color: colors.textMuted,
    fontSize: 12,
  },

  // Text input
  textInput: {
    backgroundColor: colors.surface,
    color: colors.textPrimary,
    padding: 16,
    borderRadius: 8,
    fontSize: 18,
    borderWidth: 1,
    borderColor: colors.border,
  },

  // Goal/Location options
  goalOptions: {
    gap: 12,
  },
  goalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  goalButtonActive: {
    borderColor: colors.primary,
    backgroundColor: colors.surfaceLight,
  },
  goalText: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  goalTextActive: {
    color: colors.primary,
  },
  goalDesc: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 4,
  },
  locationIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  locationInfo: {
    flex: 1,
  },

  // Continue/Back buttons
  continueButton: {
    backgroundColor: colors.primary,
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
  },
  continueButtonDisabled: {
    opacity: 0.5,
  },
  continueButtonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 1,
  },
  continueButtonTextDisabled: {
    opacity: 0.7,
  },
  backButton: {
    alignItems: 'center',
    padding: 16,
    marginTop: 8,
  },
  backButtonText: {
    color: colors.textSecondary,
    fontSize: 14,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '700',
  },
  modalClose: {
    color: colors.textMuted,
    fontSize: 24,
    padding: 4,
  },
  searchInput: {
    backgroundColor: colors.surfaceLight,
    color: colors.textPrimary,
    padding: 14,
    borderRadius: 8,
    fontSize: 16,
    marginBottom: 16,
  },
  cuisineList: {
    maxHeight: 400,
  },
  cuisineOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: colors.surfaceLight,
  },
  cuisineOptionSelected: {
    backgroundColor: colors.primary + '30',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  cuisineIcon: {
    fontSize: 28,
    marginRight: 14,
  },
  cuisineInfo: {
    flex: 1,
  },
  cuisineName: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '500',
  },
  cuisineNameSelected: {
    color: colors.primary,
    fontWeight: '700',
  },
  cuisineStats: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 4,
  },

  // City/State Selection
  cityStateContainer: {
    gap: 12,
  },
  searchContainer: {
    position: 'relative',
    zIndex: 10,
  },
  searchResults: {
    position: 'absolute',
    top: 56,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    maxHeight: 250,
    zIndex: 20,
  },
  searchResultsList: {
    padding: 8,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 4,
    backgroundColor: colors.surfaceLight,
  },
  searchResultIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  searchResultInfo: {
    flex: 1,
  },
  searchResultCity: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '500',
  },
  searchResultState: {
    color: colors.textMuted,
    fontSize: 12,
  },
  tierBadgeSmall: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  tierBadgeSmallText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  orDivider: {
    textAlign: 'center',
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
    marginVertical: 8,
  },
  customCityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  cityInput: {
    flex: 1,
  },
  setButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  setButtonDisabled: {
    opacity: 0.5,
  },
  setButtonText: {
    color: colors.background,
    fontSize: 14,
    fontWeight: '600',
  },
  popularLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
    marginTop: 16,
    marginBottom: 8,
  },
  popularScroll: {
    marginBottom: 16,
  },
  popularCity: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginRight: 10,
    minWidth: 80,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  popularCityActive: {
    borderColor: colors.primary,
    backgroundColor: colors.surfaceLight,
  },
  popularCityIcon: {
    fontSize: 24,
    marginBottom: 6,
  },
  popularCityText: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  popularCityTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  selectedCityCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  selectedCityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  selectedCityIcon: {
    fontSize: 36,
    marginRight: 12,
  },
  selectedCityInfo: {
    flex: 1,
  },
  selectedCityName: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 6,
  },
  impactsList: {
    marginTop: 12,
    gap: 6,
  },
  impactItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  impactDot: {
    fontSize: 10,
    marginRight: 8,
  },
  impactText: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  researchingBanner: {
    backgroundColor: colors.info + '20',
    padding: 10,
    borderRadius: 8,
    marginTop: 12,
  },
  researchingText: {
    color: colors.info,
    fontSize: 12,
    textAlign: 'center',
  },
  stateList: {
    maxHeight: 400,
  },
  stateOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderRadius: 8,
    marginBottom: 4,
    backgroundColor: colors.surfaceLight,
  },
  stateOptionSelected: {
    backgroundColor: colors.primary + '30',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  stateName: {
    color: colors.textPrimary,
    fontSize: 16,
  },
  stateNameSelected: {
    color: colors.primary,
    fontWeight: '600',
  },
  stateCode: {
    color: colors.textMuted,
    fontSize: 14,
  },
});

export default OnboardingScreen;

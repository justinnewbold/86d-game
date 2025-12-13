            <ScrollView style={{ maxHeight: 400, padding: 16 }}>
              <Text style={styles.sectionTitle}>DELIVERY PLATFORMS</Text>
              {DELIVERY_PLATFORMS.map(p => {
                const active = game.delivery.platforms.includes(p.id);
                return (
                  <TouchableOpacity key={p.id} onPress={() => toggleDeliveryPlatform(p.id)} style={[styles.marketingItem, active && styles.marketingItemActive]} disabled={!active && game.cash < p.setup}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.marketingName}>{p.icon} {p.name}</Text>
                      <Text style={styles.marketingCost}>{Math.round(p.commission * 100)}% commission • {p.setup > 0 ? `${formatCurrency(p.setup)} setup` : 'No setup'}</Text>
                    </View>
                    <Text style={{ color: active ? colors.success : game.cash < p.setup ? colors.accent : colors.textMuted }}>{active ? '✓ Active' : game.cash < p.setup ? "Can't afford" : 'Enable'}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
      
      {/* Operations Modal */}
      <Modal visible={operationsModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>⚙️ Operations</Text>
              <TouchableOpacity onPress={() => setOperationsModal(false)}><Text style={styles.modalClose}>✕</Text></TouchableOpacity>
            </View>
            <ScrollView style={{ maxHeight: 400, padding: 16 }}>
              <Text style={styles.sectionTitle}>INVENTORY</Text>
              <View style={styles.marketingItem}>
                <Text style={styles.marketingName}>🚚 Supplier: {SUPPLIERS.find(s => s.id === game.inventory.supplier)?.name}</Text>
              </View>
              <View style={styles.marketingItem}>
                <Text style={styles.marketingName}>📉 Spoilage Rate: {Math.round(game.inventory.spoilage * 100)}%</Text>
              </View>
              
              <Text style={[styles.sectionTitle, { marginTop: 16 }]}>CHANGE SUPPLIER</Text>
              {SUPPLIERS.map(s => {
                const active = game.inventory.supplier === s.id;
                return (
                  <TouchableOpacity key={s.id} onPress={() => setGame(g => ({ ...g, inventory: { ...g.inventory, supplier: s.id } }))} style={[styles.marketingItem, active && styles.marketingItemActive]}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.marketingName}>{s.icon} {s.name}</Text>
                      <Text style={styles.marketingCost}>{Math.round((s.markup - 1) * 100)}% markup • {Math.round(s.reliability * 100)}% reliable</Text>
                    </View>
                    <Text style={{ color: active ? colors.success : colors.textMuted }}>{active ? '✓ Current' : 'Switch'}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
      
      {/* Analytics Modal */}
      <Modal visible={analyticsModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>📊 Analytics</Text>
              <TouchableOpacity onPress={() => setAnalyticsModal(false)}><Text style={styles.modalClose}>✕</Text></TouchableOpacity>
            </View>
            <ScrollView style={{ maxHeight: 500, padding: 16 }}>
              <View style={styles.analyticsCard}>
                <Text style={styles.analyticsTitle}>Revenue Trend</Text>
                <MiniChart data={game.weeklyHistory.map(w => w.revenue)} color={colors.primary} height={60} />
              </View>
              
              <View style={styles.analyticsCard}>
                <Text style={styles.analyticsTitle}>Profit Trend</Text>
                <MiniChart data={game.weeklyHistory.map(w => w.profit)} color={colors.success} height={60} />
              </View>
              
              <View style={styles.analyticsCard}>
                <Text style={styles.analyticsTitle}>Key Metrics</Text>
                <View style={styles.weeklyRow}><Text style={styles.weeklyLabel}>Total Revenue</Text><Text style={styles.weeklyValue}>{formatCurrency(game.totalRevenue)}</Text></View>
                <View style={styles.weeklyRow}><Text style={styles.weeklyLabel}>Total Profit</Text><Text style={[styles.weeklyValue, { color: game.totalProfit >= 0 ? colors.success : colors.accent }]}>{formatCurrency(game.totalProfit)}</Text></View>
                <View style={styles.weeklyRow}><Text style={styles.weeklyLabel}>Avg Weekly Revenue</Text><Text style={styles.weeklyValue}>{formatCurrency(game.totalRevenue / Math.max(1, game.week))}</Text></View>
                <View style={styles.weeklyRow}><Text style={styles.weeklyLabel}>Profit Margin</Text><Text style={styles.weeklyValue}>{game.totalRevenue > 0 ? formatPct(game.totalProfit / game.totalRevenue) : '0%'}</Text></View>
              </View>
              
              <View style={styles.analyticsCard}>
                <Text style={styles.analyticsTitle}>Customer Mix</Text>
                {Object.entries(game.customersServed.byType || {}).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([type, count]) => {
                  const ct = CUSTOMER_TYPES.find(c => c.id === type);
                  const pct = game.customersServed.total > 0 ? (count / game.customersServed.total * 100).toFixed(1) : 0;
                  return ct ? (
                    <View key={type} style={styles.weeklyRow}>
                      <Text style={styles.weeklyLabel}>{ct.icon} {ct.name}</Text>
                      <Text style={styles.weeklyValue}>{count} ({pct}%)</Text>
                    </View>
                  ) : null;
                })}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
      
      {/* Save Modal */}
      <Modal visible={saveModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Save/Load Game</Text>
              <TouchableOpacity onPress={() => setSaveModal(false)}><Text style={styles.modalClose}>✕</Text></TouchableOpacity>
            </View>
            <View style={{ padding: 16 }}>
              <Text style={styles.sectionTitle}>SAVE SLOTS</Text>
              {[1, 2, 3].map(slot => {
                const save = savedGames.find(s => s.slot === slot);
                return (
                  <View key={slot} style={styles.saveSlot}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.saveSlotTitle}>Slot {slot}</Text>
                      {save ? (
                        <>
                          <Text style={styles.saveSlotInfo}>{save.setup.restaurantName} • Week {save.game.week}</Text>
                          <Text style={styles.saveSlotDate}>{new Date(save.date).toLocaleDateString()}</Text>
                        </>
                      ) : (
                        <Text style={styles.saveSlotInfo}>Empty</Text>
                      )}
                    </View>
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      <TouchableOpacity onPress={() => saveGame(slot)} style={[styles.saveButton, { backgroundColor: colors.primary }]}>
                        <Text style={styles.saveButtonText}>Save</Text>
                      </TouchableOpacity>
                      {save && (
                        <TouchableOpacity onPress={() => loadGame(save)} style={[styles.saveButton, { backgroundColor: colors.surface }]}>
                          <Text style={[styles.saveButtonText, { color: colors.textPrimary }]}>Load</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  
  // Welcome
  welcomeContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  welcomeTitle: { fontSize: 72, fontWeight: '900', color: colors.primary, letterSpacing: -4 },
  welcomeDivider: { width: 60, height: 3, backgroundColor: colors.primary, marginVertical: 16 },
  welcomeQuote: { fontSize: 16, color: colors.textSecondary, textAlign: 'center', fontStyle: 'italic', marginBottom: 8 },
  welcomeSubtext: { fontSize: 13, color: colors.textMuted, textAlign: 'center', lineHeight: 20, marginBottom: 32 },
  startButton: { backgroundColor: colors.primary, paddingHorizontal: 48, paddingVertical: 16, borderRadius: 8 },
  startButtonText: { color: colors.background, fontSize: 16, fontWeight: '700', letterSpacing: 1 },
  versionText: { position: 'absolute', bottom: 24, fontSize: 11, color: colors.textMuted },
  
  // Onboarding
  onboardingContainer: { flex: 1 },
  onboardingContent: { padding: 24, paddingTop: 16 },
  progressBarContainer: { height: 4, backgroundColor: colors.surfaceLight, borderRadius: 2, marginBottom: 8 },
  progressBar: { height: '100%', backgroundColor: colors.primary, borderRadius: 2 },
  stepText: { fontSize: 12, color: colors.textMuted, marginBottom: 16 },
  messageBox: { backgroundColor: colors.surface, padding: 20, borderRadius: 12, marginBottom: 24, minHeight: 120 },
  messageText: { fontSize: 16, color: colors.textPrimary, lineHeight: 26 },
  cursor: { color: colors.primary },
  
  // Dropdown
  dropdownButton: { backgroundColor: colors.surface, padding: 16, borderRadius: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dropdownText: { fontSize: 16, color: colors.textPrimary },
  dropdownPlaceholder: { fontSize: 16, color: colors.textMuted },
  dropdownArrow: { color: colors.textMuted },
  
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: colors.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '85%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: colors.border },
  modalTitle: { fontSize: 18, fontWeight: '600', color: colors.textPrimary },
  modalClose: { fontSize: 24, color: colors.textMuted, padding: 4 },
  searchInput: { backgroundColor: colors.surfaceLight, margin: 16, marginTop: 8, padding: 12, borderRadius: 8, color: colors.textPrimary },
  cuisineList: { maxHeight: 400 },
  cuisineOption: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: colors.border },
  cuisineOptionSelected: { backgroundColor: colors.primary + '20' },
  cuisineIcon: { fontSize: 28, marginRight: 12 },
  cuisineInfo: { flex: 1 },
  cuisineName: { fontSize: 16, color: colors.textPrimary, fontWeight: '500' },
  cuisineNameSelected: { color: colors.primary },
  cuisineStats: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  
  // Selected cuisine
  selectedCuisine: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.primary + '20', padding: 16, borderRadius: 8, marginTop: 16 },
  selectedIcon: { fontSize: 36, marginRight: 12 },
  selectedName: { fontSize: 18, color: colors.primary, fontWeight: '600' },
  selectedStats: { fontSize: 12, color: colors.textSecondary },
  
  // Capital
  capitalDisplay: { alignItems: 'center', marginBottom: 16 },
  capitalAmount: { fontSize: 48, fontWeight: '700' },
  tierBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 4, marginTop: 8 },
  tierText: { fontSize: 12, fontWeight: '700', letterSpacing: 1 },
  tierDesc: { fontSize: 14, color: colors.textSecondary, marginTop: 8 },
  tierStats: { flexDirection: 'row', gap: 16, marginTop: 8 },
  tierStat: { fontSize: 12, color: colors.textMuted },
  slider: { width: '100%', height: 40 },
  sliderLabels: { flexDirection: 'row', justifyContent: 'space-between' },
  sliderLabel: { fontSize: 12, color: colors.textMuted },
  quickButtons: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 16, justifyContent: 'center' },
  quickButton: { paddingHorizontal: 12, paddingVertical: 8, backgroundColor: colors.surfaceLight, borderRadius: 6 },
  quickButtonActive: { backgroundColor: colors.primary },
  quickButtonText: { fontSize: 12, color: colors.textSecondary },
  quickButtonTextActive: { color: colors.background },
  
  // Text input
  textInput: { backgroundColor: colors.surface, padding: 16, borderRadius: 8, fontSize: 16, color: colors.textPrimary },
  inputLabel: { fontSize: 12, color: colors.textMuted, marginBottom: 4 },
  
  // Options
  optionRow: { flexDirection: 'row', gap: 12 },
  optionButton: { flex: 1, backgroundColor: colors.surface, padding: 16, borderRadius: 8, alignItems: 'center' },
  optionButtonActive: { backgroundColor: colors.primary + '30', borderWidth: 2, borderColor: colors.primary },
  optionText: { fontSize: 14, color: colors.textSecondary },
  optionTextActive: { color: colors.primary, fontWeight: '600' },
  
  // Goals
  goalOptions: { gap: 12 },
  goalButton: { backgroundColor: colors.surface, padding: 16, borderRadius: 8 },
  goalButtonActive: { backgroundColor: colors.primary + '20', borderWidth: 2, borderColor: colors.primary },
  goalText: { fontSize: 16, color: colors.textPrimary, fontWeight: '500' },
  goalTextActive: { color: colors.primary },
  goalDesc: { fontSize: 12, color: colors.textMuted, marginTop: 4 },
  
  // Continue button
  continueButton: { backgroundColor: colors.primary, padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 24 },
  continueButtonDisabled: { backgroundColor: colors.surfaceLight },
  continueButtonText: { fontSize: 16, fontWeight: '600', color: colors.background },
  continueButtonTextDisabled: { color: colors.textMuted },
  
  // Dashboard
  dashHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: colors.border },
  dashTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  dashSubtitle: { fontSize: 12, color: colors.textMuted },
  nextWeekButton: { backgroundColor: colors.primary, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 },
  nextWeekText: { fontSize: 13, fontWeight: '600', color: colors.background },
  dashContent: { flex: 1, padding: 16 },
  
  // Tabs
  tabContainer: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: colors.border },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderBottomColor: colors.primary },
  tabText: { fontSize: 11, color: colors.textMuted, fontWeight: '500' },
  tabTextActive: { color: colors.primary },
  
  // Warning
  warningBanner: { backgroundColor: colors.accent + '20', padding: 8, flexDirection: 'row', justifyContent: 'center', gap: 16 },
  warningText: { color: colors.accent, fontSize: 12, fontWeight: '500' },
  
  // Cash display
  cashDisplay: { backgroundColor: colors.surface, padding: 20, borderRadius: 12, marginBottom: 16 },
  cashLabel: { fontSize: 11, color: colors.textMuted, letterSpacing: 1 },
  cashAmount: { fontSize: 36, fontWeight: '700', color: colors.textPrimary, marginVertical: 4 },
  statsRow: { flexDirection: 'row', marginTop: 12 },
  statItem: { flex: 1 },
  statLabel: { fontSize: 10, color: colors.textMuted, letterSpacing: 0.5 },
  statValue: { fontSize: 16, fontWeight: '600', color: colors.textPrimary, marginTop: 2 },
  
  // Burnout
  burnoutCard: { backgroundColor: colors.surface, padding: 16, borderRadius: 12, marginBottom: 16 },
  burnoutHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  burnoutLabel: { fontSize: 14, color: colors.textSecondary },
  burnoutValue: { fontSize: 16, fontWeight: '700' },
  burnoutBarBg: { height: 6, backgroundColor: colors.surfaceLight, borderRadius: 3, marginTop: 8 },
  burnoutBar: { height: '100%', borderRadius: 3 },
  
  // Weekly
  weeklyCard: { backgroundColor: colors.surface, padding: 16, borderRadius: 12, marginBottom: 12 },
  weeklyTitle: { fontSize: 12, color: colors.textMuted, letterSpacing: 1, marginBottom: 12 },
  weeklyRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  weeklyLabel: { fontSize: 14, color: colors.textSecondary },
  weeklyValue: { fontSize: 14, color: colors.textPrimary, fontWeight: '500' },
  weeklyTotalRow: { borderTopWidth: 1, borderTopColor: colors.border, marginTop: 8, paddingTop: 12 },
  weeklyTotalLabel: { fontSize: 16, color: colors.textPrimary, fontWeight: '600' },
  weeklyTotalValue: { fontSize: 18, fontWeight: '700' },
  
  // Quick actions
  quickAction: { backgroundColor: colors.surface, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 6 },
  quickActionText: { fontSize: 12, color: colors.textSecondary },
  
  // Active badges
  activeBadge: { backgroundColor: colors.surfaceLight, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  activeBadgeText: { fontSize: 10, color: colors.textSecondary },
  
  // Section
  sectionTitle: { fontSize: 12, color: colors.textMuted, letterSpacing: 1, marginBottom: 12, fontWeight: '600' },
  addButton: { backgroundColor: colors.primary, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 6 },
  addButtonText: { fontSize: 12, fontWeight: '600', color: colors.background },
  
  // Menu
  menuItem: { backgroundColor: colors.surface, padding: 12, borderRadius: 8, marginBottom: 8, flexDirection: 'row', alignItems: 'center' },
  menuItem86d: { opacity: 0.6 },
  menuItemName: { fontSize: 14, fontWeight: '500', color: colors.textPrimary },
  menuItemStats: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
  menuAction: { backgroundColor: colors.surfaceLight, width: 32, height: 32, borderRadius: 6, justifyContent: 'center', alignItems: 'center' },
  menuActionText: { fontSize: 12 },
  tag86d: { backgroundColor: colors.accent, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, fontSize: 10, color: colors.textPrimary },
  
  // Staff
  staffCard: { backgroundColor: colors.surface, padding: 12, borderRadius: 8, marginBottom: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  staffInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  staffIcon: { fontSize: 24, marginRight: 10 },
  staffName: { fontSize: 14, fontWeight: '500', color: colors.textPrimary },
  staffRole: { fontSize: 11, color: colors.textMuted },
  certBadge: { backgroundColor: colors.info + '30', paddingHorizontal: 4, paddingVertical: 1, borderRadius: 3, fontSize: 8, color: colors.info },
  fireButton: { backgroundColor: colors.accent, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 },
  fireButtonText: { fontSize: 11, fontWeight: '500', color: colors.textPrimary },
  
  // Hire
  hireGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  hireCard: { backgroundColor: colors.surface, padding: 12, borderRadius: 8, width: (width - 48) / 4, alignItems: 'center' },
  hireIcon: { fontSize: 24 },
  hireRole: { fontSize: 10, color: colors.textSecondary, marginTop: 4, textAlign: 'center' },
  hireWage: { fontSize: 10, color: colors.textMuted },
  
  // Training
  trainingOption: { flexDirection: 'row', alignItems: 'center', padding: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
  trainingName: { fontSize: 14, color: colors.textPrimary },
  trainingInfo: { fontSize: 11, color: colors.textMuted },
  trainingCert: { fontSize: 10, color: colors.info },
  
  // Equipment
  equipCard: { backgroundColor: colors.surface, padding: 10, borderRadius: 8, width: (width - 56) / 3, alignItems: 'center' },
  equipCardOwned: { backgroundColor: colors.success + '20', borderWidth: 1, borderColor: colors.success },
  equipName: { fontSize: 9, color: colors.textSecondary, marginTop: 4, textAlign: 'center' },
  equipCost: { fontSize: 9, color: colors.textMuted },
  
  // Marketing
  marketingItem: { flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: colors.surfaceLight, borderRadius: 8, marginBottom: 8 },
  marketingItemActive: { backgroundColor: colors.success + '20', borderWidth: 1, borderColor: colors.success },
  marketingName: { fontSize: 14, color: colors.textPrimary },
  marketingCost: { fontSize: 11, color: colors.textMuted },
  
  // Analytics
  analyticsCard: { backgroundColor: colors.surfaceLight, padding: 12, borderRadius: 8, marginBottom: 12 },
  analyticsTitle: { fontSize: 12, color: colors.textMuted, marginBottom: 8 },
  
  // Achievements
  achievementCategory: { fontSize: 11, color: colors.textMuted, letterSpacing: 1, marginBottom: 8 },
  achievementBadge: { backgroundColor: colors.surface, padding: 8, borderRadius: 8, width: (width - 56) / 3, alignItems: 'center' },
  achievementUnlocked: { backgroundColor: colors.primary + '20', borderWidth: 1, borderColor: colors.primary },
  achievementName: { fontSize: 10, color: colors.textPrimary, marginTop: 4, textAlign: 'center', fontWeight: '500' },
  achievementDesc: { fontSize: 8, color: colors.textMuted, textAlign: 'center' },
  
  // Scenario
  scenarioContainer: { flex: 1 },
  scenarioContent: { padding: 24 },
  scenarioHeader: { alignItems: 'center', marginBottom: 8 },
  scenarioTypeBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 4 },
  scenarioTypeText: { fontSize: 10, fontWeight: '700', color: colors.textPrimary, letterSpacing: 1 },
  scenarioTitle: { fontSize: 24, fontWeight: '700', color: colors.textPrimary, textAlign: 'center' },
  scenarioSubtitle: { fontSize: 12, color: colors.textMuted, textAlign: 'center', marginBottom: 20 },
  scenarioMessageBox: { backgroundColor: colors.surface, padding: 20, borderRadius: 12, marginBottom: 20 },
  scenarioMessage: { fontSize: 15, color: colors.textPrimary, lineHeight: 24 },
  scenarioOption: { backgroundColor: colors.surface, padding: 16, borderRadius: 8, marginBottom: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  scenarioOptionText: { fontSize: 14, color: colors.textPrimary, flex: 1 },
  scenarioChance: { fontSize: 12, color: colors.textMuted },
  scenarioResult: { alignItems: 'center', marginVertical: 20 },
  scenarioResultText: { fontSize: 18, fontWeight: '700', marginBottom: 16 },
  lessonBox: { backgroundColor: colors.surfaceLight, padding: 16, borderRadius: 8, marginTop: 20 },
  lessonLabel: { fontSize: 10, color: colors.textMuted, letterSpacing: 1, marginBottom: 8 },
  lessonText: { fontSize: 13, color: colors.textSecondary, fontStyle: 'italic' },
  
  // End screens
  endContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  endTitle: { fontSize: 28, fontWeight: '700', color: colors.accent },
  endSubtitle: { fontSize: 16, color: colors.textSecondary, marginTop: 8 },
  endDivider: { width: 60, height: 3, marginVertical: 24 },
  endMessage: { fontSize: 16, color: colors.textMuted, marginBottom: 24 },
  endStats: { width: '100%', backgroundColor: colors.surface, padding: 20, borderRadius: 12, marginBottom: 24 },
  endStatRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  endStatLabel: { fontSize: 14, color: colors.textSecondary },
  endStatValue: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
  winCondition: { fontSize: 20, fontWeight: '700', textAlign: 'center', marginBottom: 16 },
  restartButton: { backgroundColor: colors.primary, paddingHorizontal: 32, paddingVertical: 14, borderRadius: 8 },
  restartButtonText: { fontSize: 16, fontWeight: '600', color: colors.background },
  
  // Save slots
  saveSlot: { flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: colors.surfaceLight, borderRadius: 8, marginBottom: 8 },
  saveSlotTitle: { fontSize: 14, fontWeight: '500', color: colors.textPrimary },
  saveSlotInfo: { fontSize: 12, color: colors.textMuted },
  saveSlotDate: { fontSize: 10, color: colors.textMuted },
  saveButton: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  saveButtonText: { fontSize: 12, fontWeight: '500', color: colors.background },
});

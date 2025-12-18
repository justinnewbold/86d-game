// ============================================
// PRESTIGE & LEGACY SYSTEMS
// ============================================

export const PRESTIGE_BONUSES = [
  { level: 1, name: 'Experienced Owner', bonus: 'Start with +$10K and +5% reputation', cashBonus: 10000, repBonus: 5 },
  { level: 2, name: 'Seasoned Pro', bonus: 'Start with +$25K and industry contacts', cashBonus: 25000, repBonus: 8, vendorDiscount: 0.05 },
  { level: 3, name: 'Industry Veteran', bonus: 'Start with +$50K and loyal staff', cashBonus: 50000, repBonus: 10, startingStaff: 3 },
  { level: 4, name: 'Restaurant Legend', bonus: 'Start with +$100K and fame', cashBonus: 100000, repBonus: 15, startingStaff: 5 },
  { level: 5, name: 'Culinary Titan', bonus: 'Start with +$250K empire', cashBonus: 250000, repBonus: 20, startingStaff: 8 },
];

export const PRESTIGE_UPGRADES = [
  { id: 'golden_spoon', name: 'Golden Spoon', icon: '🥄', cost: 1, effect: 'Start with +10% reputation', bonus: { reputationMultiplier: 1.1 } },
  { id: 'veteran_network', name: 'Veteran Network', icon: '🤝', cost: 1, effect: 'Start with 2 trained staff', bonus: { startingStaff: 2 } },
  { id: 'seed_funding', name: 'Seed Funding', icon: '💰', cost: 2, effect: 'Start with +$25K capital', bonus: { startingCapital: 25000 } },
  { id: 'industry_cred', name: 'Industry Credibility', icon: '⭐', cost: 2, effect: '+5% to all revenue', bonus: { revenueMultiplier: 1.05 } },
  { id: 'mentor_hotline', name: 'Mentor Hotline', icon: '📞', cost: 3, effect: 'AI mentor gives better advice', bonus: { mentorBonus: true } },
  { id: 'supplier_deals', name: 'Supplier Deals', icon: '📦', cost: 3, effect: '-5% food costs', bonus: { foodCostReduction: 0.05 } },
  { id: 'media_darling', name: 'Media Darling', icon: '📺', cost: 4, effect: '+20% marketing effectiveness', bonus: { marketingMultiplier: 1.2 } },
  { id: 'real_estate_mogul', name: 'Real Estate Mogul', icon: '🏠', cost: 5, effect: '-10% rent costs', bonus: { rentReduction: 0.1 } },
];

export const LEGACY_PERKS = [
  { id: 'seed_capital', name: 'Family Money', icon: '💰', desc: '+$5K starting capital per level', levels: 5, effect: { startingCapital: 5000 }, cost: 50 },
  { id: 'industry_contacts', name: 'Industry Contacts', icon: '📞', desc: '+5% vendor discounts per level', levels: 5, effect: { vendorDiscount: 0.05 }, cost: 75 },
  { id: 'reputation_head_start', name: 'Word of Mouth', icon: '⭐', desc: '+3 starting reputation per level', levels: 5, effect: { startingRep: 3 }, cost: 60 },
  { id: 'staff_network', name: 'Talent Pipeline', icon: '👥', desc: '+1 starting staff skill per level', levels: 3, effect: { staffSkillBonus: 1 }, cost: 100 },
  { id: 'real_estate_savvy', name: 'Real Estate Savvy', icon: '🏠', desc: '-3% rent per level', levels: 5, effect: { rentDiscount: 0.03 }, cost: 80 },
  { id: 'business_acumen', name: 'Business Acumen', icon: '📊', desc: '+2% profit margin per level', levels: 5, effect: { profitBonus: 0.02 }, cost: 90 },
  { id: 'crisis_management', name: 'Crisis Management', icon: '🛡️', desc: 'Reduce crisis severity by 10% per level', levels: 3, effect: { crisisReduction: 0.10 }, cost: 120 },
  { id: 'media_presence', name: 'Media Presence', icon: '📺', desc: '+10% marketing effectiveness per level', levels: 4, effect: { marketingBoost: 0.10 }, cost: 85 },
];

export const PROTEGE_TYPES = [
  { id: 'aspiring_chef', name: 'Aspiring Chef', icon: '👨‍🍳', trainTime: 26, cost: 15000, weeklyBenefit: 500, specialization: 'kitchen', desc: 'A passionate cook looking to learn' },
  { id: 'future_owner', name: 'Future Owner', icon: '🏪', trainTime: 52, cost: 50000, weeklyBenefit: 2000, specialization: 'management', desc: 'Entrepreneur wanting your secrets' },
  { id: 'culinary_student', name: 'Culinary Student', icon: '📚', trainTime: 13, cost: 5000, weeklyBenefit: 200, specialization: 'all', desc: 'Eager student from culinary school' },
  { id: 'career_changer', name: 'Career Changer', icon: '🔄', trainTime: 39, cost: 25000, weeklyBenefit: 1000, specialization: 'operations', desc: 'Professional switching to hospitality' },
  { id: 'family_member', name: 'Family Member', icon: '👨‍👩‍👧', trainTime: 52, cost: 10000, weeklyBenefit: 1500, specialization: 'loyalty', desc: 'Keep it in the family', loyaltyBonus: true },
];

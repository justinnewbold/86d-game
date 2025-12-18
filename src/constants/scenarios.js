// ============================================
// GAME SCENARIOS
// ============================================

export const SCENARIOS = [
  // CRISIS SCENARIOS
  {
    id: 'health_inspection', type: 'crisis', title: '🏥 Health Inspection',
    message: 'Health inspector just walked in unannounced. Your kitchen is about to be evaluated.',
    options: [
      { text: 'Welcome them confidently', successChance: 0.7, success: { reputation: 5, achievement: 'clean_kitchen' }, fail: { cash: -2000, reputation: -15 } },
      { text: 'Stall while staff cleans up', successChance: 0.4, success: { reputation: 2 }, fail: { cash: -3000, reputation: -20 } },
    ],
    lesson: 'Keep your kitchen inspection-ready at all times.',
    minWeek: 2,
  },
  {
    id: 'staff_walkout', type: 'crisis', title: '🚪 Staff Walkout',
    message: 'Three of your staff are threatening to quit unless they get raises. It\'s Friday at 4pm.',
    options: [
      { text: 'Give 10% raises immediately', successChance: 0.9, success: { laborCostMod: 0.1, morale: 15 }, fail: { staff: -1 } },
      { text: 'Negotiate - offer 5% now, 5% in 3 months', successChance: 0.6, success: { laborCostMod: 0.05, morale: 5 }, fail: { staff: -2, morale: -20 } },
      { text: 'Call their bluff', successChance: 0.3, success: { reputation: 5 }, fail: { staff: -3, reputation: -10, morale: -30 } },
    ],
    lesson: 'Invest in your team before problems escalate.',
    minWeek: 8,
  },
  {
    id: 'equipment_failure', type: 'crisis', title: '🔧 Equipment Breakdown',
    message: 'Your main cooler died overnight. You have about 4 hours before food spoils.',
    options: [
      { text: 'Emergency repair ($3,500)', successChance: 0.85, success: { cash: -3500 }, fail: { cash: -3500, foodWaste: 2500 } },
      { text: 'Buy bags of ice, get creative ($200)', successChance: 0.5, success: { cash: -200 }, fail: { cash: -200, foodWaste: 4000 } },
      { text: 'Close for the day, salvage what you can', successChance: 1.0, success: { cash: -1500, reputation: -5 }, fail: {} },
    ],
    lesson: 'Budget for equipment emergencies.',
    minWeek: 4,
  },
  {
    id: 'viral_review', type: 'opportunity', title: '📱 Viral Review',
    message: 'A food blogger with 500K followers loved your food and wants to feature you.',
    options: [
      { text: 'Roll out the red carpet', successChance: 0.75, success: { reputation: 20, covers: 50, followers: 500 }, fail: { reputation: -10 } },
      { text: 'Treat them like anyone else', successChance: 0.5, success: { reputation: 10, followers: 100 }, fail: { reputation: -5 } },
    ],
    lesson: 'Every guest could be your next advocate or critic.',
    minWeek: 6,
  },
  {
    id: 'catering_gig', type: 'opportunity', title: '🎉 Catering Opportunity',
    message: 'A local company wants you to cater their 200-person corporate event next month.',
    options: [
      { text: 'Accept the $12,000 contract', successChance: 0.7, success: { cash: 12000, reputation: 10, burnout: 10 }, fail: { cash: 4000, reputation: -15 } },
      { text: 'Negotiate for $15,000', successChance: 0.5, success: { cash: 15000, reputation: 10 }, fail: { reputation: -5 } },
      { text: 'Politely decline - too risky', successChance: 1.0, success: {}, fail: {} },
    ],
    lesson: 'Catering is high-margin but high-stakes.',
    minWeek: 8,
  },
  {
    id: 'second_location_opportunity', type: 'opportunity', title: '🏢 Second Location',
    message: 'A great location just opened up. Similar demographics, reasonable rent. This could be your chance to expand.',
    options: [
      { text: 'Pursue it - start negotiations', successChance: 0.8, success: { expansionOpportunity: true }, fail: { cash: -5000, burnout: 10 } },
      { text: 'Not ready - need more runway', successChance: 1.0, success: { reputation: 2 }, fail: {} },
    ],
    lesson: 'Second locations fail at 2x the rate of first ones. Perfect your systems first.',
    minWeek: 52,
    minCash: 150000,
    maxLocations: 1,
  },
];

export const PHASE_6_SCENARIOS = [
  {
    id: 'vc_interest', type: 'opportunity', title: '🚀 VC Interest',
    message: 'A venture capital firm sees potential in your brand. They want to invest $1M for 25% equity and a board seat. They expect 10x growth in 5 years.',
    options: [
      { text: 'Accept the investment', successChance: 1.0, success: { cash: 1000000, equity: -25, addInvestor: 'vc' }, fail: {} },
      { text: 'Negotiate for 20%', successChance: 0.5, success: { cash: 1000000, equity: -20, addInvestor: 'vc' }, fail: { reputation: -2 } },
      { text: 'Decline - stay independent', successChance: 1.0, success: { reputation: 5 }, fail: {} },
    ],
    lesson: 'VC money comes with strings. Make sure your vision aligns with their timeline.',
    minValuation: 2000000,
  },
  {
    id: 'real_estate_opportunity', type: 'opportunity', title: '🏢 Buy Your Building',
    message: 'Your landlord is selling the building. You have first right of refusal at $800K. Property values have been rising 5% annually.',
    options: [
      { text: 'Buy it (25% down)', successChance: 0.9, success: { cash: -200000, addProperty: true, monthlyRent: 0 }, fail: { cash: -50000 } },
      { text: 'Negotiate lower price', successChance: 0.4, success: { cash: -160000, addProperty: true }, fail: { newLandlord: true, rentIncrease: 0.15 } },
      { text: 'Pass - stay a tenant', successChance: 1.0, success: { newLandlord: true, rentIncrease: 0.1 }, fail: {} },
    ],
    lesson: 'Owning real estate builds wealth but ties up capital. Know your priorities.',
    minCash: 200000,
  },
  {
    id: 'catering_contract', type: 'opportunity', title: '💼 Corporate Contract',
    message: 'A Fortune 500 company wants you to cater their campus cafeteria. $6K/week guaranteed for 2 years, but you need to hire dedicated staff.',
    options: [
      { text: 'Accept the contract', successChance: 0.85, success: { weeklyIncome: 6000, hireRequired: 5, addContract: 'tech_campus' }, fail: { reputation: -10, penalty: 25000 } },
      { text: 'Counter with higher margin', successChance: 0.4, success: { weeklyIncome: 7500, hireRequired: 5 }, fail: {} },
      { text: 'Decline - focus on restaurant', successChance: 1.0, success: {}, fail: {} },
    ],
    lesson: 'Contract food service is steady but low-margin. It\'s a different business model.',
    minLocations: 1,
    minReputation: 65,
  },
  {
    id: 'food_truck_offer', type: 'opportunity', title: '🚚 Food Truck Opportunity',
    message: 'A food truck builder is offering a custom truck at 30% off ($55K). Perfect for testing new markets and events.',
    options: [
      { text: 'Buy the truck', successChance: 1.0, success: { cash: -55000, addTruck: 'premium' }, fail: {} },
      { text: 'Start with a cart instead ($8K)', successChance: 1.0, success: { cash: -8000, addTruck: 'cart' }, fail: {} },
      { text: 'Not interested right now', successChance: 1.0, success: {}, fail: {} },
    ],
    lesson: 'Food trucks are lower risk expansion but operationally complex. Start small.',
    minCash: 60000,
  },
  {
    id: 'tv_show_invite', type: 'opportunity', title: '🎬 Reality Show Invitation',
    message: 'A food reality show wants to feature your restaurant! Great exposure but they want drama and access for 3 weeks.',
    options: [
      { text: 'Accept - embrace the spotlight', successChance: 0.7, success: { reputation: 25, reach: 0.3, morale: -10 }, fail: { reputation: -15, morale: -20 } },
      { text: 'Accept with conditions', successChance: 0.5, success: { reputation: 15, reach: 0.2 }, fail: { reputation: -5 } },
      { text: 'Decline politely', successChance: 1.0, success: { reputation: 2 }, fail: {} },
    ],
    lesson: 'Media exposure is a double-edged sword. The wrong story can hurt more than help.',
    minReputation: 75,
  },
  {
    id: 'recession_hits', type: 'crisis', title: '📉 Economic Recession',
    message: 'The economy has entered recession. Consumer spending is down 25% and unemployment is rising. How do you adapt?',
    options: [
      { text: 'Cut costs aggressively', successChance: 0.8, success: { costs: -0.2, morale: -15, quality: -0.1 }, fail: { reputation: -10, morale: -25 } },
      { text: 'Launch value menu', successChance: 0.7, success: { avgTicket: -0.15, covers: 0.1, reputation: 5 }, fail: { margin: -0.1 } },
      { text: 'Double down on quality', successChance: 0.5, success: { reputation: 15, premiumCustomers: 0.2 }, fail: { cash: -20000, covers: -0.2 } },
    ],
    lesson: 'Recessions test your business model. Value and quality both have paths forward.',
    economic: 'recession',
  },
  {
    id: 'cookbook_deal', type: 'opportunity', title: '📚 Cookbook Offer',
    message: 'A publisher wants to release your cookbook. $50K advance plus 8% royalties. You\'ll need to dedicate significant time.',
    options: [
      { text: 'Accept the deal', successChance: 0.8, success: { cash: 50000, reputation: 10, burnout: 15 }, fail: { reputation: -5 } },
      { text: 'Negotiate ghostwriter', successChance: 0.6, success: { cash: 35000, reputation: 8 }, fail: {} },
      { text: 'Decline - too busy', successChance: 1.0, success: {}, fail: {} },
    ],
    lesson: 'Side projects can build your brand but distract from operations. Delegate well.',
    minReputation: 75,
  },
  {
    id: 'ipo_banker', type: 'opportunity', title: '📈 IPO Discussion',
    message: 'An investment banker believes your company could go public. The process would take 2 years and cost $2M, but could value you at 1.5x current.',
    options: [
      { text: 'Begin IPO process', successChance: 0.6, success: { startIPO: true, cash: -500000 }, fail: { cash: -200000, reputation: -10 } },
      { text: 'Explore SPAC merger instead', successChance: 0.5, success: { startSPAC: true, cash: -250000 }, fail: {} },
      { text: 'Not ready yet', successChance: 1.0, success: {}, fail: {} },
    ],
    lesson: 'Public companies face scrutiny private ones don\'t. Make sure you\'re ready.',
    minValuation: 25000000,
    minLocations: 25,
  },
];

// Note: EMPIRE_SCENARIOS, INVESTOR_SCENARIOS, and BRANCHING_SCENARIOS are available in the main file
// They are included here as comments for reference but can be added if needed

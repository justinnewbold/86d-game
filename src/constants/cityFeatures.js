// ============================================
// CITY-SPECIFIC FEATURES
// ============================================
// Scenarios, cuisine synergies, regional weather, and labor market data

// ============================================
// CITY-SPECIFIC SCENARIOS
// ============================================
// These scenarios trigger based on the player's chosen city

export const CITY_SCENARIOS = [
  // AUSTIN, TX
  {
    id: 'sxsw_opportunity',
    city: 'Austin',
    state: 'TX',
    title: 'SXSW is Coming!',
    message: 'South by Southwest kicks off next week. The city will be flooded with tech workers, musicians, and foodies. This could be huge - or a total disaster if you\'re not prepared.',
    type: 'opportunity',
    minWeek: 8,
    weekRange: [10, 14], // Triggers in weeks 10-14 (March timing)
    options: [
      { text: 'Go all out - extended hours, special menu, extra staff', successChance: 0.7, success: { cash: 25000, reputation: 15, covers: 100, burnout: 15 }, fail: { cash: -8000, morale: -15, burnout: 20 } },
      { text: 'Modest prep - hire one extra person, stock up', successChance: 0.85, success: { cash: 12000, reputation: 8, covers: 50 }, fail: { cash: -3000, morale: -5 } },
      { text: 'Business as usual - avoid the chaos', successChance: 1.0, success: { reputation: -5 }, fail: {} },
    ],
  },
  {
    id: 'austin_food_truck_competition',
    city: 'Austin',
    state: 'TX',
    title: 'Food Truck Rally Next Door',
    message: 'A massive food truck rally is setting up in your parking lot area. Austin\'s food truck scene is legendary - this could steal your lunch crowd or drive awareness.',
    type: 'decision',
    minWeek: 4,
    options: [
      { text: 'Partner with them - offer indoor seating for their customers', successChance: 0.8, success: { cash: 5000, reputation: 10, followers: 200 }, fail: { reputation: -5 } },
      { text: 'Compete head-on - sidewalk specials and samples', successChance: 0.6, success: { cash: 8000, reputation: 5 }, fail: { cash: -2000, reputation: -10 } },
      { text: 'Ignore it - focus on regulars', successChance: 1.0, success: { covers: -20 }, fail: {} },
    ],
  },

  // NEW ORLEANS, LA
  {
    id: 'mardi_gras',
    city: 'New Orleans',
    state: 'LA',
    title: 'Mardi Gras Madness!',
    message: 'Laissez les bons temps rouler! Mardi Gras is upon us. The French Quarter will be packed. Your staff is asking for time off, but this could be your biggest week ever.',
    type: 'opportunity',
    minWeek: 6,
    weekRange: [6, 10],
    options: [
      { text: 'All hands on deck - double pay, special Mardi Gras menu', successChance: 0.75, success: { cash: 40000, reputation: 20, covers: 150, burnout: 25 }, fail: { cash: -10000, morale: -25, burnout: 30 } },
      { text: 'Skeleton crew - let some staff enjoy, capture what you can', successChance: 0.9, success: { cash: 15000, morale: 10, reputation: 5 }, fail: { cash: 5000 } },
      { text: 'Close for the week - too chaotic', successChance: 1.0, success: { cash: -5000, morale: 15, burnout: -10 }, fail: {} },
    ],
  },
  {
    id: 'nola_jazz_fest',
    city: 'New Orleans',
    state: 'LA',
    title: 'Jazz Fest Season',
    message: 'Jazz & Heritage Festival brings 400,000+ music lovers to the city over two weekends. Late nights, hungry crowds, and tips flowing like the Mississippi.',
    type: 'opportunity',
    minWeek: 16,
    weekRange: [16, 20],
    options: [
      { text: 'Extended hours till 2am with live music', successChance: 0.7, success: { cash: 30000, reputation: 15, followers: 500 }, fail: { cash: -5000, morale: -20 } },
      { text: 'Partner with local musicians for dinner shows', successChance: 0.85, success: { cash: 18000, reputation: 12 }, fail: { cash: 2000 } },
      { text: 'Regular hours - Jazz Fest crowd isn\'t our demographic', successChance: 1.0, success: {}, fail: {} },
    ],
  },

  // NEW YORK CITY
  {
    id: 'nyc_restaurant_week',
    city: 'New York City',
    state: 'NY',
    title: 'NYC Restaurant Week',
    message: 'Restaurant Week is here - the city\'s biggest dining event. Prix fixe menus at $45 bring crowds, but margins are razor-thin. It\'s about exposure, not profit.',
    type: 'decision',
    minWeek: 4,
    weekRange: [4, 8],
    options: [
      { text: 'Participate fully - $45 prix fixe, go for volume', successChance: 0.8, success: { cash: 5000, reputation: 20, covers: 200, followers: 300 }, fail: { cash: -8000, reputation: 5 } },
      { text: 'Limited participation - lunch only', successChance: 0.9, success: { cash: 3000, reputation: 10, covers: 80 }, fail: { cash: -2000 } },
      { text: 'Skip it - we don\'t need the exposure hit', successChance: 1.0, success: {}, fail: {} },
    ],
  },
  {
    id: 'nyc_michelin_inspector',
    city: 'New York City',
    state: 'NY',
    title: 'Michelin Inspector Rumored',
    message: 'Word on the street: Michelin inspectors are making rounds in your neighborhood. Your sous chef swears one was in last week. Time to bring your A-game?',
    type: 'decision',
    minWeek: 20,
    minReputation: 70,
    options: [
      { text: 'Obsess over every plate - highest quality, no shortcuts', successChance: 0.3, success: { reputation: 30, cash: 20000, followers: 1000 }, fail: { cash: -5000, burnout: 15 } },
      { text: 'Consistent excellence - what we always do', successChance: 0.5, success: { reputation: 15, cash: 8000 }, fail: { reputation: 5 } },
      { text: 'Stars are overrated - focus on the regulars', successChance: 1.0, success: {}, fail: {} },
    ],
  },

  // MIAMI, FL
  {
    id: 'miami_art_basel',
    city: 'Miami',
    state: 'FL',
    title: 'Art Basel Miami Beach',
    message: 'The art world descends on Miami. Galleries, collectors, celebrities - they all need to eat, and they\'re not afraid to spend. Your location is prime.',
    type: 'opportunity',
    minWeek: 48,
    weekRange: [48, 52],
    options: [
      { text: 'Host art installations, collaborate with galleries', successChance: 0.7, success: { cash: 35000, reputation: 25, followers: 800 }, fail: { cash: -10000, reputation: -5 } },
      { text: 'VIP reservations only, premium pricing', successChance: 0.8, success: { cash: 25000, reputation: 10 }, fail: { cash: 5000 } },
      { text: 'Too pretentious for us', successChance: 1.0, success: {}, fail: {} },
    ],
  },
  {
    id: 'miami_hurricane_warning',
    city: 'Miami',
    state: 'FL',
    title: 'Hurricane Warning Issued',
    message: 'A Category 3 hurricane is tracking toward South Florida. Evacuations are possible. Do you board up and protect your investment, or try to serve the holdouts?',
    type: 'crisis',
    minWeek: 24,
    weekRange: [24, 44], // Hurricane season June-October
    options: [
      { text: 'Close and evacuate - safety first', successChance: 0.95, success: { cash: -8000, morale: 10 }, fail: { cash: -30000 } },
      { text: 'Stay open for essential workers and holdouts', successChance: 0.5, success: { cash: 15000, reputation: 20, morale: 15 }, fail: { cash: -50000, reputation: -20 } },
      { text: 'Prep and wait - make the call day-of', successChance: 0.7, success: { cash: -3000 }, fail: { cash: -15000 } },
    ],
  },

  // LAS VEGAS, NV
  {
    id: 'vegas_convention',
    city: 'Las Vegas',
    state: 'NV',
    title: 'CES Convention in Town',
    message: '170,000 tech executives flood Vegas for CES. They have expense accounts and no time to cook. Every restaurant is slammed.',
    type: 'opportunity',
    minWeek: 1,
    weekRange: [1, 4],
    options: [
      { text: 'Extended hours, corporate catering packages', successChance: 0.85, success: { cash: 30000, reputation: 10, covers: 120 }, fail: { cash: 5000 } },
      { text: 'Premium pricing only - they can afford it', successChance: 0.75, success: { cash: 22000 }, fail: { cash: -2000, reputation: -5 } },
      { text: 'Avoid the madness', successChance: 1.0, success: {}, fail: {} },
    ],
  },
  {
    id: 'vegas_high_roller',
    city: 'Las Vegas',
    state: 'NV',
    title: 'High Roller Wants Private Dinner',
    message: 'A casino host calls - a whale wants to book your entire restaurant for a private party. 20 guests, money is no object. But you\'d have to turn away your regulars tonight.',
    type: 'decision',
    minWeek: 8,
    options: [
      { text: 'Accept - name your price ($15K minimum)', successChance: 0.9, success: { cash: 18000, reputation: 5 }, fail: { cash: 8000 } },
      { text: 'Counter-offer - half the restaurant, half the night', successChance: 0.7, success: { cash: 10000, reputation: 8 }, fail: { cash: 3000, reputation: -3 } },
      { text: 'Decline - loyalty to regulars matters', successChance: 1.0, success: { reputation: 5, morale: 5 }, fail: {} },
    ],
  },

  // SAN FRANCISCO, CA
  {
    id: 'sf_tech_ipo',
    city: 'San Francisco',
    state: 'CA',
    title: 'Tech Company IPO Celebration',
    message: 'A unicorn startup just went public and their CEO wants to celebrate at YOUR restaurant. The press will be there. This is a moment.',
    type: 'opportunity',
    minWeek: 10,
    minReputation: 60,
    options: [
      { text: 'Roll out the red carpet - everything perfect', successChance: 0.8, success: { cash: 25000, reputation: 25, followers: 2000 }, fail: { cash: -5000, reputation: -15 } },
      { text: 'Standard service - let the food speak', successChance: 0.9, success: { cash: 15000, reputation: 10 }, fail: { cash: 8000 } },
      { text: 'Politely decline - too much pressure', successChance: 1.0, success: {}, fail: {} },
    ],
  },
  {
    id: 'sf_earthquake_drill',
    city: 'San Francisco',
    state: 'CA',
    title: 'The Big One? Earthquake!',
    message: 'A 5.2 magnitude earthquake just hit. No major damage, but customers are shaken (literally). Some staff want to go check on family.',
    type: 'crisis',
    minWeek: 4,
    options: [
      { text: 'Close early, let everyone go home', successChance: 1.0, success: { cash: -2000, morale: 15 }, fail: {} },
      { text: 'Let worried staff leave, skeleton crew continues', successChance: 0.9, success: { cash: -500, morale: 5 }, fail: { morale: -10 } },
      { text: 'Business as usual - it was just a tremor', successChance: 0.7, success: { cash: 1000 }, fail: { morale: -20, reputation: -10 } },
    ],
  },

  // CHICAGO, IL
  {
    id: 'chicago_polar_vortex',
    city: 'Chicago',
    state: 'IL',
    title: 'Polar Vortex Warning',
    message: 'Wind chill of -40°F expected. The city is shutting down. Your staff can\'t safely commute, but there are people stuck downtown who need to eat.',
    type: 'crisis',
    minWeek: 1,
    weekRange: [1, 10],
    options: [
      { text: 'Close - not worth the risk', successChance: 1.0, success: { cash: -3000, morale: 10 }, fail: {} },
      { text: 'Skeleton crew of nearby staff only, limited menu', successChance: 0.85, success: { cash: 8000, reputation: 15, morale: 10 }, fail: { cash: -1000 } },
      { text: 'Delivery only through apps', successChance: 0.9, success: { cash: 4000 }, fail: { cash: 500 } },
    ],
  },
  {
    id: 'chicago_cubs_world_series',
    city: 'Chicago',
    state: 'IL',
    title: 'Cubs in the Playoffs!',
    message: 'The Cubs are making a playoff run. Wrigleyville is electric. Sports bars are packed, but so is everywhere within 2 miles of the stadium.',
    type: 'opportunity',
    minWeek: 40,
    weekRange: [40, 46],
    options: [
      { text: 'Game day specials, big screens, team spirit', successChance: 0.85, success: { cash: 20000, reputation: 10, covers: 80 }, fail: { cash: 3000 } },
      { text: 'Capitalize on the spillover - business as usual with faster service', successChance: 0.9, success: { cash: 12000, covers: 40 }, fail: { cash: 5000 } },
      { text: 'Sports bars aren\'t our vibe', successChance: 1.0, success: { covers: -30 }, fail: {} },
    ],
  },

  // SEATTLE, WA
  {
    id: 'seattle_amazon_hq',
    city: 'Seattle',
    state: 'WA',
    title: 'Amazon Campus Lunch Rush',
    message: 'Amazon is opening a new building near you. 5,000 employees, all with good salaries and limited lunch options. They\'re scouting local restaurants.',
    type: 'opportunity',
    minWeek: 12,
    options: [
      { text: 'Corporate catering pitch - bulk lunch orders', successChance: 0.7, success: { cash: 15000, covers: 100 }, fail: { cash: -2000 } },
      { text: 'Fast-casual lunch menu - quick in, quick out', successChance: 0.85, success: { cash: 10000, covers: 60 }, fail: { cash: 2000 } },
      { text: 'We\'re not a lunch spot', successChance: 1.0, success: {}, fail: {} },
    ],
  },
  {
    id: 'seattle_rain_streak',
    city: 'Seattle',
    state: 'WA',
    title: '30 Days of Rain',
    message: 'The Seattle Drizzle™ has turned into a monsoon. It\'s been raining for a month straight. Foot traffic is down, but delivery is up.',
    type: 'decision',
    minWeek: 40,
    weekRange: [40, 52],
    options: [
      { text: 'Cozy up - fireplace vibes, comfort food specials', successChance: 0.9, success: { cash: 5000, reputation: 10 }, fail: { cash: 1000 } },
      { text: 'Push delivery hard - partner promos', successChance: 0.85, success: { cash: 8000 }, fail: { cash: 2000 } },
      { text: 'Wait it out', successChance: 1.0, success: { covers: -20 }, fail: {} },
    ],
  },

  // DENVER, CO
  {
    id: 'denver_420',
    city: 'Denver',
    state: 'CO',
    title: '4/20 Weekend',
    message: 'It\'s April 20th weekend. Colorado\'s cannabis tourism is in full swing. Late-night munchies crowd incoming, but is that your brand?',
    type: 'decision',
    minWeek: 14,
    weekRange: [14, 18],
    options: [
      { text: 'Late night menu, munchie specials, no judgment', successChance: 0.85, success: { cash: 12000, covers: 80, reputation: -5 }, fail: { cash: 3000 } },
      { text: 'Business as usual', successChance: 1.0, success: {}, fail: {} },
      { text: 'Close early - not our crowd', successChance: 1.0, success: { cash: -1000, reputation: 5 }, fail: {} },
    ],
  },
  {
    id: 'denver_ski_season',
    city: 'Denver',
    state: 'CO',
    title: 'Epic Ski Season',
    message: 'Record snowfall means record tourism. Skiers are flooding downtown Denver before and after their mountain trips.',
    type: 'opportunity',
    minWeek: 48,
    weekRange: [48, 52],
    options: [
      { text: 'Après-ski vibes - hot cocktails, hearty food', successChance: 0.9, success: { cash: 15000, reputation: 8, covers: 60 }, fail: { cash: 5000 } },
      { text: 'Early bird dinner specials for tired skiers', successChance: 0.85, success: { cash: 10000, covers: 40 }, fail: { cash: 3000 } },
      { text: 'Regular programming', successChance: 1.0, success: {}, fail: {} },
    ],
  },

  // NASHVILLE, TN
  {
    id: 'nashville_cma_fest',
    city: 'Nashville',
    state: 'TN',
    title: 'CMA Fest Week',
    message: 'Country music\'s biggest party brings 80,000 fans to Nashville. Broadway is a zoo, but the money is real.',
    type: 'opportunity',
    minWeek: 22,
    weekRange: [22, 26],
    options: [
      { text: 'Live country music, themed menu, all-in', successChance: 0.8, success: { cash: 25000, reputation: 15, covers: 100 }, fail: { cash: -3000, burnout: 15 } },
      { text: 'Extended hours, extra staff', successChance: 0.9, success: { cash: 15000, covers: 60 }, fail: { cash: 5000 } },
      { text: 'Avoid the tourist madness', successChance: 1.0, success: { covers: -40 }, fail: {} },
    ],
  },
  {
    id: 'nashville_bachelorette',
    city: 'Nashville',
    state: 'TN',
    title: 'Bachelorette Party Central',
    message: 'Nashville is the #1 bachelorette destination. A party of 15 wants to book - they\'re loud, they tip well, but they might scare off your other guests.',
    type: 'decision',
    minWeek: 4,
    options: [
      { text: 'Book them - good money and they\'ll post everywhere', successChance: 0.7, success: { cash: 3000, followers: 150 }, fail: { reputation: -8, morale: -5 } },
      { text: 'Private room only - contain the chaos', successChance: 0.9, success: { cash: 2500, followers: 50 }, fail: { cash: 1500 } },
      { text: 'Politely decline - not our vibe', successChance: 1.0, success: { reputation: 3 }, fail: {} },
    ],
  },

  // PORTLAND, OR
  {
    id: 'portland_food_critic',
    city: 'Portland',
    state: 'OR',
    title: 'Portlandia Food Critic',
    message: 'A major food blogger with 500K followers is reviewing restaurants in your neighborhood. Portland takes its food scene VERY seriously.',
    type: 'decision',
    minWeek: 8,
    options: [
      { text: 'Invite them for a tasting - full press kit', successChance: 0.6, success: { reputation: 25, followers: 3000 }, fail: { reputation: -15, followers: -200 } },
      { text: 'Hope they stop by naturally', successChance: 0.3, success: { reputation: 20, followers: 2000 }, fail: {} },
      { text: 'Influencers aren\'t our marketing strategy', successChance: 1.0, success: {}, fail: {} },
    ],
  },
  {
    id: 'portland_farmers_market',
    city: 'Portland',
    state: 'OR',
    title: 'Farmers Market Partnership',
    message: 'The famous Portland Farmers Market wants to feature local restaurant partners. Great exposure, but you\'d need to source 50% locally.',
    type: 'decision',
    minWeek: 16,
    options: [
      { text: 'Commit to local sourcing - Portland loves this', successChance: 0.9, success: { reputation: 20, followers: 500, foodCostMod: 0.05 }, fail: { cash: -2000 } },
      { text: 'Partial commitment - some local items', successChance: 0.95, success: { reputation: 10, followers: 200 }, fail: { cash: -500 } },
      { text: 'Too complicated for our supply chain', successChance: 1.0, success: {}, fail: {} },
    ],
  },

  // BOSTON, MA
  {
    id: 'boston_marathon',
    city: 'Boston',
    state: 'MA',
    title: 'Boston Marathon Monday',
    message: 'Marathon Monday is a citywide holiday. 30,000 runners, 500,000 spectators, and everyone needs carbs.',
    type: 'opportunity',
    minWeek: 14,
    weekRange: [14, 18],
    options: [
      { text: 'Pre-race pasta night, post-race celebration menu', successChance: 0.85, success: { cash: 18000, reputation: 12, covers: 90 }, fail: { cash: 4000 } },
      { text: 'Extended brunch for spectators', successChance: 0.9, success: { cash: 10000, covers: 50 }, fail: { cash: 3000 } },
      { text: 'The crowds are too chaotic', successChance: 1.0, success: { covers: -30 }, fail: {} },
    ],
  },
  {
    id: 'boston_nor_easter',
    city: 'Boston',
    state: 'MA',
    title: 'Nor\'easter Warning',
    message: '18 inches of snow expected. Boston shuts down, but there\'s always demand for hot soup and comfort food if you can open.',
    type: 'crisis',
    minWeek: 1,
    weekRange: [1, 12],
    options: [
      { text: 'Close for safety', successChance: 1.0, success: { cash: -2500, morale: 10 }, fail: {} },
      { text: 'Limited menu, walking-distance staff only', successChance: 0.85, success: { cash: 6000, reputation: 15, morale: 10 }, fail: { cash: -500 } },
      { text: 'Delivery only', successChance: 0.7, success: { cash: 3000 }, fail: { cash: -1000, reputation: -5 } },
    ],
  },

  // ATLANTA, GA
  {
    id: 'atlanta_super_bowl',
    city: 'Atlanta',
    state: 'GA',
    title: 'Atlanta Hosts Super Bowl',
    message: 'The Super Bowl is coming to Atlanta! The city will be center stage for a week. Corporate events, celebrities, and expense accounts everywhere.',
    type: 'opportunity',
    minWeek: 1,
    weekRange: [1, 6],
    options: [
      { text: 'VIP packages, premium everything', successChance: 0.75, success: { cash: 50000, reputation: 20, followers: 1000 }, fail: { cash: 10000 } },
      { text: 'Game day watch party', successChance: 0.9, success: { cash: 20000, covers: 100 }, fail: { cash: 8000 } },
      { text: 'Avoid the chaos, serve our community', successChance: 1.0, success: { reputation: 5 }, fail: {} },
    ],
  },

  // PHOENIX, AZ
  {
    id: 'phoenix_spring_training',
    city: 'Phoenix',
    state: 'AZ',
    title: 'Spring Training Season',
    message: 'The Cactus League brings 2 million baseball fans to the Valley. Snowbirds with money, looking for good food between games.',
    type: 'opportunity',
    minWeek: 8,
    weekRange: [8, 14],
    options: [
      { text: 'Baseball theme nights, team specials', successChance: 0.85, success: { cash: 15000, covers: 70, reputation: 8 }, fail: { cash: 4000 } },
      { text: 'Early bird specials for the early-game crowd', successChance: 0.9, success: { cash: 10000, covers: 40 }, fail: { cash: 3000 } },
      { text: 'Not a sports bar', successChance: 1.0, success: {}, fail: {} },
    ],
  },
  {
    id: 'phoenix_heat_wave',
    city: 'Phoenix',
    state: 'AZ',
    title: 'Record Heat Wave',
    message: '120°F for the 10th straight day. Outdoor dining is impossible, AC costs are through the roof, but people need cold drinks and cool spaces.',
    type: 'crisis',
    minWeek: 24,
    weekRange: [24, 36],
    options: [
      { text: 'Happy hour haven - frozen drinks, extended indoor hours', successChance: 0.9, success: { cash: 8000, covers: 50 }, fail: { cash: 2000 } },
      { text: 'Reduced hours during peak heat', successChance: 0.95, success: { cash: -2000, morale: 5 }, fail: { cash: -3000 } },
      { text: 'Power through - what heat wave?', successChance: 0.7, success: { cash: 3000 }, fail: { cash: -5000, morale: -15 } },
    ],
  },

  // HOUSTON, TX
  {
    id: 'houston_rodeo',
    city: 'Houston',
    state: 'TX',
    title: 'Houston Rodeo Season',
    message: 'The largest rodeo in the world is in town. 2.5 million visitors over 20 days. BBQ joints are slammed, but all restaurants benefit.',
    type: 'opportunity',
    minWeek: 8,
    weekRange: [8, 12],
    options: [
      { text: 'Western theme, rodeo specials', successChance: 0.85, success: { cash: 18000, reputation: 10, covers: 80 }, fail: { cash: 5000 } },
      { text: 'Focus on post-rodeo late-night crowd', successChance: 0.9, success: { cash: 12000, covers: 50 }, fail: { cash: 4000 } },
      { text: 'Not our demographic', successChance: 1.0, success: {}, fail: {} },
    ],
  },

  // ORLANDO, FL
  {
    id: 'orlando_disney_spillover',
    city: 'Orlando',
    state: 'FL',
    title: 'Theme Park Season Surge',
    message: 'Disney and Universal are at capacity. Tourists are looking for off-property dining - tired of theme park prices and food.',
    type: 'opportunity',
    minWeek: 24,
    weekRange: [24, 36],
    options: [
      { text: 'Family packages - kid-friendly, quick service', successChance: 0.9, success: { cash: 15000, covers: 100 }, fail: { cash: 5000 } },
      { text: 'Adult escape - date night away from the parks', successChance: 0.85, success: { cash: 12000, reputation: 8 }, fail: { cash: 4000 } },
      { text: 'Focus on locals, tourists are temporary', successChance: 1.0, success: { reputation: 5 }, fail: {} },
    ],
  },
];

// ============================================
// CUISINE SYNERGY BONUSES
// ============================================
// Bonuses when cuisine matches the city's food culture

export const CUISINE_SYNERGIES = {
  // Texas - BBQ Capital
  TX: {
    bbq: { reputationBonus: 15, foodCostReduction: 0.10, coverBonus: 0.15, description: 'Texas knows BBQ. You\'ll have built-in credibility and better supplier deals.' },
    tex_mex: { reputationBonus: 12, foodCostReduction: 0.08, coverBonus: 0.10, description: 'Tex-Mex is a Texas institution. Locals will give you a fair shot.' },
    steakhouse: { reputationBonus: 10, ticketBonus: 0.10, description: 'Texas loves a good steak. Premium pricing is expected.' },
  },

  // Louisiana - Cajun/Creole Heaven
  LA: {
    cajun: { reputationBonus: 20, foodCostReduction: 0.12, coverBonus: 0.20, description: 'You\'re cooking the cuisine of the land. Locals will be your harshest critics and biggest fans.' },
    southern: { reputationBonus: 12, coverBonus: 0.10, description: 'Southern comfort fits right in with Louisiana hospitality.' },
    seafood: { reputationBonus: 10, foodCostReduction: 0.08, description: 'Gulf seafood is local and fresh. Great supplier relationships await.' },
  },

  // California - Health & Fusion
  CA: {
    sushi: { reputationBonus: 12, ticketBonus: 0.15, description: 'California has the best fish markets in the country and sushi-loving clientele.' },
    farm_to_table: { reputationBonus: 15, ticketBonus: 0.12, coverBonus: 0.10, description: 'California invented farm-to-table. Year-round produce makes this shine.' },
    vegan: { reputationBonus: 18, coverBonus: 0.15, description: 'Vegan capital of America. You\'ll have a devoted following.' },
    mexican: { reputationBonus: 10, foodCostReduction: 0.10, description: 'Authentic Mexican is beloved, and ingredients are accessible.' },
  },

  // New York - Everything Goes
  NY: {
    pizza: { reputationBonus: 10, coverBonus: 0.20, competition: 0.20, description: 'NYC pizza is legendary, but competition is fierce.' },
    italian: { reputationBonus: 12, ticketBonus: 0.10, description: 'Little Italy may be small, but Italian food is big in NYC.' },
    fine_dining: { reputationBonus: 15, ticketBonus: 0.20, competition: 0.15, description: 'New York is fine dining central. High expectations, high rewards.' },
    deli: { reputationBonus: 15, coverBonus: 0.15, description: 'NYC deli culture is iconic. Pastrami and pickles forever.' },
  },

  // Florida - Cuban & Seafood
  FL: {
    cuban: { reputationBonus: 18, foodCostReduction: 0.10, coverBonus: 0.12, description: 'Miami\'s Cuban community means authentic ingredients and devoted customers.' },
    seafood: { reputationBonus: 12, foodCostReduction: 0.08, ticketBonus: 0.08, description: 'Fresh catch from both coasts. Tourists expect it, locals love it.' },
    caribbean: { reputationBonus: 14, coverBonus: 0.10, description: 'Caribbean flavors are right at home in Florida.' },
  },

  // Washington - Coffee & Seafood
  WA: {
    seafood: { reputationBonus: 18, foodCostReduction: 0.12, ticketBonus: 0.10, description: 'Pacific Northwest seafood is world-famous. Salmon, oysters, Dungeness crab.' },
    asian_fusion: { reputationBonus: 12, coverBonus: 0.10, description: 'Seattle\'s Asian population means discerning palates and great suppliers.' },
    coffee_cafe: { reputationBonus: 15, coverBonus: 0.15, description: 'Coffee is religion in Seattle. Your café game better be strong.' },
  },

  // Illinois - Deep Dish & Hot Dogs
  IL: {
    pizza: { reputationBonus: 15, coverBonus: 0.15, description: 'Chicago-style deep dish is iconic. Tourists seek it, locals debate it.' },
    steakhouse: { reputationBonus: 12, ticketBonus: 0.10, description: 'Chicago is a steakhouse city. Classic American dining.' },
    hot_dogs: { reputationBonus: 10, coverBonus: 0.20, foodCostReduction: 0.15, description: 'The Chicago dog is sacred. Don\'t you dare add ketchup.' },
  },

  // Georgia - Southern Soul
  GA: {
    southern: { reputationBonus: 18, coverBonus: 0.15, foodCostReduction: 0.10, description: 'Atlanta is the capital of Southern cuisine. Soul food thrives here.' },
    bbq: { reputationBonus: 12, coverBonus: 0.10, description: 'Georgia BBQ has its own style. Locals appreciate authenticity.' },
  },

  // Colorado - Farm Fresh & Craft
  CO: {
    farm_to_table: { reputationBonus: 15, ticketBonus: 0.10, description: 'Colorado\'s farm culture supports excellent local sourcing.' },
    craft_brewery: { reputationBonus: 12, coverBonus: 0.12, description: 'Denver is a craft beer capital. Beer pairings are expected.' },
  },

  // Tennessee - Hot Chicken & BBQ
  TN: {
    hot_chicken: { reputationBonus: 20, coverBonus: 0.20, description: 'Nashville hot chicken is a cultural phenomenon. Get it right and you\'re golden.' },
    bbq: { reputationBonus: 15, coverBonus: 0.12, foodCostReduction: 0.08, description: 'Tennessee BBQ has devoted followers. Smokers are practically required.' },
    southern: { reputationBonus: 12, coverBonus: 0.10, description: 'Meat and three, biscuits and gravy - Nashville does Southern right.' },
  },

  // Oregon - Sustainable & Weird
  OR: {
    farm_to_table: { reputationBonus: 18, ticketBonus: 0.12, description: 'Portland takes local sourcing seriously. Farmers markets are your friend.' },
    vegan: { reputationBonus: 15, coverBonus: 0.15, description: 'Portland has more vegans per capita than almost anywhere. They\'re hungry.' },
    food_truck: { reputationBonus: 12, foodCostReduction: 0.15, description: 'Food truck culture is huge in Portland. Mobile dining is respected.' },
  },

  // Massachusetts - Seafood & History
  MA: {
    seafood: { reputationBonus: 18, foodCostReduction: 0.10, coverBonus: 0.12, description: 'New England seafood is legendary. Clam chowder, lobster rolls, fresh catch.' },
    irish_pub: { reputationBonus: 12, coverBonus: 0.15, description: 'Boston\'s Irish heritage means pub culture is strong.' },
  },

  // Nevada - Everything Goes (Vegas)
  NV: {
    fine_dining: { reputationBonus: 15, ticketBonus: 0.25, description: 'Vegas is where celebrity chefs play. High stakes, high rewards.' },
    buffet: { reputationBonus: 10, coverBonus: 0.30, description: 'The Vegas buffet is iconic. Volume over everything.' },
    steakhouse: { reputationBonus: 12, ticketBonus: 0.20, description: 'High rollers expect great steaks. Price is no object.' },
  },

  // Hawaii - Pacific & Local
  HI: {
    hawaiian: { reputationBonus: 20, coverBonus: 0.15, description: 'Local Hawaiian cuisine is a point of pride. Poke, plate lunch, shave ice.' },
    asian_fusion: { reputationBonus: 15, foodCostReduction: 0.08, coverBonus: 0.12, description: 'Hawaii\'s Asian influences make fusion natural and appreciated.' },
    seafood: { reputationBonus: 12, ticketBonus: 0.15, description: 'Island-fresh seafood commands premium prices from tourists.' },
  },
};

// Default synergy for states not listed
export const DEFAULT_SYNERGY = {
  american: { reputationBonus: 5, description: 'Classic American fare is always welcome.' },
};

// Get synergy for a cuisine in a state
export const getCuisineSynergy = (cuisineId, stateCode) => {
  const stateSynergies = CUISINE_SYNERGIES[stateCode];
  if (stateSynergies && stateSynergies[cuisineId]) {
    return { ...stateSynergies[cuisineId], hasSynergy: true };
  }
  // Check for cuisine in default
  if (DEFAULT_SYNERGY[cuisineId]) {
    return { ...DEFAULT_SYNERGY[cuisineId], hasSynergy: false };
  }
  return { hasSynergy: false, description: 'No special regional advantage for this cuisine.' };
};

// ============================================
// REGIONAL WEATHER PATTERNS
// ============================================
// Weather probabilities by state/region

export const REGIONAL_WEATHER = {
  // Hurricane States (Summer/Fall risk)
  FL: {
    hurricaneRisk: true,
    hurricaneSeason: [24, 44], // Weeks 24-44 (June-October)
    hurricaneChance: 0.15, // Per week during season
    winterBonus: 0.15, // Better weather = more covers in winter
    summerPenalty: 0.10, // Hot summers reduce outdoor dining
  },
  TX: {
    hurricaneRisk: true,
    hurricaneSeason: [24, 44],
    hurricaneChance: 0.08, // Mainly coastal
    summerPenalty: 0.15,
    winterBonus: 0.10,
  },
  LA: {
    hurricaneRisk: true,
    hurricaneSeason: [24, 44],
    hurricaneChance: 0.12,
    winterBonus: 0.08,
  },

  // Harsh Winter States
  IL: {
    harshWinter: true,
    winterSeason: [48, 12], // Wraps around (Dec-Mar)
    winterPenalty: 0.20,
    polarVortexChance: 0.10,
    summerBonus: 0.10,
  },
  MN: {
    harshWinter: true,
    winterSeason: [44, 14],
    winterPenalty: 0.25,
    polarVortexChance: 0.15,
    summerBonus: 0.15,
  },
  WI: {
    harshWinter: true,
    winterSeason: [46, 13],
    winterPenalty: 0.22,
    polarVortexChance: 0.12,
  },
  MI: {
    harshWinter: true,
    winterSeason: [46, 13],
    winterPenalty: 0.20,
    polarVortexChance: 0.10,
  },
  MA: {
    harshWinter: true,
    winterSeason: [48, 12],
    winterPenalty: 0.18,
    norEasterChance: 0.12,
    summerBonus: 0.12,
  },
  NY: {
    harshWinter: true,
    winterSeason: [48, 12],
    winterPenalty: 0.15,
    norEasterChance: 0.10,
    summerBonus: 0.10,
  },

  // Rainy States
  WA: {
    rainyRegion: true,
    rainySeason: [40, 14], // Oct-Mar
    rainyPenalty: 0.10,
    summerBonus: 0.15, // Seattle summers are beautiful
  },
  OR: {
    rainyRegion: true,
    rainySeason: [40, 14],
    rainyPenalty: 0.12,
    summerBonus: 0.12,
  },

  // Desert/Hot States
  AZ: {
    extremeHeat: true,
    heatSeason: [22, 38], // Late May - September
    heatPenalty: 0.15,
    winterBonus: 0.20, // Snowbirds!
  },
  NV: {
    extremeHeat: true,
    heatSeason: [22, 38],
    heatPenalty: 0.12,
    winterBonus: 0.08,
  },

  // Earthquake States
  CA: {
    earthquakeRisk: true,
    earthquakeChance: 0.02, // Per week
    yearRoundGoodWeather: true,
    weatherBonus: 0.05,
  },

  // Hawaii - Special
  HI: {
    tropicalWeather: true,
    hurricaneSeason: [24, 44],
    hurricaneChance: 0.05,
    yearRoundTourism: true,
    weatherBonus: 0.10,
  },

  // Colorado - Ski season bonus
  CO: {
    skiSeason: true,
    skiSeasonWeeks: [48, 14],
    skiBonus: 0.15,
    summerBonus: 0.10,
  },
};

// Get weather modifiers for a state and week
export const getWeatherModifier = (stateCode, week) => {
  const regional = REGIONAL_WEATHER[stateCode] || {};
  let coverModifier = 0;
  let events = [];

  // Check hurricane season
  if (regional.hurricaneRisk) {
    const [start, end] = regional.hurricaneSeason || [24, 44];
    if (week >= start && week <= end) {
      if (Math.random() < (regional.hurricaneChance || 0.10)) {
        events.push('hurricane_warning');
        coverModifier -= 0.30;
      }
    }
  }

  // Check harsh winter
  if (regional.harshWinter) {
    const [start, end] = regional.winterSeason || [48, 12];
    const inWinter = start > end ? (week >= start || week <= end) : (week >= start && week <= end);
    if (inWinter) {
      coverModifier -= regional.winterPenalty || 0.15;
      if (Math.random() < (regional.polarVortexChance || 0)) {
        events.push('polar_vortex');
        coverModifier -= 0.20;
      }
      if (Math.random() < (regional.norEasterChance || 0)) {
        events.push('nor_easter');
        coverModifier -= 0.15;
      }
    }
  }

  // Check summer bonuses/penalties
  const isSummer = week >= 22 && week <= 36;
  if (isSummer) {
    if (regional.summerBonus) coverModifier += regional.summerBonus;
    if (regional.summerPenalty) coverModifier -= regional.summerPenalty;
    if (regional.extremeHeat) {
      const [start, end] = regional.heatSeason || [22, 38];
      if (week >= start && week <= end) {
        if (Math.random() < 0.20) {
          events.push('heat_wave');
          coverModifier -= 0.10;
        }
      }
    }
  }

  // Check winter bonuses (snowbirds, etc.)
  const isWinter = week >= 48 || week <= 10;
  if (isWinter && regional.winterBonus) {
    coverModifier += regional.winterBonus;
  }

  // Ski season
  if (regional.skiSeason) {
    const [start, end] = regional.skiSeasonWeeks || [48, 14];
    const inSkiSeason = start > end ? (week >= start || week <= end) : (week >= start && week <= end);
    if (inSkiSeason) {
      coverModifier += regional.skiBonus || 0.10;
      events.push('ski_season');
    }
  }

  // Year-round good weather bonus
  if (regional.yearRoundGoodWeather || regional.yearRoundTourism) {
    coverModifier += regional.weatherBonus || 0.05;
  }

  // Rainy season
  if (regional.rainyRegion) {
    const [start, end] = regional.rainySeason || [40, 14];
    const inRainy = start > end ? (week >= start || week <= end) : (week >= start && week <= end);
    if (inRainy) {
      coverModifier -= regional.rainyPenalty || 0.10;
      events.push('rainy_season');
    }
  }

  // Earthquake random event
  if (regional.earthquakeRisk && Math.random() < (regional.earthquakeChance || 0.02)) {
    events.push('earthquake');
    coverModifier -= 0.05;
  }

  return {
    coverModifier: Math.max(-0.50, Math.min(0.30, coverModifier)), // Clamp to reasonable range
    events,
    hasRegionalWeather: Object.keys(regional).length > 0,
  };
};

// ============================================
// LABOR MARKET BY STATE
// ============================================
// Affects hiring difficulty and wage expectations

export const STATE_LABOR_MARKETS = {
  // Tight labor markets (low unemployment, hard to hire)
  CO: { unemploymentMod: 0.7, hiringDifficulty: 1.3, wageExpectation: 1.15, description: 'Denver\'s booming economy means everyone is already employed.' },
  TX: { unemploymentMod: 0.8, hiringDifficulty: 1.2, wageExpectation: 1.05, description: 'Texas economy is hot. Workers have options.' },
  WA: { unemploymentMod: 0.75, hiringDifficulty: 1.25, wageExpectation: 1.20, description: 'Tech money in Seattle means you\'re competing with Amazon.' },
  UT: { unemploymentMod: 0.7, hiringDifficulty: 1.3, wageExpectation: 1.10, description: 'Utah\'s unemployment is among the lowest in the nation.' },

  // Moderate labor markets
  CA: { unemploymentMod: 1.0, hiringDifficulty: 1.1, wageExpectation: 1.25, description: 'High wages expected due to cost of living.' },
  NY: { unemploymentMod: 1.0, hiringDifficulty: 1.0, wageExpectation: 1.20, description: 'Lots of workers, but NYC wages are high.' },
  FL: { unemploymentMod: 0.95, hiringDifficulty: 1.0, wageExpectation: 1.0, description: 'Tourism industry means experienced hospitality workers.' },
  GA: { unemploymentMod: 0.9, hiringDifficulty: 1.05, wageExpectation: 1.0, description: 'Atlanta has a growing service industry.' },

  // Looser labor markets (easier to hire)
  MI: { unemploymentMod: 1.2, hiringDifficulty: 0.85, wageExpectation: 0.95, description: 'Detroit\'s transition means available workforce.' },
  OH: { unemploymentMod: 1.1, hiringDifficulty: 0.9, wageExpectation: 0.95, description: 'Midwest work ethic, reasonable wage expectations.' },
  PA: { unemploymentMod: 1.05, hiringDifficulty: 0.95, wageExpectation: 1.0, description: 'Solid labor pool in Pennsylvania.' },
  IN: { unemploymentMod: 1.1, hiringDifficulty: 0.9, wageExpectation: 0.90, description: 'Indianapolis has available workers.' },

  // Very loose labor markets
  MS: { unemploymentMod: 1.4, hiringDifficulty: 0.75, wageExpectation: 0.85, description: 'Higher unemployment means easier hiring.' },
  WV: { unemploymentMod: 1.5, hiringDifficulty: 0.70, wageExpectation: 0.80, description: 'Economic challenges mean workers are available.' },
  NM: { unemploymentMod: 1.3, hiringDifficulty: 0.80, wageExpectation: 0.85, description: 'New Mexico has a growing hospitality sector.' },
};

// Default labor market
export const DEFAULT_LABOR_MARKET = {
  unemploymentMod: 1.0,
  hiringDifficulty: 1.0,
  wageExpectation: 1.0,
  description: 'Standard labor market conditions.',
};

// Get labor market data for a state
export const getLaborMarket = (stateCode) => {
  return STATE_LABOR_MARKETS[stateCode] || DEFAULT_LABOR_MARKET;
};

// ============================================
// HELPER FUNCTIONS
// ============================================

// Get applicable city scenarios for a given city, state, and week
export const getApplicableCityScenarios = (city, state, week, reputation = 50) => {
  return CITY_SCENARIOS.filter(scenario => {
    // Must match city and state
    if (scenario.city !== city || scenario.state !== state) return false;

    // Check minimum week
    if (scenario.minWeek && week < scenario.minWeek) return false;

    // Check week range if specified
    if (scenario.weekRange) {
      const [start, end] = scenario.weekRange;
      if (start > end) {
        // Wraps around year end
        if (week < start && week > end) return false;
      } else {
        if (week < start || week > end) return false;
      }
    }

    // Check reputation requirement
    if (scenario.minReputation && reputation < scenario.minReputation) return false;

    return true;
  });
};

// Check if a city scenario should trigger this week
export const shouldTriggerCityScenario = (city, state, week, reputation, seenScenarios = []) => {
  const applicable = getApplicableCityScenarios(city, state, week, reputation);
  const unseen = applicable.filter(s => !seenScenarios.includes(s.id));

  if (unseen.length === 0) return null;

  // 20% chance per week to trigger an applicable scenario
  if (Math.random() < 0.20) {
    return unseen[Math.floor(Math.random() * unseen.length)];
  }

  return null;
};

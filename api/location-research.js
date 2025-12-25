export const config = {
  runtime: 'edge',
};

// System prompt for location economic research
const LOCATION_RESEARCH_PROMPT = `You are a restaurant industry research analyst providing economic data for the game "86'd", a realistic restaurant business simulator.

Your task is to provide realistic economic data for opening a restaurant in a specific US city. Return ONLY a valid JSON object with the following fields. Do not include any other text, explanation, or markdown formatting.

REQUIRED JSON STRUCTURE:
{
  "minWage": <number - current minimum wage in dollars/hour>,
  "avgRestaurantWage": <number - average hourly wage for restaurant workers>,
  "avgManagerSalary": <number - average annual salary for restaurant managers>,
  "avgCommercialRentSqFt": <number - average monthly rent per square foot for retail/restaurant space>,
  "avgBuildoutCostSqFt": <number - average buildout cost per square foot for restaurant space>,
  "avgTicketCasual": <number - average ticket price at casual dining restaurants>,
  "avgTicketFineDining": <number - average ticket price at fine dining restaurants>,
  "restaurantsPerCapita": <number - restaurants per 1000 residents>,
  "unemploymentRate": <number - unemployment rate as decimal e.g. 0.045>,
  "medianHouseholdIncome": <number - median household income>,
  "touristDestination": <boolean - true if major tourist destination>,
  "majorEmployers": [<array of 3-5 major local employers>],
  "foodScene": "<string - 1-2 sentence description of local food scene>",
  "localSpecialties": [<array of 3-5 local food specialties or popular cuisines>],
  "bestNeighborhoods": [<array of 3-5 best neighborhoods for restaurants>],
  "wageMultiplier": <number - wage cost relative to national average, e.g. 1.2 for 20% higher>,
  "rentMultiplier": <number - rent cost relative to national average>,
  "ticketMultiplier": <number - ticket price potential relative to national average>,
  "trafficMultiplier": <number - foot traffic relative to national average>,
  "competitionLevel": <number - competition intensity relative to national average>,
  "foodCostMultiplier": <number - food/supply costs relative to national average>
}

GUIDELINES:
- Use realistic 2024/2025 data based on actual economic conditions
- All multipliers should be relative to national average (1.0 = average)
- Multipliers typically range from 0.7 (very low cost) to 2.5 (very high cost)
- Consider cost of living, local economy, tourism, and food culture
- Be accurate but slightly game-balanced (not punishing for choosing a location)

Return ONLY the JSON object, no other text.`;

export default async function handler(req) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let body;
  try {
    body = await req.json();
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { city, state } = body;

  if (!city || !state) {
    return new Response(JSON.stringify({ error: 'City and state are required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.error('GEMINI_API_KEY not configured');
    // Return fallback data for balanced gameplay
    return new Response(JSON.stringify(getFallbackData(city, state)), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const userPrompt = `Research economic data for opening a restaurant in ${city}, ${state}.`;

    // Use Gemini 2.0 Flash for speed
    const models = ['gemini-2.0-flash-exp', 'gemini-2.0-flash', 'gemini-1.5-flash'];
    let data = null;
    let lastError = null;

    for (const model of models) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
              systemInstruction: {
                parts: [{ text: LOCATION_RESEARCH_PROMPT }]
              },
              generationConfig: {
                temperature: 0.3, // Lower temperature for more factual responses
                maxOutputTokens: 1000,
                topP: 0.9,
              }
            })
          }
        );

        data = await response.json();

        if (!data.error) {
          break; // Success, exit loop
        }
        lastError = data.error;
      } catch (err) {
        lastError = err;
      }
    }

    if (data?.error || !data) {
      console.error('Gemini API Error:', lastError || data?.error);
      return new Response(JSON.stringify(getFallbackData(city, state)), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      return new Response(JSON.stringify(getFallbackData(city, state)), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Parse the JSON response
    try {
      // Remove any markdown code fences if present
      const cleanedText = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
      const parsedData = JSON.parse(cleanedText);

      // Validate and sanitize the data
      const sanitizedData = sanitizeLocationData(parsedData);

      return new Response(JSON.stringify(sanitizedData), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError, text);
      return new Response(JSON.stringify(getFallbackData(city, state)), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  } catch (error) {
    console.error('Location Research API Error:', error);
    return new Response(JSON.stringify(getFallbackData(city, state)), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// Fallback data for when API is unavailable
function getFallbackData(city, state) {
  // Provide reasonable defaults that won't break gameplay
  return {
    minWage: 12.00,
    avgRestaurantWage: 15.50,
    avgManagerSalary: 55000,
    avgCommercialRentSqFt: 25,
    avgBuildoutCostSqFt: 150,
    avgTicketCasual: 22,
    avgTicketFineDining: 85,
    restaurantsPerCapita: 2.5,
    unemploymentRate: 0.04,
    medianHouseholdIncome: 65000,
    touristDestination: false,
    majorEmployers: ['Various local businesses'],
    foodScene: `${city} has a growing food scene with diverse dining options.`,
    localSpecialties: ['American classics', 'Regional favorites'],
    bestNeighborhoods: ['Downtown', 'Main Street area'],
    wageMultiplier: 1.0,
    rentMultiplier: 1.0,
    ticketMultiplier: 1.0,
    trafficMultiplier: 1.0,
    competitionLevel: 1.0,
    foodCostMultiplier: 1.0,
  };
}

// Sanitize and validate location data
function sanitizeLocationData(data) {
  const sanitized = { ...data };

  // Ensure multipliers are within reasonable bounds
  const clampMultiplier = (val, min = 0.5, max = 3.0) => {
    const num = typeof val === 'number' ? val : 1.0;
    return Math.max(min, Math.min(max, num));
  };

  // Ensure numbers are valid
  const ensureNumber = (val, fallback) => {
    const num = parseFloat(val);
    return isNaN(num) ? fallback : num;
  };

  // Sanitize multipliers
  sanitized.wageMultiplier = clampMultiplier(data.wageMultiplier);
  sanitized.rentMultiplier = clampMultiplier(data.rentMultiplier);
  sanitized.ticketMultiplier = clampMultiplier(data.ticketMultiplier);
  sanitized.trafficMultiplier = clampMultiplier(data.trafficMultiplier, 0.3, 2.0);
  sanitized.competitionLevel = clampMultiplier(data.competitionLevel, 0.3, 2.5);
  sanitized.foodCostMultiplier = clampMultiplier(data.foodCostMultiplier, 0.7, 1.5);

  // Sanitize numeric values
  sanitized.minWage = ensureNumber(data.minWage, 12.00);
  sanitized.avgRestaurantWage = ensureNumber(data.avgRestaurantWage, 15.50);
  sanitized.avgManagerSalary = ensureNumber(data.avgManagerSalary, 55000);
  sanitized.avgCommercialRentSqFt = ensureNumber(data.avgCommercialRentSqFt, 25);
  sanitized.avgBuildoutCostSqFt = ensureNumber(data.avgBuildoutCostSqFt, 150);
  sanitized.avgTicketCasual = ensureNumber(data.avgTicketCasual, 22);
  sanitized.avgTicketFineDining = ensureNumber(data.avgTicketFineDining, 85);
  sanitized.restaurantsPerCapita = ensureNumber(data.restaurantsPerCapita, 2.5);
  sanitized.unemploymentRate = ensureNumber(data.unemploymentRate, 0.04);
  sanitized.medianHouseholdIncome = ensureNumber(data.medianHouseholdIncome, 65000);

  // Ensure boolean
  sanitized.touristDestination = Boolean(data.touristDestination);

  // Ensure arrays
  sanitized.majorEmployers = Array.isArray(data.majorEmployers)
    ? data.majorEmployers.slice(0, 5)
    : ['Various local businesses'];
  sanitized.localSpecialties = Array.isArray(data.localSpecialties)
    ? data.localSpecialties.slice(0, 5)
    : ['Regional favorites'];
  sanitized.bestNeighborhoods = Array.isArray(data.bestNeighborhoods)
    ? data.bestNeighborhoods.slice(0, 5)
    : ['Downtown'];

  // Ensure strings
  sanitized.foodScene = typeof data.foodScene === 'string'
    ? data.foodScene.substring(0, 200)
    : 'Growing food scene with diverse options.';

  return sanitized;
}

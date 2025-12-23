export const config = {
  runtime: 'edge',
};

// Enhanced system prompt for Chef Marcus AI mentor
const CHEF_MARCUS_SYSTEM_PROMPT = `You are Chef Marcus, an experienced AI mentor in "86'd", a realistic restaurant business simulator game designed to teach entrepreneurship through gameplay.

YOUR PERSONALITY:
- 30 years in the restaurant industry - you've seen it all
- Opened 12 restaurants, failed at 4, learned invaluable lessons from each
- Direct, honest, and supportive - you warn but never block decisions
- You celebrate genuine wins and empathize with struggles
- You teach through reflection, specific examples, and actionable advice
- You speak with authority but warmth - like a seasoned mentor

GAME CONTEXT - KEY MECHANICS YOU KNOW:
1. LABOR COSTS: A $10/hr employee actually costs ~$14.50/hr with loaded costs (taxes, insurance, workers comp)
2. CASH FLOW: Weekly rent, payroll, and loan payments can sink a restaurant fast - "cash is oxygen"
3. REPUTATION: Affected by food quality, service, and marketing - takes weeks to build, seconds to destroy
4. MORALE: Staff morale affects productivity and turnover - burned out staff quit without warning
5. BURNOUT: Player burnout increases without managers - you MUST delegate or die
6. EXPANSION: Second location has 2x failure rate - master one before opening another
7. VENDORS: Building vendor relationships unlocks better deals and priority during shortages
8. SEASONS: Revenue fluctuates with seasons, events, and economic conditions
9. LOANS: Quick cash but weekly payments can crush cash flow
10. FRANCHISING: Requires 3 successful locations and $50K to enable

YOUR TEACHING PRINCIPLES (from real restaurant experience):
1. "Great food isn't enough" - operations, finance, and people skills matter more
2. "Cash is oxygen" - you can have profit on paper and still die from cash flow
3. "Your staff are your multipliers" - invest in them, they'll multiply your success
4. "Every number tells a story" - teach players to read their metrics
5. "Fail fast, learn faster" - mistakes are tuition in the school of entrepreneurship
6. "The restaurant business doesn't care about your dreams" - be realistic, not cruel

CONTEXT-SPECIFIC BEHAVIORS:
- For NEW PLAYERS (welcome/onboarding): Be encouraging, explain basics, suggest safe starting choices
- For ACTIVE GAMES: Reference specific numbers, give tactical week-by-week advice
- For FAILURES (gameover): Be empathetic but analytical - what lessons can they take?
- For VICTORIES (win): Celebrate genuinely, then discuss advanced strategies for next run

RESPONSE STYLE:
- Keep responses concise (2-4 sentences max unless specifically asked for detail)
- Always reference specific numbers from the game state when available
- Give ONE clear, actionable recommendation when advising
- Use the player's restaurant name and current metrics to personalize advice
- End with a question or forward-looking statement when appropriate
- Use restaurant industry lingo naturally (covers, tickets, food cost, etc.)

IMPORTANT LIMITATIONS:
- If no game state is provided (welcome/onboarding), give general advice
- Never make up numbers - only reference what's in the game state
- Don't overwhelm new players with advanced concepts`;

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

  const { prompt, conversationHistory, gameState } = body;

  if (!prompt) {
    return new Response(JSON.stringify({ error: 'Prompt is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.error('GEMINI_API_KEY not configured');
    return new Response(JSON.stringify({
      response: "I'm here to help, but my AI connection isn't configured yet. Here's my quick advice: Focus on cash flow first, staff second, and expansion last. Keep playing - I'll give you better tips when I'm fully online!"
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    // Build conversation contents for multi-turn chat
    const contents = [];

    // Add conversation history if provided
    if (conversationHistory && Array.isArray(conversationHistory)) {
      for (const msg of conversationHistory.slice(-10)) { // Last 10 messages for context
        contents.push({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }]
        });
      }
    }

    // Add the current prompt
    contents.push({
      role: 'user',
      parts: [{ text: prompt }]
    });

    // Build the full system instruction with game state
    let systemInstruction = CHEF_MARCUS_SYSTEM_PROMPT;
    
    if (gameState) {
      systemInstruction += `\n\nCURRENT GAME STATE:\n${JSON.stringify(gameState, null, 2)}`;
    } else {
      systemInstruction += `\n\nNOTE: No active game - player is in welcome/onboarding phase. Give general advice about starting a restaurant.`;
    }

    // Use Gemini 2.0 Flash for speed, with fallback
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
              contents,
              systemInstruction: {
                parts: [{ text: systemInstruction }]
              },
              generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 500,
                topP: 0.95,
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
      return new Response(JSON.stringify({
        response: "Running into some technical difficulties. Here's what I always say: watch your cash flow like a hawk. Every week you survive is a win."
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Keep pushing. Every week you survive is a win. Focus on the fundamentals: cash flow, staff morale, and customer satisfaction.";

    return new Response(JSON.stringify({ response: text }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('AI API Error:', error);
    return new Response(JSON.stringify({
      response: "Technical issues on my end. You've got this - trust your instincts. Remember: great food isn't enough. It's about the whole operation."
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

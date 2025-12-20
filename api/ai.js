export const config = {
  runtime: 'edge',
};

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
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }

  let body;
  try {
    body = await req.json();
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }

  const { prompt, conversationHistory, gameState } = body;

  if (!prompt) {
    return new Response(JSON.stringify({ error: 'Prompt is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.error('GEMINI_API_KEY not configured');
    return new Response(JSON.stringify({
      response: "I'm here to help, but my AI connection isn't configured yet. Keep playing - I'll give you tips when I'm online!"
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
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

    // Use Gemini 2.5 Pro for better reasoning, fall back to 2.0 Flash
    const models = ['gemini-2.5-pro', 'gemini-2.0-flash'];
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
                parts: [{
                  text: `You are Chef Marcus, an experienced AI mentor in "86'd", a restaurant business simulator game.

YOUR PERSONALITY:
- 30 years in the restaurant industry
- Opened 12 restaurants, failed at 4, learned from all
- Direct but supportive - you warn but don't block decisions
- You celebrate wins genuinely
- You teach through reflection on past choices

IMPORTANT INSTRUCTIONS:
1. You have access to the player's COMPLETE game state - use it to give specific, actionable advice
2. Reference specific numbers (cash, costs, staff wages, etc.) when answering questions
3. If asked "why" about something, explain the math and game mechanics
4. Remember the conversation history - reference past discussions when relevant
5. Keep responses concise (2-4 sentences) but pack them with specific details
6. If the player asks about costs or requirements, calculate and explain them

${gameState ? `CURRENT GAME STATE:
${JSON.stringify(gameState, null, 2)}` : ''}`
                }]
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
        response: "Running into some technical difficulties. Focus on your numbers - that's what matters."
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Keep pushing. Every week you survive is a win.";

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
      response: "Technical issues on my end. You've got this - trust your instincts."
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }
}

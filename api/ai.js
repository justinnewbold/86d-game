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

  const { prompt } = body;
  
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
      response: "I'm here to help, but my AI connection isn't configured yet. Keep playing - I'll give you tips when I'm online!" 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { 
            temperature: 0.8, 
            maxOutputTokens: 200,
            topP: 0.95,
          }
        })
      }
    );

    const data = await response.json();
    
    if (data.error) {
      console.error('Gemini API Error:', data.error);
      return new Response(JSON.stringify({ 
        response: "Running into some technical difficulties. Focus on your numbers - that's what matters." 
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || 
      "Keep pushing. Every week you survive is a win.";
    
    return new Response(JSON.stringify({ response: text }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('AI API Error:', error);
    return new Response(JSON.stringify({ 
      response: "Technical issues on my end. You've got this - trust your instincts." 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

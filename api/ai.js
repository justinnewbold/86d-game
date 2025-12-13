export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt } = req.body;
  
  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    console.error('GEMINI_API_KEY not configured');
    return res.status(200).json({ 
      response: "I'm here to help, but my AI connection isn't configured yet. Keep playing - I'll give you tips when I'm online!" 
    });
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro-preview-06-05:generateContent?key=${apiKey}`,
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
      return res.status(200).json({ 
        response: "Running into some technical difficulties. Focus on your numbers - that's what matters." 
      });
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || 
      "Keep pushing. Every week you survive is a win.";
    
    return res.status(200).json({ response: text });
  } catch (error) {
    console.error('AI API Error:', error);
    return res.status(200).json({ 
      response: "Technical issues on my end. You've got this - trust your instincts." 
    });
  }
}

// POST /api/analyze - Analyze transcription using GPT-4
export const config = {
  maxDuration: 30,
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { transcription, analysisType = 'themes' } = req.body;

  if (!transcription) {
    return res.status(400).json({ error: 'transcription is required' });
  }

  const prompts = {
    themes: `Analyze the following community feedback and extract the main themes, concerns, and suggestions. Be concise and actionable.

Feedback: "${transcription}"

Provide your analysis in JSON format with:
- themes: array of main themes identified
- concerns: array of specific concerns raised
- suggestions: array of actionable suggestions
- sentiment: overall sentiment (positive/neutral/negative)
- summary: 2-3 sentence summary`,

    sentiment: `Analyze the sentiment of this community feedback. Consider tone, word choice, and emotional content.

Feedback: "${transcription}"

Provide analysis in JSON format with:
- overall: positive/neutral/negative
- confidence: 0-1 score
- emotions: array of detected emotions
- key_phrases: phrases that indicate sentiment`,

    summary: `Summarize this community feedback in 2-3 concise sentences. Focus on the main point and any action items.

Feedback: "${transcription}"

Provide in JSON format with:
- summary: the summary text
- key_points: array of bullet points
- action_items: any suggested actions`,
  };

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert at analyzing community feedback. Always respond with valid JSON.',
          },
          {
            role: 'user',
            content: prompts[analysisType] || prompts.themes,
          },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error: ${error}`);
    }

    const completion = await response.json();
    const analysis = JSON.parse(completion.choices[0].message.content);

    return res.status(200).json({
      success: true,
      analysisType,
      analysis,
      usage: completion.usage,
    });
  } catch (error) {
    console.error('Analysis error:', error);
    return res.status(500).json({ error: 'Analysis failed', details: error.message });
  }
}

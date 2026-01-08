// POST /api/transcribe - Transcribe audio using OpenAI Whisper
import { put, head } from '@vercel/blob';

export const config = {
  maxDuration: 60, // Allow up to 60 seconds for transcription
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { audioUrl } = req.body;

  if (!audioUrl) {
    return res.status(400).json({ error: 'audioUrl is required' });
  }

  try {
    // Fetch the audio file
    const audioResponse = await fetch(audioUrl);
    if (!audioResponse.ok) {
      throw new Error('Failed to fetch audio file');
    }

    const audioBlob = await audioResponse.blob();

    // Create form data for OpenAI
    const formData = new FormData();
    formData.append('file', audioBlob, 'audio.webm');
    formData.append('model', 'whisper-1');
    formData.append('response_format', 'verbose_json');

    // Call OpenAI Whisper API
    const transcriptionResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: formData,
    });

    if (!transcriptionResponse.ok) {
      const error = await transcriptionResponse.text();
      throw new Error(`OpenAI API error: ${error}`);
    }

    const transcription = await transcriptionResponse.json();

    return res.status(200).json({
      success: true,
      text: transcription.text,
      duration: transcription.duration,
      language: transcription.language,
      segments: transcription.segments,
    });
  } catch (error) {
    console.error('Transcription error:', error);
    return res.status(500).json({ error: 'Transcription failed', details: error.message });
  }
}

// GET /api/health - Health check endpoint
export default function handler(req, res) {
  return res.status(200).json({
    status: 'ok',
    service: 'mic-api',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    endpoints: [
      'GET  /api/health     - This health check',
      'POST /api/upload     - Upload audio to Vercel Blob',
      'GET  /api/recordings - List recordings by org',
      'POST /api/transcribe - Transcribe audio with Whisper',
      'POST /api/analyze    - Analyze text with GPT-4',
      'POST /api/agent      - Full pipeline (transcribe + analyze)',
    ],
  });
}

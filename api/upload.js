// POST /api/upload - Upload audio file to Vercel Blob
import { put } from '@vercel/blob';

export const config = {
  api: {
    bodyParser: false, // Required for file uploads
  },
};

// Helper to collect request body as buffer
async function collectBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const filename = req.query.filename || `recording-${Date.now()}.webm`;
    const orgId = req.query.org || 'general';

    // Buffer the body first (fixes dev mode stream issue)
    const body = await collectBody(req);

    // Upload to Vercel Blob
    const blob = await put(`recordings/${orgId}/${filename}`, body, {
      access: 'public',
      contentType: req.headers['content-type'] || 'audio/webm',
    });

    return res.status(200).json({
      success: true,
      url: blob.url,
      pathname: blob.pathname,
      orgId,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ error: 'Upload failed', details: error.message });
  }
}

// GET /api/recordings - List recordings for an organization
import { list } from '@vercel/blob';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const orgId = req.query.org || 'general';
    const limit = parseInt(req.query.limit) || 100;

    // List blobs with prefix for organization
    const { blobs } = await list({
      prefix: `recordings/${orgId}/`,
      limit,
    });

    const recordings = blobs.map(blob => ({
      url: blob.url,
      pathname: blob.pathname,
      size: blob.size,
      uploadedAt: blob.uploadedAt,
    }));

    return res.status(200).json({
      success: true,
      orgId,
      count: recordings.length,
      recordings,
    });
  } catch (error) {
    console.error('List error:', error);
    return res.status(500).json({ error: 'Failed to list recordings', details: error.message });
  }
}

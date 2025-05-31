import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/server/db';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const stats = await db.getStats();
    return res.status(200).json(stats);
  } catch (error) {
    console.error('Error fetching voice complaint stats:', error);
    return res.status(500).json({
      error: 'Failed to fetch statistics',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
} 
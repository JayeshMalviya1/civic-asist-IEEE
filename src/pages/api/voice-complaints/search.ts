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
    const {
      category,
      priority,
      status,
      location,
      startDate,
      endDate,
      searchTerm,
    } = req.query;

    const complaints = await db.searchComplaints({
      category: category as string,
      priority: priority as string,
      status: status as string,
      location: location as string,
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
      searchTerm: searchTerm as string,
    });

    return res.status(200).json(complaints);
  } catch (error) {
    console.error('Error searching voice complaints:', error);
    return res.status(500).json({
      error: 'Failed to search complaints',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
} 
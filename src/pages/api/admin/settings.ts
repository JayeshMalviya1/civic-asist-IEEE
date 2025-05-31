import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Check authentication
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Check admin role
  const user = await prisma.user.findUnique({
    where: { email: session.user?.email as string },
  });

  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' });
  }

  if (req.method === 'GET') {
    try {
      const settings = await prisma.systemSettings.findFirst();
      return res.status(200).json(settings);
    } catch (error) {
      console.error('Error fetching settings:', error);
      return res.status(500).json({
        error: 'Failed to fetch settings',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  if (req.method === 'PUT') {
    try {
      const settings = await prisma.systemSettings.upsert({
        where: { id: '1' }, // Using a constant ID since we only have one settings record
        update: req.body,
        create: {
          id: '1',
          ...req.body,
        },
      });

      return res.status(200).json(settings);
    } catch (error) {
      console.error('Error updating settings:', error);
      return res.status(500).json({
        error: 'Failed to update settings',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
} 
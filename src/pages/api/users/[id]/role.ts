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
  const admin = await prisma.user.findUnique({
    where: { email: session.user?.email as string },
  });

  if (!admin || admin.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const { id } = req.query;
  const { role } = req.body;

  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!role || typeof role !== 'string') {
    return res.status(400).json({ error: 'Invalid role' });
  }

  // Validate role
  const validRoles = ['user', 'staff', 'moderator', 'admin'];
  if (!validRoles.includes(role)) {
    return res.status(400).json({ error: 'Invalid role' });
  }

  try {
    // Check if user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: id as string },
    });

    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Prevent self-demotion
    if (targetUser.email === session.user?.email && role !== 'admin') {
      return res.status(400).json({ error: 'Cannot demote yourself' });
    }

    const updatedUser = await prisma.user.update({
      where: { id: id as string },
      data: { role },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return res.status(200).json(updatedUser);
  } catch (error) {
    console.error('Error updating user role:', error);
    return res.status(500).json({
      error: 'Failed to update user role',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
} 
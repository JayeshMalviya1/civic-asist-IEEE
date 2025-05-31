import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface VoiceComplaintInput {
  audioUrl?: string;
  originalText: string;
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
  confidence: number;
  category: string;
  priority: string;
  location?: string;
  metadata: {
    deviceInfo?: string;
    browserInfo?: string;
    audioQuality?: number;
    noiseLevel?: number;
    duration?: number;
  };
}

export class DatabaseService {
  async createVoiceComplaint(data: VoiceComplaintInput, userId?: string) {
    return prisma.voiceComplaint.create({
      data: {
        audioUrl: data.audioUrl,
        originalText: data.originalText,
        translatedText: data.translatedText,
        sourceLanguage: data.sourceLanguage,
        targetLanguage: data.targetLanguage,
        confidence: data.confidence,
        category: data.category,
        priority: data.priority,
        location: data.location,
        deviceInfo: data.metadata.deviceInfo,
        browserInfo: data.metadata.browserInfo,
        audioQuality: data.metadata.audioQuality,
        noiseLevel: data.metadata.noiseLevel,
        duration: data.metadata.duration,
        userId,
      },
      include: {
        user: true,
        assignedTo: true,
        tags: true,
      },
    });
  }

  async getVoiceComplaint(id: string) {
    return prisma.voiceComplaint.findUnique({
      where: { id },
      include: {
        user: true,
        assignedTo: true,
        tags: true,
        updates: {
          include: {
            user: true,
          },
          orderBy: {
            timestamp: 'desc',
          },
        },
      },
    });
  }

  async updateVoiceComplaint(id: string, data: Partial<VoiceComplaintInput>) {
    return prisma.voiceComplaint.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
      include: {
        user: true,
        assignedTo: true,
        tags: true,
      },
    });
  }

  async addUpdate(
    complaintId: string,
    userId: string,
    status: string,
    note: string
  ) {
    const [update, complaint] = await prisma.$transaction([
      prisma.update.create({
        data: {
          complaintId,
          userId,
          status,
          note,
        },
        include: {
          user: true,
        },
      }),
      prisma.voiceComplaint.update({
        where: { id: complaintId },
        data: {
          status,
          updatedAt: new Date(),
        },
      }),
    ]);

    return update;
  }

  async assignComplaint(complaintId: string, assignedToId: string) {
    return prisma.voiceComplaint.update({
      where: { id: complaintId },
      data: {
        assignedToId,
        updatedAt: new Date(),
      },
      include: {
        assignedTo: true,
      },
    });
  }

  async addTag(complaintId: string, tagName: string) {
    const tag = await prisma.tag.upsert({
      where: { name: tagName },
      create: { name: tagName },
      update: {},
    });

    return prisma.voiceComplaint.update({
      where: { id: complaintId },
      data: {
        tags: {
          connect: { id: tag.id },
        },
      },
      include: {
        tags: true,
      },
    });
  }

  async searchComplaints(params: {
    category?: string;
    priority?: string;
    status?: string;
    location?: string;
    startDate?: Date;
    endDate?: Date;
    searchTerm?: string;
  }) {
    const {
      category,
      priority,
      status,
      location,
      startDate,
      endDate,
      searchTerm,
    } = params;

    return prisma.voiceComplaint.findMany({
      where: {
        AND: [
          category ? { category } : {},
          priority ? { priority } : {},
          status ? { status } : {},
          location ? { location } : {},
          startDate ? { timestamp: { gte: startDate } } : {},
          endDate ? { timestamp: { lte: endDate } } : {},
          searchTerm
            ? {
                OR: [
                  { originalText: { contains: searchTerm, mode: 'insensitive' } },
                  { translatedText: { contains: searchTerm, mode: 'insensitive' } },
                ],
              }
            : {},
        ],
      },
      include: {
        user: true,
        assignedTo: true,
        tags: true,
        updates: {
          include: {
            user: true,
          },
          take: 1,
          orderBy: {
            timestamp: 'desc',
          },
        },
      },
      orderBy: {
        timestamp: 'desc',
      },
    });
  }

  async getStats() {
    const [
      totalComplaints,
      pendingComplaints,
      resolvedComplaints,
      categoryStats,
      priorityStats,
    ] = await Promise.all([
      prisma.voiceComplaint.count(),
      prisma.voiceComplaint.count({
        where: { status: 'pending' },
      }),
      prisma.voiceComplaint.count({
        where: { status: 'resolved' },
      }),
      prisma.voiceComplaint.groupBy({
        by: ['category'],
        _count: true,
      }),
      prisma.voiceComplaint.groupBy({
        by: ['priority'],
        _count: true,
      }),
    ]);

    return {
      totalComplaints,
      pendingComplaints,
      resolvedComplaints,
      categoryStats,
      priorityStats,
    };
  }
}

export const db = new DatabaseService(); 
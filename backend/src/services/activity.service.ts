import prisma from '../lib/prisma';

export enum ActivityType {
  BOARD_CREATED = 'BOARD_CREATED',
  BOARD_UPDATED = 'BOARD_UPDATED',
  BOARD_DELETED = 'BOARD_DELETED',
  LIST_CREATED = 'LIST_CREATED',
  LIST_UPDATED = 'LIST_UPDATED',
  LIST_DELETED = 'LIST_DELETED',
  CARD_CREATED = 'CARD_CREATED',
  CARD_UPDATED = 'CARD_UPDATED',
  CARD_DELETED = 'CARD_DELETED',
  CARD_MOVED = 'CARD_MOVED',
  COMMENT_CREATED = 'COMMENT_CREATED',
  COMMENT_UPDATED = 'COMMENT_UPDATED',
  COMMENT_DELETED = 'COMMENT_DELETED',
  TAG_ASSIGNED = 'TAG_ASSIGNED',
  TAG_REMOVED = 'TAG_REMOVED',
}

interface LogActivityParams {
  type: ActivityType;
  userId: string;
  tenantId: string;  // ✅ Add this
  boardId: string;
  cardId?: string | null;
  listId?: string | null;
  metadata?: Record<string, any>;
}

export async function logActivity(params: LogActivityParams) {
  try {
    await prisma.activityEvent.create({
      data: {
        type: params.type,
        userId: params.userId,
        tenantId: params.tenantId,  // ✅ Add this
        boardId: params.boardId,
        cardId: params.cardId || null,
        listId: params.listId || null,
        metadata: params.metadata || {},
      },
    });
  } catch (error) {
    console.error('Activity logging error:', error);
  }
}

export async function getActivityForBoard(
  boardId: string,
  limit: number = 50
) {
  return prisma.activityEvent.findMany({
    where: { boardId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      card: {
        select: {
          id: true,
          title: true,
        },
      },
      list: {
        select: {
          id: true,
          title: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: limit,
  });
}

export async function getActivityForCard(
  cardId: string,
  limit: number = 50
) {
  return prisma.activityEvent.findMany({
    where: { cardId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: limit,
  });
}

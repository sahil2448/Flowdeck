import { Request, Response } from 'express';
import { getActivityForBoard, getActivityForCard } from '../services/activity.service';
import prisma from '../lib/prisma';

export async function getBoardActivity(req: Request, res: Response) {
  try {
    const { boardId } = req.params;
    const tenantId = req.user?.tenantId;
    const limit = parseInt(req.query.limit as string) || 50;

    if (!tenantId) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User not authenticated',
      });
    }

    // Verify board belongs to tenant
    const board = await prisma.board.findFirst({
      where: {
        id: boardId,
        tenantId,
      },
    });

    if (!board) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Board not found',
      });
    }

    const activities = await getActivityForBoard(boardId, limit);

    res.status(200).json({
      activities,
    });
  } catch (error) {
    console.error('Get board activity error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch activity',
    });
  }
}

export async function getCardActivity(req: Request, res: Response) {
  try {
    const { cardId } = req.params;
    const tenantId = req.user?.tenantId;
    const limit = parseInt(req.query.limit as string) || 50;

    if (!tenantId) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User not authenticated',
      });
    }

    // Verify card belongs to tenant
    const card = await prisma.card.findFirst({
      where: {
        id: cardId,
        list: {
          board: {
            tenantId,
          },
        },
      },
    });

    if (!card) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Card not found',
      });
    }

    const activities = await getActivityForCard(cardId, limit);

    res.status(200).json({
      activities,
    });
  } catch (error) {
    console.error('Get card activity error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch activity',
    });
  }
}

import { Request, Response } from 'express';
import { Server } from 'socket.io';
import prisma from '../lib/prisma';

// Get all members of a board (for assignment dropdown)
export async function getBoardMembers(req: Request, res: Response) {
  try {
    const { boardId } = req.params;
    const tenantId = req.user?.tenantId;

    // Verify board belongs to tenant
    const board = await prisma.board.findFirst({
      where: { id: boardId, tenantId },
    });

    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }

    // Get all users in the tenant (for simplicity)
    // In production, you might have BoardMember table for explicit board access
    const users = await prisma.user.findMany({
      where: { tenantId },
      select: {
        id: true,
        name: true,
        email: true,
      },
      orderBy: { name: 'asc' },
    });

    res.json({ members: users });
  } catch (error) {
    console.error('Get board members error:', error);
    res.status(500).json({ error: 'Failed to fetch board members' });
  }
}

// Get members assigned to a card
export async function getCardMembers(req: Request, res: Response) {
  try {
    const { cardId } = req.params;
    const tenantId = req.user?.tenantId;

    // Verify card belongs to tenant
    const card = await prisma.card.findFirst({
      where: {
        id: cardId,
        list: { board: { tenantId } },
      },
    });

    if (!card) {
      return res.status(404).json({ error: 'Card not found' });
    }

    const cardMembers = await prisma.cardMember.findMany({
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
    });

    const members = cardMembers.map(cm => cm.user);

    res.json({ members });
  } catch (error) {
    console.error('Get card members error:', error);
    res.status(500).json({ error: 'Failed to fetch card members' });
  }
}

// Add member to card
export async function addCardMember(req: Request, res: Response) {
  try {
    const { cardId } = req.params;
    const { userId } = req.body;
    const tenantId = req.user?.tenantId;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    // Verify card belongs to tenant
    const card = await prisma.card.findFirst({
      where: {
        id: cardId,
        list: { board: { tenantId } },
      },
      include: {
        list: {
          select: { boardId: true },
        },
      },
    });

    if (!card) {
      return res.status(404).json({ error: 'Card not found' });
    }

    // Verify user exists in tenant
    const user = await prisma.user.findFirst({
      where: { id: userId, tenantId },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if already assigned
    const existing = await prisma.cardMember.findUnique({
      where: {
        cardId_userId: { cardId, userId },
      },
    });

    if (existing) {
      return res.status(409).json({ error: 'Member already assigned' });
    }

    const cardMember = await prisma.cardMember.create({
      data: { cardId, userId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Broadcast to card room
    const io: Server = req.app.get('io');
    io.to(`card:${cardId}`).emit('memberAdded', {
      cardId,
      member: cardMember.user,
    });

    res.status(201).json({ member: cardMember.user });
  } catch (error) {
    console.error('Add card member error:', error);
    res.status(500).json({ error: 'Failed to add member' });
  }
}

// Remove member from card
export async function removeCardMember(req: Request, res: Response) {
  try {
    const { cardId, userId } = req.params;
    const tenantId = req.user?.tenantId;

    // Verify card belongs to tenant
    const card = await prisma.card.findFirst({
      where: {
        id: cardId,
        list: { board: { tenantId } },
      },
    });

    if (!card) {
      return res.status(404).json({ error: 'Card not found' });
    }

    const cardMember = await prisma.cardMember.findUnique({
      where: {
        cardId_userId: { cardId, userId },
      },
    });

    if (!cardMember) {
      return res.status(404).json({ error: 'Member not assigned to this card' });
    }

    await prisma.cardMember.delete({
      where: {
        cardId_userId: { cardId, userId },
      },
    });

    // Broadcast to card room
    const io: Server = req.app.get('io');
    io.to(`card:${cardId}`).emit('memberRemoved', {
      cardId,
      userId,
    });

    res.json({ message: 'Member removed successfully' });
  } catch (error) {
    console.error('Remove card member error:', error);
    res.status(500).json({ error: 'Failed to remove member' });
  }
}

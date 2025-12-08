import { Request, Response } from 'express';
import { Server } from 'socket.io';
import prisma from '../lib/prisma';

// Get all tags for a board
export async function getBoardTags(req: Request, res: Response) {
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

    const tags = await prisma.tag.findMany({
      where: { boardId },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ tags });
  } catch (error) {
    console.error('Get board tags error:', error);
    res.status(500).json({ error: 'Failed to fetch tags' });
  }
}

// Create a new tag
export async function createTag(req: Request, res: Response) {
  try {
    const { boardId, name, color } = req.body;
    const tenantId = req.user?.tenantId;

    if (!name || !boardId) {
      return res.status(400).json({ error: 'name and boardId are required' });
    }

    // Verify board belongs to tenant
    const board = await prisma.board.findFirst({
      where: { id: boardId, tenantId },
    });

    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }

    // Check if tag with same name exists
    const existing = await prisma.tag.findUnique({
      where: {
        boardId_name: { boardId, name },
      },
    });

    if (existing) {
      return res.status(409).json({ error: 'Tag with this name already exists' });
    }

    const tag = await prisma.tag.create({
      data: {
        name,
        color: color || '#gray',
        boardId,
      },
    });

    // Broadcast to board room
    const io: Server = req.app.get('io');
    io.to(`board:${boardId}`).emit('tagCreated', { boardId, tag });

    res.status(201).json({ tag });
  } catch (error) {
    console.error('Create tag error:', error);
    res.status(500).json({ error: 'Failed to create tag' });
  }
}

// Update tag
export async function updateTag(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { name, color } = req.body;
    const tenantId = req.user?.tenantId;

    // Verify tag belongs to tenant's board
    const existingTag = await prisma.tag.findFirst({
      where: {
        id,
        board: { tenantId },
      },
      include: { board: true },
    });

    if (!existingTag) {
      return res.status(404).json({ error: 'Tag not found' });
    }

    const tag = await prisma.tag.update({
      where: { id },
      data: {
        name: name || existingTag.name,
        color: color || existingTag.color,
      },
    });

    // Broadcast to board room
    const io: Server = req.app.get('io');
    io.to(`board:${existingTag.boardId}`).emit('tagUpdated', {
      boardId: existingTag.boardId,
      tag,
    });

    res.json({ tag });
  } catch (error) {
    console.error('Update tag error:', error);
    res.status(500).json({ error: 'Failed to update tag' });
  }
}

// Delete tag
export async function deleteTag(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const tenantId = req.user?.tenantId;

    // Verify tag belongs to tenant's board
    const existingTag = await prisma.tag.findFirst({
      where: {
        id,
        board: { tenantId },
      },
    });

    if (!existingTag) {
      return res.status(404).json({ error: 'Tag not found' });
    }

    await prisma.tag.delete({
      where: { id },
    });

    // Broadcast to board room
    const io: Server = req.app.get('io');
    io.to(`board:${existingTag.boardId}`).emit('tagDeleted', {
      boardId: existingTag.boardId,
      tagId: id,
    });

    res.json({ message: 'Tag deleted successfully' });
  } catch (error) {
    console.error('Delete tag error:', error);
    res.status(500).json({ error: 'Failed to delete tag' });
  }
}

// Get tags assigned to a card
export async function getCardTags(req: Request, res: Response) {
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

    const cardTags = await prisma.cardTag.findMany({
      where: { cardId },
      include: {
        tag: true,
      },
    });

    const tags = cardTags.map(ct => ct.tag);

    res.json({ tags });
  } catch (error) {
    console.error('Get card tags error:', error);
    res.status(500).json({ error: 'Failed to fetch card tags' });
  }
}

// Add tag to card
export async function addTagToCard(req: Request, res: Response) {
  try {
    const { cardId } = req.params;
    const { tagId } = req.body;
    const tenantId = req.user?.tenantId;

    if (!tagId) {
      return res.status(400).json({ error: 'tagId is required' });
    }

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

    // Verify tag exists
    const tag = await prisma.tag.findFirst({
      where: {
        id: tagId,
        board: { tenantId },
      },
    });

    if (!tag) {
      return res.status(404).json({ error: 'Tag not found' });
    }

    // Check if already assigned
    const existing = await prisma.cardTag.findUnique({
      where: {
        cardId_tagId: { cardId, tagId },
      },
    });

    if (existing) {
      return res.status(409).json({ error: 'Tag already assigned to this card' });
    }

    await prisma.cardTag.create({
      data: { cardId, tagId },
    });

    // Broadcast to card room
    const io: Server = req.app.get('io');
    io.to(`card:${cardId}`).emit('tagAddedToCard', { cardId, tag });

    res.status(201).json({ tag });
  } catch (error) {
    console.error('Add tag to card error:', error);
    res.status(500).json({ error: 'Failed to add tag to card' });
  }
}

// Remove tag from card
export async function removeTagFromCard(req: Request, res: Response) {
  try {
    const { cardId, tagId } = req.params;
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

    const cardTag = await prisma.cardTag.findUnique({
      where: {
        cardId_tagId: { cardId, tagId },
      },
    });

    if (!cardTag) {
      return res.status(404).json({ error: 'Tag not assigned to this card' });
    }

    await prisma.cardTag.delete({
      where: {
        cardId_tagId: { cardId, tagId },
      },
    });

    // Broadcast to card room
    const io: Server = req.app.get('io');
    io.to(`card:${cardId}`).emit('tagRemovedFromCard', { cardId, tagId });

    res.json({ message: 'Tag removed successfully' });
  } catch (error) {
    console.error('Remove tag from card error:', error);
    res.status(500).json({ error: 'Failed to remove tag from card' });
  }
}

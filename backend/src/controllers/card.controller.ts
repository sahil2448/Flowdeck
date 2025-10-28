import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { logActivity, ActivityType } from '../services/activity.service'; // Add import

// Create a new card in a list
export async function createCard(req: Request, res: Response) {
  try {
    const { title, description, listId } = req.body;
    const tenantId = req.user?.tenantId;
    const userId = req.user?.userId;

    if (!tenantId || !userId) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User not authenticated',
      });
    }

    if (!title || !listId) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Title and listId are required',
      });
    }

    // Verify list belongs to tenant's board
    const list = await prisma.list.findFirst({
      where: {
        id: listId,
        board: {
          tenantId,
        },
      },
    });

    if (!list) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'List not found',
      });
    }

    // Get the highest position to add new card at the end
    const lastCard = await prisma.card.findFirst({
      where: { listId },
      orderBy: { position: 'desc' },
    });

    const position = lastCard ? lastCard.position + 1 : 0;

    const card = await prisma.card.create({
      data: {
        title,
        description: description || null,
        listId,
        position,
      },
    });

        await logActivity({
      type: ActivityType.CARD_CREATED,
      userId: userId!,
      boardId: list.boardId,
      cardId: card.id,
      listId: list.id,
        tenantId: tenantId,  // ✅ Add this everywhere

      metadata: {
        cardTitle: card.title,
        listTitle: list.title,
      },
    });

    res.status(201).json({
      message: 'Card created successfully',
      card,
    });
  } catch (error) {
    console.error('Create card error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to create card',
    });
  }
}

// Get all cards for a list
export async function getCards(req: Request, res: Response) {
  try {
    const { listId } = req.params;
    const tenantId = req.user?.tenantId;

    if (!tenantId) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User not authenticated',
      });
    }

    // Verify list belongs to tenant's board
    const list = await prisma.list.findFirst({
      where: {
        id: listId,
        board: {
          tenantId,
        },
      },
    });

    if (!list) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'List not found',
      });
    }

    const cards = await prisma.card.findMany({
      where: { listId },
      include: {
        _count: {
          select: {
            comments: true,
            attachments: true,
          },
        },
      },
      orderBy: {
        position: 'asc',
      },
    });

    res.status(200).json({
      cards,
    });
  } catch (error) {
    console.error('Get cards error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch cards',
    });
  }
}

// Get single card by ID
export async function getCard(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const tenantId = req.user?.tenantId;

    if (!tenantId) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User not authenticated',
      });
    }

    const card = await prisma.card.findFirst({
      where: {
        id,
        list: {
          board: {
            tenantId,
          },
        },
      },
      include: {
        list: {
          select: {
            id: true,
            title: true,
            boardId: true,
          },
        },
        comments: {
          orderBy: {
            createdAt: 'desc',
          },
        },
        attachments: {
          orderBy: {
            createdAt: 'desc',
          },
        },
        cardTags: {  // ✅ Changed from 'tags' to 'cardTags'
          include: {
            tag: true,
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

    res.status(200).json({
      card,
    });
  } catch (error) {
    console.error('Get card error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch card',
    });
  }
}

// Update card
export async function updateCard(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { title, description, listId, position } = req.body;
    const tenantId = req.user?.tenantId;
    const userId = req.user?.userId;

    if (!tenantId || !userId) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User not authenticated',
      });
    }

    // Verify card belongs to tenant's board
    const existingCard = await prisma.card.findFirst({
      where: {
        id,
        list: {
          board: {
            tenantId,
          },
        },
      },
    });

    if (!existingCard) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Card not found',
      });
    }

    // If moving to different list, verify new list exists
    if (listId && listId !== existingCard.listId) {
      const newList = await prisma.list.findFirst({
        where: {
          id: listId,
          board: {
            tenantId,
          },
        },
      });

      if (!newList) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Target list not found',
        });
      }
    }

    const card = await prisma.card.update({
      where: { id },
      data: {
        title: title || existingCard.title,
        description: description !== undefined ? description : existingCard.description,
        listId: listId || existingCard.listId,
        position: position !== undefined ? position : existingCard.position,
      },
    });

        if (listId && listId !== existingCard.listId) {
      const oldList = await prisma.list.findUnique({
        where: { id: existingCard.listId },
      });
      const newList = await prisma.list.findUnique({
        where: { id: listId },
      });

      await logActivity({
        type: ActivityType.CARD_MOVED,
        userId: userId!,
        boardId: newList!.boardId,
        cardId: card.id,
        listId: listId,
          tenantId: tenantId,  // ✅ Add this everywhere

        metadata: {
          cardTitle: card.title,
          fromList: oldList?.title,
          toList: newList?.title,
        },
      });
    } else if (title || description !== undefined) {
      // Card was updated but not moved
      const list = await prisma.list.findUnique({
        where: { id: existingCard.listId },
      });

      await logActivity({
        type: ActivityType.CARD_UPDATED,
        userId: userId!,
        boardId: list!.boardId,
        cardId: card.id,
        listId: existingCard.listId,
          tenantId: tenantId,  // ✅ Add this everywhere

        metadata: {
          cardTitle: card.title,
          changes: { title, description },
        },
      });
    }

    res.status(200).json({
      message: 'Card updated successfully',
      card,
    });
  } catch (error) {
    console.error('Update card error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to update card',
    });
  }
}

// Delete card
export async function deleteCard(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const tenantId = req.user?.tenantId;

    if (!tenantId) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User not authenticated',
      });
    }

    // Verify card belongs to tenant's board
    const existingCard = await prisma.card.findFirst({
      where: {
        id,
        list: {
          board: {
            tenantId,
          },
        },
      },
    });

    if (!existingCard) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Card not found',
      });
    }

    await prisma.card.delete({
      where: { id },
    });

    res.status(200).json({
      message: 'Card deleted successfully',
    });
  } catch (error) {
    console.error('Delete card error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to delete card',
    });
  }
}

import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { logActivity, ActivityType } from '../services/activity.service'; // Add import


// Create a new tag for a board
export async function createTag(req: Request, res: Response) {
  try {
    const { name, color, boardId } = req.body;
    const tenantId = req.user?.tenantId;

    if (!tenantId) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User not authenticated',
      });
    }

    if (!name || !boardId) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Name and boardId are required',
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

    // Check if tag with same name exists on this board
    const existingTag = await prisma.tag.findFirst({
      where: {
        name,
        boardId,
      },
    });

    if (existingTag) {
      return res.status(409).json({
        error: 'Conflict',
        message: 'Tag with this name already exists on this board',
      });
    }

    const tag = await prisma.tag.create({
      data: {
        name,
        color: color || '#808080', // Default gray color
        boardId,
      },
    });

    res.status(201).json({
      message: 'Tag created successfully',
      tag,
    });
  } catch (error) {
    console.error('Create tag error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to create tag',
    });
  }
}

// Get all tags for a board
export async function getTags(req: Request, res: Response) {
  try {
    const { boardId } = req.params;
    const tenantId = req.user?.tenantId;

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

    const tags = await prisma.tag.findMany({
      where: { boardId },
      include: {
        _count: {
          select: {
            cardTags: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    res.status(200).json({
      tags,
    });
  } catch (error) {
    console.error('Get tags error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch tags',
    });
  }
}

// Update tag
export async function updateTag(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { name, color } = req.body;
    const tenantId = req.user?.tenantId;

    if (!tenantId) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User not authenticated',
      });
    }

    // Verify tag belongs to tenant's board
    const existingTag = await prisma.tag.findFirst({
      where: {
        id,
        board: {
          tenantId,
        },
      },
    });

    if (!existingTag) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Tag not found',
      });
    }

    const tag = await prisma.tag.update({
      where: { id },
      data: {
        name: name || existingTag.name,
        color: color || existingTag.color,
      },
    });

    res.status(200).json({
      message: 'Tag updated successfully',
      tag,
    });
  } catch (error) {
    console.error('Update tag error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to update tag',
    });
  }
}

// Delete tag
export async function deleteTag(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const tenantId = req.user?.tenantId;

    if (!tenantId) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User not authenticated',
      });
    }

    // Verify tag belongs to tenant's board
    const existingTag = await prisma.tag.findFirst({
      where: {
        id,
        board: {
          tenantId,
        },
      },
    });

    if (!existingTag) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Tag not found',
      });
    }

    // Delete tag (CardTag entries will be cascade deleted)
    await prisma.tag.delete({
      where: { id },
    });

    res.status(200).json({
      message: 'Tag deleted successfully',
    });
  } catch (error) {
    console.error('Delete tag error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to delete tag',
    });
  }
}

// Assign tag to card
export async function assignTagToCard(req: Request, res: Response) {
  try {
    const { tagId, cardId } = req.body;
    const tenantId = req.user?.tenantId;

    if (!tenantId) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User not authenticated',
      });
    }

    if (!tagId || !cardId) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'TagId and cardId are required',
      });
    }

    // Verify both tag and card belong to same tenant's board
    const tag = await prisma.tag.findFirst({
      where: {
        id: tagId,
        board: {
          tenantId,
        },
      },
    });

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

    if (!tag || !card) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Tag or card not found',
      });
    }

    // Check if already assigned
    const existing = await prisma.cardTag.findUnique({
      where: {
        cardId_tagId: {
          cardId,
          tagId,
        },
      },
    });

    if (existing) {
      return res.status(409).json({
        error: 'Conflict',
        message: 'Tag already assigned to this card',
      });
    }

    const cardTag = await prisma.cardTag.create({
      data: {
        cardId,
        tagId,
      },
      include: {
        tag: true,
      },
    });

        // ✅ Log activity
    const cardWithBoard = await prisma.card.findUnique({
      where: { id: cardId },
      include: {
        list: {
          select: {
            boardId: true,
          },
        },
      },
    });

    await logActivity({
      type: ActivityType.TAG_ASSIGNED,
      userId: req.user!.userId,
      boardId: cardWithBoard!.list.boardId,
      cardId: cardId,
      metadata: {
        tagName: tag!.name,
        tagColor: tag!.color,
      },
    });

    res.status(201).json({
      message: 'Tag assigned to card successfully',
      cardTag,
    });
  } catch (error) {
    console.error('Assign tag error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to assign tag',
    });
  }
}

// Remove tag from card
export async function removeTagFromCard(req: Request, res: Response) {
  try {
    const { tagId, cardId } = req.body;
    const tenantId = req.user?.tenantId;

    if (!tenantId) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User not authenticated',
      });
    }

    if (!tagId || !cardId) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'TagId and cardId are required',
      });
    }

    // Verify assignment exists and belongs to tenant
    const cardTag = await prisma.cardTag.findFirst({
      where: {
        cardId,
        tagId,
        card: {
          list: {
            board: {
              tenantId,
            },
          },
        },
      },
    });

    if (!cardTag) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Tag assignment not found',
      });
    }

    await prisma.cardTag.delete({
      where: {
        cardId_tagId: {
          cardId,
          tagId,
        },
      },
    });

    res.status(200).json({
      message: 'Tag removed from card successfully',
    });
  } catch (error) {
    console.error('Remove tag error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to remove tag',
    });
  }
}

// Get all tags for a specific card
export async function getCardTags(req: Request, res: Response) {
  try {
    const { cardId } = req.params;
    const tenantId = req.user?.tenantId;

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

    const cardTags = await prisma.cardTag.findMany({
      where: { cardId },
      include: {
        tag: true,
      },
    });

    res.status(200).json({
      tags: cardTags.map((ct) => ct.tag),
    });
  } catch (error) {
    console.error('Get card tags error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch card tags',
    });
  }
}

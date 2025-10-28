import { Request, Response } from 'express';
import prisma from '../lib/prisma';

// Add comment to a card
export async function createComment(req: Request, res: Response) {
  try {
    const { content, cardId } = req.body;
    const userId = req.user?.userId;
    const tenantId = req.user?.tenantId;

    if (!tenantId || !userId) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User not authenticated',
      });
    }

    if (!content || !cardId) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Content and cardId are required',
      });
    }

    // Verify card belongs to tenant's board
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

    const comment = await prisma.comment.create({
      data: {
        content,
        cardId,
        userId,
      },
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

    res.status(201).json({
      message: 'Comment created successfully',
      comment,
    });
  } catch (error) {
    console.error('Create comment error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to create comment',
    });
  }
}

// Get all comments for a card
export async function getComments(req: Request, res: Response) {
  try {
    const { cardId } = req.params;
    const tenantId = req.user?.tenantId;

    if (!tenantId) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User not authenticated',
      });
    }

    // Verify card belongs to tenant's board
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

    const comments = await prisma.comment.findMany({
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
    });

    res.status(200).json({
      comments,
    });
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch comments',
    });
  }
}

// Update comment
export async function updateComment(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user?.userId;
    const tenantId = req.user?.tenantId;

    if (!tenantId || !userId) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User not authenticated',
      });
    }

    if (!content) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Content is required',
      });
    }

    // Verify comment belongs to user and tenant
    const existingComment = await prisma.comment.findFirst({
      where: {
        id,
        userId, // Only author can edit
        card: {
          list: {
            board: {
              tenantId,
            },
          },
        },
      },
    });

    if (!existingComment) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Comment not found or you do not have permission to edit it',
      });
    }

    const comment = await prisma.comment.update({
      where: { id },
      data: { content },
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

    res.status(200).json({
      message: 'Comment updated successfully',
      comment,
    });
  } catch (error) {
    console.error('Update comment error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to update comment',
    });
  }
}

// Delete comment
export async function deleteComment(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    const tenantId = req.user?.tenantId;

    if (!tenantId || !userId) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User not authenticated',
      });
    }

    // Verify comment belongs to user and tenant
    const existingComment = await prisma.comment.findFirst({
      where: {
        id,
        userId, // Only author can delete
        card: {
          list: {
            board: {
              tenantId,
            },
          },
        },
      },
    });

    if (!existingComment) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Comment not found or you do not have permission to delete it',
      });
    }

    await prisma.comment.delete({
      where: { id },
    });

    res.status(200).json({
      message: 'Comment deleted successfully',
    });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to delete comment',
    });
  }
}

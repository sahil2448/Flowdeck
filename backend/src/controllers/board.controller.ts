import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { logActivity, ActivityType } from '../services/activity.service'; // Add this import


// Create a new board
export async function createBoard(req: Request, res: Response) {
  try {
    const { title, description } = req.body;
    const tenantId = req.user?.tenantId;
    const userId = req.user?.userId;

    if (!tenantId || !userId) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User not authenticated',
      });
    }

    if (!title) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Board title is required',
      });
    }

    const board = await prisma.board.create({
      data: {
        title,
        description: description || null,
        tenantId,
        // createdById: userId,
      },
    });

        await logActivity({
      type: ActivityType.BOARD_CREATED,
      userId: userId!,
      boardId: board.id,
        tenantId: tenantId,  // ✅ Add this everywhere
      metadata: {
        boardTitle: board.title,
      },
    });

    res.status(201).json({
      message: 'Board created successfully',
      board,
    });
  } catch (error) {
    console.error('Create board error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to create board',
    });
  }
}

// get all boards for the tenant
export async function getBoards(req: Request, res: Response) {
  try {
    const tenantId = req.user?.tenantId;

    if (!tenantId) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User not authenticated',
      });
    }

    const boards = await prisma.board.findMany({
      where: {
        tenantId,
      },
      include: {
        _count: {
          select: {
            lists: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.status(200).json({
      boards,
    });
  } catch (error) {
    console.error('Get boards error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch boards',
    });
  }
}


// Get a single board by ID
export async function getBoard(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const tenantId = req.user?.tenantId;

    if (!tenantId) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User not authenticated',
      });
    }

    const board = await prisma.board.findFirst({
      where: {
        id,
        tenantId,
      },
      include: {
        lists: {
          orderBy: {
            position: 'asc',
          },
          include: {
            _count: {
              select: {
                cards: true,
              },
            },
          },
        },
      },
    });

    if (!board) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Board not found',
      });
    }

    res.status(200).json({
      board,
    });
  } catch (error) {
    console.error('Get board error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch board',
    });
  }
}



// Update board
export async function updateBoard(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { title, description } = req.body;
    const tenantId = req.user?.tenantId;
        const userId = req.user?.userId; // ✅ Add this line


    if (!tenantId || !userId) { // ✅ Check userId too
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User not authenticated',
      });
    }

    // Check if board exists and belongs to tenant
    const existingBoard = await prisma.board.findFirst({
      where: {
        id,
        tenantId,
      },
    });

    if (!existingBoard) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Board not found',
      });
    }

    const board = await prisma.board.update({
      where: {
        id,
      },
      data: {
        title: title || existingBoard.title,
        description: description !== undefined ? description : existingBoard.description,
      },
    });

    await logActivity({
  type: ActivityType.BOARD_UPDATED,
  userId: userId!,
  boardId: board.id,
    tenantId: tenantId,  // ✅ Add this everywhere

  metadata: {
    changes: { title, description },
  },
});

    res.status(200).json({
      message: 'Board updated successfully',
      board,
    });
  } catch (error) {
    console.error('Update board error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to update board',
    });
  }
}

// Delete board
export async function deleteBoard(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const tenantId = req.user?.tenantId;
        const userId = req.user?.userId; // ✅ Add this line


    if (!tenantId || !userId) { // ✅ Check userId too
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User not authenticated',
      });
    }

    // Check if board exists and belongs to tenant
    const existingBoard = await prisma.board.findFirst({
      where: {
        id,
        tenantId,
      },
    });

    if (!existingBoard) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Board not found',
      });
    }

    await logActivity({
  type: ActivityType.BOARD_DELETED,
  userId: userId!,
  boardId: id,
    tenantId: tenantId,  // ✅ Add this everywhere

  metadata: {
    boardTitle: existingBoard.title,
  },
});

    await prisma.board.delete({
      where: {
        id,
      },
    });

    res.status(200).json({
      message: 'Board deleted successfully',
    });
  } catch (error) {
    console.error('Delete board error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to delete board',
    });
  }
}

import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { logActivity, ActivityType } from '../services/activity.service';

// Create a new list in a board
export async function createList(req: Request, res: Response) {
  try {
    const { title, boardId } = req.body;
    const tenantId = req.user?.tenantId;
    const userId = req.user?.userId;

    if (!tenantId || !userId) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User not authenticated',
      });
    }

    if (!title || !boardId) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Title and boardId are required',
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

    // Get the highest position to add new list at the end
    const lastList = await prisma.list.findFirst({
      where: { boardId },
      orderBy: { position: 'desc' },
    });

    const position = lastList ? lastList.position + 1 : 0;

    const list = await prisma.list.create({
      data: {
        title,
        boardId,
        position,
      },
    });


        // ✅ Log activity
    await logActivity({
      type: ActivityType.LIST_CREATED,
      userId: userId,
      tenantId: tenantId,
      boardId: boardId,
      listId: list.id,
      metadata: {
        listTitle: list.title,
        position: list.position,
      },
    });

    res.status(201).json({
      message: 'List created successfully',
      list,
    });
  } catch (error) {
    console.error('Create list error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to create list',
    });
  }
}

// Get all lists for a board
export async function getLists(req: Request, res: Response) {
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

    const lists = await prisma.list.findMany({
      where: { boardId },
      include: {
        _count: {
          select: {
            cards: true,
          },
        },
      },
      orderBy: {
        position: 'asc',
      },
    });

    res.status(200).json({
      lists,
    });
  } catch (error) {
    console.error('Get lists error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch lists',
    });
  }
}

// Update list
export async function updateList(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { title, position } = req.body;
    const tenantId = req.user?.tenantId;
    const userId = req.user?.userId;

    if (!tenantId || !userId) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User not authenticated',
      });
    }

    // Verify list belongs to tenant's board
    const existingList = await prisma.list.findFirst({
      where: {
        id,
        board: {
          tenantId,
        },
      },
    });

    if (!existingList) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'List not found',
      });
    }

    const list = await prisma.list.update({
      where: { id },
      data: {
        title: title || existingList.title,
        position: position !== undefined ? position : existingList.position,
      },
    });

        // ✅ Log activity
    await logActivity({
      type: ActivityType.LIST_UPDATED,
      userId: userId,
      tenantId: tenantId,
      boardId: existingList.boardId,
      listId: list.id,
      metadata: {
        listTitle: list.title,
        changes: { title, position },
      },
    });

    res.status(200).json({
      message: 'List updated successfully',
      list,
    });
  } catch (error) {
    console.error('Update list error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to update list',
    });
  }
}

// Delete list
export async function deleteList(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const tenantId = req.user?.tenantId;
    const userId = req.user?.userId;

    if (!tenantId || !userId) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User not authenticated',
      });
    }

    // Verify list belongs to tenant's board
    const existingList = await prisma.list.findFirst({
      where: {
        id,
        board: {
          tenantId,
        },
      },
    });

    if (!existingList) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'List not found',
      });
    }

        // ✅ Log activity BEFORE deleting
    await logActivity({
      type: ActivityType.LIST_DELETED,
      userId: userId,
      tenantId: tenantId,
      boardId: existingList.boardId,
      listId: id,
      metadata: {
        listTitle: existingList.title,
      },
    });

    await prisma.list.delete({
      where: { id },
    });

    res.status(200).json({
      message: 'List deleted successfully',
    });
  } catch (error) {
    console.error('Delete list error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to delete list',
    });
  }
}

// write the export function for getByID
export async function getListById(req: Request, res: Response) {
  try {
    const { id } = req.params;
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
        id,
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

    res.status(200).json({
      list,
    });
  } catch (error) {
    console.error('Get list by ID error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch list',
    });
  }
}
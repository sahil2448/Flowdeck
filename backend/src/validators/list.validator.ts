import { z } from 'zod';

export const createListSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title too long'),
  boardId: z.string().uuid('Invalid board ID'),
});

export const updateListSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  position: z.number().int().nonnegative().optional(),
});

export type CreateListInput = z.infer<typeof createListSchema>;
export type UpdateListInput = z.infer<typeof updateListSchema>;

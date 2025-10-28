import { z } from 'zod';

export const createTagSchema = z.object({
  name: z.string().min(1, 'Name is required').max(50, 'Name too long'),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color').optional(),
  boardId: z.string().uuid('Invalid board ID'),
});

export const assignTagSchema = z.object({
  tagId: z.string().uuid('Invalid tag ID'),
  cardId: z.string().uuid('Invalid card ID'),
});

export type CreateTagInput = z.infer<typeof createTagSchema>;
export type AssignTagInput = z.infer<typeof assignTagSchema>;

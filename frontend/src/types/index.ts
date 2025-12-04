// src/types/index.ts

export interface Card {
  id: string;
  title: string;
  description: string | null;
  listId: string;
  position: number;
  version: number;
  createdAt: Date;
  updatedAt: Date;
  // Optional relations (depending on if you include them in the query)
  comments?: Comment[];
  attachments?: Attachment[];
}

export interface Comment {
  id: string;
  content: string;
  cardId: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Attachment {
  id: string;
  filename: string;
  url: string;
  cardId: string;
  createdAt: Date;
}

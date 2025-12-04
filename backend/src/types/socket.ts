import { Server, Socket } from 'socket.io';

export interface ServerToClientEvents {
  newComment: (data: any) => void;
  commentUpdated: (data: any) => void;
  commentDeleted: (data: { cardId: string; commentId: string }) => void;
  cardUpdated: (data: any) => void;
}

export interface ClientToServerEvents {
  joinCard: (cardId: string) => void;
  leaveCard: (cardId: string) => void;
  joinBoard: (boardId: string) => void;
  leaveBoard: (boardId: string) => void;
}

export interface InterServerEvents {
  ping: () => void;
}

export interface SocketData {
  userId?: string;
  tenantId?: string;
}

export type TypedServer = Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;

export type TypedSocket = Socket<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;

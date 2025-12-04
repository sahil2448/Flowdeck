import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';

export interface SocketUser {
  userId: string;
  tenantId: string;
  name: string;
}

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
  user?: SocketUser;
}

export type TypedServer = SocketIOServer<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;

export type TypedSocket = Parameters<Parameters<TypedServer['on']>[1]>[0];

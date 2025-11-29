import { create } from 'zustand';
import { api } from '@/lib/api';

interface Board {
  id: string;
  title: string;
  description: string | null;
  createdAt: string;
}

interface BoardsState {
  boards: Board[];
  loading: boolean;
  error: string | null;
  fetchBoards: () => Promise<void>;
  createBoard: (title: string, description?: string) => Promise<Board>;
  deleteBoard: (id: string) => Promise<void>;
  renameBoard: (id: string, title: string) => Promise<void>; // ✅ Added
}

export const useBoardsStore = create<BoardsState>((set, get) => ({
  boards: [],
  loading: false,
  error: null,

  fetchBoards: async () => {
    set({ loading: true, error: null });
    try {
      const res = await api.get('/api/boards');
      set({ boards: res.data.boards, loading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.error || 'Failed to fetch boards', loading: false });
    }
  },

  createBoard: async (title: string, description?: string) => {
    try {
      const res = await api.post('/api/boards', { title, description });
      const newBoard = res.data.board;
      set({ boards: [...get().boards, newBoard] });
      return newBoard;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to create board');
    }
  },

  deleteBoard: async (id: string) => {
    try {
      await api.delete(`/api/boards/${id}`);
      set({ boards: get().boards.filter(b => b.id !== id) });
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to delete board');
    }
  },

  // ✅ Added Rename Action
  renameBoard: async (id: string, title: string) => {
    try {
        await api.patch(`/api/boards/${id}`, { title });
        set({
            boards: get().boards.map(b => b.id === id ? { ...b, title } : b)
        });
    } catch (error: any) {
        throw new Error(error.response?.data?.error || 'Failed to rename board');
    }
  }
}));

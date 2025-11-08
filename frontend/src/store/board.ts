import { create } from 'zustand';
import { api } from '@/lib/api';

interface Card {
  id: string;
  title: string;
  description: string | null;
  position: number;
  listId: string;
}

interface List {
  id: string;
  title: string;
  position: number;
  boardId: string;
  cards: Card[];
}

interface Board {
  id: string;
  title: string;
  description: string | null;
  lists: List[];
}

interface BoardState {
  board: Board | null;
  loading: boolean;
  error: string | null;
  reset:()=>void
  fetchBoard: (boardId: string) => Promise<void>;
  createList: (boardId: string, title: string) => Promise<void>;
  createCard: (listId: string, title: string, description?: string) => Promise<void>;
  moveCard: (cardId: string, newListId: string, newPosition: number) => Promise<void>;
  updateCard: (cardId: string, updates: Partial<Card>) => Promise<void>;
  deleteCard: (cardId: string) => Promise<void>;
}

export const useBoardStore = create<BoardState>((set, get) => ({
  board: null,
  loading: false,
  error: null,

    // ✅ Add reset function
  reset: () => {
    set({ board: null, loading: false, error: null });
  },

//   fetchBoard: async (boardId: string) => {
//     set({ loading: true, error: null }); // Keep this
//     try {
//       const res = await api.get(`/api/boards/${boardId}`);
//       set({ board: res.data.board, loading: false });
//     } catch (error: any) {
//       set({ 
//         error: error.response?.data?.error || 'Failed to fetch board', 
//         loading: false 
//       });
//     }
//   },
fetchBoard: async (boardId: string) => {
  set({ loading: true, error: null });
  try {
    const res = await api.get(`/api/boards/${boardId}`);
    
    // ✅ Ensure lists have cards array
    const board = res.data.board;
    if (board.lists) {
      board.lists = board.lists.map((list: any) => ({
        ...list,
        cards: list.cards || [] // ✅ Default to empty array if no cards
      }));
    }
    
    set({ board, loading: false });
  } catch (error: any) {
    set({ 
      error: error.response?.data?.error || 'Failed to fetch board', 
      loading: false 
    });
  }
},


  createList: async (boardId: string, title: string) => {
    try {
      const res = await api.post('/api/lists', { boardId, title });
      const newList = { ...res.data.list, cards: [] };
      const board = get().board;
      if (board) {
        set({
          board: {
            ...board,
            lists: [...board.lists, newList]
          }
        });
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to create list');
    }
  },

  createCard: async (listId: string, title: string, description?: string) => {
    try {
      const res = await api.post('/api/cards', { listId, title, description });
      const newCard = res.data.card;
      const board = get().board;
      if (board) {
        set({
          board: {
            ...board,
            lists: board.lists.map(list =>
              list.id === listId
                ? { ...list, cards: [...list.cards, newCard] }
                : list
            )
          }
        });
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to create card');
    }
  },

  moveCard: async (cardId: string, newListId: string, newPosition: number) => {
    try {
      await api.patch(`/api/cards/${cardId}`, { 
        listId: newListId, 
        position: newPosition 
      });
      // Optimistically update UI
      const board = get().board;
      if (board) {
        let movedCard: Card | null = null;
        const updatedLists = board.lists.map(list => ({
          ...list,
          cards: list.cards.filter(card => {
            if (card.id === cardId) {
              movedCard = card;
              return false;
            }
            return true;
          })
        }));

        if (movedCard) {
          const targetList = updatedLists.find(l => l.id === newListId);
          if (targetList) {
            targetList.cards.splice(newPosition, 0, { 
              ...movedCard, 
              listId: newListId 
            });
          }
        }

        set({ board: { ...board, lists: updatedLists } });
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to move card');
    }
  },

  updateCard: async (cardId: string, updates: Partial<Card>) => {
    try {
      const res = await api.patch(`/api/cards/${cardId}`, updates);
      const board = get().board;
      if (board) {
        set({
          board: {
            ...board,
            lists: board.lists.map(list => ({
              ...list,
              cards: list.cards.map(card =>
                card.id === cardId ? { ...card, ...res.data.card } : card
              )
            }))
          }
        });
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to update card');
    }
  },

  deleteCard: async (cardId: string) => {
    try {
      await api.delete(`/api/cards/${cardId}`);
      const board = get().board;
      if (board) {
        set({
          board: {
            ...board,
            lists: board.lists.map(list => ({
              ...list,
              cards: list.cards.filter(card => card.id !== cardId)
            }))
          }
        });
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to delete card');
    }
  },
}));

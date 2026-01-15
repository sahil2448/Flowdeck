import { create } from 'zustand';
import { api, commentApi } from '@/lib/api';

interface Card {
  id: string;
  title: string;
  description: string | null;
  position: number;
  listId: string;
  dueDate: Date | null;
}

interface List {
  id: string;
  title: string;
  position: number;
  boardId: string;
  cards: Card[];
}

export interface Board {
  id: string;
  title: string;
  description: string | null;
  lists: List[];
}

interface Comment {
  id: string;
  cardId: string;
  userId: string;
  userName: string;
  text: string;
  createdAt: Date;
}

interface BoardState {
  board: Board | null;
  loading: boolean;
  error: string | null;
  
  comments: Record<string, Comment[]>;
  
  reset: () => void;
  fetchBoard: (boardId: string) => Promise<void>;
  createList: (boardId: string, title: string) => Promise<void>;
  createCard: (listId: string, title: string, description?: string) => Promise<void>;
  moveCard: (cardId: string, fromListId: string, toListId: string, targetIndex: number) => Promise<void>;
  updateCard: (cardId: string, updates: Partial<Card>) => Promise<void>;
  deleteCard: (cardId: string) => Promise<void>;
  renameList: (listId: string, newTitle: string) => Promise<void>;
  deleteList: (listId: string) => Promise<void>;
  getListsById: (listId: string) => Promise<List | null>;
  moveList: (listId: string, targetIndex: number) => Promise<void>;
  getAllLists: (boardId: string) => Promise<List[]>;
  
  fetchComments: (cardId: string) => Promise<void>;
  addComment: (cardId: string, comment: Comment) => void;
  addCommentOptimistic: (cardId: string, text: string) => Promise<void>;
  deleteComment: (cardId: string, commentId: string) => Promise<void>;
    updateComment: (cardId: string, commentId: string, content: string) => Promise<void>;
  updateCommentLocal: (cardId: string, commentId: string, updates: Partial<Comment>) => void;
}

export const useBoardStore = create<BoardState>((set, get) => ({
  board: null,
  loading: false,
  error: null,
  comments: {},


  reset: () => {
    set({ board: null, loading: false, error: null, comments: {} });
  },

  fetchBoard: async (boardId: string) => {
    set({ loading: true, error: null });
    try {
      const res = await api.get(`/api/boards/${boardId}`);
      
      const board = res.data.board;
      if (board.lists) {
        board.lists = board.lists.map((list: any) => ({
          ...list,
          cards: list.cards || []
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
  getListsById: async (listId: string) => {
    const board = get().board;
    if (board) {
      return board.lists.find(list => list.id === listId) || null;
    }
    return null;
  },
  getAllLists: async (boardId: string) => {
    try {
      const res = await api.get(`/api/lists/board/${boardId}`);
      return res.data.lists;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to fetch lists');
    }
  },

  moveCard: async (cardId: string, fromListId: string, toListId: string, targetIndex: number) => {
    const board = get().board;
    if (board) {
      let movedCard: any = null;

      const updatedLists = board.lists.map(list => {
        if (list.id === fromListId) {
          return {
            ...list,
            cards: list.cards.filter(card => {
              if (card.id === cardId) {
                movedCard = card;
                return false;
              }
              return true;
            }),
          };
        }
        return { ...list };
      });

      if (movedCard) {
        const targetList = updatedLists.find(l => l.id === toListId);
        if (targetList) {
          targetList.cards.splice(targetIndex, 0, { ...movedCard, listId: toListId });
          targetList.cards.forEach((card, i) => (card.position = i));
          const prevList = updatedLists.find(l => l.id === fromListId);
          if (prevList) prevList.cards.forEach((card, i) => (card.position = i));
        }
      }

      set({ board: { ...board, lists: updatedLists } });

      api.patch(`/api/cards/${cardId}`, {
        listId: toListId,
        position: targetIndex,
      }).catch((error: any) => {
        console.error('Failed to move card:', error);
      });
    }
  },

  updateCard: async (cardId: string, updates: Partial<Card>) => {
    const board = get().board;
    const previousLists = board?.lists;

    
    if (board) {
      set({
        board: {
          ...board,
          lists: board.lists.map(list => ({
            ...list,
            cards: list.cards.map(card =>
              card.id === cardId ? { ...card, ...updates } : card
            )
          }))
        }
      });
    }

    try {
      const res = await api.patch(`/api/cards/${cardId}`, updates);
      
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
      if (board && previousLists) {
        set({ board: { ...board, lists: previousLists } });
      }
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
          },
          comments: Object.fromEntries(
            Object.entries(get().comments).filter(([key]) => key !== cardId)
          )
        });
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to delete card');
    }
  },

  renameList: async (listId: string, newTitle: string) => {
    try {
      await api.patch(`/api/lists/${listId}`, { title: newTitle });
      set((state) => {
        if (!state.board) return state;
        const lists = state.board.lists.map(l =>
          l.id === listId ? { ...l, title: newTitle } : l
        );
        return { board: { ...state.board, lists } };
      });
    } catch (error: any) {
      console.error("Failed to rename list:", error);
      throw error;
    }
  },

  deleteList: async (listId: string) => {
    try {
      await api.delete(`/api/lists/${listId}`);
      set((state) => {
        if (!state.board) return state;
        const lists = state.board.lists.filter(l => l.id !== listId);
        return { board: { ...state.board, lists } };
      });
    } catch (error: any) {
      console.error("Failed to delete list:", error);
      throw error;
    }
  },

  moveList: async (listId: string, targetIndex: number) => {
    const board = get().board;
    if (!board) return;
    let newLists = [...board.lists];
    const oldIndex = newLists.findIndex(l => l.id === listId);
    if (oldIndex === -1 || targetIndex === oldIndex) return;
    const [movedList] = newLists.splice(oldIndex, 1);
    newLists.splice(targetIndex, 0, movedList);

    newLists = newLists.map((l, i) => ({ ...l, position: i }));
    set({ board: { ...board, lists: newLists } });

    await Promise.all(newLists.map(l =>
      api.patch(`/api/lists/${l.id}`, { position: l.position })
    ));
  },

fetchComments: async (cardId: string) => {
  try {
    const res = await commentApi.getAll(cardId); 
    const comments = res.data.comments.map((c: any) => ({
      id: c.id,
      cardId: c.cardId,
      userId: c.userId,
      userName: c.user?.name || 'Unknown User',
      text: c.content,
      content: c.content,
      createdAt: new Date(c.createdAt),
      user: c.user,
    }));

    set((state) => ({
      comments: { ...state.comments, [cardId]: comments },
    }));
  } catch (error: any) {
    console.error('Failed to fetch comments:', error);
  }
},

addComment: async(cardId:string,comment:Comment)=>{
  set((state)=>{
    const existingComments = state.comments[cardId] || [];

    if(existingComments.some((cmt)=>cmt.id === comment.id)){
      return state;
    }
    return {
        comments: {
        ...state.comments,
        [cardId]: [comment, ...existingComments],
      },
    }
  })
},


addCommentOptimistic: async (cardId: string, text: string) => {
  const tempId = `temp-${Date.now()}`;
  const optimisticComment: Comment = {
    id: tempId,
    cardId,
    userId: 'current-user',
    userName: 'You',
    text,
    createdAt: new Date(),
  };

  get().addComment(cardId, optimisticComment);

  try {
    const res = await commentApi.create({ 
      cardId, 
      content: text 
    });
    
    const savedComment: Comment = {
      id: res.data.comment.id,
      cardId: res.data.comment.cardId,
      userId: res.data.comment.userId,
      userName: res.data.comment.user?.name || 'You',
      text: res.data.comment.content,
      createdAt: new Date(res.data.comment.createdAt),
    };

    set((state) => ({
      comments: {
        ...state.comments,
        [cardId]: state.comments[cardId]?.map((c) =>
          c.id === tempId ? savedComment : c
        ) || [],
      },
    }));
  } catch (error: any) {
    set((state) => ({
      comments: {
        ...state.comments,
        [cardId]: state.comments[cardId]?.filter((c) => c.id !== tempId) || [],
      },
    }));
    console.error('Failed to add comment:', error);
    throw error;
  }
},

deleteComment: async (cardId: string, commentId: string) => {
  const previousComments = get().comments[cardId];

  set((state) => ({
    comments: {
      ...state.comments,
      [cardId]: state.comments[cardId]?.filter((c) => c.id !== commentId) || [],
    },
  }));

  try {
    await commentApi.delete(commentId); 
  } catch (error: any) {
    set((state) => ({
      comments: { ...state.comments, [cardId]: previousComments },
    }));
    console.error('Failed to delete comment:', error);
    throw error;
  }
},

updateComment: async (cardId: string, commentId: string, content: string) => {
  const previousComments = get().comments[cardId];

  set((state) => ({
    comments: {
      ...state.comments,
      [cardId]: state.comments[cardId]?.map((c) =>
        c.id === commentId ? { ...c, text: content } : c
      ) || [],
    },
  }));

  try {
    const res = await commentApi.update(commentId, { content });
    
    const updatedComment: Comment = {
      id: res.data.comment.id,
      cardId: res.data.comment.cardId,
      userId: res.data.comment.userId,
      userName: res.data.comment.user?.name || 'User',
      text: res.data.comment.content,
      createdAt: new Date(res.data.comment.createdAt),
    };

    set((state) => ({
      comments: {
        ...state.comments,
        [cardId]: state.comments[cardId]?.map((c) =>
          c.id === commentId ? updatedComment : c
        ) || [],
      },
    }));
  } catch (error: any) {
    set((state) => ({
      comments: { ...state.comments, [cardId]: previousComments },
    }));
    console.error('Failed to update comment:', error);
    throw error;
  }
},

updateCommentLocal: (cardId: string, commentId: string, updates: Partial<Comment>) => {
  set((state) => ({
    comments: {
      ...state.comments,
      [cardId]: state.comments[cardId]?.map((c) =>
        c.id === commentId ? { ...c, ...updates } : c
      ) || [],
    },
  }));
},

}))
import { create } from 'zustand';

interface SessionState {
  activeSessionId: string | null;
  deletedIds: string[];
  setActiveSessionId: (id: string | null) => void;
  deleteSession: (id: string) => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  activeSessionId: null,
  deletedIds: [],
  setActiveSessionId: (id) => set({ activeSessionId: id }),
  deleteSession: (id) =>
    set((state) => ({ deletedIds: [...state.deletedIds, id] })),
}));
"use client";

import { create } from "zustand";

interface BlogStore {
  searchQuery: string;
  selectedTag: string | null;
  setSearchQuery: (q: string) => void;
  setSelectedTag: (tag: string | null) => void;
}

export const useBlogStore = create<BlogStore>((set) => ({
  searchQuery: "",
  selectedTag: null,
  setSearchQuery: (q) => set({ searchQuery: q }),
  setSelectedTag: (tag) => set({ selectedTag: tag }),
}));

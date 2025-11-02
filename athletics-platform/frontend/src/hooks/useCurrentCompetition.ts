"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface CurrentCompetitionState {
  competitionId: string | null;
  setCompetition: (id: string) => void;
  clearCompetition: () => void;
}

export const useCurrentCompetition = create<CurrentCompetitionState>()(
  persist(
    (set) => ({
      competitionId: null,
      setCompetition: (id: string) => {
        set({ competitionId: id });
      },
      clearCompetition: () => {
        set({ competitionId: null });
      },
    }),
    {
      name: "current-competition",
    }
  )
);

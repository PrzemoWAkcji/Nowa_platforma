import { Competition } from "@/types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CurrentCompetitionState {
  currentCompetition: Competition | null;
  currentCompetitionId: string | null;
  isInCompetitionContext: boolean;
  setCurrentCompetition: (competition: Competition | null) => void;
  setCurrentCompetitionId: (id: string | null) => void;
  clearCurrentCompetition: () => void;
}

export const useCurrentCompetition = create<CurrentCompetitionState>()(
  persist(
    (set, get) => ({
      currentCompetition: null,
      currentCompetitionId: null,
      isInCompetitionContext: false,

      setCurrentCompetition: (competition: Competition | null) => {
        set({
          currentCompetition: competition,
          currentCompetitionId: competition?.id || null,
          isInCompetitionContext: !!competition,
        });
      },

      setCurrentCompetitionId: (id: string | null) => {
        set({
          currentCompetitionId: id,
          isInCompetitionContext: !!id,
        });
      },

      clearCurrentCompetition: () => {
        set({
          currentCompetition: null,
          currentCompetitionId: null,
          isInCompetitionContext: false,
        });
      },
    }),
    {
      name: "current-competition-storage",
      partialize: (state) => ({
        currentCompetitionId: state.currentCompetitionId,
        isInCompetitionContext: state.isInCompetitionContext,
      }),
    }
  )
);
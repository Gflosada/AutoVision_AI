import { create } from "zustand";
import { persist } from "zustand/middleware";
import { mockGenerations } from "../data/mockGenerations";
import { mockProjects } from "../data/mockProjects";
import {
  hasSupabaseData,
  loadProjectsAndGenerations,
  saveCustomizationGeneration,
  saveVehicleProject,
  updateCustomizationGeneration,
} from "../lib/supabase/appData.service";
import type { CustomizationGeneration, VehicleProject } from "../types/app";

interface GarageStore {
  projects: VehicleProject[];
  generations: CustomizationGeneration[];
  savedGenerationIds: string[];
  favoriteGenerationIds: string[];
  activeGenerationId: string | null;
  isLoading: boolean;
  error: string | null;
  loadForUser: (userId: string) => Promise<void>;
  addProject: (project: VehicleProject) => Promise<VehicleProject>;
  addGeneration: (generation: CustomizationGeneration, options?: { persistRemote?: boolean }) => Promise<CustomizationGeneration>;
  updateGeneration: (id: string, generation: Partial<CustomizationGeneration>, options?: { persistRemote?: boolean }) => Promise<void>;
  setActiveGeneration: (id: string | null) => void;
  saveGeneration: (id: string) => Promise<void>;
  toggleSavedGeneration: (id: string) => Promise<void>;
  toggleFavorite: (id: string) => void;
  getProjectById: (id: string) => VehicleProject | undefined;
  getGenerationById: (id: string) => CustomizationGeneration | undefined;
}

export const useGarageStore = create<GarageStore>()(
  persist(
    (set, get) => ({
      projects: mockProjects,
      generations: mockGenerations,
      savedGenerationIds: mockGenerations.map((generation) => generation.id),
      favoriteGenerationIds: ["generation_911_chrome_delete"],
      activeGenerationId: null,
      isLoading: false,
      error: null,
      loadForUser: async (userId) => {
        if (!hasSupabaseData()) return;
        set({ isLoading: true, error: null });
        try {
          const data = await loadProjectsAndGenerations(userId);
          if (data) {
            set((state) => {
              const remoteProjectIds = new Set(data.projects.map((project) => project.id));
              const remoteGenerationIds = new Set(data.generations.map((generation) => generation.id));
              const localProjects = state.projects.filter((project) => project.userId === userId && !remoteProjectIds.has(project.id));
              const localGenerations = state.generations.filter((generation) => generation.userId === userId && !remoteGenerationIds.has(generation.id));

              const generations = [...data.generations, ...localGenerations];
              return {
                projects: [...data.projects, ...localProjects],
                generations,
                savedGenerationIds: generations.filter((generation) => generation.isSaved).map((generation) => generation.id),
                isLoading: false,
              };
            });
          } else {
            set({
              isLoading: false,
            });
          }
        } catch (error) {
          set({ error: error instanceof Error ? error.message : "Unable to load garage data.", isLoading: false });
        }
      },
      addProject: async (project) => {
        if (!hasSupabaseData()) {
          set((state) => ({
            projects: [project, ...state.projects.filter((item) => item.id !== project.id)],
          }));
          return project;
        }
        try {
          const saved = await saveVehicleProject(project);
          set((state) => ({
            projects: [saved, ...state.projects.filter((item) => item.id !== saved.id)],
          }));
          return saved;
        } catch (error) {
          set({ error: error instanceof Error ? error.message : "Unable to save project." });
          throw error;
        }
      },
      addGeneration: async (generation, options) => {
        const persistRemote = options?.persistRemote ?? true;
        if (!hasSupabaseData() || !persistRemote) {
          set((state) => ({
            generations: [generation, ...state.generations.filter((item) => item.id !== generation.id)],
            savedGenerationIds: generation.isSaved && !state.savedGenerationIds.includes(generation.id)
              ? [generation.id, ...state.savedGenerationIds]
              : state.savedGenerationIds,
          }));
          return generation;
        }
        try {
          const saved = await saveCustomizationGeneration(generation);
          set((state) => ({
            generations: [saved, ...state.generations.filter((item) => item.id !== saved.id)],
            savedGenerationIds: saved.isSaved && !state.savedGenerationIds.includes(saved.id)
              ? [saved.id, ...state.savedGenerationIds]
              : state.savedGenerationIds.filter((item) => item !== saved.id),
          }));
          return saved;
        } catch (error) {
          set({ error: error instanceof Error ? error.message : "Unable to save generation." });
          throw error;
        }
      },
      updateGeneration: async (id, generation, options) => {
        const persistRemote = options?.persistRemote ?? true;
        set((state) => ({
          generations: state.generations.map((item) => (item.id === id ? { ...item, ...generation } : item)),
        }));
        if (!hasSupabaseData() || !persistRemote) return;
        try {
          const saved = await updateCustomizationGeneration(id, generation);
          if (saved) {
            set((state) => ({
              generations: state.generations.map((item) => (item.id === id ? saved : item)),
            }));
          }
        } catch (error) {
          set({ error: error instanceof Error ? error.message : "Unable to update generation." });
        }
      },
      setActiveGeneration: (id) => set({ activeGenerationId: id }),
      saveGeneration: async (id) => {
        const generation = get().generations.find((item) => item.id === id);
        set((state) => ({
          generations: state.generations.map((item) => (item.id === id ? { ...item, isSaved: true } : item)),
          savedGenerationIds: state.savedGenerationIds.includes(id)
            ? state.savedGenerationIds
            : [id, ...state.savedGenerationIds],
        }));
        if (!hasSupabaseData()) return;
        try {
          const saved = await updateCustomizationGeneration(id, { isSaved: true })
            ?? (generation ? await saveCustomizationGeneration({ ...generation, isSaved: true }) : null);
          if (saved) {
            set((state) => ({
              generations: state.generations.map((item) => (item.id === id ? saved : item)),
            }));
          }
        } catch (error) {
          set({ error: error instanceof Error ? error.message : "Unable to save generation." });
          throw error;
        }
      },
      toggleSavedGeneration: async (id) => {
        const generation = get().generations.find((item) => item.id === id);
        const shouldSave = !get().savedGenerationIds.includes(id);
        set((state) => ({
          generations: state.generations.map((item) => (item.id === id ? { ...item, isSaved: shouldSave } : item)),
          savedGenerationIds: shouldSave
            ? [id, ...state.savedGenerationIds]
            : state.savedGenerationIds.filter((item) => item !== id),
        }));
        if (!hasSupabaseData()) return;
        try {
          const saved = await updateCustomizationGeneration(id, { isSaved: shouldSave })
            ?? (generation ? await saveCustomizationGeneration({ ...generation, isSaved: shouldSave }) : null);
          if (saved) {
            set((state) => ({
              generations: state.generations.map((item) => (item.id === id ? saved : item)),
            }));
          }
        } catch (error) {
          set({ error: error instanceof Error ? error.message : "Unable to update saved design." });
          throw error;
        }
      },
      toggleFavorite: (id) =>
        set((state) => ({
          favoriteGenerationIds: state.favoriteGenerationIds.includes(id)
            ? state.favoriteGenerationIds.filter((item) => item !== id)
            : [id, ...state.favoriteGenerationIds],
        })),
      getProjectById: (id) => get().projects.find((project) => project.id === id),
      getGenerationById: (id) => get().generations.find((generation) => generation.id === id),
    }),
    { name: "autovision-garage" },
  ),
);

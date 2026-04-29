import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CustomizationType, ProjectDraft } from "../types/app";

const initialDraft: ProjectDraft = {
  step: 1,
  imageFileName: "",
  imagePreviewUrl: "",
  title: "",
  vehicleMake: "",
  vehicleModel: "",
  vehicleYear: "",
  trim: "",
  bodyType: "",
  currentColor: "",
  notes: "",
  customizationTypes: [],
  prompt: "",
  desiredColor: "",
  finish: "",
  style: "",
  backgroundPreference: "keep-original",
  anglePreference: "keep-original",
  realismLevel: 8,
};

interface ProjectDraftStore {
  draft: ProjectDraft;
  setStep: (step: number) => void;
  updateDraft: (draft: Partial<ProjectDraft>) => void;
  toggleCustomization: (type: CustomizationType) => void;
  resetDraft: () => void;
}

export const useProjectDraftStore = create<ProjectDraftStore>()(
  persist(
    (set, get) => ({
      draft: initialDraft,
      setStep: (step) => set((state) => ({ draft: { ...state.draft, step } })),
      updateDraft: (draft) => set((state) => ({ draft: { ...state.draft, ...draft } })),
      toggleCustomization: (type) => {
        const selected = get().draft.customizationTypes;
        set((state) => ({
          draft: {
            ...state.draft,
            customizationTypes: selected.includes(type)
              ? selected.filter((item) => item !== type)
              : [...selected, type],
          },
        }));
      },
      resetDraft: () => set({ draft: initialDraft }),
    }),
    { name: "autovision-project-draft" },
  ),
);

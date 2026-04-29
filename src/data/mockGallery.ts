import type { CustomizationType, FinishType, VehicleStyle } from "../types/app";

export interface GalleryItem {
  id: string;
  title: string;
  vehicle: string;
  imageUrl: string;
  style: VehicleStyle;
  finish: FinishType;
  customizationTypes: CustomizationType[];
  likes: number;
  favorite: boolean;
}

export const mockGallery: GalleryItem[] = [
  {
    id: "gallery_1",
    title: "JDM White Wheel Concept",
    vehicle: "Honda Civic Type R",
    imageUrl: "https://images.unsplash.com/photo-1607603750909-408e193868c7?auto=format&fit=crop&w=1000&q=80",
    style: "jdm",
    finish: "gloss",
    customizationTypes: ["decals-livery", "rims-wheels", "lowered-suspension"],
    likes: 2840,
    favorite: false,
  },
  {
    id: "gallery_2",
    title: "Matte Black Street Build",
    vehicle: "Dodge Challenger",
    imageUrl: "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&w=1000&q=80",
    style: "aggressive",
    finish: "matte",
    customizationTypes: ["vinyl-wrap", "window-tint", "spoiler"],
    likes: 1972,
    favorite: true,
  },
  {
    id: "gallery_3",
    title: "Off-Road Desert Kit",
    vehicle: "Ford Bronco",
    imageUrl: "https://images.unsplash.com/photo-1549925862-990091f84b0f?auto=format&fit=crop&w=1000&q=80",
    style: "off-road",
    finish: "satin",
    customizationTypes: ["body-kit", "bumper", "headlights"],
    likes: 1521,
    favorite: false,
  },
  {
    id: "gallery_4",
    title: "Exotic Carbon Package",
    vehicle: "Lamborghini Huracan",
    imageUrl: "https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?auto=format&fit=crop&w=1000&q=80",
    style: "exotic",
    finish: "carbon-fiber",
    customizationTypes: ["carbon-fiber", "hood", "spoiler"],
    likes: 4122,
    favorite: false,
  },
];

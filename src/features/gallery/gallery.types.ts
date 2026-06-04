import type { GalleryPost } from "@/types/domain";

export type GalleryFeedParams = {
  city?: string;
  range?: "12h" | "24h" | "7d" | "30d";
};

export type CreateGalleryPostPayload = {
  imageUrl: string;
  cardImageUrl?: string;
  caption?: string;
  city?: string;
  barId?: string;
  barName?: string;
  rating?: number;
};

export type GalleryFeedResponse = {
  items: GalleryPost[];
  nextCursor?: string;
};

import { apiClient } from "@/services/api/client";
import { endpoints } from "@/services/api/endpoints";
import type { GalleryPost } from "@/types/domain";
import type { CreateGalleryPostPayload, GalleryFeedParams, GalleryFeedResponse } from "./gallery.types";

export const galleryApi = {
  getFeed: (params: GalleryFeedParams) =>
    apiClient.get<GalleryFeedResponse>(endpoints.gallery.feed, { params }),
  getPost: (postId: string) =>
    apiClient.get<GalleryPost>(endpoints.gallery.post(postId)),
  createPost: (payload: CreateGalleryPostPayload) =>
    apiClient.post<GalleryPost>(endpoints.gallery.createPost, payload),
  likePost: (postId: string) =>
    apiClient.post<void>(endpoints.gallery.like(postId))
};

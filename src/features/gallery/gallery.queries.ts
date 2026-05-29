import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/constants/queryKeys";
import { galleryApi } from "./gallery.api";
import type { GalleryFeedParams } from "./gallery.types";

export function useGalleryFeedQuery(params: GalleryFeedParams) {
  return useQuery({
    queryKey: queryKeys.galleryFeed(params),
    queryFn: () => galleryApi.getFeed(params)
  });
}

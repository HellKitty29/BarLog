import { AppHeader } from "@/components/common/AppHeader";
import { GalleryFeedList } from "@/components/gallery/GalleryFeedList";
import { ScrollScreen } from "@/components/layout/ScrollScreen";

export default function GalleryScreen() {
  return (
    <ScrollScreen>
      <AppHeader title="Community" />
      <GalleryFeedList />
    </ScrollScreen>
  );
}

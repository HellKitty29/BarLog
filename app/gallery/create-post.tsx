import { AppHeader } from "@/components/common/AppHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { ScrollScreen } from "@/components/layout/ScrollScreen";

export default function CreatePostScreen() {
  return (
    <ScrollScreen>
      <AppHeader title="Create post" />
      <EmptyState title="Connect POST /api/gallery/posts" />
    </ScrollScreen>
  );
}

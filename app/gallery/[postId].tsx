import { AppHeader } from "@/components/common/AppHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { ScrollScreen } from "@/components/layout/ScrollScreen";

export default function PostDetailScreen() {
  return (
    <ScrollScreen>
      <AppHeader title="Post detail" />
      <EmptyState title="Connect /api/gallery/posts/:postId" />
    </ScrollScreen>
  );
}

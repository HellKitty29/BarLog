import { Text, StyleSheet } from "react-native";
import { AppCard } from "@/components/common/AppCard";
import { AppHeader } from "@/components/common/AppHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { LoadingView } from "@/components/common/LoadingView";
import { ScrollScreen } from "@/components/layout/ScrollScreen";
import { useGalleryFeedQuery } from "@/features/gallery/gallery.queries";
import { colors, typography } from "@/theme";

export default function GalleryScreen() {
  const feed = useGalleryFeedQuery({ city: "Shanghai", range: "24h" });

  return (
    <ScrollScreen>
      <AppHeader title="Community" />
      {feed.isLoading ? <LoadingView /> : null}
      {feed.isError ? <ErrorState message={feed.error.message} /> : null}
      {feed.data?.items.length ? (
        feed.data.items.map((post) => (
          <AppCard key={post.id}>
            <Text style={styles.title}>{post.authorName}</Text>
            <Text style={styles.body}>{post.caption ?? post.barName}</Text>
          </AppCard>
        ))
      ) : (
        !feed.isLoading && <EmptyState title="No posts returned" />
      )}
    </ScrollScreen>
  );
}

const styles = StyleSheet.create({
  title: {
    ...typography.heading,
    color: colors.text
  },
  body: {
    ...typography.body,
    color: colors.textMuted
  }
});

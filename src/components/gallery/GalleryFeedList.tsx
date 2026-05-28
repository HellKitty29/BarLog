import { Ionicons } from "@expo/vector-icons";
import { Image, StyleSheet, Text, View } from "react-native";
import { AppCard } from "@/components/common/AppCard";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { LoadingView } from "@/components/common/LoadingView";
import { useGalleryFeedQuery } from "@/features/gallery/gallery.queries";
import { colors, spacing, typography } from "@/theme";
import type { GalleryFeedParams } from "@/features/gallery/gallery.types";

type GalleryFeedListProps = {
  emptyTitle?: string;
  params?: GalleryFeedParams;
};

export function GalleryFeedList({
  emptyTitle = "No posts returned",
  params = { city: "Shanghai", range: "24h" }
}: GalleryFeedListProps) {
  const feed = useGalleryFeedQuery(params);

  if (feed.isLoading) {
    return <LoadingView label="Loading community" />;
  }

  if (feed.isError) {
    return <ErrorState message={feed.error.message} />;
  }

  if (!feed.data?.items.length) {
    return <EmptyState title={emptyTitle} />;
  }

  return (
    <View style={styles.list}>
      {feed.data.items.map((post) => (
        <AppCard key={post.id}>
          <View style={styles.post}>
            <Image source={{ uri: post.imageUrl }} style={styles.thumbnail} />
            <View style={styles.body}>
              <View style={styles.titleRow}>
                <Text numberOfLines={1} style={styles.author}>
                  {post.authorName}
                </Text>
                <View style={styles.likePill}>
                  <Ionicons name="heart" size={11} color="#c68334" />
                  <Text style={styles.likeText}>{post.likedCount}</Text>
                </View>
              </View>
              <Text numberOfLines={2} style={styles.caption}>
                {post.caption ?? post.barName ?? "Shared a new check-in"}
              </Text>
              <View style={styles.metaRow}>
                {post.barName ? (
                  <>
                    <Ionicons name="location-outline" size={12} color="#c68334" />
                    <Text numberOfLines={1} style={styles.metaText}>{post.barName}</Text>
                  </>
                ) : null}
                {post.city ? <Text style={styles.cityText}>{post.city}</Text> : null}
              </View>
            </View>
          </View>
        </AppCard>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.md
  },
  post: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.md
  },
  thumbnail: {
    backgroundColor: "#2b0e0d",
    borderColor: "rgba(198, 131, 52, 0.26)",
    borderRadius: 16,
    borderWidth: 1,
    height: 68,
    width: 68
  },
  body: {
    flex: 1,
    minWidth: 0
  },
  titleRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm
  },
  author: {
    ...typography.heading,
    color: colors.text,
    flex: 1,
    fontSize: 17,
    lineHeight: 22
  },
  likePill: {
    alignItems: "center",
    backgroundColor: "#160908",
    borderColor: "rgba(198, 131, 52, 0.26)",
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: "row",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4
  },
  likeText: {
    color: "#c68334",
    fontSize: 11,
    fontWeight: "900"
  },
  caption: {
    ...typography.body,
    color: colors.textMuted,
    lineHeight: 20,
    marginTop: 5
  },
  metaRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 5,
    marginTop: 8
  },
  metaText: {
    color: "#a8988c",
    flexShrink: 1,
    fontSize: 11,
    fontWeight: "800"
  },
  cityText: {
    color: "#6f625a",
    fontSize: 10,
    fontWeight: "800",
    marginLeft: "auto"
  }
});

import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { AppCard } from "@/components/common/AppCard";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { LoadingView } from "@/components/common/LoadingView";
import { useGalleryFeedQuery } from "@/features/gallery/gallery.queries";
import { colors, spacing, typography } from "@/theme";
import type { GalleryFeedParams } from "@/features/gallery/gallery.types";
import { ApiError } from "@/services/api/error-handler";
import { resolveMediaUrl } from "@/services/media/resolve-media-url";

type GalleryFeedListProps = {
  emptyTitle?: string;
  params?: GalleryFeedParams;
};

const defaultFeedParams: GalleryFeedParams = {
  range: "7d"
};

type GalleryImagePost = {
  imageUrl?: string;
  cardImageUrl?: string;
  photoUrl?: string;
  uploadedPhotoUrl?: string;
  generatedCardUri?: string;
  mediaUrl?: string;
  thumbnailUrl?: string;
};

function getPostImageUrl(post: GalleryImagePost) {
  return resolveMediaUrl(
    post.imageUrl ??
      post.cardImageUrl ??
      post.photoUrl ??
      post.uploadedPhotoUrl ??
      post.generatedCardUri ??
      post.mediaUrl ??
      post.thumbnailUrl
  );
}

function resolveFeedError(error: unknown) {
  if (!(error instanceof ApiError)) {
    return {
      message: error instanceof Error ? error.message : "Unable to load community feed.",
      showLogin: false
    };
  }

  if (error.code === "AUTH_REQUIRED" || error.status === 401) {
    return {
      message: "Log in to view the community feed.",
      showLogin: true
    };
  }

  return {
    message: error.message,
    showLogin: false
  };
}

export function GalleryFeedList({
  emptyTitle = "No posts yet",
  params = defaultFeedParams
}: GalleryFeedListProps) {
  const feed = useGalleryFeedQuery(params);

  if (feed.isLoading) {
    return <LoadingView label="Loading community" />;
  }

  if (feed.isError) {
    const { message, showLogin } = resolveFeedError(feed.error);

    return (
      <View style={styles.errorBlock}>
        <ErrorState message={message} />
        {showLogin ? (
          <Pressable onPress={() => router.push("/(auth)/login")} style={styles.actionButton}>
            <Text style={styles.actionButtonText}>Log in</Text>
          </Pressable>
        ) : null}
      </View>
    );
  }

  if (!feed.data?.items.length) {
    return (
      <EmptyState
        title={emptyTitle}
        body="Community shows public and tonight-only check-ins from everyone. Publish a public Sip to appear here."
      />
    );
  }

  return (
    <View style={styles.list}>
      {feed.data.items.map((post) => {
        const imageUrl = getPostImageUrl(post);

        return (
          <AppCard key={post.id}>
            <View style={styles.post}>
              {imageUrl ? <Image source={{ uri: imageUrl }} style={styles.thumbnail} /> : <View style={styles.thumbnail} />}
              <View style={styles.body}>
                <View style={styles.titleRow}>
                  <Text numberOfLines={1} style={styles.author}>
                    {post.authorName}
                  </Text>
                  <View style={styles.likePill}>
                    <Ionicons name="heart" size={11} color="#c68334" />
                    <Text style={styles.likeText}>{post.likedCount ?? 0}</Text>
                  </View>
                </View>
                <Text numberOfLines={3} style={styles.caption}>
                  {post.caption?.trim() || "Shared a new check-in"}
                </Text>
              </View>
            </View>
          </AppCard>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  errorBlock: {
    gap: spacing.md
  },
  actionButton: {
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: colors.primary,
    borderRadius: 999,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm
  },
  actionButtonText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: "800"
  },
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
  }
});

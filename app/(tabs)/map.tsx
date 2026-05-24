import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { AppCard } from "@/components/common/AppCard";
import { AppHeader } from "@/components/common/AppHeader";
import { AppSegmentedControl } from "@/components/common/AppSegmentedControl";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { LoadingView } from "@/components/common/LoadingView";
import { ScrollScreen } from "@/components/layout/ScrollScreen";
import { useNearbyBarsQuery } from "@/features/bars/bars.queries";
import { discoverTabs } from "@/features/map/map.constants";
import { colors, spacing, typography } from "@/theme";
import { formatDistance, formatRating } from "@/utils/format";

export default function MapScreen() {
  const [tab, setTab] = useState("bars");
  const nearbyBars = useNearbyBarsQuery({ city: "Shanghai" });

  return (
    <ScrollScreen>
      <AppHeader title="Discover" subtitle="Bars, community, and matches powered by backend data." />
      <AppSegmentedControl segments={discoverTabs} value={tab} onChange={setTab} />
      {tab === "bars" ? (
        <>
          <View style={styles.mapPreview}>
            <Text style={styles.mapText}>Map provider area</Text>
          </View>
          {nearbyBars.isLoading ? <LoadingView label="Loading nearby bars" /> : null}
          {nearbyBars.isError ? <ErrorState message={nearbyBars.error.message} /> : null}
          {nearbyBars.data?.length ? (
            nearbyBars.data.map((bar) => (
              <AppCard key={bar.id}>
                <Text style={styles.cardTitle}>{bar.name}</Text>
                <Text style={styles.cardMeta}>
                  {formatRating(bar.rating)} {formatDistance(bar.distanceMeters)}
                </Text>
              </AppCard>
            ))
          ) : (
            !nearbyBars.isLoading && <EmptyState title="No bars returned" body="Check your /api/bars/nearby backend response." />
          )}
        </>
      ) : (
        <EmptyState title={`${discoverTabs.find((item) => item.key === tab)?.label} panel`} body="Wire this tab to its feature API next." />
      )}
    </ScrollScreen>
  );
}

const styles = StyleSheet.create({
  mapPreview: {
    alignItems: "center",
    backgroundColor: colors.map,
    borderRadius: 8,
    height: 220,
    justifyContent: "center"
  },
  mapText: {
    ...typography.caption,
    color: colors.textMuted
  },
  cardTitle: {
    ...typography.heading,
    color: colors.text
  },
  cardMeta: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.xs
  }
});

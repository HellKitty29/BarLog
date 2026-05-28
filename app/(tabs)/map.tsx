import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { AppCard } from "@/components/common/AppCard";
import { AppHeader } from "@/components/common/AppHeader";
import { AppSegmentedControl } from "@/components/common/AppSegmentedControl";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { GalleryFeedList } from "@/components/gallery/GalleryFeedList";
import { LoadingView } from "@/components/common/LoadingView";
import { ScrollScreen } from "@/components/layout/ScrollScreen";
import { BarMapPreview } from "@/components/map/BarMapPreview";
import { useNearbyBarsQuery } from "@/features/bars/bars.queries";
import { discoverTabs } from "@/features/map/map.constants";
import { createMapRegionForCoordinates, createNearbyBarsParams, defaultDiscoveryCoordinates } from "@/services/location/map-region";
import { calculateDistanceMeters } from "@/services/location/geo-utils";
import { getCurrentCoordinates, LocationAccessError, type Coordinates } from "@/services/location/location-service";
import { colors, spacing, typography } from "@/theme";
import { formatDistance, formatRating } from "@/utils/format";

export default function MapScreen() {
  const [tab, setTab] = useState("bars");
  const [coords, setCoords] = useState<Coordinates | null>(null);
  const [isLocating, setIsLocating] = useState(true);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [locationAction, setLocationAction] = useState<"retry" | "settings" | null>(null);
  const [expandedBarId, setExpandedBarId] = useState<string | null>(null);
  const nearbyBarsParams = useMemo(() => createNearbyBarsParams(coords), [coords]);
  const nearbyBars = useNearbyBarsQuery(nearbyBarsParams, {
    enabled: Boolean(nearbyBarsParams)
  });
  const referenceCoords = coords ?? defaultDiscoveryCoordinates;
  const bars = (nearbyBars.data?.items ?? []).map((bar) => ({
    ...bar,
    displayDistanceMeters: typeof bar.lat === "number" && typeof bar.lng === "number"
      ? calculateDistanceMeters(referenceCoords, { lat: bar.lat, lng: bar.lng })
      : bar.distanceMeters
  }));
  const userRegion = useMemo(
    () => createMapRegionForCoordinates(referenceCoords, nearbyBars.data?.items ?? []),
    [nearbyBars.data?.items, referenceCoords]
  );
  const emptyBarsMessage = nearbyBars.data?.message ??
    (nearbyBars.data?.source === "google_places"
      ? "Google Places returned zero bars near your current location."
      : "The nearby bars backend returned an empty result.");
  const nearbyBarsErrorMessage = nearbyBars.error?.message === "Network Error"
    ? "Cannot reach the backend. Check EXPO_PUBLIC_HEALTH_API_URL or EXPO_PUBLIC_API_BASE_URL, then restart Expo."
    : nearbyBars.error?.message;

  const loadLocation = useCallback(async () => {
    setIsLocating(true);
    setLocationError(null);
    setLocationAction(null);

    try {
      const currentCoords = await getCurrentCoordinates();

      setCoords(currentCoords);
      setLocationError(null);
      setLocationAction(null);
    } catch (error) {
      const resolvedError = resolveLocationError(error);
      setCoords(null);
      setLocationError(resolvedError.message);
      setLocationAction(resolvedError.action);
    } finally {
      setIsLocating(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadInitialLocation() {
      try {
        const currentCoords = await getCurrentCoordinates();

        if (!isMounted) {
          return;
        }

        setCoords(currentCoords);
        setLocationError(null);
        setLocationAction(null);
      } catch (error) {
        if (isMounted) {
          const resolvedError = resolveLocationError(error);
          setLocationError(resolvedError.message);
          setLocationAction(resolvedError.action);
        }
      } finally {
        if (isMounted) {
          setIsLocating(false);
        }
      }
    }

    void loadInitialLocation();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <ScrollScreen>
      <AppHeader title="Discover" subtitle="Bars, community, and matches powered by backend data." />
      <AppSegmentedControl segments={discoverTabs} value={tab} onChange={setTab} />
      {tab === "bars" ? (
        <>
          <View style={styles.sectionLabelRow}>
            <Ionicons name="compass" size={17} color="#c68334" />
            <Text style={styles.sectionLabel}>MICRO BAR MAP</Text>
            <View style={styles.sectionRule} />
          </View>
          {userRegion ? (
            <View style={styles.mapPreview}>
              <BarMapPreview bars={nearbyBars.data?.items} region={userRegion} userCoordinate={referenceCoords} />
            </View>
          ) : null}
          {isLocating ? <LoadingView label="Finding your location" /> : null}
          {nearbyBars.isLoading ? <LoadingView label="Loading nearby bars" /> : null}
          {locationError ? (
            <LocationErrorCard
              action={locationAction}
              message={locationError}
              onOpenSettings={() => {
                void Linking.openSettings();
              }}
              onRetry={loadLocation}
            />
          ) : null}
          {nearbyBars.isError ? <ErrorState message={nearbyBarsErrorMessage} /> : null}
          {bars.length ? (
            bars.map((bar, index) => (
              <Pressable
                key={bar.id}
                onPress={() => setExpandedBarId((current) => current === bar.id ? null : bar.id)}
                style={({ pressed }) => pressed && styles.pressed}
              >
                <AppCard>
                  <View style={styles.barCard}>
                    <LinearGradient colors={["#8b1e19", "#ad221c"]} style={styles.barIndex}>
                      <Text style={styles.barIndexText}>{index + 1}</Text>
                    </LinearGradient>
                    <View style={styles.barBody}>
                      <Text numberOfLines={1} style={styles.cardTitle}>
                        {bar.name}
                      </Text>
                      <View style={styles.barMetaRow}>
                        <Ionicons name="star" size={13} color="#c68334" />
                        <Text style={styles.cardMeta}>{formatRating(bar.rating)}</Text>
                        <Text style={styles.metaDivider}>/</Text>
                        <Ionicons name="navigate-outline" size={13} color="#8e7e73" />
                        <Text style={styles.cardMeta}>{formatDistance(bar.displayDistanceMeters)}</Text>
                      </View>
                      {bar.area || bar.address ? (
                        <Text numberOfLines={1} style={styles.addressText}>
                          {bar.area ?? bar.address}
                        </Text>
                      ) : null}
                    </View>
                    <Ionicons
                      name={expandedBarId === bar.id ? "chevron-up" : "chevron-down"}
                      size={17}
                      color="#8e7e73"
                    />
                  </View>
                  {expandedBarId === bar.id ? (
                    <View style={styles.barDetail}>
                      <DetailRow icon="location-outline" label="Address" value={bar.address ?? bar.area ?? "No address returned"} />
                      <DetailRow icon="pricetag-outline" label="Tags" value={bar.tags?.length ? bar.tags.join(" / ") : "No tags returned"} />
                      <DetailRow
                        icon="map-outline"
                        label="Coordinates"
                        value={typeof bar.lat === "number" && typeof bar.lng === "number"
                          ? `${bar.lat.toFixed(5)}, ${bar.lng.toFixed(5)}`
                          : "No coordinates returned"}
                      />
                    </View>
                  ) : null}
                </AppCard>
              </Pressable>
            ))
          ) : (
            !isLocating &&
            !nearbyBars.isLoading &&
            !nearbyBars.isError &&
            !locationError && <EmptyState title="No bars returned" body={emptyBarsMessage} />
          )}
        </>
      ) : tab === "community" ? (
        <>
          <View style={styles.sectionLabelRow}>
            <Ionicons name="people-circle" size={17} color="#c68334" />
            <Text style={styles.sectionLabel}>COMMUNITY GALLERY</Text>
            <View style={styles.sectionRule} />
          </View>
          <GalleryFeedList emptyTitle="No community posts returned" />
        </>
      ) : (
        <EmptyState title={`${discoverTabs.find((item) => item.key === tab)?.label} panel`} body="Wire this tab to its feature API next." />
      )}
    </ScrollScreen>
  );
}

function DetailRow({ icon, label, value }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Ionicons name={icon} size={14} color="#c68334" />
      <Text style={styles.detailLabel}>{label}</Text>
      <Text numberOfLines={2} style={styles.detailValue}>{value}</Text>
    </View>
  );
}

function resolveLocationError(error: unknown): { action: "retry" | "settings"; message: string } {
  if (error instanceof LocationAccessError) {
    if (error.code === "permission_blocked") {
      return {
        action: "settings",
        message: "Location permission is blocked. Open Android settings, allow location for BarLog, then return to Discover."
      };
    }

    if (error.code === "services_disabled") {
      return {
        action: "retry",
        message: "Android location services are off. Turn on Location, then retry."
      };
    }

    return {
      action: "retry",
      message: "Location permission was not granted. Tap retry to request it again."
    };
  }

  return {
    action: "retry",
    message: "Unable to read your current location. Tap retry after checking Android location permissions."
  };
}

function LocationErrorCard({
  action,
  message,
  onOpenSettings,
  onRetry
}: {
  action: "retry" | "settings" | null;
  message: string;
  onOpenSettings: () => void;
  onRetry: () => void;
}) {
  return (
    <View style={styles.locationErrorCard}>
      <View style={styles.locationErrorHeader}>
        <Ionicons name="alert-circle" size={17} color="#c68334" />
        <Text style={styles.locationErrorTitle}>Location access needed</Text>
      </View>
      <Text style={styles.locationErrorText}>{message}</Text>
      <Pressable onPress={action === "settings" ? onOpenSettings : onRetry} style={styles.locationErrorButton}>
        <Text style={styles.locationErrorButtonText}>{action === "settings" ? "Open Settings" : "Retry Permission"}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  pressed: {
    opacity: 0.82,
    transform: [{ scale: 0.99 }]
  },
  sectionLabelRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 9,
    marginTop: 2
  },
  sectionLabel: {
    color: "#a8988c",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1.3
  },
  sectionRule: {
    backgroundColor: "rgba(74, 23, 21, 0.55)",
    flex: 1,
    height: 1
  },
  mapPreview: {
    backgroundColor: "#0d0706",
    borderColor: "rgba(74, 23, 21, 0.72)",
    borderRadius: 24,
    borderWidth: 1,
    height: 288,
    justifyContent: "center",
    overflow: "hidden",
    position: "relative",
    shadowColor: "#000000",
    shadowOpacity: 0.42,
    shadowRadius: 20
  },
  locationErrorCard: {
    backgroundColor: "#2b0e0d",
    borderColor: "rgba(198, 131, 52, 0.28)",
    borderRadius: 18,
    borderWidth: 1,
    gap: 10,
    padding: 15
  },
  locationErrorHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8
  },
  locationErrorTitle: {
    color: "#faf6ee",
    fontSize: 14,
    fontWeight: "900"
  },
  locationErrorText: {
    color: "#c8bcb1",
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 18
  },
  locationErrorButton: {
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#bd2b25",
    borderRadius: 999,
    minHeight: 36,
    justifyContent: "center",
    paddingHorizontal: 14
  },
  locationErrorButtonText: {
    color: "#fff4ec",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.4
  },
  barCard: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.md
  },
  barIndex: {
    alignItems: "center",
    borderColor: "rgba(198, 131, 52, 0.56)",
    borderRadius: 17,
    borderWidth: 2,
    height: 34,
    justifyContent: "center",
    width: 34
  },
  barIndexText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: "900"
  },
  barBody: {
    flex: 1,
    minWidth: 0
  },
  cardTitle: {
    ...typography.heading,
    color: colors.text,
    fontSize: 18,
    lineHeight: 23
  },
  barMetaRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 5,
    marginTop: spacing.xs
  },
  cardMeta: {
    ...typography.caption,
    color: colors.textMuted
  },
  metaDivider: {
    color: "#4a1715",
    fontSize: 12,
    fontWeight: "900",
    marginHorizontal: 2
  },
  addressText: {
    color: "#7f736b",
    fontSize: 11,
    fontWeight: "700",
    marginTop: 7
  },
  barDetail: {
    borderTopColor: "rgba(74, 23, 21, 0.58)",
    borderTopWidth: 1,
    gap: 9,
    marginTop: 13,
    paddingTop: 12
  },
  detailRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 7
  },
  detailLabel: {
    color: "#c68334",
    fontSize: 10,
    fontWeight: "900",
    width: 72
  },
  detailValue: {
    color: "#a8988c",
    flex: 1,
    fontSize: 11,
    fontWeight: "700",
    lineHeight: 16
  }
});

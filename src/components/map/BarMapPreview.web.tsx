import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View, type DimensionValue } from "react-native";
import { colors, typography } from "@/theme";
import type { Bar } from "@/types/domain";

type MapRegion = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
};

type BarMapPreviewProps = {
  bars?: Bar[];
  region: MapRegion;
  userCoordinate: { lat: number; lng: number };
};

function getMarkerPosition(bar: Bar, region: MapRegion) {
  const lat = bar.lat ?? region.latitude;
  const lng = bar.lng ?? region.longitude;
  const top = 50 - ((lat - region.latitude) / region.latitudeDelta) * 100;
  const left = 50 + ((lng - region.longitude) / region.longitudeDelta) * 100;

  return {
    left: `${Math.max(10, Math.min(90, left))}%` as DimensionValue,
    top: `${Math.max(12, Math.min(88, top))}%` as DimensionValue
  };
}

export function BarMapPreview({ bars, region, userCoordinate }: BarMapPreviewProps) {
  const hasBars = Boolean(bars?.length);
  const barsWithLocation = bars?.filter(
    (bar) => typeof bar.lat === "number" && typeof bar.lng === "number"
  ) ?? [];

  return (
    <View style={styles.canvas}>
      <View style={styles.gridLayer} />
      <View style={styles.compass}>
        <Ionicons name="navigate" size={27} color="#c68334" />
        <Text style={styles.compassText}>SHANGHAI</Text>
      </View>

      <View style={[styles.roadBase, styles.juluRoad]} />
      <View style={[styles.roadDash, styles.juluDash]} />
      <View style={[styles.roadBase, styles.changleRoad]} />
      <View style={[styles.roadDash, styles.changleDash]} />
      <View style={[styles.roadBase, styles.fuminRoad]} />
      <View style={[styles.roadDash, styles.fuminDash]} />
      <View style={[styles.roadBase, styles.anfuRoad]} />
      <View style={[styles.roadDash, styles.anfuDash]} />

      <Text style={[styles.roadLabel, styles.juluLabel]}>JULU RD</Text>
      <Text style={[styles.roadLabel, styles.changleLabel]}>CHANGLE RD</Text>
      <Text style={[styles.roadLabel, styles.fuminLabel]}>FUMIN RD</Text>

      <View style={[styles.userDotWrap, getCoordinatePosition(userCoordinate, region)]}>
        <View style={styles.userDotPulse} />
        <View style={styles.userDot} />
      </View>

      {barsWithLocation.map((bar, index) => (
        <View key={bar.id} style={[styles.pinWrap, getMarkerPosition(bar, region)]}>
          <View style={styles.pinPulse} />
          <View style={styles.pin}>
            <Text style={styles.pinText}>{index + 1}</Text>
          </View>
        </View>
      ))}

      {hasBars && !barsWithLocation.length ? <Text style={styles.emptyText}>No bar locations returned</Text> : null}
    </View>
  );
}

function getCoordinatePosition(coords: { lat: number; lng: number }, region: MapRegion) {
  const top = 50 - ((coords.lat - region.latitude) / region.latitudeDelta) * 100;
  const left = 50 + ((coords.lng - region.longitude) / region.longitudeDelta) * 100;

  return {
    left: `${Math.max(10, Math.min(90, left))}%` as DimensionValue,
    top: `${Math.max(12, Math.min(88, top))}%` as DimensionValue
  };
}

const styles = StyleSheet.create({
  canvas: {
    alignItems: "center",
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#0d0706",
    justifyContent: "center",
    overflow: "hidden"
  },
  gridLayer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(139, 30, 25, 0.06)"
  },
  compass: {
    alignItems: "center",
    position: "absolute",
    right: 15,
    top: 13,
    zIndex: 3
  },
  compassText: {
    color: "#a8988c",
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 0.8,
    marginTop: 1
  },
  roadBase: {
    backgroundColor: "#2b0e0d",
    borderRadius: 999,
    position: "absolute"
  },
  roadDash: {
    backgroundColor: "#4a1715",
    borderRadius: 999,
    opacity: 0.9,
    position: "absolute"
  },
  juluRoad: {
    height: 14,
    left: "10%",
    right: "9%",
    top: "21%"
  },
  juluDash: {
    height: 2,
    left: "12%",
    right: "11%",
    top: "23.7%"
  },
  changleRoad: {
    bottom: "21%",
    height: 14,
    left: "10%",
    right: "9%"
  },
  changleDash: {
    bottom: "23.7%",
    height: 2,
    left: "12%",
    right: "11%"
  },
  fuminRoad: {
    bottom: "10%",
    left: "40%",
    top: "10%",
    width: 13
  },
  fuminDash: {
    bottom: "12%",
    left: "41.6%",
    top: "12%",
    width: 2
  },
  anfuRoad: {
    height: 14,
    left: "8%",
    right: "11%",
    top: "43%"
  },
  anfuDash: {
    height: 2,
    left: "10%",
    right: "13%",
    top: "45.7%"
  },
  roadLabel: {
    ...typography.caption,
    color: "rgba(168, 152, 140, 0.62)",
    fontSize: 9,
    fontWeight: "900",
    position: "absolute"
  },
  juluLabel: {
    left: "18%",
    top: "13%"
  },
  changleLabel: {
    bottom: "14%",
    right: "13%"
  },
  fuminLabel: {
    left: "44%",
    top: "33%",
    transform: [{ rotate: "90deg" }]
  },
  pinWrap: {
    alignItems: "center",
    justifyContent: "center",
    marginLeft: -17,
    marginTop: -17,
    position: "absolute",
    zIndex: 5
  },
  pinPulse: {
    backgroundColor: "rgba(139, 30, 25, 0.28)",
    borderRadius: 28,
    height: 56,
    position: "absolute",
    width: 56
  },
  pin: {
    alignItems: "center",
    backgroundColor: "#8b1e19",
    borderColor: "#c68334",
    borderRadius: 18,
    borderWidth: 2,
    height: 34,
    justifyContent: "center",
    shadowColor: "#8b1e19",
    shadowOpacity: 0.55,
    shadowRadius: 10,
    width: 34
  },
  pinText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: "900"
  },
  userDotWrap: {
    alignItems: "center",
    justifyContent: "center",
    marginLeft: -13,
    marginTop: -13,
    position: "absolute",
    zIndex: 6
  },
  userDotPulse: {
    backgroundColor: "rgba(249, 194, 7, 0.22)",
    borderRadius: 22,
    height: 44,
    position: "absolute",
    width: 44
  },
  userDot: {
    backgroundColor: "#f9c207",
    borderColor: "#fff4b0",
    borderRadius: 7,
    borderWidth: 2,
    height: 14,
    width: 14
  },
  emptyText: {
    ...typography.caption,
    color: colors.textMuted
  }
});

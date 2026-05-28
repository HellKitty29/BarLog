import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, View, type DimensionValue } from "react-native";
import MapView, { Circle, Marker } from "react-native-maps";
import Svg, { Circle as SvgCircle, Defs, Line, LinearGradient as SvgLinearGradient, Rect, Stop } from "react-native-svg";
import { isValidCoordinate } from "@/services/location/geo-utils";
import { colors, typography } from "@/theme";
import type { Bar } from "@/types/domain";

type BarMapPreviewProps = {
  bars?: Bar[];
  region: MapRegion;
  userCoordinate: { lat: number; lng: number };
};

type MapRegion = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
};

type MapCoordinate = {
  latitude: number;
  longitude: number;
};

type LocatedBar = Bar & {
  lat: number;
  lng: number;
};

function isLocatedBar(bar: Bar): bar is LocatedBar {
  return isValidCoordinate(bar);
}

const noirMapStyle = [
  { elementType: "geometry", stylers: [{ color: "#301212" }] },
  { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#8b8078" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#301212" }, { weight: 3 }] },
  { featureType: "administrative", elementType: "geometry", stylers: [{ visibility: "off" }] },
  { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#a8988c" }] },
  { featureType: "landscape", elementType: "geometry", stylers: [{ color: "#0b0403" }] },
  { featureType: "landscape.man_made", stylers: [{ visibility: "off" }] },
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "poi.business", stylers: [{ visibility: "off" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#140606" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#210909" }] },
  { featureType: "road", elementType: "labels", stylers: [{ visibility: "on" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#91827a" }] },
  { featureType: "road", elementType: "labels.text.stroke", stylers: [{ color: "#070202" }, { weight: 3 }] },
  { featureType: "road", elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { featureType: "road.arterial", elementType: "geometry", stylers: [{ color: "#1d0807" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#230908" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#07100d" }] },
  { featureType: "water", elementType: "labels", stylers: [{ visibility: "off" }] }
];

export function BarMapPreview({ bars, region, userCoordinate }: BarMapPreviewProps) {
  const [overlayRegion, setOverlayRegion] = useState(region);
  const hasBars = Boolean(bars?.length);
  const barsWithLocation = bars?.filter(isLocatedBar) ?? [];
  const barCoordinates = barsWithLocation.map((bar) => ({
    latitude: bar.lat!,
    longitude: bar.lng!
  }));
  const userMapCoordinate = {
    latitude: userCoordinate.lat,
    longitude: userCoordinate.lng
  };
  const gridLines = useMemo(() => createOverlayGrid(overlayRegion), [overlayRegion]);
  const mapKey = `${region.latitude.toFixed(4)}-${region.longitude.toFixed(4)}-${region.latitudeDelta.toFixed(4)}-${region.longitudeDelta.toFixed(4)}`;
  const userHaloRadius = clampRadius(overlayRegion.latitudeDelta * 14000, 120, 2200);
  const barHaloRadius = clampRadius(overlayRegion.latitudeDelta * 7000, 70, 1100);

  useEffect(() => {
    setOverlayRegion(region);
  }, [region]);

  return (
    <View style={styles.preview}>
      <MapView
        customMapStyle={noirMapStyle}
        initialRegion={region}
        key={mapKey}
        onRegionChangeComplete={setOverlayRegion}
        maxZoomLevel={20}
        minZoomLevel={10}
        pitchEnabled={false}
        rotateEnabled={false}
        scrollEnabled
        showsBuildings={false}
        showsCompass={false}
        showsIndoors={false}
        showsPointsOfInterest={false}
        style={styles.map}
        toolbarEnabled={false}
        zoomEnabled
      >
        <Circle
          center={userMapCoordinate}
          fillColor="rgba(139, 30, 25, 0.18)"
          radius={userHaloRadius}
          strokeColor="rgba(198, 131, 52, 0.3)"
          strokeWidth={1}
        />

        {barCoordinates.map((coordinate, index) => (
          <Circle
            center={coordinate}
            fillColor="rgba(139, 30, 25, 0.09)"
            key={`bar-zone-${barsWithLocation[index].id}`}
            radius={barHaloRadius}
            strokeColor="rgba(198, 131, 52, 0.22)"
            strokeWidth={1}
          />
        ))}

        <Marker
          anchor={{ x: 0.5, y: 0.5 }}
          coordinate={userMapCoordinate}
          title="You are here"
        >
          <View style={styles.userDotOuter}>
            <View style={styles.userDot} />
          </View>
        </Marker>

        {barsWithLocation.map((bar, index) => (
          <Marker
            coordinate={{ latitude: bar.lat!, longitude: bar.lng! }}
            description={bar.address}
            key={bar.id}
            title={bar.name}
          >
            <View style={styles.pin}>
              <Text style={styles.pinText}>{index + 1}</Text>
            </View>
          </Marker>
        ))}
      </MapView>
      <MapOverlay
        bars={barsWithLocation}
        gridLines={gridLines}
        region={overlayRegion}
        userCoordinate={userMapCoordinate}
      />
      <View style={styles.compassBadge}>
        <Ionicons name="navigate" size={21} color="#c68334" />
        <Text style={styles.compassText}>TRACE</Text>
      </View>
      {hasBars && !barsWithLocation.length ? <Text style={styles.emptyText}>No bar locations returned</Text> : null}
    </View>
  );
}

function MapOverlay({
  bars,
  gridLines,
  region,
  userCoordinate
}: {
  bars: LocatedBar[];
  gridLines: MapCoordinate[][];
  region: MapRegion;
  userCoordinate: MapCoordinate;
}) {
  const dotColumns = Array.from({ length: 25 }, (_, column) => column);
  const dotRows = Array.from({ length: 15 }, (_, row) => row);
  const userPoint = projectCoordinate(userCoordinate, region);
  const userStyle = createProjectedStyle(userPoint, 72, 72);

  return (
    <View pointerEvents="none" style={styles.overlay}>
      <Svg height="100%" preserveAspectRatio="none" style={StyleSheet.absoluteFill} viewBox="0 0 100 100" width="100%">
        <Defs>
          <SvgLinearGradient id="edgeShade" x1="0" x2="1" y1="0" y2="1">
            <Stop offset="0" stopColor="#000000" stopOpacity="0.88" />
            <Stop offset="0.5" stopColor="#000000" stopOpacity="0.04" />
            <Stop offset="1" stopColor="#000000" stopOpacity="0.92" />
          </SvgLinearGradient>
        </Defs>
        <Rect fill="#070101" height="100" opacity="0.9" width="100" x="0" y="0" />
        <SvgCircle cx="15" cy="34" fill="rgba(139, 30, 25, 0.26)" r="21" />
        {handDrawnRoads.map((road, index) => (
          <Line
            key={`road-${index}`}
            stroke="rgba(103, 41, 38, 0.72)"
            strokeLinecap="round"
            strokeWidth={road.width}
            x1={road.x1}
            x2={road.x2}
            y1={road.y1}
            y2={road.y2}
          />
        ))}
        {handDrawnRoads.map((road, index) => (
          <Line
            key={`road-dash-${index}`}
            stroke="rgba(127, 38, 31, 0.56)"
            strokeDasharray="1.9 2.2"
            strokeLinecap="round"
            strokeWidth="0.65"
            x1={road.x1}
            x2={road.x2}
            y1={road.y1}
            y2={road.y2}
          />
        ))}
        {gridLines.map((line, index) => {
          const [from, to] = line;
          const fromPoint = projectCoordinate(from, region);
          const toPoint = projectCoordinate(to, region);

          return (
            <Line
              key={`overlay-line-${index}`}
              stroke={index % 2 === 0 ? "rgba(184, 99, 96, 0.62)" : "rgba(156, 49, 42, 0.58)"}
              strokeDasharray={index % 2 === 0 ? "1.6 1.1" : "0.9 1.4"}
              strokeLinecap="round"
              strokeWidth={index % 2 === 0 ? 1.4 : 1}
              x1={fromPoint.x}
              x2={toPoint.x}
              y1={fromPoint.y}
              y2={toPoint.y}
            />
          );
        })}
        {dotColumns.flatMap((column) =>
          dotRows.map((row) => (
            <SvgCircle
              cx={3 + column * 4}
              cy={4 + row * 6.5}
              fill="rgba(198, 52, 42, 0.22)"
              key={`dot-${column}-${row}`}
              r="0.16"
            />
          ))
        )}
        <Rect fill="url(#edgeShade)" height="100" width="100" x="0" y="0" />
      </Svg>
      <Text style={[styles.roadLabel, styles.juluLabel]}>巨鹿路  JULU RD</Text>
      <Text style={[styles.roadLabel, styles.changleLabel]}>长乐路  CHANGLE RD</Text>
      <Text style={[styles.roadLabel, styles.huaihaiLabel]}>HUAIHAI</Text>
      <View style={[styles.overlayUserPin, userStyle]}>
        <View style={styles.overlayUserCore}>
          <Ionicons name="location-outline" size={31} color="#ffffff" />
        </View>
      </View>
      {bars.map((bar, index) => {
        const point = projectCoordinate({ latitude: bar.lat, longitude: bar.lng }, region);
        const position = createProjectedStyle(point, 46, 46);

        return (
          <View key={`overlay-bar-${bar.id}`} style={[styles.overlayBarPin, position]}>
            <Text style={styles.overlayBarText}>{index + 1}</Text>
          </View>
        );
      })}
      <View style={styles.topWash} />
      <View style={styles.bottomWash} />
    </View>
  );
}

const handDrawnRoads = [
  { x1: 1, y1: 20, x2: 96, y2: 20, width: 3.4 },
  { x1: 2, y1: 46, x2: 88, y2: 46, width: 3.2 },
  { x1: 2, y1: 75, x2: 88, y2: 75, width: 3 },
  { x1: 12, y1: 9, x2: 12, y2: 91, width: 3.4 },
  { x1: 34, y1: 7, x2: 34, y2: 92, width: 3.6 }
];

function projectCoordinate(coordinate: MapCoordinate, region: MapRegion) {
  const x = 50 + ((coordinate.longitude - region.longitude) / region.longitudeDelta) * 100;
  const y = 50 - ((coordinate.latitude - region.latitude) / region.latitudeDelta) * 100;

  return {
    x: Math.max(-10, Math.min(110, x)),
    y: Math.max(-10, Math.min(110, y))
  };
}

function createProjectedStyle(point: { x: number; y: number }, width: number, height: number) {
  return {
    left: `${point.x}%` as DimensionValue,
    top: `${point.y}%` as DimensionValue,
    transform: [{ translateX: -width / 2 }, { translateY: -height / 2 }]
  };
}

function createOverlayGrid(region: MapRegion): MapCoordinate[][] {
  const latSpan = region.latitudeDelta;
  const lngSpan = region.longitudeDelta;
  const minLat = region.latitude - latSpan / 2;
  const maxLat = region.latitude + latSpan / 2;
  const minLng = region.longitude - lngSpan / 2;
  const maxLng = region.longitude + lngSpan / 2;
  const verticalOffsets = [-0.34, 0, 0.34];
  const horizontalOffsets = [-0.28, 0.28];

  return [
    ...verticalOffsets.map((offset) => {
      const longitude = region.longitude + lngSpan * offset;
      return [
        { latitude: minLat, longitude },
        { latitude: maxLat, longitude: longitude + lngSpan * 0.08 }
      ];
    }),
    ...horizontalOffsets.map((offset) => {
      const latitude = region.latitude + latSpan * offset;
      return [
        { latitude, longitude: minLng },
        { latitude: latitude + latSpan * 0.05, longitude: maxLng }
      ];
    })
  ];
}

function clampRadius(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) {
    return min;
  }

  return Math.min(max, Math.max(min, value));
}

const styles = StyleSheet.create({
  preview: {
    alignItems: "center",
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#0d0706",
    justifyContent: "center",
    overflow: "hidden"
  },
  map: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.18
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#070101"
  },
  topWash: {
    backgroundColor: "rgba(7, 1, 1, 0.38)",
    height: "17%",
    left: 0,
    position: "absolute",
    right: 0,
    top: 0
  },
  bottomWash: {
    backgroundColor: "rgba(7, 1, 1, 0.44)",
    bottom: 0,
    height: "18%",
    left: 0,
    position: "absolute",
    right: 0
  },
  roadLabel: {
    color: "rgba(168, 152, 140, 0.55)",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.2,
    position: "absolute",
    textShadowColor: "#070101",
    textShadowRadius: 4,
    zIndex: 4
  },
  juluLabel: {
    left: "18%",
    top: "14%"
  },
  changleLabel: {
    bottom: "25%",
    right: "18%"
  },
  huaihaiLabel: {
    right: "7%",
    top: "18%"
  },
  overlayUserPin: {
    alignItems: "center",
    backgroundColor: "#bd2b25",
    borderColor: "#c68334",
    borderRadius: 36,
    borderWidth: 7,
    height: 72,
    justifyContent: "center",
    position: "absolute",
    shadowColor: "#bd2b25",
    shadowOpacity: 0.66,
    shadowRadius: 19,
    width: 72,
    zIndex: 10
  },
  overlayUserCore: {
    alignItems: "center",
    borderColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 23,
    borderWidth: 1,
    height: 46,
    justifyContent: "center",
    width: 46
  },
  overlayBarPin: {
    alignItems: "center",
    backgroundColor: "#120605",
    borderColor: "rgba(198, 131, 52, 0.42)",
    borderRadius: 23,
    borderWidth: 1,
    height: 46,
    justifyContent: "center",
    position: "absolute",
    shadowColor: "#000000",
    shadowOpacity: 0.44,
    shadowRadius: 8,
    width: 46,
    zIndex: 9
  },
  overlayBarText: {
    color: "#c68334",
    fontSize: 13,
    fontWeight: "900"
  },
  compassBadge: {
    alignItems: "center",
    backgroundColor: "rgba(13, 7, 6, 0.84)",
    borderColor: "rgba(198, 131, 52, 0.32)",
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 6,
    position: "absolute",
    right: 13,
    top: 13,
    zIndex: 8
  },
  compassText: {
    color: "#a8988c",
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 0.8,
    marginTop: 1
  },
  userDotOuter: {
    alignItems: "center",
    backgroundColor: "#bd2b25",
    borderColor: "#c68334",
    borderRadius: 28,
    borderWidth: 5,
    height: 56,
    justifyContent: "center",
    shadowColor: "#bd2b25",
    shadowOpacity: 0.55,
    shadowRadius: 16,
    width: 56
  },
  userDot: {
    backgroundColor: "#bd2b25",
    borderColor: "#faf6ee",
    borderRadius: 9,
    borderWidth: 3,
    height: 18,
    width: 18
  },
  pin: {
    alignItems: "center",
    backgroundColor: "#120605",
    borderColor: "rgba(198, 131, 52, 0.4)",
    borderRadius: 22,
    borderWidth: 1,
    height: 44,
    justifyContent: "center",
    shadowColor: "#000000",
    shadowOpacity: 0.4,
    shadowRadius: 9,
    width: 44
  },
  pinText: {
    color: "#c68334",
    fontSize: 12,
    fontWeight: "900"
  },
  emptyText: {
    ...typography.caption,
    color: colors.textMuted,
    zIndex: 9
  }
});

import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useMemo, useRef, useState } from "react";
import { Animated, Easing, StyleSheet, Text, View } from "react-native";
import Svg, { Circle, ClipPath, Defs, G, Line, LinearGradient as SvgLinearGradient, Path, Polygon, Stop } from "react-native-svg";

type SplashCocktailScreenProps = {
  onFinish: () => void | Promise<void>;
};

const cream = "#faf6ee";
const amber = "#c68334";
const crimson = "#961c1c";
const darkRed = "#0d0101";

function createWavePath(y: number, amplitude: number, phase: number) {
  const offset = phase * 48;
  return [
    `M ${-48 - offset},${y}`,
    `C ${-24 - offset},${y - amplitude} ${0 - offset},${y + amplitude} ${24 - offset},${y}`,
    `C ${48 - offset},${y - amplitude} ${72 - offset},${y + amplitude} ${96 - offset},${y}`,
    `C ${120 - offset},${y - amplitude} ${144 - offset},${y + amplitude} ${168 - offset},${y}`,
    `C ${192 - offset},${y - amplitude} ${216 - offset},${y + amplitude} ${240 - offset},${y}`,
    "L 240,120 L -96,120 Z"
  ].join(" ");
}

export function SplashCocktailScreen({ onFinish }: SplashCocktailScreenProps) {
  const progress = useRef(new Animated.Value(0)).current;
  const fade = useRef(new Animated.Value(1)).current;
  const exitScale = useRef(new Animated.Value(1)).current;
  const auraPulse = useRef(new Animated.Value(0)).current;
  const wave = useRef(new Animated.Value(0)).current;
  const [percent, setPercent] = useState(0);
  const [wavePhase, setWavePhase] = useState(0);

  const fillRatio = percent / 100;
  const frontWaveY = 73.5 - fillRatio * 37.3;
  const backWaveY = 73.5 - fillRatio * 38;
  const frontWavePath = createWavePath(frontWaveY, 3.2, wavePhase);
  const backWavePath = createWavePath(backWaveY, 2.4, (wavePhase + 0.35) % 1);
  const lemonRock = Math.sin(wavePhase * Math.PI * 2) * 1.8;
  const lemonLift = Math.cos(wavePhase * Math.PI * 2) * 0.45;

  const auraScale = useMemo(
    () =>
      Animated.multiply(
        progress.interpolate({
          inputRange: [0, 1],
          outputRange: [0.68, 1.28]
        }),
        auraPulse.interpolate({
          inputRange: [0, 1],
          outputRange: [0.96, 1.08]
        })
      ),
    [auraPulse, progress]
  );

  const auraOpacity = useMemo(
    () =>
      progress.interpolate({
        inputRange: [0, 0.12, 1],
        outputRange: [0.12, 0.3, 0.72]
      }),
    [progress]
  );

  useEffect(() => {
    const progressListener = progress.addListener(({ value }) => {
      setPercent(Math.round(value * 100));
    });
    const waveListener = wave.addListener(({ value }) => {
      setWavePhase(value);
    });

    const waveLoop = Animated.loop(
      Animated.timing(wave, {
        toValue: 1,
        duration: 1600,
        easing: Easing.linear,
        useNativeDriver: false
      })
    );
    const auraLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(auraPulse, {
          toValue: 1,
          duration: 1450,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: false
        }),
        Animated.timing(auraPulse, {
          toValue: 0,
          duration: 1450,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: false
        })
      ])
    );

    waveLoop.start();
    auraLoop.start();

    Animated.timing(progress, {
      toValue: 1,
      duration: 2800,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false
    }).start(({ finished }) => {
      if (!finished) {
        return;
      }

      setTimeout(() => {
        Animated.parallel([
          Animated.timing(fade, {
            toValue: 0,
            duration: 700,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true
          }),
          Animated.timing(exitScale, {
            toValue: 1.025,
            duration: 700,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true
          })
        ]).start(() => {
          waveLoop.stop();
          auraLoop.stop();
          void onFinish();
        });
      }, 500);
    });

    return () => {
      progress.removeListener(progressListener);
      wave.removeListener(waveListener);
      waveLoop.stop();
      auraLoop.stop();
    };
  }, [auraPulse, exitScale, fade, onFinish, progress, wave]);

  return (
    <Animated.View style={[styles.screen, { opacity: fade, transform: [{ scale: exitScale }] }]}>
      <LinearGradient
        colors={["#2b0604", darkRed, "#050000"]}
        locations={[0, 0.48, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.starburstOne} />
      <View style={styles.starburstTwo} />
      <View style={styles.topEmber} />
      <View style={styles.bottomEmber} />

      <View style={styles.brandBlock}>
        <Text style={styles.brand}>RECORD YOUR BARLOG</Text>
        <View style={styles.brandRule} />
      </View>

      <View style={styles.loaderBlock}>
        <Animated.View style={[styles.aura, { opacity: auraOpacity, transform: [{ scale: auraScale }] }]} />

        <Svg viewBox="0 0 100 120" width={176} height={212} style={styles.svg}>
          <Defs>
            <ClipPath id="liquidCupCavity">
              <Polygon points="21.5,36.2 50,73.5 78.5,36.2" />
            </ClipPath>
            <SvgLinearGradient id="goldenPeelGradient" x1="-22" y1="-22" x2="22" y2="4" gradientUnits="userSpaceOnUse">
              <Stop offset="0" stopColor="#FFE36B" />
              <Stop offset="0.48" stopColor="#F9C207" />
              <Stop offset="1" stopColor="#D99B00" />
            </SvgLinearGradient>
          </Defs>

          <G transform={`translate(19 ${34 + lemonLift}) rotate(${-30 + lemonRock}) scale(0.55)`}>
            <Path d="M -22,0 A 22,22 0 0,1 22,0 Z" fill="url(#goldenPeelGradient)" />
            <Path d="M -19.5,0 A 19.5,19.5 0 0,1 19.5,0 Z" fill="#FAF6EE" />
            <Path d="M -17.5,0 A 17.5,17.5 0 0,1 17.5,0 Z" fill="#FFE169" />
            <Line x1={0} y1={0} x2={-14.16} y2={-10.29} stroke="#FAF6EE" strokeWidth={1.2} />
            <Line x1={0} y1={0} x2={-5.41} y2={-16.64} stroke="#FAF6EE" strokeWidth={1.2} />
            <Line x1={0} y1={0} x2={5.41} y2={-16.64} stroke="#FAF6EE" strokeWidth={1.2} />
            <Line x1={0} y1={0} x2={14.16} y2={-10.29} stroke="#FAF6EE" strokeWidth={1.2} />
            <Circle cx={0} cy={0} r={2.5} fill="#FAF6EE" />
          </G>

          <G clipPath="url(#liquidCupCavity)">
            <Path d={backWavePath} fill={amber} opacity={0.48} />
            <Path d={frontWavePath} fill={cream} />
            <Circle cx={34} cy={52} r={1.4} fill={cream} opacity={0.28} />
            <Circle cx={58} cy={45} r={1.1} fill={amber} opacity={0.35} />
          </G>

          <Line x1={20} y1={35} x2={80} y2={35} stroke={cream} strokeWidth={1} strokeDasharray="3 3" opacity={0.3} />
          <Polygon points="20,35 50,75 80,35" stroke={cream} strokeWidth={2.8} fill="none" strokeLinejoin="round" />
          <Line x1={50} y1={75} x2={50} y2={105} stroke={cream} strokeWidth={2.8} strokeLinecap="round" />
          <Path d="M 33,105 L 67,105" stroke={cream} strokeWidth={2.8} strokeLinecap="round" />
        </Svg>

        <View style={styles.progressBlock}>
          <Text style={styles.percent}>{percent}%</Text>
          <Text style={styles.loadingText}>
            {percent === 100 ? "温杯完毕 · 邀您品鉴" : "盛满今夜灵感中..."}
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.slogan}>“今夜，让情绪在杯中发酵”</Text>
        <Text style={styles.copyright}>BARLOG COCKTAIL DIARY © 2026</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: "center",
    backgroundColor: darkRed,
    justifyContent: "space-between",
    overflow: "hidden",
    paddingBottom: 72,
    paddingHorizontal: 24,
    paddingTop: 88
  },
  starburstOne: {
    position: "absolute",
    top: "28%",
    width: 2,
    height: 440,
    backgroundColor: "rgba(255, 218, 180, 0.08)",
    transform: [{ rotate: "38deg" }]
  },
  starburstTwo: {
    position: "absolute",
    top: "30%",
    width: 390,
    height: 2,
    backgroundColor: "rgba(255, 218, 180, 0.07)",
    transform: [{ rotate: "-18deg" }]
  },
  topEmber: {
    position: "absolute",
    top: -130,
    width: 460,
    height: 460,
    borderRadius: 230,
    backgroundColor: "rgba(150, 28, 28, 0.2)"
  },
  bottomEmber: {
    position: "absolute",
    bottom: -180,
    width: 540,
    height: 540,
    borderRadius: 270,
    backgroundColor: "rgba(84, 6, 6, 0.48)"
  },
  brandBlock: {
    alignItems: "center",
    gap: 12,
    marginTop: 12
  },
  brand: {
    color: "rgba(198, 131, 52, 0.92)",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 5
  },
  brandRule: {
    width: 50,
    height: 1.5,
    backgroundColor: "rgba(198, 131, 52, 0.42)"
  },
  loaderBlock: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 430,
    width: "100%"
  },
  aura: {
    position: "absolute",
    top: 64,
    width: 230,
    height: 230,
    borderRadius: 115,
    backgroundColor: "rgba(198, 34, 34, 0.42)",
    shadowColor: crimson,
    shadowOpacity: 0.72,
    shadowRadius: 44
  },
  svg: {
    shadowColor: amber,
    shadowOpacity: 0.28,
    shadowRadius: 18
  },
  progressBlock: {
    alignItems: "center",
    marginTop: 4
  },
  percent: {
    color: cream,
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: 2
  },
  loadingText: {
    color: "rgba(184, 169, 160, 0.95)",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1,
    marginTop: 7
  },
  footer: {
    alignItems: "center",
    gap: 10,
    marginBottom: 6
  },
  slogan: {
    color: "#ebe4d5",
    fontSize: 17,
    fontStyle: "italic",
    fontWeight: "900",
    letterSpacing: 0.7,
    textAlign: "center"
  },
  copyright: {
    color: "rgba(90, 77, 69, 0.95)",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 2
  }
});

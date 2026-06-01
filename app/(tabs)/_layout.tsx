import { Ionicons } from "@expo/vector-icons";
import { Tabs, router } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";
import { colors } from "@/theme";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSubtle,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          minHeight: 72,
          paddingBottom: 12,
          paddingTop: 8
        }
      }}
    >
      <Tabs.Screen
        name="discover"
        options={{
          title: "Discover",
          tabBarIcon: ({ color, size }) => <Ionicons color={color} name="compass-outline" size={size} />
        }}
      />
      <Tabs.Screen
        name="check-in"
        listeners={{
          tabPress: (event) => {
            event.preventDefault();
            router.push("/sip/capture");
          }
        }}
        options={{
          title: "Check-in",
          tabBarButton: ({ onPress, accessibilityState, accessibilityLabel, testID }) => {
            const selected = accessibilityState?.selected;

            return (
              <Pressable
                accessibilityLabel={accessibilityLabel}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                onPress={onPress}
                style={styles.sipButton}
                testID={testID}
              >
                <View style={styles.sipCircle}>
                  <Ionicons color={colors.white} name="camera" size={28} />
                </View>
              </Pressable>
            );
          }
        }}
      />
      <Tabs.Screen
        name="clink"
        options={{
          title: "Clink",
          tabBarIcon: ({ color, size }) => <Ionicons color={color} name="chatbubbles-outline" size={size} />
        }}
      />
      <Tabs.Screen
        name="me"
        options={{
          title: "Me",
          tabBarIcon: ({ color, size }) => <Ionicons color={color} name="person-outline" size={size} />
        }}
      />
      <Tabs.Screen name="diary" options={{ href: null }} />
      <Tabs.Screen name="map" options={{ href: null }} />
      <Tabs.Screen name="sip" options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  sipButton: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    top: -18
  },
  sipCircle: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderColor: colors.background,
    borderRadius: 34,
    borderWidth: 5,
    height: 68,
    justifyContent: "center",
    width: 68
  }
});

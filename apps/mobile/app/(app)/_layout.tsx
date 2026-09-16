import { BlurView } from "expo-blur";
import { Tabs } from "expo-router";
import { StyleSheet } from "react-native";
import { colors } from "@/lib/colors";
import { fonts } from "@/lib/fonts";

export default function AppLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.good,
        tabBarInactiveTintColor: colors.inkSoft,
        tabBarStyle: { backgroundColor: "transparent", borderTopColor: colors.surfaceBorder },
        tabBarBackground: () => <BlurView intensity={50} tint="dark" style={StyleSheet.absoluteFill} />,
        tabBarLabelStyle: { fontFamily: fonts.sans, fontSize: 12 },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "יומן" }} />
      <Tabs.Screen name="reports" options={{ title: "דוחות" }} />
      <Tabs.Screen name="profile" options={{ title: "פרופיל" }} />
    </Tabs>
  );
}

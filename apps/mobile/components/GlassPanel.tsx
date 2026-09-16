import { BlurView } from "expo-blur";
import type { ReactNode } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { colors } from "@/lib/colors";

const RADIUS = 18;

export function GlassPanel({
  children,
  style,
  contentStyle,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.wrap, style]}>
      <BlurView intensity={45} tint="dark" style={StyleSheet.absoluteFill} />
      <View style={styles.tint} pointerEvents="none" />
      <View style={[styles.content, contentStyle]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: RADIUS,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.4,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  tint: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.surface,
  },
  content: {
    padding: 18,
  },
});

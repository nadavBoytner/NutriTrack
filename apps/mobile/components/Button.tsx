import { LinearGradient } from "expo-linear-gradient";
import { ActivityIndicator, Pressable, StyleSheet, Text, type PressableProps } from "react-native";
import { colors } from "@/lib/colors";
import { fonts } from "@/lib/fonts";

type Variant = "primary" | "ghost" | "danger";

export function Button({
  variant = "primary",
  label,
  loading,
  disabled,
  style,
  ...props
}: PressableProps & { variant?: Variant; label: string; loading?: boolean }) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      disabled={isDisabled}
      style={(state) => [
        styles.base,
        variant !== "primary" && variantStyles[variant],
        isDisabled && styles.disabled,
        state.pressed && !isDisabled && styles.pressed,
        typeof style === "function" ? style(state) : style,
      ]}
      {...props}
    >
      {variant === "primary" && (
        <LinearGradient
          colors={[colors.goodFill, colors.link]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
      )}
      {loading ? (
        <ActivityIndicator color={variant === "primary" ? colors.onFill : colors.ink} size="small" />
      ) : (
        <Text style={[styles.label, variantTextStyles[variant]]}>{label}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 40,
    overflow: "hidden",
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.85,
  },
  label: {
    fontFamily: fonts.sansMedium,
    fontSize: 14,
  },
});

const variantStyles = StyleSheet.create({
  ghost: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.surfaceBorder },
  danger: { backgroundColor: "transparent" },
});

const variantTextStyles = StyleSheet.create({
  primary: { color: colors.onFill },
  ghost: { color: colors.ink },
  danger: { color: colors.warn },
});

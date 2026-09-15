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
        variantStyles[variant],
        isDisabled && styles.disabled,
        state.pressed && !isDisabled && styles.pressed,
        typeof style === "function" ? style(state) : style,
      ]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={variant === "primary" ? colors.paper : colors.ink} size="small" />
      ) : (
        <Text style={[styles.label, variantTextStyles[variant]]}>{label}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 40,
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
  primary: { backgroundColor: colors.good },
  ghost: { backgroundColor: "transparent", borderWidth: 1, borderColor: colors.line },
  danger: { backgroundColor: "transparent" },
});

const variantTextStyles = StyleSheet.create({
  primary: { color: colors.paper },
  ghost: { color: colors.ink },
  danger: { color: colors.warn },
});

import { StyleSheet, Text, TextInput, View, type TextInputProps } from "react-native";
import { colors } from "@/lib/colors";
import { fonts } from "@/lib/fonts";

export function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      {children}
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

export function Input(props: TextInputProps) {
  return (
    <TextInput
      placeholderTextColor={colors.inkSoft + "99"}
      textAlign="right"
      style={[styles.input, props.style]}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 16,
  },
  label: {
    fontFamily: fonts.sans,
    fontSize: 13,
    color: colors.inkSoft,
    marginBottom: 4,
    textAlign: "right",
    writingDirection: "rtl",
  },
  input: {
    fontFamily: fonts.sans,
    fontSize: 16,
    color: colors.ink,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    paddingVertical: 8,
    writingDirection: "rtl",
  },
  error: {
    fontFamily: fonts.sans,
    fontSize: 13,
    color: colors.warn,
    marginTop: 4,
    textAlign: "right",
  },
});

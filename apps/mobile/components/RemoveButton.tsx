import { Pressable, StyleSheet, Text } from "react-native";
import { colors } from "@/lib/colors";
import { fonts } from "@/lib/fonts";

export function RemoveButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      accessibilityRole="button"
      accessibilityLabel="הסרה"
    >
      <Text style={styles.text}>✕</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  text: {
    fontFamily: fonts.sans,
    fontSize: 16,
    color: colors.inkSoft,
    textAlign: "center",
  },
});

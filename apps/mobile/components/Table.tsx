import { ScrollView, StyleSheet, Text, View, type ViewStyle } from "react-native";
import { colors } from "@/lib/colors";
import { fonts } from "@/lib/fonts";

export const COL = {
  name: 150,
  qty: 60,
  macro: 46,
  action: 40,
};

export function TableWrap({ children }: { children: React.ReactNode }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View>{children}</View>
    </ScrollView>
  );
}

export function HeaderRow({ children }: { children: React.ReactNode }) {
  return <View style={styles.headerRow}>{children}</View>;
}

export function HeaderCell({ width, children }: { width: number; children: React.ReactNode }) {
  return (
    <View style={{ width }}>
      <Text style={styles.headerCell}>{children}</Text>
    </View>
  );
}

export function Row({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return <View style={[styles.row, style]}>{children}</View>;
}

export function Cell({
  width,
  children,
  style,
}: {
  width: number;
  children: React.ReactNode;
  style?: ViewStyle;
}) {
  return <View style={[{ width, justifyContent: "center" }, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row-reverse",
    borderBottomWidth: 2,
    borderBottomColor: colors.ink,
    paddingBottom: 8,
  },
  headerCell: {
    fontFamily: fonts.sans,
    fontSize: 11,
    color: colors.inkSoft,
    textAlign: "right",
  },
  row: {
    flexDirection: "row-reverse",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    paddingVertical: 10,
  },
});

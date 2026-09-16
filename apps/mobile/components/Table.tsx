import { StyleSheet, Text, View, type ViewStyle } from "react-native";
import { colors } from "@/lib/colors";
import { fonts } from "@/lib/fonts";

export const COL = {
  name: 3,
  qty: 1.8,
  macro: 1,
};

export const ACTION_WIDTH = 26;

export function TableWrap({ children }: { children: React.ReactNode }) {
  return <View>{children}</View>;
}

export function HeaderRow({ children }: { children: React.ReactNode }) {
  return <View style={styles.headerRow}>{children}</View>;
}

export function HeaderCell({
  flex,
  width,
  children,
}: {
  flex?: number;
  width?: number;
  children: React.ReactNode;
}) {
  return (
    <View style={flex !== undefined ? { flex } : { width }}>
      <Text style={styles.headerCell} numberOfLines={1}>
        {children}
      </Text>
    </View>
  );
}

export function Row({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return <View style={[styles.row, style]}>{children}</View>;
}

export function Cell({
  flex,
  width,
  children,
  style,
}: {
  flex?: number;
  width?: number;
  children: React.ReactNode;
  style?: ViewStyle;
}) {
  return (
    <View style={[flex !== undefined ? { flex } : { width }, { justifyContent: "center" }, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row-reverse",
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceBorder,
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

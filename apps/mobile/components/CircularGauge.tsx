import { StyleSheet, Text, View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { colors } from "@/lib/colors";
import { fonts } from "@/lib/fonts";

const SIZE = 78;
const STROKE = 7;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function CircularGauge({
  label,
  current,
  goal,
  unit,
}: {
  label: string;
  current: number;
  goal: number | null;
  unit: string;
}) {
  const pct = goal ? Math.min(current / goal, 1) : 0;
  const over = goal !== null && current > goal;
  const color = over ? colors.warn : colors.good;

  return (
    <View style={styles.wrap}>
      <View
        style={{
          width: SIZE,
          height: SIZE,
          shadowColor: color,
          shadowOpacity: 0.55,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 0 },
        }}
      >
        <Svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
          <Circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            stroke={colors.line}
            strokeWidth={STROKE}
            fill="none"
          />
          <Circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            stroke={color}
            strokeWidth={STROKE}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${CIRCUMFERENCE} ${CIRCUMFERENCE}`}
            strokeDashoffset={CIRCUMFERENCE * (1 - pct)}
            rotation={-90}
            origin={`${SIZE / 2}, ${SIZE / 2}`}
          />
        </Svg>
        <View style={styles.center} pointerEvents="none">
          <Text style={[styles.value, over && { color: colors.warn }]}>{Math.round(current)}</Text>
          {goal !== null && <Text style={styles.goal}>/{Math.round(goal)}</Text>}
        </View>
      </View>
      <Text style={styles.label}>
        {label}
        {goal !== null ? ` (${unit})` : ""}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    gap: 6,
  },
  center: {
    position: "absolute",
    inset: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  value: {
    fontFamily: fonts.sansMedium,
    fontSize: 15,
    color: colors.ink,
  },
  goal: {
    fontFamily: fonts.sans,
    fontSize: 10,
    color: colors.inkSoft,
  },
  label: {
    fontFamily: fonts.sans,
    fontSize: 11,
    color: colors.inkSoft,
    textAlign: "center",
  },
});

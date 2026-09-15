import { Text as RNText, StyleSheet, View } from "react-native";
import Svg, { Circle, Line, Path, Text as SvgText } from "react-native-svg";
import type { WeightEntry } from "@foodtrack/shared-types";
import { colors } from "@/lib/colors";
import { fonts } from "@/lib/fonts";

const WIDTH = 340;
const HEIGHT = 160;
const PADDING = 24;

export function WeightTrendChart({ entries }: { entries: WeightEntry[] }) {
  if (entries.length < 2) {
    return (
      <RNText style={styles.empty}>אין מספיק נתוני משקל להצגת גרף (נדרשות לפחות שתי שקילות).</RNText>
    );
  }

  const weights = entries.map((e) => e.weightKg);
  const min = Math.min(...weights);
  const max = Math.max(...weights);
  const range = max - min || 1;

  const points = entries.map((entry, i) => {
    const x = PADDING + (i / (entries.length - 1)) * (WIDTH - 2 * PADDING);
    const y = PADDING + (1 - (entry.weightKg - min) / range) * (HEIGHT - 2 * PADDING);
    return { x, y, entry };
  });

  const path = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");

  return (
    <View>
      <Svg width="100%" height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`}>
        <Line x1={PADDING} y1={HEIGHT - PADDING} x2={WIDTH - PADDING} y2={HEIGHT - PADDING} stroke={colors.line} />
        <Path d={path} fill="none" stroke={colors.good} strokeWidth={1.5} />
        {points.map((p) => (
          <Circle key={p.entry.id} cx={p.x} cy={p.y} r={2.5} fill={colors.good} />
        ))}
        <SvgText x={PADDING} y={16} fontSize={12} fill={colors.inkSoft}>
          {max.toLocaleString("he-IL")} ק&quot;ג
        </SvgText>
        <SvgText x={PADDING} y={HEIGHT - 6} fontSize={12} fill={colors.inkSoft}>
          {min.toLocaleString("he-IL")} ק&quot;ג
        </SvgText>
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  empty: {
    fontFamily: fonts.sans,
    fontSize: 13,
    color: colors.inkSoft,
    textAlign: "right",
  },
});

import { Text as RNText, StyleSheet, View } from "react-native";
import Svg, { Circle, Defs, Line, LinearGradient, Path, Stop, Text as SvgText } from "react-native-svg";
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
  const areaPath = `${path} L ${points[points.length - 1].x.toFixed(1)} ${HEIGHT - PADDING} L ${points[0].x.toFixed(1)} ${HEIGHT - PADDING} Z`;
  const last = points[points.length - 1];

  return (
    <View>
      <Svg width="100%" height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`}>
        <Defs>
          <LinearGradient id="weightArea" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={colors.good} stopOpacity={0.28} />
            <Stop offset="100%" stopColor={colors.good} stopOpacity={0} />
          </LinearGradient>
        </Defs>
        <Line x1={PADDING} y1={HEIGHT - PADDING} x2={WIDTH - PADDING} y2={HEIGHT - PADDING} stroke={colors.line} />
        <Path d={areaPath} fill="url(#weightArea)" stroke="none" />
        <Path d={path} fill="none" stroke={colors.good} strokeWidth={1.75} />
        {points.map((p) => (
          <Circle key={p.entry.id} cx={p.x} cy={p.y} r={p === last ? 3.5 : 2.25} fill={colors.good} />
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

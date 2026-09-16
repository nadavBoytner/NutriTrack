import { StyleSheet, View, useWindowDimensions } from "react-native";
import Svg, { Circle, Defs, RadialGradient, Stop } from "react-native-svg";

export function BackgroundGlow() {
  const { width, height } = useWindowDimensions();

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Svg width={width} height={height}>
        <Defs>
          <RadialGradient id="glowGreen" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#267e36" stopOpacity={0.4} />
            <Stop offset="100%" stopColor="#267e36" stopOpacity={0} />
          </RadialGradient>
          <RadialGradient id="glowAmber" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#f2a93c" stopOpacity={0.24} />
            <Stop offset="100%" stopColor="#f2a93c" stopOpacity={0} />
          </RadialGradient>
          <RadialGradient id="glowTeal" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#1c8c8c" stopOpacity={0.18} />
            <Stop offset="100%" stopColor="#1c8c8c" stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Circle cx={width * 0.82} cy={height * 0.04} r={width * 0.55} fill="url(#glowGreen)" />
        <Circle cx={width * 0.08} cy={height * 0.98} r={width * 0.5} fill="url(#glowAmber)" />
        <Circle cx={width * 0.5} cy={height * 0.55} r={width * 0.4} fill="url(#glowTeal)" />
      </Svg>
    </View>
  );
}

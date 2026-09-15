import type { WeightEntry } from "@foodtrack/shared-types";

const WIDTH = 600;
const HEIGHT = 160;
const PADDING = 24;

export function WeightTrendChart({ entries }: { entries: WeightEntry[] }) {
  if (entries.length < 2) {
    return <p className="text-sm text-ink-soft">אין מספיק נתוני משקל להצגת גרף (נדרשות לפחות שתי שקילות).</p>;
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
    <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full" role="img" aria-label="גרף מגמת משקל">
      <line
        x1={PADDING}
        y1={HEIGHT - PADDING}
        x2={WIDTH - PADDING}
        y2={HEIGHT - PADDING}
        stroke="var(--color-line)"
      />
      <path d={path} fill="none" stroke="var(--color-good)" strokeWidth={1.5} />
      {points.map((p) => (
        <circle key={p.entry.id} cx={p.x} cy={p.y} r={2.5} fill="var(--color-good)" />
      ))}
      <text x={PADDING} y={16} fontSize={12} fill="var(--color-ink-soft)">
        {max.toLocaleString("he-IL")} ק&quot;ג
      </text>
      <text x={PADDING} y={HEIGHT - 6} fontSize={12} fill="var(--color-ink-soft)">
        {min.toLocaleString("he-IL")} ק&quot;ג
      </text>
    </svg>
  );
}

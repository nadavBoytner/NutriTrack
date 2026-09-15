const SIZE = 84;
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
  const color = over ? "var(--color-warn)" : "var(--color-good)";

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: SIZE, height: SIZE }}>
        <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} className="-rotate-90">
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke="var(--color-line)"
            strokeWidth={STROKE}
          />
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke={color}
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={CIRCUMFERENCE * (1 - pct)}
            style={{ transition: "stroke-dashoffset 0.4s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-base font-medium tabular-nums ${over ? "text-warn" : "text-ink"}`}>
            {Math.round(current).toLocaleString("he-IL")}
          </span>
          {goal !== null && (
            <span className="text-[11px] tabular-nums text-ink-soft">/{Math.round(goal).toLocaleString("he-IL")}</span>
          )}
        </div>
      </div>
      <span className="text-xs text-ink-soft">
        {label} {goal !== null ? `(${unit})` : ""}
      </span>
    </div>
  );
}

interface DonutSlice {
  label: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  slices: DonutSlice[];
  size?: number;
  thickness?: number;
}

export function DonutChart({ slices, size = 120, thickness = 22 }: DonutChartProps) {
  const total = slices.reduce((s, sl) => s + sl.value, 0);
  if (total === 0) return null;

  const cx = size / 2;
  const cy = size / 2;
  const r  = (size - thickness) / 2;
  const circumference = 2 * Math.PI * r;

  let offset = 0;
  const segments = slices.map((sl) => {
    const pct  = sl.value / total;
    const dash = pct * circumference;
    const seg  = { ...sl, pct, dash, offset };
    offset += dash;
    return seg;
  });

  // Rotate so first segment starts at top (-90°)
  const startAngle = -90;

  return (
    <div className="flex items-center gap-6">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {segments.map((seg, i) => (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={seg.color}
            strokeWidth={thickness}
            strokeDasharray={`${seg.dash} ${circumference - seg.dash}`}
            strokeDashoffset={-(seg.offset) + (circumference * startAngle) / 360}
            style={{ transition: "stroke-dasharray 0.4s ease" }}
          />
        ))}
        {/* Center hole */}
        <circle cx={cx} cy={cy} r={r - thickness / 2 - 2} fill="transparent" />
      </svg>

      <div className="space-y-2">
        {segments.map((seg, i) => (
          <div key={i} className="flex items-center gap-2 text-sm">
            <span
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: seg.color }}
            />
            <span className="text-foreground">{seg.label}</span>
            <span className="text-muted-foreground ml-auto pl-4">
              {(seg.pct * 100).toFixed(0)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

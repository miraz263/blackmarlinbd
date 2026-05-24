interface LineAreaChartProps {
  labels: string[];
  datasets: { label: string; data: number[]; color: string }[];
  height?: number;
}

export function LineAreaChart({ labels, datasets, height = 220 }: LineAreaChartProps) {
  const W = 800;
  const H = height;
  const padT = 12;
  const padB = 28;
  const padL = 44;
  const padR = 16;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;

  if (!labels.length || !datasets.length) return null;

  const allValues = datasets.flatMap((d) => d.data);
  const max = Math.max(...allValues, 1);

  const toX = (i: number) =>
    labels.length === 1 ? padL + chartW / 2 : padL + (i / (labels.length - 1)) * chartW;
  const toY = (v: number) => padT + (1 - v / max) * chartH;

  const gridValues = [0, 0.25, 0.5, 0.75, 1];

  const labelStep = Math.max(1, Math.ceil(labels.length / 7));
  const visibleLabels = labels
    .map((l, i) => ({ l, i }))
    .filter(({ i }) => i % labelStep === 0 || i === labels.length - 1);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full"
      style={{ height: `${H}px`, maxHeight: `${H}px` }}
      preserveAspectRatio="none"
    >
      <defs>
        {datasets.map((ds, di) => (
          <linearGradient key={di} id={`grad-${di}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={ds.color} stopOpacity="0.25" />
            <stop offset="100%" stopColor={ds.color} stopOpacity="0" />
          </linearGradient>
        ))}
      </defs>

      {/* Horizontal grid lines */}
      {gridValues.map((frac, i) => {
        const y = padT + (1 - frac) * chartH;
        const label = Math.round(frac * max);
        return (
          <g key={i}>
            <line
              x1={padL} y1={y} x2={W - padR} y2={y}
              stroke="currentColor" strokeOpacity="0.07" strokeWidth="1"
            />
            <text
              x={padL - 6} y={y}
              textAnchor="end" dominantBaseline="middle"
              fontSize="10" fill="currentColor" fillOpacity="0.4"
            >
              {label >= 1000 ? `${(label / 1000).toFixed(1)}k` : label}
            </text>
          </g>
        );
      })}

      {/* Area + line per dataset */}
      {datasets.map((ds, di) => {
        const pts = ds.data.map((v, i) => ({ x: toX(i), y: toY(v) }));
        const linePath = pts
          .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
          .join(" ");
        const last = pts[pts.length - 1];
        const first = pts[0];
        const areaPath =
          linePath +
          ` L ${last.x.toFixed(1)} ${(H - padB).toFixed(1)}` +
          ` L ${first.x.toFixed(1)} ${(H - padB).toFixed(1)} Z`;

        return (
          <g key={di}>
            <path d={areaPath} fill={`url(#grad-${di})`} />
            <path
              d={linePath}
              fill="none"
              stroke={ds.color}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {pts.map((p, i) => (
              <circle key={i} cx={p.x} cy={p.y} r="2.5" fill={ds.color} />
            ))}
          </g>
        );
      })}

      {/* X-axis labels */}
      {visibleLabels.map(({ l, i }) => (
        <text
          key={i}
          x={toX(i).toFixed(1)}
          y={H - padB + 14}
          textAnchor="middle"
          fontSize="10"
          fill="currentColor"
          fillOpacity="0.45"
        >
          {l}
        </text>
      ))}
    </svg>
  );
}

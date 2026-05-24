import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Eye, Users, MessageSquare, BookOpen, Briefcase,
  TrendingUp, TrendingDown, Minus, Download, RefreshCw,
} from "lucide-react";
import {
  analyticsService,
  analyticsKeys,
  type RangeOption,
} from "@/services/analyticsService";
import { LineAreaChart } from "@/components/charts/LineAreaChart";
import { DonutChart } from "@/components/charts/DonutChart";
import { MiniSparkline } from "@/components/charts/MiniSparkline";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

function TrendBadge({ change }: { change: number }) {
  if (change > 0)
    return (
      <span className="flex items-center gap-0.5 text-xs font-medium text-green-500">
        <TrendingUp className="h-3 w-3" />+{change}%
      </span>
    );
  if (change < 0)
    return (
      <span className="flex items-center gap-0.5 text-xs font-medium text-red-400">
        <TrendingDown className="h-3 w-3" />{change}%
      </span>
    );
  return (
    <span className="flex items-center gap-0.5 text-xs font-medium text-muted-foreground">
      <Minus className="h-3 w-3" />0%
    </span>
  );
}

// ─── Stat card ───────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  change,
  icon: Icon,
  color,
  sparkData,
}: {
  label: string;
  value: number;
  change: number;
  icon: React.ElementType;
  color: string;
  sparkData?: number[];
}) {
  return (
    <div className="p-5 rounded-2xl bg-card border border-border flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: `${color}18` }}
        >
          <Icon className="h-5 w-5" style={{ color }} />
        </div>
        <TrendBadge change={change} />
      </div>
      <div>
        <div className="text-2xl font-bold tracking-tight">{fmt(value)}</div>
        <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
      </div>
      {sparkData && sparkData.length > 1 && (
        <div className="mt-1">
          <MiniSparkline data={sparkData} color={color} width={120} height={28} />
        </div>
      )}
    </div>
  );
}

// ─── Range tabs ──────────────────────────────────────────────────────────────

const RANGES: { label: string; value: RangeOption }[] = [
  { label: "7 days",  value: "7d"  },
  { label: "30 days", value: "30d" },
  { label: "90 days", value: "90d" },
];

// ─── Top pages table ─────────────────────────────────────────────────────────

function TopPagesTable({ range }: { range: RangeOption }) {
  const { data: pages = [], isLoading } = useQuery({
    queryKey: analyticsKeys.topPages(range),
    queryFn:  () => analyticsService.getTopPages(range).then((r) => r.data),
    staleTime: 2 * 60_000,
  });

  const maxViews = Math.max(...pages.map((p) => p.views), 1);

  return (
    <div className="rounded-2xl bg-card border border-border p-5">
      <h3 className="font-semibold text-sm mb-4">Top Pages</h3>
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-8 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      ) : pages.length === 0 ? (
        <p className="text-sm text-muted-foreground py-6 text-center">No data yet</p>
      ) : (
        <div className="space-y-2">
          {pages.slice(0, 10).map((page, i) => (
            <div key={i} className="group">
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-foreground truncate max-w-[200px] font-mono text-xs">
                  {page.path}
                </span>
                <div className="flex items-center gap-3 text-xs text-muted-foreground flex-shrink-0 ml-2">
                  <span>{fmt(page.views)} views</span>
                  <span className="text-muted-foreground/50">{fmt(page.unique)} uniq</span>
                </div>
              </div>
              <div className="h-1.5 rounded-full bg-accent overflow-hidden">
                <div
                  className="h-full rounded-full bg-brand-500/60 transition-all duration-500"
                  style={{ width: `${(page.views / maxViews) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Device breakdown ────────────────────────────────────────────────────────

function DeviceBreakdown({ range }: { range: RangeOption }) {
  const { data, isLoading } = useQuery({
    queryKey: analyticsKeys.devices(range),
    queryFn:  () => analyticsService.getDevices(range).then((r) => r.data),
    staleTime: 2 * 60_000,
  });

  const slices = data
    ? [
        { label: "Desktop", value: data.desktop, color: "#7c3aed" },
        { label: "Mobile",  value: data.mobile,  color: "#06b6d4" },
        { label: "Tablet",  value: data.tablet,  color: "#f59e0b" },
      ].filter((s) => s.value > 0)
    : [];

  return (
    <div className="rounded-2xl bg-card border border-border p-5">
      <h3 className="font-semibold text-sm mb-4">Devices</h3>
      {isLoading ? (
        <div className="flex gap-4 items-center">
          <div className="w-28 h-28 rounded-full bg-muted animate-pulse" />
          <div className="space-y-2 flex-1">
            {[1, 2, 3].map((i) => <div key={i} className="h-4 rounded bg-muted animate-pulse" />)}
          </div>
        </div>
      ) : slices.length === 0 ? (
        <p className="text-sm text-muted-foreground py-6 text-center">No data yet</p>
      ) : (
        <DonutChart slices={slices} size={110} thickness={20} />
      )}
    </div>
  );
}

// ─── Referrers list ──────────────────────────────────────────────────────────

function ReferrersList({ range }: { range: RangeOption }) {
  const { data: refs = [], isLoading } = useQuery({
    queryKey: analyticsKeys.referrers(range),
    queryFn:  () => analyticsService.getReferrers(range).then((r) => r.data),
    staleTime: 2 * 60_000,
  });

  const maxCount = Math.max(...refs.map((r) => r.count), 1);

  return (
    <div className="rounded-2xl bg-card border border-border p-5">
      <h3 className="font-semibold text-sm mb-4">Top Referrers</h3>
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-8 rounded-lg bg-muted animate-pulse" />)}
        </div>
      ) : refs.length === 0 ? (
        <p className="text-sm text-muted-foreground py-6 text-center">No referrer data yet</p>
      ) : (
        <div className="space-y-2">
          {refs.map((ref, i) => (
            <div key={i}>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-foreground font-medium truncate max-w-[160px]">
                  {ref.referrer}
                </span>
                <span className="text-muted-foreground ml-2">{fmt(ref.count)}</span>
              </div>
              <div className="h-1.5 rounded-full bg-accent overflow-hidden">
                <div
                  className="h-full rounded-full bg-cyan-500/60 transition-all duration-500"
                  style={{ width: `${(ref.count / maxCount) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main page ───────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const [range, setRange] = useState<RangeOption>("7d");
  const [chartMetric, setChartMetric] = useState<"both" | "views" | "visitors">("both");

  const { data: overview, isLoading: overviewLoading, refetch: refetchOverview } = useQuery({
    queryKey: analyticsKeys.overview(range),
    queryFn:  () => analyticsService.getOverview(range).then((r) => r.data),
    staleTime: 2 * 60_000,
    refetchInterval: 5 * 60_000,
  });

  const { data: chart, isLoading: chartLoading } = useQuery({
    queryKey: analyticsKeys.chart(range),
    queryFn:  () => analyticsService.getChart(range).then((r) => r.data),
    staleTime: 2 * 60_000,
  });

  const chartDatasets = [];
  if (chartMetric !== "visitors" && chart) {
    chartDatasets.push({ label: "Page Views", data: chart.views, color: "#7c3aed" });
  }
  if (chartMetric !== "views" && chart) {
    chartDatasets.push({ label: "Unique Visitors", data: chart.visitors, color: "#06b6d4" });
  }

  const statCards = overview
    ? [
        {
          label: "Page Views",
          value: overview.page_views,
          change: overview.page_views_change,
          icon: Eye,
          color: "#7c3aed",
          sparkData: chart?.views,
        },
        {
          label: "Unique Visitors",
          value: overview.unique_visitors,
          change: overview.unique_visitors_change,
          icon: Users,
          color: "#06b6d4",
          sparkData: chart?.visitors,
        },
        {
          label: "Blog Views",
          value: overview.blog_views,
          change: overview.blog_views_change,
          icon: BookOpen,
          color: "#f59e0b",
        },
        {
          label: "New Contacts",
          value: overview.new_contacts,
          change: overview.new_contacts_change,
          icon: MessageSquare,
          color: "#10b981",
        },
        {
          label: "Job Applications",
          value: overview.job_applications,
          change: overview.job_applications_change,
          icon: Briefcase,
          color: "#f43f5e",
        },
      ]
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold">Analytics</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Traffic, engagement, and conversion metrics
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Range selector */}
          <div className="flex items-center gap-1 p-1 bg-accent rounded-xl">
            {RANGES.map((r) => (
              <button
                key={r.value}
                onClick={() => setRange(r.value)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  range === r.value
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
          <button
            onClick={() => refetchOverview()}
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-border hover:bg-accent transition-colors"
            title="Refresh"
          >
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </button>
          <a
            href={analyticsService.getExportUrl(range)}
            download
            className="flex items-center gap-2 px-3 py-2 rounded-xl border border-border text-sm font-medium hover:bg-accent transition-colors"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </a>
        </div>
      </div>

      {/* Stat cards */}
      {overviewLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-36 rounded-2xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : (
        <motion.div
          layout
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4"
        >
          {statCards.map((card) => (
            <StatCard key={card.label} {...card} />
          ))}
        </motion.div>
      )}

      {/* Chart */}
      <div className="rounded-2xl bg-card border border-border p-5">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <h3 className="font-semibold text-sm">Traffic Over Time</h3>
          <div className="flex items-center gap-1 p-1 bg-accent rounded-lg">
            {(["both", "views", "visitors"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setChartMetric(m)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-all capitalize ${
                  chartMetric === m
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {m === "both" ? "Both" : m === "views" ? "Views" : "Visitors"}
              </button>
            ))}
          </div>
        </div>

        {/* Chart legend */}
        <div className="flex items-center gap-4 mb-3">
          {chartMetric !== "visitors" && (
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="w-3 h-0.5 rounded-full bg-brand-500 inline-block" />
              Page Views
            </span>
          )}
          {chartMetric !== "views" && (
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="w-3 h-0.5 rounded-full bg-cyan-500 inline-block" />
              Unique Visitors
            </span>
          )}
        </div>

        {chartLoading ? (
          <div className="h-52 rounded-xl bg-muted animate-pulse" />
        ) : chart && chartDatasets.length > 0 ? (
          <LineAreaChart labels={chart.labels} datasets={chartDatasets} height={220} />
        ) : (
          <div className="h-52 flex items-center justify-center text-sm text-muted-foreground">
            No data for this range
          </div>
        )}
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1">
          <TopPagesTable range={range} />
        </div>
        <div className="space-y-4">
          <DeviceBreakdown range={range} />
        </div>
        <div>
          <ReferrersList range={range} />
        </div>
      </div>
    </div>
  );
}

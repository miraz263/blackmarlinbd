import { motion } from "framer-motion";
import { Zap, Users, Award, TrendingUp, Star, Globe, BarChart3, Shield } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
  Zap, Users, Award, TrendingUp, Star, Globe, BarChart3, Shield,
};

interface StatItem { label: string; value: string; icon?: string; }

export function StatsBlock({ content }: { content: Record<string, unknown> }) {
  const heading = content.heading as string | undefined;
  const items   = (content.items as StatItem[] | undefined) ?? [];

  return (
    <div>
      {heading && <h2 className="text-3xl font-bold text-center mb-10">{heading}</h2>}
      <div className={`grid gap-6 ${items.length <= 3 ? "grid-cols-1 sm:grid-cols-3" : "grid-cols-2 sm:grid-cols-4"}`}>
        {items.map((item, i) => {
          const Icon = ICON_MAP[item.icon ?? ""] ?? Zap;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="flex flex-col items-center text-center p-6 rounded-2xl bg-card border border-border"
            >
              <div className="w-12 h-12 rounded-xl bg-brand-500/10 flex items-center justify-center mb-4">
                <Icon className="h-6 w-6 text-brand-400" />
              </div>
              <span className="text-4xl font-bold gradient-text">{item.value}</span>
              <span className="text-muted-foreground text-sm mt-1">{item.label}</span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

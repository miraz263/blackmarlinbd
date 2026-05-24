import { motion } from "framer-motion";
import { ArrowRight, Zap, Brain, BarChart3, Cloud, Globe, ShieldCheck, Server, Code, Database, Lock } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";

const ICON_MAP: Record<string, LucideIcon> = {
  Zap, Brain, BarChart3, Cloud, Globe, ShieldCheck, Server, Code, Database, Lock,
};
const GRADIENTS: Record<string, string> = {
  "purple-brand":  "from-purple-500 to-brand-500",
  "green-emerald": "from-green-500 to-emerald-500",
  "cyan-blue":     "from-cyan-500 to-blue-500",
  "orange-pink":   "from-orange-500 to-pink-500",
  "brand-cyan":    "from-brand-500 to-cyan-500",
};
const DEFAULT_GRADIENTS = Object.values(GRADIENTS);

interface ServiceItem { title: string; description: string; icon?: string; gradient?: string; href?: string; }

export function ServicesBlock({ content }: { content: Record<string, unknown> }) {
  const heading     = content.heading as string | undefined;
  const description = content.description as string | undefined;
  const items       = (content.items as ServiceItem[] | undefined) ?? [];

  return (
    <div>
      {(heading || description) && (
        <div className="text-center mb-12">
          {heading     && <h2 className="text-4xl font-bold mb-4">{heading}</h2>}
          {description && <p className="text-xl text-muted-foreground max-w-2xl mx-auto">{description}</p>}
        </div>
      )}
      {items.length === 0 ? (
        <div className="flex items-center justify-center h-32 rounded-2xl bg-muted border border-dashed border-border text-muted-foreground text-sm">
          No services added yet
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((svc, i) => {
            const Icon = ICON_MAP[svc.icon ?? ""] ?? Zap;
            const grad = GRADIENTS[svc.gradient ?? ""] ?? DEFAULT_GRADIENTS[i % DEFAULT_GRADIENTS.length];
            const card = (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="group p-6 rounded-2xl bg-card border border-border hover:border-brand-500/40 hover:shadow-xl transition-all"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${grad} flex items-center justify-center mb-4 shadow-lg`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-bold text-lg mb-2 group-hover:text-brand-400 transition-colors">{svc.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{svc.description}</p>
                {svc.href && (
                  <div className="flex items-center gap-1 mt-4 text-sm text-brand-400">
                    Learn more <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                )}
              </motion.div>
            );
            return svc.href
              ? <Link key={i} to={svc.href}>{card}</Link>
              : <div key={i}>{card}</div>;
          })}
        </div>
      )}
    </div>
  );
}

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Landmark,
  Heart,
  Building2,
  Cpu,
  Factory,
  ShoppingBag,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";

interface Industry {
  name: string;
  description: string;
  icon: LucideIcon;
  color: string;
  href: string;
}

const INDUSTRIES: Industry[] = [
  {
    name: "Banking & Financial Services",
    description:
      "Core banking, trading systems, and compliance platforms for modern financial institutions.",
    icon: Landmark,
    color: "#6366f1",
    href: "/services/banking",
  },
  {
    name: "Healthcare & Life Sciences",
    description:
      "Digital health records, telemedicine, and hospital operations software built for clinical scale.",
    icon: Heart,
    color: "#ef4444",
    href: "/services/healthcare",
  },
  {
    name: "Government & Public Services",
    description:
      "Secure, resilient citizen-service portals and public-sector data infrastructure.",
    icon: Building2,
    color: "#10b981",
    href: "/services/public-services",
  },
  {
    name: "High Tech & Software",
    description:
      "Engineering excellence for SaaS, developer tooling, and deep-tech product companies.",
    icon: Cpu,
    color: "#0ea5e9",
    href: "/services/high-tech",
  },
  {
    name: "Manufacturing",
    description:
      "Smart factory, supply chain digitisation, and AI-powered predictive maintenance solutions.",
    icon: Factory,
    color: "#f59e0b",
    href: "/services/manufacturing",
  },
  {
    name: "Retail & E-Commerce",
    description:
      "Omnichannel commerce engines, personalisation AI, and real-time inventory management.",
    icon: ShoppingBag,
    color: "#8b5cf6",
    href: "/services/retail",
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 36 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

function IndustryCard({ industry }: { industry: Industry }) {
  const Icon = industry.icon;

  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="group relative p-6 rounded-2xl bg-card border border-border hover:border-brand-500/40 transition-all duration-300"
    >
      {/* Hover glow */}
      <div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: `radial-gradient(ellipse at top left, ${industry.color}12 0%, transparent 70%)`,
        }}
      />

      <div className="relative">
        {/* Icon circle */}
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110"
          style={{ backgroundColor: `${industry.color}1a` }}
        >
          <Icon
            className="h-6 w-6"
            style={{ color: industry.color }}
            strokeWidth={1.8}
          />
        </div>

        {/* Name */}
        <h3 className="font-semibold text-base text-foreground mb-2 leading-snug">
          {industry.name}
        </h3>

        {/* Description */}
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          {industry.description}
        </p>

        {/* Learn more */}
        <Link
          to={industry.href}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-400 hover:text-brand-300 transition-colors group/link"
        >
          Learn more
          <ArrowRight className="h-3.5 w-3.5 group-hover/link:translate-x-1 transition-transform" />
        </Link>
      </div>
    </motion.div>
  );
}

export function Industries() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section className="py-24 relative" id="industries">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-background via-accent/30 to-background" />

      <div className="container mx-auto px-4">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-brand-500/10 text-brand-400 text-sm font-medium border border-brand-500/20 mb-4">
            Industries
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
            <span className="gradient-text">Built for Your Industry</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Deep domain expertise across the sectors where software quality is
            mission-critical — and downtime is not an option.
          </p>
        </motion.div>

        {/* 3×2 grid */}
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {INDUSTRIES.map((industry) => (
            <IndustryCard key={industry.href} industry={industry} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}

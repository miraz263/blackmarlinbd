import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Star, Quote } from "lucide-react";

interface Testimonial {
  client: string;
  industry: string;
  quote: string;
  person: string;
  metric: string;
  metricColor: string;
  accentColor: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    client: "Meridian Capital Group",
    industry: "Capital Markets",
    quote:
      "BlackMarlinBD reduced our order execution latency by 73% and cut settlement failures to near-zero. Their OMS is now the backbone of our trading desk.",
    person: "James Whitfield, CTO",
    metric: "73% faster execution",
    metricColor: "from-purple-500 to-brand-500",
    accentColor: "#6366f1",
  },
  {
    client: "Apollo Health Network",
    industry: "Healthcare",
    quote:
      "We deployed the Hospital ERP across 12 facilities in under 6 months. Patient wait times dropped 40% and our billing accuracy reached 99.2%.",
    person: "Dr. Sarah Chen, COO",
    metric: "40% reduction in wait times",
    metricColor: "from-red-500 to-rose-500",
    accentColor: "#ef4444",
  },
  {
    client: "NovaTech Manufacturing",
    industry: "High Tech",
    quote:
      "The AI predictive maintenance platform cut our unplanned downtime by 68%. ROI was positive in the first quarter of deployment.",
    person: "Ravi Sharma, VP Operations",
    metric: "68% less downtime",
    metricColor: "from-green-500 to-emerald-500",
    accentColor: "#10b981",
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.13 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } },
};

function StarRow() {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className="h-4 w-4 fill-amber-400 text-amber-400"
          strokeWidth={0}
        />
      ))}
    </div>
  );
}

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className="group relative p-7 rounded-2xl bg-card border border-border hover:border-brand-500/40 transition-all duration-300 flex flex-col"
    >
      {/* Hover glow */}
      <div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: `radial-gradient(ellipse at top right, ${testimonial.accentColor}10 0%, transparent 65%)`,
        }}
      />

      <div className="relative flex flex-col h-full">
        {/* Top row: stars + industry badge */}
        <div className="flex items-center justify-between mb-5">
          <StarRow />
          <span className="px-2.5 py-1 rounded-full bg-accent text-accent-foreground text-xs font-medium border border-border">
            {testimonial.industry}
          </span>
        </div>

        {/* Giant quote mark */}
        <div
          className="absolute top-14 right-6 opacity-[0.06]"
          aria-hidden="true"
        >
          <Quote className="h-20 w-20" strokeWidth={1} />
        </div>

        {/* Quote */}
        <blockquote className="text-sm text-foreground leading-relaxed mb-6 flex-1">
          &ldquo;{testimonial.quote}&rdquo;
        </blockquote>

        {/* Divider */}
        <div className="border-t border-border mb-5" />

        {/* Client info */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-foreground">
              {testimonial.client}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {testimonial.person}
            </p>
          </div>

          {/* Metric badge */}
          <span
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-bold text-white bg-gradient-to-r ${testimonial.metricColor} shadow-sm`}
          >
            {testimonial.metric}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

export function CustomerSuccess() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section className="py-24 relative" id="customer-success">
      {/* Background */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-background via-brand-950/5 to-background" />

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
            Customer Success
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
            <span className="gradient-text">Trusted by Industry Leaders</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Measurable outcomes from the organisations that depend on our
            platforms every day.
          </p>
        </motion.div>

        {/* Cards */}
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {TESTIMONIALS.map((t) => (
            <TestimonialCard key={t.client} testimonial={t} />
          ))}
        </motion.div>

        {/* Summary stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-14 grid grid-cols-2 sm:grid-cols-4 gap-4"
        >
          {[
            { value: "150+", label: "Enterprise Clients" },
            { value: "99.9%", label: "Platform Uptime" },
            { value: "40+", label: "Countries Served" },
            { value: "4.9/5", label: "Average Rating" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="text-center p-5 rounded-xl bg-card border border-border"
            >
              <p className="text-2xl font-bold gradient-text mb-1">
                {stat.value}
              </p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

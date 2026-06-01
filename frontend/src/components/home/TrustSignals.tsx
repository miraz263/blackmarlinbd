import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ShieldCheck, CheckCircle2, Clock, Calendar } from "lucide-react";

type CertStatus = "Active" | "In Progress" | "Planned";

interface Certification {
  name: string;
  description: string;
  status: CertStatus;
}

interface TechPartner {
  name: string;
}

const CERTIFICATIONS: Certification[] = [
  {
    name: "ISO 27001",
    description: "Information Security",
    status: "In Progress",
  },
  {
    name: "ISO 9001",
    description: "Quality Management",
    status: "Planned",
  },
  {
    name: "PCI DSS Level 1",
    description: "Payment Security",
    status: "Planned",
  },
  {
    name: "SOC 2 Type II",
    description: "Service Security",
    status: "Planned",
  },
  {
    name: "GDPR Compliant",
    description: "Data Privacy",
    status: "Active",
  },
  {
    name: "HIPAA Ready",
    description: "Healthcare Privacy",
    status: "Active",
  },
];

const TECH_PARTNERS: TechPartner[] = [
  { name: "AWS Partner" },
  { name: "Google Cloud Partner" },
  { name: "Microsoft Azure Partner" },
  { name: "Stripe Partner" },
  { name: "Twilio Partner" },
  { name: "MongoDB Partner" },
];

// Duplicate for seamless infinite marquee
const MARQUEE_PARTNERS = [...TECH_PARTNERS, ...TECH_PARTNERS];

const STATUS_CONFIG: Record<
  CertStatus,
  { label: string; classes: string; icon: typeof CheckCircle2; dotColor: string }
> = {
  Active: {
    label: "Active",
    classes:
      "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
    icon: CheckCircle2,
    dotColor: "bg-emerald-400",
  },
  "In Progress": {
    label: "In Progress",
    classes: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
    icon: Clock,
    dotColor: "bg-amber-400",
  },
  Planned: {
    label: "Planned",
    classes:
      "bg-slate-500/10 text-slate-400 border border-slate-500/20",
    icon: Calendar,
    dotColor: "bg-slate-400",
  },
};

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

function CertCard({ cert }: { cert: Certification }) {
  const cfg = STATUS_CONFIG[cert.status];
  return (
    <motion.div
      variants={cardVariants}
      className="group relative p-5 rounded-xl bg-card border border-border hover:border-brand-500/30 transition-all duration-300"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="font-semibold text-sm text-foreground mb-0.5">
            {cert.name}
          </h4>
          <p className="text-xs text-muted-foreground">{cert.description}</p>
        </div>

        {/* Status badge */}
        <span
          className={`shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.classes}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dotColor}`} />
          {cfg.label}
        </span>
      </div>
    </motion.div>
  );
}

export function TrustSignals() {
  const certRef = useRef<HTMLDivElement>(null);
  const isCertInView = useInView(certRef, { once: true, margin: "-80px" });

  return (
    <section className="py-24 relative overflow-hidden" id="trust-signals">
      {/* Background */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-background via-accent/20 to-background" />

      <div className="container mx-auto px-4">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-500/10 text-brand-400 text-sm font-medium border border-brand-500/20 mb-4">
            <ShieldCheck className="h-4 w-4" />
            Trust & Security
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
            <span className="gradient-text">Built to the Highest Standards</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Our compliance roadmap and technology partnerships reflect our
            commitment to enterprise-grade security and reliability.
          </p>
        </motion.div>

        {/* --- Sub-section 1: Security & Compliance --- */}
        <div className="mb-16">
          <motion.h3
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2"
          >
            <ShieldCheck className="h-5 w-5 text-brand-400" />
            Security &amp; Compliance
          </motion.h3>

          <motion.div
            ref={certRef}
            variants={containerVariants}
            initial="hidden"
            animate={isCertInView ? "visible" : "hidden"}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {CERTIFICATIONS.map((cert) => (
              <CertCard key={cert.name} cert={cert} />
            ))}
          </motion.div>

          {/* Status legend */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-5 flex flex-wrap gap-4 text-xs text-muted-foreground"
          >
            {(Object.entries(STATUS_CONFIG) as [CertStatus, typeof STATUS_CONFIG[CertStatus]][]).map(
              ([key, cfg]) => (
                <span key={key} className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${cfg.dotColor}`} />
                  {cfg.label}
                </span>
              )
            )}
          </motion.div>
        </div>

        {/* --- Sub-section 2: Technology Partners marquee --- */}
        <div>
          <motion.h3
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-xl font-semibold text-foreground mb-6"
          >
            Technology Partners
          </motion.h3>

          {/* Marquee wrapper — overflow hidden + gradient fade edges */}
          <div className="relative overflow-hidden">
            {/* Fade left */}
            <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
            {/* Fade right */}
            <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

            <motion.div
              animate={{ x: ["0%", "-50%"] }}
              transition={{
                duration: 22,
                repeat: Infinity,
                ease: "linear",
              }}
              className="flex gap-4 w-max"
            >
              {MARQUEE_PARTNERS.map((partner, index) => (
                <span
                  key={`${partner.name}-${index}`}
                  className="shrink-0 inline-flex items-center px-5 py-2.5 rounded-full bg-card border border-border text-sm font-semibold text-foreground hover:border-brand-500/40 hover:text-brand-400 transition-colors cursor-default"
                >
                  {partner.name}
                </span>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

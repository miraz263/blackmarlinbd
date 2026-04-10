import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Link } from "react-router-dom";
import {
  Brain, BarChart3, Cloud, Globe, ShieldCheck, ArrowRight
} from "lucide-react";

const services = [
  {
    icon: Brain,
    title: "AI & Machine Learning",
    description:
      "Custom LLM integrations, predictive analytics, computer vision, and NLP solutions that transform raw data into competitive advantage.",
    color: "from-purple-500 to-brand-500",
    shadow: "shadow-purple-500/20",
    href: "/services#ai-ml",
    tags: ["LLMs", "TensorFlow", "PyTorch", "MLOps"],
  },
  {
    icon: BarChart3,
    title: "Financial Systems",
    description:
      "High-frequency trading platforms, order management systems, risk engines, and real-time financial data pipelines built for sub-millisecond latency.",
    color: "from-green-500 to-emerald-500",
    shadow: "shadow-green-500/20",
    href: "/services#financial",
    tags: ["OMS", "FIX Protocol", "Risk Mgmt", "Quant"],
  },
  {
    icon: Cloud,
    title: "Cloud & DevOps",
    description:
      "Multi-cloud architecture, Kubernetes orchestration, GitOps pipelines, and SRE practices that guarantee 99.9% uptime at scale.",
    color: "from-cyan-500 to-blue-500",
    shadow: "shadow-cyan-500/20",
    href: "/services#cloud",
    tags: ["AWS", "GCP", "K8s", "Terraform"],
  },
  {
    icon: Globe,
    title: "Web & Mobile Apps",
    description:
      "React, Next.js, React Native, and Flutter applications with pixel-perfect design, blazing performance, and seamless user experiences.",
    color: "from-orange-500 to-pink-500",
    shadow: "shadow-orange-500/20",
    href: "/services#web-mobile",
    tags: ["React", "Next.js", "Flutter", "GraphQL"],
  },
  {
    icon: ShieldCheck,
    title: "Cybersecurity",
    description:
      "Penetration testing, zero-trust architecture, SOC setup, compliance frameworks (ISO 27001, SOC 2), and threat intelligence.",
    color: "from-red-500 to-rose-500",
    shadow: "shadow-red-500/20",
    href: "/services#security",
    tags: ["Pen Testing", "SIEM", "SOC 2", "Zero Trust"],
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export function Services() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="py-24 relative" id="services">
      {/* Background */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-background via-brand-950/5 to-background" />

      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-brand-500/10 text-brand-400 text-sm font-medium border border-brand-500/20 mb-4">
            What We Do
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
            End-to-End{" "}
            <span className="gradient-text">Technology Services</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            From AI research to production deployment, we engineer solutions that solve real
            business problems at enterprise scale.
          </p>
        </motion.div>

        {/* Cards */}
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <motion.div
                key={service.title}
                variants={cardVariants}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="group relative p-6 rounded-2xl bg-card border border-border hover:border-brand-500/50 transition-all duration-300"
              >
                {/* Gradient glow on hover */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-brand-500/0 to-cyan-500/0 group-hover:from-brand-500/5 group-hover:to-cyan-500/5 transition-all duration-300" />

                <div className={`relative w-12 h-12 rounded-xl bg-gradient-to-br ${service.color} flex items-center justify-center shadow-lg ${service.shadow} mb-4`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>

                <h3 className="relative font-semibold text-lg text-foreground mb-2">
                  {service.title}
                </h3>
                <p className="relative text-sm text-muted-foreground leading-relaxed mb-4">
                  {service.description}
                </p>

                {/* Tags */}
                <div className="relative flex flex-wrap gap-1.5 mb-4">
                  {service.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded-md bg-accent text-accent-foreground text-xs font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <Link
                  to={service.href}
                  className="relative inline-flex items-center gap-1 text-sm font-medium text-brand-400 hover:text-brand-300 transition-colors group/link"
                >
                  Learn more
                  <ArrowRight className="h-3.5 w-3.5 group-hover/link:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
            );
          })}

          {/* CTA Card */}
          <motion.div
            variants={cardVariants}
            className="relative p-6 rounded-2xl bg-gradient-to-br from-brand-500 to-cyan-500 text-white overflow-hidden"
          >
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMzAiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-50" />
            <div className="relative">
              <h3 className="font-bold text-xl mb-2">Need a custom solution?</h3>
              <p className="text-white/80 text-sm mb-6">
                Our architects will design a bespoke system tailored to your exact requirements.
              </p>
              <Link to="/contact">
                <button className="px-4 py-2 rounded-lg bg-white text-brand-600 font-semibold text-sm hover:bg-white/90 transition-colors inline-flex items-center gap-2">
                  Talk to an Expert
                  <ArrowRight className="h-4 w-4" />
                </button>
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

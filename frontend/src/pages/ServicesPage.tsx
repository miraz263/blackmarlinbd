import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { Brain, BarChart3, Cloud, Globe, ShieldCheck, Check, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const services = [
  {
    id: "ai-ml",
    icon: Brain,
    title: "AI & Machine Learning",
    tagline: "Intelligent Systems at Scale",
    color: "from-purple-500 to-brand-500",
    description:
      "We design and deploy production-grade AI systems — from custom LLM pipelines and RAG architectures to computer vision and predictive analytics. Our ML engineers have shipped models serving billions of inferences.",
    capabilities: [
      "Custom LLM fine-tuning & RAG systems",
      "Real-time inference infrastructure",
      "MLOps & model monitoring pipelines",
      "Computer vision & NLP solutions",
      "Recommendation & personalization engines",
      "AI-powered process automation",
    ],
    tech: ["Python", "PyTorch", "TensorFlow", "LangChain", "Kubernetes", "Ray"],
  },
  {
    id: "financial",
    icon: BarChart3,
    title: "Financial Systems",
    tagline: "Sub-millisecond. Zero-error.",
    color: "from-green-500 to-emerald-500",
    description:
      "We build the financial infrastructure that moves markets. Order management systems, high-frequency trading engines, risk platforms, and real-time data pipelines built with institutional-grade reliability.",
    capabilities: [
      "Order Management Systems (OMS/EMS)",
      "High-frequency trading infrastructure",
      "Real-time risk & P&L engines",
      "FIX protocol & market connectivity",
      "Regulatory reporting (MiFID II, EMIR)",
      "Quantitative analytics platforms",
    ],
    tech: ["Python", "C++", "Rust", "Kafka", "TimescaleDB", "FIX"],
  },
  {
    id: "cloud",
    icon: Cloud,
    title: "Cloud & DevOps",
    tagline: "99.99% Uptime, Engineered",
    color: "from-cyan-500 to-blue-500",
    description:
      "Multi-cloud architecture design, Kubernetes platform engineering, GitOps pipelines, and SRE practices that let your teams ship faster without sacrificing reliability.",
    capabilities: [
      "Multi-cloud architecture (AWS, GCP, Azure)",
      "Kubernetes platform engineering",
      "GitOps & CI/CD pipelines",
      "Infrastructure as Code (Terraform/Pulumi)",
      "SRE & observability stack",
      "FinOps & cost optimization",
    ],
    tech: ["AWS", "GCP", "Kubernetes", "Terraform", "ArgoCD", "Prometheus"],
  },
  {
    id: "web-mobile",
    icon: Globe,
    title: "Web & Mobile Apps",
    tagline: "Pixel-perfect. Blazing fast.",
    color: "from-orange-500 to-pink-500",
    description:
      "Full-stack web and mobile applications built with React, Next.js, Flutter, and React Native. From consumer apps handling millions of users to enterprise portals with complex workflows.",
    capabilities: [
      "React & Next.js web applications",
      "React Native & Flutter mobile apps",
      "GraphQL & REST API design",
      "Performance optimization & Core Web Vitals",
      "Accessibility (WCAG 2.1 AA)",
      "Progressive Web Apps (PWA)",
    ],
    tech: ["React", "Next.js", "Flutter", "TypeScript", "GraphQL", "Tailwind"],
  },
  {
    id: "security",
    icon: ShieldCheck,
    title: "Cybersecurity",
    tagline: "Secure by Design",
    color: "from-red-500 to-rose-500",
    description:
      "Comprehensive security engineering — from penetration testing and threat modelling to zero-trust architecture and compliance readiness for SOC 2, ISO 27001, and PCI DSS.",
    capabilities: [
      "Penetration testing & red team exercises",
      "Zero-trust architecture design",
      "SOC 2 & ISO 27001 compliance",
      "Security code review & audits",
      "SIEM & threat detection setup",
      "Incident response planning",
    ],
    tech: ["OWASP", "Burp Suite", "Snyk", "Vault", "SIEM", "WAF"],
  },
];

export default function ServicesPage() {
  return (
    <>
      <Helmet>
        <title>Services — BlackMarlinBD</title>
        <meta name="description" content="Enterprise IT services: AI, financial systems, cloud, web/mobile, and cybersecurity." />
      </Helmet>

      <main className="pt-28 pb-24">
        <div className="container mx-auto px-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-20"
          >
            <h1 className="text-5xl sm:text-6xl font-bold mb-6">
              Technology <span className="gradient-text">Services</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              End-to-end engineering services — from strategy to production deployment.
            </p>
          </motion.div>

          {/* Service sections */}
          <div className="space-y-32">
            {services.map((service, i) => {
              const Icon = service.icon;
              const isEven = i % 2 === 0;
              return (
                <motion.section
                  key={service.id}
                  id={service.id}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${!isEven ? "lg:[&>*:first-child]:order-2" : ""}`}
                >
                  {/* Content */}
                  <div>
                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r ${service.color} mb-4`}>
                      <Icon className="h-4 w-4 text-white" />
                      <span className="text-white text-sm font-medium">{service.tagline}</span>
                    </div>
                    <h2 className="text-4xl font-bold mb-4">{service.title}</h2>
                    <p className="text-muted-foreground leading-relaxed mb-6">{service.description}</p>

                    <ul className="space-y-2 mb-6">
                      {service.capabilities.map((cap) => (
                        <li key={cap} className="flex items-center gap-2 text-sm">
                          <Check className="h-4 w-4 text-brand-400 flex-shrink-0" />
                          {cap}
                        </li>
                      ))}
                    </ul>

                    <div className="flex flex-wrap gap-2 mb-8">
                      {service.tech.map((t) => (
                        <span key={t} className="px-2.5 py-1 rounded-lg bg-accent text-accent-foreground text-xs font-medium">
                          {t}
                        </span>
                      ))}
                    </div>

                    <Link to="/contact">
                      <Button variant="gradient" className="group">
                        Discuss Your Project
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </div>

                  {/* Visual */}
                  <div className={`relative rounded-3xl bg-gradient-to-br ${service.color} p-1 shadow-2xl`}>
                    <div className="rounded-[22px] bg-card p-8 h-80 flex items-center justify-center">
                      <Icon className="h-24 w-24 text-muted-foreground/30" strokeWidth={1} />
                    </div>
                    {/* Floating badge */}
                    <div className="absolute -bottom-4 -right-4 px-4 py-2 rounded-xl glass dark:glass-dark border border-border shadow-xl text-sm font-medium">
                      {service.tech[0]} Expert Team
                    </div>
                  </div>
                </motion.section>
              );
            })}
          </div>
        </div>
      </main>
    </>
  );
}

import { motion } from "framer-motion";

const technologies = [
  { name: "Python", logo: "🐍" },
  { name: "Django", logo: "🎸" },
  { name: "React", logo: "⚛️" },
  { name: "TypeScript", logo: "📘" },
  { name: "PostgreSQL", logo: "🐘" },
  { name: "Redis", logo: "🔴" },
  { name: "Docker", logo: "🐳" },
  { name: "Kubernetes", logo: "☸️" },
  { name: "AWS", logo: "☁️" },
  { name: "TensorFlow", logo: "🧠" },
  { name: "PyTorch", logo: "🔥" },
  { name: "Go", logo: "🦫" },
  { name: "Rust", logo: "⚙️" },
  { name: "GraphQL", logo: "◈" },
  { name: "Terraform", logo: "🏗️" },
  { name: "Kafka", logo: "📨" },
];

export function TechStack() {
  return (
    <section className="py-16 border-y border-border bg-accent/30">
      <div className="container mx-auto px-4">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-sm font-medium text-muted-foreground mb-8"
        >
          BUILT WITH INDUSTRY-LEADING TECHNOLOGIES
        </motion.p>

        {/* Scrolling marquee */}
        <div className="relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-background to-transparent z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-background to-transparent z-10" />

          <motion.div
            animate={{ x: ["0%", "-50%"] }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            className="flex gap-8 w-max"
          >
            {[...technologies, ...technologies].map((tech, i) => (
              <div
                key={i}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-background border border-border text-sm font-medium text-muted-foreground whitespace-nowrap hover:text-foreground hover:border-brand-500/50 transition-colors"
              >
                <span className="text-lg">{tech.logo}</span>
                {tech.name}
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

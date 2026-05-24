import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { homepageQueryOptions } from "@/services/homepageService";
import type { TechItem } from "@/types";

const FALLBACK_TECHNOLOGIES: TechItem[] = [
  { id: -1,  name: "Python",     logo: "🐍", order: 0,  is_published: true },
  { id: -2,  name: "Django",     logo: "🎸", order: 1,  is_published: true },
  { id: -3,  name: "React",      logo: "⚛️", order: 2,  is_published: true },
  { id: -4,  name: "TypeScript", logo: "📘", order: 3,  is_published: true },
  { id: -5,  name: "PostgreSQL", logo: "🐘", order: 4,  is_published: true },
  { id: -6,  name: "Redis",      logo: "🔴", order: 5,  is_published: true },
  { id: -7,  name: "Docker",     logo: "🐳", order: 6,  is_published: true },
  { id: -8,  name: "Kubernetes", logo: "☸️", order: 7,  is_published: true },
  { id: -9,  name: "AWS",        logo: "☁️", order: 8,  is_published: true },
  { id: -10, name: "TensorFlow", logo: "🧠", order: 9,  is_published: true },
  { id: -11, name: "PyTorch",    logo: "🔥", order: 10, is_published: true },
  { id: -12, name: "Go",         logo: "🦫", order: 11, is_published: true },
  { id: -13, name: "Rust",       logo: "⚙️", order: 12, is_published: true },
  { id: -14, name: "GraphQL",    logo: "◈",  order: 13, is_published: true },
  { id: -15, name: "Terraform",  logo: "🏗️", order: 14, is_published: true },
  { id: -16, name: "Kafka",      logo: "📨", order: 15, is_published: true },
];

export function TechStack() {
  const { data } = useQuery(homepageQueryOptions);

  const section = data?.sections?.tech_stack;
  const items = data?.tech_items?.length ? data.tech_items : FALLBACK_TECHNOLOGIES;

  if (section && !section.is_visible) return null;

  const heading = section?.title
    ? section.title.toUpperCase()
    : "BUILT WITH INDUSTRY-LEADING TECHNOLOGIES";

  return (
    <section className="py-16 border-y border-border bg-accent/30">
      <div className="container mx-auto px-4">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-sm font-medium text-muted-foreground mb-8"
        >
          {heading}
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
            {[...items, ...items].map((tech, i) => (
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

import { motion } from "framer-motion";
import { SEOHead } from "@/components/seo/SEOHead";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Users, Globe2, Award, Code2, Mail,
  Zap, Shield, Heart, Lightbulb, Star, Target, Rocket, type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { aboutQueryOptions } from "@/services/aboutService";
import type { CoreValue, TeamMember } from "@/types";

// ─── Icon maps ─────────────────────────────────────────────────────────────

const VALUE_ICON_MAP: Record<string, LucideIcon> = {
  Zap, Shield, Heart, Lightbulb, Star, Target, Rocket, Code2, Award, Globe2, Users,
};

// ─── Fallback data ─────────────────────────────────────────────────────────

const FALLBACK_VALUES: CoreValue[] = [
  { id: -1, title: "Engineering Excellence", icon_name: "Code2", order: 0, is_published: true,
    description: "We write clean, tested, and maintainable code that stands the test of time." },
  { id: -2, title: "Client Obsession", icon_name: "Heart", order: 1, is_published: true,
    description: "Every decision we make starts with the question: how does this serve our client?" },
  { id: -3, title: "Radical Transparency", icon_name: "Shield", order: 2, is_published: true,
    description: "No surprises, no hidden fees. We communicate openly at every stage." },
  { id: -4, title: "Continuous Innovation", icon_name: "Lightbulb", order: 3, is_published: true,
    description: "We invest 20% of our time in R&D to stay ahead of what's next." },
];

const FALLBACK_TEAM: TeamMember[] = [
  { id: -1, name: "Arif Rahman",    designation: "CEO & Co-Founder",    photo_url: null, bio: "", linkedin: "", github: "", email: "", display_order: 0, is_published: true },
  { id: -2, name: "Sarah Chen",     designation: "CTO",                  photo_url: null, bio: "", linkedin: "", github: "", email: "", display_order: 1, is_published: true },
  { id: -3, name: "Marcus Johnson", designation: "Head of AI",           photo_url: null, bio: "", linkedin: "", github: "", email: "", display_order: 2, is_published: true },
  { id: -4, name: "Priya Patel",    designation: "Head of Engineering",  photo_url: null, bio: "", linkedin: "", github: "", email: "", display_order: 3, is_published: true },
];

const AVATAR_GRADIENTS = [
  "from-purple-500 to-brand-500",
  "from-cyan-500 to-blue-500",
  "from-green-500 to-emerald-500",
  "from-orange-500 to-red-500",
];

const STATS = [
  { icon: Code2,  value: "1M+",  label: "Lines of Production Code" },
  { icon: Globe2, value: "25+",  label: "Countries Served" },
  { icon: Users,  value: "120+", label: "Engineers Worldwide" },
  { icon: Award,  value: "15+",  label: "Industry Awards" },
];

// ─── Sub-components ────────────────────────────────────────────────────────

function TeamCard({ member, index }: { member: TeamMember; index: number }) {
  const initials = member.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2);

  const gradientClass = AVATAR_GRADIENTS[index % AVATAR_GRADIENTS.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08 }}
      className="group flex flex-col items-center text-center"
    >
      {/* Photo or gradient avatar */}
      {member.photo_url ? (
        <img
          src={member.photo_url}
          alt={member.name}
          className="w-24 h-24 rounded-2xl object-cover mb-4 ring-2 ring-border group-hover:ring-brand-500/50 transition-all"
        />
      ) : (
        <div
          className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${gradientClass} flex items-center justify-center text-white text-2xl font-bold mb-4 group-hover:scale-105 transition-transform`}
        >
          {initials}
        </div>
      )}

      <div className="font-semibold text-foreground">{member.name}</div>
      <div className="text-sm text-muted-foreground mb-3">{member.designation}</div>

      {member.bio && (
        <p className="text-xs text-muted-foreground leading-relaxed max-w-[160px] mb-3 line-clamp-3">
          {member.bio}
        </p>
      )}

      {/* Social links */}
      {(member.linkedin || member.github || member.email) && (
        <div className="flex items-center gap-2">
          {member.linkedin && (
            <a
              href={member.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-brand-400 transition-colors"
              aria-label={`${member.name} LinkedIn`}
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
            </a>
          )}
          {member.github && (
            <a
              href={member.github}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label={`${member.name} GitHub`}
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
              </svg>
            </a>
          )}
          {member.email && (
            <a
              href={`mailto:${member.email}`}
              className="text-muted-foreground hover:text-brand-400 transition-colors"
              aria-label={`Email ${member.name}`}
            >
              <Mail className="h-4 w-4" />
            </a>
          )}
        </div>
      )}
    </motion.div>
  );
}

function ValueCard({ value, index }: { value: CoreValue; index: number }) {
  const Icon = VALUE_ICON_MAP[value.icon_name] ?? Zap;
  return (
    <motion.div
      initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className="p-6 rounded-2xl bg-card border border-border hover:border-brand-500/30 transition-colors"
    >
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-cyan-500 flex items-center justify-center mb-4">
        <Icon className="h-5 w-5 text-white" />
      </div>
      <h3 className="font-semibold text-lg mb-2">{value.title}</h3>
      <p className="text-muted-foreground text-sm leading-relaxed">{value.description}</p>
    </motion.div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────

export default function AboutPage() {
  const { data } = useQuery(aboutQueryOptions);

  const page    = data?.page;
  const mission = data?.mission;
  const vision  = data?.vision;
  const values  = data?.values?.length  ? data.values : FALLBACK_VALUES;
  const team    = data?.team?.length    ? data.team   : FALLBACK_TEAM;

  return (
    <>
      <SEOHead
        pageKey="about"
        fallback={{
          title: "About Us — BlackMarlinBD",
          description: "Learn about BlackMarlinBD's mission, team, and values.",
        }}
      />

      <main className="pt-20">

        {/* ── Hero ─────────────────────────────────────────────────────── */}
        <section className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 -z-10 bg-gradient-to-br from-brand-950/30 via-background to-background" />
          <div className="container mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-block px-4 py-1.5 rounded-full bg-brand-500/10 text-brand-400 text-sm font-medium border border-brand-500/20 mb-6">
                {page?.badge_text ?? "Our Story"}
              </span>
              <h1 className="text-5xl sm:text-6xl font-bold mb-6">
                <span className="gradient-text">
                  {page?.hero_title ?? "Engineering the Digital Future"}
                </span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                {page?.hero_description ??
                  "Founded in 2018, BlackMarlinBD started as a three-person team in Dhaka with a single mission: build world-class technology for global enterprises."}
              </p>
            </motion.div>
          </div>
        </section>

        {/* ── Stats ────────────────────────────────────────────────────── */}
        <section className="py-16 border-y border-border bg-accent/20">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {STATS.map(({ icon: Icon, value, label }, i) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="text-center"
                >
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-brand-500/10 mb-3">
                    <Icon className="h-6 w-6 text-brand-400" />
                  </div>
                  <div className="text-3xl font-bold gradient-text mb-1">{value}</div>
                  <div className="text-sm text-muted-foreground">{label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Mission & Vision ─────────────────────────────────────────── */}
        <section className="py-24">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* Mission */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="p-8 rounded-2xl bg-gradient-to-br from-brand-500/10 to-cyan-500/10 border border-brand-500/20"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-cyan-500 flex items-center justify-center mb-5">
                  <Target className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-xl font-bold mb-3">
                  {mission?.title ?? "Our Mission"}
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  {mission?.description ??
                    "To build world-class technology that empowers global enterprises to innovate faster, operate smarter, and compete on the world stage."}
                </p>
              </motion.div>

              {/* Vision */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="p-8 rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-5">
                  <Rocket className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-xl font-bold mb-3">
                  {vision?.title ?? "Our Vision"}
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  {vision?.description ??
                    "To become the most trusted engineering partner for the world's most ambitious organisations — from startups to Fortune 500 leaders."}
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ── Core Values ──────────────────────────────────────────────── */}
        <section className="py-24 bg-accent/20">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold mb-4">
                Our <span className="gradient-text">Core Values</span>
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                These aren't just words on a wall — they're the principles that guide every
                line of code we write.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {values.map((v, i) => (
                <ValueCard key={v.id} value={v} index={i} />
              ))}
            </div>
          </div>
        </section>

        {/* ── Team ─────────────────────────────────────────────────────── */}
        <section className="py-24">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold mb-4">
                Leadership <span className="gradient-text">Team</span>
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                The people behind the engineering.
              </p>
            </motion.div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-8 max-w-5xl mx-auto">
              {team.map((member, i) => (
                <TeamCard key={member.id} member={member} index={i} />
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ──────────────────────────────────────────────────────── */}
        <section className="py-24 text-center border-t border-border">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold mb-4">Want to join our team?</h2>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                We're always looking for exceptional engineers who love building things that matter.
              </p>
              <Link to="/careers">
                <Button variant="gradient" size="lg">View Open Positions</Button>
              </Link>
            </motion.div>
          </div>
        </section>

      </main>
    </>
  );
}

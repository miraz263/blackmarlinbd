import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { MapPin, Clock, Briefcase, ChevronDown, ChevronUp } from "lucide-react";
import { jobsApi } from "@/services/api/jobs";
import { Button } from "@/components/ui/button";
import type { Job } from "@/types";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils";

const typeLabels: Record<string, string> = {
  full_time: "Full Time",
  part_time: "Part Time",
  contract: "Contract",
  internship: "Internship",
  remote: "Remote",
};

const expLabels: Record<string, string> = {
  junior: "Junior (0–2 yrs)",
  mid: "Mid (3–5 yrs)",
  senior: "Senior (5+ yrs)",
  lead: "Lead / Principal",
};

function JobCard({ job }: { job: Job }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      layout
      className="rounded-2xl bg-card border border-border overflow-hidden"
    >
      <button
        onClick={() => setExpanded((e) => !e)}
        className="w-full p-6 text-left flex items-start justify-between gap-4 hover:bg-accent/50 transition-colors"
      >
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            {job.is_featured && (
              <span className="px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-400 text-xs font-medium">
                Featured
              </span>
            )}
            <span className="px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 text-xs font-medium">
              {job.status === "open" ? "Now Hiring" : "Closed"}
            </span>
          </div>
          <h3 className="font-semibold text-lg mb-1">{job.title}</h3>
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Briefcase className="h-3.5 w-3.5" />
              {job.department}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {job.location}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {typeLabels[job.type]}
            </span>
            <span>{expLabels[job.experience]}</span>
            {job.salary_min && job.salary_max && (
              <span className="font-medium text-foreground">
                {job.salary_currency} {job.salary_min.toLocaleString()} – {job.salary_max.toLocaleString()}
              </span>
            )}
          </div>
        </div>
        {expanded ? <ChevronUp className="h-5 w-5 text-muted-foreground flex-shrink-0" /> : <ChevronDown className="h-5 w-5 text-muted-foreground flex-shrink-0" />}
      </button>

      {expanded && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="px-6 pb-6 border-t border-border"
        >
          <div className="pt-4 space-y-4">
            <div>
              <h4 className="font-medium mb-2">About the Role</h4>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{job.description}</p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Requirements</h4>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{job.requirements}</p>
            </div>
            {job.skills.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((s) => (
                    <span key={s} className="px-2 py-1 rounded-lg bg-accent text-accent-foreground text-xs font-medium">{s}</span>
                  ))}
                </div>
              </div>
            )}
            {job.deadline && (
              <p className="text-xs text-muted-foreground">Apply by: {formatDate(job.deadline)}</p>
            )}
            <div className="pt-2">
              <Button variant="gradient" size="sm" onClick={() => window.location.href = `/careers/${job.id}/apply`}>
                Apply Now
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

export default function CareersPage() {
  const [typeFilter, setTypeFilter] = useState("all");

  const { data, isLoading } = useQuery({
    queryKey: ["jobs", typeFilter],
    queryFn: () =>
      jobsApi
        .list({ ...(typeFilter !== "all" && { type: typeFilter }) })
        .then((r) => r.data),
  });

  const perks = [
    { emoji: "🏥", title: "Full Health Coverage", desc: "Medical, dental, and vision for you and your family." },
    { emoji: "🌍", title: "Remote-First Culture", desc: "Work from anywhere in the world." },
    { emoji: "📚", title: "$3k Learning Budget", desc: "Annual budget for courses, books, and conferences." },
    { emoji: "🏖️", title: "Unlimited PTO", desc: "We trust you to manage your time." },
    { emoji: "💰", title: "Equity Participation", desc: "Share in the company's success." },
    { emoji: "⚡", title: "Top-Tier Equipment", desc: "MacBook Pro, 4K monitors, and peripherals." },
  ];

  return (
    <>
      <Helmet>
        <title>Careers — BlackMarlinBD</title>
        <meta name="description" content="Join BlackMarlinBD and build the future of technology." />
      </Helmet>

      <main className="pt-28 pb-24">
        <div className="container mx-auto px-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h1 className="text-5xl font-bold mb-4">
              Join Our <span className="gradient-text">Mission</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              We're building one of the world's premier engineering teams. Come solve hard
              problems with brilliant people.
            </p>
          </motion.div>

          {/* Perks */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-16">
            {perks.map((perk, i) => (
              <motion.div
                key={perk.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="p-4 rounded-xl bg-card border border-border"
              >
                <div className="text-2xl mb-2">{perk.emoji}</div>
                <div className="font-medium text-sm mb-1">{perk.title}</div>
                <div className="text-xs text-muted-foreground">{perk.desc}</div>
              </motion.div>
            ))}
          </div>

          {/* Filters */}
          <div className="flex gap-2 mb-6 flex-wrap">
            {["all", "full_time", "part_time", "contract", "remote", "internship"].map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize",
                  typeFilter === t
                    ? "bg-brand-500 text-white"
                    : "bg-card border border-border text-muted-foreground hover:text-foreground"
                )}
              >
                {t === "all" ? "All Positions" : typeLabels[t]}
              </button>
            ))}
          </div>

          {/* Job listings */}
          <div className="space-y-4">
            {isLoading
              ? [...Array(4)].map((_, i) => (
                  <div key={i} className="h-24 rounded-2xl bg-card border border-border animate-pulse" />
                ))
              : data?.results.map((job: Job) => (
                  <JobCard key={job.id} job={job} />
                ))}
            {!isLoading && data?.results.length === 0 && (
              <div className="text-center py-16 text-muted-foreground">
                No open positions in this category right now. Check back soon!
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}

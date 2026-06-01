import { useState } from "react";
import { SEOHead } from "@/components/seo/SEOHead";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { MapPin, Clock, Briefcase, ChevronDown, ChevronUp } from "lucide-react";
import { jobsApi } from "@/services/api/jobs";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/useTranslation";
import type { Job } from "@/types";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils";

const TYPE_KEYS: Record<string, string> = {
  full_time: "careers.type_full_time",
  part_time: "careers.type_part_time",
  contract:  "careers.type_contract",
  internship:"careers.type_internship",
  remote:    "careers.type_remote",
};

const EXP_KEYS: Record<string, string> = {
  junior: "careers.exp_junior",
  mid:    "careers.exp_mid",
  senior: "careers.exp_senior",
  lead:   "careers.exp_lead",
};

function JobCard({ job }: { job: Job }) {
  const { t } = useTranslation();
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
              {job.status === "open" ? t("careers.now_hiring") : t("careers.closed")}
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
              {t(TYPE_KEYS[job.type] ?? "careers.type_full_time")}
            </span>
            <span>{t(EXP_KEYS[job.experience] ?? "careers.exp_junior")}</span>
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
              <h4 className="font-medium mb-2">{t("careers.about_role")}</h4>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{job.description}</p>
            </div>
            <div>
              <h4 className="font-medium mb-2">{t("careers.requirements")}</h4>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{job.requirements}</p>
            </div>
            {job.skills.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">{t("careers.skills")}</h4>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((s) => (
                    <span key={s} className="px-2 py-1 rounded-lg bg-accent text-accent-foreground text-xs font-medium">{s}</span>
                  ))}
                </div>
              </div>
            )}
            {job.deadline && (
              <p className="text-xs text-muted-foreground">{t("careers.apply_by")} {formatDate(job.deadline)}</p>
            )}
            <div className="pt-2">
              <Button variant="gradient" size="sm" onClick={() => window.location.href = `/careers/${job.id}/apply`}>
                {t("careers.apply_now")}
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

export default function CareersPage() {
  const { t } = useTranslation();
  const [typeFilter, setTypeFilter] = useState("all");

  const { data, isLoading } = useQuery({
    queryKey: ["jobs", typeFilter],
    queryFn: () =>
      jobsApi
        .list({ ...(typeFilter !== "all" && { type: typeFilter }) })
        .then((r) => r.data),
  });

  const perks = [
    { emoji: "🏥", titleKey: "careers.perk_health_title",    descKey: "careers.perk_health_desc" },
    { emoji: "🌍", titleKey: "careers.perk_remote_title",    descKey: "careers.perk_remote_desc" },
    { emoji: "📚", titleKey: "careers.perk_learning_title",  descKey: "careers.perk_learning_desc" },
    { emoji: "🏖️", titleKey: "careers.perk_pto_title",       descKey: "careers.perk_pto_desc" },
    { emoji: "💰", titleKey: "careers.perk_equity_title",    descKey: "careers.perk_equity_desc" },
    { emoji: "⚡", titleKey: "careers.perk_equipment_title", descKey: "careers.perk_equipment_desc" },
  ];

  return (
    <>
      <SEOHead
        pageKey="careers"
        fallback={{
          title: "Careers — BlackMarlinBD",
          description: "Join BlackMarlinBD and build the future of technology.",
        }}
      />

      <main className="pt-28 pb-24">
        <div className="container mx-auto px-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h1 className="text-5xl font-bold mb-4">
              <span className="gradient-text">{t("careers.page_title")}</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              {t("careers.page_subtitle")}
            </p>
          </motion.div>

          {/* Perks */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-16">
            {perks.map((perk, i) => (
              <motion.div
                key={perk.titleKey}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="p-4 rounded-xl bg-card border border-border"
              >
                <div className="text-2xl mb-2">{perk.emoji}</div>
                <div className="font-medium text-sm mb-1">{t(perk.titleKey)}</div>
                <div className="text-xs text-muted-foreground">{t(perk.descKey)}</div>
              </motion.div>
            ))}
          </div>

          {/* Filters */}
          <div className="flex gap-2 mb-6 flex-wrap">
            {["all", "full_time", "part_time", "contract", "remote", "internship"].map((typeKey) => (
              <button
                key={typeKey}
                onClick={() => setTypeFilter(typeKey)}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                  typeFilter === typeKey
                    ? "bg-brand-500 text-white"
                    : "bg-card border border-border text-muted-foreground hover:text-foreground"
                )}
              >
                {typeKey === "all" ? t("careers.all_positions") : t(TYPE_KEYS[typeKey] ?? "careers.type_full_time")}
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
                {t("careers.no_positions")}
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}

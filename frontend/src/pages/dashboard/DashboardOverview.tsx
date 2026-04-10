import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { FolderKanban, FileText, Briefcase, Users, TrendingUp, Eye } from "lucide-react";
import { projectsApi } from "@/services/api/projects";
import { blogApi } from "@/services/api/blog";
import { jobsApi } from "@/services/api/jobs";

const statCard = (title: string, value: string | number, icon: React.ElementType, color: string) => ({
  title, value, icon, color,
});

export default function DashboardOverview() {
  const { data: projects } = useQuery({
    queryKey: ["admin-projects"],
    queryFn: () => projectsApi.list({ page_size: 1 }).then((r) => r.data),
  });
  const { data: blog } = useQuery({
    queryKey: ["admin-blog"],
    queryFn: () => blogApi.list({ page_size: 1 }).then((r) => r.data),
  });
  const { data: jobs } = useQuery({
    queryKey: ["admin-jobs"],
    queryFn: () => jobsApi.list({ page_size: 1 }).then((r) => r.data),
  });

  const stats = [
    statCard("Total Projects", projects?.count ?? "—", FolderKanban, "from-purple-500 to-brand-500"),
    statCard("Blog Posts", blog?.count ?? "—", FileText, "from-cyan-500 to-blue-500"),
    statCard("Open Jobs", jobs?.count ?? "—", Briefcase, "from-green-500 to-emerald-500"),
    statCard("This Month Views", "12.4k", Eye, "from-orange-500 to-red-500"),
  ];

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-1">Good morning! 👋</h2>
        <p className="text-muted-foreground text-sm">Here's what's happening with BlackMarlinBD.</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="p-5 rounded-2xl bg-card border border-border"
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3`}>
                <Icon className="h-5 w-5 text-white" />
              </div>
              <div className="text-2xl font-bold mb-0.5">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.title}</div>
            </motion.div>
          );
        })}
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-card border border-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Recent Projects</h3>
            <a href="/dashboard/projects" className="text-sm text-brand-400 hover:text-brand-300">View all →</a>
          </div>
          <div className="space-y-3">
            {projects?.results.slice(0, 4).map((p) => (
              <div key={p.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <span className="text-sm font-medium truncate">{p.title}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${p.status === "published" ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"}`}>
                  {p.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-card border border-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Recent Blog Posts</h3>
            <a href="/dashboard/blog" className="text-sm text-brand-400 hover:text-brand-300">View all →</a>
          </div>
          <div className="space-y-3">
            {blog?.results.slice(0, 4).map((p) => (
              <div key={p.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <span className="text-sm font-medium truncate">{p.title}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${p.status === "published" ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"}`}>
                  {p.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

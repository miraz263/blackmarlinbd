import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Pencil, Trash2, Eye, EyeOff, Layers, ExternalLink } from "lucide-react";
import { pageBuilderService, pbKeys } from "@/services/pageBuilderService";
import type { BuilderPageListItem } from "@/types";

function CreatePageModal({ onClose }: { onClose: () => void }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const qc = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => pageBuilderService.createPage({ title: title.trim(), description }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: pbKeys.list() });
      onClose();
    },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="bg-card border border-border rounded-2xl p-6 w-full max-w-md shadow-2xl"
      >
        <h2 className="font-bold text-lg mb-5">New Page</h2>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest block mb-1.5">
              Title
            </label>
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && title.trim() && mutation.mutate()}
              placeholder="e.g. Landing Page"
              className="w-full px-3 py-2.5 rounded-xl bg-background border border-border text-sm outline-none focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/20"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest block mb-1.5">
              Description <span className="font-normal normal-case">(optional)</span>
            </label>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short description"
              className="w-full px-3 py-2.5 rounded-xl bg-background border border-border text-sm outline-none focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/20"
            />
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 rounded-xl border border-border text-sm font-medium hover:bg-accent transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => mutation.mutate()}
            disabled={!title.trim() || mutation.isPending}
            className="flex-1 px-4 py-2 rounded-xl bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 disabled:opacity-50 transition-colors"
          >
            {mutation.isPending ? "Creating…" : "Create Page"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function PageCard({ page, onDelete }: { page: BuilderPageListItem; onDelete: () => void }) {
  const qc = useQueryClient();

  const togglePublish = useMutation({
    mutationFn: () =>
      pageBuilderService.updatePage(page.slug, { is_published: !page.is_published }),
    onSuccess: () => qc.invalidateQueries({ queryKey: pbKeys.list() }),
  });

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      className="flex items-center gap-4 p-5 rounded-2xl bg-card border border-border hover:border-brand-500/30 transition-all group"
    >
      <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center flex-shrink-0">
        <Layers className="h-5 w-5 text-brand-400" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-foreground truncate">{page.title}</h3>
          {page.is_published ? (
            <span className="px-2 py-0.5 rounded-full text-xs bg-green-500/10 text-green-500 font-medium">Live</span>
          ) : (
            <span className="px-2 py-0.5 rounded-full text-xs bg-accent text-muted-foreground">Draft</span>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">
          /p/{page.slug} · {page.section_count} section{page.section_count !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {page.is_published && (
          <a
            href={`/p/${page.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground"
            title="View live"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        )}
        <button
          onClick={() => togglePublish.mutate()}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground"
          title={page.is_published ? "Unpublish" : "Publish"}
        >
          {page.is_published ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
        </button>
        <Link
          to={`/dashboard/pages/${page.slug}/edit`}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground"
          title="Edit"
        >
          <Pencil className="h-3.5 w-3.5" />
        </Link>
        <button
          onClick={onDelete}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-500"
          title="Delete"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </motion.div>
  );
}

export default function PagesPage() {
  const qc = useQueryClient();
  const [showCreate, setShowCreate]   = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<BuilderPageListItem | null>(null);

  const { data: pages = [], isLoading } = useQuery({
    queryKey: pbKeys.list(),
    queryFn:  () => pageBuilderService.listPages().then((r) => r.data.results),
    staleTime: 60 * 1000,
  });

  const deleteMutation = useMutation({
    mutationFn: (slug: string) => pageBuilderService.deletePage(slug),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: pbKeys.list() });
      setDeleteTarget(null);
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Pages</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {pages.length} page{pages.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 transition-colors"
        >
          <Plus className="h-4 w-4" /> New Page
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-20 rounded-2xl bg-muted animate-pulse" />)}
        </div>
      ) : pages.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-2xl bg-accent flex items-center justify-center mb-4">
            <Layers className="h-8 w-8 text-muted-foreground opacity-50" />
          </div>
          <p className="text-lg font-medium">No pages yet</p>
          <p className="text-sm text-muted-foreground mt-1 mb-6">Create your first page to get started.</p>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-500 text-white text-sm font-medium"
          >
            <Plus className="h-4 w-4" /> New Page
          </button>
        </div>
      ) : (
        <motion.div layout className="space-y-3">
          <AnimatePresence mode="popLayout">
            {pages.map((page) => (
              <PageCard key={page.id} page={page} onDelete={() => setDeleteTarget(page)} />
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      <AnimatePresence>
        {showCreate && <CreatePageModal onClose={() => setShowCreate(false)} />}
      </AnimatePresence>

      <AnimatePresence>
        {deleteTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="bg-card border border-border rounded-2xl p-6 max-w-sm w-full shadow-2xl"
            >
              <h3 className="font-bold text-lg mb-2">Delete "{deleteTarget.title}"?</h3>
              <p className="text-sm text-muted-foreground mb-6">
                All sections and blocks will be permanently removed.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteTarget(null)} className="flex-1 px-4 py-2 rounded-xl border border-border text-sm font-medium hover:bg-accent">Cancel</button>
                <button
                  onClick={() => deleteMutation.mutate(deleteTarget.slug)}
                  disabled={deleteMutation.isPending}
                  className="flex-1 px-4 py-2 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600 disabled:opacity-60"
                >
                  {deleteMutation.isPending ? "Deleting…" : "Delete"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

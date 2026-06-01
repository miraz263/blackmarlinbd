import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2, XCircle, Globe, Archive, RotateCcw,
  History, Clock, FileText, GitMerge,
} from "lucide-react";
import { workflowService, workflowKeys } from "@/services/workflowService";
import { useRBAC } from "@/hooks/useRBAC";
import type { ContentReview, WorkflowStatus, WorkflowTransition } from "@/types";

// ─── Shared helpers ──────────────────────────────────────────────────────────

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const STATUS_STYLE: Record<WorkflowStatus, { bg: string; text: string; label: string }> = {
  draft:     { bg: "bg-gray-500/10",   text: "text-gray-400",   label: "Draft"     },
  review:    { bg: "bg-yellow-500/10", text: "text-yellow-500", label: "In Review" },
  approved:  { bg: "bg-blue-500/10",   text: "text-blue-500",   label: "Approved"  },
  published: { bg: "bg-green-500/10",  text: "text-green-500",  label: "Published" },
  archived:  { bg: "bg-red-500/10",    text: "text-red-400",    label: "Archived"  },
};

const CT_LABEL: Record<string, string> = {
  "blog.blogpost":     "Blog Post",
  "services.service":  "Service",
  "page_builder.page": "Page",
};

function StatusBadge({ status }: { status: WorkflowStatus }) {
  const s = STATUS_STYLE[status];
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${s.bg} ${s.text}`}>
      {s.label}
    </span>
  );
}

function ContentTypeTag({ label }: { label: string }) {
  return (
    <span className="px-1.5 py-0.5 rounded text-[10px] bg-accent text-muted-foreground font-mono uppercase tracking-wide">
      {CT_LABEL[label] ?? label}
    </span>
  );
}

// ─── Action modal ────────────────────────────────────────────────────────────

type ActionType = "approve" | "reject" | "publish" | "archive" | "restore";

const ACTION_META: Record<ActionType, { title: string; btn: string; btnClass: string }> = {
  approve: { title: "Approve",          btn: "Approve",  btnClass: "bg-blue-500 hover:bg-blue-600"   },
  reject:  { title: "Reject",           btn: "Reject",   btnClass: "bg-red-500 hover:bg-red-600"     },
  publish: { title: "Publish",          btn: "Publish",  btnClass: "bg-green-500 hover:bg-green-600" },
  archive: { title: "Archive",          btn: "Archive",  btnClass: "bg-gray-600 hover:bg-gray-700"   },
  restore: { title: "Restore to Draft", btn: "Restore",  btnClass: "bg-brand-500 hover:bg-brand-600" },
};

function ActionModal({
  review,
  action,
  onClose,
}: {
  review: ContentReview;
  action: ActionType;
  onClose: () => void;
}) {
  const [comment, setComment] = useState("");
  const qc = useQueryClient();
  const meta = ACTION_META[action];

  const mut = useMutation({
    mutationFn: () => workflowService[action](review.id, comment),
    onSuccess: () => {
      [workflowKeys.queue, workflowKeys.submissions, workflowKeys.stats, workflowKeys.unread].forEach(
        (key) => qc.invalidateQueries({ queryKey: key })
      );
      qc.invalidateQueries({ queryKey: ["workflow", "all"] });
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
        <h3 className="font-bold text-lg mb-1">{meta.title}</h3>
        <p className="text-sm text-muted-foreground mb-4">"{review.content_title}"</p>

        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest block mb-1.5">
          Comment <span className="font-normal normal-case">(optional)</span>
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          placeholder="Add a comment…"
          className="w-full px-3 py-2.5 rounded-xl bg-background border border-border text-sm outline-none focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/20 resize-none"
        />

        <div className="flex gap-3 mt-4">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 rounded-xl border border-border text-sm font-medium hover:bg-accent"
          >
            Cancel
          </button>
          <button
            onClick={() => mut.mutate()}
            disabled={mut.isPending}
            className={`flex-1 px-4 py-2 rounded-xl text-white text-sm font-medium disabled:opacity-60 transition-colors ${meta.btnClass}`}
          >
            {mut.isPending ? "Processing…" : meta.btn}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── History drawer ──────────────────────────────────────────────────────────

function HistoryPanel({ reviewId, onClose }: { reviewId: number; onClose: () => void }) {
  const { data: history = [] } = useQuery({
    queryKey: workflowKeys.history(reviewId),
    queryFn: () => workflowService.getHistory(reviewId).then((r) => r.data.results),
    staleTime: 30_000,
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="bg-card border border-border rounded-2xl p-6 w-full max-w-lg shadow-2xl max-h-[70vh] flex flex-col"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg">Transition History</h3>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground text-xl leading-none"
          >
            ×
          </button>
        </div>
        <div className="flex-1 overflow-y-auto space-y-3">
          {(history as WorkflowTransition[]).length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No transitions yet.</p>
          ) : (
            (history as WorkflowTransition[]).map((t) => (
              <div key={t.id} className="p-3 rounded-xl bg-background space-y-1">
                <div className="flex items-center gap-2">
                  <StatusBadge status={t.from_status} />
                  <span className="text-muted-foreground text-sm">→</span>
                  <StatusBadge status={t.to_status} />
                </div>
                <p className="text-xs text-muted-foreground">
                  {t.actor_name} · {timeAgo(t.created_at)}
                </p>
                {t.comment && (
                  <p className="text-xs italic text-foreground/80">"{t.comment}"</p>
                )}
              </div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
}

// ─── Review row ──────────────────────────────────────────────────────────────

type ModalState =
  | { kind: "action"; review: ContentReview; action: ActionType }
  | { kind: "history"; reviewId: number }
  | null;

function ReviewRow({
  review,
  showActions,
}: {
  review: ContentReview;
  showActions: boolean;
}) {
  const [modal, setModal] = useState<ModalState>(null);
  const { isSuperAdmin, canDo } = useRBAC();
  const canPublish = isSuperAdmin || canDo("site_settings", "publish");
  const v = review.valid_transitions;

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        className="flex items-center gap-4 p-4 rounded-2xl bg-card border border-border hover:border-brand-500/20 transition-all"
      >
        <div className="w-9 h-9 rounded-xl bg-brand-500/10 flex items-center justify-center flex-shrink-0">
          <FileText className="h-4 w-4 text-brand-400" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-sm truncate">{review.content_title}</span>
            <ContentTypeTag label={review.content_type_label} />
            <StatusBadge status={review.status} />
          </div>
          <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground flex-wrap">
            {review.current_step_name && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {review.current_step_name}
              </span>
            )}
            {review.submitted_by_name && <span>by {review.submitted_by_name}</span>}
            {review.submitted_at && <span>{timeAgo(review.submitted_at)}</span>}
          </div>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={() => setModal({ kind: "history", reviewId: review.id })}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground"
            title="View history"
          >
            <History className="h-3.5 w-3.5" />
          </button>

          {showActions && (
            <>
              {v.includes("approved") && (
                <button
                  onClick={() => setModal({ kind: "action", review, action: "approve" })}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-blue-500/10 text-muted-foreground hover:text-blue-500"
                  title="Approve"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                </button>
              )}
              {v.includes("draft") && review.status === "review" && (
                <button
                  onClick={() => setModal({ kind: "action", review, action: "reject" })}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-500"
                  title="Reject"
                >
                  <XCircle className="h-3.5 w-3.5" />
                </button>
              )}
              {v.includes("published") && canPublish && (
                <button
                  onClick={() => setModal({ kind: "action", review, action: "publish" })}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-green-500/10 text-muted-foreground hover:text-green-500"
                  title="Publish"
                >
                  <Globe className="h-3.5 w-3.5" />
                </button>
              )}
              {v.includes("archived") && (
                <button
                  onClick={() => setModal({ kind: "action", review, action: "archive" })}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground"
                  title="Archive"
                >
                  <Archive className="h-3.5 w-3.5" />
                </button>
              )}
              {v.includes("draft") && review.status === "archived" && (
                <button
                  onClick={() => setModal({ kind: "action", review, action: "restore" })}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground"
                  title="Restore"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </button>
              )}
            </>
          )}
        </div>
      </motion.div>

      <AnimatePresence>
        {modal?.kind === "action" && (
          <ActionModal
            review={modal.review}
            action={modal.action}
            onClose={() => setModal(null)}
          />
        )}
        {modal?.kind === "history" && (
          <HistoryPanel reviewId={modal.reviewId} onClose={() => setModal(null)} />
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Stats row ───────────────────────────────────────────────────────────────

const STAT_ORDER = [
  { key: "draft",     label: "Draft",     textClass: "text-gray-400"   },
  { key: "review",    label: "In Review", textClass: "text-yellow-500" },
  { key: "approved",  label: "Approved",  textClass: "text-blue-500"   },
  { key: "published", label: "Published", textClass: "text-green-500"  },
  { key: "archived",  label: "Archived",  textClass: "text-red-400"    },
] as const;

// ─── Main page ───────────────────────────────────────────────────────────────

type Tab = "queue" | "submissions" | "all";

export default function WorkflowPage() {
  const [tab, setTab] = useState<Tab>("queue");
  const [statusFilter, setStatusFilter] = useState("");
  const { isSuperAdmin } = useRBAC();

  const { data: stats = {} } = useQuery({
    queryKey: workflowKeys.stats,
    queryFn: () => workflowService.getStats().then((r) => r.data),
    staleTime: 30_000,
    refetchInterval: 60_000,
  });

  const { data: queue = [], isLoading: queueLoading } = useQuery({
    queryKey: workflowKeys.queue,
    queryFn: () => workflowService.getQueue().then((r) => r.data.results),
    staleTime: 30_000,
    enabled: tab === "queue",
  });

  const { data: submissions = [], isLoading: subLoading } = useQuery({
    queryKey: workflowKeys.submissions,
    queryFn: () => workflowService.getSubmissions().then((r) => r.data.results),
    staleTime: 30_000,
    enabled: tab === "submissions",
  });

  const { data: allItems = [], isLoading: allLoading } = useQuery({
    queryKey: workflowKeys.all({ status: statusFilter }),
    queryFn: () => workflowService.getAll({ status: statusFilter || undefined }).then((r) => r.data.results),
    staleTime: 30_000,
    enabled: tab === "all",
  });

  const items     = tab === "queue" ? queue : tab === "submissions" ? submissions : allItems;
  const isLoading = tab === "queue" ? queueLoading : tab === "submissions" ? subLoading : allLoading;
  const showActions = tab === "queue" || (tab === "all" && isSuperAdmin);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Workflow</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Content approval and publishing pipeline
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-3">
        {STAT_ORDER.map(({ key, label, textClass }) => (
          <div key={key} className="p-4 rounded-2xl bg-card border border-border text-center">
            <div className={`text-2xl font-bold ${textClass}`}>
              {(stats as Record<string, number>)[key] ?? 0}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-accent rounded-xl w-fit">
        {(["queue", "submissions", "all"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`relative px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
              tab === t
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t === "queue"
              ? "Pending Approval"
              : t === "submissions"
              ? "My Submissions"
              : "All Content"}
            {t === "queue" && queue.length > 0 && (
              <span className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-bold bg-brand-500 text-white">
                {queue.length > 9 ? "9+" : queue.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Status filter for "all" tab */}
      {tab === "all" && (
        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-card border border-border text-sm outline-none focus:border-brand-500/50"
          >
            <option value="">All Statuses</option>
            {STAT_ORDER.map(({ key, label }) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>
      )}

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 rounded-2xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-2xl bg-accent flex items-center justify-center mb-4">
            <GitMerge className="h-8 w-8 text-muted-foreground opacity-50" />
          </div>
          <p className="text-lg font-medium">
            {tab === "queue"
              ? "Nothing pending approval"
              : tab === "submissions"
              ? "No submissions yet"
              : "No content found"}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {tab === "queue"
              ? "All caught up. Check back later."
              : "Submit content from the page, blog, or service editor."}
          </p>
        </div>
      ) : (
        <motion.div layout className="space-y-3">
          <AnimatePresence mode="popLayout">
            {items.map((review) => (
              <ReviewRow key={review.id} review={review} showActions={showActions} />
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send, CheckCircle2, Globe, Archive, RotateCcw,
  XCircle, Clock, History,
} from "lucide-react";
import { workflowService, workflowKeys } from "@/services/workflowService";
import { useRBAC } from "@/hooks/useRBAC";
import type { WorkflowStatus, WorkflowTransition } from "@/types";

const S: Record<WorkflowStatus, { bg: string; text: string; label: string }> = {
  draft:     { bg: "bg-gray-500/10",   text: "text-gray-400",   label: "Draft"     },
  review:    { bg: "bg-yellow-500/10", text: "text-yellow-500", label: "In Review" },
  approved:  { bg: "bg-blue-500/10",   text: "text-blue-500",   label: "Approved"  },
  published: { bg: "bg-green-500/10",  text: "text-green-500",  label: "Published" },
  archived:  { bg: "bg-red-500/10",    text: "text-red-400",    label: "Archived"  },
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

interface WorkflowStatusPanelProps {
  appLabel: string;
  modelName: string;
  objectId: number;
  onPublishChange?: () => void;
}

export function WorkflowStatusPanel({
  appLabel,
  modelName,
  objectId,
  onPublishChange,
}: WorkflowStatusPanelProps) {
  const qc = useQueryClient();
  const { isSuperAdmin, canDo } = useRBAC();
  const canPublish = isSuperAdmin || canDo("site_settings", "publish");
  const [comment, setComment] = useState("");
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  const reviewKey = workflowKeys.status(appLabel, modelName, objectId);

  const { data: review, isLoading } = useQuery({
    queryKey: reviewKey,
    queryFn: () =>
      workflowService.getContentStatus(appLabel, modelName, objectId).then((r) => r.data),
    staleTime: 30_000,
  });

  const { data: history = [] } = useQuery({
    queryKey: workflowKeys.history(review?.id ?? 0),
    queryFn: () => workflowService.getHistory(review!.id).then((r) => r.data),
    enabled: showHistory && !!review,
    staleTime: 30_000,
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: reviewKey });
    qc.invalidateQueries({ queryKey: workflowKeys.queue });
    qc.invalidateQueries({ queryKey: workflowKeys.stats });
    qc.invalidateQueries({ queryKey: workflowKeys.unread });
    onPublishChange?.();
  };

  const submitMut = useMutation({
    mutationFn: () => workflowService.submit(appLabel, modelName, objectId, comment),
    onSuccess: () => { invalidate(); setComment(""); setPendingAction(null); },
  });

  const actionMut = useMutation({
    mutationFn: (action: string) => {
      const fn = workflowService[action as keyof typeof workflowService] as
        (id: number, comment: string) => Promise<unknown>;
      return fn(review!.id, comment);
    },
    onSuccess: () => { invalidate(); setComment(""); setPendingAction(null); },
  });

  const isPending = submitMut.isPending || actionMut.isPending;

  const doAction = (action: string) => {
    if (pendingAction === action) {
      if (action === "submit") submitMut.mutate();
      else actionMut.mutate(action);
    } else {
      setPendingAction(action);
    }
  };

  const cancel = () => { setPendingAction(null); setComment(""); };

  if (isLoading) return <div className="h-28 rounded-xl bg-muted animate-pulse" />;

  const status: WorkflowStatus = review?.status ?? "draft";
  const style = S[status];
  const transitions = review?.valid_transitions ?? ["review"];

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
          Workflow
        </span>
        <button
          onClick={() => setShowHistory((v) => !v)}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <History className="h-3 w-3" />
          History
        </button>
      </div>

      {/* Status badge */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${style.bg} ${style.text}`}>
          {style.label}
        </span>
        {review?.current_step_name && (
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            {review.current_step_name}
          </span>
        )}
      </div>

      {review?.submitted_by_name && review.submitted_at && (
        <p className="text-xs text-muted-foreground">
          Submitted by {review.submitted_by_name} · {timeAgo(review.submitted_at)}
        </p>
      )}

      {/* Action buttons */}
      <div className="flex flex-col gap-2">
        {transitions.includes("review") && (
          <ActionBtn
            icon={<Send className="h-3.5 w-3.5" />}
            label="Submit for Review"
            active={pendingAction === "submit"}
            className="bg-brand-500 hover:bg-brand-600 text-white"
            onClick={() => doAction("submit")}
          />
        )}
        {review && transitions.includes("approved") && (
          <ActionBtn
            icon={<CheckCircle2 className="h-3.5 w-3.5" />}
            label="Approve"
            active={pendingAction === "approve"}
            className="bg-blue-500 hover:bg-blue-600 text-white"
            onClick={() => doAction("approve")}
          />
        )}
        {review && transitions.includes("draft") && status === "review" && (
          <ActionBtn
            icon={<XCircle className="h-3.5 w-3.5" />}
            label="Reject"
            active={pendingAction === "reject"}
            className="border border-red-500/30 text-red-500 hover:bg-red-500/10"
            onClick={() => doAction("reject")}
          />
        )}
        {review && transitions.includes("published") && canPublish && (
          <ActionBtn
            icon={<Globe className="h-3.5 w-3.5" />}
            label="Publish"
            active={pendingAction === "publish"}
            className="bg-green-500 hover:bg-green-600 text-white"
            onClick={() => doAction("publish")}
          />
        )}
        {review && transitions.includes("archived") && (
          <ActionBtn
            icon={<Archive className="h-3.5 w-3.5" />}
            label="Archive"
            active={pendingAction === "archive"}
            className="border border-border text-muted-foreground hover:bg-accent"
            onClick={() => doAction("archive")}
          />
        )}
        {review && transitions.includes("draft") && status === "archived" && (
          <ActionBtn
            icon={<RotateCcw className="h-3.5 w-3.5" />}
            label="Restore to Draft"
            active={pendingAction === "restore"}
            className="border border-border text-muted-foreground hover:bg-accent"
            onClick={() => doAction("restore")}
          />
        )}
      </div>

      {/* Comment + confirm */}
      <AnimatePresence>
        {pendingAction && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add a comment (optional)…"
              rows={2}
              className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm outline-none focus:border-brand-500/50 resize-none mt-1"
            />
            <div className="flex gap-2 mt-2">
              <button
                onClick={cancel}
                className="flex-1 px-3 py-1.5 rounded-lg border border-border text-xs font-medium hover:bg-accent"
              >
                Cancel
              </button>
              <button
                onClick={() => doAction(pendingAction)}
                disabled={isPending}
                className="flex-1 px-3 py-1.5 rounded-lg bg-brand-500 text-white text-xs font-medium hover:bg-brand-600 disabled:opacity-60"
              >
                {isPending ? "Processing…" : "Confirm"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Transition history */}
      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-t border-border pt-3 space-y-2"
          >
            {history.length === 0 ? (
              <p className="text-xs text-muted-foreground">No history yet.</p>
            ) : (
              (history as WorkflowTransition[]).slice(0, 6).map((t) => (
                <div key={t.id} className="text-xs leading-relaxed">
                  <span className={`font-medium ${S[t.from_status].text}`}>
                    {S[t.from_status].label}
                  </span>
                  <span className="text-muted-foreground mx-1">→</span>
                  <span className={`font-medium ${S[t.to_status].text}`}>
                    {S[t.to_status].label}
                  </span>
                  <span className="text-muted-foreground ml-2">
                    by {t.actor_name} · {timeAgo(t.created_at)}
                  </span>
                  {t.comment && (
                    <p className="text-muted-foreground italic mt-0.5">"{t.comment}"</p>
                  )}
                </div>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ActionBtn({
  icon,
  label,
  active,
  className,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  className: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center gap-2 w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors ring-offset-background ${
        active ? "ring-2 ring-brand-500/50 ring-offset-1" : ""
      } ${className}`}
    >
      {icon}
      {label}
    </button>
  );
}

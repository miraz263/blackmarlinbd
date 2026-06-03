import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail, Phone, Building2, Clock, Tag, X,
  MessageSquare, CheckCircle2, AlertTriangle, Loader2, Search,
} from "lucide-react";
import { apiClient } from "@/services/api/client";
import type { PaginatedResponse } from "@/types";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

type Status = "new" | "in_progress" | "resolved" | "spam";

interface ContactSubmission {
  id: number;
  name: string;
  email: string;
  phone: string;
  company: string;
  service: string;
  subject: string;
  message: string;
  budget: string;
  status: Status;
  notes: string;
  ip_address: string | null;
  created_at: string;
  updated_at: string;
}

// ─── API helpers ──────────────────────────────────────────────────────────────

const contactsInboxKeys = {
  list: (params: object) => ["contacts-inbox", params] as const,
};

const inboxApi = {
  list: (params: Record<string, string | number>) =>
    apiClient.get<PaginatedResponse<ContactSubmission>>("/contacts/list/", { params }),
  update: (id: number, data: Partial<ContactSubmission>) =>
    apiClient.patch<ContactSubmission>(`/contacts/${id}/`, data),
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_CFG: Record<Status, { label: string; cls: string; icon: React.ElementType }> = {
  new:         { label: "New",         cls: "bg-blue-500/10 text-blue-400 border-blue-500/20",   icon: Mail          },
  in_progress: { label: "In Progress", cls: "bg-amber-500/10 text-amber-400 border-amber-500/20", icon: Clock         },
  resolved:    { label: "Resolved",    cls: "bg-green-500/10 text-green-500 border-green-500/20", icon: CheckCircle2  },
  spam:        { label: "Spam",        cls: "bg-red-500/10 text-red-400 border-red-500/20",       icon: AlertTriangle },
};

const SERVICE_LABELS: Record<string, string> = {
  ai_ml: "AI & ML", financial: "Financial", cloud: "Cloud & DevOps",
  web_mobile: "Web & Mobile", cybersecurity: "Cybersecurity", other: "Other",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function StatusBadge({ status }: { status: Status }) {
  const { label, cls, icon: Icon } = STATUS_CFG[status] ?? STATUS_CFG.new;
  return (
    <span className={cn("inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-xs font-semibold", cls)}>
      <Icon className="h-3 w-3" /> {label}
    </span>
  );
}

// ─── Detail Drawer ────────────────────────────────────────────────────────────

function DetailDrawer({ contact, onClose }: { contact: ContactSubmission; onClose: () => void }) {
  const qc = useQueryClient();
  const [notes, setNotes] = useState(contact.notes ?? "");
  const [status, setStatus] = useState<Status>(contact.status);

  const update = useMutation({
    mutationFn: (data: Partial<ContactSubmission>) => inboxApi.update(contact.id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["contacts-inbox"] }),
  });

  const saveStatus = (s: Status) => {
    setStatus(s);
    update.mutate({ status: s });
  };

  const saveNotes = () => update.mutate({ notes });

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/40" onClick={onClose} />
      <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="fixed right-0 top-0 h-full w-full max-w-lg bg-card border-l border-border z-50 flex flex-col shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="min-w-0">
            <h3 className="font-semibold truncate">{contact.name}</h3>
            <p className="text-xs text-muted-foreground">{contact.email}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-accent transition-colors ml-3 shrink-0">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Meta row */}
          <div className="flex flex-wrap gap-2">
            <StatusBadge status={status} />
            {contact.service && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border border-border text-xs font-medium text-muted-foreground">
                <Tag className="h-3 w-3" /> {SERVICE_LABELS[contact.service] ?? contact.service}
              </span>
            )}
            {contact.budget && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border border-border text-xs font-medium text-muted-foreground">
                {contact.budget}
              </span>
            )}
          </div>

          {/* Contact details */}
          <div className="grid grid-cols-2 gap-3">
            {contact.phone && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-3.5 w-3.5 shrink-0" /> {contact.phone}
              </div>
            )}
            {contact.company && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Building2 className="h-3.5 w-3.5 shrink-0" /> {contact.company}
              </div>
            )}
            <div className="flex items-center gap-2 text-sm text-muted-foreground col-span-2">
              <Clock className="h-3.5 w-3.5 shrink-0" /> {formatDate(contact.created_at)}
            </div>
          </div>

          {/* Subject & Message */}
          <div className="space-y-3 p-4 rounded-2xl bg-background border border-border">
            <p className="font-semibold text-sm">{contact.subject}</p>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">{contact.message}</p>
          </div>

          {/* Change Status */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">Update Status</p>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(STATUS_CFG) as Status[]).map((s) => {
                const { label, cls } = STATUS_CFG[s];
                return (
                  <button key={s} onClick={() => saveStatus(s)}
                    className={cn("px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all",
                      status === s ? cls : "border-border text-muted-foreground hover:bg-accent")}>
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Internal Notes */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">Internal Notes</p>
            <textarea rows={4}
              className="w-full px-3 py-2.5 rounded-xl bg-background border border-border text-sm outline-none focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/20 transition-all resize-none"
              placeholder="Add private notes about this inquiry…"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
            <button onClick={saveNotes} disabled={notes === contact.notes || update.isPending}
              className="mt-2 flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-500 text-white text-xs font-medium hover:bg-brand-600 disabled:opacity-40 transition-colors">
              {update.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
              Save Notes
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const STATUS_FILTERS: { value: string; label: string }[] = [
  { value: "", label: "All" },
  { value: "new", label: "New" },
  { value: "in_progress", label: "In Progress" },
  { value: "resolved", label: "Resolved" },
  { value: "spam", label: "Spam" },
];

export default function ContactsInboxPage() {
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<ContactSubmission | null>(null);

  const params = { page, ...(statusFilter && { status: statusFilter }), ...(search && { search }) };

  const { data, isLoading } = useQuery({
    queryKey: contactsInboxKeys.list(params),
    queryFn: () => inboxApi.list(params).then((r) => r.data),
    staleTime: 30_000,
  });

  const submissions = data?.results ?? [];
  const totalPages = data?.total_pages ?? 1;
  const totalCount = data?.count ?? 0;
  const newCount = submissions.filter((s) => s.status === "new").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-brand-400" /> Contact Inbox
            {newCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-brand-500 text-white text-xs font-bold">{newCount} new</span>
            )}
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">{totalCount} total submission{totalCount !== 1 ? "s" : ""}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search name, email, subject…"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-card border border-border text-sm outline-none focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/20" />
        </div>
        <div className="flex gap-1 p-1 bg-card border border-border rounded-xl">
          {STATUS_FILTERS.map(({ value, label }) => (
            <button key={value} onClick={() => { setStatusFilter(value); setPage(1); }}
              className={cn("px-3 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap",
                statusFilter === value ? "bg-brand-500 text-white shadow" : "text-muted-foreground hover:text-foreground hover:bg-accent")}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-card border border-border overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {[...Array(5)].map((_, i) => <div key={i} className="h-16 rounded-xl bg-accent animate-pulse" />)}
          </div>
        ) : submissions.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <MessageSquare className="h-10 w-10 mx-auto mb-3 opacity-20" />
            <p className="text-sm">No messages yet</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">From</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Subject</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Service</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {submissions.map((s) => (
                <tr key={s.id} onClick={() => setSelected(s)}
                  className={cn("cursor-pointer transition-colors hover:bg-accent/50",
                    s.status === "new" && "bg-brand-500/5 font-medium")}>
                  <td className="px-6 py-4">
                    <div className="font-medium truncate max-w-[140px]">{s.name}</div>
                    <div className="text-xs text-muted-foreground truncate max-w-[140px]">{s.email}</div>
                  </td>
                  <td className="px-4 py-4 hidden md:table-cell">
                    <span className="line-clamp-1 max-w-[200px] text-muted-foreground">{s.subject}</span>
                  </td>
                  <td className="px-4 py-4 hidden lg:table-cell text-muted-foreground">
                    {SERVICE_LABELS[s.service] ?? s.service}
                  </td>
                  <td className="px-4 py-4"><StatusBadge status={s.status} /></td>
                  <td className="px-4 py-4 hidden sm:table-cell text-xs text-muted-foreground whitespace-nowrap">
                    {formatDate(s.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
            className="px-4 py-2 rounded-lg border border-border text-sm disabled:opacity-40 hover:bg-accent transition-colors">
            Previous
          </button>
          <span className="text-sm text-muted-foreground">{page} / {totalPages}</span>
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
            className="px-4 py-2 rounded-lg border border-border text-sm disabled:opacity-40 hover:bg-accent transition-colors">
            Next
          </button>
        </div>
      )}

      {/* Detail drawer */}
      <AnimatePresence>
        {selected && <DetailDrawer contact={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>
    </div>
  );
}

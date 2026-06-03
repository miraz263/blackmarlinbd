import { useState, useCallback, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload, Search, X, Trash2, Copy, Check,
  ChevronLeft, ChevronRight, FileText, Film,
  FileImage, File, FolderOpen, ExternalLink,
  LayoutGrid, List, Pencil, HardDrive, Image,
} from "lucide-react";
import { mediaService, mediaKeys } from "@/services/mediaService";
import type { MediaAsset, MediaAssetType, MediaListParams } from "@/types";
import { cn } from "@/lib/utils";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatBytes(bytes: number): string {
  if (bytes < 1024)        return `${bytes} B`;
  if (bytes < 1024 ** 2)   return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 ** 3)   return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
  return `${(bytes / 1024 ** 3).toFixed(1)} GB`;
}

function useDebounce<T>(value: T, delay: number): T {
  const [v, setV] = useState(value);
  useEffect(() => { const t = setTimeout(() => setV(value), delay); return () => clearTimeout(t); }, [value, delay]);
  return v;
}

const TYPE_TABS: { label: string; value: MediaAssetType | "all"; icon: React.ElementType; color: string }[] = [
  { label: "All",    value: "all",   icon: HardDrive, color: "text-brand-400"         },
  { label: "Images", value: "image", icon: Image,     color: "text-blue-400"          },
  { label: "Videos", value: "video", icon: Film,      color: "text-purple-400"        },
  { label: "PDFs",   value: "pdf",   icon: FileText,  color: "text-red-400"           },
  { label: "Docs",   value: "doc",   icon: FileText,  color: "text-blue-500"          },
  { label: "Other",  value: "other", icon: File,      color: "text-muted-foreground"  },
];

function TypeIcon({ type, size = "md" }: { type: MediaAssetType; size?: "sm" | "md" | "lg" }) {
  const cls = { sm: "h-4 w-4", md: "h-8 w-8", lg: "h-12 w-12" }[size];
  switch (type) {
    case "image": return <FileImage className={`${cls} text-blue-400`} />;
    case "video": return <Film      className={`${cls} text-purple-400`} />;
    case "pdf":   return <FileText  className={`${cls} text-red-400`} />;
    case "doc":   return <FileText  className={`${cls} text-blue-500`} />;
    default:      return <File      className={`${cls} text-muted-foreground`} />;
  }
}

// ─── Upload zone ──────────────────────────────────────────────────────────────

function UploadZone({ folder, onDone }: { folder: string; onDone: () => void }) {
  const [dragging, setDragging] = useState(false);
  const [files, setFiles] = useState<{ name: string; done: boolean; error: boolean }[]>([]);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(async (selected: File[]) => {
    if (!selected.length) return;
    setUploading(true);
    setFiles(selected.map((f) => ({ name: f.name, done: false, error: false })));
    try {
      await mediaService.upload(selected, folder);
      setFiles((prev) => prev.map((f) => ({ ...f, done: true })));
      setTimeout(() => { setFiles([]); onDone(); }, 800);
    } catch {
      setFiles((prev) => prev.map((f) => ({ ...f, error: true })));
    } finally {
      setUploading(false);
    }
  }, [folder, onDone]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    handleFiles(Array.from(e.dataTransfer.files));
  }, [handleFiles]);

  return (
    <div className="space-y-3">
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => !uploading && inputRef.current?.click()}
        className={cn(
          "flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-10 cursor-pointer transition-all",
          dragging ? "border-brand-500 bg-brand-500/5" : "border-border hover:border-brand-500/50 hover:bg-accent/30",
          uploading && "cursor-default"
        )}
      >
        <input ref={inputRef} type="file" multiple className="hidden"
          onChange={(e) => handleFiles(Array.from(e.target.files ?? []))} />
        <div className="w-14 h-14 rounded-2xl bg-brand-500/10 flex items-center justify-center">
          <Upload className={cn("h-6 w-6 text-brand-400", uploading && "animate-bounce")} />
        </div>
        {uploading ? (
          <p className="text-sm font-medium text-brand-400">Uploading {files.length} file{files.length !== 1 ? "s" : ""}…</p>
        ) : (
          <>
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">Drop files here or click to browse</p>
              <p className="text-xs text-muted-foreground mt-1">Images, videos, PDFs, documents — any file type</p>
            </div>
          </>
        )}
      </div>

      {files.length > 0 && (
        <div className="grid grid-cols-1 gap-1.5">
          {files.map((f, i) => (
            <div key={i} className={cn("flex items-center gap-3 px-3 py-2 rounded-lg text-xs",
              f.done ? "bg-green-500/10 text-green-500" : f.error ? "bg-red-500/10 text-red-400" : "bg-accent text-muted-foreground")}>
              {f.done ? <Check className="h-3 w-3 shrink-0" /> : f.error ? <X className="h-3 w-3 shrink-0" /> : <div className="h-3 w-3 rounded-full border border-current border-t-transparent animate-spin shrink-0" />}
              <span className="truncate">{f.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Edit modal ───────────────────────────────────────────────────────────────

function EditModal({ asset, onClose }: { asset: MediaAsset; onClose: () => void }) {
  const qc = useQueryClient();
  const [title, setTitle] = useState(asset.title);
  const [altText, setAltText] = useState(asset.alt_text ?? "");
  const [folder, setFolder] = useState(asset.folder ?? "");

  const mut = useMutation({
    mutationFn: () => mediaService.update(asset.id, { title, alt_text: altText, folder }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: mediaKeys.all }); onClose(); },
  });

  const inputCls = "w-full px-3 py-2 rounded-xl bg-background border border-border text-sm outline-none focus:border-brand-500/60 focus:ring-2 focus:ring-brand-500/15 transition-all text-foreground";

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md bg-card border border-border rounded-2xl p-6 shadow-2xl z-10 space-y-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-lg">Edit Asset</h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-accent transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest block mb-1.5">Title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest block mb-1.5">Alt Text</label>
          <input value={altText} onChange={(e) => setAltText(e.target.value)} className={inputCls} placeholder="Describe the image for accessibility" />
        </div>
        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest block mb-1.5">Folder</label>
          <input value={folder} onChange={(e) => setFolder(e.target.value)} className={inputCls} placeholder="e.g. blog/covers" />
        </div>
        <div className="flex gap-3 pt-1">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-accent transition-colors">Cancel</button>
          <button onClick={() => mut.mutate()} disabled={mut.isPending || !title.trim()}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-brand-500 text-white text-sm font-semibold hover:bg-brand-600 disabled:opacity-50 transition-colors">
            {mut.isPending ? <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" /> : null}
            {mut.isPending ? "Saving…" : "Save"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Preview modal ────────────────────────────────────────────────────────────

function PreviewModal({ asset, onClose, onEdit }: { asset: MediaAsset; onClose: () => void; onEdit: () => void }) {
  const [copied, setCopied] = useState(false);
  const copyUrl = () => {
    if (!asset.url) return;
    navigator.clipboard.writeText(asset.url);
    setCopied(true); setTimeout(() => setCopied(false), 1500);
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }}
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-3xl w-full max-h-[90vh] bg-card border border-border rounded-2xl overflow-hidden flex flex-col shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border gap-4 shrink-0">
          <div className="min-w-0">
            <p className="font-semibold truncate">{asset.title}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {asset.original_filename} · {formatBytes(asset.size)} · {asset.mime_type}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={onEdit}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent text-xs font-medium hover:bg-accent/80 transition-colors">
              <Pencil className="h-3 w-3" /> Edit
            </button>
            {asset.url && (
              <>
                <button onClick={copyUrl}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent text-xs font-medium hover:bg-accent/80 transition-colors">
                  {copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                  {copied ? "Copied!" : "Copy URL"}
                </button>
                <a href={asset.url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent text-xs font-medium hover:bg-accent/80 transition-colors">
                  <ExternalLink className="h-3 w-3" /> Open
                </a>
              </>
            )}
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-accent transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Preview */}
        <div className="flex-1 overflow-auto flex items-center justify-center p-6 bg-[#111] min-h-[300px]">
          {asset.asset_type === "image" && asset.url ? (
            <img src={asset.url} alt={asset.alt_text || asset.title} className="max-w-full max-h-[55vh] object-contain rounded-lg" />
          ) : asset.asset_type === "video" && asset.url ? (
            <video src={asset.url} controls className="max-w-full max-h-[55vh] rounded-lg" />
          ) : asset.asset_type === "pdf" && asset.url ? (
            <iframe src={asset.url} title={asset.title} className="w-full h-[55vh] rounded-lg border-0" />
          ) : (
            <div className="flex flex-col items-center gap-4">
              <TypeIcon type={asset.asset_type} size="lg" />
              <p className="text-sm text-muted-foreground">No preview available</p>
              {asset.url && (
                <a href={asset.url} download={asset.original_filename}
                  className="px-4 py-2 rounded-xl bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 transition-colors">
                  Download
                </a>
              )}
            </div>
          )}
        </div>

        {/* Meta footer */}
        <div className="p-4 border-t border-border flex flex-wrap gap-4 text-xs text-muted-foreground shrink-0">
          {asset.folder && <span className="flex items-center gap-1"><FolderOpen className="h-3 w-3" /> {asset.folder}</span>}
          {asset.alt_text && <span>Alt: <em>{asset.alt_text}</em></span>}
          {asset.uploaded_by && <span>By <strong className="text-foreground">{asset.uploaded_by.username}</strong></span>}
          <span>{new Date(asset.created_at).toLocaleString()}</span>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Asset card (grid) ────────────────────────────────────────────────────────

function AssetCard({ asset, onSelect, onDelete }: { asset: MediaAsset; onSelect: () => void; onDelete: () => void }) {
  const [copied, setCopied] = useState(false);
  const copyUrl = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!asset.url) return;
    navigator.clipboard.writeText(asset.url);
    setCopied(true); setTimeout(() => setCopied(false), 1500);
  };

  return (
    <motion.div layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.18 }}
      onClick={onSelect}
      className="group relative rounded-xl bg-card border border-border hover:border-brand-500/50 overflow-hidden cursor-pointer hover:shadow-lg hover:shadow-brand-500/5 transition-all">

      {/* Thumbnail */}
      <div className="aspect-square bg-muted/50 flex items-center justify-center overflow-hidden">
        {(asset.thumbnail_url || (asset.asset_type === "image" && asset.url)) ? (
          <img src={asset.thumbnail_url ?? asset.url!} alt={asset.alt_text || asset.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <TypeIcon type={asset.asset_type} />
        )}
        {/* Type badge */}
        <div className="absolute top-2 left-2">
          <span className="px-1.5 py-0.5 rounded-md bg-black/50 backdrop-blur-sm text-[9px] font-bold text-white uppercase">
            {asset.asset_type}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="p-2.5">
        <p className="text-xs font-medium truncate" title={asset.title}>{asset.title}</p>
        <p className="text-[10px] text-muted-foreground mt-0.5">{formatBytes(asset.size)}</p>
      </div>

      {/* Hover actions */}
      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={copyUrl} title="Copy URL"
          className="w-6 h-6 rounded-md bg-black/60 backdrop-blur flex items-center justify-center hover:bg-black/80 transition-colors">
          {copied ? <Check className="h-3 w-3 text-green-400" /> : <Copy className="h-3 w-3 text-white" />}
        </button>
        <button onClick={(e) => { e.stopPropagation(); onDelete(); }} title="Delete"
          className="w-6 h-6 rounded-md bg-black/60 backdrop-blur flex items-center justify-center hover:bg-red-500/80 transition-colors">
          <Trash2 className="h-3 w-3 text-white" />
        </button>
      </div>
    </motion.div>
  );
}

// ─── Asset row (list) ─────────────────────────────────────────────────────────

function AssetRow({ asset, onSelect, onDelete }: { asset: MediaAsset; onSelect: () => void; onDelete: () => void }) {
  const [copied, setCopied] = useState(false);
  const copyUrl = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!asset.url) return;
    navigator.clipboard.writeText(asset.url);
    setCopied(true); setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div onClick={onSelect}
      className="group flex items-center gap-4 p-3 rounded-xl hover:bg-accent/40 cursor-pointer transition-colors border border-transparent hover:border-brand-500/20">
      <div className="w-12 h-12 rounded-lg bg-muted/50 overflow-hidden flex items-center justify-center shrink-0">
        {(asset.thumbnail_url || (asset.asset_type === "image" && asset.url)) ? (
          <img src={asset.thumbnail_url ?? asset.url!} alt={asset.title} className="w-full h-full object-cover" />
        ) : <TypeIcon type={asset.asset_type} size="sm" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{asset.title}</p>
        <p className="text-[11px] text-muted-foreground">{asset.original_filename}</p>
      </div>
      <span className="text-xs text-muted-foreground hidden sm:block">{asset.folder || "—"}</span>
      <span className="px-2 py-0.5 rounded-md bg-accent text-[10px] font-semibold uppercase text-muted-foreground hidden md:block">
        {asset.asset_type}
      </span>
      <span className="text-xs text-muted-foreground w-16 text-right hidden lg:block">{formatBytes(asset.size)}</span>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={copyUrl}
          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-brand-500/10 text-muted-foreground hover:text-brand-400 transition-colors">
          {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
        </button>
        <button onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-colors">
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const PAGE_SIZE = 24;

export default function MediaManagerPage() {
  const [search,        setSearch]        = useState("");
  const [activeType,    setActiveType]    = useState<MediaAssetType | "all">("all");
  const [activeFolder,  setActiveFolder]  = useState<string | undefined>(undefined);
  const [page,          setPage]          = useState(1);
  const [viewMode,      setViewMode]      = useState<"grid" | "list">("grid");
  const [selected,      setSelected]      = useState<MediaAsset | null>(null);
  const [editing,       setEditing]       = useState<MediaAsset | null>(null);
  const [showUpload,    setShowUpload]    = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const debouncedSearch = useDebounce(search, 300);
  useEffect(() => setPage(1), [debouncedSearch, activeType, activeFolder]);
  const qc = useQueryClient();

  const params: MediaListParams = {
    ...(debouncedSearch            && { search: debouncedSearch }),
    ...(activeType !== "all"       && { type: activeType }),
    ...(activeFolder !== undefined && { folder: activeFolder }),
    page, page_size: PAGE_SIZE,
  };

  const { data, isLoading } = useQuery({
    queryKey: mediaKeys.list(params),
    queryFn: () => mediaService.getAll(params).then((r) => r.data),
    staleTime: 60_000,
  });

  // Stats — fetch all without filters
  const { data: allData } = useQuery({
    queryKey: ["media-stats"],
    queryFn: () => mediaService.getAll({ page_size: 1000 }).then((r) => r.data),
    staleTime: 120_000,
  });

  const { data: folders } = useQuery({
    queryKey: mediaKeys.folders,
    queryFn: () => mediaService.getFolders().then((r) => r.data),
    staleTime: 5 * 60_000,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => mediaService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: mediaKeys.all });
      qc.invalidateQueries({ queryKey: ["media-stats"] });
      setDeleteConfirm(null);
      if (selected?.id === deleteConfirm) setSelected(null);
    },
  });

  const assets     = data?.results ?? [];
  const totalPages = data?.total_pages ?? 1;
  const allAssets  = allData?.results ?? [];

  const stats = {
    total:  allAssets.length,
    images: allAssets.filter((a) => a.asset_type === "image").length,
    videos: allAssets.filter((a) => a.asset_type === "video").length,
    pdfs:   allAssets.filter((a) => a.asset_type === "pdf").length,
    size:   allAssets.reduce((s, a) => s + a.size, 0),
  };

  const handleUploadDone = () => {
    qc.invalidateQueries({ queryKey: mediaKeys.all });
    qc.invalidateQueries({ queryKey: ["media-stats"] });
    setShowUpload(false);
  };

  const activeFilters = debouncedSearch || activeType !== "all" || activeFolder !== undefined;

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Image className="h-6 w-6 text-brand-400" /> Media Library
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {data ? `${data.count.toLocaleString()} asset${data.count !== 1 ? "s" : ""}` : "Loading…"}
          </p>
        </div>
        <button onClick={() => setShowUpload((v) => !v)}
          className={cn("flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-lg",
            showUpload ? "bg-accent text-foreground" : "bg-brand-500 text-white hover:bg-brand-600 shadow-brand-500/20")}>
          <Upload className="h-4 w-4" />
          {showUpload ? "Close Upload" : "Upload Files"}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: "Total",   value: stats.total,                  icon: HardDrive, color: "text-brand-400",  bg: "bg-brand-500/10"  },
          { label: "Images",  value: stats.images,                 icon: Image,     color: "text-blue-400",   bg: "bg-blue-500/10"   },
          { label: "Videos",  value: stats.videos,                 icon: Film,      color: "text-purple-400", bg: "bg-purple-500/10" },
          { label: "PDFs",    value: stats.pdfs,                   icon: FileText,  color: "text-red-400",    bg: "bg-red-500/10"    },
          { label: "Storage", value: formatBytes(stats.size),      icon: HardDrive, color: "text-cyan-400",   bg: "bg-cyan-500/10"   },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="flex items-center gap-3 p-4 rounded-2xl bg-card border border-border">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${s.bg}`}>
                <Icon className={`h-4 w-4 ${s.color}`} />
              </div>
              <div className="min-w-0">
                <p className="text-lg font-bold tabular-nums truncate">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Upload zone */}
      <AnimatePresence>
        {showUpload && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
            <div className="p-4 rounded-2xl bg-card border border-border">
              <UploadZone folder={activeFolder ?? ""} onDone={handleUploadDone} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name…"
            className="w-full pl-9 pr-9 py-2.5 rounded-xl bg-background border border-border text-foreground text-sm outline-none focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/20 transition-all placeholder:text-muted-foreground" style={{ colorScheme: "dark" }} />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Folder filter */}
        {folders && folders.length > 0 && (
          <select value={activeFolder ?? ""} onChange={(e) => setActiveFolder(e.target.value || undefined)}
            style={{ colorScheme: "dark" }}
            className="px-3 py-2.5 rounded-xl bg-card border border-border text-foreground text-sm outline-none focus:border-brand-500/50 min-w-36 transition-all">
            <option value="">All Folders</option>
            {folders.map((f) => <option key={f} value={f}>{f}</option>)}
          </select>
        )}

        {/* View toggle */}
        <div className="flex items-center gap-1 p-1 bg-card border border-border rounded-xl shrink-0">
          <button onClick={() => setViewMode("grid")}
            className={cn("w-8 h-8 flex items-center justify-center rounded-lg transition-colors",
              viewMode === "grid" ? "bg-brand-500 text-white" : "text-muted-foreground hover:text-foreground hover:bg-accent")}>
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button onClick={() => setViewMode("list")}
            className={cn("w-8 h-8 flex items-center justify-center rounded-lg transition-colors",
              viewMode === "list" ? "bg-brand-500 text-white" : "text-muted-foreground hover:text-foreground hover:bg-accent")}>
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Type tabs */}
      <div className="flex gap-2 flex-wrap">
        {TYPE_TABS.map(({ label, value, icon: Icon, color }) => (
          <button key={value} onClick={() => setActiveType(value)}
            className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all",
              activeType === value
                ? "bg-brand-500 text-white shadow-md shadow-brand-500/20"
                : "bg-card border border-border text-muted-foreground hover:border-brand-500/40 hover:text-foreground")}>
            <Icon className={cn("h-3 w-3", activeType === value ? "text-white" : color)} />
            {label}
          </button>
        ))}
        {activeFilters && (
          <button onClick={() => { setSearch(""); setActiveType("all"); setActiveFolder(undefined); }}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium text-muted-foreground hover:text-foreground border border-transparent hover:border-border transition-all">
            <X className="h-3 w-3" /> Clear filters
          </button>
        )}
      </div>

      {/* Content */}
      {isLoading ? (
        viewMode === "grid" ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => <div key={i} className="aspect-square rounded-xl bg-muted animate-pulse" />)}
          </div>
        ) : (
          <div className="space-y-1">
            {Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-16 rounded-xl bg-muted animate-pulse" />)}
          </div>
        )
      ) : assets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-20 h-20 rounded-2xl bg-accent flex items-center justify-center mb-4">
            <FileImage className="h-10 w-10 text-muted-foreground/40" />
          </div>
          <p className="text-lg font-semibold">No assets found</p>
          <p className="text-sm text-muted-foreground mt-1">
            {activeFilters ? "Try different filters or " : ""}
            <button onClick={() => setShowUpload(true)} className="text-brand-400 hover:text-brand-300 underline">upload some files</button>
          </p>
        </div>
      ) : viewMode === "grid" ? (
        <motion.div layout className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <AnimatePresence mode="popLayout">
            {assets.map((asset) => (
              <AssetCard key={asset.id} asset={asset}
                onSelect={() => setSelected(asset)}
                onDelete={() => setDeleteConfirm(asset.id)} />
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <div className="rounded-2xl bg-card border border-border overflow-hidden">
          {/* List header */}
          <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 px-3 py-2 border-b border-border bg-muted/30">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">File</span>
            <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground hidden sm:block">Folder</span>
            <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground hidden md:block">Type</span>
            <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground hidden lg:block">Size</span>
            <span />
          </div>
          <div className="p-2 space-y-0.5">
            {assets.map((asset) => (
              <AssetRow key={asset.id} asset={asset}
                onSelect={() => setSelected(asset)}
                onDelete={() => setDeleteConfirm(asset.id)} />
            ))}
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-muted-foreground">
            Page {page} of {totalPages}
          </p>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-accent text-muted-foreground disabled:opacity-30 transition-colors">
              <ChevronLeft className="h-4 w-4" />
            </button>
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map((pg) => (
              <button key={pg} onClick={() => setPage(pg)}
                className={cn("w-8 h-8 flex items-center justify-center rounded-lg text-xs font-medium transition-colors",
                  pg === page ? "bg-brand-500 text-white" : "hover:bg-accent text-muted-foreground")}>
                {pg}
              </button>
            ))}
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-accent text-muted-foreground disabled:opacity-30 transition-colors">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      <AnimatePresence>
        {deleteConfirm !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card border border-border rounded-2xl p-6 max-w-sm w-full shadow-2xl">
              <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center mb-4">
                <Trash2 className="h-5 w-5 text-red-500" />
              </div>
              <h3 className="font-bold text-lg mb-1">Delete asset?</h3>
              <p className="text-sm text-muted-foreground mb-6">The file will be permanently deleted from storage. This cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteConfirm(null)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-accent transition-colors">Cancel</button>
                <button onClick={() => deleteMutation.mutate(deleteConfirm!)} disabled={deleteMutation.isPending}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 disabled:opacity-50 transition-colors">
                  {deleteMutation.isPending ? "Deleting…" : "Delete"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Preview */}
      <AnimatePresence>
        {selected && !editing && (
          <PreviewModal asset={selected} onClose={() => setSelected(null)} onEdit={() => setEditing(selected)} />
        )}
      </AnimatePresence>

      {/* Edit */}
      <AnimatePresence>
        {editing && (
          <EditModal asset={editing} onClose={() => setEditing(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}

import { useState, useCallback, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload, Search, X, Trash2, Copy, Check, ChevronLeft, ChevronRight,
  FileText, Film, FileImage, File, FolderOpen, ExternalLink,
} from "lucide-react";
import { mediaService, mediaKeys } from "@/services/mediaService";
import type { MediaAsset, MediaAssetType, MediaListParams } from "@/types";

// ─── Helpers ───────────────────────────────────────────────────────────────

function formatBytes(bytes: number): string {
  if (bytes < 1024)       return `${bytes} B`;
  if (bytes < 1024 ** 2)  return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
}

function useDebounce<T>(value: T, delay: number): T {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

const TYPE_TABS: { label: string; value: MediaAssetType | "all" }[] = [
  { label: "All",      value: "all"   },
  { label: "Images",   value: "image" },
  { label: "Videos",   value: "video" },
  { label: "PDFs",     value: "pdf"   },
  { label: "Docs",     value: "doc"   },
  { label: "Other",    value: "other" },
];

function TypeIcon({ type }: { type: MediaAssetType }) {
  const cls = "h-10 w-10";
  switch (type) {
    case "image": return <FileImage className={`${cls} text-blue-400`} />;
    case "video": return <Film      className={`${cls} text-purple-400`} />;
    case "pdf":   return <FileText  className={`${cls} text-red-400`} />;
    case "doc":   return <FileText  className={`${cls} text-blue-500`} />;
    default:      return <File      className={`${cls} text-muted-foreground`} />;
  }
}

// ─── Upload dropzone ────────────────────────────────────────────────────────

function UploadZone({ folder, onDone }: { folder: string; onDone: () => void }) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: File[]) => {
    if (!files.length) return;
    setUploading(true);
    setError("");
    try {
      await mediaService.upload(files, folder);
      onDone();
    } catch {
      setError("Upload failed. Check file types and try again.");
    } finally {
      setUploading(false);
    }
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    handleFiles(Array.from(e.dataTransfer.files));
  }, [folder]);

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      onClick={() => inputRef.current?.click()}
      className={`relative flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-10 cursor-pointer transition-all ${
        dragging
          ? "border-brand-500 bg-brand-500/5"
          : "border-border hover:border-brand-500/50 hover:bg-accent/50"
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(Array.from(e.target.files ?? []))}
      />
      <div className="w-14 h-14 rounded-2xl bg-brand-500/10 flex items-center justify-center">
        <Upload className="h-6 w-6 text-brand-400" />
      </div>
      {uploading ? (
        <p className="text-sm font-medium text-brand-400 animate-pulse">Uploading…</p>
      ) : (
        <>
          <p className="text-sm font-medium text-foreground">Drop files or click to upload</p>
          <p className="text-xs text-muted-foreground">Images, videos, PDFs, and documents</p>
        </>
      )}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

// ─── Asset card ─────────────────────────────────────────────────────────────

function AssetCard({
  asset,
  onSelect,
  onDelete,
}: {
  asset: MediaAsset;
  onSelect: (a: MediaAsset) => void;
  onDelete: (id: number) => void;
}) {
  const [copied, setCopied] = useState(false);

  const copyUrl = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!asset.url) return;
    navigator.clipboard.writeText(asset.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      onClick={() => onSelect(asset)}
      className="group relative rounded-xl bg-card border border-border hover:border-brand-500/40 overflow-hidden cursor-pointer hover:shadow-lg transition-all"
    >
      {/* Thumbnail area */}
      <div className="aspect-square bg-accent flex items-center justify-center overflow-hidden">
        {asset.thumbnail_url ? (
          <img
            src={asset.thumbnail_url}
            alt={asset.alt_text || asset.title}
            className="w-full h-full object-cover"
          />
        ) : asset.asset_type === "image" && asset.url ? (
          <img
            src={asset.url}
            alt={asset.alt_text || asset.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <TypeIcon type={asset.asset_type} />
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="text-xs font-medium text-foreground truncate" title={asset.title}>
          {asset.title}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">{formatBytes(asset.size)}</p>
      </div>

      {/* Actions overlay */}
      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={copyUrl}
          title="Copy URL"
          className="w-7 h-7 rounded-lg bg-background/90 backdrop-blur flex items-center justify-center hover:bg-background"
        >
          {copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(asset.id); }}
          title="Delete"
          className="w-7 h-7 rounded-lg bg-background/90 backdrop-blur flex items-center justify-center hover:bg-red-500/20 hover:text-red-500"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      </div>
    </motion.div>
  );
}

// ─── Preview modal ──────────────────────────────────────────────────────────

function PreviewModal({ asset, onClose }: { asset: MediaAsset; onClose: () => void }) {
  const [copied, setCopied] = useState(false);

  const copyUrl = () => {
    if (!asset.url) return;
    navigator.clipboard.writeText(asset.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.15 }}
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-3xl w-full max-h-[90vh] bg-card border border-border rounded-2xl overflow-hidden flex flex-col shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-start justify-between p-4 border-b border-border gap-4">
          <div className="min-w-0">
            <p className="font-semibold text-foreground truncate">{asset.title}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {asset.original_filename} · {formatBytes(asset.size)} · {asset.mime_type}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {asset.url && (
              <>
                <button
                  onClick={copyUrl}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent text-xs font-medium hover:bg-accent/80 transition-colors"
                >
                  {copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                  {copied ? "Copied" : "Copy URL"}
                </button>
                <a
                  href={asset.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent text-xs font-medium hover:bg-accent/80 transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLink className="h-3 w-3" />
                  Open
                </a>
              </>
            )}
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-accent">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-auto flex items-center justify-center p-4 bg-accent/30 min-h-[300px]">
          {asset.asset_type === "image" && asset.url ? (
            <img
              src={asset.url}
              alt={asset.alt_text || asset.title}
              className="max-w-full max-h-[60vh] object-contain rounded-lg shadow"
            />
          ) : asset.asset_type === "video" && asset.url ? (
            <video
              src={asset.url}
              controls
              className="max-w-full max-h-[60vh] rounded-lg"
            />
          ) : asset.asset_type === "pdf" && asset.url ? (
            <iframe
              src={asset.url}
              title={asset.title}
              className="w-full h-[60vh] rounded-lg border-0"
            />
          ) : (
            <div className="flex flex-col items-center gap-4">
              <TypeIcon type={asset.asset_type} />
              <p className="text-sm text-muted-foreground">Preview not available</p>
              {asset.url && (
                <a
                  href={asset.url}
                  download={asset.original_filename}
                  className="px-4 py-2 rounded-lg bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 transition-colors"
                >
                  Download
                </a>
              )}
            </div>
          )}
        </div>

        {/* Footer meta */}
        <div className="p-4 border-t border-border flex flex-wrap gap-4 text-xs text-muted-foreground">
          {asset.folder && (
            <span className="flex items-center gap-1">
              <FolderOpen className="h-3 w-3" />
              {asset.folder}
            </span>
          )}
          {asset.uploaded_by && (
            <span>Uploaded by <strong>{asset.uploaded_by.username}</strong></span>
          )}
          <span>{new Date(asset.created_at).toLocaleString()}</span>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Page ───────────────────────────────────────────────────────────────────

const PAGE_SIZE = 24;

export default function MediaManagerPage() {
  const [search,        setSearch]        = useState("");
  const [activeType,    setActiveType]    = useState<MediaAssetType | "all">("all");
  const [activeFolder,  setActiveFolder]  = useState<string | undefined>(undefined);
  const [page,          setPage]          = useState(1);
  const [selected,      setSelected]      = useState<MediaAsset | null>(null);
  const [showUpload,    setShowUpload]    = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const debouncedSearch = useDebounce(search, 300);
  const qc = useQueryClient();

  const params: MediaListParams = {
    ...(debouncedSearch                    && { search: debouncedSearch }),
    ...(activeType !== "all"               && { type: activeType }),
    ...(activeFolder !== undefined         && { folder: activeFolder }),
    page,
  };

  const { data, isLoading } = useQuery({
    queryKey: mediaKeys.list(params),
    queryFn:  () => mediaService.getAll(params).then((r) => r.data),
    staleTime: 60 * 1000,
  });

  const { data: folders } = useQuery({
    queryKey: mediaKeys.folders,
    queryFn:  () => mediaService.getFolders().then((r) => r.data),
    staleTime: 5 * 60 * 1000,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => mediaService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: mediaKeys.all });
      setDeleteConfirm(null);
      if (selected?.id === deleteConfirm) setSelected(null);
    },
  });

  const assets       = data?.results ?? [];
  const totalPages   = data?.total_pages ?? 1;

  const resetFilters = () => {
    setSearch("");
    setActiveType("all");
    setActiveFolder(undefined);
    setPage(1);
  };

  const handleUploadDone = () => {
    qc.invalidateQueries({ queryKey: mediaKeys.all });
    setShowUpload(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Media Library</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {data ? `${data.count} asset${data.count !== 1 ? "s" : ""}` : "Loading…"}
          </p>
        </div>
        <button
          onClick={() => setShowUpload((v) => !v)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 transition-colors"
        >
          <Upload className="h-4 w-4" />
          Upload
        </button>
      </div>

      {/* Upload zone */}
      <AnimatePresence>
        {showUpload && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <UploadZone folder={activeFolder ?? ""} onDone={handleUploadDone} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by name…"
            className="w-full pl-9 pr-9 py-2.5 rounded-xl bg-card border border-border focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/20 outline-none text-sm transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Folder filter */}
        {folders && folders.length > 0 && (
          <select
            value={activeFolder ?? ""}
            onChange={(e) => { setActiveFolder(e.target.value || undefined); setPage(1); }}
            className="px-3 py-2.5 rounded-xl bg-card border border-border text-sm outline-none focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/20 transition-all"
          >
            <option value="">All folders</option>
            {folders.map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
        )}
      </div>

      {/* Type tabs */}
      <div className="flex gap-2 flex-wrap">
        {TYPE_TABS.map(({ label, value }) => (
          <button
            key={value}
            onClick={() => { setActiveType(value); setPage(1); }}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              activeType === value
                ? "bg-brand-500 text-white shadow-md shadow-brand-500/20"
                : "bg-card border border-border text-muted-foreground hover:border-brand-500/50"
            }`}
          >
            {label}
          </button>
        ))}

        {(search || activeType !== "all" || activeFolder !== undefined) && (
          <button
            onClick={resetFilters}
            className="px-3 py-1.5 rounded-full text-xs font-medium text-muted-foreground hover:text-foreground flex items-center gap-1"
          >
            <X className="h-3 w-3" /> Clear
          </button>
        )}
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="aspect-square rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : assets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-2xl bg-accent flex items-center justify-center mb-4">
            <FileImage className="h-8 w-8 text-muted-foreground opacity-50" />
          </div>
          <p className="text-lg font-medium">No assets found</p>
          <p className="text-sm text-muted-foreground mt-1">Upload files or adjust your filters.</p>
        </div>
      ) : (
        <motion.div
          layout
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4"
        >
          <AnimatePresence mode="popLayout">
            {assets.map((asset) => (
              <AssetCard
                key={asset.id}
                asset={asset}
                onSelect={setSelected}
                onDelete={(id) => setDeleteConfirm(id)}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="w-9 h-9 flex items-center justify-center rounded-lg border border-border hover:bg-accent disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
            .reduce<(number | "…")[]>((acc, p, i, arr) => {
              if (i > 0 && (p as number) - (arr[i - 1] as number) > 1) acc.push("…");
              acc.push(p);
              return acc;
            }, [])
            .map((p, i) =>
              p === "…" ? (
                <span key={`ellipsis-${i}`} className="px-1 text-muted-foreground text-sm">…</span>
              ) : (
                <button
                  key={p}
                  onClick={() => setPage(p as number)}
                  className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                    page === p
                      ? "bg-brand-500 text-white"
                      : "border border-border hover:bg-accent"
                  }`}
                >
                  {p}
                </button>
              )
            )}

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="w-9 h-9 flex items-center justify-center rounded-lg border border-border hover:bg-accent disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Delete confirm */}
      <AnimatePresence>
        {deleteConfirm !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card border border-border rounded-2xl p-6 max-w-sm w-full shadow-2xl"
            >
              <h3 className="font-bold text-lg mb-2">Delete asset?</h3>
              <p className="text-sm text-muted-foreground mb-6">
                This action cannot be undone. The file will be permanently removed from storage.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 px-4 py-2 rounded-xl border border-border text-sm font-medium hover:bg-accent transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => deleteMutation.mutate(deleteConfirm)}
                  disabled={deleteMutation.isPending}
                  className="flex-1 px-4 py-2 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600 disabled:opacity-60 transition-colors"
                >
                  {deleteMutation.isPending ? "Deleting…" : "Delete"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Preview modal */}
      <AnimatePresence>
        {selected && (
          <PreviewModal asset={selected} onClose={() => setSelected(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}

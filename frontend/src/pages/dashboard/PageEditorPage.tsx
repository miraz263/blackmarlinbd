import { useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Plus, Trash2, GripVertical, Eye, EyeOff, Save,
  Layers, AlignLeft, ImageIcon, Film, HelpCircle, Grid,
  BarChart3, Users, Zap, X, ChevronDown, ChevronUp,
} from "lucide-react";
import { pageBuilderService, pbKeys } from "@/services/pageBuilderService";
import type { BuilderBlock, BuilderBlockType, BuilderSection } from "@/types";

// ─── Block type catalogue ──────────────────────────────────────────────────

const BLOCK_TYPES: { type: BuilderBlockType; label: string; icon: React.ElementType; description: string }[] = [
  { type: "hero",     label: "Hero",     icon: Layers,    description: "Full-width headline with CTA" },
  { type: "text",     label: "Text",     icon: AlignLeft, description: "Heading + markdown body" },
  { type: "image",    label: "Image",    icon: ImageIcon, description: "Single responsive image" },
  { type: "video",    label: "Video",    icon: Film,      description: "YouTube, Vimeo, or direct URL" },
  { type: "faq",      label: "FAQ",      icon: HelpCircle,description: "Accordion Q&A list" },
  { type: "gallery",  label: "Gallery",  icon: Grid,      description: "Image grid with lightbox" },
  { type: "stats",    label: "Stats",    icon: BarChart3, description: "Key metrics with icons" },
  { type: "team",     label: "Team",     icon: Users,     description: "Team member cards" },
  { type: "services", label: "Services", icon: Zap,       description: "Service feature cards" },
];

// ─── Block content editor (right panel) ───────────────────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</label>
      {children}
    </div>
  );
}

const INPUT = "w-full px-3 py-2 rounded-xl bg-background border border-border text-sm outline-none focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/20 transition-all";
const TEXTAREA = `${INPUT} resize-none`;

function DynamicList<T extends Record<string, string>>({
  items, onChange, schema, label,
}: {
  items: T[];
  onChange: (items: T[]) => void;
  schema: { key: keyof T; label: string; textarea?: boolean }[];
  label: string;
}) {
  const add  = () => onChange([...items, Object.fromEntries(schema.map((s) => [s.key, ""])) as T]);
  const del  = (i: number) => onChange(items.filter((_, j) => j !== i));
  const edit = (i: number, key: keyof T, val: string) => {
    const next = [...items];
    next[i] = { ...next[i], [key]: val };
    onChange(next);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</span>
        <button onClick={add} className="flex items-center gap-1 text-xs text-brand-400 hover:text-brand-300">
          <Plus className="h-3 w-3" /> Add
        </button>
      </div>
      {items.map((item, i) => (
        <div key={i} className="p-3 rounded-xl bg-accent/50 space-y-2">
          {schema.map((s) =>
            s.textarea ? (
              <textarea
                key={String(s.key)}
                rows={3}
                value={item[s.key] as string}
                onChange={(e) => edit(i, s.key, e.target.value)}
                placeholder={s.label}
                className={TEXTAREA}
              />
            ) : (
              <input
                key={String(s.key)}
                value={item[s.key] as string}
                onChange={(e) => edit(i, s.key, e.target.value)}
                placeholder={s.label}
                className={INPUT}
              />
            )
          )}
          <button onClick={() => del(i)} className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1">
            <Trash2 className="h-3 w-3" /> Remove
          </button>
        </div>
      ))}
      {items.length === 0 && <p className="text-xs text-muted-foreground">No items yet.</p>}
    </div>
  );
}

function BlockContentEditor({
  block, draft, onChange,
}: {
  block: BuilderBlock;
  draft: Record<string, unknown>;
  onChange: (key: string, val: unknown) => void;
}) {
  const str  = (k: string) => (draft[k] as string)  ?? "";
  const bool = (k: string) => (draft[k] as boolean) ?? false;
  const num  = (k: string) => (draft[k] as number)  ?? 3;
  const arr  = <T,>(k: string) => (draft[k] as T[]) ?? [];

  switch (block.block_type) {
    case "hero":
      return (
        <div className="space-y-4">
          <Field label="Title"><input className={INPUT} value={str("title")} onChange={(e) => onChange("title", e.target.value)} /></Field>
          <Field label="Subtitle"><input className={INPUT} value={str("subtitle")} onChange={(e) => onChange("subtitle", e.target.value)} /></Field>
          <Field label="Description"><textarea className={TEXTAREA} rows={3} value={str("description")} onChange={(e) => onChange("description", e.target.value)} /></Field>
          <Field label="CTA Text"><input className={INPUT} value={str("cta_text")} onChange={(e) => onChange("cta_text", e.target.value)} /></Field>
          <Field label="CTA URL"><input className={INPUT} value={str("cta_url")} onChange={(e) => onChange("cta_url", e.target.value)} /></Field>
          <Field label="Secondary CTA Text"><input className={INPUT} value={str("cta_secondary_text")} onChange={(e) => onChange("cta_secondary_text", e.target.value)} /></Field>
          <Field label="Secondary CTA URL"><input className={INPUT} value={str("cta_secondary_url")} onChange={(e) => onChange("cta_secondary_url", e.target.value)} /></Field>
          <Field label="Background Image URL"><input className={INPUT} value={str("background_image")} onChange={(e) => onChange("background_image", e.target.value)} /></Field>
        </div>
      );

    case "text":
      return (
        <div className="space-y-4">
          <Field label="Heading"><input className={INPUT} value={str("heading")} onChange={(e) => onChange("heading", e.target.value)} /></Field>
          <Field label="Body (Markdown)"><textarea className={TEXTAREA} rows={8} value={str("body")} onChange={(e) => onChange("body", e.target.value)} /></Field>
          <Field label="Alignment">
            <select className={INPUT} value={str("alignment") || "left"} onChange={(e) => onChange("alignment", e.target.value)}>
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
            </select>
          </Field>
        </div>
      );

    case "image":
      return (
        <div className="space-y-4">
          <Field label="Image URL"><input className={INPUT} value={str("src")} onChange={(e) => onChange("src", e.target.value)} /></Field>
          <Field label="Alt Text"><input className={INPUT} value={str("alt")} onChange={(e) => onChange("alt", e.target.value)} /></Field>
          <Field label="Caption"><input className={INPUT} value={str("caption")} onChange={(e) => onChange("caption", e.target.value)} /></Field>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={bool("full_width")} onChange={(e) => onChange("full_width", e.target.checked)} className="rounded" />
            Full width
          </label>
        </div>
      );

    case "video":
      return (
        <div className="space-y-4">
          <Field label="Video URL (YouTube / Vimeo / direct)"><input className={INPUT} value={str("url")} onChange={(e) => onChange("url", e.target.value)} /></Field>
          <Field label="Thumbnail URL"><input className={INPUT} value={str("thumbnail")} onChange={(e) => onChange("thumbnail", e.target.value)} /></Field>
          <div className="space-y-2">
            {(["autoplay", "muted", "controls"] as const).map((k) => (
              <label key={k} className="flex items-center gap-2 text-sm cursor-pointer capitalize">
                <input type="checkbox" checked={bool(k)} onChange={(e) => onChange(k, e.target.checked)} className="rounded" />
                {k}
              </label>
            ))}
          </div>
        </div>
      );

    case "faq":
      return (
        <div className="space-y-4">
          <Field label="Heading"><input className={INPUT} value={str("heading")} onChange={(e) => onChange("heading", e.target.value)} /></Field>
          <DynamicList
            label="Questions"
            items={arr<{ question: string; answer: string }>("items")}
            onChange={(v) => onChange("items", v)}
            schema={[
              { key: "question", label: "Question" },
              { key: "answer",   label: "Answer", textarea: true },
            ]}
          />
        </div>
      );

    case "gallery":
      return (
        <div className="space-y-4">
          <Field label="Heading"><input className={INPUT} value={str("heading")} onChange={(e) => onChange("heading", e.target.value)} /></Field>
          <Field label="Columns">
            <select className={INPUT} value={num("columns")} onChange={(e) => onChange("columns", Number(e.target.value))}>
              <option value={2}>2</option>
              <option value={3}>3</option>
              <option value={4}>4</option>
            </select>
          </Field>
          <DynamicList
            label="Images"
            items={arr<{ src: string; alt: string; caption: string }>("images")}
            onChange={(v) => onChange("images", v)}
            schema={[
              { key: "src",     label: "Image URL" },
              { key: "alt",     label: "Alt text" },
              { key: "caption", label: "Caption" },
            ]}
          />
        </div>
      );

    case "stats":
      return (
        <div className="space-y-4">
          <Field label="Heading"><input className={INPUT} value={str("heading")} onChange={(e) => onChange("heading", e.target.value)} /></Field>
          <DynamicList
            label="Stats"
            items={arr<{ label: string; value: string; icon: string }>("items")}
            onChange={(v) => onChange("items", v)}
            schema={[
              { key: "value", label: "Value (e.g. 100+)" },
              { key: "label", label: "Label (e.g. Projects)" },
              { key: "icon",  label: "Icon name (e.g. Zap, Users, Award)" },
            ]}
          />
        </div>
      );

    case "team":
      return (
        <div className="space-y-4">
          <Field label="Heading"><input className={INPUT} value={str("heading")} onChange={(e) => onChange("heading", e.target.value)} /></Field>
          <DynamicList
            label="Members"
            items={arr<{ name: string; role: string; photo: string; bio: string }>("members")}
            onChange={(v) => onChange("members", v)}
            schema={[
              { key: "name",  label: "Name" },
              { key: "role",  label: "Role / Title" },
              { key: "photo", label: "Photo URL" },
              { key: "bio",   label: "Short bio", textarea: true },
            ]}
          />
        </div>
      );

    case "services":
      return (
        <div className="space-y-4">
          <Field label="Heading"><input className={INPUT} value={str("heading")} onChange={(e) => onChange("heading", e.target.value)} /></Field>
          <Field label="Description"><textarea className={TEXTAREA} rows={2} value={str("description")} onChange={(e) => onChange("description", e.target.value)} /></Field>
          <DynamicList
            label="Services"
            items={arr<{ title: string; description: string; icon: string; href: string }>("items")}
            onChange={(v) => onChange("items", v)}
            schema={[
              { key: "title",       label: "Title" },
              { key: "description", label: "Description", textarea: true },
              { key: "icon",        label: "Icon (e.g. Zap, Brain, Cloud)" },
              { key: "href",        label: "Link URL (optional)" },
            ]}
          />
        </div>
      );

    default:
      return null;
  }
}

// ─── Add block modal ───────────────────────────────────────────────────────

function AddBlockModal({ onSelect, onClose }: { onSelect: (t: BuilderBlockType) => void; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-card border border-border rounded-2xl p-6 w-full max-w-lg shadow-2xl"
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-lg">Add Block</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-accent"><X className="h-4 w-4" /></button>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {BLOCK_TYPES.map(({ type, label, icon: Icon, description }) => (
            <button
              key={type}
              onClick={() => { onSelect(type); onClose(); }}
              className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border hover:border-brand-500/50 hover:bg-accent/50 text-center transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center group-hover:bg-brand-500/20">
                <Icon className="h-5 w-5 text-brand-400" />
              </div>
              <span className="text-sm font-medium">{label}</span>
              <span className="text-xs text-muted-foreground leading-tight">{description}</span>
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

// ─── Block row ────────────────────────────────────────────────────────────

function BlockRow({
  block, isSelected, onSelect, onDelete, onTogglePublish,
  isDragOver, draggable,
  onDragStart, onDragOver, onDragEnd,
}: {
  block: BuilderBlock;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onTogglePublish: () => void;
  isDragOver: boolean;
  draggable: boolean;
  onDragStart: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragEnd: () => void;
}) {
  const meta = BLOCK_TYPES.find((t) => t.type === block.block_type);
  const Icon = meta?.icon ?? Layers;

  return (
    <div
      draggable={draggable}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
      onClick={onSelect}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all select-none ${
        isSelected
          ? "bg-brand-500/10 border border-brand-500/40"
          : isDragOver
          ? "bg-accent border-t-2 border-brand-500"
          : "hover:bg-accent border border-transparent"
      } ${!block.is_published ? "opacity-50" : ""}`}
    >
      <GripVertical className="h-4 w-4 text-muted-foreground flex-shrink-0 cursor-grab" />
      <div className="w-7 h-7 rounded-lg bg-brand-500/10 flex items-center justify-center flex-shrink-0">
        <Icon className="h-3.5 w-3.5 text-brand-400" />
      </div>
      <span className="text-sm font-medium flex-1 capitalize">{meta?.label ?? block.block_type}</span>
      <div className="flex items-center gap-1 ml-auto" onClick={(e) => e.stopPropagation()}>
        <button onClick={onTogglePublish} className="w-6 h-6 flex items-center justify-center rounded hover:bg-background text-muted-foreground hover:text-foreground">
          {block.is_published ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
        </button>
        <button onClick={onDelete} className="w-6 h-6 flex items-center justify-center rounded hover:bg-red-500/10 text-muted-foreground hover:text-red-500">
          <Trash2 className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}

// ─── Section card ─────────────────────────────────────────────────────────

function SectionCard({
  section, slug, selectedBlockId, onSelectBlock, isDragOver,
  onDragStart, onDragOver, onDragEnd, onAddBlock, onDeleteSection,
}: {
  section: BuilderSection;
  slug: string;
  selectedBlockId: number | null;
  onSelectBlock: (b: BuilderBlock) => void;
  isDragOver: boolean;
  onDragStart: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragEnd: () => void;
  onAddBlock: (sectionId: number) => void;
  onDeleteSection: () => void;
}) {
  const qc = useQueryClient();
  const [collapsed, setCollapsed] = useState(false);
  const [blockDragFrom, setBlockDragFrom] = useState<number | null>(null);
  const [blockDragOver, setBlockDragOver] = useState<number | null>(null);

  const invalidate = () => qc.invalidateQueries({ queryKey: pbKeys.detail(slug) });

  const blocks = [...section.blocks].sort((a, b) => a.order - b.order);

  const handleBlockDrop = async (toIndex: number) => {
    if (blockDragFrom === null || blockDragFrom === toIndex) return;
    const reordered = [...blocks];
    const [moved] = reordered.splice(blockDragFrom, 1);
    reordered.splice(toIndex, 0, moved);
    await pageBuilderService.reorderBlocks(
      slug, section.id,
      reordered.map((b, i) => ({ id: b.id, order: i })),
    );
    invalidate();
    setBlockDragFrom(null);
    setBlockDragOver(null);
  };

  const toggleBlockPublish = async (block: BuilderBlock) => {
    await pageBuilderService.updateBlock(slug, section.id, block.id, { is_published: !block.is_published });
    invalidate();
  };

  const deleteBlock = async (blockId: number) => {
    await pageBuilderService.deleteBlock(slug, section.id, blockId);
    invalidate();
  };

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
      className={`rounded-2xl border bg-card transition-all ${
        isDragOver ? "border-brand-500 shadow-lg shadow-brand-500/10" : "border-border"
      } ${!section.is_published ? "opacity-60" : ""}`}
    >
      {/* Section header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
        <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab flex-shrink-0" />
        <Layers className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        <span className="font-medium text-sm flex-1">{section.label || `Section ${section.order + 1}`}</span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onAddBlock(section.id)}
            className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-brand-400 hover:bg-accent transition-colors"
          >
            <Plus className="h-3 w-3" /> Block
          </button>
          <button onClick={onDeleteSection} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-500">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
          <button onClick={() => setCollapsed((v) => !v)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-accent text-muted-foreground">
            {collapsed ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronUp className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      {/* Blocks */}
      {!collapsed && (
        <div className="p-3 space-y-1.5">
          {blocks.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">
              No blocks yet —{" "}
              <button onClick={() => onAddBlock(section.id)} className="text-brand-400 hover:underline">add one</button>
            </p>
          ) : (
            blocks.map((block, i) => (
              <BlockRow
                key={block.id}
                block={block}
                isSelected={selectedBlockId === block.id}
                onSelect={() => onSelectBlock(block)}
                onDelete={() => deleteBlock(block.id)}
                onTogglePublish={() => toggleBlockPublish(block)}
                isDragOver={blockDragOver === i && blockDragFrom !== i}
                draggable={true}
                onDragStart={() => setBlockDragFrom(i)}
                onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setBlockDragOver(i); }}
                onDragEnd={() => handleBlockDrop(blockDragOver ?? i)}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}

// ─── Right panel ──────────────────────────────────────────────────────────

function RightPanel({
  block, section, slug, onClose, onRefetch,
}: {
  block: BuilderBlock;
  section: BuilderSection;
  slug: string;
  onClose: () => void;
  onRefetch: () => void;
}) {
  const [tab, setTab]       = useState<"content" | "style" | "settings">("content");
  const [draft, setDraft]   = useState({ ...block.content_json });
  const [styleDraft, setStyleDraft] = useState({ ...block.style_json });
  const [saving, setSaving] = useState(false);

  const changeContent = useCallback((key: string, val: unknown) => {
    setDraft((prev) => ({ ...prev, [key]: val }));
  }, []);

  const changeStyle = (key: string, val: string) => {
    setStyleDraft((prev) => ({ ...prev, [key]: val }));
  };

  const save = async () => {
    setSaving(true);
    try {
      await pageBuilderService.updateBlock(slug, section.id, block.id, {
        content_json: draft,
        style_json:   styleDraft,
      });
      onRefetch();
    } finally {
      setSaving(false);
    }
  };

  const meta = BLOCK_TYPES.find((t) => t.type === block.block_type);

  return (
    <motion.aside
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.15 }}
      className="w-80 flex-shrink-0 border-l border-border flex flex-col bg-card overflow-hidden"
    >
      {/* Panel header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          {meta?.icon && <meta.icon className="h-4 w-4 text-brand-400" />}
          <span className="font-semibold text-sm capitalize">{meta?.label ?? block.block_type}</span>
        </div>
        <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-accent">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border">
        {(["content", "style", "settings"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2.5 text-xs font-medium capitalize transition-colors ${
              tab === t ? "border-b-2 border-brand-500 text-brand-400" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Panel body */}
      <div className="flex-1 overflow-y-auto p-4">
        {tab === "content" && (
          <BlockContentEditor block={block} draft={draft} onChange={changeContent} />
        )}
        {tab === "style" && (
          <div className="space-y-4">
            <Field label="Margin Top">
              <select className={INPUT} value={(styleDraft.margin_top as string) ?? ""} onChange={(e) => changeStyle("margin_top", e.target.value)}>
                <option value="">Default</option>
                <option value="mt-0">None</option>
                <option value="mt-4">Small</option>
                <option value="mt-8">Medium</option>
                <option value="mt-16">Large</option>
              </select>
            </Field>
            <Field label="Text Align">
              <select className={INPUT} value={(styleDraft.text_align as string) ?? ""} onChange={(e) => changeStyle("text_align", e.target.value)}>
                <option value="">Default</option>
                <option value="text-left">Left</option>
                <option value="text-center">Center</option>
                <option value="text-right">Right</option>
              </select>
            </Field>
            <Field label="Custom CSS Classes">
              <input className={INPUT} value={(styleDraft.custom_class as string) ?? ""} onChange={(e) => changeStyle("custom_class", e.target.value)} placeholder="e.g. rounded-2xl shadow-lg" />
            </Field>
          </div>
        )}
        {tab === "settings" && (
          <div className="space-y-4">
            <label className="flex items-center justify-between text-sm">
              <span>Published</span>
              <input
                type="checkbox"
                checked={block.is_published}
                onChange={async (e) => {
                  await pageBuilderService.updateBlock(slug, section.id, block.id, { is_published: e.target.checked });
                  onRefetch();
                }}
                className="rounded"
              />
            </label>
            <p className="text-xs text-muted-foreground">Block type: <strong>{block.block_type}</strong></p>
            <p className="text-xs text-muted-foreground">Block ID: <strong>{block.id}</strong></p>
          </div>
        )}
      </div>

      {/* Save */}
      {tab !== "settings" && (
        <div className="p-4 border-t border-border">
          <button
            onClick={save}
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 disabled:opacity-60 transition-colors"
          >
            <Save className="h-4 w-4" />
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      )}
    </motion.aside>
  );
}

// ─── Page editor ──────────────────────────────────────────────────────────

export default function PageEditorPage() {
  const { slug } = useParams<{ slug: string }>();
  const qc = useQueryClient();

  const [selectedBlock,   setSelectedBlock]   = useState<BuilderBlock | null>(null);
  const [selectedSection, setSelectedSection] = useState<BuilderSection | null>(null);
  const [addBlockTarget,  setAddBlockTarget]  = useState<number | null>(null);
  const [sectionDragFrom, setSectionDragFrom] = useState<number | null>(null);
  const [sectionDragOver, setSectionDragOver] = useState<number | null>(null);

  const { data: page, isLoading, refetch } = useQuery({
    queryKey: pbKeys.detail(slug ?? ""),
    queryFn:  () => pageBuilderService.getPage(slug!).then((r) => r.data),
    enabled: !!slug,
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: pbKeys.detail(slug ?? "") });

  if (!slug) return null;

  // ── Mutations ────────────────────────────────────────────────────────────

  const addSection = async () => {
    const count = page?.sections.length ?? 0;
    await pageBuilderService.createSection(slug, { label: `Section ${count + 1}` });
    invalidate();
  };

  const deleteSection = async (sectionId: number) => {
    await pageBuilderService.deleteSection(slug, sectionId);
    if (selectedSection?.id === sectionId) { setSelectedBlock(null); setSelectedSection(null); }
    invalidate();
  };

  const addBlock = async (sectionId: number, blockType: BuilderBlockType) => {
    await pageBuilderService.createBlock(slug, sectionId, blockType);
    invalidate();
  };

  const togglePublish = async () => {
    if (!page) return;
    await pageBuilderService.updatePage(slug, { is_published: !page.is_published });
    invalidate();
  };

  // ── Section DnD ──────────────────────────────────────────────────────────

  const handleSectionDrop = async (toIndex: number) => {
    if (sectionDragFrom === null || sectionDragFrom === toIndex || !page) return;
    const sorted = [...page.sections].sort((a, b) => a.order - b.order);
    const [moved] = sorted.splice(sectionDragFrom, 1);
    sorted.splice(toIndex, 0, moved);
    await pageBuilderService.reorderSections(slug, sorted.map((s, i) => ({ id: s.id, order: i })));
    setSectionDragFrom(null);
    setSectionDragOver(null);
    invalidate();
  };

  // ─────────────────────────────────────────────────────────────────────────

  const sortedSections = [...(page?.sections ?? [])].sort((a, b) => a.order - b.order);

  return (
    <div className="flex flex-col h-full -m-6">
      {/* Editor header */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-border bg-card flex-shrink-0">
        <div className="flex items-center gap-3">
          <Link to="/dashboard/pages" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" /> Pages
          </Link>
          <span className="text-muted-foreground">/</span>
          <span className="font-semibold text-sm truncate max-w-48">{page?.title ?? "…"}</span>
        </div>
        <div className="flex items-center gap-3">
          {page && (
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
              page.is_published ? "bg-green-500/10 text-green-500" : "bg-accent text-muted-foreground"
            }`}>
              {page.is_published ? "Live" : "Draft"}
            </span>
          )}
          <button
            onClick={togglePublish}
            disabled={!page}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-sm hover:bg-accent transition-colors disabled:opacity-50"
          >
            {page?.is_published ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            {page?.is_published ? "Unpublish" : "Publish"}
          </button>
          {page?.is_published && (
            <a
              href={`/p/${slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-500 text-white text-sm hover:bg-brand-600 transition-colors"
            >
              <Eye className="h-3.5 w-3.5" /> Preview
            </a>
          )}
        </div>
      </header>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Canvas */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => <div key={i} className="h-32 rounded-2xl bg-muted animate-pulse" />)}
            </div>
          ) : sortedSections.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 text-center">
              <div className="w-16 h-16 rounded-2xl bg-accent flex items-center justify-center mb-4">
                <Layers className="h-8 w-8 text-muted-foreground opacity-50" />
              </div>
              <p className="text-lg font-medium mb-2">No sections yet</p>
              <p className="text-sm text-muted-foreground mb-6">Add a section to start building.</p>
              <button
                onClick={addSection}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-500 text-white text-sm font-medium"
              >
                <Plus className="h-4 w-4" /> Add Section
              </button>
            </div>
          ) : (
            <>
              {sortedSections.map((section, i) => (
                <SectionCard
                  key={section.id}
                  section={section}
                  slug={slug}
                  selectedBlockId={selectedBlock?.id ?? null}
                  onSelectBlock={(block) => { setSelectedBlock(block); setSelectedSection(section); }}
                  isDragOver={sectionDragOver === i && sectionDragFrom !== i}
                  onDragStart={() => setSectionDragFrom(i)}
                  onDragOver={(e) => { e.preventDefault(); setSectionDragOver(i); }}
                  onDragEnd={() => handleSectionDrop(sectionDragOver ?? i)}
                  onAddBlock={(sId) => setAddBlockTarget(sId)}
                  onDeleteSection={() => deleteSection(section.id)}
                />
              ))}
              <button
                onClick={addSection}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed border-border hover:border-brand-500/50 text-sm text-muted-foreground hover:text-foreground transition-all"
              >
                <Plus className="h-4 w-4" /> Add Section
              </button>
            </>
          )}
        </div>

        {/* Right panel */}
        <AnimatePresence>
          {selectedBlock && selectedSection && (
            <RightPanel
              block={selectedBlock}
              section={selectedSection}
              slug={slug}
              onClose={() => { setSelectedBlock(null); setSelectedSection(null); }}
              onRefetch={() => {
                invalidate();
                // Refresh selected block state from latest data
                refetch().then((res) => {
                  if (!res.data) return;
                  const sec = res.data.sections.find((s) => s.id === selectedSection.id);
                  const blk = sec?.blocks.find((b) => b.id === selectedBlock.id);
                  if (blk) setSelectedBlock(blk);
                });
              }}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Add block modal */}
      <AnimatePresence>
        {addBlockTarget !== null && (
          <AddBlockModal
            onSelect={(type) => { addBlock(addBlockTarget, type); setAddBlockTarget(null); }}
            onClose={() => setAddBlockTarget(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

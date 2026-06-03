import { useState, useCallback, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Languages, FileText, Layout, CheckCircle2, Circle,
  Save, Search, Plus, ChevronRight, Globe,
} from "lucide-react";
import {
  translationsService,
  translationsKeys,
  type TranslatableModel,
  type TranslatableObject,
} from "@/services/translationsService";

// ─── Shared ──────────────────────────────────────────────────────────────────

const LANG_META: Record<string, { label: string; flag: string }> = {
  en: { label: "English",  flag: "🇬🇧" },
  bn: { label: "বাংলা",    flag: "🇧🇩" },
  ar: { label: "العربية",  flag: "🇸🇦" },
};

const TARGET_LANGS = ["bn"]; // ar added when active

type Tab = "content" | "ui" | "languages";

// ─── Languages tab ───────────────────────────────────────────────────────────

function LanguagesTab() {
  const qc = useQueryClient();
  const { data: langs = [], isLoading } = useQuery({
    queryKey: translationsKeys.languages,
    queryFn:  () => translationsService.getLanguages().then((r) => r.data),
    staleTime: 60_000,
  });

  const toggleActive = useMutation({
    mutationFn: ({ code, is_active }: { code: string; is_active: boolean }) =>
      translationsService.updateLanguage(code, { is_active }),
    onSuccess: () => qc.invalidateQueries({ queryKey: translationsKeys.languages }),
  });

  return (
    <div className="space-y-3">
      {isLoading ? (
        [1, 2, 3].map((i) => <div key={i} className="h-16 rounded-xl bg-muted animate-pulse" />)
      ) : (
        langs.map((lang) => (
          <div
            key={lang.code}
            className="flex items-center gap-4 p-4 rounded-2xl bg-card border border-border"
          >
            <span className="text-2xl">{LANG_META[lang.code]?.flag ?? "🌐"}</span>
            <div className="flex-1">
              <div className="font-semibold text-sm">{lang.name}</div>
              <div className="text-xs text-muted-foreground">
                {lang.native_name} · {lang.direction.toUpperCase()} · code: {lang.code}
                {lang.is_default && (
                  <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] bg-brand-500/10 text-brand-400">
                    default
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={() => toggleActive.mutate({ code: lang.code, is_active: !lang.is_active })}
              disabled={lang.is_default}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                lang.is_active
                  ? "bg-green-500/10 text-green-500 hover:bg-red-500/10 hover:text-red-500"
                  : "bg-accent text-muted-foreground hover:bg-green-500/10 hover:text-green-500"
              } disabled:opacity-40 disabled:cursor-not-allowed`}
            >
              {lang.is_active ? "Active" : "Inactive"}
            </button>
          </div>
        ))
      )}
      <p className="text-xs text-muted-foreground pt-2">
        Arabic is prepared and can be activated when content translations are ready.
        Run <code className="font-mono bg-accent px-1 rounded">python manage.py seed_languages</code> to initialise.
      </p>
    </div>
  );
}

// ─── UI Strings tab ──────────────────────────────────────────────────────────

function UIStringsTab() {
  const qc = useQueryClient();
  const [activeLang, setActiveLang] = useState("bn");
  const [search, setSearch] = useState("");
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  const { data: strings = [], isLoading } = useQuery({
    queryKey: translationsKeys.ui(activeLang),
    queryFn:  () => translationsService.getUIStringsList(activeLang).then((r) => r.data),
    staleTime: 30_000,
  });

  const saveMut = useMutation({
    mutationFn: ({ key, value }: { key: string; value: string }) =>
      translationsService.saveUIString(activeLang, key, value),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: translationsKeys.ui(activeLang) });
      setEditingKey(null);
    },
  });

  const addMut = useMutation({
    mutationFn: () =>
      translationsService.saveUIString(activeLang, newKey.trim(), newValue.trim()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: translationsKeys.ui(activeLang) });
      setNewKey("");
      setNewValue("");
      setShowAddForm(false);
    },
  });

  const filtered = strings.filter(
    (s) =>
      !search ||
      s.key.toLowerCase().includes(search.toLowerCase()) ||
      s.value.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        {/* Lang tabs */}
        <div className="flex items-center gap-1 p-1 bg-accent rounded-xl">
          {TARGET_LANGS.map((code) => (
            <button
              key={code}
              onClick={() => setActiveLang(code)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                activeLang === code
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {LANG_META[code]?.flag} {LANG_META[code]?.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 flex-1 min-w-40 px-3 py-2 rounded-xl bg-card border border-border">
          <Search className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search keys…"
            className="flex-1 bg-transparent text-sm outline-none"
          />
        </div>

        <button
          onClick={() => setShowAddForm((v) => !v)}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 transition-colors"
        >
          <Plus className="h-3.5 w-3.5" /> Add Key
        </button>
      </div>

      {/* Add form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 rounded-xl border border-brand-500/30 bg-brand-500/5 space-y-3">
              <h4 className="text-sm font-semibold">New UI String</h4>
              <div className="grid grid-cols-2 gap-3">
                <input
                  value={newKey}
                  onChange={(e) => setNewKey(e.target.value)}
                  placeholder="key.path"
                  className="px-3 py-2 rounded-lg bg-background border border-border text-sm outline-none focus:border-brand-500/50 font-mono"
                />
                <input
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  placeholder={`Translation in ${LANG_META[activeLang]?.label}`}
                  className="px-3 py-2 rounded-lg bg-background border border-border text-sm outline-none focus:border-brand-500/50"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowAddForm(false)}
                  className="px-3 py-1.5 rounded-lg border border-border text-sm hover:bg-accent"
                >
                  Cancel
                </button>
                <button
                  onClick={() => addMut.mutate()}
                  disabled={!newKey.trim() || !newValue.trim() || addMut.isPending}
                  className="px-3 py-1.5 rounded-lg bg-brand-500 text-white text-sm hover:bg-brand-600 disabled:opacity-50"
                >
                  {addMut.isPending ? "Saving…" : "Add"}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Strings table */}
      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-10 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <div className="grid grid-cols-[1fr_1fr_auto] gap-px bg-border">
            <div className="bg-card px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-widest">
              Key
            </div>
            <div className="bg-card px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-widest">
              {LANG_META[activeLang]?.label}
            </div>
            <div className="bg-card px-4 py-2.5" />
          </div>

          <div className="divide-y divide-border">
            {filtered.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                No strings found
              </div>
            ) : (
              filtered.map((s) => (
                <div key={s.key} className="grid grid-cols-[1fr_1fr_auto] gap-px bg-border">
                  <div className="bg-card px-4 py-2.5 flex items-center">
                    <span className="font-mono text-xs text-muted-foreground">{s.key}</span>
                  </div>
                  <div className="bg-card px-4 py-2.5 flex items-center">
                    {editingKey === s.key ? (
                      <input
                        autoFocus
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveMut.mutate({ key: s.key, value: editValue });
                          if (e.key === "Escape") setEditingKey(null);
                        }}
                        className="w-full bg-background border border-brand-500/50 rounded-lg px-2 py-1 text-sm outline-none"
                      />
                    ) : (
                      <span
                        className="text-sm cursor-text hover:text-foreground text-foreground/80 w-full"
                        onClick={() => {
                          setEditingKey(s.key);
                          setEditValue(s.value);
                        }}
                      >
                        {s.value || (
                          <span className="text-muted-foreground italic">— click to edit</span>
                        )}
                      </span>
                    )}
                  </div>
                  <div className="bg-card px-4 py-2.5 flex items-center">
                    {editingKey === s.key ? (
                      <button
                        onClick={() => saveMut.mutate({ key: s.key, value: editValue })}
                        disabled={saveMut.isPending}
                        className="w-7 h-7 flex items-center justify-center rounded-lg bg-brand-500 text-white hover:bg-brand-600 disabled:opacity-50"
                      >
                        <Save className="h-3 w-3" />
                      </button>
                    ) : (
                      <button
                        onClick={() => { setEditingKey(s.key); setEditValue(s.value); }}
                        className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-accent text-muted-foreground"
                      >
                        <Save className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
      <p className="text-xs text-muted-foreground">
        {filtered.length} of {strings.length} strings · Click a value to edit inline · Press Enter to save
      </p>
    </div>
  );
}

// ─── Content tab ─────────────────────────────────────────────────────────────

function ContentEditor({
  model,
  obj,
}: {
  model: TranslatableModel;
  obj: TranslatableObject;
}) {
  const qc = useQueryClient();
  const [activeLang, setActiveLang] = useState("bn");
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);

  const contentKey = translationsKeys.content(model.app_label, model.model_name, obj.id);

  const { data: translations, isLoading } = useQuery({
    queryKey: contentKey,
    queryFn: () =>
      translationsService
        .getContentTranslations(model.app_label, model.model_name, obj.id)
        .then((r) => r.data),
    staleTime: 30_000,
  });

  const saveMut = useMutation({
    mutationFn: () =>
      translationsService.saveContentTranslations(
        model.app_label,
        model.model_name,
        obj.id,
        activeLang,
        drafts
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: contentKey });
      qc.invalidateQueries({ queryKey: translationsKeys.objects(model.app_label, model.model_name) });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      setDrafts({});
    },
  });

  const currentTrans = useMemo(() => translations?.[activeLang] ?? {}, [translations, activeLang]);
  const sourceTrans  = useMemo(() => translations?.["en"] ?? {}, [translations]);

  const getValue = useCallback(
    (field: string) => drafts[field] ?? currentTrans[field] ?? "",
    [drafts, currentTrans]
  );

  const hasDraft = Object.keys(drafts).length > 0;

  return (
    <div className="space-y-4">
      {/* Lang selector */}
      <div className="flex items-center gap-3 justify-between flex-wrap">
        <div className="flex items-center gap-1 p-1 bg-accent rounded-xl">
          {TARGET_LANGS.map((code) => (
            <button
              key={code}
              onClick={() => { setActiveLang(code); setDrafts({}); }}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                activeLang === code
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {LANG_META[code]?.flag} {LANG_META[code]?.label}
            </button>
          ))}
        </div>
        <button
          onClick={() => saveMut.mutate()}
          disabled={!hasDraft || saveMut.isPending}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            saved
              ? "bg-green-500/10 text-green-500"
              : "bg-brand-500 text-white hover:bg-brand-600 disabled:opacity-40"
          }`}
        >
          {saved ? (
            <><CheckCircle2 className="h-4 w-4" /> Saved</>
          ) : (
            <><Save className="h-4 w-4" />{saveMut.isPending ? "Saving…" : "Save Translation"}</>
          )}
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />)}
        </div>
      ) : (
        <div className="space-y-4">
          {model.fields.map((f) => (
            <div key={f.name} className="grid grid-cols-2 gap-3">
              {/* English source */}
              <div>
                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest block mb-1">
                  🇬🇧 English — {f.name}
                </label>
                {f.long ? (
                  <textarea
                    readOnly
                    value={sourceTrans[f.name] ?? ""}
                    rows={4}
                    className="w-full px-3 py-2 rounded-xl bg-accent border border-border text-sm resize-none text-muted-foreground"
                  />
                ) : (
                  <input
                    readOnly
                    value={sourceTrans[f.name] ?? ""}
                    className="w-full px-3 py-2 rounded-xl bg-accent border border-border text-sm text-muted-foreground"
                  />
                )}
              </div>

              {/* Target language */}
              <div>
                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest block mb-1">
                  {LANG_META[activeLang]?.flag} {LANG_META[activeLang]?.label} — {f.name}
                  {getValue(f.name) && (
                    <span className="ml-2 text-green-500">✓</span>
                  )}
                </label>
                {f.long ? (
                  <textarea
                    value={getValue(f.name)}
                    onChange={(e) => setDrafts((d) => ({ ...d, [f.name]: e.target.value }))}
                    rows={4}
                    placeholder={`Enter ${LANG_META[activeLang]?.label} translation…`}
                    className="w-full px-3 py-2 rounded-xl bg-background border border-border text-sm resize-none outline-none focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/20"
                  />
                ) : (
                  <input
                    value={getValue(f.name)}
                    onChange={(e) => setDrafts((d) => ({ ...d, [f.name]: e.target.value }))}
                    placeholder={`Enter ${LANG_META[activeLang]?.label} translation…`}
                    className="w-full px-3 py-2 rounded-xl bg-background border border-border text-sm outline-none focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/20"
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ContentTab() {
  const [selectedModel, setSelectedModel] = useState<TranslatableModel | null>(null);
  const [selectedObj, setSelectedObj] = useState<TranslatableObject | null>(null);

  const { data: models = [], isLoading: modelsLoading } = useQuery({
    queryKey: translationsKeys.models,
    queryFn:  () => translationsService.getModels().then((r) => r.data),
    staleTime: 60_000,
  });

  const { data: objectsData, isLoading: objsLoading } = useQuery({
    queryKey: selectedModel
      ? translationsKeys.objects(selectedModel.app_label, selectedModel.model_name)
      : ["noop"],
    queryFn: () =>
      translationsService
        .getObjects(selectedModel!.app_label, selectedModel!.model_name)
        .then((r) => r.data),
    enabled: !!selectedModel,
    staleTime: 30_000,
  });

  return (
    <div className="grid grid-cols-[220px_1fr] gap-4 min-h-[500px]">
      {/* Left: model + object list */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest px-1 mb-2">
          Content Type
        </p>
        {modelsLoading ? (
          [1, 2, 3].map((i) => <div key={i} className="h-9 rounded-xl bg-muted animate-pulse" />)
        ) : (
          models.map((m) => (
            <button
              key={m.key}
              onClick={() => { setSelectedModel(m); setSelectedObj(null); }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-all ${
                selectedModel?.key === m.key
                  ? "bg-brand-500/10 text-brand-400 border border-brand-500/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              }`}
            >
              <span className="flex items-center gap-2">
                <FileText className="h-3.5 w-3.5" />
                {m.label}
              </span>
              <ChevronRight className="h-3 w-3" />
            </button>
          ))
        )}

        {/* Object list */}
        {selectedModel && (
          <div className="mt-4 space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest px-1 mb-2">
              Items
            </p>
            {objsLoading ? (
              [1, 2, 3].map((i) => <div key={i} className="h-8 rounded-lg bg-muted animate-pulse" />)
            ) : (
              (objectsData?.objects ?? []).map((obj) => (
                <button
                  key={obj.id}
                  onClick={() => setSelectedObj(obj)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs transition-all text-left ${
                    selectedObj?.id === obj.id
                      ? "bg-brand-500/10 text-brand-400 border border-brand-500/20"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  }`}
                >
                  {obj.translated_languages.length > 0 ? (
                    <CheckCircle2 className="h-3 w-3 text-green-500 flex-shrink-0" />
                  ) : (
                    <Circle className="h-3 w-3 flex-shrink-0" />
                  )}
                  <span className="truncate">{obj.title}</span>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {/* Right: translation editor */}
      <div className="rounded-2xl bg-card border border-border p-5">
        {!selectedModel ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-16">
            <Globe className="h-10 w-10 text-muted-foreground opacity-30 mb-3" />
            <p className="text-muted-foreground text-sm">Select a content type to begin translating</p>
          </div>
        ) : !selectedObj ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-16">
            <FileText className="h-10 w-10 text-muted-foreground opacity-30 mb-3" />
            <p className="text-muted-foreground text-sm">Select an item from the list</p>
          </div>
        ) : (
          <ContentEditor model={selectedModel} obj={selectedObj} />
        )}
      </div>
    </div>
  );
}

// ─── Main page ───────────────────────────────────────────────────────────────

export default function TranslationsPage() {
  const [tab, setTab] = useState<Tab>("content");

  const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "content",   label: "Content",    icon: Layout    },
    { id: "ui",        label: "UI Strings", icon: FileText  },
    { id: "languages", label: "Languages",  icon: Languages },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Translations</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Manage multilingual content · English · বাংলা · Arabic-ready
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-accent rounded-xl w-fit">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
              tab === id
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </div>

      <motion.div
        key={tab}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.15 }}
      >
        {tab === "content"   && <ContentTab />}
        {tab === "ui"        && <UIStringsTab />}
        {tab === "languages" && <LanguagesTab />}
      </motion.div>
    </div>
  );
}

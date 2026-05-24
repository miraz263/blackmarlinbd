import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle, Bot, ChevronDown, ChevronRight, Copy, FileText,
  Loader2, Plus, Search, Send, Sparkles, Target, Trash2, TrendingUp, Users,
} from "lucide-react";
import {
  aiService,
  type BlogResponse, type ChatMessage, type ChatSessionSummary,
  type FAQItem, type LeadResponse, type SEOResponse,
} from "@/services/aiService";

// ─── Shared helpers ───────────────────────────────────────────────────────────

type Provider = "openai" | "gemini";

function ProviderToggle({
  value, onChange,
}: { value: Provider; onChange: (p: Provider) => void }) {
  return (
    <div className="flex items-center gap-1 p-1 bg-accent rounded-xl text-xs font-medium">
      {(["openai", "gemini"] as Provider[]).map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className={`px-3 py-1 rounded-lg transition-all ${
            value === p ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {p === "openai" ? "OpenAI" : "Gemini"}
        </button>
      ))}
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button onClick={copy} className="p-1.5 rounded-lg hover:bg-accent transition-colors" title="Copy">
      <Copy className={`h-3.5 w-3.5 ${copied ? "text-green-500" : "text-muted-foreground"}`} />
    </button>
  );
}

function Spinner() {
  return <Loader2 className="h-4 w-4 animate-spin text-brand-500" />;
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
      <AlertCircle className="h-4 w-4 flex-shrink-0" />
      {message}
    </div>
  );
}

// ─── Score Ring (pure SVG) ────────────────────────────────────────────────────

function ScoreRing({ score, size = 80 }: { score: number; size?: number }) {
  const r   = (size - 12) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  const color = score >= 70 ? "#22c55e" : score >= 45 ? "#f59e0b" : "#ef4444";

  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor"
        strokeWidth={6} className="text-muted/20" />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color}
        strokeWidth={6} strokeLinecap="round"
        strokeDasharray={`${dash} ${circ - dash}`} />
      <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle"
        className="rotate-90" style={{ rotate: "90deg", transformOrigin: "center", fill: color, fontSize: 18, fontWeight: 700 }}>
        {score}
      </text>
    </svg>
  );
}

// ─── Tab: Blog Writer ─────────────────────────────────────────────────────────

function BlogTab() {
  const [topic,    setTopic]    = useState("");
  const [keywords, setKeywords] = useState("");
  const [tone,     setTone]     = useState<"professional" | "conversational" | "technical" | "enthusiastic">("professional");
  const [length,   setLength]   = useState<"short" | "medium" | "long">("medium");
  const [provider, setProvider] = useState<Provider>("openai");
  const [result,   setResult]   = useState<BlogResponse | null>(null);

  const mut = useMutation({
    mutationFn: () =>
      aiService.generateBlog({
        topic,
        keywords: keywords.split(",").map((k) => k.trim()).filter(Boolean),
        tone,
        length,
        provider,
      }).then((r) => r.data),
    onSuccess: setResult,
  });

  return (
    <div className="grid lg:grid-cols-2 gap-6 h-full">
      {/* Left — form */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Blog Writer</h3>
          <ProviderToggle value={provider} onChange={setProvider} />
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Topic *</label>
            <input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Benefits of AI in financial services"
              className="w-full px-3 py-2 rounded-xl bg-accent border-0 focus:ring-2 focus:ring-brand-500/30 text-sm outline-none"
            />
          </div>

          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Keywords (comma separated)</label>
            <input
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder="fintech, AI, machine learning"
              className="w-full px-3 py-2 rounded-xl bg-accent border-0 focus:ring-2 focus:ring-brand-500/30 text-sm outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Tone</label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value as typeof tone)}
                className="w-full px-3 py-2 rounded-xl bg-accent text-sm outline-none focus:ring-2 focus:ring-brand-500/30"
              >
                <option value="professional">Professional</option>
                <option value="conversational">Conversational</option>
                <option value="technical">Technical</option>
                <option value="enthusiastic">Enthusiastic</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Length</label>
              <select
                value={length}
                onChange={(e) => setLength(e.target.value as typeof length)}
                className="w-full px-3 py-2 rounded-xl bg-accent text-sm outline-none focus:ring-2 focus:ring-brand-500/30"
              >
                <option value="short">Short (~400 words)</option>
                <option value="medium">Medium (~800 words)</option>
                <option value="long">Long (~1500 words)</option>
              </select>
            </div>
          </div>
        </div>

        <button
          onClick={() => mut.mutate()}
          disabled={!topic.trim() || mut.isPending}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {mut.isPending ? <Spinner /> : <Sparkles className="h-4 w-4" />}
          {mut.isPending ? "Generating…" : "Generate Blog Post"}
        </button>

        {mut.isError && <ErrorBanner message={(mut.error as Error).message} />}
      </div>

      {/* Right — output */}
      <div className="bg-accent/40 rounded-2xl p-4 overflow-y-auto max-h-[600px]">
        {!result ? (
          <div className="flex flex-col items-center justify-center h-48 text-muted-foreground text-sm">
            <FileText className="h-10 w-10 mb-3 opacity-30" />
            Generated blog post will appear here
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-2">
              <h2 className="font-bold text-lg leading-tight">{result.title}</h2>
              <CopyButton text={`# ${result.title}\n\n${result.content}`} />
            </div>
            <p className="text-sm text-muted-foreground italic">{result.excerpt}</p>
            <div className="flex flex-wrap gap-1.5">
              {result.tags.map((t) => (
                <span key={t} className="px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-400 text-xs">{t}</span>
              ))}
            </div>
            <div className="border-t border-border pt-3">
              <p className="text-xs text-muted-foreground mb-1 font-medium">META DESCRIPTION</p>
              <p className="text-sm">{result.meta_description}</p>
            </div>
            <div className="border-t border-border pt-3">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-muted-foreground font-medium">CONTENT</p>
                <CopyButton text={result.content} />
              </div>
              <pre className="whitespace-pre-wrap text-sm font-mono text-foreground/80 leading-relaxed">
                {result.content}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Tab: SEO Assistant ───────────────────────────────────────────────────────

function SEOTab() {
  const [content,  setContent]  = useState("");
  const [keywords, setKeywords] = useState("");
  const [url,      setUrl]      = useState("");
  const [provider, setProvider] = useState<Provider>("openai");
  const [result,   setResult]   = useState<SEOResponse | null>(null);

  const mut = useMutation({
    mutationFn: () =>
      aiService.analyzeSEO({
        content,
        target_keywords: keywords.split(",").map((k) => k.trim()).filter(Boolean),
        page_url: url,
        provider,
      }).then((r) => r.data),
    onSuccess: setResult,
  });

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">SEO Assistant</h3>
          <ProviderToggle value={provider} onChange={setProvider} />
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Page URL (optional)</label>
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://blackmarlinbd.com/services"
              className="w-full px-3 py-2 rounded-xl bg-accent text-sm outline-none focus:ring-2 focus:ring-brand-500/30"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Target Keywords</label>
            <input
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder="ai consulting, machine learning"
              className="w-full px-3 py-2 rounded-xl bg-accent text-sm outline-none focus:ring-2 focus:ring-brand-500/30"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Page Content *</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste your page content here…"
              rows={8}
              className="w-full px-3 py-2 rounded-xl bg-accent text-sm outline-none focus:ring-2 focus:ring-brand-500/30 resize-none"
            />
          </div>
        </div>

        <button
          onClick={() => mut.mutate()}
          disabled={!content.trim() || mut.isPending}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {mut.isPending ? <Spinner /> : <Search className="h-4 w-4" />}
          {mut.isPending ? "Analysing…" : "Analyse SEO"}
        </button>

        {mut.isError && <ErrorBanner message={(mut.error as Error).message} />}
      </div>

      <div className="space-y-4">
        {!result ? (
          <div className="flex flex-col items-center justify-center h-48 rounded-2xl bg-accent/40 text-muted-foreground text-sm">
            <TrendingUp className="h-10 w-10 mb-3 opacity-30" />
            SEO analysis will appear here
          </div>
        ) : (
          <>
            <div className="flex items-center gap-6 p-4 rounded-2xl bg-accent/40">
              <ScoreRing score={result.score} />
              <div className="space-y-1">
                <p className="font-semibold text-lg">SEO Score: {result.score}/100</p>
                <p className="text-sm text-muted-foreground">Readability: {result.readability}</p>
                <p className="text-sm text-muted-foreground">Rank Potential: {result.estimated_rank_potential}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <SeoCard title="Issues" items={result.issues} color="red" />
              <SeoCard title="Strengths" items={result.strengths} color="green" />
            </div>

            <div className="p-4 rounded-2xl bg-accent/40 space-y-2">
              <p className="text-xs font-medium text-muted-foreground">SUGGESTIONS</p>
              {result.suggestions.map((s, i) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  <ChevronRight className="h-3.5 w-3.5 mt-0.5 text-brand-500 flex-shrink-0" />
                  {s}
                </div>
              ))}
            </div>

            <div className="p-4 rounded-2xl bg-accent/40 space-y-2 text-sm">
              <p className="text-xs font-medium text-muted-foreground mb-2">SUGGESTED META</p>
              <p><span className="font-medium">Title: </span>{result.title_suggestion}</p>
              <p><span className="font-medium">H1: </span>{result.h1_suggestion}</p>
              <p><span className="font-medium">Meta: </span>{result.meta_description}</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function SeoCard({ title, items, color }: { title: string; items: string[]; color: "red" | "green" }) {
  const cls = color === "red"
    ? "bg-red-500/10 border-red-500/20 text-red-400"
    : "bg-green-500/10 border-green-500/20 text-green-400";
  return (
    <div className={`p-3 rounded-xl border ${cls} space-y-1.5`}>
      <p className="text-xs font-semibold uppercase tracking-wide">{title}</p>
      {items.map((item, i) => (
        <p key={i} className="text-xs text-foreground/80">{item}</p>
      ))}
    </div>
  );
}

// ─── Tab: FAQ Generator ───────────────────────────────────────────────────────

function FAQTab() {
  const [topic,    setTopic]    = useState("");
  const [count,    setCount]    = useState(5);
  const [audience, setAudience] = useState("general audience");
  const [provider, setProvider] = useState<Provider>("openai");
  const [faqs,     setFaqs]     = useState<FAQItem[]>([]);
  const [open,     setOpen]     = useState<number | null>(null);

  const mut = useMutation({
    mutationFn: () =>
      aiService.generateFAQ({ topic, count, audience, provider }).then((r) => r.data),
    onSuccess: (data) => { setFaqs(data.faqs); setOpen(0); },
  });

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">FAQ Generator</h3>
          <ProviderToggle value={provider} onChange={setProvider} />
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Topic *</label>
            <input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Cloud migration for enterprises"
              className="w-full px-3 py-2 rounded-xl bg-accent text-sm outline-none focus:ring-2 focus:ring-brand-500/30"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Number of FAQs</label>
              <input
                type="number" min={3} max={20}
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-accent text-sm outline-none focus:ring-2 focus:ring-brand-500/30"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Target Audience</label>
              <input
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                placeholder="CTOs, developers…"
                className="w-full px-3 py-2 rounded-xl bg-accent text-sm outline-none focus:ring-2 focus:ring-brand-500/30"
              />
            </div>
          </div>
        </div>

        <button
          onClick={() => mut.mutate()}
          disabled={!topic.trim() || mut.isPending}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {mut.isPending ? <Spinner /> : <Sparkles className="h-4 w-4" />}
          {mut.isPending ? "Generating…" : "Generate FAQs"}
        </button>

        {mut.isError && <ErrorBanner message={(mut.error as Error).message} />}
      </div>

      <div className="space-y-2 max-h-[560px] overflow-y-auto">
        {faqs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 rounded-2xl bg-accent/40 text-muted-foreground text-sm">
            <Bot className="h-10 w-10 mb-3 opacity-30" />
            Generated FAQs will appear here
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium">{faqs.length} FAQs generated</p>
              <CopyButton text={faqs.map((f, i) => `Q${i + 1}: ${f.question}\nA: ${f.answer}`).join("\n\n")} />
            </div>
            {faqs.map((faq, i) => (
              <div key={i} className="rounded-xl border border-border overflow-hidden">
                <button
                  onClick={() => setOpen(open === i ? null : i)}
                  className="w-full flex items-center justify-between px-4 py-3 text-left text-sm font-medium hover:bg-accent/50 transition-colors"
                >
                  <span>{faq.question}</span>
                  <ChevronDown className={`h-4 w-4 text-muted-foreground flex-shrink-0 transition-transform ${open === i ? "rotate-180" : ""}`} />
                </button>
                {open === i && (
                  <div className="px-4 pb-3 text-sm text-muted-foreground border-t border-border pt-3">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

// ─── Tab: Chatbot ─────────────────────────────────────────────────────────────

function ChatTab() {
  const qc = useQueryClient();
  const [sessionId,  setSessionId]  = useState<number | null>(null);
  const [context,    setContext]    = useState<"general" | "sales" | "support" | "technical">("general");
  const [provider,   setProvider]   = useState<Provider>("openai");
  const [input,      setInput]      = useState("");
  const [messages,   setMessages]   = useState<ChatMessage[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data: sessions = [] } = useQuery({
    queryKey: ["ai", "sessions"],
    queryFn: () => aiService.getSessions().then((r) => r.data),
  });

  const { data: sessionData } = useQuery({
    queryKey: ["ai", "session", sessionId],
    queryFn:  () => aiService.getSession(sessionId!).then((r) => r.data),
    enabled:  !!sessionId,
  });

  useEffect(() => {
    if (sessionData) setMessages(sessionData.messages);
  }, [sessionData]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMut = useMutation({
    mutationFn: (msg: string) =>
      aiService.sendMessage({ message: msg, session_id: sessionId, context, provider }).then((r) => r.data),
    onSuccess: (data) => {
      setSessionId(data.session_id);
      setMessages((prev) => [
        ...prev,
        { id: Date.now(), role: "assistant", content: data.message, tokens: 0, created_at: new Date().toISOString() },
      ]);
      qc.invalidateQueries({ queryKey: ["ai", "sessions"] });
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => aiService.deleteSession(id),
    onSuccess:  () => {
      setSessionId(null);
      setMessages([]);
      qc.invalidateQueries({ queryKey: ["ai", "sessions"] });
    },
  });

  const handleSend = () => {
    const msg = input.trim();
    if (!msg || sendMut.isPending) return;
    setMessages((prev) => [
      ...prev,
      { id: Date.now() - 1, role: "user", content: msg, tokens: 0, created_at: new Date().toISOString() },
    ]);
    setInput("");
    sendMut.mutate(msg);
  };

  const loadSession = (s: ChatSessionSummary) => {
    setSessionId(s.id);
    setMessages([]);
  };

  const newChat = () => {
    setSessionId(null);
    setMessages([]);
  };

  return (
    <div className="flex gap-4 h-[560px]">
      {/* Session sidebar */}
      <div className="w-52 flex-shrink-0 flex flex-col gap-2">
        <button
          onClick={newChat}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-brand-500 text-white text-xs font-medium hover:bg-brand-600 transition-colors"
        >
          <Plus className="h-3.5 w-3.5" /> New Chat
        </button>

        <div className="flex-1 overflow-y-auto space-y-1">
          {(sessions as ChatSessionSummary[]).map((s) => (
            <div
              key={s.id}
              className={`flex items-center justify-between px-3 py-2 rounded-xl cursor-pointer text-xs transition-colors ${
                sessionId === s.id ? "bg-brand-500/15 text-brand-400" : "hover:bg-accent text-muted-foreground hover:text-foreground"
              }`}
            >
              <span className="truncate flex-1" onClick={() => loadSession(s)}>{s.title}</span>
              <button onClick={() => deleteMut.mutate(s.id)} className="ml-1 opacity-0 hover:opacity-100 group-hover:opacity-100 p-0.5 rounded hover:text-red-400">
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col bg-accent/30 rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-border">
          <div className="flex items-center gap-2">
            <select
              value={context}
              onChange={(e) => setContext(e.target.value as typeof context)}
              className="text-xs bg-transparent outline-none font-medium"
            >
              <option value="general">General</option>
              <option value="sales">Sales</option>
              <option value="support">Support</option>
              <option value="technical">Technical</option>
            </select>
          </div>
          <ProviderToggle value={provider} onChange={setProvider} />
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-sm">
              <Bot className="h-12 w-12 mb-3 opacity-20" />
              <p className="font-medium">Start a conversation</p>
              <p className="text-xs mt-1">Ask about our services, get sales help, or technical advice</p>
            </div>
          )}
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                  msg.role === "user"
                    ? "bg-brand-500 text-white rounded-tr-sm"
                    : "bg-card border border-border rounded-tl-sm"
                }`}
              >
                <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
              </div>
            </div>
          ))}
          {sendMut.isPending && (
            <div className="flex justify-start">
              <div className="bg-card border border-border rounded-2xl rounded-tl-sm px-4 py-3">
                <div className="flex gap-1">
                  {[0, 150, 300].map((d) => (
                    <div key={d} className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />
                  ))}
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="p-3 border-t border-border">
          <div className="flex items-center gap-2 bg-card rounded-xl px-3 py-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), handleSend())}
              placeholder="Type a message…"
              className="flex-1 bg-transparent text-sm outline-none"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || sendMut.isPending}
              className="p-1.5 rounded-lg bg-brand-500 text-white hover:bg-brand-600 disabled:opacity-40 transition-colors"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Tab: Lead Analyzer ───────────────────────────────────────────────────────

function LeadTab() {
  const [mode,        setMode]        = useState<"contact_id" | "manual">("contact_id");
  const [contactId,   setContactId]   = useState("");
  const [name,        setName]        = useState("");
  const [email,       setEmail]       = useState("");
  const [company,     setCompany]     = useState("");
  const [service,     setService]     = useState("");
  const [message,     setMessage]     = useState("");
  const [budget,      setBudget]      = useState("");
  const [provider,    setProvider]    = useState<Provider>("openai");
  const [result,      setResult]      = useState<LeadResponse | null>(null);

  const mut = useMutation({
    mutationFn: () => {
      const payload =
        mode === "contact_id"
          ? { contact_id: Number(contactId), provider }
          : {
              contact_data: { name, email, company, service_interest: service, message, budget },
              provider,
            };
      return aiService.analyzeLead(payload).then((r) => r.data);
    },
    onSuccess: setResult,
  });

  const canSubmit = mode === "contact_id" ? !!contactId : !!name && !!email;

  const priorityColor = {
    hot:  "text-red-400 bg-red-500/10 border-red-500/20",
    warm: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    cold: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Lead Analyzer</h3>
          <ProviderToggle value={provider} onChange={setProvider} />
        </div>

        <div className="flex gap-2">
          {(["contact_id", "manual"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`flex-1 py-2 rounded-xl text-xs font-medium transition-colors ${
                mode === m ? "bg-brand-500 text-white" : "bg-accent text-muted-foreground hover:text-foreground"
              }`}
            >
              {m === "contact_id" ? "From Contact ID" : "Manual Input"}
            </button>
          ))}
        </div>

        {mode === "contact_id" ? (
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Contact ID</label>
            <input
              type="number"
              value={contactId}
              onChange={(e) => setContactId(e.target.value)}
              placeholder="Enter contact ID from CRM…"
              className="w-full px-3 py-2 rounded-xl bg-accent text-sm outline-none focus:ring-2 focus:ring-brand-500/30"
            />
          </div>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Name *</label>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe"
                  className="w-full px-3 py-2 rounded-xl bg-accent text-sm outline-none focus:ring-2 focus:ring-brand-500/30" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Email *</label>
                <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="john@company.com"
                  className="w-full px-3 py-2 rounded-xl bg-accent text-sm outline-none focus:ring-2 focus:ring-brand-500/30" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Company</label>
                <input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Acme Corp"
                  className="w-full px-3 py-2 rounded-xl bg-accent text-sm outline-none focus:ring-2 focus:ring-brand-500/30" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Budget</label>
                <input value={budget} onChange={(e) => setBudget(e.target.value)} placeholder="$10k–$50k"
                  className="w-full px-3 py-2 rounded-xl bg-accent text-sm outline-none focus:ring-2 focus:ring-brand-500/30" />
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Service Interest</label>
              <input value={service} onChange={(e) => setService(e.target.value)} placeholder="AI & ML, Cloud DevOps…"
                className="w-full px-3 py-2 rounded-xl bg-accent text-sm outline-none focus:ring-2 focus:ring-brand-500/30" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Message / Notes</label>
              <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={3}
                placeholder="Their inquiry or notes…"
                className="w-full px-3 py-2 rounded-xl bg-accent text-sm outline-none focus:ring-2 focus:ring-brand-500/30 resize-none" />
            </div>
          </div>
        )}

        <button
          onClick={() => mut.mutate()}
          disabled={!canSubmit || mut.isPending}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {mut.isPending ? <Spinner /> : <Target className="h-4 w-4" />}
          {mut.isPending ? "Analysing…" : "Analyse Lead"}
        </button>

        {mut.isError && <ErrorBanner message={(mut.error as Error).message} />}
      </div>

      <div className="space-y-4">
        {!result ? (
          <div className="flex flex-col items-center justify-center h-64 rounded-2xl bg-accent/40 text-muted-foreground text-sm">
            <Users className="h-10 w-10 mb-3 opacity-30" />
            Lead intelligence will appear here
          </div>
        ) : (
          <>
            {/* Score + priority */}
            <div className="flex items-center gap-6 p-4 rounded-2xl bg-accent/40">
              <ScoreRing score={result.score} size={90} />
              <div>
                <p className="font-bold text-xl">Lead Score: {result.score}</p>
                <div className="flex gap-2 mt-1.5">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${priorityColor[result.priority]}`}>
                    {result.priority.toUpperCase()}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-500/10 border-brand-500/20 text-brand-400 border">
                    Intent: {result.intent}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-accent border-border text-muted-foreground border">
                    Deal: {result.estimated_deal_size}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-accent/40 text-sm">
              <p className="font-medium mb-1">Summary</p>
              <p className="text-muted-foreground">{result.summary}</p>
            </div>

            <div className="p-4 rounded-2xl bg-green-500/10 border border-green-500/20 text-sm">
              <p className="font-medium text-green-400 mb-1">Recommended Action</p>
              <p>{result.recommended_action}</p>
            </div>

            <div className="p-4 rounded-2xl bg-accent/40 text-sm space-y-1.5">
              <p className="font-medium mb-2">Next Steps</p>
              {result.next_steps.map((s, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-brand-500/20 text-brand-400 text-xs flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                  {s}
                </div>
              ))}
            </div>

            {result.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {result.tags.map((t) => (
                  <span key={t} className="px-2 py-0.5 rounded-full bg-accent text-xs text-muted-foreground">{t}</span>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ─── Usage Tab ────────────────────────────────────────────────────────────────

function UsageTab() {
  const { data, isLoading } = useQuery({
    queryKey: ["ai", "usage"],
    queryFn:  () => aiService.getUsage().then((r) => r.data),
  });

  if (isLoading) return (
    <div className="flex items-center justify-center h-48">
      <Spinner />
    </div>
  );

  const icons: Record<string, typeof Sparkles> = {
    blog: FileText, seo: Search, faq: Bot, chat: Send, lead: Users,
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Total Tokens" value={data?.total_tokens?.toLocaleString() ?? "0"} />
        <StatCard label="Active Providers" value={data?.available_providers?.join(", ") || "None"} />
        <StatCard label="Features Used" value={String(data?.by_feature?.length ?? 0)} />
        <StatCard label="Requests" value={String(data?.by_feature?.reduce((a, r) => a + r.count, 0) ?? 0)} />
      </div>

      <div className="rounded-2xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-accent/50">
              <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wide">Feature</th>
              <th className="text-right px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wide">Requests</th>
              <th className="text-right px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wide">Tokens</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data?.by_feature?.map((row) => {
              const Icon = icons[row.feature] ?? Sparkles;
              return (
                <tr key={row.feature} className="hover:bg-accent/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Icon className="h-3.5 w-3.5 text-brand-500" />
                      <span className="capitalize font-medium">{row.feature}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right text-muted-foreground">{row.count}</td>
                  <td className="px-4 py-3 text-right text-muted-foreground">{row.tokens.toLocaleString()}</td>
                </tr>
              );
            })}
            {(!data?.by_feature || data.by_feature.length === 0) && (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-muted-foreground text-sm">
                  No usage data yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-4 rounded-2xl bg-accent/40">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className="font-semibold text-lg truncate">{value}</p>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const TABS = [
  { id: "blog",   label: "Blog Writer",    icon: FileText  },
  { id: "seo",    label: "SEO Assistant",  icon: Search    },
  { id: "faq",    label: "FAQ Generator",  icon: Bot       },
  { id: "chat",   label: "Chatbot",        icon: Send      },
  { id: "leads",  label: "Lead Analyzer",  icon: Target    },
  { id: "usage",  label: "Usage",          icon: TrendingUp },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function AIPage() {
  const [activeTab, setActiveTab] = useState<TabId>("blog");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-cyan-500 flex items-center justify-center">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="font-bold text-xl">AI Assistant</h1>
          <p className="text-sm text-muted-foreground">Powered by OpenAI &amp; Google Gemini</p>
        </div>
      </div>

      {/* Tab strip */}
      <div className="flex gap-1 p-1 bg-accent rounded-2xl overflow-x-auto">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === id
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="bg-card rounded-2xl border border-border p-6">
        {activeTab === "blog"  && <BlogTab />}
        {activeTab === "seo"   && <SEOTab />}
        {activeTab === "faq"   && <FAQTab />}
        {activeTab === "chat"  && <ChatTab />}
        {activeTab === "leads" && <LeadTab />}
        {activeTab === "usage" && <UsageTab />}
      </div>
    </div>
  );
}

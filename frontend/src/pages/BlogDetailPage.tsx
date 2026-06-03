import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { SEOHead } from "@/components/seo/SEOHead";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft, Clock, Eye, Calendar, Tag, Hash,
  MessageSquare, Send, Loader2, PenLine, Share2,
  Twitter, Linkedin, Link as LinkIcon, CheckCheck,
} from "lucide-react";
import { blogApi } from "@/services/api/blog";
import { useAuthStore } from "@/store/authStore";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { BlogPost, Comment } from "@/types";

// ─── Markdown renderer ───────────────────────────────────────────────────────

function renderMarkdown(md: string): string {
  return md
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/^## (.+)$/gm,  "<h2>$1</h2>")
    .replace(/^# (.+)$/gm,   "<h1>$1</h1>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g,     "<em>$1</em>")
    .replace(/`{3}([\s\S]+?)`{3}/g, "<pre><code>$1</code></pre>")
    .replace(/`(.+?)`/g, "<code>$1</code>")
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
    .replace(/^- (.+)$/gm, "<li>$1</li>")
    .replace(/(<li>.*<\/li>)/gs, "<ul>$1</ul>")
    .replace(/^(\d+)\. (.+)$/gm, "<li>$2</li>")
    .replace(/^---$/gm, "<hr />")
    .replace(/\n\n/g, "</p><p>")
    .replace(/\n/g, "<br />");
}

// ─── Author card ─────────────────────────────────────────────────────────────

function AuthorCard({ post }: { post: BlogPost }) {
  const initial = (post.author?.first_name?.[0] || post.author?.email?.[0] || "A").toUpperCase();
  const name    = post.author?.first_name
    ? `${post.author.first_name} ${post.author.last_name}`.trim()
    : post.author?.email ?? "Anonymous";

  return (
    <div className="flex items-center gap-4 p-5 rounded-2xl bg-card border border-border">
      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500 to-cyan-500 flex items-center justify-center text-white text-xl font-bold shrink-0 shadow-lg shadow-brand-500/20">
        {initial}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-foreground">{name}</p>
        {post.author?.bio && (
          <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">{post.author.bio}</p>
        )}
        <p className="text-xs text-muted-foreground mt-1">
          Published {formatDate(post.published_at ?? post.created_at)}
        </p>
      </div>
    </div>
  );
}

// ─── Share buttons ────────────────────────────────────────────────────────────

function ShareBar({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);
  const url = window.location.href;

  const copy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const share = (platform: "twitter" | "linkedin") => {
    const urls = {
      twitter:  `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    };
    window.open(urls[platform], "_blank", "noopener,width=600,height=400");
  };

  const btn = "w-9 h-9 flex items-center justify-center rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-accent transition-all";

  return (
    <div className="flex items-center gap-2">
      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Share2 className="h-3.5 w-3.5" /> Share
      </span>
      <button onClick={() => share("twitter")} className={btn} title="Share on Twitter">
        <Twitter className="h-3.5 w-3.5" />
      </button>
      <button onClick={() => share("linkedin")} className={btn} title="Share on LinkedIn">
        <Linkedin className="h-3.5 w-3.5" />
      </button>
      <button onClick={copy} className={cn(btn, copied && "border-green-500/40 text-green-500")} title="Copy link">
        {copied ? <CheckCheck className="h-3.5 w-3.5" /> : <LinkIcon className="h-3.5 w-3.5" />}
      </button>
    </div>
  );
}

// ─── Comment form ─────────────────────────────────────────────────────────────

function CommentForm({ slug, onPosted }: { slug: string; onPosted: () => void }) {
  const { isAuthenticated } = useAuthStore();
  const [text, setText] = useState("");

  const post = useMutation({
    mutationFn: () => blogApi.comment(slug, text.trim()),
    onSuccess: () => { setText(""); onPosted(); },
  });

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-between p-4 rounded-2xl bg-card border border-border">
        <p className="text-sm text-muted-foreground">Sign in to leave a comment</p>
        <Link to="/login"
          className="px-4 py-2 rounded-xl bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 transition-colors">
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={3}
        placeholder="Share your thoughts…"
        className="w-full px-4 py-3 rounded-2xl bg-card border border-border text-foreground text-sm placeholder:text-muted-foreground/50 outline-none focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/10 resize-none transition-all"
      />
      <div className="flex justify-end">
        <button
          onClick={() => post.mutate()}
          disabled={!text.trim() || post.isPending}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-500 text-white text-sm font-semibold hover:bg-brand-600 disabled:opacity-40 transition-all shadow-md shadow-brand-500/20"
        >
          {post.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
          Post Comment
        </button>
      </div>
    </div>
  );
}

// ─── Single comment ───────────────────────────────────────────────────────────

function CommentItem({ comment }: { comment: Comment }) {
  const initial = (comment.author?.first_name?.[0] || "?").toUpperCase();
  const name    = comment.author?.first_name
    ? `${comment.author.first_name} ${comment.author.last_name}`.trim()
    : comment.author?.email ?? "Anonymous";

  return (
    <div className="flex gap-3">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-cyan-500 flex items-center justify-center text-white text-xs font-bold shrink-0 mt-0.5">
        {initial}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className="text-sm font-semibold text-foreground">{name}</span>
          <span className="text-xs text-muted-foreground">
            {formatDate(comment.created_at)}
          </span>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">{comment.content}</p>
      </div>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <main className="pt-20 pb-24">
      <div className="h-72 sm:h-96 bg-muted animate-pulse" />
      <div className="container mx-auto px-4 py-12 max-w-4xl space-y-6">
        <div className="h-10 bg-muted rounded-xl w-3/4 animate-pulse" />
        <div className="h-10 bg-muted rounded-xl w-1/2 animate-pulse" />
        <div className="space-y-3 pt-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className={`h-4 bg-muted rounded animate-pulse ${i % 4 === 3 ? "w-2/3" : "w-full"}`} />
          ))}
        </div>
      </div>
    </main>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BlogDetailPage() {
  const { slug }    = useParams<{ slug: string }>();
  const { user, isAuthenticated } = useAuthStore();
  const qc          = useQueryClient();
  const canEdit     = isAuthenticated && (user?.role === "admin" || user?.role === "editor");

  const { data: post, isLoading, isError } = useQuery({
    queryKey: ["blog-post", slug],
    queryFn:  () => blogApi.get(slug!).then((r) => r.data),
    enabled:  !!slug,
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) return <Skeleton />;

  if (isError || !post) {
    return (
      <main className="pt-28 pb-24 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <h1 className="text-5xl font-bold gradient-text mb-4">404</h1>
          <p className="text-muted-foreground mb-6">Post not found or has been removed.</p>
          <Link to="/blog"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-500 text-white font-medium hover:bg-brand-600 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to Blog
          </Link>
        </div>
      </main>
    );
  }

  const html = renderMarkdown(post.content || "");

  return (
    <>
      <SEOHead
        pageKey={`blog-${post.slug}`}
        overrides={{
          title:       post.seo_title       || `${post.title} — BlackMarlinBD`,
          description: post.seo_description || post.excerpt,
          ogType:      "article",
          ogImage:     post.cover_image     ?? undefined,
        }}
      />

      <main className="pt-20 pb-24">

        {/* ── Hero / Cover ────────────────────────────────────────────── */}
        <div className="relative">
          {post.cover_image ? (
            <div className="relative h-72 sm:h-[440px] overflow-hidden">
              <img
                src={post.cover_image}
                alt={post.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
            </div>
          ) : (
            <div className="h-40 bg-gradient-to-br from-brand-950/60 via-background to-background" />
          )}
        </div>

        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">

            {/* ── Back + Edit ─────────────────────────────────────────── */}
            <div className="flex items-center justify-between py-6">
              <Link to="/blog"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="h-4 w-4" /> Back to Blog
              </Link>
              {canEdit && (
                <Link to={`/blog/write?edit=${post.slug}`}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-all">
                  <PenLine className="h-3.5 w-3.5" /> Edit Post
                </Link>
              )}
            </div>

            {/* ── Header ──────────────────────────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Category */}
              {post.category && (
                <span className="inline-block px-3 py-1 rounded-full bg-brand-500 text-white text-xs font-semibold mb-4">
                  {post.category.name}
                </span>
              )}

              {/* Title */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground leading-tight mb-6">
                {post.title}
              </h1>

              {/* Meta row */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground pb-6 border-b border-border mb-8">
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  {post.read_time} min read
                </span>
                <span className="flex items-center gap-1.5">
                  <Eye className="h-3.5 w-3.5" />
                  {post.views_count.toLocaleString()} views
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  {formatDate(post.published_at ?? post.created_at)}
                </span>
                <span className="flex items-center gap-1.5">
                  <MessageSquare className="h-3.5 w-3.5" />
                  {post.comment_count} comment{post.comment_count !== 1 ? "s" : ""}
                </span>
                <div className="ml-auto">
                  <ShareBar title={post.title} />
                </div>
              </div>

              {/* Excerpt */}
              <p className="text-lg text-muted-foreground leading-relaxed mb-10 font-light">
                {post.excerpt}
              </p>
            </motion.div>

            {/* ── Article body ────────────────────────────────────────── */}
            <motion.article
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="blog-content prose-custom mb-12"
              dangerouslySetInnerHTML={{ __html: `<p>${html}</p>` }}
            />

            {/* ── Tags ────────────────────────────────────────────────── */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap pb-8 mb-8 border-b border-border">
                <Tag className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                {post.tags.map((tag) => (
                  <span key={tag}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-accent text-muted-foreground text-xs font-medium hover:text-foreground transition-colors">
                    <Hash className="h-2.5 w-2.5" />{tag}
                  </span>
                ))}
              </div>
            )}

            {/* ── Author ──────────────────────────────────────────────── */}
            <div className="mb-12">
              <AuthorCard post={post} />
            </div>

            {/* ── Comments ────────────────────────────────────────────── */}
            <section>
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-brand-400" />
                Comments
                {post.comment_count > 0 && (
                  <span className="text-sm font-normal text-muted-foreground">({post.comment_count})</span>
                )}
              </h2>

              <div className="mb-8">
                <CommentForm
                  slug={post.slug}
                  onPosted={() => qc.invalidateQueries({ queryKey: ["blog-post", slug] })}
                />
              </div>

              {post.comments && post.comments.length > 0 ? (
                <div className="space-y-6">
                  {post.comments.map((c) => (
                    <CommentItem key={c.id} comment={c} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center py-12 text-muted-foreground/40">
                  <MessageSquare className="h-10 w-10 mb-3" />
                  <p className="text-sm">No comments yet — be the first!</p>
                </div>
              )}
            </section>

          </div>
        </div>
      </main>
    </>
  );
}

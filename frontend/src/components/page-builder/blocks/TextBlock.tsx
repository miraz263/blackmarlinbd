import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { motion } from "framer-motion";

export function TextBlock({ content }: { content: Record<string, unknown> }) {
  const heading   = content.heading as string | undefined;
  const body      = content.body as string | undefined;
  const alignment = (content.alignment as string | undefined) ?? "left";

  const alignClass = alignment === "center" ? "text-center mx-auto" : alignment === "right" ? "text-right ml-auto" : "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
      className={`max-w-3xl ${alignClass}`}
    >
      {heading && (
        <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">{heading}</h2>
      )}
      {body && (
        <div className="prose prose-invert max-w-none text-muted-foreground">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{body}</ReactMarkdown>
        </div>
      )}
    </motion.div>
  );
}

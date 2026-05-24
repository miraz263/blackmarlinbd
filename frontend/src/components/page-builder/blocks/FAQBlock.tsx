import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

interface FAQItem { question: string; answer: string; }

export function FAQBlock({ content }: { content: Record<string, unknown> }) {
  const heading = content.heading as string | undefined;
  const items   = (content.items as FAQItem[] | undefined) ?? [];
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="max-w-3xl mx-auto">
      {heading && (
        <h2 className="text-3xl font-bold text-center mb-10">{heading}</h2>
      )}
      <div className="space-y-3">
        {items.map((item, i) => (
          <div key={i} className="border border-border rounded-2xl overflow-hidden bg-card">
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="w-full flex items-center justify-between px-6 py-5 text-left"
            >
              <span className="font-semibold text-foreground">{item.question}</span>
              <ChevronDown
                className={`h-5 w-5 text-muted-foreground transition-transform flex-shrink-0 ml-4 ${open === i ? "rotate-180" : ""}`}
              />
            </button>
            <AnimatePresence>
              {open === i && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <p className="px-6 pb-5 text-muted-foreground leading-relaxed">{item.answer}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
}

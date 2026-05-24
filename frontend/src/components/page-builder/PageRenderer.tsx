import { SectionRenderer } from "./SectionRenderer";
import type { BuilderPage } from "@/types";

export function PageRenderer({ page }: { page: BuilderPage }) {
  const sections = page.sections
    .filter((s) => s.is_published)
    .sort((a, b) => a.order - b.order);

  return (
    <main>
      {sections.map((section) => (
        <SectionRenderer key={section.id} section={section} />
      ))}
    </main>
  );
}

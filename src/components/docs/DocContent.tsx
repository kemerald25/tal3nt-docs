import ReactMarkdown from "react-markdown";
import type { DocPage, DocSection } from "@/types/content";

interface DocContentProps {
  section: DocSection;
  page: DocPage;
}

export function DocContent({ section, page }: DocContentProps) {
  const updated = new Date(page.lastUpdated).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <article className="space-y-6 rounded-3xl border border-white/10 bg-[#0b0817]/90 p-8 backdrop-blur-xl">
      <div className="space-y-2">
        <p className="tag-pill inline-flex items-center gap-2 text-xs text-white/60">
          {section.title}
        </p>
        <h1 className="text-4xl font-semibold leading-tight">{page.title}</h1>
        <p className="text-white/70">{page.summary}</p>
        <p className="text-sm text-white/50">Updated {updated}</p>
      </div>
      <div className="gradient-divider" />
      <div className="markdown-body">
        <ReactMarkdown>{page.content}</ReactMarkdown>
      </div>
    </article>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { DocSection } from "@/types/content";
import { cn } from "@/lib/utils";

interface DocsSidebarProps {
  sections: DocSection[];
}

export function DocsSidebar({ sections }: DocsSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="h-full w-full space-y-6 rounded-3xl border border-white/10 bg-[#0b0815]/80 p-5 backdrop-blur-xl">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-white/50">Documentation</p>
        <h2 className="text-2xl font-semibold">Knowledge Base</h2>
      </div>
      <div className="space-y-4">
        {sections.map((section) => (
          <div key={section.id}>
            <p className="text-xs uppercase text-white/60">{section.title}</p>
            <div className="mt-3 space-y-1">
              {section.pages.map((page) => {
                const href = `/docs/${section.id}/${page.slug}`;
                const isActive = pathname === href;
                return (
                  <Link
                    key={page.id}
                    href={href}
                    className={cn(
                      "block rounded-2xl border px-4 py-3 text-sm transition",
                      isActive
                        ? "border-white/30 bg-white/10 text-white"
                        : "border-transparent text-white/70 hover:border-white/10 hover:bg-white/5"
                    )}
                  >
                    <p className="font-semibold">{page.title}</p>
                    <p className="text-xs text-white/60">{page.summary}</p>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}

import type { ReactNode } from "react";
import { DocsSidebar } from "@/components/docs/DocsSidebar";
import { getDocsData } from "@/lib/content";

export default async function DocsLayout({
  children,
}: {
  children: ReactNode;
}) {
  const docs = await getDocsData();

  return (
    <div className="mx-auto flex w-[min(1200px,96%)] flex-col gap-6 pb-16 lg:grid lg:grid-cols-[320px,1fr]">
      <DocsSidebar sections={docs.sections} />
      <div className="min-h-[60vh]">{children}</div>
    </div>
  );
}

import { notFound } from "next/navigation";
import { DocContent } from "@/components/docs/DocContent";
import { findDocPage, getDocsData } from "@/lib/content";

export const revalidate = 60;
export const dynamic = "force-dynamic";

interface DocPageProps {
  params: { section: string; page: string };
}

export default async function DocPage({ params }: DocPageProps) {
  const docs = await getDocsData();
  const match = findDocPage(docs.sections, params.section, params.page);

  if (!match) {
    notFound();
  }

  return <DocContent section={match.section} page={match.page} />;
}

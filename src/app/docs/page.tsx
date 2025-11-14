import Link from "next/link";
import { getDocsData } from "@/lib/content";

export const revalidate = 60;
export const dynamic = "force-dynamic";

export default async function DocsIndexPage() {
  const docs = await getDocsData();

  return (
    <section className="space-y-8 rounded-3xl border border-white/10 bg-[#0b0817]/90 p-8">
      <div>
        <p className="text-xs uppercase text-white/60">Choose a track</p>
        <h1 className="text-4xl font-semibold">Tal3nt Documentation</h1>
        <p className="mt-2 text-white/70">
          Explore how to orchestrate decentralized talent programs, integrate the escrow contract, and tell the Tal3nt story.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {docs.sections.map((section) => (
          <div key={section.id} className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <p className="text-sm uppercase text-white/60">{section.title}</p>
            <p className="mt-2 text-sm text-white/70">{section.description}</p>
            <div className="mt-4 space-y-3">
              {section.pages.map((page) => (
                <Link
                  key={page.id}
                  href={`/docs/${section.id}/${page.slug}`}
                  className="flex items-center justify-between rounded-2xl border border-white/10 px-4 py-3 text-sm text-white/70 hover:border-white/30"
                >
                  <span>{page.title}</span>
                  <span className="text-white/50">
                    {new Date(page.lastUpdated).toLocaleDateString()}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

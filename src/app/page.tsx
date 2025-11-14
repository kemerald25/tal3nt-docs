import Link from "next/link";
import { Hero } from "@/components/hero/Hero";
import { LogoCloud } from "@/components/marketing/LogoCloud";
import { BlogCard } from "@/components/blog/BlogCard";
import { getBlogsData, getDocsData } from "@/lib/content";

export const revalidate = 60;
export const dynamic = "force-dynamic";

export default async function Home() {
  const [docs, blogs] = await Promise.all([getDocsData(), getBlogsData()]);
  const docPages = docs.sections
    .flatMap((section) => section.pages.map((page) => ({ section, page })))
    .slice(0, 3);
  const latestPosts = blogs.posts.slice(0, 2);

  return (
    <div className="pb-24">
      <Hero />
      <section className="mx-auto mt-12 grid w-[min(1100px,96%)] grid-cols-1 gap-5 lg:grid-cols-3">
        {docPages.map(({ section, page }) => (
          <Link
            key={page.id}
            href={`/docs/${section.id}/${page.slug}`}
            className="rounded-3xl border border-white/10 bg-white/5 p-5 transition hover:-translate-y-1 hover:border-white/30"
          >
            <p className="tag-pill text-[10px] text-white/70">{section.title}</p>
            <h3 className="mt-3 text-2xl font-semibold">{page.title}</h3>
            <p className="mt-2 text-sm text-white/70">{page.summary}</p>
            <div className="mt-6 flex items-center gap-2 text-xs text-white/50">
              Updated {new Date(page.lastUpdated).toLocaleDateString()}
            </div>
          </Link>
        ))}
      </section>
      <LogoCloud />
      <section className="mx-auto mt-16 flex w-[min(1100px,96%)] flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase text-white/50">Latest thinking</p>
            <h2 className="text-3xl font-semibold">Blog Updates</h2>
          </div>
          <Link href="/blog" className="text-sm text-white/70 hover:text-white">
            View all posts →
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {latestPosts.map((post) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>
      </section>
    </div>
  );
}

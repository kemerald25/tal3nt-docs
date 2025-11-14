import { BlogCard } from "@/components/blog/BlogCard";
import { getBlogsData } from "@/lib/content";

export const revalidate = 60;
export const dynamic = "force-dynamic";

export default async function BlogPage() {
  const blogs = await getBlogsData();

  return (
    <section className="mx-auto w-[min(1100px,96%)] space-y-8">
      <div className="rounded-3xl border border-white/10 bg-[#0b0817]/90 p-8">
        <p className="text-xs uppercase text-white/60">Tal3nt Dispatch</p>
        <h1 className="mt-3 text-4xl font-semibold">Blog & Changelog</h1>
        <p className="mt-2 text-white/70">
          Release notes, op-ed pieces, and long-form research that tracks the builders and contributors shaping the Tal3nt economy.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {blogs.posts.map((post) => (
          <BlogCard key={post.id} post={post} />
        ))}
      </div>
    </section>
  );
}

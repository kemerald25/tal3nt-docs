import Image from "next/image";
import ReactMarkdown from "react-markdown";
import { notFound } from "next/navigation";
import { findBlogPost, getBlogsData } from "@/lib/content";

export const revalidate = 60;
export const dynamic = "force-dynamic";

interface BlogDetailProps {
  params: { slug: string };
}

export default async function BlogDetailPage({ params }: BlogDetailProps) {
  const blogs = await getBlogsData();
  const post = findBlogPost(blogs.posts, params.slug);

  if (!post) {
    notFound();
  }

  const date = new Date(post.publishedAt).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <article className="mx-auto w-[min(900px,92%)] space-y-6 rounded-3xl border border-white/10 bg-[#0b0817]/90 p-8">
      <div className="space-y-3">
        <div className="flex flex-wrap gap-3">
          {post.tags.map((tag) => (
            <span key={tag} className="tag-pill text-[10px] text-white/70">
              {tag}
            </span>
          ))}
        </div>
        <h1 className="text-4xl font-semibold">{post.title}</h1>
        <p className="text-white/70">{post.excerpt}</p>
        <p className="text-sm text-white/50">
          {date} · {post.author}
        </p>
      </div>
      {post.heroImage ? (
        <div className="relative h-96 w-full overflow-hidden rounded-3xl border border-white/10">
          <Image src={post.heroImage} alt={post.title} fill className="object-cover" />
        </div>
      ) : null}
      <div className="markdown-body">
        <ReactMarkdown>{post.content}</ReactMarkdown>
      </div>
    </article>
  );
}

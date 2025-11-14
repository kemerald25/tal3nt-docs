import Image from "next/image";
import Link from "next/link";
import type { BlogPost } from "@/types/content";

interface BlogCardProps {
  post: BlogPost;
}

export function BlogCard({ post }: BlogCardProps) {
  const date = new Date(post.publishedAt).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="flex h-full flex-col rounded-3xl border border-white/10 bg-[#0b0817]/80 p-5 transition hover:-translate-y-1 hover:border-white/30"
    >
      {post.heroImage ? (
        <div className="relative mb-4 h-48 w-full overflow-hidden rounded-2xl border border-white/10">
          <Image src={post.heroImage} alt={post.title} fill className="object-cover" />
        </div>
      ) : null}
      <div className="flex flex-wrap gap-2">
        {post.tags.map((tag) => (
          <span key={tag} className="tag-pill text-[10px] text-white/70">
            {tag}
          </span>
        ))}
      </div>
      <h3 className="mt-4 text-xl font-semibold">{post.title}</h3>
      <p className="mt-2 text-sm text-white/70">{post.excerpt}</p>
      <div className="mt-auto pt-6 text-xs text-white/50">
        {date} • {post.author}
      </div>
    </Link>
  );
}

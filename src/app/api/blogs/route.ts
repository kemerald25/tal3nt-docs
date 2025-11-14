import { NextResponse } from "next/server";
import { addDoc, collection, doc, getDoc, updateDoc } from "firebase/firestore";
import { getBlogsData } from "@/lib/content";
import { getFirebaseDb } from "@/lib/firebase/firestore";
import { slugify } from "@/lib/utils";
import { verifyAdminToken } from "@/lib/admin-auth";

const BLOG_COLLECTION = "blogPosts";

export async function GET() {
  const blogs = await getBlogsData();
  return NextResponse.json(blogs);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const token = extractToken(request.headers.get("authorization")) ?? (body.idToken as string | undefined);
    const verified = await verifyAdminToken(token);
    if (!verified) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const title = (body.title as string | undefined)?.trim();
    if (!title) {
      return NextResponse.json({ message: "Title is required" }, { status: 400 });
    }

    const excerpt = (body.excerpt as string | undefined)?.trim() ?? "";
    const content = (body.content as string | undefined)?.trim() ?? "";
    const tagsRaw = (body.tags as string[] | string | undefined) ?? [];
    const tags = Array.isArray(tagsRaw)
      ? tagsRaw
      : tagsRaw
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean);
    const heroImage = (body.heroImage as string | undefined)?.trim() || undefined;
    const slug = slugify((body.slug as string | undefined)?.trim() || title);
    const author = (body.author as string | undefined)?.trim() || "Tal3nt Core Team";
    const timestamp = new Date().toISOString();

    const blogId = (body.blogId as string | undefined)?.trim();
    const db = getFirebaseDb();

    if (blogId) {
      const postRef = doc(db, BLOG_COLLECTION, blogId);
      const snap = await getDoc(postRef);
      if (!snap.exists()) {
        return NextResponse.json({ message: "Blog not found" }, { status: 404 });
      }
      await updateDoc(postRef, {
        title,
        excerpt,
        content,
        tags,
        heroImage,
        slug,
        author,
        publishedAt: timestamp,
      });
    } else {
      await addDoc(collection(db, BLOG_COLLECTION), {
        title,
        excerpt,
        content,
        tags,
        heroImage,
        slug,
        author,
        publishedAt: timestamp,
        order: Date.now(),
      });
    }

    return NextResponse.json({ message: "Blog saved" }, { status: 201 });
  } catch (error) {
    console.error("Unable to create blog", error);
    return NextResponse.json({ message: "Unable to create blog" }, { status: 500 });
  }
}

function extractToken(header: string | null) {
  if (!header) return null;
  const [scheme, token] = header.split(" ");
  if (scheme?.toLowerCase() !== "bearer") return null;
  return token ?? null;
}

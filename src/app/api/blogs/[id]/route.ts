import { NextResponse } from "next/server";
import { deleteDoc, doc, getDoc, updateDoc } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase/firestore";
import { slugify } from "@/lib/utils";
import { verifyAdminToken } from "@/lib/admin-auth";

const BLOG_COLLECTION = "blogPosts";

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const token = extractToken(request.headers.get("authorization")) ?? (body.idToken as string | undefined);
    const verified = await verifyAdminToken(token);
    if (!verified) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const db = getFirebaseDb();
    const postRef = doc(db, BLOG_COLLECTION, params.id);
    const snap = await getDoc(postRef);
    if (!snap.exists()) {
      return NextResponse.json({ message: "Blog not found" }, { status: 404 });
    }

    await updateDoc(postRef, {
      title: body.title ?? snap.data()?.title,
      excerpt: body.excerpt ?? snap.data()?.excerpt,
      content: body.content ?? snap.data()?.content,
      tags: body.tags ?? snap.data()?.tags,
      heroImage: body.heroImage ?? snap.data()?.heroImage,
      slug: body.slug ? slugify(body.slug) : snap.data()?.slug,
      author: body.author ?? snap.data()?.author,
      publishedAt: new Date().toISOString(),
    });

    return NextResponse.json({ message: "Blog updated" });
  } catch (error) {
    console.error("Unable to update blog", error);
    return NextResponse.json({ message: "Unable to update blog" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const token = extractToken(request.headers.get("authorization"));
    const verified = await verifyAdminToken(token);
    if (!verified) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const db = getFirebaseDb();
    const postRef = doc(db, BLOG_COLLECTION, params.id);
    const snap = await getDoc(postRef);
    if (!snap.exists()) {
      return NextResponse.json({ message: "Blog not found" }, { status: 404 });
    }

    await deleteDoc(postRef);
    return NextResponse.json({ message: "Blog deleted" });
  } catch (error) {
    console.error("Unable to delete blog", error);
    return NextResponse.json({ message: "Unable to delete blog" }, { status: 500 });
  }
}

function extractToken(header: string | null) {
  if (!header) return null;
  const [scheme, token] = header.split(" ");
  if (scheme?.toLowerCase() !== "bearer") return null;
  return token ?? null;
}

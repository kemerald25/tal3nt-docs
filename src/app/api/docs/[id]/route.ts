import { NextResponse } from "next/server";
import { deleteDoc, doc, getDoc, updateDoc } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase/firestore";
import { slugify } from "@/lib/utils";
import { verifyAdminToken } from "@/lib/admin-auth";

const DOC_PAGE_COLLECTION = "docPages";

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const token = extractToken(request.headers.get("authorization")) ?? (body.idToken as string | undefined);
    const verified = await verifyAdminToken(token);
    if (!verified) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const db = getFirebaseDb();
    const pageRef = doc(db, DOC_PAGE_COLLECTION, params.id);
    const snap = await getDoc(pageRef);
    if (!snap.exists()) {
      return NextResponse.json({ message: "Doc not found" }, { status: 404 });
    }

    await updateDoc(pageRef, {
      title: body.title ?? snap.data()?.title,
      summary: body.summary ?? snap.data()?.summary,
      content: body.content ?? snap.data()?.content,
      slug: body.slug ? slugify(body.slug) : snap.data()?.slug,
      lastUpdated: new Date().toISOString(),
    });

    return NextResponse.json({ message: "Doc updated" });
  } catch (error) {
    console.error("Unable to update doc", error);
    return NextResponse.json({ message: "Unable to update doc" }, { status: 500 });
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
    const pageRef = doc(db, DOC_PAGE_COLLECTION, params.id);
    const snap = await getDoc(pageRef);
    if (!snap.exists()) {
      return NextResponse.json({ message: "Doc not found" }, { status: 404 });
    }

    await deleteDoc(pageRef);
    return NextResponse.json({ message: "Doc deleted" });
  } catch (error) {
    console.error("Unable to delete doc", error);
    return NextResponse.json({ message: "Unable to delete doc" }, { status: 500 });
  }
}

function extractToken(header: string | null) {
  if (!header) return null;
  const [scheme, token] = header.split(" ");
  if (scheme?.toLowerCase() !== "bearer") return null;
  return token ?? null;
}

import { NextResponse } from "next/server";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { getDocsData } from "@/lib/content";
import { getFirebaseDb } from "@/lib/firebase/firestore";
import { slugify } from "@/lib/utils";
import { verifyAdminToken } from "@/lib/admin-auth";

const DOC_SECTION_COLLECTION = "docSections";
const DOC_PAGE_COLLECTION = "docPages";

export async function GET() {
  const docs = await getDocsData();
  return NextResponse.json(docs);
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

    const summary = (body.summary as string | undefined)?.trim() ?? "";
    const content = (body.content as string | undefined)?.trim() ?? "";
    let sectionId = (body.sectionId as string | undefined)?.trim();
    const newSectionTitle = (body.newSectionTitle as string | undefined)?.trim();
    const db = getFirebaseDb();

    if (newSectionTitle) {
      sectionId = slugify(newSectionTitle);
      await setDoc(
        doc(db, DOC_SECTION_COLLECTION, sectionId),
        {
          title: newSectionTitle,
          description: "Added via API",
          order: Date.now(),
        },
        { merge: true },
      );
    }

    if (!sectionId) {
      return NextResponse.json({ message: "sectionId or newSectionTitle required" }, { status: 400 });
    }

    const sectionSnap = await getDoc(doc(db, DOC_SECTION_COLLECTION, sectionId));
    if (!sectionSnap.exists()) {
      return NextResponse.json({ message: "Section not found" }, { status: 404 });
    }

    const slug = slugify((body.slug as string | undefined)?.trim() || title);
    const docId = (body.docId as string | undefined)?.trim();
    const timestamp = new Date().toISOString();

    if (docId) {
      const pageRef = doc(db, DOC_PAGE_COLLECTION, docId);
      const snap = await getDoc(pageRef);
      if (!snap.exists()) {
        return NextResponse.json({ message: "Doc not found" }, { status: 404 });
      }
      await updateDoc(pageRef, {
        sectionId,
        title,
        summary,
        content,
        slug,
        lastUpdated: timestamp,
      });
    } else {
      await addDoc(collection(db, DOC_PAGE_COLLECTION), {
        sectionId,
        title,
        summary,
        content,
        slug,
        lastUpdated: timestamp,
        position: Date.now(),
      });
    }

    return NextResponse.json({ message: "Doc saved" }, { status: 201 });
  } catch (error) {
    console.error("Unable to create doc", error);
    return NextResponse.json({ message: "Unable to create doc" }, { status: 500 });
  }
}

function extractToken(header: string | null) {
  if (!header) return null;
  const [scheme, token] = header.split(" ");
  if (scheme?.toLowerCase() !== "bearer") return null;
  return token ?? null;
}

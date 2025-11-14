"use server";

import { revalidatePath } from "next/cache";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  updateDoc,
  setDoc,
} from "firebase/firestore";
import { slugify } from "@/lib/utils";
import { getFirebaseDb } from "@/lib/firebase/firestore";
import { verifyAdminToken } from "@/lib/admin-auth";

export type ActionState = { ok: boolean; message: string };

const DOC_SECTION_COLLECTION = "docSections";
const DOC_PAGE_COLLECTION = "docPages";
const BLOG_COLLECTION = "blogPosts";

export async function upsertDocAction(state: ActionState, formData: FormData): Promise<ActionState> {
  if (!(await enforceAdmin(formData))) {
    return unauthorizedState();
  }

  const title = (formData.get("title") as string | null)?.trim();
  const summary = (formData.get("summary") as string | null)?.trim() ?? "";
  const content = (formData.get("content") as string | null)?.trim() ?? "";
  const docId = (formData.get("docId") as string | null)?.trim();
  let sectionId = (formData.get("sectionId") as string | null)?.trim();
  const newSectionTitle = (formData.get("newSectionTitle") as string | null)?.trim();

  if (!title) {
    return { ok: false, message: "Title is required" };
  }

  const db = getFirebaseDb();

  if (newSectionTitle) {
    sectionId = slugify(newSectionTitle);
    await setDoc(
      doc(db, DOC_SECTION_COLLECTION, sectionId),
      {
        title: newSectionTitle,
        description: "Newly added section",
        order: Date.now(),
      },
      { merge: true },
    );
  }

  if (!sectionId) {
    return { ok: false, message: "Select or create a section" };
  }

  const sectionSnap = await getDoc(doc(db, DOC_SECTION_COLLECTION, sectionId));
  if (!sectionSnap.exists()) {
    return { ok: false, message: "Section not found" };
  }

  const pageSlug = slugify((formData.get("slug") as string | null)?.trim() || title);
  const timestamp = new Date().toISOString();

  if (docId) {
    const pageRef = doc(db, DOC_PAGE_COLLECTION, docId);
    const pageSnap = await getDoc(pageRef);
    if (!pageSnap.exists()) {
      return { ok: false, message: "Doc not found" };
    }
    await updateDoc(pageRef, {
      sectionId,
      title,
      summary,
      content,
      slug: pageSlug,
      lastUpdated: timestamp,
    });
  } else {
    await addDoc(collection(db, DOC_PAGE_COLLECTION), {
      sectionId,
      title,
      summary,
      content,
      slug: pageSlug,
      lastUpdated: timestamp,
      position: Date.now(),
    });
  }

  await revalidateDocs(sectionId, pageSlug);
  return { ok: true, message: "Documentation saved" };
}

export async function deleteDocAction(state: ActionState, formData: FormData): Promise<ActionState> {
  if (!(await enforceAdmin(formData))) {
    return unauthorizedState();
  }

  const docId = (formData.get("docId") as string | null)?.trim();
  if (!docId) {
    return { ok: false, message: "Select a doc to delete" };
  }

  const db = getFirebaseDb();
  const pageRef = doc(db, DOC_PAGE_COLLECTION, docId);
  const pageSnap = await getDoc(pageRef);
  if (!pageSnap.exists()) {
    return { ok: false, message: "Doc not found" };
  }
  const data = pageSnap.data();
  await deleteDoc(pageRef);

  await revalidateDocs((data?.sectionId as string) ?? "welcome", (data?.slug as string) ?? "introduction");
  return { ok: true, message: "Doc deleted" };
}

export async function upsertBlogAction(state: ActionState, formData: FormData): Promise<ActionState> {
  if (!(await enforceAdmin(formData))) {
    return unauthorizedState();
  }

  const title = (formData.get("title") as string | null)?.trim();
  const excerpt = (formData.get("excerpt") as string | null)?.trim() ?? "";
  const content = (formData.get("content") as string | null)?.trim() ?? "";
  const tagsRaw = (formData.get("tags") as string | null) ?? "";
  const heroImage = (formData.get("heroImage") as string | null)?.trim() || undefined;
  const blogId = (formData.get("blogId") as string | null)?.trim();

  if (!title) {
    return { ok: false, message: "Title is required" };
  }

  const slug = slugify((formData.get("slug") as string | null)?.trim() || title);
  const tags = tagsRaw
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
  const timestamp = new Date().toISOString();
  const author = (formData.get("author") as string | null)?.trim() || "Tal3nt Core Team";

  const db = getFirebaseDb();

  if (blogId) {
    const postRef = doc(db, BLOG_COLLECTION, blogId);
    const postSnap = await getDoc(postRef);
    if (!postSnap.exists()) {
      return { ok: false, message: "Blog not found" };
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

  await revalidateBlog(slug);
  return { ok: true, message: "Blog saved" };
}

export async function deleteBlogAction(state: ActionState, formData: FormData): Promise<ActionState> {
  if (!(await enforceAdmin(formData))) {
    return unauthorizedState();
  }

  const blogId = (formData.get("blogId") as string | null)?.trim();
  if (!blogId) {
    return { ok: false, message: "Pick a blog to delete" };
  }

  const db = getFirebaseDb();
  const postRef = doc(db, BLOG_COLLECTION, blogId);
  const postSnap = await getDoc(postRef);
  if (!postSnap.exists()) {
    return { ok: false, message: "Blog not found" };
  }
  const data = postSnap.data();
  await deleteDoc(postRef);

  await revalidateBlog((data?.slug as string) ?? "blog-post");
  return { ok: true, message: "Blog deleted" };
}

async function revalidateDocs(sectionId: string, slug: string) {
  await Promise.all([
    revalidatePath("/"),
    revalidatePath("/docs"),
    revalidatePath(`/docs/${sectionId}/${slug}`),
    revalidatePath("/admin"),
  ]);
}

async function revalidateBlog(slug: string) {
  await Promise.all([
    revalidatePath("/"),
    revalidatePath("/blog"),
    revalidatePath(`/blog/${slug}`),
    revalidatePath("/admin"),
  ]);
}

async function enforceAdmin(formData: FormData) {
  const token = formData.get("idToken") as string | null;
  const verified = await verifyAdminToken(token ?? undefined);
  return Boolean(verified);
}

function unauthorizedState(): ActionState {
  return { ok: false, message: "You are not authorized to perform this action." };
}

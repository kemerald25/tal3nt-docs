import { collection, doc, getDocs, orderBy, query, writeBatch } from "firebase/firestore";
import docsSeed from "@/data/docs.json";
import blogsSeed from "@/data/blogs.json";
import { getFirebaseDb } from "@/lib/firebase/firestore";
import type { BlogPost, BlogResponse, DocPage, DocSection, DocsResponse } from "@/types/content";

const DOC_SECTION_COLLECTION = "docSections";
const DOC_PAGE_COLLECTION = "docPages";
const BLOG_COLLECTION = "blogPosts";
const REMOTE_DOC_URL = "https://docs.tal3nt.xyz/readme.md";

type SectionRecord = {
  id: string;
  title: string;
  description: string;
  order: number;
};

type DocPageRecord = DocPage & { position: number };

async function fetchRemoteDoc() {
  try {
    const response = await fetch(REMOTE_DOC_URL, { cache: "no-store" });
    if (!response.ok) {
      throw new Error("Failed to fetch remote doc");
    }
    return await response.text();
  } catch {
    return `# Welcome to TAL3NT\n\nTal3nt is the decentralized work coordination protocol.`;
  }
}

async function seedDocsData() {
  const db = getFirebaseDb();
  const batch = writeBatch(db);
  const introContent = await fetchRemoteDoc();

  docsSeed.sections.forEach((section, sectionIndex) => {
    batch.set(doc(db, DOC_SECTION_COLLECTION, section.id), {
      title: section.title,
      description: section.description,
      order: sectionIndex,
    });

    section.pages.forEach((page, pageIndex) => {
      batch.set(doc(db, DOC_PAGE_COLLECTION, page.id), {
        ...page,
        sectionId: page.sectionId ?? section.id,
        content: page.slug === "introduction" ? introContent : page.content,
        position: pageIndex,
        lastUpdated: page.lastUpdated ?? new Date().toISOString(),
      });
    });
  });

  await batch.commit();
}

async function seedBlogData() {
  const db = getFirebaseDb();
  const batch = writeBatch(db);

  blogsSeed.posts.forEach((post, index) => {
    batch.set(doc(db, BLOG_COLLECTION, post.id), {
      ...post,
      order: index,
      publishedAt: post.publishedAt ?? new Date().toISOString(),
    });
  });

  await batch.commit();
}

export async function getDocsData(): Promise<DocsResponse> {
  const db = getFirebaseDb();
  let [sectionSnapshot, pagesSnapshot] = await Promise.all([
    getDocs(collection(db, DOC_SECTION_COLLECTION)),
    getDocs(collection(db, DOC_PAGE_COLLECTION)),
  ]);

  if (sectionSnapshot.empty || pagesSnapshot.empty) {
    await seedDocsData();
    [sectionSnapshot, pagesSnapshot] = await Promise.all([
      getDocs(collection(db, DOC_SECTION_COLLECTION)),
      getDocs(collection(db, DOC_PAGE_COLLECTION)),
    ]);
  }

  const sections = sectionSnapshot.docs.map((snap) => {
    const data = snap.data() as Omit<SectionRecord, "id">;
    return {
      id: snap.id,
      title: data.title,
      description: data.description,
      order: data.order ?? 0,
    };
  });

  const pages = pagesSnapshot.docs.map((snap) => {
    const data = snap.data() as DocPageRecord;
    return {
      ...data,
      id: snap.id,
      sectionId: data.sectionId,
      position: data.position ?? 0,
    };
  });

  const grouped: DocSection[] = sections
    .sort((a, b) => a.order - b.order)
    .map((section) => ({
      id: section.id,
      title: section.title,
      description: section.description,
      pages: pages
        .filter((page) => page.sectionId === section.id)
        .sort((a, b) => a.position - b.position)
        .map((record) => {
          const { position, ...page } = record;
          void position;
          return page;
        }),
    }));

  return { sections: grouped };
}

export async function getBlogsData(): Promise<BlogResponse> {
  const db = getFirebaseDb();
  let blogSnapshot = await getDocs(query(collection(db, BLOG_COLLECTION), orderBy("publishedAt", "desc")));

  if (blogSnapshot.empty) {
    await seedBlogData();
    blogSnapshot = await getDocs(query(collection(db, BLOG_COLLECTION), orderBy("publishedAt", "desc")));
  }

  const posts: BlogPost[] = blogSnapshot.docs.map((snap) => {
    const data = snap.data() as BlogPost;
    return {
      ...data,
      id: snap.id,
    };
  });

  return { posts };
}

export function findDocPage(sections: DocSection[], sectionId: string, pageSlug: string) {
  const section = sections.find((item) => item.id === sectionId);
  if (!section) return null;
  const page = section.pages.find((item) => item.slug === pageSlug);
  if (!page) return null;
  return { section, page } as { section: DocSection; page: DocPage };
}

export function findBlogPost(posts: BlogPost[], slug: string) {
  return posts.find((post) => post.slug === slug) ?? null;
}

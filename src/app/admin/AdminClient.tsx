"use client";

import { useEffect, useMemo, useState } from "react";
import { useFormState } from "react-dom";
import {
  GoogleAuthProvider,
  onIdTokenChanged,
  signInWithPopup,
  signOut,
  type User,
} from "firebase/auth";
import type { BlogResponse, DocsResponse } from "@/types/content";
import {
  deleteBlogAction,
  deleteDocAction,
  type ActionState,
  upsertBlogAction,
  upsertDocAction,
} from "./actions";
import { getFirebaseAuth } from "@/lib/firebase/auth";
import { cn } from "@/lib/utils";

const initialState: ActionState = { ok: true, message: "" };
const allowedEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? "")
  .split(",")
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

interface AdminClientProps {
  docs: DocsResponse;
  blogs: BlogResponse;
}

export function AdminClient({ docs, blogs }: AdminClientProps) {
  const auth = getFirebaseAuth();
  const docOptions = useMemo(
    () =>
      docs.sections.flatMap((section) =>
        section.pages.map((page) => ({
          sectionId: page.sectionId ?? section.id,
          sectionTitle: section.title,
          ...page,
        })),
      ),
    [docs.sections],
  );
  const blogOptions = blogs.posts;

  const [docForm, setDocForm] = useState({
    docId: "",
    sectionId: docs.sections[0]?.id ?? "",
    title: "",
    summary: "",
    content: "",
    slug: "",
  });

  const [blogForm, setBlogForm] = useState({
    blogId: "",
    title: "",
    excerpt: "",
    content: "",
    tags: "",
    heroImage: "",
    author: "Tal3nt Core Team",
    slug: "",
  });

  const [docState, docAction] = useFormState(upsertDocAction, initialState);
  const [docDeleteState, docDeleteAction] = useFormState(deleteDocAction, initialState);
  const [blogState, blogAction] = useFormState(upsertBlogAction, initialState);
  const [blogDeleteState, blogDeleteAction] = useFormState(deleteBlogAction, initialState);

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [idToken, setIdToken] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, async (user) => {
      setCurrentUser(user);
      setIdToken(user ? await user.getIdToken() : "");
    });
    return unsubscribe;
  }, [auth]);

  const isAuthorized =
    Boolean(currentUser?.email) &&
    (allowedEmails.length === 0 ||
      allowedEmails.includes(currentUser.email?.toLowerCase() ?? ""));

  function handleDocSelect(id: string) {
    if (!id) {
      setDocForm((prev) => ({ ...prev, docId: "", title: "", summary: "", content: "", slug: "" }));
      return;
    }
    const doc = docOptions.find((item) => item.id === id);
    if (doc) {
      setDocForm({
        docId: doc.id,
        sectionId: doc.sectionId,
        title: doc.title,
        summary: doc.summary,
        content: doc.content,
        slug: doc.slug,
      });
    }
  }

  function handleBlogSelect(id: string) {
    if (!id) {
      setBlogForm({
        blogId: "",
        title: "",
        excerpt: "",
        content: "",
        tags: "",
        heroImage: "",
        author: "Tal3nt Core Team",
        slug: "",
      });
      return;
    }
    const post = blogOptions.find((item) => item.id === id);
    if (post) {
      setBlogForm({
        blogId: post.id,
        title: post.title,
        excerpt: post.excerpt,
        content: post.content,
        tags: post.tags.join(", "),
        heroImage: post.heroImage ?? "",
        author: post.author,
        slug: post.slug,
      });
    }
  }

  async function handleSignIn() {
    setAuthLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } finally {
      setAuthLoading(false);
    }
  }

  async function handleSignOut() {
    setAuthLoading(true);
    try {
      await signOut(auth);
    } finally {
      setAuthLoading(false);
    }
  }

  const lockReason = !currentUser
    ? "Connect with Google to unlock editing."
    : "Switch to a whitelisted Tal3nt admin email to continue.";

  return (
    <div className="mx-auto w-[min(1100px,96%)] space-y-10">
      <section className="rounded-3xl border border-white/10 bg-[#0b0817]/90 p-8">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="text-xs uppercase text-white/60">Admin surface</p>
            <h1 className="text-3xl font-semibold">Update docs & blog</h1>
            <p className="text-white/70">
              Content is persisted to Firestore so you can keep production docs in sync with the Tal3nt app.
            </p>
            <p className="text-xs text-white/50">
              {currentUser?.email ? `Signed in as ${currentUser.email}` : "Not signed in"}
            </p>
            {allowedEmails.length > 0 && (
              <p className="text-[11px] text-white/40">
                Allowed admins: {allowedEmails.join(", ")}
              </p>
            )}
          </div>
          {currentUser ? (
            <button
              type="button"
              onClick={handleSignOut}
              className="rounded-full border border-white/20 px-4 py-2 text-sm text-white hover:border-white/40"
              disabled={authLoading}
            >
              {authLoading ? "Signing out…" : "Sign out"}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSignIn}
              className="rounded-full border border-white/20 px-4 py-2 text-sm text-white hover:border-white/40"
              disabled={authLoading}
            >
              {authLoading ? "Opening Google…" : "Sign in with Google"}
            </button>
          )}
        </header>
        {!isAuthorized && (
          <div className="mt-6 rounded-2xl border border-yellow-500/30 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-200">
            {lockReason}
          </div>
        )}
        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          <div className="relative">
            {!isAuthorized && (
              <div className="pointer-events-none absolute inset-0 z-10 rounded-3xl bg-[#0b0817]/70 backdrop-blur" />
            )}
            <div className={cn("space-y-4 rounded-3xl border border-white/10 bg-white/5 p-6", !isAuthorized && "opacity-40")}>
              <h2 className="text-xl font-semibold">Docs manager</h2>
              <label className="text-sm text-white/70">
                Choose existing doc
                <select
                  className="mt-1 w-full rounded-2xl border border-white/20 bg-transparent p-3"
                  value={docForm.docId}
                  onChange={(event) => handleDocSelect(event.target.value)}
                >
                  <option value="">Create new doc</option>
                  {docOptions.map((doc) => (
                    <option key={doc.id} value={doc.id}>
                      {doc.sectionTitle} · {doc.title}
                    </option>
                  ))}
                </select>
              </label>
              <form action={docAction} className="space-y-3">
                <input type="hidden" name="docId" value={docForm.docId} />
                <input type="hidden" name="idToken" value={idToken} />
                <label className="block text-sm text-white/70">
                  Section
                  <select
                    name="sectionId"
                    className="mt-1 w-full rounded-2xl border border-white/20 bg-transparent p-3"
                    value={docForm.sectionId}
                    onChange={(event) => setDocForm((prev) => ({ ...prev, sectionId: event.target.value }))}
                  >
                    <option value="">Select section</option>
                    {docs.sections.map((section) => (
                      <option key={section.id} value={section.id}>
                        {section.title}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block text-sm text-white/70">
                  Or new section name
                  <input
                    name="newSectionTitle"
                    className="mt-1 w-full rounded-2xl border border-white/20 bg-transparent p-3"
                    placeholder="e.g. Playbooks"
                  />
                </label>
                <label className="block text-sm text-white/70">
                  Title
                  <input
                    name="title"
                    value={docForm.title}
                    onChange={(event) => setDocForm((prev) => ({ ...prev, title: event.target.value }))}
                    className="mt-1 w-full rounded-2xl border border-white/20 bg-transparent p-3"
                    required
                  />
                </label>
                <label className="block text-sm text-white/70">
                  Summary
                  <input
                    name="summary"
                    value={docForm.summary}
                    onChange={(event) => setDocForm((prev) => ({ ...prev, summary: event.target.value }))}
                    className="mt-1 w-full rounded-2xl border border-white/20 bg-transparent p-3"
                  />
                </label>
                <label className="block text-sm text-white/70">
                  Custom slug
                  <input
                    name="slug"
                    value={docForm.slug}
                    onChange={(event) => setDocForm((prev) => ({ ...prev, slug: event.target.value }))}
                    className="mt-1 w-full rounded-2xl border border-white/20 bg-transparent p-3"
                    placeholder="smart-contracts"
                  />
                </label>
                <label className="block text-sm text-white/70">
                  Content (Markdown)
                  <textarea
                    name="content"
                    value={docForm.content}
                    onChange={(event) => setDocForm((prev) => ({ ...prev, content: event.target.value }))}
                    className="mt-1 h-40 w-full rounded-2xl border border-white/20 bg-transparent p-3"
                  />
                </label>
                <button type="submit" className="w-full rounded-2xl bg-white/90 px-4 py-3 text-[#05030a] font-semibold" disabled={!isAuthorized}>
                  Save doc
                </button>
                {docState.message && (
                  <p className={`text-sm ${docState.ok ? "text-green-400" : "text-red-400"}`}>
                    {docState.message}
                  </p>
                )}
              </form>
              <form action={docDeleteAction} className="space-y-3">
                <input type="hidden" name="idToken" value={idToken} />
                <label className="block text-sm text-white/70">
                  Delete doc
                  <select name="docId" className="mt-1 w-full rounded-2xl border border-white/20 bg-transparent p-3" required>
                    <option value="">Select doc</option>
                    {docOptions.map((doc) => (
                      <option key={doc.id} value={doc.id}>
                        {doc.sectionTitle} · {doc.title}
                      </option>
                    ))}
                  </select>
                </label>
                <button
                  type="submit"
                  className="w-full rounded-2xl border border-red-400/50 px-4 py-2 text-sm text-red-300"
                  disabled={!isAuthorized}
                >
                  Delete selected doc
                </button>
                {docDeleteState.message && (
                  <p className={`text-sm ${docDeleteState.ok ? "text-green-400" : "text-red-400"}`}>
                    {docDeleteState.message}
                  </p>
                )}
              </form>
            </div>
          </div>
          <div className="relative">
            {!isAuthorized && (
              <div className="pointer-events-none absolute inset-0 z-10 rounded-3xl bg-[#0b0817]/70 backdrop-blur" />
            )}
            <div className={cn("space-y-4 rounded-3xl border border-white/10 bg-white/5 p-6", !isAuthorized && "opacity-40")}>
              <h2 className="text-xl font-semibold">Blog manager</h2>
              <label className="text-sm text-white/70">
                Choose existing post
                <select
                  className="mt-1 w-full rounded-2xl border border-white/20 bg-transparent p-3"
                  value={blogForm.blogId}
                  onChange={(event) => handleBlogSelect(event.target.value)}
                >
                  <option value="">Create new post</option>
                  {blogOptions.map((post) => (
                    <option key={post.id} value={post.id}>
                      {post.title}
                    </option>
                  ))}
                </select>
              </label>
              <form action={blogAction} className="space-y-3">
                <input type="hidden" name="blogId" value={blogForm.blogId} />
                <input type="hidden" name="idToken" value={idToken} />
                <label className="block text-sm text-white/70">
                  Title
                  <input
                    name="title"
                    value={blogForm.title}
                    onChange={(event) => setBlogForm((prev) => ({ ...prev, title: event.target.value }))}
                    className="mt-1 w-full rounded-2xl border border-white/20 bg-transparent p-3"
                    required
                  />
                </label>
                <label className="block text-sm text-white/70">
                  Excerpt
                  <input
                    name="excerpt"
                    value={blogForm.excerpt}
                    onChange={(event) => setBlogForm((prev) => ({ ...prev, excerpt: event.target.value }))}
                    className="mt-1 w-full rounded-2xl border border-white/20 bg-transparent p-3"
                  />
                </label>
                <label className="block text-sm text-white/70">
                  Tags (comma separated)
                  <input
                    name="tags"
                    value={blogForm.tags}
                    onChange={(event) => setBlogForm((prev) => ({ ...prev, tags: event.target.value }))}
                    className="mt-1 w-full rounded-2xl border border-white/20 bg-transparent p-3"
                  />
                </label>
                <label className="block text-sm text-white/70">
                  Hero image path
                  <input
                    name="heroImage"
                    value={blogForm.heroImage}
                    onChange={(event) => setBlogForm((prev) => ({ ...prev, heroImage: event.target.value }))}
                    className="mt-1 w-full rounded-2xl border border-white/20 bg-transparent p-3"
                    placeholder="/hero-img2.png"
                  />
                </label>
                <label className="block text-sm text-white/70">
                  Author
                  <input
                    name="author"
                    value={blogForm.author}
                    onChange={(event) => setBlogForm((prev) => ({ ...prev, author: event.target.value }))}
                    className="mt-1 w-full rounded-2xl border border-white/20 bg-transparent p-3"
                  />
                </label>
                <label className="block text-sm text-white/70">
                  Custom slug
                  <input
                    name="slug"
                    value={blogForm.slug}
                    onChange={(event) => setBlogForm((prev) => ({ ...prev, slug: event.target.value }))}
                    className="mt-1 w-full rounded-2xl border border-white/20 bg-transparent p-3"
                  />
                </label>
                <label className="block text-sm text-white/70">
                  Content (Markdown)
                  <textarea
                    name="content"
                    value={blogForm.content}
                    onChange={(event) => setBlogForm((prev) => ({ ...prev, content: event.target.value }))}
                    className="mt-1 h-40 w-full rounded-2xl border border-white/20 bg-transparent p-3"
                  />
                </label>
                <button
                  type="submit"
                  className="w-full rounded-2xl bg-white/90 px-4 py-3 font-semibold text-[#05030a]"
                  disabled={!isAuthorized}
                >
                  Save blog post
                </button>
                {blogState.message && (
                  <p className={`text-sm ${blogState.ok ? "text-green-400" : "text-red-400"}`}>
                    {blogState.message}
                  </p>
                )}
              </form>
              <form action={blogDeleteAction} className="space-y-3">
                <input type="hidden" name="idToken" value={idToken} />
                <label className="block text-sm text-white/70">
                  Delete post
                  <select name="blogId" className="mt-1 w-full rounded-2xl border border-white/20 bg-transparent p-3" required>
                    <option value="">Select post</option>
                    {blogOptions.map((post) => (
                      <option key={post.id} value={post.id}>
                        {post.title}
                      </option>
                    ))}
                  </select>
                </label>
                <button
                  type="submit"
                  className="w-full rounded-2xl border border-red-400/50 px-4 py-2 text-sm text-red-300"
                  disabled={!isAuthorized}
                >
                  Delete selected post
                </button>
                {blogDeleteState.message && (
                  <p className={`text-sm ${blogDeleteState.ok ? "text-green-400" : "text-red-400"}`}>
                    {blogDeleteState.message}
                  </p>
                )}
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

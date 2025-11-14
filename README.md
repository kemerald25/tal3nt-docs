## Tal3nt Docs Surface

Next.js 16 + TypeScript + Tailwind v4 implementation of the Tal3nt documentation, blog, and admin console. The UI mirrors the sci-fi gradient + card language from `tal3nt_app` while delivering a GitBook-inspired reading experience.

### Commands

```bash
npm install          # install deps
npm run dev          # start dev server on http://localhost:3000
npm run build        # production build
npm start            # serve the build
```

### Environment

Create `.env.local` with the same Firebase client config already used in `tal3nt_app` plus the admin allowlist:

```
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESAGGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
NEXT_PUBLIC_FIREBASE_MEARSUREMENT_ID=...
NEXT_PUBLIC_ADMIN_EMAILS=founder@tal3nt.xyz,ops@tal3nt.xyz
```

Only Google accounts listed in `NEXT_PUBLIC_ADMIN_EMAILS` can write docs/blogs through `/admin` or the REST APIs. No Firebase Admin SDK or server-side session cookies are required.

### Project Map

- `src/app/page.tsx` – marketing/landing that highlights docs + blog.
- `src/app/docs/*` – sidebar-driven documentation reader with markdown rendering.
- `src/app/blog/*` – blog listing + long-form markdown detail view.
- `src/app/admin` – Google-authenticated CMS that writes directly to Firestore.
- `src/app/api/{docs,blogs}` – REST endpoints with Google ID-token auth.
- `src/lib/firebase/*` – shared Firebase client + Firestore helpers.
- `src/lib/admin-auth.ts` – lightweight Google token verification (no admin SDK).
- `src/data/{docs,blogs}.json` – seed data automatically pushed to Firestore on first boot.

### Firestore Layout

- `docSections` – `{ title, description, order }` sidebar groupings.
- `docPages` – `{ sectionId, title, summary, content, slug, lastUpdated, position }` markdown entries.
- `blogPosts` – `{ title, excerpt, content, tags, heroImage, slug, author, publishedAt }` articles.

On the first request the server fetches `https://docs.tal3nt.xyz/readme.md`, seeds it into the "Introduction" page, and loads the sample content from `src/data` so visitors never hit a 404.

### Admin Flow

1. Hit `/admin` directly (link hidden from the public nav).
2. Click “Sign in with Google” and use an email from `NEXT_PUBLIC_ADMIN_EMAILS`.
3. Once verified, the Docs + Blog panels unlock. Submissions write to Firestore and revalidate `/`, `/docs`, `/blog`, and the relevant detail pages.
4. Sign out to lock the dashboard again.

### API Snippets

```bash
# list docs
curl http://localhost:3000/api/docs

# create/update a doc page (Google ID token required)
curl -X POST http://localhost:3000/api/docs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ID_TOKEN" \
  -d '{"title":"New Playbook","sectionId":"welcome","content":"## Hello"}'
```

> Obtain `ID_TOKEN` from any Google OAuth flow (Firebase client SDK, `gcloud auth print-identity-token`, etc.) tied to an approved admin email.

All imagery/icons ship from `tal3nt_app/public`, keeping the docs visually aligned with the core product. Firestore is the single source of truth, but you can extend the API routes or connect them to cron jobs to mirror content across environments.

# Local Admin Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a local-only browser editor for EgeBase article body text.

**Architecture:** Keep MDX files as the source of truth. Add a filesystem helper, route handlers guarded to development mode, and a small client editor at `/admin`.

**Tech Stack:** Next.js App Router route handlers, React client component, Node filesystem APIs, gray-matter, built-in `node --test`.

## Global Constraints

- No database, backend service, auth, online CMS, mock content, or rich-text editor.
- Save only MDX body text in v1; metadata is read-only.
- Preserve existing editorial identity and project structure.
- Restrict writes to known content article files.
- Development-only API access.

---

### Task 1: Admin Content Filesystem Helper

**Files:**
- Create: `test/admin-content.test.mjs`
- Create: `lib/admin-content.ts`

**Interfaces:**
- Produces `listAdminArticles(): AdminArticleSummary[]`
- Produces `readAdminArticle(id: string): AdminArticleDetail`
- Produces `writeAdminArticleBody(id: string, body: string): AdminArticleDetail`

- [ ] Write a failing test proving a temporary MDX file can be listed, read, and rewritten while preserving frontmatter.
- [ ] Implement the helper with section-based path resolution.
- [ ] Run `node --test test/admin-content.test.mjs`.

### Task 2: Admin API

**Files:**
- Create: `app/api/admin/articles/route.ts`
- Create: `app/api/admin/articles/[id]/route.ts`

**Interfaces:**
- `GET /api/admin/articles` returns `{ articles }` or `{ article }` when `?id=...` is present.
- `PUT /api/admin/articles/[id]` accepts `{ body: string }` and returns `{ article }`.

- [ ] Add development-only guard.
- [ ] Add list/detail/read endpoint.
- [ ] Add save endpoint.
- [ ] Verify with local HTTP requests.

### Task 3: Admin UI

**Files:**
- Create: `app/admin/page.tsx`
- Create: `components/admin/admin-editor.tsx`

**Interfaces:**
- Server page renders metadata and initial article list.
- Client editor fetches article details and saves body edits.

- [ ] Add an editorial admin shell.
- [ ] Add article list, metadata preview, textarea editor, save/reset states.
- [ ] Keep metadata read-only in v1.
- [ ] Verify `/admin` in dev server.

### Task 4: Final Verification

**Files:**
- Modify: `package.json`

- [ ] Add `test:admin` script.
- [ ] Run `npm run test:admin`.
- [ ] Run `npm run lint`.
- [ ] Run `npm run typecheck`.
- [ ] Run `npm run build`.
- [ ] Verify `/admin` returns `200`.

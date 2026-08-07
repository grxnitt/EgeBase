# Local Admin Design

## Goal

Add a local-only article editor for EgeBase so article text can be edited in the browser without opening MDX files in VS Code.

## Scope

- Add `/admin` as a development-only editing surface.
- List existing published/coming-soon MDX articles from available theory sections.
- Let the user select an article and edit only the MDX body text.
- Show frontmatter metadata as read-only context.
- Save the edited body back to the same `.mdx` file while preserving frontmatter.
- Do not add auth, database, remote CMS, rich-text editing, version history, or online publishing.

## Architecture

- `lib/admin-content.ts` owns all filesystem parsing and writing.
- `app/api/admin/articles/route.ts` exposes article list and article details.
- `app/api/admin/articles/[id]/route.ts` saves a selected article body.
- `app/admin/page.tsx` renders the editorial admin shell.
- `components/admin/admin-editor.tsx` handles client-side selection, editing, save states, and errors.

## Safety

- API handlers must reject non-development access.
- Article IDs must resolve only through known `contentDir` entries from `config/theory.ts`.
- The editor writes only the article body and preserves the original frontmatter block.
- File paths are never accepted directly from the client.

## Verification

- Add a Node test for reading and rewriting MDX body while preserving frontmatter.
- Run admin content test, lint, typecheck, build.
- Start dev server and verify `/admin` returns `200`.

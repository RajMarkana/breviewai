# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Project

**BReviewAI** — AI-powered Google review collection. Businesses sign in with Google, set up a branded profile, share a public link/QR with customers; customers pick a star rating, Groq AI generates 3 review suggestions matched to that rating, customer picks one and is redirected to the business's Google Review URL with the text copied to clipboard.

## Commands

```bash
npm run dev      # dev server (Turbopack) on :3000
npm run build    # production build (also runs TypeScript)
npm run start    # serve the production build
npx tsc --noEmit # type-check only, no build
```

No test suite or linter is configured.

## Required environment

`.env.local` must be populated before running. See `.env.local.example`:

- `NEXT_PUBLIC_FIREBASE_*` — web SDK config (Auth, Firestore)
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` + `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` — Cloudinary unsigned preset, used for logo/banner uploads
- `GROQ_API_KEY` — server-only, used by `/api/generate`
- `NEXT_PUBLIC_BASE_URL` — used as the public review link base

Firebase project must have **Google sign-in** enabled and **Firestore** created. Cloudinary needs an **unsigned upload preset** (Console → Settings → Upload → Add upload preset, Signing Mode: Unsigned).

## Architecture

Next.js 16 App Router, TypeScript, Tailwind v4. Firebase **client SDK only** for Auth + Firestore — there is no Admin SDK; all reads/writes use the public web SDK and rely on Firestore security rules for authorization. **Image uploads go to Cloudinary, not Firebase Storage** — `src/lib/cloudinary.ts` POSTs directly to Cloudinary's unsigned upload endpoint from the browser; the secure URL it returns is stored in the Firestore doc. Tracking endpoints (`/api/track`) also use the client SDK from the server runtime, which is fine for unauthenticated counter increments but means rules must allow it.

**Data model.** Single Firestore collection `businesses`, document ID = `ownerUid` (one business per user). The `slug` field is the public URL identifier and must be unique — `onboarding/page.tsx` enforces this by querying before write. Public review page (`/r/[slug]`) looks up by `slug`, not by document ID.

**Firebase init is lazy.** `src/lib/firebase.ts` exports `auth`/`db`/`storage` as `Proxy` objects that only call `initializeApp` on first property access. This is required because `next build` runs route handler module loads during page-data collection, and a top-level `initializeApp` with empty env vars throws. **Don't** revert to eager init.

**Auth flow.** `AuthProvider` in `src/lib/auth-context.tsx` wraps the whole app in `layout.tsx` and exposes `useAuth()`. After Google sign-in, `/login` checks Firestore for an existing `businesses/{uid}` doc and routes to `/dashboard` if present, otherwise `/onboarding`. The same gate logic lives in both `/onboarding` and `/dashboard` pages so they redirect correctly when entered directly.

**Public review page is a client component.** `/r/[slug]/page.tsx` uses `use(params)` (Next 16 requires this — `params` is a Promise) and fetches the business via the client Firestore SDK. Don't convert it to a server component without first wiring up Firebase Admin, because the client SDK in a server component context will not authenticate as the visitor.

**AI generation.** `/api/generate` builds a system prompt that conditions tone on the star rating (5 = enthusiastic, 1 = frustrated-but-factual) and asks Groq for a JSON object with a `reviews` array. Uses `response_format: json_object` and `llama-3.3-70b-versatile`. The route is `runtime = "nodejs"` because the Groq SDK uses Node APIs.

**Tracking.** `/api/track` increments either `clicks` (Google redirect) or `reviewsGenerated` (AI call succeeded) on the business doc, keyed by slug. Fire-and-forget from the public page — failures are intentionally swallowed.

## Conventions

- Tailwind v4 only — no shadcn, no other UI libraries. Reusable input styling lives as a `const inputCls` string in pages, not a component.
- Use plain `<img>` (with `eslint-disable-next-line @next/next/no-img-element`) for Cloudinary URLs; `next/image` is only used for assets we own.
- The brand uses `--brand` (`#2563eb`) defined in `globals.css` and a `.btn-brand` utility class. Don't introduce a competing color system.

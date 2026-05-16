"use client";

import { use, useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  collection,
  getDocs,
  limit,
  query,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Business } from "@/lib/types";

// ─── IMPORTANT ──────────────────────────────────────────────────────────────
// Google does NOT support pre-filling stars or text via URL parameters.
// The correct UX is:
//   1. Copy AI text to clipboard automatically
//   2. Redirect to: https://search.google.com/local/writereview?placeid=PLACE_ID
//   3. Show an intermediate "copied!" screen so the user knows to paste
//
// In Firestore, store `googlePlaceId` (e.g. "ChIJxxx...") alongside
// `googleReviewUrl`.  If only `googleReviewUrl` exists the code falls back to it.
//
// How to get a Place ID for any business:
//   https://developers.google.com/maps/documentation/javascript/examples/places-placeid-finder
// ────────────────────────────────────────────────────────────────────────────

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function ReviewPage({ params }: PageProps) {
  const { slug } = use(params);

  return (
    <Suspense
      fallback={
        <main className="flex flex-1 items-center justify-center p-8 text-zinc-500">
          Loading…
        </main>
      }
    >
      <ReviewPageContent slug={slug} />
    </Suspense>
  );
}

// ─── Step type ───────────────────────────────────────────────────────────────
type Step =
  | "rating"      // user picks stars
  | "suggestions" // AI generated reviews shown
  | "copied";     // clipboard copied, ready to open Google

function ReviewPageContent({ slug }: { slug: string }) {
  const searchParams = useSearchParams();

  const [biz, setBiz] = useState<Business | null>(null);
  const [notFound, setNotFound] = useState(false);

  // star interaction
  const [hover, setHover] = useState(0);
  const [rating, setRating] = useState(0);

  // AI review generation
  const [loadingAI, setLoadingAI] = useState(false);
  const [reviews, setReviews] = useState<string[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  // flow state
  const [step, setStep] = useState<Step>("rating");
  const [copyFailed, setCopyFailed] = useState(false);

  // ── URL-param mode (e.g. from QR-code share) ─────────────────────────────
  const urlRating = searchParams?.get("rating") || "";
  const urlText   = searchParams?.get("text")   || "";
  const isUrlMode = Boolean(urlRating && urlText);

  useEffect(() => {
    (async () => {
      try {
        const q = query(
          collection(db, "businesses"),
          where("slug", "==", slug.toLowerCase()),
          limit(1)
        );
        const snap = await getDocs(q);
        if (snap.empty) { setNotFound(true); return; }
        setBiz(snap.docs[0].data() as Business);
      } catch {
        setNotFound(true);
      }
    })();
  }, [slug]);

  // Build the correct Google review URL using Place ID when available
  function buildGoogleReviewUrl(biz: Business): string {
    // Best format – opens the write-review panel directly, no extra friction
    if ((biz as any).googlePlaceId) {
      return `https://search.google.com/local/writereview?placeid=${(biz as any).googlePlaceId}`;
    }
    // Fallback to whatever URL the owner stored
    return biz.googleReviewUrl;
  }

  // ── Generate AI suggestions ───────────────────────────────────────────────
  async function generate(forRating: number) {
    if (!biz) return;
    setRating(forRating);
    setSelected(null);
    setReviews([]);
    setAiError(null);
    setLoadingAI(true);
    setStep("suggestions");
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating: forRating,
          businessName: biz.name,
          description: biz.description,
          services: biz.services,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAiError(data.error || "Failed to generate reviews");
      } else {
        setReviews(data.reviews || []);
      }
    } catch (e) {
      setAiError((e as Error).message || "Network error");
    } finally {
      setLoadingAI(false);
    }
  }

  // ── Post review flow ──────────────────────────────────────────────────────
  // Google CANNOT accept pre-filled text via URL params.
  // Instead: copy text → show "Paste on Google" screen → open Google.
  async function handlePost() {
    if (!biz || selected === null) return;
    const text = reviews[selected];

    // 1. Copy to clipboard
    try {
      await navigator.clipboard.writeText(text);
      setCopyFailed(false);
    } catch {
      // Clipboard can fail on iOS without user gesture – we flag it so UI
      // can show a manual-copy fallback but we still proceed.
      setCopyFailed(true);
    }

    // 2. Show intermediate "copied" confirmation screen
    setStep("copied");
  }

  // Called when user taps "Open Google Reviews" on the copied screen
  function openGoogle() {
    if (!biz) return;
    window.open(buildGoogleReviewUrl(biz), "_blank", "noopener,noreferrer");
  }

  // ── URL-mode post (QR / share link) ──────────────────────────────────────
  async function handleUrlModePost() {
    if (!biz) return;
    try {
      await navigator.clipboard.writeText(urlText);
      setCopyFailed(false);
    } catch {
      setCopyFailed(true);
    }
    setStep("copied");
  }

  // ── Render guards ─────────────────────────────────────────────────────────
  if (notFound) {
    return (
      <main className="flex flex-1 items-center justify-center p-8 text-center">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Review page not found</h1>
          <p className="mt-2 text-zinc-600">This link is invalid or has been removed.</p>
        </div>
      </main>
    );
  }

  if (!biz) {
    return (
      <main className="flex flex-1 items-center justify-center p-8 text-zinc-500">
        Loading…
      </main>
    );
  }

  const displayRating = isUrlMode ? parseInt(urlRating) : rating;

  // ── Main render ───────────────────────────────────────────────────────────
  return (
    <main className="flex-1 bg-zinc-50 px-4 py-10">
      <div className="mx-auto max-w-2xl">

        {/* Banner */}
        <div className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-gradient-to-r from-blue-600 to-indigo-600 sm:h-48">
          {biz.bannerUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={biz.bannerUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
          )}
        </div>

        <div className="mt-6">
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 sm:p-8">

            {/* Business header */}
            <div className="flex items-center gap-4">
              {biz.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={biz.logoUrl}
                  alt={`${biz.name} logo`}
                  className="h-16 w-16 rounded-xl border border-zinc-200 object-cover"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-blue-600 text-2xl font-bold text-white">
                  {biz.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="flex-1">
                <h1 className="text-2xl font-bold tracking-tight text-zinc-900">{biz.name}</h1>
                {biz.description && (
                  <p className="mt-1 text-sm text-zinc-600">{biz.description}</p>
                )}
                {biz.phone && (
                  <a
                    href={`tel:${biz.phone}`}
                    className="mt-3 inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-50"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    Call Now
                  </a>
                )}
              </div>
            </div>

            {/* ── STEP: COPIED ─────────────────────────────────────────── */}
            {step === "copied" && (
              <CopiedScreen
                rating={displayRating}
                text={isUrlMode ? urlText : (selected !== null ? reviews[selected] : "")}
                copyFailed={copyFailed}
                onOpen={openGoogle}
                onBack={() => setStep(isUrlMode ? "rating" : "suggestions")}
              />
            )}

            {/* ── URL-MODE (QR share link) – show pre-selected review ─── */}
            {step !== "copied" && isUrlMode && (
              <div className="mt-8 border-t border-zinc-200 pt-6">
                <h2 className="text-base font-semibold text-zinc-900">Your Selected Review</h2>
                <div className="mt-3 flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} filled={s <= displayRating} size={32} />
                  ))}
                </div>
                <div className="mt-4 rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-700 leading-relaxed">
                  {urlText}
                </div>
                <div className="mt-4">
                  <button
                    onClick={handleUrlModePost}
                    className="btn-brand w-full rounded-lg px-5 py-2.5 font-semibold"
                  >
                    Copy &amp; Open Google Reviews
                  </button>
                </div>
              </div>
            )}

            {/* ── STEP: RATING (star picker) ───────────────────────────── */}
            {step === "rating" && !isUrlMode && (
              <div className="mt-8">
                <p className="text-center text-sm font-medium text-zinc-700">
                  How was your experience?
                </p>
                <div
                  className="mt-3 flex items-center justify-center gap-2"
                  onMouseLeave={() => setHover(0)}
                >
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      aria-label={`${star} star${star > 1 ? "s" : ""}`}
                      onMouseEnter={() => setHover(star)}
                      onClick={() => generate(star)}
                      className="transition-transform hover:scale-110"
                    >
                      <Star filled={star <= (hover || rating)} size={40} />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ── STEP: SUGGESTIONS ────────────────────────────────────── */}
            {step === "suggestions" && !isUrlMode && (
              <div className="mt-8 border-t border-zinc-200 pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-semibold text-zinc-900">Pick a review</h2>
                    <p className="mt-0.5 text-sm text-zinc-500">
                      Tap one to select, then we&apos;ll copy it for you.
                    </p>
                  </div>
                  <button
                    onClick={() => { setStep("rating"); setRating(0); }}
                    className="text-xs text-zinc-400 hover:text-zinc-600"
                  >
                    ← Change rating
                  </button>
                </div>

                {/* Selected rating display */}
                <div className="mt-3 flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} filled={s <= rating} size={24} />
                  ))}
                  <span className="ml-2 text-sm text-zinc-500">{rating} star{rating !== 1 ? "s" : ""}</span>
                </div>

                {/* Skeletons */}
                {loadingAI && (
                  <div className="mt-4 space-y-3">
                    {[0, 1, 2].map((i) => (
                      <div key={i} className="h-20 animate-pulse rounded-xl bg-zinc-100" />
                    ))}
                  </div>
                )}

                {/* Error */}
                {aiError && (
                  <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{aiError}</p>
                )}

                {/* Review cards */}
                {!loadingAI && reviews.length > 0 && (
                  <div className="mt-4 space-y-3">
                    {reviews.map((r, i) => {
                      const isSelected = selected === i;
                      return (
                        <button
                          key={i}
                          onClick={() => setSelected(isSelected ? null : i)}
                          className={
                            "block w-full rounded-xl border p-4 text-left text-sm leading-relaxed transition " +
                            (isSelected
                              ? "border-blue-600 bg-blue-50 ring-2 ring-blue-600/30"
                              : "border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50")
                          }
                        >
                          {isSelected && (
                            <span className="mb-2 flex items-center gap-1 text-xs font-semibold text-blue-600">
                              <CheckIcon /> Selected
                            </span>
                          )}
                          {r}
                        </button>
                      );
                    })}

                    <div className="flex flex-wrap gap-3 pt-2">
                      <button
                        onClick={() => generate(rating)}
                        className="rounded-lg border border-zinc-300 px-4 py-2.5 text-sm font-medium hover:bg-zinc-50"
                      >
                        Regenerate
                      </button>
                      <button
                        onClick={handlePost}
                        disabled={selected === null}
                        className="btn-brand flex-1 rounded-lg px-5 py-2.5 font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        Copy &amp; Post on Google →
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>

          <p className="mt-6 text-center text-xs text-zinc-400">
            Powered by{" "}
            <a href="/" className="hover:underline">BReviewAI</a>
          </p>
        </div>
      </div>
    </main>
  );
}

// ─── Copied / Confirmation Screen ────────────────────────────────────────────
function CopiedScreen({
  rating,
  text,
  copyFailed,
  onOpen,
  onBack,
}: {
  rating: number;
  text: string;
  copyFailed: boolean;
  onOpen: () => void;
  onBack: () => void;
}) {
  const [manualCopied, setManualCopied] = useState(false);

  async function manualCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setManualCopied(true);
      setTimeout(() => setManualCopied(false), 2000);
    } catch {
      // Ignore – user can select text manually
    }
  }

  return (
    <div className="mt-8 border-t border-zinc-200 pt-6">

      {/* Success banner */}
      <div className={`rounded-xl px-4 py-3 text-sm font-medium flex items-center gap-2 ${
        copyFailed
          ? "bg-amber-50 text-amber-700 border border-amber-200"
          : "bg-green-50 text-green-700 border border-green-200"
      }`}>
        {copyFailed ? (
          <>
            <span>⚠️</span>
            <span>Couldn&apos;t auto-copy. Please copy the review text below manually, then open Google.</span>
          </>
        ) : (
          <>
            <span>✅</span>
            <span>Review text copied to clipboard!</span>
          </>
        )}
      </div>

      {/* Star display */}
      <div className="mt-4 flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((s) => (
          <Star key={s} filled={s <= rating} size={24} />
        ))}
      </div>

      {/* Review text (always shown so user can verify / manually copy) */}
      <div className="mt-3 relative">
        <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-700 leading-relaxed whitespace-pre-wrap">
          {text}
        </div>
        <button
          onClick={manualCopy}
          className="absolute top-2 right-2 rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-50"
        >
          {manualCopied ? "Copied!" : "Copy"}
        </button>
      </div>

      {/* Instruction steps */}
      <ol className="mt-5 space-y-2 text-sm text-zinc-600">
        <li className="flex items-start gap-2">
          <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">1</span>
          <span>Click <strong>Open Google Reviews</strong> below.</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">2</span>
          <span>Select the number of stars you want to give.</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">3</span>
          <span>Tap the text box and <strong>paste</strong> (Ctrl+V / ⌘V / long-press → Paste).</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">4</span>
          <span>Hit <strong>Post</strong> — you&apos;re done! 🎉</span>
        </li>
      </ol>

      {/* CTA */}
      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <button
          onClick={onOpen}
          className="btn-brand flex-1 rounded-lg px-5 py-3 font-semibold text-center flex items-center justify-center gap-2"
        >
          <GoogleIcon />
          Open Google Reviews
        </button>
        <button
          onClick={onBack}
          className="rounded-lg border border-zinc-300 px-4 py-3 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
        >
          ← Go Back
        </button>
      </div>
    </div>
  );
}

// ─── Small components ────────────────────────────────────────────────────────
function Star({ filled, size = 40 }: { filled: boolean; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? "#facc15" : "none"}
      stroke={filled ? "#facc15" : "#d4d4d8"}
      strokeWidth="1.5"
      className="drop-shadow-sm"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.562.562 0 00.475.345l5.518.442c.499.04.701.663.32.988l-4.204 3.602a.562.562 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.562.562 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.32-.988l5.518-.442a.562.562 0 00.475-.345L11.48 3.5z"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}
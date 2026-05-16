"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signInWithGoogle } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Navbar from "@/components/Navbar";

export default function LoginPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [signingIn, setSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && user) {
      routeAfterLogin(user.uid);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, loading]);

  async function routeAfterLogin(uid: string) {
    try {
      const snap = await getDoc(doc(db, "businesses", uid));
      if (snap.exists()) router.replace("/dashboard");
      else router.replace("/onboarding");
    } catch (e) {
      const err = e as Error;
      if (err.message.includes("offline")) {
        setError("Failed to connect to Firebase. Please check your internet connection or project configuration.");
      } else {
        router.replace("/onboarding");
      }
    }
  }

  async function handleGoogle() {
    setError(null);
    setSigningIn(true);
    try {
      const u = await signInWithGoogle();
      await routeAfterLogin(u.uid);
    } catch (e) {
      const err = e as Error;
      setError(err.message || "Sign in failed");
      setSigningIn(false);
    }
  }

  return (
    <>
      <Navbar />
      <main className="flex flex-1 items-center justify-center px-4 py-16">
        <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
            Welcome to BReviewAI
          </h1>
          <p className="mt-2 text-zinc-600">
            Sign in with Google to set up your branded review page.
          </p>

          <button
            onClick={handleGoogle}
            disabled={signingIn || loading}
            className="mt-6 flex w-full items-center justify-center gap-3 rounded-lg border border-zinc-300 bg-white px-4 py-3 font-medium text-zinc-800 transition hover:bg-zinc-50 disabled:opacity-50"
          >
            <GoogleIcon />
            {signingIn ? "Signing in…" : "Continue with Google"}
          </button>

          {error && (
            <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}

          <p className="mt-6 text-center text-sm text-zinc-500">
            <Link href="/" className="hover:text-zinc-800">
              ← Back to home
            </Link>
          </p>
        </div>
      </main>
    </>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 48 48" className="h-5 w-5" aria-hidden="true">
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3C33.7 32.4 29.3 35.5 24 35.5c-6.4 0-11.5-5.1-11.5-11.5S17.6 12.5 24 12.5c2.9 0 5.6 1.1 7.6 2.9l5.7-5.7C33.8 6.4 29.1 4.5 24 4.5 13.2 4.5 4.5 13.2 4.5 24S13.2 43.5 24 43.5 43.5 34.8 43.5 24c0-1.2-.1-2.3-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.7 16 19 12.5 24 12.5c2.9 0 5.6 1.1 7.6 2.9l5.7-5.7C33.8 6.4 29.1 4.5 24 4.5 16.3 4.5 9.7 8.9 6.3 14.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 43.5c5 0 9.6-1.9 13-5.1l-6-5c-2 1.4-4.4 2.1-7 2.1-5.3 0-9.7-3.1-11.3-7.5l-6.5 5C9.6 39.1 16.2 43.5 24 43.5z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-.8 2.1-2.2 3.9-4 5.2l6 5c-.4.4 6.5-4.7 6.5-14.2 0-1.2-.1-2.3-.2-3.5z"
      />
    </svg>
  );
}

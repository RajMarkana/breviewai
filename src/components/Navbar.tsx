"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { signOut } from "@/lib/firebase";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const { user, loading } = useAuth();
  const router = useRouter();

  async function handleSignOut() {
    await signOut();
    router.push("/");
  }

  return (
    <header className="border-b border-zinc-200 bg-white/80 backdrop-blur sticky top-0 z-20">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-rose-600 text-white font-bold">
            B
          </span>
          <span className="text-lg font-semibold tracking-tight">BReviewAI</span>
        </Link>
        <nav className="flex items-center gap-3 text-sm">
          {!loading && user ? (
            <>
              <Link
                href="/dashboard"
                className="rounded-md px-3 py-2 text-zinc-700 hover:bg-zinc-100"
              >
                Dashboard
              </Link>
              <button
                onClick={handleSignOut}
                className="rounded-md border border-zinc-300 px-3 py-2 text-zinc-700 hover:bg-zinc-50"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-md btn-brand px-4 py-2 font-medium"
            >
              Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}

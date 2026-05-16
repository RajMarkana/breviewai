"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { db } from "@/lib/firebase";
import {
  doc,
  getDoc,
  setDoc,
  query,
  collection,
  where,
  getDocs,
} from "firebase/firestore";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { slugify } from "@/lib/slug";
import Navbar from "@/components/Navbar";
import type { Business } from "@/lib/types";

const inputCls =
  "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15";

export default function OnboardingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [checking, setChecking] = useState(true);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [services, setServices] = useState("");
  const [googleReviewUrl, setGoogleReviewUrl] = useState("");
  const [phone, setPhone] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    (async () => {
      try {
        const snap = await getDoc(doc(db, "businesses", user.uid));
        if (snap.exists()) {
          router.replace("/dashboard");
          return;
        }
      } catch (e) {
        const err = e as Error;
        setError(err.message || "Failed to check business status");
      } finally {
        setChecking(false);
      }
    })();
  }, [user, loading, router]);

  async function uploadFile(file: File, folder: string): Promise<string> {
    if (!user) throw new Error("Not signed in");
    return uploadToCloudinary(file, `breviewai/${folder}/${user.uid}`);
  }

  async function findAvailableSlug(base: string): Promise<string> {
    const baseSlug = slugify(base) || "business";
    let candidate = baseSlug;
    while (true) {
      const q = query(
        collection(db, "businesses"),
        where("slug", "==", candidate.toLowerCase()),
      );
      const res = await getDocs(q);
      if (res.empty) return candidate;
      const randomSuffix = Math.random().toString(36).substring(2, 6);
      candidate = `${baseSlug}-${randomSuffix}`;
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setError(null);

    if (!name.trim() || !googleReviewUrl.trim()) {
      setError("Business name and Google Review URL are required.");
      return;
    }

    if (phone && /[a-zA-Z]/.test(phone)) {
      setError("Phone number must contain only numbers, spaces, and these characters: + ( ) -");
      return;
    }

    setSubmitting(true);
    try {
      const [logoUrl, bannerUrl] = await Promise.all([
        logoFile ? uploadFile(logoFile, "logos") : Promise.resolve(""),
        bannerFile ? uploadFile(bannerFile, "banners") : Promise.resolve(""),
      ]);
      const slug = await findAvailableSlug(name);
      const now = Date.now();
      const business: Business = {
        ownerUid: user.uid,
        slug,
        name: name.trim(),
        description: description.trim(),
        services: services.trim(),
        googleReviewUrl: googleReviewUrl.trim(),
        phone: phone.trim(),
        logoUrl,
        bannerUrl,
        clicks: 0,
        reviewsGenerated: 0,
        createdAt: now,
        updatedAt: now,
      };
      await setDoc(doc(db, "businesses", user.uid), business);
      router.replace("/dashboard");
    } catch (e) {
      const err = e as Error;
      setError(err.message || "Failed to save");
      setSubmitting(false);
    }
  }

  if (loading || checking) {
    return (
      <>
        <Navbar />
        <main className="flex flex-1 items-center justify-center p-8 text-zinc-500">
          Loading…
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="flex-1 px-4 py-10">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
            Set up your business
          </h1>
          <p className="mt-2 text-zinc-600">
            These details power your branded review page and AI suggestions.
          </p>

          <form
            onSubmit={handleSubmit}
            className="mt-8 space-y-5 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm"
          >
            {error && (
              <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </p>
            )}

            <Field label="Business name *" hint="Used in your URL and reviews">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Acme Coffee Roasters"
                required
                className={inputCls}
              />
            </Field>

            <Field
              label="Google Review URL *"
              hint="Find this in your Google Business profile → Get more reviews"
            >
              <input
                type="url"
                value={googleReviewUrl}
                onChange={(e) => setGoogleReviewUrl(e.target.value)}
                placeholder="https://g.page/r/..."
                required
                className={inputCls}
              />
            </Field>

            <Field label="Description" hint="A short blurb about your business">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Specialty coffee roaster in downtown Austin since 2014."
                className={inputCls}
              />
            </Field>

            <Field label="Services" hint="Comma-separated services / specialties">
              <input
                type="text"
                value={services}
                onChange={(e) => setServices(e.target.value)}
                placeholder="Pour-over, espresso, pastries, beans by the pound"
                className={inputCls}
              />
            </Field>

            <Field label="Phone Number" hint="Customers can call you directly from the review page">
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 123-4567"
                className={inputCls}
              />
            </Field>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Logo" hint="PNG or JPG, square works best">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setLogoFile(e.target.files?.[0] ?? null)}
                  className="w-full text-sm"
                />
              </Field>
              <Field label="Banner" hint="Shown at top of review page">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setBannerFile(e.target.files?.[0] ?? null)}
                  className="w-full text-sm"
                />
              </Field>
            </div>

            {error && (
              <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="btn-brand w-full rounded-lg px-5 py-3 font-semibold disabled:opacity-50"
            >
              {submitting ? "Saving…" : "Create my review page"}
            </button>
          </form>
        </div>
      </main>
    </>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-zinc-800">{label}</span>
      {hint && (
        <span className="block text-xs text-zinc-500 mb-1.5">{hint}</span>
      )}
      {children}
    </label>
  );
}

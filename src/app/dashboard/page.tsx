"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { uploadToCloudinary } from "@/lib/cloudinary";
import Navbar from "@/components/Navbar";
import QRCode from "qrcode";
import type { Business } from "@/lib/types";

const inputCls =
  "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-rose-600 focus:ring-2 focus:ring-rose-600/15";

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [biz, setBiz] = useState<Business | null>(null);
  const [pageReady, setPageReady] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [copied, setCopied] = useState(false);

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [services, setServices] = useState("");
  const [googleReviewUrl, setGoogleReviewUrl] = useState("");
  const [phone, setPhone] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
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
        if (!snap.exists()) {
          router.replace("/onboarding");
          return;
        }
        const data = snap.data() as Business;
        setBiz(data);
        setName(data.name);
        setDescription(data.description);
        setServices(data.services);
        setGoogleReviewUrl(data.googleReviewUrl);
        setPhone(data.phone || "");
      } catch (e) {
        const err = e as Error;
        setError(err.message || "Failed to load dashboard data");
      } finally {
        setPageReady(true);
      }
    })();
  }, [user, loading, router]);

  const baseUrl =
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_BASE_URL || "";
  const publicUrl = biz ? `${baseUrl}/r/${biz.slug.toLowerCase()}` : "";

  useEffect(() => {
    if (!publicUrl) return;
    QRCode.toDataURL(publicUrl, { width: 320, margin: 1 })
      .then(setQrDataUrl)
      .catch(() => setQrDataUrl(""));
  }, [publicUrl]);

  async function handleCopy() {
    if (!publicUrl) return;
    await navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  async function uploadFile(file: File, folder: string): Promise<string> {
    if (!user) throw new Error("Not signed in");
    return uploadToCloudinary(file, `breviewai/${folder}/${user.uid}`);
  }

  async function handleSave() {
    if (!user || !biz) return;
    if (phone && /[a-zA-Z]/.test(phone)) {
      setError("Phone number must contain only numbers, spaces, and these characters: + ( ) -");
      return;
    }
    setError(null);
    setSaving(true);
    try {
      let logoUrl = biz.logoUrl;
      let bannerUrl = biz.bannerUrl;
      if (logoFile) logoUrl = await uploadFile(logoFile, "logos");
      if (bannerFile) bannerUrl = await uploadFile(bannerFile, "banners");
      const updates: Partial<Business> = {
        name: name.trim(),
        description: description.trim(),
        services: services.trim(),
        googleReviewUrl: googleReviewUrl.trim(),
        phone: phone.trim(),
        logoUrl,
        bannerUrl,
        updatedAt: Date.now(),
      };
      await updateDoc(doc(db, "businesses", user.uid), updates);
      setBiz({ ...biz, ...updates } as Business);
      setEditing(false);
      setLogoFile(null);
      setBannerFile(null);
    } catch (e) {
      const err = e as Error;
      setError(err.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  if (loading || !pageReady) {
    return (
      <>
        <Navbar />
        <main className="flex flex-1 items-center justify-center p-8 text-zinc-500">
          Loading…
        </main>
      </>
    );
  }

  if (!biz) {
    return (
      <>
        <Navbar />
        <main className="flex flex-1 flex-col items-center justify-center p-8 text-zinc-500">
          <p className="text-red-600 mb-4">{error || "Business not found."}</p>
          <button
            onClick={() => window.location.reload()}
            className="text-rose-600 hover:underline"
          >
            Retry
          </button>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="flex-1 px-4 py-10">
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
                Dashboard
              </h1>
              <p className="mt-1 text-zinc-600">
                Manage your branded review page and track engagement.
              </p>
            </div>
            <a
              href={publicUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-50"
            >
              View public page ↗
            </a>
          </div>

          {/* 2 Column Layout */}
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            {/* Left Column - Business Details */}
            <section className="rounded-2xl border border-zinc-200 bg-white p-6 ">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-zinc-900">
                Business details
              </h2>
              {!editing ? (
                <button
                  onClick={() => setEditing(true)}
                  className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium hover:bg-zinc-50"
                >
                  Edit
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditing(false);
                      setName(biz.name);
                      setDescription(biz.description);
                      setServices(biz.services);
                      setGoogleReviewUrl(biz.googleReviewUrl);
                      setPhone(biz.phone || "");
                      setLogoFile(null);
                      setBannerFile(null);
                      setError(null);
                    }}
                    className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium hover:bg-zinc-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="btn-brand rounded-lg px-3 py-1.5 text-sm font-semibold disabled:opacity-50"
                  >
                    {saving ? "Saving…" : "Save"}
                  </button>
                </div>
              )}
            </div>

            <div className="mt-5 grid gap-5">
              <Detail label="Business name">
                {editing ? (
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={inputCls}
                  />
                ) : (
                  <p className="text-zinc-900">{biz.name}</p>
                )}
              </Detail>

              <Detail label="Google Review URL">
                <div className="flex items-center gap-2">
                  {editing ? (
                    <input
                      type="url"
                      value={googleReviewUrl}
                      onChange={(e) => setGoogleReviewUrl(e.target.value)}
                      className={inputCls}
                    />
                  ) : (
                    <a
                      href={biz.googleReviewUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="break-all text-rose-600 hover:underline"
                    >
                      {biz.googleReviewUrl}
                    </a>
                  )}
                  <button
                    type="button"
                    title="How to get your Google Business URL"
                    className="group relative flex h-5 w-5 items-center justify-center rounded-full bg-zinc-100 text-zinc-500 hover:bg-zinc-200"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 w-64 -translate-x-1/2 rounded-lg bg-zinc-800 px-3 py-2 text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                      1. Go to your Google Business Profile<br/>
                      2. Click "Share profile"<br/>
                      3. Copy the "Review link"<br/>
                      <div className="absolute bottom-0 left-1/2 -mb-1 h-2 w-2 -translate-x-1/2 rotate-45 bg-zinc-800"></div>
                    </div>
                  </button>
                </div>
              </Detail>

              <Detail label="Description">
                {editing ? (
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className={inputCls}
                  />
                ) : (
                  <p className="text-zinc-700">
                    {biz.description || (
                      <span className="text-zinc-400">—</span>
                    )}
                  </p>
                )}
              </Detail>

              <Detail label="Services">
                {editing ? (
                  <input
                    value={services}
                    onChange={(e) => setServices(e.target.value)}
                    className={inputCls}
                  />
                ) : (
                  <p className="text-zinc-700">
                    {biz.services || <span className="text-zinc-400">—</span>}
                  </p>
                )}
              </Detail>

              <Detail label="Phone Number">
                {editing ? (
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className={inputCls}
                  />
                ) : (
                  <p className="text-zinc-700">
                    {biz.phone || <span className="text-zinc-400">—</span>}
                  </p>
                )}
              </Detail>

              <div className="grid gap-5 sm:grid-cols-2">
                <Detail label="Logo">
                  {biz.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={biz.logoUrl}
                      alt="Logo"
                      className="h-20 w-20 rounded-lg border border-zinc-200 object-cover"
                    />
                  ) : (
                    <p className="text-zinc-400">—</p>
                  )}
                  {editing && (
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        setLogoFile(e.target.files?.[0] ?? null)
                      }
                      className="mt-2 text-sm"
                    />
                  )}
                </Detail>

                <Detail label="Banner">
                  {biz.bannerUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={biz.bannerUrl}
                      alt="Banner"
                      className="h-20 w-full rounded-lg border border-zinc-200 object-cover"
                    />
                  ) : (
                    <p className="text-zinc-400">—</p>
                  )}
                  {editing && (
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        setBannerFile(e.target.files?.[0] ?? null)
                      }
                      className="mt-2 text-sm"
                    />
                  )}
                </Detail>
              </div>

              {error && (
                <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
                  {error}
                </p>
              )}
            </div>
            </section>

            {/* Right Column - QR & Public Link */}
            <div className="flex flex-col gap-6">
              {/* Share + QR */}
              <section className="rounded-2xl border border-zinc-200 bg-white p-6 ">
                <h2 className="text-lg font-semibold text-zinc-900">
                  Share your review page
                </h2>
                <div className="mt-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-700">
                      Public link
                    </label>
                    <div className="mt-1.5 flex gap-2">
                      <input
                        readOnly
                        value={publicUrl}
                        className={inputCls + " font-mono text-xs"}
                      />
                      <button
                        onClick={handleCopy}
                        className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-medium hover:bg-zinc-50 whitespace-nowrap"
                      >
                        {copied ? "Copied!" : "Copy"}
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-col items-center gap-2 border-t border-zinc-100 pt-4">
                    {qrDataUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={qrDataUrl}
                        alt="QR code"
                        className="h-32 w-32 rounded-lg border border-zinc-200"
                      />
                    ) : (
                      <div className="h-32 w-32 rounded-lg border border-zinc-200 bg-zinc-50" />
                    )}
                    <a
                      href={qrDataUrl || "#"}
                      download={`${biz.slug}-qr.png`}
                      className="text-sm font-medium text-rose-600 hover:underline"
                    >
                      Download QR
                    </a>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

function Detail({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-sm font-medium text-zinc-700">{label}</p>
      <div className="mt-1">{children}</div>
    </div>
  );
}

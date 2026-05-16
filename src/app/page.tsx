import Link from "next/link";
import Navbar from "@/components/Navbar";

const audiences = [
  { label: "Restaurants", icon: "🍽️" },
  { label: "Salons & Spas", icon: "💇" },
  { label: "Hotels", icon: "🏨" },
  { label: "Clinics & Dentists", icon: "🏥" },
  { label: "Gyms & Fitness", icon: "💪" },
  { label: "Cafes & Bakeries", icon: "☕" },
  { label: "Agencies", icon: "🏢" },
  { label: "Local Businesses", icon: "🏪" },
  { label: "Service Providers", icon: "🔧" },
  { label: "Auto Repair Shops", icon: "🚗" },
  { label: "Real Estate", icon: "🏠" },
  { label: "Tutors & Coaches", icon: "📚" },
];

const stats = [
  { value: "3×", label: "More reviews vs. manual asking" },
  { value: "60s", label: "Average time to post a review" },
  { value: "5★", label: "Average rating collected" },
  { value: "100%", label: "Free to get started" },
];

const features = [
  {
    icon: "✦",
    title: "AI-written review suggestions",
    body:
      "Based on your business name, services, and category — AI generates 3 authentic, human-sounding review options tailored to your business. No generic fluff.",
  },
  {
    icon: "🎨",
    title: "Branded review page",
    body:
      "Your customers land on a clean, professional page with your logo, banner, and business description. Completely branded to your business.",
  },
  {
    icon: "📱",
    title: "QR code — ready to print",
    body:
      "Download your QR code and stick it on your counter, receipt, or table. Customers scan → review in under 60 seconds. No app needed.",
  },
  {
    icon: "⭐",
    title: "Star-rated AI suggestions",
    body:
      "Customers tap how many stars they want to give. AI instantly generates reviews that match that sentiment — warm 5-star praise or honest 3-star feedback.",
  },
  {
    icon: "📋",
    title: "One-tap copy & post",
    body:
      "The chosen review is automatically copied to the customer's clipboard. They open Google, paste, and submit. Done in seconds.",
  },
  {
    icon: "🏢",
    title: "Multi-business dashboard",
    body:
      "Running multiple locations or managing clients? Add as many businesses as you need — each with its own review page and QR code.",
  },
];

const steps = [
  {
    step: "01",
    title: "Create your business profile",
    body:
      "Sign in with Google. Add your business name, description, services, logo, and banner photo. Then paste in your Google Review link — we'll show you exactly how to get it.",
    tip: "Takes under 60 seconds to set up.",
  },
  {
    step: "02",
    title: "Share your link or print your QR",
    body:
      "Send your review page link to customers via WhatsApp, SMS, or email right after service. Or download and print your QR code to display in your shop.",
    tip: "Strike while it's fresh — send it the same day.",
  },
  {
    step: "03",
    title: "Customer picks a star rating",
    body:
      "They land on your branded page and tap 1–5 stars. AI instantly generates 3 review suggestions that match their experience — ready to use in seconds.",
    tip: "Customers pick the one that feels most like them.",
  },
  {
    step: "04",
    title: "They copy and post on Google",
    body:
      "The chosen review is auto-copied to their clipboard. They tap 'Open Google Reviews', paste the text, and hit Post. The whole thing takes under a minute.",
    tip: "No sign-up required from your customer's side.",
  },
];

const howToGetReviewLink = [
  {
    step: "1",
    text: 'Search your business name on Google (e.g. "Raj Hair Salon Surat")',
  },
  {
    step: "2",
    text: 'In your Google Business panel on the right, click "Reviews" or the star rating',
  },
  {
    step: "3",
    text: 'Click "Write a review" — the popup will open',
  },
  {
    step: "4",
    text: "Copy the URL from your browser address bar",
  },
  {
    step: "5",
    text: "Paste it into your BReviewAI business profile — done!",
  },
];

const whyMatters = [
  {
    stat: "93%",
    text: "of customers read online reviews before visiting a local business",
  },
  {
    stat: "270×",
    text: "more likely to be chosen — businesses with reviews vs. none",
  },
  {
    stat: "83%",
    text: "of shoppers begin local research specifically on Google",
  },
  {
    stat: "4.0+",
    text: "star average is the minimum threshold most customers will trust",
  },
];

const problems = [
  {
    problem: "Customers don't know what to write",
    fix: "AI writes 3 options based on your business — they just pick one they like",
  },
  {
    problem: "The process feels long and confusing",
    fix: "Stars → pick review → copy → paste on Google. Under 60 seconds total",
  },
  {
    problem: "They forget after leaving your shop",
    fix: "Send the link on WhatsApp right after service — when the experience is fresh",
  },
];

const faqs = [
  {
    q: "Is this against Google's terms of service?",
    a: "No. Customers write and post their own review — AI just gives them suggestions to choose from. The customer always decides what to post and manually submits it themselves. This is the same approach used by every major review platform.",
  },
  {
    q: "Do I need a Google Business Profile?",
    a: "Yes — you'll need a verified Google Business Profile so you can get your Google Review link. Creating one is free. Once verified, getting your review link takes about 30 seconds (we show you exactly how inside the app).",
  },
  {
    q: "How do I get my Google Review link?",
    a: "Search your business on Google, find the Reviews section in your business panel, click 'Write a review', and copy the URL from your browser. That's your review link — paste it into your BReviewAI profile.",
  },
  {
    q: "Does my customer need to create an account?",
    a: "No. Customers just open your link or scan the QR code — no sign-up, no app, no friction. They only need to be signed into their Google account when they go to post on Google.",
  },
  {
    q: "Can I manage multiple businesses?",
    a: "Yes — from your dashboard you can add and manage as many business profiles as you need. Each gets its own review page and QR code.",
  },
];

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex-1">

        {/* ── Hero ─────────────────────────────────────────────────────── */}
        <section className="mx-auto max-w-6xl px-4 py-20 sm:py-28">
          <div className="max-w-3xl">
            <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
              AI-Powered Google Review Generation
            </span>
            <h1 className="mt-5 text-4xl sm:text-6xl font-bold tracking-tight text-zinc-900 leading-tight">
              Turn happy customers into{" "}
              <span className="text-blue-600">5-star Google reviews</span>.
            </h1>
            <p className="mt-5 text-lg text-zinc-600 leading-relaxed">
              BReviewAI gives every customer a branded page with AI-written
              review suggestions. They tap a star rating, pick a review they
              like, and post it on Google in under 60 seconds — no friction,
              no guessing what to write.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/login"
                className="btn-brand rounded-lg px-5 py-3 font-semibold"
              >
                Get started — it&apos;s free
              </Link>
              <a
                href="#how-it-works"
                className="rounded-lg border border-zinc-300 px-5 py-3 font-semibold text-zinc-800 hover:bg-zinc-50"
              >
                See how it works ↓
              </a>
            </div>
            <p className="mt-6 text-sm text-zinc-400">
              No credit card required &nbsp;·&nbsp; Setup in 60 seconds &nbsp;·&nbsp; Works for any local business
            </p>
          </div>
        </section>

        {/* ── Stats ────────────────────────────────────────────────────── */}
        <section className="border-t border-zinc-200">
          <div className="mx-auto max-w-6xl px-4 py-12">
            <div className="grid grid-cols-2 gap-px sm:grid-cols-4 rounded-2xl border border-zinc-200 overflow-hidden">
              {stats.map((s) => (
                <div key={s.value} className="bg-white px-6 py-8 text-center">
                  <p className="text-3xl font-bold text-blue-600">{s.value}</p>
                  <p className="mt-1 text-sm text-zinc-500">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── How it works ─────────────────────────────────────────────── */}
        <section id="how-it-works" className="border-t border-zinc-200 bg-zinc-50">
          <div className="mx-auto max-w-6xl px-4 py-16">
            <div className="max-w-xl">
              <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">How it works</p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-zinc-900">
                From setup to your first review in 4 steps
              </h2>
              <p className="mt-3 text-zinc-600">
                BReviewAI removes every excuse a customer has for not leaving a review.
              </p>
            </div>

            <div className="mt-12 grid gap-6 sm:grid-cols-2">
              {steps.map((s) => (
                <div key={s.step} className="rounded-2xl border border-zinc-200 bg-white p-6">
                  <span className="text-xs font-bold tracking-widest text-blue-600">STEP {s.step}</span>
                  <h3 className="mt-3 text-lg font-semibold text-zinc-900">{s.title}</h3>
                  <p className="mt-2 text-sm text-zinc-600 leading-relaxed">{s.body}</p>
                  <p className="mt-3 rounded-lg border border-zinc-100 bg-zinc-50 px-3 py-2 text-xs text-zinc-500">
                    💡 {s.tip}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── How to get your Google Review link ───────────────────────── */}
        <section className="border-t border-zinc-200">
          <div className="mx-auto max-w-6xl px-4 py-16">
            <div className="grid gap-12 lg:grid-cols-2 lg:items-start">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">Setup guide</p>
                <h2 className="mt-2 text-3xl font-bold tracking-tight text-zinc-900">
                  How to get your Google Review link
                </h2>
                <p className="mt-3 text-zinc-600 leading-relaxed">
                  You need your Google Review link to connect BReviewAI to your
                  Google Business Profile. Here&apos;s how to get it in 30 seconds:
                </p>
                <ol className="mt-6 space-y-3">
                  {howToGetReviewLink.map((item) => (
                    <li key={item.step} className="flex items-start gap-3">
                      <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border border-blue-200 bg-blue-50 text-xs font-bold text-blue-700">
                        {item.step}
                      </span>
                      <p className="text-sm text-zinc-600 leading-relaxed pt-0.5">{item.text}</p>
                    </li>
                  ))}
                </ol>
                <p className="mt-5 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-500">
                  Once you have the link, paste it into your BReviewAI business profile — that&apos;s all it takes to connect.
                </p>
              </div>

              {/* Visual mock of the review page flow */}
              <div className="rounded-2xl border border-zinc-200 bg-white p-6">
                <p className="text-sm font-semibold text-zinc-900 mb-4">What your customer sees</p>

                {/* Mock review page */}
                <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
                  {/* Banner mock */}
                  <div className="h-16 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 mb-4" />

                  {/* Business info mock */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-10 w-10 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm">B</div>
                    <div>
                      <div className="h-3 w-28 bg-zinc-200 rounded mb-1.5" />
                      <div className="h-2.5 w-20 bg-zinc-100 rounded" />
                    </div>
                  </div>

                  {/* Stars */}
                  <p className="text-xs text-zinc-500 text-center mb-2">How was your experience?</p>
                  <div className="flex justify-center gap-1 mb-4">
                    {[1,2,3,4,5].map(s => (
                      <span key={s} className="text-yellow-400 text-xl">★</span>
                    ))}
                  </div>

                  {/* Review options */}
                  <p className="text-xs font-medium text-zinc-700 mb-2">Pick a review you like</p>
                  <div className="space-y-2">
                    <div className="rounded-lg border-2 border-blue-500 bg-blue-50 p-2.5 text-xs text-zinc-700 leading-relaxed">
                      Absolutely love this place! The service was top-notch and the staff made me feel welcome. Will definitely be back! ⭐⭐⭐⭐⭐
                    </div>
                    <div className="rounded-lg border border-zinc-200 bg-white p-2.5 text-xs text-zinc-500 leading-relaxed">
                      Great experience overall. Professional team, clean space, and results exceeded my expectations...
                    </div>
                  </div>

                  {/* CTA */}
                  <button className="mt-3 w-full rounded-lg bg-blue-600 py-2 text-xs font-semibold text-white">
                    Copy &amp; Post on Google →
                  </button>
                </div>

                <p className="mt-4 text-xs text-zinc-400 text-center">
                  This is what customers see when they open your review page
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Features ─────────────────────────────────────────────────── */}
        <section className="border-t border-zinc-200 bg-zinc-50">
          <div className="mx-auto max-w-6xl px-4 py-16">
            <div className="max-w-xl">
              <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">Features</p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-zinc-900">
                Everything you need to collect reviews at scale
              </h2>
            </div>
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((f) => (
                <div key={f.title} className="rounded-2xl border border-zinc-200 bg-white p-6">
                  <span className="text-2xl">{f.icon}</span>
                  <h3 className="mt-4 text-base font-semibold text-zinc-900">{f.title}</h3>
                  <p className="mt-2 text-sm text-zinc-600 leading-relaxed">{f.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Why reviews matter ───────────────────────────────────────── */}
        <section className="border-t border-zinc-200">
          <div className="mx-auto max-w-6xl px-4 py-16">
            <div className="grid gap-12 lg:grid-cols-2 lg:items-start">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">Why it matters</p>
                <h2 className="mt-2 text-3xl font-bold tracking-tight text-zinc-900">
                  Reviews are the #1 factor in local search ranking
                </h2>
                <div className="mt-6 space-y-3">
                  {whyMatters.map((item) => (
                    <div key={item.stat} className="flex items-start gap-4 rounded-xl border border-zinc-200 bg-white px-4 py-4">
                      <span className="text-xl font-bold text-blue-600 min-w-[3.5rem]">{item.stat}</span>
                      <p className="text-sm text-zinc-600 leading-relaxed">{item.text}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-zinc-200 bg-white p-6 lg:p-8">
                <p className="text-base font-semibold text-zinc-900">The real reason customers don&apos;t leave reviews</p>
                <p className="mt-2 text-sm text-zinc-500">
                  Most happy customers <em>intend</em> to leave a review — but never do. Here&apos;s why, and how BReviewAI fixes it:
                </p>
                <ul className="mt-5 space-y-3">
                  {problems.map((item) => (
                    <li key={item.problem} className="rounded-lg border border-zinc-100 p-4">
                      <p className="text-xs font-medium text-red-600 flex items-start gap-1.5">
                        <span className="mt-0.5">✗</span> {item.problem}
                      </p>
                      <p className="mt-1.5 text-xs text-zinc-600 flex items-start gap-1.5">
                        <span className="text-green-600 font-bold mt-0.5">✓</span> {item.fix}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ── Perfect for ──────────────────────────────────────────────── */}
        <section className="border-t border-zinc-200 bg-zinc-50">
          <div className="mx-auto max-w-6xl px-4 py-16">
            <div className="max-w-xl">
              <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">Who it&apos;s for</p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-zinc-900">
                Built for local &amp; service businesses
              </h2>
              <p className="mt-3 text-zinc-600">
                Any business with a Google Business Profile can use BReviewAI — no technical knowledge required.
              </p>
            </div>
            <div className="mt-8 flex flex-wrap gap-2">
              {audiences.map((a) => (
                <span
                  key={a.label}
                  className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-700"
                >
                  <span>{a.icon}</span>
                  {a.label}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ── FAQ ──────────────────────────────────────────────────────── */}
        <section className="border-t border-zinc-200">
          <div className="mx-auto max-w-6xl px-4 py-16">
            <div className="max-w-xl">
              <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">FAQ</p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-zinc-900">Common questions</h2>
            </div>
            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              {faqs.map((f) => (
                <div key={f.q} className="rounded-2xl border border-zinc-200 bg-white p-6">
                  <h3 className="text-sm font-semibold text-zinc-900">{f.q}</h3>
                  <p className="mt-2 text-sm text-zinc-600 leading-relaxed">{f.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ──────────────────────────────────────────────────────── */}
        <section className="border-t border-zinc-200 bg-zinc-50">
          <div className="mx-auto max-w-6xl px-4 py-20 text-center">
            <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
              Free to start — no credit card
            </span>
            <h2 className="mt-4 text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900">
              Ready to grow your Google reputation?
            </h2>
            <p className="mt-3 text-zinc-600 max-w-lg mx-auto">
              Set up your branded review page in under a minute. Start collecting reviews today.
            </p>
            <div className="mt-8 flex flex-wrap gap-3 justify-center">
              <Link href="/login" className="btn-brand rounded-lg px-6 py-3 font-semibold">
                Start collecting reviews — free
              </Link>
              <a
                href="#how-it-works"
                className="rounded-lg border border-zinc-300 px-6 py-3 font-semibold text-zinc-800 hover:bg-zinc-50"
              >
                See how it works
              </a>
            </div>
          </div>
        </section>

      </main>

      <footer className="border-t border-zinc-200 py-8">
        <div className="mx-auto max-w-6xl px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-zinc-500">
          <span>© {new Date().getFullYear()} BReviewAI</span>
          <div className="flex gap-6">
            <a href="/privacy" className="hover:text-zinc-800">Privacy</a>
            <a href="/terms" className="hover:text-zinc-800">Terms</a>
            <a href="/contact" className="hover:text-zinc-800">Contact</a>
          </div>
        </div>
      </footer>
    </>
  );
}
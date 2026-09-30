import Link from "next/link";

export default function HomePage() {
  return (
    <section className="flex flex-col items-center gap-8 py-12 text-center">
      {/* Hero */}
      <h1 className="text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
        Welcome to{" "}
        <span className="text-[var(--primary)]">Digi‑Support</span>
      </h1>
      <p className="max-w-2xl text-xl text-gray-600">
        Your one‑stop assistant for government service registration, scholarship
        eligibility, and voice‑powered form filling — designed for everyone,
        especially senior citizens.
      </p>

      {/* Quick‑action cards */}
      <div className="mt-4 grid w-full max-w-4xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Card
          href="/checklist"
          emoji="📋"
          title="Checklists"
          desc="Know what documents you need before visiting any government office."
        />
        <Card
          href="/scholarships"
          emoji="🎓"
          title="Scholarships"
          desc="Check your eligibility for 24+ central and state scholarships."
        />
        <Card
          href="/voice"
          emoji="🤖"
          title="AI Assistant"
          desc="Chat or speak naturally to auto-fill government forms in real time."
        />
        <Card
          href="/family"
          emoji="👨‍👩‍👧"
          title="Family Hub"
          desc="Helper Mode for children to manage welfare forms for aging parents."
        />
        <Card
          href="/volunteer"
          emoji="🤝"
          title="Digi-Mitra Seva"
          desc="Human-assisted form filling by NSS & NCC college student volunteers."
        />
      </div>

      {/* Volunteer & NSS Highlight Banner */}
      <div className="mt-4 flex w-full max-w-4xl flex-col items-center justify-between gap-4 rounded-3xl border-2 border-amber-300 bg-amber-50/70 p-6 text-left sm:flex-row shadow-xs">
        <div className="flex items-center gap-4">
          <span className="text-4xl">🤝🎓</span>
          <div>
            <h3 className="text-lg font-bold text-amber-950">
              Assisted by Volunteers: College Students & NSS / NCC Seva
            </h3>
            <p className="text-sm text-amber-900">
              Elderly citizens get free 1-on-1 human assistance. Students earn verified community service hours,
              AICTE/KTU activity credits, and downloadable digital certificates.
            </p>
          </div>
        </div>
        <Link
          href="/volunteer"
          className="shrink-0 rounded-2xl bg-amber-600 px-5 py-3 font-extrabold text-white shadow-xs hover:bg-amber-700 transition-colors"
        >
          Open Volunteer Portal ↗
        </Link>
      </div>
    </section>
  );
}

/* ── Reusable card ── */
function Card({
  href,
  emoji,
  title,
  desc,
}: {
  href: string;
  emoji: string;
  title: string;
  desc: string;
}) {
  return (
    <Link
      href={href}
      className="group flex flex-col items-center gap-3 rounded-2xl border-2 border-[var(--border)] bg-[var(--surface)] p-6 text-center shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
    >
      <span className="text-5xl">{emoji}</span>
      <h2 className="text-2xl font-bold text-[var(--primary)] group-hover:underline">
        {title}
      </h2>
      <p className="text-base text-gray-500">{desc}</p>
    </Link>
  );
}

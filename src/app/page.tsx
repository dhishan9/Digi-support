import Link from "next/link";

export default function HomePage() {
  return (
    <section className="hero-glow-bg flex flex-col items-center gap-8 py-10 text-center animate-fade-in">
      {/* Top Floating Badge */}
      <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50/90 px-4 py-1.5 text-xs font-bold text-blue-900 shadow-2xs animate-float">
        <span className="flex h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
        <span>Accessibility First • Family Helper Mode • NSS Digi‑Mitra</span>
      </div>

      {/* Hero */}
      <div className="max-w-3xl space-y-4 animate-fade-in-up">
        <h1 className="text-4xl font-black leading-tight tracking-tight sm:text-5xl text-gray-900">
          Welcome to{" "}
          <span className="bg-linear-to-r from-blue-700 via-indigo-600 to-blue-500 bg-clip-text text-transparent">
            Digi‑Support
          </span>
        </h1>
        <p className="mx-auto max-w-2xl text-lg sm:text-xl text-gray-600 leading-relaxed">
          Your one‑stop assistant for government welfare registration, scholarship
          eligibility, and voice‑powered form filling — designed for everyone,
          especially senior citizens and families.
        </p>
      </div>

      {/* Quick‑action cards */}
      <div className="mt-2 grid w-full max-w-4xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
      <div className="card-interactive mt-4 flex w-full max-w-4xl flex-col items-center justify-between gap-4 rounded-3xl border-2 border-amber-300 bg-linear-to-r from-amber-50/90 to-orange-50/90 p-6 text-left sm:flex-row shadow-sm">
        <div className="flex items-center gap-4">
          <span className="text-4xl animate-float">🤝🎓</span>
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
          className="btn-tactile shrink-0 rounded-2xl bg-amber-600 px-5 py-3 font-extrabold text-white shadow-sm hover:bg-amber-700 transition-colors"
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
      className="card-interactive group flex flex-col items-center gap-3 rounded-3xl border-2 border-[var(--border)] bg-[var(--surface)] p-6 text-center shadow-xs hover:border-blue-400"
    >
      <span className="text-5xl transition-transform duration-300 ease-out group-hover:scale-120 group-hover:-translate-y-1">
        {emoji}
      </span>
      <h2 className="text-2xl font-black text-[var(--primary)] group-hover:text-blue-700">
        {title}
      </h2>
      <p className="text-sm text-gray-500 leading-normal">{desc}</p>
    </Link>
  );
}

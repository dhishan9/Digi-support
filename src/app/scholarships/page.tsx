"use client";

import { useState, useMemo, useRef } from "react";
import scholarshipsData from "@/data/scholarships.json";

/* ── Types ── */
interface Scholarship {
  id: string;
  name: string;
  description: string;
  income_limit: number;
  category: string[];
  education_level: string[];
  deadline: string;
  link: string;
  documents: string[];
}

type ScholarshipItem = Scholarship & { eligible: boolean | null };

const scholarships: Scholarship[] = scholarshipsData;

/* ── Dropdown options derived from data ── */
const ALL_CATEGORIES = Array.from(
  new Set(scholarships.flatMap((s) => s.category))
).sort();

const ALL_EDUCATION_LEVELS = Array.from(
  new Set(scholarships.flatMap((s) => s.education_level))
).sort();

/* Helper to get clean portal host domain */
function getPortalDomain(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "Official Portal";
  }
}

export default function ScholarshipsPage() {
  const [income, setIncome] = useState("");
  const [category, setCategory] = useState("");
  const [education, setEducation] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "eligible" | "not_eligible">("all");
  const [searchWarning, setSearchWarning] = useState("");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const resultsRef = useRef<HTMLDivElement | null>(null);

  /* Determine eligibility for each scholarship */
  const results = useMemo(() => {
    if (!hasSearched) return [];

    const incomeNum = Number(income) || 0;

    return scholarships.map((s) => {
      const incomeOk = incomeNum <= s.income_limit;
      const categoryOk = !category || s.category.includes(category);
      const educationOk = !education || s.education_level.includes(education);
      const eligible = incomeOk && categoryOk && educationOk;

      return { ...s, eligible };
    });
  }, [income, category, education, hasSearched]);

  const eligibleCount = results.filter((r) => r.eligible).length;
  const notEligibleCount = results.length - eligibleCount;

  /* Filtered by tab */
  const displayedScholarships: ScholarshipItem[] = useMemo(() => {
    if (!hasSearched) return scholarships.map((s) => ({ ...s, eligible: null }));

    const sorted = [...results].sort((a, b) => (a.eligible === b.eligible ? 0 : a.eligible ? -1 : 1));

    if (activeTab === "eligible") return sorted.filter((s) => s.eligible);
    if (activeTab === "not_eligible") return sorted.filter((s) => !s.eligible);
    return sorted;
  }, [hasSearched, results, activeTab]);

  const handleCheck = () => {
    if (!income.trim()) {
      setSearchWarning("Please enter your annual income to check eligibility.");
      return;
    }
    setSearchWarning("");
    setHasSearched(true);
    setActiveTab("all");
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  const handleReset = () => {
    setIncome("");
    setCategory("");
    setEducation("");
    setHasSearched(false);
    setActiveTab("all");
    setSearchWarning("");
    setExpanded({});
  };

  const toggleDetails = (id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  /* Render a single scholarship card */
  const renderCard = (s: ScholarshipItem) => {
    const isExpanded = !!expanded[s.id];
    return (
      <div
        key={s.id}
        className={`card-interactive flex flex-col w-full rounded-2xl border-2 p-5 shadow-xs ${
          s.eligible === true
            ? "border-green-500 bg-green-50/70"
            : s.eligible === false
              ? "border-red-300 bg-red-50/60 opacity-90"
              : "border-[var(--border)] bg-[var(--surface)] hover:border-blue-400"
        }`}
      >
        <div>
          {/* Badge */}
          <div className="mb-2">
            {s.eligible === true ? (
              <span className="inline-block rounded-full bg-green-600 px-3 py-1 text-sm font-bold text-white shadow-2xs animate-fade-in">
                Eligible ✅
              </span>
            ) : s.eligible === false ? (
              <span className="inline-block rounded-full bg-red-600 px-3 py-1 text-sm font-bold text-white shadow-2xs animate-fade-in">
                Not Eligible ❌
              </span>
            ) : (
              <span className="inline-block rounded-full border border-[var(--border)] bg-white px-3 py-1 text-sm font-semibold text-gray-700">
                National / State Scheme
              </span>
            )}
          </div>

          {/* Name & description */}
          <h3 className="text-xl font-bold">{s.name}</h3>
          <p className="mt-1 text-sm text-gray-600">{s.description}</p>

          {/* Criteria tags */}
          <div className="mt-3 flex flex-wrap gap-2 text-sm">
            <span className="rounded-lg bg-white px-2.5 py-1 font-semibold border border-gray-200">
              💰 Income ≤ {s.income_limit >= 9999999 ? "No Limit" : `₹${s.income_limit.toLocaleString("en-IN")}`}
            </span>
            <span className="rounded-lg bg-white px-2.5 py-1 font-semibold border border-gray-200">
              👥 {s.category.join(", ")}
            </span>
            <span className="rounded-lg bg-white px-2.5 py-1 font-semibold border border-gray-200">
              📅 {s.deadline}
            </span>
          </div>

          {/* Education levels */}
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {s.education_level.map((lvl) => (
              <span
                key={lvl}
                className="rounded-md bg-gray-200 px-2 py-0.5 text-xs font-semibold text-gray-700"
              >
                {lvl}
              </span>
            ))}
          </div>
        </div>

        {/* ── View Details Action ── */}
        <div className="mt-5 pt-3 border-t border-[var(--border)]">
          <button
            onClick={() => toggleDetails(s.id)}
            className={`btn-tactile w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-base font-bold shadow-xs cursor-pointer ${
              isExpanded
                ? "bg-gray-800 text-white hover:bg-black"
                : s.eligible === true
                  ? "bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)]"
                  : "bg-white border-2 border-[var(--border)] text-[var(--fg)] hover:bg-gray-100"
            }`}
          >
            {isExpanded ? "▲ Hide Details" : "📋 View Details & Documents ▾"}
          </button>

          {/* ── Animated Dropdown: Required Documents + Portal Link ── */}
          <div
            className={`grid transition-all duration-300 ease-in-out ${
              isExpanded
                ? "grid-rows-[1fr] opacity-100 mt-4 pt-4 border-t-2 border-dashed border-[var(--border)]"
                : "grid-rows-[0fr] opacity-0 mt-0 pt-0 border-t-0"
            }`}
          >
            <div className="overflow-hidden space-y-4">
              <div>
                <h4 className="font-bold text-base text-[var(--fg)] flex items-center gap-2">
                  <span>📋</span> Required Documents for Application:
                </h4>
                <ul className="mt-2.5 space-y-2">
                  {(s.documents || []).map((doc, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2.5 rounded-xl border border-[var(--border)] bg-white p-3 text-base text-gray-800 shadow-xs"
                    >
                      <span className="text-green-600 font-bold shrink-0 mt-0.5">✓</span>
                      <span>{doc}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Official Portal Link at the bottom */}
              <div className="pt-2">
                <a
                  href={s.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 w-full text-center rounded-xl bg-[var(--primary)] px-5 py-3 text-base font-bold text-white shadow-md transition-colors hover:bg-[var(--primary-hover)] cursor-pointer"
                >
                  <span>🌐</span> Open Application Portal ({getPortalDomain(s.link)}) ↗
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-extrabold sm:text-4xl">
          🎓 Scholarship Portal
        </h1>
        <p className="mt-2 text-lg text-gray-500">
          Enter your family income, category, and education level to instantly discover government scholarships.
        </p>
      </div>

      {/* ── Filter form ── */}
      <div className="mx-auto max-w-2xl rounded-2xl border-2 border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
        <h2 className="mb-4 text-2xl font-bold">Check Your Eligibility</h2>

        <div className="grid gap-5 sm:grid-cols-3">
          {/* Income */}
          <div>
            <label
              htmlFor="income"
              className="mb-1 block text-base font-semibold"
            >
              Annual Income (₹) <span className="text-red-500">*</span>
            </label>
            <input
              id="income"
              type="number"
              min={0}
              placeholder="e.g. 200000"
              value={income}
              onChange={(e) => {
                setIncome(e.target.value);
                setSearchWarning("");
              }}
              className="w-full rounded-xl border-2 border-[var(--border)] bg-white px-4 py-3 text-lg transition-colors focus:border-[var(--primary)] focus:outline-none"
            />
          </div>

          {/* Category */}
          <div>
            <label
              htmlFor="category"
              className="mb-1 block text-base font-semibold"
            >
              Category
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-xl border-2 border-[var(--border)] bg-white px-4 py-3 text-lg transition-colors focus:border-[var(--primary)] focus:outline-none"
            >
              <option value="">All Categories</option>
              {ALL_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Education Level */}
          <div>
            <label
              htmlFor="education"
              className="mb-1 block text-base font-semibold"
            >
              Education Level
            </label>
            <select
              id="education"
              value={education}
              onChange={(e) => setEducation(e.target.value)}
              className="w-full rounded-xl border-2 border-[var(--border)] bg-white px-4 py-3 text-lg transition-colors focus:border-[var(--primary)] focus:outline-none"
            >
              <option value="">All Levels</option>
              {ALL_EDUCATION_LEVELS.map((e) => (
                <option key={e} value={e}>
                  {e}
                </option>
              ))}
            </select>
          </div>
        </div>

        {searchWarning && (
          <p className="mt-3 text-base font-semibold text-red-600">
            ⚠️ {searchWarning}
          </p>
        )}

        {/* Action buttons */}
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            onClick={handleCheck}
            className="w-full sm:w-auto rounded-xl bg-[var(--primary)] px-6 py-3.5 text-lg font-bold text-white shadow transition-colors hover:bg-[var(--primary-hover)] cursor-pointer"
          >
            🔍 Check Eligibility
          </button>
          <button
            onClick={handleReset}
            className="w-full sm:w-auto rounded-xl border-2 border-[var(--border)] px-6 py-3.5 text-lg font-semibold transition-colors hover:bg-gray-100 cursor-pointer"
          >
            ↻ Reset
          </button>
        </div>
      </div>

      {/* ── Results Header / Tabs ── */}
      <div ref={resultsRef} className="scroll-mt-24 space-y-5">
        {hasSearched ? (
          <>
            {/* Summary bar */}
            <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-center text-lg font-semibold text-blue-900">
              You qualify for{" "}
              <span className="text-2xl font-extrabold text-green-700">
                {eligibleCount}
              </span>{" "}
              out of {results.length} available scholarships
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveTab("all")}
                className={`rounded-xl px-4 py-2 text-base font-bold transition-colors cursor-pointer ${
                  activeTab === "all"
                    ? "bg-[var(--primary)] text-white"
                    : "border-2 border-[var(--border)] bg-white text-[var(--fg)] hover:bg-gray-100"
                }`}
              >
                All Schemes ({results.length})
              </button>
              <button
                onClick={() => setActiveTab("eligible")}
                className={`rounded-xl px-4 py-2 text-base font-bold transition-colors cursor-pointer ${
                  activeTab === "eligible"
                    ? "bg-green-600 text-white"
                    : "border-2 border-[var(--border)] bg-white text-[var(--fg)] hover:bg-gray-100"
                }`}
              >
                Eligible Only ({eligibleCount})
              </button>
              <button
                onClick={() => setActiveTab("not_eligible")}
                className={`rounded-xl px-4 py-2 text-base font-bold transition-colors cursor-pointer ${
                  activeTab === "not_eligible"
                    ? "bg-red-600 text-white"
                    : "border-2 border-[var(--border)] bg-white text-[var(--fg)] hover:bg-gray-100"
                }`}
              >
                Not Eligible ({notEligibleCount})
              </button>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-between border-b pb-2">
            <h2 className="text-2xl font-bold">
              Available Scholarships ({scholarships.length})
            </h2>
            <p className="text-sm text-gray-500">
              Fill the form above to check your personal eligibility
            </p>
          </div>
        )}

        {/* ── Mobile Layout: 1 column ── */}
        <div className="flex flex-col gap-5 sm:hidden">
          {displayedScholarships.map(renderCard)}
        </div>

        {/* ── Desktop Layout: 2 independent columns (Masonry) ── */}
        {/* Expanding a card in the left column will NEVER move or cause gaps in the right column */}
        <div className="hidden sm:grid sm:grid-cols-2 gap-5 items-start">
          <div className="flex flex-col gap-5">
            {displayedScholarships.filter((_, i) => i % 2 === 0).map(renderCard)}
          </div>
          <div className="flex flex-col gap-5">
            {displayedScholarships.filter((_, i) => i % 2 === 1).map(renderCard)}
          </div>
        </div>

        {displayedScholarships.length === 0 && (
          <div className="py-12 text-center text-lg text-gray-500">
            No scholarships found for this filter tab.
          </div>
        )}
      </div>
    </div>
  );
}

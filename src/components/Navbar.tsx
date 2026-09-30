"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useFamily } from "@/context/FamilyContext";
import { useVolunteer } from "@/context/VolunteerContext";

const NAV_ITEMS = [
  { href: "/checklist", label: "📋 Checklists" },
  { href: "/scholarships", label: "🎓 Scholarships" },
  { href: "/voice", label: "🤖 AI Assistant" },
  { href: "/family", label: "👨‍👩‍👧 Family Hub" },
  { href: "/volunteer", label: "🤝 Volunteers" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [a11yOn, setA11yOn] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const { members, activeMember, setActiveMemberId, unreadCount } = useFamily();
  const { openCount } = useVolunteer();

  /* Persist accessibility preference */
  useEffect(() => {
    const saved = localStorage.getItem("digi-a11y");
    if (saved === "on") {
      setA11yOn(true);
      document.documentElement.classList.add("high-contrast", "big-font");
    }
  }, []);

  const toggleAccessibility = () => {
    const next = !a11yOn;
    setA11yOn(next);
    if (next) {
      document.documentElement.classList.add("high-contrast", "big-font");
      localStorage.setItem("digi-a11y", "on");
    } else {
      document.documentElement.classList.remove("high-contrast", "big-font");
      localStorage.setItem("digi-a11y", "off");
    }
  };

  return (
    <nav className="sticky top-0 z-50 border-b-2 border-[var(--border)] bg-[var(--surface)] shadow-sm">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="text-2xl font-extrabold tracking-tight text-[var(--primary)] hover:opacity-90"
          >
            Digi‑Support
          </Link>

          {/* Quick Profile Pill (Desktop) */}
          <div className="relative hidden md:block">
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex items-center gap-1.5 rounded-full border border-blue-300 bg-blue-50 px-3 py-1 text-xs font-bold text-blue-900 hover:bg-blue-100 transition-colors cursor-pointer"
              title="Click to switch profile in Helper Mode"
            >
              <span>{activeMember.avatar}</span>
              <span>{activeMember.name.split(" ")[0]} ({activeMember.relation})</span>
              <span className="text-[10px]">▾</span>
            </button>

            {/* Profile Dropdown */}
            {profileDropdownOpen && (
              <div className="absolute left-0 mt-2 w-56 rounded-2xl border-2 border-[var(--border)] bg-white p-2 shadow-xl z-50">
                <div className="px-2 py-1 text-[11px] font-extrabold uppercase tracking-wider text-gray-400">
                  Switch Active Profile
                </div>
                <div className="space-y-1 mt-1">
                  {members.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => {
                        setActiveMemberId(m.id);
                        setProfileDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between rounded-xl px-3 py-2 text-left text-sm font-semibold transition-colors cursor-pointer ${
                        m.id === activeMember.id
                          ? "bg-blue-600 text-white"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-base">{m.avatar}</span>
                        <div>
                          <p className="leading-tight">{m.name.split(" ")[0]}</p>
                          <p className={`text-[10px] ${m.id === activeMember.id ? "text-blue-100" : "text-gray-400"}`}>
                            {m.relation} • {m.age} yrs
                          </p>
                        </div>
                      </div>
                      {m.id === activeMember.id && <span className="text-xs">✓</span>}
                    </button>
                  ))}
                </div>
                <div className="border-t border-gray-100 mt-2 pt-1.5">
                  <Link
                    href="/family"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="block text-center text-xs font-bold text-blue-600 hover:underline py-1"
                  >
                    Open Family Vault Hub ↗
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile controls: Profile icon + A+ toggle + Hamburger menu */}
        <div className="flex items-center gap-2 sm:hidden">
          <Link
            href="/family"
            className="flex items-center gap-1 rounded-lg border border-blue-300 bg-blue-50 px-2 py-1 text-sm font-bold text-blue-900"
          >
            <span>{activeMember.avatar}</span>
            {unreadCount > 0 && (
              <span className="flex h-2 w-2 rounded-full bg-red-600" />
            )}
          </Link>
          <button
            onClick={toggleAccessibility}
            className={`rounded-lg border-2 px-2.5 py-1.5 text-sm font-bold transition-colors ${
              a11yOn
                ? "border-[var(--primary)] bg-[var(--primary)] text-white"
                : "border-[var(--border)] text-[var(--fg)] hover:bg-[var(--primary)] hover:text-white"
            }`}
            aria-label="Toggle big font and high contrast mode"
            aria-pressed={a11yOn}
            title="Big Font / High Contrast"
          >
            {a11yOn ? "🔤 A+ ON" : "🔤 A+"}
          </button>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="rounded-lg border-2 border-[var(--border)] px-3 py-1.5 text-xl font-bold text-[var(--fg)]"
            aria-label="Toggle navigation menu"
            aria-expanded={menuOpen}
          >
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>

        {/* Desktop Nav links + A+ toggle */}
        <div
          className={`${
            menuOpen ? "flex" : "hidden"
          } absolute left-0 top-full w-full flex-col gap-2 border-b-2 border-[var(--border)] bg-[var(--surface)] px-4 pb-4 pt-2 shadow-lg sm:static sm:flex sm:w-auto sm:flex-row sm:items-center sm:gap-2 sm:border-0 sm:p-0 sm:shadow-none`}
        >
          {NAV_ITEMS.map(({ href, label }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
                className={`relative rounded-lg px-3 py-2 text-base font-semibold transition-colors flex items-center gap-1.5 ${
                  isActive
                    ? "bg-[var(--primary)] text-white"
                    : "text-[var(--fg)] hover:bg-[var(--primary)] hover:text-white"
                }`}
              >
                <span>{label}</span>
                {href === "/family" && unreadCount > 0 && (
                  <span className="rounded-full bg-red-600 px-1.5 py-0.2 text-[11px] font-bold text-white leading-tight">
                    {unreadCount}
                  </span>
                )}
                {href === "/volunteer" && openCount > 0 && (
                  <span className="rounded-full bg-amber-500 px-1.5 py-0.2 text-[11px] font-bold text-white leading-tight">
                    {openCount}
                  </span>
                )}
              </Link>
            );
          })}

          {/* Desktop Accessibility toggle */}
          <button
            onClick={toggleAccessibility}
            className={`hidden sm:inline-block sm:ml-2 rounded-lg border-2 px-3 py-2 text-base font-semibold transition-colors cursor-pointer ${
              a11yOn
                ? "border-[var(--primary)] bg-[var(--primary)] text-white"
                : "border-[var(--border)] text-[var(--fg)] hover:bg-[var(--primary)] hover:text-white"
            }`}
            aria-label="Toggle big font and high contrast mode"
            aria-pressed={a11yOn}
            title="Big Font / High Contrast"
          >
            {a11yOn ? "🔤 A+ ON" : "🔤 A+"}
          </button>
        </div>
      </div>
    </nav>
  );
}

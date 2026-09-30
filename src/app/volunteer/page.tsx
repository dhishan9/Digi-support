"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useVolunteer, CitizenHelpRequest } from "@/context/VolunteerContext";

export default function VolunteerPage() {
  const {
    volunteer,
    requests,
    activeAssistRequest,
    setActiveAssistRequest,
    claimRequest,
    releaseRequest,
    completeRequest,
    requestHelp,
    downloadCertificate,
    resetToDefaults,
  } = useVolunteer();

  /* View switch: "volunteer" (Student/NSS) or "citizen" (Request Help) */
  const [activeTab, setActiveTab] = useState<"volunteer" | "citizen">("volunteer");

  /* Filter for request queue */
  const [filterStatus, setFilterStatus] = useState<"all" | "open" | "in_progress" | "completed">("all");
  const [searchQuery, setSearchQuery] = useState("");

  /* Co-Pilot Modal State */
  const [coPilotOpen, setCoPilotOpen] = useState(false);
  const [consentOtpInput, setConsentOtpInput] = useState("");
  const [maskSensitive, setMaskSensitive] = useState(true);
  const [coPilotNotes, setCoPilotNotes] = useState("");
  const [docChecks, setDocChecks] = useState<{ [key: string]: boolean }>({
    aadhaar: true,
    ration: true,
    income: false,
    bank: true,
  });
  const [assistStatusMessage, setAssistStatusMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  /* Citizen Request Form State */
  const [citizenForm, setCitizenForm] = useState({
    citizenName: "",
    age: "",
    location: "",
    phone: "",
    serviceNeeded: "Indira Gandhi National Old Age Pension",
    preferredLanguage: "Malayalam (മലയാളം)",
    mode: "Phone Call Assistance" as "Phone Call Assistance" | "Doorstep / Panchayat Visit" | "Online Co-Pilot",
    urgency: "High" as "High" | "Medium" | "Normal",
    notes: "",
  });
  const [requestSuccessNotice, setRequestSuccessNotice] = useState<CitizenHelpRequest | null>(null);

  /* Filtered requests */
  const filteredRequests = requests.filter((r) => {
    if (filterStatus !== "all" && r.status !== filterStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        r.citizenName.toLowerCase().includes(q) ||
        r.serviceNeeded.toLowerCase().includes(q) ||
        r.location.toLowerCase().includes(q)
      );
    }
    return true;
  });

  /* Open Co-Pilot Modal for a request */
  const handleOpenCoPilot = (req: CitizenHelpRequest) => {
    if (req.status === "open") {
      claimRequest(req.id);
    } else {
      setActiveAssistRequest(req);
    }
    setConsentOtpInput("");
    setCoPilotNotes(req.notes || "");
    setAssistStatusMessage(null);
    setCoPilotOpen(true);
  };

  /* Submit Co-Pilot Assistance */
  const handleCompleteAssistance = () => {
    if (!activeAssistRequest) return;
    const res = completeRequest(activeAssistRequest.id, consentOtpInput);
    if (res.success) {
      setAssistStatusMessage({ text: res.message, type: "success" });
    } else {
      setAssistStatusMessage({ text: res.message, type: "error" });
    }
  };

  /* Citizen submits a new request */
  const handleCitizenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!citizenForm.citizenName || !citizenForm.phone) {
      alert("Please provide the citizen's name and contact number.");
      return;
    }

    const created = requestHelp({
      citizenName: citizenForm.citizenName,
      age: Number(citizenForm.age) || 65,
      location: citizenForm.location || "Local Ward / Panchayat",
      phone: citizenForm.phone,
      serviceNeeded: citizenForm.serviceNeeded,
      preferredLanguage: citizenForm.preferredLanguage,
      mode: citizenForm.mode,
      urgency: citizenForm.urgency,
      notes: citizenForm.notes,
    });

    setRequestSuccessNotice(created);
    setCitizenForm({
      citizenName: "",
      age: "",
      location: "",
      phone: "",
      serviceNeeded: "Indira Gandhi National Old Age Pension",
      preferredLanguage: "Malayalam (മലയാളം)",
      mode: "Phone Call Assistance",
      urgency: "High",
      notes: "",
    });
  };

  return (
    <div className="space-y-8">
      {/* ── Page Hero Header ── */}
      <div className="flex flex-col gap-4 border-b border-[var(--border)] pb-6 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-3xl">🤝</span>
            <h1 className="text-3xl font-extrabold tracking-tight text-[var(--primary)] sm:text-4xl">
              Digi‑Mitra Seva Network
            </h1>
          </div>
          <p className="mt-1 text-base text-gray-600 max-w-2xl">
            Human-assisted form filling for senior citizens & less-literate households by college students,
            NSS & NCC volunteers. Verified community service hours and university activity credits.
          </p>
        </div>

        {/* View Switcher Pill */}
        <div className="inline-flex rounded-2xl border-2 border-blue-200 bg-blue-50 p-1 shadow-xs">
          <button
            onClick={() => setActiveTab("volunteer")}
            className={`rounded-xl px-4 py-2 text-sm font-bold transition-all cursor-pointer ${
              activeTab === "volunteer"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-blue-900 hover:bg-blue-100"
            }`}
          >
            🎓 Student / NSS Portal
          </button>
          <button
            onClick={() => setActiveTab("citizen")}
            className={`rounded-xl px-4 py-2 text-sm font-bold transition-all cursor-pointer ${
              activeTab === "citizen"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-blue-900 hover:bg-blue-100"
            }`}
          >
            👴 Citizen Helpdesk
          </button>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          VIEW 1: STUDENT / NSS VOLUNTEER WORKSPACE
      ═══════════════════════════════════════════════════════════════════════ */}
      {activeTab === "volunteer" && (
        <div className="space-y-8">
          {/* Volunteer Identity & Credit Card */}
          <div className="rounded-3xl border-2 border-blue-200 bg-linear-to-r from-blue-50 via-indigo-50 to-white p-6 shadow-sm">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              {/* Profile Details */}
              <div className="flex items-start gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-3xl shadow-sm">
                  {volunteer.avatar}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-2xl font-black text-gray-900">{volunteer.name}</h2>
                    <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-bold text-blue-800 border border-blue-300">
                      ★ {volunteer.role}
                    </span>
                    <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-bold text-green-800 border border-green-300">
                      Verified Cadet ✓
                    </span>
                  </div>
                  <p className="mt-1 text-sm font-semibold text-gray-700">
                    🏛️ {volunteer.institution}
                  </p>
                  <p className="text-xs text-gray-500">
                    🎖️ {volunteer.nssUnit} • 🌐 Languages: {volunteer.languages.join(", ")}
                  </p>
                </div>
              </div>

              {/* Action: Certificate Button */}
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <button
                  onClick={downloadCertificate}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold px-5 py-3 shadow-sm hover:shadow-md transition-all cursor-pointer"
                  title="Generate accredited PDF certificate with digital seal"
                >
                  <span>📜</span>
                  <span>Download NSS Certificate (PDF)</span>
                </button>
              </div>
            </div>

            {/* 4 Stats Cards */}
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-2xl border border-blue-100 bg-white p-4 shadow-2xs">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Service Hours</p>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className="text-3xl font-black text-blue-700">{volunteer.hoursCompleted}</span>
                  <span className="text-xs text-gray-400">/ {volunteer.targetHours} hrs</span>
                </div>
                {/* Progress bar */}
                <div className="mt-2 h-2 w-full rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full"
                    style={{ width: `${Math.min(100, (volunteer.hoursCompleted / volunteer.targetHours) * 100)}%` }}
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-blue-100 bg-white p-4 shadow-2xs">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500">KTU Activity Points</p>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className="text-3xl font-black text-amber-600">+{volunteer.activityPoints}</span>
                  <span className="text-xs text-amber-700">pts</span>
                </div>
                <p className="mt-2 text-[11px] font-semibold text-green-700">UGC / AICTE Accredited ✓</p>
              </div>

              <div className="rounded-2xl border border-blue-100 bg-white p-4 shadow-2xs">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Citizens Assisted</p>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className="text-3xl font-black text-emerald-600">{volunteer.formsAssisted}</span>
                  <span className="text-xs text-gray-400">seniors</span>
                </div>
                <p className="mt-2 text-[11px] font-semibold text-gray-500">100% Free Welfare Seva</p>
              </div>

              <div className="rounded-2xl border border-blue-100 bg-white p-4 shadow-2xs">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Citizen Rating</p>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className="text-3xl font-black text-purple-600">{volunteer.rating}</span>
                  <span className="text-amber-500 text-sm">★★★★★</span>
                </div>
                <p className="mt-2 text-[11px] font-semibold text-gray-500">Top 5% Volunteer Rank</p>
              </div>
            </div>
          </div>

          {/* ── Active Seva Queue & Filtering ── */}
          <div className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <span>📋</span> Live Seva Assistance Queue
                  <span className="rounded-full bg-blue-100 text-blue-800 px-2 py-0.5 text-xs font-bold">
                    {filteredRequests.length} requests
                  </span>
                </h3>
                <p className="text-xs text-gray-500">
                  Select an open citizen request to start a phone call or co-pilot form filling session.
                </p>
              </div>

              {/* Status Filter Buttons */}
              <div className="flex flex-wrap items-center gap-1.5 bg-gray-100 p-1 rounded-xl">
                {(["all", "open", "in_progress", "completed"] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setFilterStatus(s)}
                    className={`rounded-lg px-3 py-1 text-xs font-bold capitalize transition-colors cursor-pointer ${
                      filterStatus === s
                        ? "bg-white text-blue-900 shadow-2xs"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    {s.replace("_", " ")}
                  </button>
                ))}
              </div>
            </div>

            {/* Search filter input */}
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="🔍 Search citizen name, location (e.g. Aluva, Angamaly), or scheme name..."
                className="w-full rounded-2xl border-2 border-[var(--border)] bg-white px-4 py-2.5 text-sm font-medium focus:border-blue-500 focus:outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 text-sm font-bold"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Requests Cards List */}
            <div className="grid gap-4 md:grid-cols-2">
              {filteredRequests.map((req) => {
                const isClaimedByMe = req.claimedBy === volunteer.name;
                return (
                  <div
                    key={req.id}
                    className={`rounded-2xl border-2 p-5 transition-all flex flex-col justify-between ${
                      req.status === "completed"
                        ? "border-green-200 bg-green-50/40"
                        : req.status === "in_progress"
                        ? "border-blue-300 bg-blue-50/40 ring-1 ring-blue-300"
                        : "border-[var(--border)] bg-white hover:border-blue-400 hover:shadow-xs"
                    }`}
                  >
                    <div>
                      {/* Top badge row */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`rounded-full px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider ${
                              req.urgency === "High"
                                ? "bg-red-100 text-red-700"
                                : req.urgency === "Medium"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {req.urgency} Priority
                          </span>
                          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-semibold text-gray-600">
                            {req.mode}
                          </span>
                        </div>

                        {/* Status badge */}
                        {req.status === "open" && (
                          <span className="flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-800">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                            Open • Waiting
                          </span>
                        )}
                        {req.status === "in_progress" && (
                          <span className="flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-bold text-blue-800">
                            <span className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-pulse" />
                            In Progress {isClaimedByMe ? "(You)" : `(${req.claimedBy})`}
                          </span>
                        )}
                        {req.status === "completed" && (
                          <span className="flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-bold text-green-800">
                            ✓ Completed
                          </span>
                        )}
                      </div>

                      {/* Citizen Info */}
                      <div className="mt-3">
                        <h4 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                          <span>👴</span> {req.citizenName}
                          <span className="text-sm font-normal text-gray-500">({req.age} yrs)</span>
                        </h4>
                        <p className="text-xs font-semibold text-blue-800 mt-0.5">
                          📍 {req.location}
                        </p>
                      </div>

                      {/* Service Needed */}
                      <div className="mt-3 rounded-xl bg-gray-50 p-2.5 border border-gray-100">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                          Assistance Requested For:
                        </p>
                        <p className="text-sm font-bold text-gray-900">{req.serviceNeeded}</p>
                        <p className="text-xs text-gray-600 mt-1 italic">
                          &ldquo;{req.notes}&rdquo;
                        </p>
                      </div>

                      {/* Meta info */}
                      <div className="mt-3 flex flex-wrap items-center justify-between text-xs text-gray-500">
                        <span>🗣️ Language: {req.preferredLanguage}</span>
                        <span>🔒 Aadhaar: {req.maskedAadhaar}</span>
                      </div>
                    </div>

                    {/* Bottom Action Button */}
                    <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                      <span className="text-[11px] text-gray-400">Requested {req.createdAt}</span>

                      {req.status === "open" && (
                        <button
                          onClick={() => handleOpenCoPilot(req)}
                          className="flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-3.5 py-2 shadow-xs transition-colors cursor-pointer"
                        >
                          <span>🤝</span> Claim & Assist
                        </button>
                      )}

                      {req.status === "in_progress" && (
                        <div className="flex items-center gap-2">
                          {isClaimedByMe && (
                            <button
                              onClick={() => releaseRequest(req.id)}
                              className="text-xs text-gray-500 hover:text-red-600 underline cursor-pointer"
                            >
                              Release
                            </button>
                          )}
                          <button
                            onClick={() => handleOpenCoPilot(req)}
                            className="flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-3.5 py-2 shadow-xs transition-colors cursor-pointer"
                          >
                            <span>✏️</span> Open Co-Pilot
                          </button>
                        </div>
                      )}

                      {req.status === "completed" && (
                        <span className="text-xs font-bold text-green-700 flex items-center gap-1">
                          <span>🎉</span> +0.75 hrs Credited
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── College & NSS Unit Leaderboard ── */}
          <div className="rounded-3xl border-2 border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-gray-200 pb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <span>🏆</span> Kerala NSS & NCC Campus Seva Leaderboard
                </h3>
                <p className="text-xs text-gray-500">
                  Top performing college units accredited for digital literacy and citizen empowerment hours.
                </p>
              </div>
              <span className="rounded-full bg-amber-100 text-amber-900 px-3 py-1 text-xs font-extrabold border border-amber-300">
                KTU & UGC Recognized 🎖️
              </span>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border-2 border-amber-300 bg-amber-50/50 p-4 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-2xl">🥇</span>
                  <span className="rounded-full bg-amber-200 text-amber-900 px-2 py-0.5 text-[10px] font-bold">#1 State Rank</span>
                </div>
                <h4 className="mt-2 text-sm font-bold text-gray-900">Govt Model Engg College (MEC)</h4>
                <p className="text-xs text-gray-600">NSS Unit #142 • Thrikkakara</p>
                <div className="mt-3 flex items-baseline justify-between border-t border-amber-200 pt-2 text-xs">
                  <span className="font-semibold text-gray-600">Total Hours:</span>
                  <span className="font-black text-blue-900">412.5 hrs (550 forms)</span>
                </div>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-2xl">🥈</span>
                  <span className="rounded-full bg-gray-200 text-gray-800 px-2 py-0.5 text-[10px] font-bold">#2 State Rank</span>
                </div>
                <h4 className="mt-2 text-sm font-bold text-gray-900">CUSAT School of Engineering</h4>
                <p className="text-xs text-gray-600">NSS Unit #88 • Kalamassery</p>
                <div className="mt-3 flex items-baseline justify-between border-t border-gray-100 pt-2 text-xs">
                  <span className="font-semibold text-gray-600">Total Hours:</span>
                  <span className="font-black text-blue-900">368.0 hrs (490 forms)</span>
                </div>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-2xl">🥉</span>
                  <span className="rounded-full bg-amber-100 text-amber-800 px-2 py-0.5 text-[10px] font-bold">#3 State Rank</span>
                </div>
                <h4 className="mt-2 text-sm font-bold text-gray-900">Maharaja&apos;s College, Kochi</h4>
                <p className="text-xs text-gray-600">NCC 7(K) Naval Unit • Ernakulam</p>
                <div className="mt-3 flex items-baseline justify-between border-t border-gray-100 pt-2 text-xs">
                  <span className="font-semibold text-gray-600">Total Hours:</span>
                  <span className="font-black text-blue-900">294.0 hrs (392 forms)</span>
                </div>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-2xl">🎖️</span>
                  <span className="rounded-full bg-gray-100 text-gray-700 px-2 py-0.5 text-[10px] font-bold">#4 State Rank</span>
                </div>
                <h4 className="mt-2 text-sm font-bold text-gray-900">Mar Athanasius College (MACE)</h4>
                <p className="text-xs text-gray-600">NSS Unit #210 • Kothamangalam</p>
                <div className="mt-3 flex items-baseline justify-between border-t border-gray-100 pt-2 text-xs">
                  <span className="font-semibold text-gray-600">Total Hours:</span>
                  <span className="font-black text-blue-900">240.0 hrs (320 forms)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          VIEW 2: SENIOR CITIZEN / FAMILY HELPDESK ("REQUEST VOLUNTEER")
      ═══════════════════════════════════════════════════════════════════════ */}
      {activeTab === "citizen" && (
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Banner */}
          <div className="rounded-3xl border-2 border-amber-300 bg-linear-to-r from-amber-50 to-orange-50 p-6 text-amber-950 shadow-sm">
            <div className="flex items-start gap-4">
              <span className="text-4xl">👴👵</span>
              <div>
                <h2 className="text-2xl font-black">
                  സൗജന്യ വിദ്യാർത്ഥി സഹായം (Free Student Volunteer Assistance)
                </h2>
                <p className="mt-1 text-sm text-amber-900">
                  Are you an elderly citizen or unable to use online portals? 
                  College NSS & NCC student volunteers will call you or visit your ward to fill your pension,
                  scholarship, or welfare forms 100% free of charge.
                </p>
              </div>
            </div>
          </div>

          {/* Success notice after submitting */}
          {requestSuccessNotice && (
            <div className="rounded-2xl border-2 border-green-500 bg-green-50 p-5 text-green-950 shadow-sm">
              <div className="flex items-start gap-3">
                <span className="text-3xl">✅</span>
                <div>
                  <h4 className="text-lg font-bold">Request Successfully Dispatched!</h4>
                  <p className="text-sm mt-0.5">
                    Your request has been broadcasted to verified NSS student volunteers near <strong>{requestSuccessNotice.location}</strong>.
                  </p>
                  <div className="mt-3 rounded-xl bg-white border border-green-300 p-3 text-xs">
                    <p className="font-bold text-gray-800">
                      Ticket ID: <span className="font-mono text-blue-700">{requestSuccessNotice.id}</span>
                    </p>
                    <p className="font-bold text-gray-800 mt-1">
                      Your Senior Consent PIN: <span className="font-mono text-xl text-green-700 font-black">{requestSuccessNotice.consentOtp}</span>
                    </p>
                    <p className="text-gray-500 mt-0.5">
                      (Keep this PIN secret. Only share this 4-digit code with the volunteer after they verify and submit your form.)
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setRequestSuccessNotice(null);
                      setActiveTab("volunteer");
                    }}
                    className="mt-4 rounded-xl bg-green-700 hover:bg-green-800 text-white font-bold text-xs px-4 py-2 cursor-pointer"
                  >
                    View in Volunteer Seva Queue ↗
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Request Form */}
          <form
            onSubmit={handleCitizenSubmit}
            className="rounded-3xl border-2 border-[var(--border)] bg-[var(--surface)] p-6 sm:p-8 shadow-sm space-y-5"
          >
            <h3 className="text-xl font-bold text-gray-900 border-b border-gray-200 pb-3">
              Fill Your Contact Details
            </h3>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Citizen / Parent Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Radhakrishnan K"
                  value={citizenForm.citizenName}
                  onChange={(e) => setCitizenForm({ ...citizenForm, citizenName: e.target.value })}
                  className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm font-medium focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Age (Years) *
                </label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 72"
                  value={citizenForm.age}
                  onChange={(e) => setCitizenForm({ ...citizenForm, age: e.target.value })}
                  className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm font-medium focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Mobile Phone Number (for Call & SMS) *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. 9876543210"
                  value={citizenForm.phone}
                  onChange={(e) => setCitizenForm({ ...citizenForm, phone: e.target.value })}
                  className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm font-medium focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Location (Panchayat / City / Ward) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Aluva West / Angamaly"
                  value={citizenForm.location}
                  onChange={(e) => setCitizenForm({ ...citizenForm, location: e.target.value })}
                  className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm font-medium focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Service / Welfare Scheme Needed
                </label>
                <select
                  value={citizenForm.serviceNeeded}
                  onChange={(e) => setCitizenForm({ ...citizenForm, serviceNeeded: e.target.value })}
                  className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm font-bold text-gray-800 focus:border-blue-500 focus:outline-none cursor-pointer"
                >
                  <option value="Indira Gandhi National Old Age Pension">Indira Gandhi National Old Age Pension</option>
                  <option value="Kerala Karunya Arogya Suraksha Padhathi (KASP)">Karunya Health Scheme (KASP)</option>
                  <option value="Senior Citizen Railway & Bus Concession">Senior Citizen Concession Card</option>
                  <option value="Widow / Destitute Welfare Pension">Widow / Destitute Welfare Pension</option>
                  <option value="Aadhaar Address / Phone Number Update">Aadhaar Correction / Update</option>
                  <option value="Pre-Matric / Post-Matric Scholarship">Scholarship Application for Child</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Preferred Spoken Language
                </label>
                <select
                  value={citizenForm.preferredLanguage}
                  onChange={(e) => setCitizenForm({ ...citizenForm, preferredLanguage: e.target.value })}
                  className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm font-bold text-gray-800 focus:border-blue-500 focus:outline-none cursor-pointer"
                >
                  <option value="Malayalam (മലയാളം)">Malayalam (മലയാളം)</option>
                  <option value="English">English</option>
                  <option value="Tamil (தமிழ்)">Tamil (தமிழ்)</option>
                  <option value="Hindi (हिन्दी)">Hindi (हिन्दी)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Preferred Mode of Assistance
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: "Phone Call Assistance", label: "📞 Phone Call", desc: "Volunteer calls & fills form" },
                  { id: "Online Co-Pilot", label: "💻 Screen Co-Pilot", desc: "Assisted web session" },
                  { id: "Doorstep / Panchayat Visit", label: "🏫 Ward Visit", desc: "For bedridden seniors" },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setCitizenForm({ ...citizenForm, mode: m.id as any })}
                    className={`rounded-2xl border-2 p-3 text-left transition-all cursor-pointer ${
                      citizenForm.mode === m.id
                        ? "border-blue-600 bg-blue-50 text-blue-900"
                        : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <p className="font-bold text-sm">{m.label}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{m.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Any specific difficulty or notes (Optional)
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Cannot read small mobile screens, need help uploading ration card photo..."
                value={citizenForm.notes}
                onChange={(e) => setCitizenForm({ ...citizenForm, notes: e.target.value })}
                className="w-full rounded-xl border border-gray-300 bg-white p-3 text-sm font-medium focus:border-blue-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-lg py-3.5 shadow-md transition-all cursor-pointer"
            >
              🤝 Request Free Student Volunteer (സഹായം വേണം)
            </button>
          </form>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          CO-PILOT ASSISTANCE MODAL (FOR VOLUNTEERS)
      ═══════════════════════════════════════════════════════════════════════ */}
      {coPilotOpen && activeAssistRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl border-2 border-blue-300 bg-white p-6 sm:p-8 shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-200 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-2xl">
                  🤝
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-black text-gray-900">
                      Co-Pilot Assistance Session
                    </h3>
                    <span className="flex items-center gap-1 rounded-full bg-green-100 text-green-800 px-2 py-0.5 text-xs font-bold">
                      <span className="h-2 w-2 rounded-full bg-green-600 animate-pulse" />
                      Live Connected
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    Assisting {activeAssistRequest.citizenName} ({activeAssistRequest.age} yrs) • {activeAssistRequest.location}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setCoPilotOpen(false)}
                className="rounded-xl border border-gray-200 p-2 text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Simulated Live Call Status */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-linear-to-r from-emerald-50 to-teal-50 border border-emerald-200 p-3.5 text-emerald-950">
              <div className="flex items-center gap-3">
                <span className="text-2xl">📞</span>
                <div>
                  <p className="text-sm font-bold">
                    Connected with {activeAssistRequest.citizenName}: {activeAssistRequest.phone}
                  </p>
                  <p className="text-xs text-emerald-800">
                    Preferred Language: <strong>{activeAssistRequest.preferredLanguage}</strong> • Mode: {activeAssistRequest.mode}
                  </p>
                </div>
              </div>

              {/* Data Masking Toggle */}
              <button
                onClick={() => setMaskSensitive(!maskSensitive)}
                className="rounded-xl border border-emerald-300 bg-white px-3 py-1.5 text-xs font-bold text-emerald-900 shadow-2xs hover:bg-emerald-50 cursor-pointer"
              >
                {maskSensitive ? "🔒 Data Masking: ON" : "👁️ Data Masking: OFF"}
              </button>
            </div>

            {/* Assistance Content */}
            <div className="mt-6 space-y-6">
              {/* Service Details Card */}
              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-gray-500">
                  <span>Selected Welfare Scheme</span>
                  <span>Ticket #{activeAssistRequest.id}</span>
                </div>
                <p className="text-base font-black text-gray-900 mt-1">
                  {activeAssistRequest.serviceNeeded}
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  Notes from citizen: &ldquo;{activeAssistRequest.notes}&rdquo;
                </p>
              </div>

              {/* Document Verification Checklist */}
              <div>
                <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-2">
                  Document Verification Checklist (Ask Citizen verbally)
                </h4>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {[
                    { key: "aadhaar", label: "Aadhaar Card", mask: maskSensitive ? "XXXX-XXXX-8921" : "8921-4432-1109" },
                    { key: "ration", label: "Ration / BPL Card", mask: "Priority Non-Govt" },
                    { key: "income", label: "Income Certificate", mask: "Under ₹1,00,000" },
                    { key: "bank", label: "Bank Account Passbook", mask: maskSensitive ? "SBI XXXX-4412" : "SBI 984511224412" },
                  ].map((doc) => (
                    <label
                      key={doc.key}
                      className={`flex flex-col rounded-xl border p-3 cursor-pointer transition-colors ${
                        docChecks[doc.key] ? "border-green-300 bg-green-50/50" : "border-gray-200 bg-white"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-800">{doc.label}</span>
                        <input
                          type="checkbox"
                          checked={docChecks[doc.key]}
                          onChange={(e) => setDocChecks({ ...docChecks, [doc.key]: e.target.checked })}
                          className="h-4 w-4 accent-green-600 rounded"
                        />
                      </div>
                      <span className="text-[11px] text-gray-500 font-mono mt-1">{doc.mask}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Volunteer Assistance Notes */}
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-1">
                  Volunteer Notes / Remarks
                </label>
                <input
                  type="text"
                  value={coPilotNotes}
                  onChange={(e) => setCoPilotNotes(e.target.value)}
                  placeholder="e.g. Verified Aadhaar and age proof. Citizen has active Kerala Gramin Bank account."
                  className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2 text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>

              {/* ── Anti-Fraud Safety: Senior Consent Handshake ── */}
              <div className="rounded-2xl border-2 border-amber-300 bg-amber-50 p-4">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">🛡️</span>
                  <div className="w-full">
                    <h5 className="text-sm font-extrabold text-amber-950">
                      Senior Consent Handshake (Anti-Fraud Safety Protocol)
                    </h5>
                    <p className="text-xs text-amber-900 mt-0.5">
                      To protect seniors against unauthorized submissions, ask the citizen for the 4-digit verbal confirmation code sent to their mobile.
                    </p>

                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      <div className="flex items-center gap-2">
                        <label className="text-xs font-bold text-gray-700">Enter Citizen OTP:</label>
                        <input
                          type="text"
                          maxLength={4}
                          value={consentOtpInput}
                          onChange={(e) => setConsentOtpInput(e.target.value)}
                          placeholder="4-digit PIN"
                          className="w-32 rounded-xl border-2 border-amber-400 bg-white px-3 py-1.5 text-center font-mono text-base font-black tracking-widest text-amber-950 focus:border-blue-600 focus:outline-none"
                        />
                      </div>

                      {/* Demo OTP Helper Badge */}
                      <span className="rounded-lg bg-amber-200/80 px-2 py-1 text-[11px] font-semibold text-amber-900">
                        Demo OTP: <strong className="font-mono">{activeAssistRequest.consentOtp}</strong>
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Message (Success / Error) */}
              {assistStatusMessage && (
                <div
                  className={`rounded-xl p-3 text-sm font-bold ${
                    assistStatusMessage.type === "success"
                      ? "bg-green-100 text-green-900 border border-green-300"
                      : "bg-red-100 text-red-900 border border-red-300"
                  }`}
                >
                  {assistStatusMessage.text}
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 pt-4">
              <Link
                href="/voice"
                className="text-xs font-bold text-blue-700 hover:underline"
              >
                Open in Full AI Form Assistant ↗
              </Link>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setCoPilotOpen(false)}
                  className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 cursor-pointer"
                >
                  Close
                </button>
                <button
                  onClick={handleCompleteAssistance}
                  className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm px-5 py-2 shadow-xs transition-colors cursor-pointer"
                >
                  🚀 Submit & Credit +0.75 Hrs
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

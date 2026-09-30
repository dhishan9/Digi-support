"use client";

import { useState } from "react";
import Link from "next/link";
import { useFamily, FamilyMember } from "@/context/FamilyContext";

export default function FamilyPage() {
  const {
    helper,
    members,
    activeMember,
    setActiveMemberId,
    notifications,
    addMember,
    addDualNotification,
    markAllAsRead,
  } = useFamily();

  const [showAddModal, setShowAddModal] = useState(false);
  const [newMemberForm, setNewMemberForm] = useState({
    name: "",
    relation: "Father" as FamilyMember["relation"],
    age: "",
    phone: "",
    address: "",
    aadhaarLast4: "",
    income: "",
    category: "General",
  });

  const handleCreateMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberForm.name.trim()) return;

    let avatar = "👤";
    if (newMemberForm.relation === "Father" || newMemberForm.relation === "Grandfather") avatar = "👴";
    else if (newMemberForm.relation === "Mother" || newMemberForm.relation === "Grandmother") avatar = "👵";
    else if (newMemberForm.relation === "Child") avatar = "🧒";
    else if (newMemberForm.relation === "Spouse") avatar = "👩";

    addMember({
      name: newMemberForm.name.trim(),
      relation: newMemberForm.relation,
      avatar,
      age: Number(newMemberForm.age) || 60,
      phone: newMemberForm.phone.trim() || "+91 98000 00000",
      address: newMemberForm.address.trim() || "Kerala, India",
      aadhaarLast4: newMemberForm.aadhaarLast4.trim() || "0000",
      income: newMemberForm.income.trim() || "₹1,50,000",
      category: newMemberForm.category,
    });

    setNewMemberForm({
      name: "",
      relation: "Father",
      age: "",
      phone: "",
      address: "",
      aadhaarLast4: "",
      income: "",
      category: "General",
    });
    setShowAddModal(false);
  };

  const handleTestDualAlert = () => {
    addDualNotification(
      `Application Status Update for ${activeMember.name}`,
      `Taluk Revenue Office completed physical verification. Form ready for final approval. Alerts dispatched to ${activeMember.relation} & Helper.`
    );
  };

  return (
    <div className="space-y-8">
      {/* ── Page Header & Helper Banner ── */}
      <div className="rounded-3xl border-2 border-[var(--primary)] bg-gradient-to-br from-blue-50 via-white to-blue-50/50 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-blue-600 px-3 py-1 text-xs font-bold text-white uppercase tracking-wider">
                👨‍👩‍👧 Family Account • Helper Mode
              </span>
              <span className="text-xs font-semibold text-gray-500">
                1 Login • Multi-Profile
              </span>
            </div>
            <h1 className="text-3xl font-extrabold sm:text-4xl text-[var(--fg)]">
              Family Vault & Helper Mode
            </h1>
            <p className="max-w-2xl text-base text-gray-600">
              Manage government certificates, pensions, and welfare schemes for your elderly parents from a single account. All application milestones automatically send <strong>dual notifications to both your parents and you</strong>.
            </p>
          </div>

          {/* Helper Account Card */}
          <div className="rounded-2xl border-2 border-blue-200 bg-white p-4 shadow-xs shrink-0 md:w-72">
            <p className="text-xs font-bold uppercase tracking-wider text-blue-900">
              Logged in Helper:
            </p>
            <p className="font-extrabold text-lg text-gray-900">{helper.name}</p>
            <p className="text-xs text-gray-500">{helper.role}</p>
            <p className="mt-2 text-xs font-mono font-semibold text-blue-700 bg-blue-50 rounded-md px-2 py-1 inline-block">
              📱 Linked: {helper.phone}
            </p>
          </div>
        </div>
      </div>

      {/* ── Active Profile Quick Indicator ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border-2 border-green-500 bg-green-50/80 px-5 py-4 animate-slide-down shadow-xs">
        <div className="flex items-center gap-3">
          <span className="text-3xl animate-float">{activeMember.avatar}</span>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-green-800 bg-green-200/80 px-2 py-0.5 rounded-full">
                Currently Active Profile
              </span>
              <span className="text-xs text-green-700 font-semibold">
                (Forms & Checklists apply to this member)
              </span>
            </div>
            <p className="text-xl font-extrabold text-green-950">
              {activeMember.name} ({activeMember.relation}, {activeMember.age} yrs)
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Link
            href="/voice"
            className="btn-tactile rounded-xl bg-[var(--primary)] px-4 py-2 text-sm font-bold text-white shadow hover:bg-[var(--primary-hover)] transition-colors cursor-pointer"
          >
            Fill Form for {activeMember.name.split(" ")[0]} →
          </Link>
        </div>
      </div>

      {/* ── Profiles Grid ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-[var(--fg)] flex items-center gap-2">
            <span>👥</span> Family Member Profiles ({members.length})
          </h2>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-tactile rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow hover:bg-blue-700 transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <span>+</span> Add Parent / Member
          </button>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {members.map((m) => {
            const isActive = m.id === activeMember.id;
            return (
              <div
                key={m.id}
                className={`card-interactive flex flex-col justify-between rounded-2xl border-2 p-5 shadow-xs ${
                  isActive
                    ? "border-green-500 bg-green-50/40 ring-2 ring-green-400"
                    : "border-[var(--border)] bg-[var(--surface)] hover:border-blue-400"
                }`}
              >
                <div>
                  {/* Top Bar with Avatar and Status */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-4xl p-2 rounded-2xl bg-white border border-gray-200 shadow-xs">
                        {m.avatar}
                      </span>
                      <div>
                        <h3 className="text-xl font-bold leading-tight text-gray-900">
                          {m.name}
                        </h3>
                        <p className="text-xs font-semibold text-gray-500">
                          {m.relation} • {m.age} Years
                        </p>
                      </div>
                    </div>
                    {isActive ? (
                      <span className="rounded-full bg-green-600 px-2.5 py-1 text-xs font-bold text-white shadow-xs">
                        Active ⭐
                      </span>
                    ) : (
                      <button
                        onClick={() => setActiveMemberId(m.id)}
                        className="rounded-lg border border-gray-300 bg-white px-2.5 py-1 text-xs font-bold text-gray-700 hover:bg-gray-100 cursor-pointer"
                      >
                        Switch
                      </button>
                    )}
                  </div>

                  {/* Metadata Chips */}
                  <div className="mt-4 space-y-1.5 text-xs text-gray-700">
                    <p className="flex items-center gap-1.5">
                      <span className="font-semibold text-gray-400">📱 Phone:</span>
                      <span className="font-mono">{m.phone}</span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <span className="font-semibold text-gray-400">🆔 Aadhaar:</span>
                      <span className="font-mono">XXXX-XXXX-{m.aadhaarLast4}</span>
                    </p>
                    <p className="flex items-start gap-1.5">
                      <span className="font-semibold text-gray-400 shrink-0">📍 Address:</span>
                      <span className="truncate">{m.address}</span>
                    </p>
                  </div>

                  {/* Active Applications list */}
                  <div className="mt-4 pt-3 border-t border-[var(--border)]">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                      Active Applications:
                    </p>
                    {m.activeApplications.length > 0 ? (
                      <div className="space-y-1.5">
                        {m.activeApplications.map((app, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between rounded-lg bg-white p-2 border border-gray-200 text-xs font-semibold"
                          >
                            <span className="truncate max-w-[170px]">{app.serviceName}</span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                app.status === "Approved"
                                  ? "bg-green-100 text-green-800"
                                  : app.status === "Submitted"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-amber-100 text-amber-800"
                              }`}
                            >
                              {app.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs italic text-gray-400">
                        No active forms yet. Ready for new application.
                      </p>
                    )}
                  </div>
                </div>

                {/* Card Actions */}
                <div className="mt-5 pt-3 border-t border-[var(--border)] flex gap-2">
                  <Link
                    href="/voice"
                    onClick={() => setActiveMemberId(m.id)}
                    className="flex-1 text-center rounded-xl bg-[var(--primary)] px-3 py-2 text-xs font-bold text-white shadow-xs hover:bg-[var(--primary-hover)] transition-colors cursor-pointer"
                  >
                    🤖 Fill Form
                  </Link>
                  <Link
                    href="/scholarships"
                    onClick={() => setActiveMemberId(m.id)}
                    className="rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 cursor-pointer"
                  >
                    🎓 Schemes
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Dual-Alert Dispatch Log Section ── */}
      <div className="rounded-3xl border-2 border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🔔</span>
              <h2 className="text-2xl font-bold text-[var(--fg)]">
                Dual-Notification Dispatch Center
              </h2>
            </div>
            <p className="text-sm text-gray-500 mt-0.5">
              Live log of SMS & WhatsApp alerts dispatched simultaneously to both the applicant parent and the helper son/daughter.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleTestDualAlert}
              className="rounded-xl border-2 border-blue-400 bg-blue-50 px-3.5 py-2 text-xs font-bold text-blue-800 hover:bg-blue-100 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <span>⚡</span> Send Test Dual-Alert
            </button>
            <button
              onClick={markAllAsRead}
              className="rounded-xl border border-gray-300 bg-white px-3.5 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 cursor-pointer"
            >
              Mark Read
            </button>
          </div>
        </div>

        {/* Notification Cards */}
        <div className="space-y-3">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className={`rounded-2xl border-2 p-4 transition-all ${
                notif.read
                  ? "border-gray-200 bg-white opacity-85"
                  : "border-blue-400 bg-blue-50/40 shadow-xs"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base text-gray-900">
                      {notif.title}
                    </h3>
                    <span className="rounded-md bg-green-100 px-2 py-0.5 text-[10px] font-extrabold text-green-800 uppercase tracking-wider">
                      {notif.channel}
                    </span>
                    {!notif.read && (
                      <span className="h-2 w-2 rounded-full bg-blue-600" />
                    )}
                  </div>
                  <p className="text-sm text-gray-700">{notif.message}</p>
                </div>
                <span className="text-xs text-gray-400 font-semibold shrink-0">
                  {notif.timestamp}
                </span>
              </div>

              {/* Dual Recipients Badge */}
              <div className="mt-3 flex flex-wrap items-center gap-2 pt-2 border-t border-gray-200 text-xs">
                <span className="font-bold text-gray-400">Dispatched To:</span>
                {notif.recipients.map((rec, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-1.5 rounded-lg border border-blue-200 bg-white px-2.5 py-1 text-gray-800 shadow-2xs font-medium"
                  >
                    <span>{idx === 0 ? "👵 / 👴" : "📱"}</span>
                    <span className="font-bold">{rec.name}</span>
                    <span className="text-gray-400">({rec.role})</span>
                    <span className="font-mono text-blue-600 font-semibold">
                      {rec.phone}
                    </span>
                    <span className="text-green-600 font-bold ml-1">✓ Sent</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Add Family Member Modal ── */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 sm:p-7 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-extrabold text-2xl text-gray-900 flex items-center gap-2">
                <span>➕</span> Add Family Member Profile
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-700 text-2xl font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateMember} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                    Relationship <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={newMemberForm.relation}
                    onChange={(e) =>
                      setNewMemberForm((prev) => ({
                        ...prev,
                        relation: e.target.value as FamilyMember["relation"],
                      }))
                    }
                    className="w-full rounded-xl border-2 border-gray-300 p-2.5 text-base focus:border-[var(--primary)] focus:outline-none"
                  >
                    <option value="Father">Father (അച്ഛൻ)</option>
                    <option value="Mother">Mother (അമ്മ)</option>
                    <option value="Grandfather">Grandfather (മുത്തശ്ശൻ)</option>
                    <option value="Grandmother">Grandmother (മുത്തശ്ശി)</option>
                    <option value="Spouse">Spouse (ഭാര്യ / ഭർത്താവ്)</option>
                    <option value="Child">Child (മകൻ / മകൾ)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                    Age <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={120}
                    value={newMemberForm.age}
                    onChange={(e) =>
                      setNewMemberForm((prev) => ({
                        ...prev,
                        age: e.target.value,
                      }))
                    }
                    placeholder="e.g. 68"
                    className="w-full rounded-xl border-2 border-gray-300 p-2.5 text-base focus:border-[var(--primary)] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newMemberForm.name}
                  onChange={(e) =>
                    setNewMemberForm((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  placeholder="e.g. Radhakrishnan K"
                  className="w-full rounded-xl border-2 border-gray-300 p-2.5 text-base focus:border-[var(--primary)] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                    Mobile Phone (For Dual SMS) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={newMemberForm.phone}
                    onChange={(e) =>
                      setNewMemberForm((prev) => ({
                        ...prev,
                        phone: e.target.value,
                      }))
                    }
                    placeholder="e.g. 9876543210"
                    className="w-full rounded-xl border-2 border-gray-300 p-2.5 text-base focus:border-[var(--primary)] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                    Aadhaar Last 4 Digits
                  </label>
                  <input
                    type="text"
                    maxLength={4}
                    value={newMemberForm.aadhaarLast4}
                    onChange={(e) =>
                      setNewMemberForm((prev) => ({
                        ...prev,
                        aadhaarLast4: e.target.value,
                      }))
                    }
                    placeholder="e.g. 4512"
                    className="w-full rounded-xl border-2 border-gray-300 p-2.5 text-base focus:border-[var(--primary)] focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                  Residential Address
                </label>
                <textarea
                  rows={2}
                  value={newMemberForm.address}
                  onChange={(e) =>
                    setNewMemberForm((prev) => ({
                      ...prev,
                      address: e.target.value,
                    }))
                  }
                  placeholder="e.g. Temple Road, Aluva, Ernakulam"
                  className="w-full resize-none rounded-xl border-2 border-gray-300 p-2.5 text-base focus:border-[var(--primary)] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                    Annual Income
                  </label>
                  <input
                    type="text"
                    value={newMemberForm.income}
                    onChange={(e) =>
                      setNewMemberForm((prev) => ({
                        ...prev,
                        income: e.target.value,
                      }))
                    }
                    placeholder="e.g. ₹1,20,000"
                    className="w-full rounded-xl border-2 border-gray-300 p-2.5 text-base focus:border-[var(--primary)] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={newMemberForm.category}
                    onChange={(e) =>
                      setNewMemberForm((prev) => ({
                        ...prev,
                        category: e.target.value,
                      }))
                    }
                    className="w-full rounded-xl border-2 border-gray-300 p-2.5 text-base focus:border-[var(--primary)] focus:outline-none"
                  >
                    <option value="General">General</option>
                    <option value="OBC">OBC</option>
                    <option value="SC">SC</option>
                    <option value="ST">ST</option>
                    <option value="Minority">Minority</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-[var(--primary)] py-3 text-base font-bold text-white shadow hover:bg-[var(--primary-hover)] transition-colors cursor-pointer"
                >
                  Save Profile & Link Helper
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-xl border border-gray-300 px-5 py-3 text-base font-semibold text-gray-700 hover:bg-gray-100 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

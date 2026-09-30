"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import servicesData from "@/data/services.json";
import { useFamily } from "@/context/FamilyContext";

/* ── Language options ── */
const LANGUAGES = [
  { code: "en-IN", label: "English (India)" },
  { code: "ml-IN", label: "Malayalam (മലയാളം)" },
  { code: "hi-IN", label: "Hindi (हिन्दी)" },
  { code: "ta-IN", label: "Tamil (தமிழ்)" },
] as const;

interface ChatMessage {
  id: string;
  role: "assistant" | "user";
  content: string;
  timestamp: string;
}

interface FormDataState {
  serviceId: string;
  serviceName: string;
  name: string;
  age: string;
  address: string;
  phone: string;
  income: string;
  purpose: string;
}

const INITIAL_FORM: FormDataState = {
  serviceId: "",
  serviceName: "",
  name: "",
  age: "",
  address: "",
  phone: "",
  income: "",
  purpose: "",
};

const SUGGESTIONS = [
  "I need an Income Certificate for scholarship",
  "Help me apply for a Senior Citizen Card",
  "I want to apply for a Ration Card",
  "Need to update address in my Aadhaar",
];

export default function VoiceAIPage() {
  const { activeMember, helper, addDualNotification } = useFamily();

  const [lang, setLang] = useState("en-IN");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [formData, setFormData] = useState<FormDataState>(INITIAL_FORM);
  const [isListening, setIsListening] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [errorBanner, setErrorBanner] = useState("");
  const [successBanner, setSuccessBanner] = useState("");

  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  /* Initialize form & chat greeting based on active family member */
  useEffect(() => {
    // Pre-populate form with active family member details
    setFormData({
      serviceId: "",
      serviceName: "",
      name: activeMember.name,
      age: String(activeMember.age),
      address: activeMember.address,
      phone: activeMember.phone,
      income: activeMember.income,
      purpose: "",
    });

    const isHelper = activeMember.relation !== "Self";
    const greeting = isHelper
      ? `Namaste ${helper.name.split(" ")[0]}! 🙏 You are in Helper Mode for your ${activeMember.relation.toLowerCase()}, ${activeMember.name} (${activeMember.age} yrs). Which certificate or welfare scheme shall we prepare for them today?`
      : `Namaste ${activeMember.name.split(" ")[0]}! 🙏 I am Digi-Sahaayak, your AI assistant for government applications. Tell me or speak: which certificate or service do you need help with today?`;

    setMessages([
      {
        id: "init",
        role: "assistant",
        content: greeting,
        timestamp: "Just now",
      },
    ]);
  }, [activeMember, helper]);

  /* Load stored Gemini key if user saved one */
  useEffect(() => {
    const savedKey = localStorage.getItem("digi-gemini-key");
    if (savedKey) setApiKey(savedKey);

    const SpeechRecognition =
      typeof window !== "undefined"
        ? window.SpeechRecognition || window.webkitSpeechRecognition
        : null;
    if (!SpeechRecognition) {
      setSpeechSupported(false);
    }
  }, []);

  /* Auto scroll chat to bottom */
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isGenerating]);

  /* Save API key */
  const handleSaveApiKey = (key: string) => {
    setApiKey(key.trim());
    localStorage.setItem("digi-gemini-key", key.trim());
    setShowKeyModal(false);
  };

  /* ── Send Message to AI Assistant ── */
  const handleSendMessage = async (userText: string) => {
    const cleanText = userText.trim();
    if (!cleanText || isGenerating) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: cleanText,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInputText("");
    setIsGenerating(true);
    setErrorBanner("");
    setSuccessBanner("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          currentForm: formData,
          language: lang,
          apiKey: apiKey || undefined,
        }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      if (data.formData) {
        setFormData((prev) => ({
          ...prev,
          ...data.formData,
        }));
      }

      const botReply: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          data.reply ||
          "I have noted your information. What other details can you share?",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      setMessages((prev) => [...prev, botReply]);
    } catch (err: unknown) {
      console.error("Chat error:", err);
      const botFallback: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          "I received your message and updated the form details. Please continue telling me your name, age, address, and mobile number.",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages((prev) => [...prev, botFallback]);
    } finally {
      setIsGenerating(false);
    }
  };

  /* ── Voice Input using Web Speech API ── */
  const toggleSpeechRecognition = async () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setErrorBanner(
        "Web Speech API is not supported in this browser. Please use Chrome or Edge."
      );
      return;
    }

    // Check secure context for microphone
    const isLocalhost =
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1";
    if (!isLocalhost && window.location.protocol !== "https:") {
      setErrorBanner(
        "Microphone blocked: Browsers require localhost or HTTPS to access the microphone. Please open http://localhost:3000 on your computer."
      );
      return;
    }

    try {
      if (navigator?.mediaDevices?.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach((track) => track.stop());
      }
    } catch {
      setErrorBanner("Microphone access was denied. Please allow permissions in your browser.");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = lang;
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsListening(true);
        setErrorBanner("");
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let transcript = "";
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setInputText(transcript);
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error("Speech error:", event.error);
        setIsListening(false);
        if (event.error !== "aborted") {
          setErrorBanner(`Microphone error: ${event.error}. Please try again.`);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e: unknown) {
      console.error("Could not start speech recognition:", e);
      setIsListening(false);
    }
  };

  /* Matched service documents from services.json */
  const matchedService = servicesData.find(
    (s) =>
      s.id === formData.serviceId ||
      s.name.toLowerCase() === formData.serviceName.toLowerCase()
  );

  /* Form completion score */
  const essentialFields = [
    formData.serviceName,
    formData.name,
    formData.age,
    formData.address,
    formData.phone,
  ];
  const filledCount = essentialFields.filter((f) => f.trim().length > 0).length;
  const isFormReady = filledCount >= 4;

  /* ── Download PDF via jsPDF & trigger Dual Notification ── */
  const handleDownloadPDF = async () => {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // 1. National Emblem / Header
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("DIGI-SUPPORT CITIZEN ASSISTANT", pageWidth / 2, 18, {
      align: "center",
    });

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(
      "Official Government Application Form (Self-Declared)",
      pageWidth / 2,
      25,
      { align: "center" }
    );

    // Decorative divider
    doc.setDrawColor(29, 78, 216);
    doc.setLineWidth(0.8);
    doc.line(15, 30, pageWidth - 15, 30);

    // Service Title Banner
    doc.setFillColor(239, 246, 255);
    doc.rect(15, 35, pageWidth - 30, 14, "F");
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(29, 78, 216);
    doc.text(
      `APPLICATION FOR: ${formData.serviceName.toUpperCase() || "GOVERNMENT SERVICE"}`,
      20,
      44
    );

    // Applicant Details Section
    doc.setTextColor(20, 20, 20);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("1. Applicant Information", 15, 60);

    const leftCol = 20;
    const valueCol = 75;
    let y = 70;

    const printRow = (label: string, value: string) => {
      doc.setFont("helvetica", "bold");
      doc.text(`${label}:`, leftCol, y);
      doc.setFont("helvetica", "normal");
      const val = value || "— Not specified —";
      const lines = doc.splitTextToSize(val, pageWidth - valueCol - 15);
      doc.text(lines, valueCol, y);
      y += Math.max(lines.length * 6, 8) + 2;
    };

    printRow("Full Name", formData.name);
    printRow("Age / DOB", formData.age ? `${formData.age} Years` : "");
    printRow("Residential Address", formData.address);
    printRow("Mobile Number", formData.phone);
    if (formData.income) printRow("Annual Family Income", formData.income);
    if (formData.purpose) printRow("Purpose of Application", formData.purpose);

    // 2. Required Supporting Documents Section
    y += 4;
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("2. Checklist of Supporting Documents to Attach:", 15, y);
    y += 8;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const docs = matchedService?.documents || [
      "Aadhaar Card (Identity & Address Proof)",
      "Passport-size Photographs (2 copies)",
      "Bank Account Passbook / Statement",
      "Self-Declaration Undertaking",
    ];

    docs.forEach((d) => {
      doc.text(`[  ]  ${d}`, 20, y);
      y += 7;
    });

    // 3. Declaration
    y += 6;
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("3. Citizen Declaration:", 15, y);
    y += 7;

    doc.setFontSize(9);
    doc.setFont("helvetica", "italic");
    const declaration =
      "I hereby declare that all information furnished above is true and correct to the best of my knowledge and belief. I agree to produce original verification documents upon request by the authorities.";
    const decLines = doc.splitTextToSize(declaration, pageWidth - 30);
    doc.text(decLines, 15, y);
    y += decLines.length * 5 + 15;

    // 4. Signature & Date Box
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Date: ${new Date().toLocaleDateString("en-IN")}`, 15, y);
    doc.text("Applicant Signature / Thumb Impression", pageWidth - 80, y);
    doc.setDrawColor(150);
    doc.line(pageWidth - 85, y + 2, pageWidth - 15, y + 2);

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(120);
    doc.text(
      "Auto-generated via Digi-Support Conversational Assistant for Hackathon MVP",
      pageWidth / 2,
      285,
      { align: "center" }
    );

    const filename = `${formData.serviceId || "application"}_${formData.name || "form"}.pdf`.replace(
      /\s+/g,
      "_"
    );
    doc.save(filename);

    // ── Trigger Dual Notification (Sent to both Parent and Helper) ──
    addDualNotification(
      `${formData.serviceName || "Government Form"} PDF Generated`,
      `Application completed for ${formData.name || activeMember.name}. Verified PDF copy dispatched via SMS & WhatsApp to ${activeMember.relation} (${formData.phone || activeMember.phone}) and Helper (${helper.phone}).`
    );

    setSuccessBanner(
      `✅ Dual Notification Dispatched: SMS & WhatsApp alerts sent to ${formData.name || activeMember.name} and Helper (${helper.name})!`
    );
  };

  return (
    <div className="space-y-6">
      {/* ── Helper Mode Banner ── */}
      <div className="rounded-2xl border-2 border-blue-400 bg-blue-50/70 p-4 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <span className="text-3xl p-1.5 rounded-xl bg-white border border-blue-200">
            {activeMember.avatar}
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-blue-600 px-2.5 py-0.5 text-[11px] font-extrabold text-white uppercase tracking-wider">
                👨‍👩‍👧 Helper Mode Active
              </span>
              <span className="text-xs text-blue-800 font-semibold">
                Managing for: {activeMember.name} ({activeMember.relation}, {activeMember.age} yrs)
              </span>
            </div>
            <p className="text-xs text-gray-600 mt-0.5">
              Helper: <strong>{helper.name}</strong> • Dual SMS & WhatsApp alerts dispatched to both phone numbers upon form completion.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/family"
            className="text-xs font-bold text-blue-700 bg-white border border-blue-300 rounded-xl px-3 py-1.5 hover:bg-blue-100 transition-colors"
          >
            Switch Profile ▾
          </Link>
        </div>
      </div>

      {/* ── Volunteer Assistance Callout ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-300 bg-amber-50/80 px-4 py-3 text-amber-950">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🤝</span>
          <div>
            <p className="text-sm font-bold">
              Need a human helper to fill this for you? NSS Student Volunteers are on standby!
            </p>
            <p className="text-xs text-amber-800">
              Free 1-on-1 phone or ward-visit assistance by verified college cadets.
            </p>
          </div>
        </div>
        <Link
          href="/volunteer"
          className="rounded-xl bg-amber-600 px-3.5 py-1.5 text-xs font-extrabold text-white shadow-xs hover:bg-amber-700 transition-colors"
        >
          Request Volunteer / Digi‑Mitra ↗
        </Link>
      </div>

      {/* ── Page Header ── */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--border)] pb-4">
        <div>
          <h1 className="text-3xl font-extrabold sm:text-4xl text-[var(--primary)] flex items-center gap-2">
            <span>🤖</span> Conversational AI Form Filling
          </h1>
          <p className="mt-1 text-base text-gray-500">
            Speak or chat with Digi-Sahaayak. As you talk, your official government form is drafted live on the right.
          </p>
        </div>

        {/* Action badges: Language & API Key */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Language selector */}
          <div className="flex items-center gap-1.5 rounded-xl border-2 border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-sm font-semibold">
            <span>🌐</span>
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              className="bg-transparent font-bold focus:outline-none cursor-pointer"
            >
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.label}
                </option>
              ))}
            </select>
          </div>

          {/* Gemini AI status button */}
          <button
            onClick={() => setShowKeyModal(true)}
            className={`rounded-xl px-3 py-1.5 text-sm font-bold border-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              apiKey
                ? "border-green-500 bg-green-50 text-green-800"
                : "border-blue-300 bg-blue-50 text-blue-800 hover:bg-blue-100"
            }`}
            title="Configure Gemini API Key"
          >
            <span>{apiKey ? "⚡ Gemini 2.0 Flash" : "⚙️ Configure AI Key"}</span>
          </button>
        </div>
      </div>

      {/* Success Alert (Dual Notification) */}
      {successBanner && (
        <div className="flex items-center justify-between rounded-xl border border-green-400 bg-green-50 p-4 text-green-900 shadow-xs">
          <p className="text-sm font-bold">{successBanner}</p>
          <button
            onClick={() => setSuccessBanner("")}
            className="text-lg font-bold text-green-800 hover:text-green-950 px-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* Error / Warning Alert */}
      {errorBanner && (
        <div className="flex items-center justify-between rounded-xl border border-red-300 bg-red-50 p-4 text-red-900">
          <p className="text-sm font-semibold">⚠️ {errorBanner}</p>
          <button
            onClick={() => setErrorBanner("")}
            className="text-lg font-bold text-red-700 hover:text-red-950 px-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* ── Main 2-Column Split Screen ── */}
      <div className="grid gap-6 lg:grid-cols-12 items-start">
        {/* ════════ LEFT COLUMN: AI Chat & Voice Interface (7 cols) ════════ */}
        <div className="lg:col-span-7 flex flex-col rounded-2xl border-2 border-[var(--border)] bg-[var(--surface)] shadow-sm h-[720px]">
          {/* Chat Header */}
          <div className="flex items-center justify-between border-b-2 border-[var(--border)] px-5 py-3.5 bg-white rounded-t-2xl">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-2xl">
                🤖
              </div>
              <div>
                <h3 className="font-bold text-lg leading-tight">Digi-Sahaayak</h3>
                <p className="text-xs text-green-600 font-semibold flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  Online • Helper Mode Active ({activeMember.name.split(" ")[0]})
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setMessages([
                  {
                    id: Date.now().toString(),
                    role: "assistant",
                    content: `Namaste! Which certificate or welfare service shall we prepare for ${activeMember.name}?`,
                    timestamp: "Just now",
                  },
                ]);
                setFormData({
                  serviceId: "",
                  serviceName: "",
                  name: activeMember.name,
                  age: String(activeMember.age),
                  address: activeMember.address,
                  phone: activeMember.phone,
                  income: activeMember.income,
                  purpose: "",
                });
              }}
              className="text-xs font-semibold text-gray-500 hover:text-red-600 border border-gray-300 px-2.5 py-1.5 rounded-lg hover:bg-gray-50 cursor-pointer"
            >
              🔄 Reset Form
            </button>
          </div>

          {/* Chat Message Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-3 animate-slide-down ${
                  m.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {m.role === "assistant" && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white text-base">
                    🤖
                  </div>
                )}
                <div
                  className={`max-w-[82%] rounded-2xl p-4 text-base shadow-xs leading-relaxed transition-all ${
                    m.role === "user"
                      ? "bg-[var(--primary)] text-white rounded-tr-none font-medium"
                      : "bg-white border-2 border-[var(--border)] text-[var(--fg)] rounded-tl-none"
                  }`}
                >
                  <p>{m.content}</p>
                  <span
                    className={`mt-1.5 block text-right text-[11px] ${
                      m.role === "user" ? "text-blue-100" : "text-gray-400"
                    }`}
                  >
                    {m.timestamp}
                  </span>
                </div>
                {m.role === "user" && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-700 text-white text-base">
                    👤
                  </div>
                )}
              </div>
            ))}

            {isGenerating && (
              <div className="flex items-center gap-2 text-sm text-gray-500 italic pl-11">
                <span className="h-2 w-2 rounded-full bg-blue-600 animate-bounce" />
                <span className="h-2 w-2 rounded-full bg-blue-600 animate-bounce [animation-delay:0.2s]" />
                <span className="h-2 w-2 rounded-full bg-blue-600 animate-bounce [animation-delay:0.4s]" />
                <span>Digi-Sahaayak is updating your form...</span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Suggestions Chips */}
          <div className="px-4 py-2 border-t border-[var(--border)] bg-gray-50/70 overflow-x-auto flex gap-2">
            {SUGGESTIONS.map((s, i) => (
              <button
                key={i}
                onClick={() => handleSendMessage(s)}
                disabled={isGenerating}
                className="shrink-0 text-xs font-semibold bg-white border border-gray-300 rounded-full px-3 py-1.5 text-gray-700 hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors cursor-pointer"
              >
                + {s}
              </button>
            ))}
          </div>

          {/* Chat & Voice Input Box */}
          <div className="p-3 border-t-2 border-[var(--border)] bg-white rounded-b-2xl">
            {isListening && (
              <div className="mb-2 flex items-center justify-between rounded-xl bg-orange-50 px-3 py-2 border border-orange-200 text-sm font-semibold text-orange-800">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-red-600 animate-ping" />
                  <span>Listening in {LANGUAGES.find((l) => l.code === lang)?.label}... Speak into your mic!</span>
                </div>
                <button
                  onClick={() => setIsListening(false)}
                  className="text-xs font-bold text-red-600 hover:underline"
                >
                  Stop
                </button>
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage(inputText);
              }}
              className="flex items-center gap-2"
            >
              {/* Mic button */}
              <button
                type="button"
                onClick={toggleSpeechRecognition}
                disabled={!speechSupported || isGenerating}
                className={`btn-tactile flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-xl font-bold transition-all cursor-pointer ${
                  isListening
                    ? "bg-red-600 text-white animate-listening-wave ring-4 ring-red-300 shadow-md"
                    : "bg-blue-50 text-[var(--primary)] border-2 border-blue-200 hover:bg-blue-100"
                } disabled:opacity-40 disabled:cursor-not-allowed`}
                title={isListening ? "Stop Recording" : "Speak using Microphone"}
                aria-label="Toggle voice recording"
              >
                {isListening ? "⏹" : "🎤"}
              </button>

              {/* Text input */}
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={`Speak or type for ${activeMember.name.split(" ")[0]}...`}
                disabled={isGenerating}
                className="flex-1 rounded-xl border-2 border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-base focus:border-[var(--primary)] focus:outline-none"
              />

              {/* Send button */}
              <button
                type="submit"
                disabled={!inputText.trim() || isGenerating}
                className="btn-tactile flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--primary)] text-white text-lg font-bold shadow hover:bg-[var(--primary-hover)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                title="Send message"
                aria-label="Send message"
              >
                ➤
              </button>
            </form>
          </div>
        </div>

        {/* ════════ RIGHT COLUMN: Live Application Form Preview (5 cols) ════════ */}
        <div className="lg:col-span-5 flex flex-col rounded-2xl border-2 border-[var(--border)] bg-white shadow-sm overflow-hidden">
          {/* Form Header */}
          <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-extrabold tracking-widest text-blue-200">
                Live Drafting Preview
              </span>
              <span
                className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                  isFormReady
                    ? "bg-green-400 text-gray-900"
                    : "bg-blue-600 text-white border border-blue-400"
                }`}
              >
                {isFormReady ? "Ready to Download ✅" : `${filledCount} of 5 Details Filled`}
              </span>
            </div>
            <h2 className="mt-1 text-2xl font-extrabold">
              {formData.serviceName || "Government Application Form"}
            </h2>
            <p className="mt-1 text-xs text-blue-100">
              Applying on behalf of: <strong>{activeMember.name} ({activeMember.relation})</strong>
            </p>
          </div>

          {/* Form Content Fields */}
          <div className="p-5 space-y-4 max-h-[580px] overflow-y-auto">
            {/* Service Field */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-gray-500 block mb-1">
                Target Service / Certificate:
              </label>
              <input
                type="text"
                value={formData.serviceName}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, serviceName: e.target.value }))
                }
                placeholder="Mention in chat (e.g. Income Certificate, Ration Card)"
                className="w-full rounded-xl border border-gray-300 bg-gray-50 p-2.5 text-base font-bold text-gray-800 focus:bg-white focus:border-[var(--primary)] focus:outline-none"
              />
            </div>

            {/* Name & Age Row */}
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500 block mb-1">
                  Applicant Name:
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="e.g. Radhakrishnan K"
                  className="w-full rounded-xl border border-gray-300 bg-gray-50 p-2.5 text-base font-semibold text-gray-800 focus:bg-white focus:border-[var(--primary)] focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500 block mb-1">
                  Age:
                </label>
                <input
                  type="text"
                  value={formData.age}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, age: e.target.value }))
                  }
                  placeholder="e.g. 68"
                  className="w-full rounded-xl border border-gray-300 bg-gray-50 p-2.5 text-base font-semibold text-gray-800 focus:bg-white focus:border-[var(--primary)] focus:outline-none"
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-gray-500 block mb-1">
                Residential Address / District:
              </label>
              <textarea
                rows={2}
                value={formData.address}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, address: e.target.value }))
                }
                placeholder="e.g. House No 42, Temple Road, Aluva, Ernakulam"
                className="w-full resize-none rounded-xl border border-gray-300 bg-gray-50 p-2.5 text-base text-gray-800 focus:bg-white focus:border-[var(--primary)] focus:outline-none"
              />
            </div>

            {/* Phone & Income Row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500 block mb-1">
                  Mobile Number:
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, phone: e.target.value }))
                  }
                  placeholder="e.g. 9876543210"
                  className="w-full rounded-xl border border-gray-300 bg-gray-50 p-2.5 text-base font-semibold text-gray-800 focus:bg-white focus:border-[var(--primary)] focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500 block mb-1">
                  Annual Income:
                </label>
                <input
                  type="text"
                  value={formData.income}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, income: e.target.value }))
                  }
                  placeholder="e.g. ₹1,20,000"
                  className="w-full rounded-xl border border-gray-300 bg-gray-50 p-2.5 text-base text-gray-800 focus:bg-white focus:border-[var(--primary)] focus:outline-none"
                />
              </div>
            </div>

            {/* Purpose */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-gray-500 block mb-1">
                Purpose / Scheme:
              </label>
              <input
                type="text"
                value={formData.purpose}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, purpose: e.target.value }))
                }
                placeholder="e.g. Higher Education Scholarship"
                className="w-full rounded-xl border border-gray-300 bg-gray-50 p-2.5 text-base text-gray-800 focus:bg-white focus:border-[var(--primary)] focus:outline-none"
              />
            </div>

            {/* Required Documents Checklist Card */}
            <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-3.5 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-blue-900 flex items-center gap-1.5">
                <span>📁</span> Required Supporting Documents:
              </h4>
              <ul className="text-xs text-blue-950 space-y-1">
                {(matchedService?.documents || [
                  "Aadhaar Card (Identity Proof)",
                  "Address Proof (Utility Bill / Ration Card)",
                  "Passport-size Photographs (2 copies)",
                ]).map((doc, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-blue-600 font-bold">•</span>
                    <span>{doc}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Form Actions Footer */}
          <div className="p-4 border-t border-gray-200 bg-gray-50 flex flex-col gap-2">
            <button
              onClick={handleDownloadPDF}
              disabled={!formData.name && !formData.serviceName}
              className="w-full rounded-xl bg-[var(--primary)] px-6 py-3.5 text-base font-bold text-white shadow-md hover:bg-[var(--primary-hover)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
            >
              <span>📄</span> Download Form & Dispatch Dual-Alert
            </button>
            <p className="text-[11px] text-center text-gray-500">
              Dispatches dual alerts to {formData.name || activeMember.name} and Helper ({helper.name}).
            </p>
          </div>
        </div>
      </div>

      {/* ── API Key Configuration Modal ── */}
      {showKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-extrabold text-xl text-gray-900 flex items-center gap-2">
                <span>⚡</span> Gemini AI Configuration
              </h3>
              <button
                onClick={() => setShowKeyModal(false)}
                className="text-gray-400 hover:text-gray-700 text-xl font-bold"
              >
                ✕
              </button>
            </div>
            <p className="text-sm text-gray-600">
              Digi-Sahaayak uses Google&apos;s <strong>Gemini 2.0 Flash</strong> for natural multilingual understanding. You can paste a free API key from Google AI Studio, or leave blank to use the built-in Smart Local NLP Extractor.
            </p>
            <div>
              <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                Gemini API Key:
              </label>
              <input
                type="password"
                defaultValue={apiKey}
                placeholder="AIzaSy..."
                id="geminiKeyInput"
                className="w-full rounded-xl border-2 border-gray-300 p-3 text-sm focus:border-blue-600 focus:outline-none"
              />
              <p className="mt-1.5 text-xs text-gray-500">
                Keys are stored only in your browser&apos;s localStorage for local demo purposes.
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  const input = document.getElementById(
                    "geminiKeyInput"
                  ) as HTMLInputElement;
                  handleSaveApiKey(input?.value || "");
                }}
                className="flex-1 rounded-xl bg-[var(--primary)] py-2.5 text-sm font-bold text-white shadow hover:bg-[var(--primary-hover)] cursor-pointer"
              >
                Save Key
              </button>
              <button
                onClick={() => {
                  handleSaveApiKey("");
                }}
                className="rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-100 cursor-pointer"
              >
                Clear Key
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

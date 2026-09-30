import { NextResponse } from "next/server";
import servicesData from "@/data/services.json";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface FormData {
  serviceId: string;
  serviceName: string;
  name: string;
  age: string;
  address: string;
  phone: string;
  income: string;
  purpose: string;
}

const SERVICES_LIST = servicesData.map((s) => ({
  id: s.id,
  name: s.name,
  documents: s.documents,
}));

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      messages = [],
      currentForm = {},
      language = "en-IN",
      apiKey: clientKey = "",
    } = body as {
      messages: ChatMessage[];
      currentForm: Partial<FormData>;
      language: string;
      apiKey?: string;
    };

    const apiKey = clientKey || process.env.GEMINI_API_KEY;

    // Last user message
    const lastUserMsg =
      [...messages].reverse().find((m) => m.role === "user")?.content || "";

    // 1. If Gemini API key is available, call Gemini 2.0 Flash
    if (apiKey) {
      try {
        const geminiResponse = await callGeminiAPI(
          apiKey,
          messages,
          currentForm,
          language
        );
        if (geminiResponse) {
          return NextResponse.json(geminiResponse);
        }
      } catch (err) {
        console.error("Gemini API call failed, falling back to local NLP:", err);
      }
    }

    // 2. Built-in Smart Local NLP Extractor (Fallback if no key is configured)
    const localResponse = runLocalNLPExtractor(
      lastUserMsg,
      currentForm,
      language
    );
    return NextResponse.json(localResponse);
  } catch (error) {
    console.error("API error in /api/chat:", error);
    return NextResponse.json(
      {
        reply:
          "Namaste! I'm here to help you prepare your government application. Could you please tell me your full name and which certificate or service you need?",
        formData: {},
        isComplete: false,
      },
      { status: 200 }
    );
  }
}

/* ── Call Google Gemini 2.0 Flash REST API ── */
async function callGeminiAPI(
  apiKey: string,
  messages: ChatMessage[],
  currentForm: Partial<FormData>,
  language: string
) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

  const systemInstruction = `
You are "Digi-Sahaayak" (ഡിജി-സഹായക്), an empathetic, polite, elderly-friendly digital assistant for Indian citizens.
Your job is to talk with citizens (in English, Malayalam, Hindi, or Tamil as requested) and help them fill an official government application form.

Available Government Services Catalog:
${SERVICES_LIST.map((s) => `- ${s.name} (id: "${s.id}")`).join("\n")}

Current Extracted Form Data:
${JSON.stringify(currentForm, null, 2)}

Requested Language: ${language}

Your Objectives:
1. Identify the requested government service (from the catalog above, e.g. "income_certificate", "senior_citizen_card", "ration_card", "pan_card", "aadhaar_update", "udid_disability", "ayushman_bharat", etc.).
2. Extract all personal details provided so far:
   - serviceId: matching service ID
   - serviceName: full official service name
   - name: applicant full name
   - age: applicant age in years
   - address: village, town, district, pin code
   - phone: 10-digit mobile number
   - income: annual family income (if applicable)
   - purpose: reason for applying (e.g. "college scholarship", "pension", "bank loan", etc.)
3. In your conversational reply:
   - Be respectful, warm, and clear (especially helpful for senior citizens).
   - If speaking in Malayalam, Hindi, or Tamil, write natural, polite sentences.
   - Acknowledge what was extracted, and gently ask for ONLY the missing mandatory fields.
   - Keep replies concise (2-3 sentences max).
   - Once all essential fields (service, name, age, address, phone) are provided, announce that the application form is complete and ready to download as a verified PDF.

You MUST respond strictly with valid JSON conforming to this schema (do NOT wrap in markdown \`\`\`json code fences):
{
  "reply": "string (conversational response to the user)",
  "formData": {
    "serviceId": "string",
    "serviceName": "string",
    "name": "string",
    "age": "string",
    "address": "string",
    "phone": "string",
    "income": "string",
    "purpose": "string"
  },
  "isComplete": boolean
}
`;

  // Format messages for Gemini API
  const contents = messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  const payload = {
    contents,
    systemInstruction: {
      parts: [{ text: systemInstruction }],
    },
    generationConfig: {
      temperature: 0.2,
      responseMimeType: "application/json",
    },
  };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Gemini API HTTP ${res.status}: ${errorText}`);
  }

  const data = await res.json();
  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawText) return null;

  try {
    const parsed = JSON.parse(rawText.trim());
    return {
      reply: parsed.reply || "I have updated your application form details.",
      formData: { ...currentForm, ...parsed.formData },
      isComplete: Boolean(parsed.isComplete),
      engine: "gemini-2.0-flash",
    };
  } catch (err) {
    console.error("Failed to parse Gemini JSON:", rawText, err);
    return null;
  }
}

/* ── Smart Built-in Rule Extractor (Zero-Dependency Fallback) ── */
function runLocalNLPExtractor(
  text: string,
  prevForm: Partial<FormData>,
  lang: string
) {
  const updated: FormData = {
    serviceId: prevForm.serviceId || "",
    serviceName: prevForm.serviceName || "",
    name: prevForm.name || "",
    age: prevForm.age || "",
    address: prevForm.address || "",
    phone: prevForm.phone || "",
    income: prevForm.income || "",
    purpose: prevForm.purpose || "",
  };

  const lower = text.toLowerCase();

  // 1. Detect Service
  if (!updated.serviceId || lower.includes("certificate") || lower.includes("card")) {
    if (lower.includes("income") || lower.includes("varumaanam") || lower.includes("aay")) {
      updated.serviceId = "income_certificate";
      updated.serviceName = "Income Certificate";
    } else if (lower.includes("senior") || lower.includes("elderly") || lower.includes("old age card") || lower.includes("vayodhik")) {
      updated.serviceId = "senior_citizen_card";
      updated.serviceName = "Senior Citizen Card";
    } else if (lower.includes("pension") || lower.includes("ignaps") || lower.includes("nsap")) {
      updated.serviceId = "old_age_pension";
      updated.serviceName = "Old Age Pension Scheme (IGNOAPS)";
    } else if (lower.includes("ration") || lower.includes("bpl") || lower.includes("nfsa")) {
      updated.serviceId = "ration_card";
      updated.serviceName = "Ration Card (NFSA / BPL / APL)";
    } else if (lower.includes("ayushman") || lower.includes("pmjay") || lower.includes("health card")) {
      updated.serviceId = "ayushman_bharat";
      updated.serviceName = "Ayushman Bharat Health Card (PM-JAY)";
    } else if (lower.includes("pan") || lower.includes("tax")) {
      updated.serviceId = "pan_card";
      updated.serviceName = "PAN Card (New / Correction)";
    } else if (lower.includes("aadhaar") || lower.includes("aadhar")) {
      updated.serviceId = "aadhaar_update";
      updated.serviceName = "Aadhaar Update";
    } else if (lower.includes("disab") || lower.includes("udid") || lower.includes("divyang")) {
      updated.serviceId = "udid_disability";
      updated.serviceName = "Disability Certificate & UDID Card";
    } else if (lower.includes("voter") || lower.includes("election")) {
      updated.serviceId = "voter_id";
      updated.serviceName = "Voter ID Card";
    } else if (lower.includes("caste") || lower.includes("community")) {
      updated.serviceId = "caste_certificate";
      updated.serviceName = "Caste / Community Certificate";
    } else if (lower.includes("legal heir") || lower.includes("varisu")) {
      updated.serviceId = "legal_heir";
      updated.serviceName = "Legal Heir Certificate";
    }
  }

  // 2. Extract Phone Number (10 digit starting with 6, 7, 8, 9)
  const phoneMatch = text.match(/\b[6-9]\d{9}\b/);
  if (phoneMatch) {
    updated.phone = phoneMatch[0];
  }

  // 3. Extract Age
  const ageMatch =
    text.match(/\b(?:age|aged|വയസ്സ്|उम्र|வயது)\s*(?:is|:)?\s*(\d{1,3})\b/i) ||
    text.match(/\b(\d{1,2})\s*(?:years?\s*old|yrs?\s*old|years?|വയസ്സ്)\b/i);
  if (ageMatch && Number(ageMatch[1]) < 120) {
    updated.age = ageMatch[1];
  }

  // 4. Extract Income
  const incomeMatch =
    text.match(/(?:income|earning|salary|வருமானம்|വരുമാനം|आय)\s*(?:is|of|:)?\s*(?:₹|rs\.?)?\s*([0-9.,]+(?:\s*(?:lakhs?|lacs?|crores?|k))?)/i) ||
    text.match(/([0-9.,]+)\s*(?:lakhs?|lacs?)/i);
  if (incomeMatch) {
    updated.income = incomeMatch[0];
  }

  // 5. Extract Name
  const namePatterns = [
    /(?:my name is|i am|name is|പേര്|എന്റെ പേര്|नाम है|பெயர்)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i,
    /(?:myself|this is)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i,
  ];
  for (const pat of namePatterns) {
    const match = text.match(pat);
    if (match && match[1] && match[1].length > 2) {
      updated.name = match[1].trim();
      break;
    }
  }

  // 6. Extract Address / Village / District
  const addressMatch = text.match(
    /(?:living in|staying in|from|residing at|address is|സ്ഥലം|മേൽവിലാസം|स्थान|முகவரி)\s+([^,.]+)/i
  );
  if (addressMatch && addressMatch[1] && addressMatch[1].length > 3) {
    updated.address = addressMatch[1].trim();
  }

  // 7. Purpose
  if (lower.includes("scholarship")) updated.purpose = "Scholarship Application";
  else if (lower.includes("pension")) updated.purpose = "Old Age Pension Benefit";
  else if (lower.includes("college") || lower.includes("school"))
    updated.purpose = "Educational Admission";
  else if (lower.includes("hospital") || lower.includes("medical"))
    updated.purpose = "Medical Treatment Assistance";
  else if (lower.includes("bank") || lower.includes("loan"))
    updated.purpose = "Bank Financial Application";

  // Formulate friendly conversational reply
  let reply = "";
  const missing: string[] = [];
  if (!updated.serviceName) missing.push("which government service or certificate you need");
  if (!updated.name) missing.push("your full name");
  if (!updated.age) missing.push("your age");
  if (!updated.address) missing.push("your address or district");
  if (!updated.phone) missing.push("your 10-digit mobile number");

  const isComplete = missing.length === 0;

  if (lang.startsWith("ml")) {
    // Malayalam responses
    if (isComplete) {
      reply = `നന്ദി ${updated.name}! താങ്കളുടെ ${updated.serviceName} അപേക്ഷാ ഫോറം വിജയകരമായി തയ്യാറായി. വലതുവശത്തെ ബട്ടൺ ഉപയോഗിച്ച് PDF ഡൗൺലോഡ് ചെയ്യാം.`;
    } else {
      const needed = missing.slice(0, 2).join(" കൂടാതെ ");
      reply = `നമസ്കാരം! താങ്കൾ പറഞ്ഞ വിവരങ്ങൾ ഞാൻ രേഖപ്പെടുത്തിയിട്ടുണ്ട്. ഫോം പൂർത്തിയാക്കാൻ ${needed} കൂടി പറഞ്ഞുതരാമോ?`;
    }
  } else if (lang.startsWith("hi")) {
    // Hindi responses
    if (isComplete) {
      reply = `धन्यवाद ${updated.name}! आपका ${updated.serviceName} आवेदन फॉर्म तैयार है। आप दाईं ओर दिए गए बटन से PDF डाउनलोड कर सकते हैं।`;
    } else {
      const needed = missing.slice(0, 2).join(" और ");
      reply = `नमस्ते! मैंने आपकी जानकारी दर्ज कर ली है। फॉर्म पूरा करने के लिए कृपया ${needed} भी बताएं?`;
    }
  } else {
    // English responses
    if (isComplete) {
      reply = `Great job, ${updated.name}! Your official application form for "${updated.serviceName}" is fully prepared. You can review the details on the right and download your PDF now.`;
    } else if (updated.name && updated.serviceName) {
      reply = `Got it, ${updated.name}. I have marked your request for "${updated.serviceName}". Could you please share ${missing.slice(0, 2).join(" and ")}?`;
    } else if (updated.serviceName) {
      reply = `I have selected the "${updated.serviceName}" application. To begin filling, please tell me your full name and age.`;
    } else {
      reply = `Namaste! I am Digi-Sahaayak, your government form assistant. Tell me what certificate or service you need help with (e.g. Income Certificate, Ration Card, Senior Citizen Card), along with your name.`;
    }
  }

  return {
    reply,
    formData: updated,
    isComplete,
    engine: "local-nlp",
  };
}

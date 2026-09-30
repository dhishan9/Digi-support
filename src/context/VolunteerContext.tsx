"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

/* ── Types ── */
export interface VolunteerProfile {
  id: string;
  name: string;
  avatar: string;
  role: string;
  institution: string;
  nssUnit: string;
  hoursCompleted: number;
  targetHours: number;
  activityPoints: number;
  formsAssisted: number;
  rating: number;
  phone: string;
  email: string;
  languages: string[];
}

export interface CitizenHelpRequest {
  id: string;
  citizenName: string;
  age: number;
  location: string;
  phone: string;
  serviceNeeded: string;
  preferredLanguage: string;
  mode: "Phone Call Assistance" | "Doorstep / Panchayat Visit" | "Online Co-Pilot";
  urgency: "High" | "Medium" | "Normal";
  status: "open" | "in_progress" | "completed";
  claimedBy: string | null;
  claimedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  notes: string;
  maskedAadhaar: string;
  consentOtp: string;
}

export interface VolunteerContextType {
  volunteer: VolunteerProfile;
  requests: CitizenHelpRequest[];
  activeAssistRequest: CitizenHelpRequest | null;
  setActiveAssistRequest: (req: CitizenHelpRequest | null) => void;
  claimRequest: (requestId: string) => void;
  releaseRequest: (requestId: string) => void;
  completeRequest: (requestId: string, enteredOtp: string) => { success: boolean; message: string };
  requestHelp: (newRequest: {
    citizenName: string;
    age: number;
    location: string;
    phone: string;
    serviceNeeded: string;
    preferredLanguage: string;
    mode: "Phone Call Assistance" | "Doorstep / Panchayat Visit" | "Online Co-Pilot";
    urgency: "High" | "Medium" | "Normal";
    notes?: string;
  }) => CitizenHelpRequest;
  downloadCertificate: () => Promise<void>;
  resetToDefaults: () => void;
  openCount: number;
}

/* ── Initial Mock Data ── */
const DEFAULT_VOLUNTEER: VolunteerProfile = {
  id: "vol-142-ananya",
  name: "Ananya S",
  avatar: "👩‍🎓",
  role: "NSS Volunteer Cadet",
  institution: "Govt Model Engineering College, Thrikkakara",
  nssUnit: "NSS Unit #142 (APJ Abdul Kalam Technological Univ.)",
  hoursCompleted: 15.0,
  targetHours: 60.0,
  activityPoints: 30,
  formsAssisted: 20,
  rating: 4.9,
  phone: "+91 94471 88220",
  email: "ananya.s@mec.ac.in",
  languages: ["Malayalam", "English", "Tamil"],
};

const DEFAULT_REQUESTS: CitizenHelpRequest[] = [
  {
    id: "req-101",
    citizenName: "Kunjamma Mathew",
    age: 74,
    location: "Angamaly Panchayat, Ernakulam",
    phone: "+91 98460 33412",
    serviceNeeded: "Indira Gandhi National Old Age Pension",
    preferredLanguage: "Malayalam (മലയാളം)",
    mode: "Phone Call Assistance",
    urgency: "High",
    status: "open",
    claimedBy: null,
    claimedAt: null,
    completedAt: null,
    createdAt: "10 mins ago",
    notes: "Living alone, cannot read small text on phone. Has Aadhaar and Ration card ready.",
    maskedAadhaar: "XXXX-XXXX-8921",
    consentOtp: "4921",
  },
  {
    id: "req-102",
    citizenName: "Abdul Khader",
    age: 68,
    location: "North Paravur, Ernakulam",
    phone: "+91 98765 22345",
    serviceNeeded: "Kerala Karunya Arogya Suraksha Padhathi (KASP)",
    preferredLanguage: "Malayalam (മലയാളം)",
    mode: "Online Co-Pilot",
    urgency: "Medium",
    status: "open",
    claimedBy: null,
    claimedAt: null,
    completedAt: null,
    createdAt: "25 mins ago",
    notes: "Requires hospital coverage card enrollment. Son working in UAE, needs help with BPL verification.",
    maskedAadhaar: "XXXX-XXXX-4512",
    consentOtp: "7832",
  },
  {
    id: "req-103",
    citizenName: "Radhakrishnan K",
    age: 68,
    location: "Aluva West, Ernakulam",
    phone: "+91 98765 43210",
    serviceNeeded: "Senior Citizen Concession Card & Welfare Pension",
    preferredLanguage: "Malayalam (മലയാളം)",
    mode: "Phone Call Assistance",
    urgency: "High",
    status: "in_progress",
    claimedBy: "Ananya S",
    claimedAt: "Today, 10:15 AM",
    completedAt: null,
    createdAt: "1 hour ago",
    notes: "Assisted by NSS Cadet Ananya. Draft prepared in Digi-Support AI Assistant.",
    maskedAadhaar: "XXXX-XXXX-3341",
    consentOtp: "6629",
  },
  {
    id: "req-104",
    citizenName: "Meenakshi Amma",
    age: 81,
    location: "Mattancherry, Kochi",
    phone: "+91 94462 11980",
    serviceNeeded: "Widow Pension Mustering & Life Certificate",
    preferredLanguage: "Tamil / Malayalam",
    mode: "Doorstep / Panchayat Visit",
    urgency: "High",
    status: "open",
    claimedBy: null,
    claimedAt: null,
    completedAt: null,
    createdAt: "2 hours ago",
    notes: "Bedridden senior. Needs student volunteer to visit with local Ward Member.",
    maskedAadhaar: "XXXX-XXXX-1980",
    consentOtp: "1154",
  },
  {
    id: "req-105",
    citizenName: "Suresh Babu",
    age: 56,
    location: "Kakkanad, Ernakulam",
    phone: "+91 94470 55432",
    serviceNeeded: "Pre-Matric Scholarship for Daughter (SC/ST)",
    preferredLanguage: "Malayalam / English",
    mode: "Online Co-Pilot",
    urgency: "Normal",
    status: "completed",
    claimedBy: "Ananya S",
    claimedAt: "Yesterday, 3:30 PM",
    completedAt: "Yesterday, 4:15 PM",
    createdAt: "1 day ago",
    notes: "Successfully submitted income certificate and school bonafide certificate. PDF generated.",
    maskedAadhaar: "XXXX-XXXX-9901",
    consentOtp: "9021",
  },
];

const STORAGE_KEY_VOLUNTEER = "digi_volunteer_profile_v1";
const STORAGE_KEY_REQUESTS = "digi_volunteer_requests_v1";

const VolunteerContext = createContext<VolunteerContextType | undefined>(undefined);

export function VolunteerProvider({ children }: { children: React.ReactNode }) {
  const [volunteer, setVolunteer] = useState<VolunteerProfile>(DEFAULT_VOLUNTEER);
  const [requests, setRequests] = useState<CitizenHelpRequest[]>(DEFAULT_REQUESTS);
  const [activeAssistRequest, setActiveAssistRequest] = useState<CitizenHelpRequest | null>(null);

  /* Load stored state from localStorage */
  useEffect(() => {
    try {
      const storedVol = localStorage.getItem(STORAGE_KEY_VOLUNTEER);
      if (storedVol) {
        setVolunteer(JSON.parse(storedVol));
      }
      const storedReq = localStorage.getItem(STORAGE_KEY_REQUESTS);
      if (storedReq) {
        setRequests(JSON.parse(storedReq));
      }
    } catch {
      // Ignore parse errors
    }
  }, []);

  /* Save updates to localStorage */
  const saveVolunteer = (updated: VolunteerProfile) => {
    setVolunteer(updated);
    try {
      localStorage.setItem(STORAGE_KEY_VOLUNTEER, JSON.stringify(updated));
    } catch {
      // Ignore write errors
    }
  };

  const saveRequests = (updated: CitizenHelpRequest[]) => {
    setRequests(updated);
    try {
      localStorage.setItem(STORAGE_KEY_REQUESTS, JSON.stringify(updated));
    } catch {
      // Ignore write errors
    }
  };

  /* Claim a request */
  const claimRequest = (requestId: string) => {
    const updated = requests.map((req) => {
      if (req.id === requestId) {
        return {
          ...req,
          status: "in_progress" as const,
          claimedBy: volunteer.name,
          claimedAt: "Just now",
        };
      }
      return req;
    });
    saveRequests(updated);

    const target = updated.find((r) => r.id === requestId) ?? null;
    setActiveAssistRequest(target);
  };

  /* Release a claimed request back to open pool */
  const releaseRequest = (requestId: string) => {
    const updated = requests.map((req) => {
      if (req.id === requestId) {
        return {
          ...req,
          status: "open" as const,
          claimedBy: null,
          claimedAt: null,
        };
      }
      return req;
    });
    saveRequests(updated);
    if (activeAssistRequest?.id === requestId) {
      setActiveAssistRequest(null);
    }
  };

  /* Complete assistance with Senior's verbal consent OTP */
  const completeRequest = (
    requestId: string,
    enteredOtp: string
  ): { success: boolean; message: string } => {
    const target = requests.find((r) => r.id === requestId);
    if (!target) {
      return { success: false, message: "Request not found" };
    }

    // Verify OTP (accept matching OTP or master demo code "4921" or "0000")
    if (enteredOtp.trim() !== target.consentOtp && enteredOtp.trim() !== "0000" && enteredOtp.trim() !== "4921") {
      return {
        success: false,
        message: `Invalid Consent OTP. Please ask ${target.citizenName} for the 4-digit code sent to their phone (Demo code: ${target.consentOtp}).`,
      };
    }

    const updatedRequests = requests.map((req) => {
      if (req.id === requestId) {
        return {
          ...req,
          status: "completed" as const,
          completedAt: "Just now",
        };
      }
      return req;
    });
    saveRequests(updatedRequests);

    // Credit student with +0.75 hrs (45 minutes) and +2 KTU Activity Points
    const updatedVolunteer: VolunteerProfile = {
      ...volunteer,
      hoursCompleted: Number((volunteer.hoursCompleted + 0.75).toFixed(2)),
      formsAssisted: volunteer.formsAssisted + 1,
      activityPoints: volunteer.activityPoints + 2,
    };
    saveVolunteer(updatedVolunteer);

    if (activeAssistRequest?.id === requestId) {
      const finished = updatedRequests.find((r) => r.id === requestId) ?? null;
      setActiveAssistRequest(finished);
    }

    return {
      success: true,
      message: `Assistance marked complete! +0.75 hours (45 mins) and +2 KTU Activity Points credited to ${volunteer.name}. Dual SMS sent to citizen and family.`,
    };
  };

  /* Citizen requests assistance */
  const requestHelp = (newReqData: {
    citizenName: string;
    age: number;
    location: string;
    phone: string;
    serviceNeeded: string;
    preferredLanguage: string;
    mode: "Phone Call Assistance" | "Doorstep / Panchayat Visit" | "Online Co-Pilot";
    urgency: "High" | "Medium" | "Normal";
    notes?: string;
  }): CitizenHelpRequest => {
    // Generate 4-digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const newReq: CitizenHelpRequest = {
      id: `req-${Date.now().toString().slice(-4)}`,
      citizenName: newReqData.citizenName,
      age: newReqData.age,
      location: newReqData.location,
      phone: newReqData.phone,
      serviceNeeded: newReqData.serviceNeeded,
      preferredLanguage: newReqData.preferredLanguage,
      mode: newReqData.mode,
      urgency: newReqData.urgency,
      status: "open",
      claimedBy: null,
      claimedAt: null,
      completedAt: null,
      createdAt: "Just now",
      notes: newReqData.notes || "Requested via Digi-Support Citizen Assistance Desk.",
      maskedAadhaar: `XXXX-XXXX-${Math.floor(1000 + Math.random() * 9000)}`,
      consentOtp: otp,
    };

    const updated = [newReq, ...requests];
    saveRequests(updated);
    return newReq;
  };

  /* Generate Verified Digital NSS Certificate PDF */
  const downloadCertificate = async () => {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // ── Outer Ornamental Border ──
    doc.setDrawColor(30, 64, 175); // Royal Blue
    doc.setLineWidth(2);
    doc.rect(8, 8, pageWidth - 16, pageHeight - 16);

    doc.setDrawColor(217, 119, 6); // Gold Inner Border
    doc.setLineWidth(0.8);
    doc.rect(12, 12, pageWidth - 24, pageHeight - 24);

    // ── Header Emblems & Organization ──
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(180, 83, 9); // Gold-amber
    doc.text("NATIONAL SERVICE SCHEME (NSS) • GOVT. OF KERALA TIE-UP", pageWidth / 2, 22, { align: "center" });

    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 58, 138); // Deep Navy
    doc.text("CERTIFICATE OF DIGITAL SOCIAL SERVICE", pageWidth / 2, 34, { align: "center" });

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    doc.text("DIGI-MITRA VOLUNTEER ASSISTANCE PROGRAM FOR SENIOR CITIZENS", pageWidth / 2, 42, { align: "center" });

    // Decorative horizontal rule
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.5);
    doc.line(40, 47, pageWidth - 40, 47);

    // ── Body Statement ──
    doc.setFontSize(12);
    doc.setTextColor(51, 65, 85);
    doc.text("This is to formally certify that", pageWidth / 2, 57, { align: "center" });

    // Student Name in bold royal font
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 64, 175);
    doc.text(volunteer.name.toUpperCase(), pageWidth / 2, 70, { align: "center" });

    // College & Unit Details
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(71, 85, 105);
    doc.text(
      `Cadet / Volunteer of ${volunteer.institution}`,
      pageWidth / 2,
      79,
      { align: "center" }
    );
    doc.text(
      `Affiliated to: ${volunteer.nssUnit}`,
      pageWidth / 2,
      86,
      { align: "center" }
    );

    // Achievement text
    doc.setFontSize(11);
    doc.setTextColor(51, 65, 85);
    const bodyParagraph =
      `has successfully served as a verified Digi-Mitra Volunteer, providing direct human assistance ` +
      `in digital literacy, accessibility navigation, and official welfare scheme registrations ` +
      `for senior citizens and marginalized households across Kerala.`;
    doc.text(bodyParagraph, pageWidth / 2, 98, { align: "center", maxWidth: 220 });

    // ── Highlight Metrics Box ──
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(35, 110, pageWidth - 70, 28, 3, 3, "FD");

    // Column 1: Service Hours
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 64, 175);
    doc.text(`${volunteer.hoursCompleted} Hours`, 70, 122, { align: "center" });
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    doc.text("Verified Community Service", 70, 130, { align: "center" });

    // Column 2: Citizens Assisted
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(16, 185, 129); // Green
    doc.text(`${volunteer.formsAssisted} Citizens`, pageWidth / 2, 122, { align: "center" });
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    doc.text("Direct Forms Registered", pageWidth / 2, 130, { align: "center" });

    // Column 3: KTU / AICTE Points
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(217, 119, 6); // Amber
    doc.text(`${volunteer.activityPoints} Points`, pageWidth - 70, 122, { align: "center" });
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    doc.text("KTU / UGC Activity Credits", pageWidth - 70, 130, { align: "center" });

    // ── Signatures & Stamp ──
    const sigY = 160;

    // Left Signature
    doc.setDrawColor(100, 116, 139);
    doc.line(35, sigY, 95, sigY);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 41, 59);
    doc.text("Dr. V. Unnikrishnan", 65, sigY + 5, { align: "center" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text("NSS Programme Officer (Unit #142)", 65, sigY + 10, { align: "center" });

    // Center Official Digital Seal
    doc.setDrawColor(30, 64, 175);
    doc.circle(pageWidth / 2, sigY - 2, 14);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 64, 175);
    doc.text("VERIFIED", pageWidth / 2, sigY - 4, { align: "center" });
    doc.text("NSS SEVA", pageWidth / 2, sigY, { align: "center" });
    doc.text("★ KERALA ★", pageWidth / 2, sigY + 4, { align: "center" });

    // Right Signature
    doc.line(pageWidth - 95, sigY, pageWidth - 35, sigY);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 41, 59);
    doc.text("State Technical Lead", pageWidth - 65, sigY + 5, { align: "center" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text("Digi-Support Initiative", pageWidth - 65, sigY + 10, { align: "center" });

    // ── Footer Certificate ID & Timestamp ──
    const today = new Date().toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Certificate Ref: NSS-DIGI-2026-88192 • Date of Issue: ${today} • Scan QR for blockchain verification`,
      pageWidth / 2,
      pageHeight - 16,
      { align: "center" }
    );

    doc.save(`NSS_DigiMitra_Certificate_${volunteer.name.replace(/\s+/g, "_")}.pdf`);
  };

  /* Reset helper */
  const resetToDefaults = () => {
    saveVolunteer(DEFAULT_VOLUNTEER);
    saveRequests(DEFAULT_REQUESTS);
    setActiveAssistRequest(null);
  };

  const openCount = requests.filter((r) => r.status === "open").length;

  return (
    <VolunteerContext.Provider
      value={{
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
        openCount,
      }}
    >
      {children}
    </VolunteerContext.Provider>
  );
}

export function useVolunteer() {
  const context = useContext(VolunteerContext);
  if (!context) {
    throw new Error("useVolunteer must be used within a VolunteerProvider");
  }
  return context;
}

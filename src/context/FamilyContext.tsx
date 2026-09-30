"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface FamilyMember {
  id: string;
  name: string;
  relation: "Father" | "Mother" | "Grandfather" | "Grandmother" | "Spouse" | "Child" | "Self";
  avatar: string;
  age: number;
  phone: string;
  address: string;
  aadhaarLast4: string;
  income: string;
  category: string;
  activeApplications: Array<{
    serviceName: string;
    date: string;
    status: "Drafted" | "Submitted" | "Approved";
  }>;
}

export interface HelperAccount {
  name: string;
  role: string;
  phone: string;
  email: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  channel: "SMS & WhatsApp" | "WhatsApp" | "SMS";
  recipients: Array<{
    name: string;
    phone: string;
    role: string;
  }>;
  read: boolean;
}

interface FamilyContextType {
  helper: HelperAccount;
  members: FamilyMember[];
  activeMember: FamilyMember;
  notifications: NotificationItem[];
  unreadCount: number;
  setActiveMemberId: (id: string) => void;
  addMember: (member: Omit<FamilyMember, "id" | "activeApplications">) => void;
  addDualNotification: (
    title: string,
    message: string,
    targetMember?: FamilyMember
  ) => void;
  markAllAsRead: () => void;
}

const DEFAULT_HELPER: HelperAccount = {
  name: "Arun Kumar",
  role: "Son / Primary Helper",
  phone: "+91 98450 11223",
  email: "arun.kumar@gmail.com",
};

const DEFAULT_MEMBERS: FamilyMember[] = [
  {
    id: "father-1",
    name: "Radhakrishnan K",
    relation: "Father",
    avatar: "👴",
    age: 68,
    phone: "+91 98765 43210",
    address: "House No 42, Temple Road, Aluva, Ernakulam, PIN 683101",
    aadhaarLast4: "4512",
    income: "₹1,20,000",
    category: "General",
    activeApplications: [
      {
        serviceName: "Senior Citizen Card",
        date: "28 Sep 2026",
        status: "Approved",
      },
      {
        serviceName: "Old Age Pension (IGNOAPS)",
        date: "Today",
        status: "Drafted",
      },
    ],
  },
  {
    id: "mother-1",
    name: "Saraswathy Amma",
    relation: "Mother",
    avatar: "👵",
    age: 64,
    phone: "+91 98765 88990",
    address: "House No 42, Temple Road, Aluva, Ernakulam, PIN 683101",
    aadhaarLast4: "8921",
    income: "₹1,20,000",
    category: "General",
    activeApplications: [
      {
        serviceName: "Ayushman Bharat Health Card",
        date: "25 Sep 2026",
        status: "Submitted",
      },
    ],
  },
  {
    id: "self-1",
    name: "Arun Kumar",
    relation: "Self",
    avatar: "👨",
    age: 28,
    phone: "+91 98450 11223",
    address: "House No 42, Temple Road, Aluva, Ernakulam, PIN 683101",
    aadhaarLast4: "1190",
    income: "₹4,80,000",
    category: "General",
    activeApplications: [],
  },
];

const DEFAULT_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif-1",
    title: "Old Age Pension Application Drafted",
    message:
      "Application prepared for Radhakrishnan (Father). Verification checklist has been dispatched to both phones.",
    timestamp: "10 mins ago",
    channel: "SMS & WhatsApp",
    recipients: [
      { name: "Radhakrishnan K", phone: "+91 98765 43210", role: "Father (Applicant)" },
      { name: "Arun Kumar", phone: "+91 98450 11223", role: "Helper (Son)" },
    ],
    read: false,
  },
  {
    id: "notif-2",
    title: "Senior Citizen Card Approved ✅",
    message:
      "State Social Welfare dept approved Senior Citizen ID for Radhakrishnan K. Card ready for digital download.",
    timestamp: "Yesterday",
    channel: "SMS & WhatsApp",
    recipients: [
      { name: "Radhakrishnan K", phone: "+91 98765 43210", role: "Father (Applicant)" },
      { name: "Arun Kumar", phone: "+91 98450 11223", role: "Helper (Son)" },
    ],
    read: false,
  },
  {
    id: "notif-3",
    title: "Ayushman Bharat e-KYC Reminder",
    message:
      "Biometric e-KYC pending for Saraswathy Amma (Mother) at nearest Akshaya / CSC centre.",
    timestamp: "3 days ago",
    channel: "SMS & WhatsApp",
    recipients: [
      { name: "Saraswathy Amma", phone: "+91 98765 88990", role: "Mother (Applicant)" },
      { name: "Arun Kumar", phone: "+91 98450 11223", role: "Helper (Son)" },
    ],
    read: true,
  },
];

const FamilyContext = createContext<FamilyContextType | undefined>(undefined);

export function FamilyProvider({ children }: { children: React.ReactNode }) {
  const [helper] = useState<HelperAccount>(DEFAULT_HELPER);
  const [members, setMembers] = useState<FamilyMember[]>(DEFAULT_MEMBERS);
  const [activeMemberId, setActiveMemberId] = useState<string>("father-1");
  const [notifications, setNotifications] =
    useState<NotificationItem[]>(DEFAULT_NOTIFICATIONS);

  /* Load stored family members from localStorage if available */
  useEffect(() => {
    try {
      const savedMembers = localStorage.getItem("digi-family-members");
      if (savedMembers) setMembers(JSON.parse(savedMembers));

      const savedActive = localStorage.getItem("digi-active-member-id");
      if (savedActive) setActiveMemberId(savedActive);

      const savedNotifs = localStorage.getItem("digi-family-notifications");
      if (savedNotifs) setNotifications(JSON.parse(savedNotifs));
    } catch (e) {
      console.warn("Could not load family data from localStorage:", e);
    }
  }, []);

  /* Save state changes */
  const updateMembers = (newMembers: FamilyMember[]) => {
    setMembers(newMembers);
    try {
      localStorage.setItem("digi-family-members", JSON.stringify(newMembers));
    } catch {}
  };

  const handleSetActiveMemberId = (id: string) => {
    setActiveMemberId(id);
    try {
      localStorage.setItem("digi-active-member-id", id);
    } catch {}
  };

  const updateNotifications = (newNotifs: NotificationItem[]) => {
    setNotifications(newNotifs);
    try {
      localStorage.setItem("digi-family-notifications", JSON.stringify(newNotifs));
    } catch {}
  };

  /* Add new family member */
  const addMember = (
    memberData: Omit<FamilyMember, "id" | "activeApplications">
  ) => {
    const newMember: FamilyMember = {
      ...memberData,
      id: `member-${Date.now()}`,
      activeApplications: [],
    };
    const updated = [...members, newMember];
    updateMembers(updated);
    handleSetActiveMemberId(newMember.id);

    // Trigger welcoming dual-alert
    addDualNotification(
      `New Profile Added: ${newMember.name} (${newMember.relation})`,
      `Profile created by ${helper.name}. Helper Mode linked for automated alerts & applications.`,
      newMember
    );
  };

  /* Add a dual notification sent to both Parent and Helper */
  const addDualNotification = (
    title: string,
    message: string,
    targetMember?: FamilyMember
  ) => {
    const target =
      targetMember ||
      members.find((m) => m.id === activeMemberId) ||
      members[0];

    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title,
      message,
      timestamp: "Just now",
      channel: "SMS & WhatsApp",
      recipients: [
        {
          name: target.name,
          phone: target.phone,
          role: `${target.relation} (Applicant)`,
        },
        {
          name: helper.name,
          phone: helper.phone,
          role: helper.role,
        },
      ],
      read: false,
    };

    const updated = [newNotif, ...notifications];
    updateNotifications(updated);
  };

  const markAllAsRead = () => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    updateNotifications(updated);
  };

  const activeMember =
    members.find((m) => m.id === activeMemberId) || members[0];
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <FamilyContext.Provider
      value={{
        helper,
        members,
        activeMember,
        notifications,
        unreadCount,
        setActiveMemberId: handleSetActiveMemberId,
        addMember,
        addDualNotification,
        markAllAsRead,
      }}
    >
      {children}
    </FamilyContext.Provider>
  );
}

export function useFamily() {
  const context = useContext(FamilyContext);
  if (!context) {
    throw new Error("useFamily must be used within a FamilyProvider");
  }
  return context;
}

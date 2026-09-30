import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { FamilyProvider } from "@/context/FamilyContext";
import { VolunteerProvider } from "@/context/VolunteerContext";

export const metadata: Metadata = {
  title: "Digi‑Support — Digital Services & Family Helper Mode",
  description:
    "Helping citizens and senior citizens navigate government services, scholarships, and forms with Family Helper Mode and Voice AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <FamilyProvider>
          <VolunteerProvider>
            <Navbar />
            <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
            <footer className="border-t border-[var(--border)] py-6 text-center text-sm text-gray-500">
              Built with ❤️ for Digi‑Support Hackathon • Family Helper & NSS Digi‑Mitra Mode
            </footer>
          </VolunteerProvider>
        </FamilyProvider>
      </body>
    </html>
  );
}

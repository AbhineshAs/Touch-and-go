import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import QueryProvider from "@/lib/query/QueryProvider";
import { AuthProvider } from "@/lib/auth/AuthContext";
import { CandidateProvider } from "@/lib/candidate/context/CandidateContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TAG — Touch And Go | AI-Assisted Recruitment Marketplace",
  description:
    "Connecting verified talent with high-growth employers through structured candidate profiles, job discovery, and explainable criteria matching.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-text-primary">
        <QueryProvider>
          <AuthProvider>
            <CandidateProvider>{children}</CandidateProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}

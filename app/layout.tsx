import type { Metadata } from "next";
import { Inter, Space_Mono } from "next/font/google";
import AuthHashRedirect from "@/components/AuthHashRedirect";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  weight: ["400", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Nocturne Ticketing — Vendre des tickets, sans la friction",
  description:
    "Ticketing moderne pour collectifs événementiels. 0.50€ par ticket, support IA 24/7, check-in QR.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${inter.variable} ${spaceMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-nocturne-black text-nocturne-text font-sans">
        <AuthHashRedirect />
        {children}
      </body>
    </html>
  );
}

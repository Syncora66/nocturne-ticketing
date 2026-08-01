import type { Metadata } from "next";
import { Inter, Space_Mono, Michroma, Exo_2 } from "next/font/google";
import AuthHashRedirect from "@/components/AuthHashRedirect";
import CustomCursor from "@/components/CustomCursor";
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

// Brand display/body pairing (matches Logo/tickmoon-logo-fixed.svg.svg),
// used for the video-background "Comment ça marche" section.
const michroma = Michroma({
  variable: "--font-michroma",
  weight: "400",
  subsets: ["latin"],
});

const exo2 = Exo_2({
  variable: "--font-exo2",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Nocturne Ticketing — Vendre des tickets, sans la friction",
  description:
    "Ticketing moderne pour collectifs événementiels. 1.50€ par ticket, support IA 24/7, check-in QR.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${inter.variable} ${spaceMono.variable} ${michroma.variable} ${exo2.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-nocturne-black text-nocturne-text font-sans">
        <AuthHashRedirect />
        <CustomCursor />
        {children}
      </body>
    </html>
  );
}

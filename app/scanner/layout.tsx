import type { Metadata, Viewport } from "next";
import ServiceWorkerRegister from "@/components/scanner/ServiceWorkerRegister";

export const metadata: Metadata = {
  title: "Scanner — Tick8t",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
};

export default function ScannerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <ServiceWorkerRegister />
      {children}
    </>
  );
}

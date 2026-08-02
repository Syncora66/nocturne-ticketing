"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";

const columns = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "#features" },
      { label: "Pricing", href: "#pricing" },
      { label: "Docs", href: "#" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "À propos", href: "#" },
      { label: "Contact", href: "#" },
      { label: "Twitter", href: "#" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "CGU", href: "#" },
      { label: "Confidentialité", href: "#" },
      { label: "Mentions légales", href: "#" },
    ],
  },
];

export default function Footer() {
  const footerRef = useRef<HTMLElement>(null);
  const colRefs = useRef<(HTMLDivElement | null)[]>([]);

  useGSAP(
    () => {
      gsap.set(colRefs.current, { opacity: 0, y: 20 });
      gsap.to(colRefs.current, {
        opacity: 1,
        y: 0,
        duration: 0.5,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: { trigger: footerRef.current, start: "top 85%" },
      });
    },
    { scope: footerRef },
  );

  return (
    <footer
      ref={footerRef}
      className="bg-nocturne-black px-6 py-16 sm:px-10 lg:px-16"
    >
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-[1.5fr_repeat(3,1fr)]">
          <div
            ref={(el) => {
              colRefs.current[0] = el;
            }}
          >
            <span className="font-display text-xl text-tick8t-white">
              TICK8T
            </span>
            <p className="subtitle-accent mt-3 max-w-xs text-left">
              Billetterie autonome et support IA 24/7 pour les collectifs
              événementiels.
            </p>
          </div>

          {columns.map((column, i) => (
            <div
              key={column.title}
              ref={(el) => {
                colRefs.current[i + 1] = el;
              }}
            >
              <h3 className="font-mono text-xs font-bold tracking-widest text-tick8t-cyan">
                {column.title.toUpperCase()}
              </h3>
              <ul className="mt-4 space-y-3">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="font-exo text-sm text-tick8t-secondary transition-colors hover:text-nocturne-white"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 border-t border-nocturne-gray-dark pt-8">
          <span className="font-exo text-xs text-tick8t-secondary/80">
            © {new Date().getFullYear()} Tick8t. Tous droits réservés.
          </span>
        </div>
      </div>
    </footer>
  );
}

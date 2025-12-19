"use client";

import { useState } from "react";
import Link from "next/link";
import ApiKeysModal from "./ApiKeysModal";

const navItems = [
  { label: "Image", href: "/image" },
  { label: "Video", href: "/video" },
  { label: "Workflow", href: "/workflow" },
  { label: "Characters", href: "/create-character" },
  { label: "Products", href: "/products" },
  { label: "Prompts", href: "/prompts" },
];

const ExternalLinkIcon = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
    <path
      d="M9 6.5V9.5C9 9.77614 8.77614 10 8.5 10H2.5C2.22386 10 2 9.77614 2 9.5V3.5C2 3.22386 2.22386 3 2.5 3H5.5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M7 2H10V5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M10 2L5.5 6.5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default function Header() {
  const [isApiKeysModalOpen, setIsApiKeysModalOpen] = useState(false);

  return (
    <>
      <header className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-8">
          <Link href="/" className="font-heading gradient-shift text-xl">
            Content Cat
          </Link>
          <nav className="flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="text-base font-semibold text-gray-300 transition-colors duration-300 hover:text-cyan-400"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Right side - API Keys & Top Up */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsApiKeysModalOpen(true)}
            className="text-base font-semibold text-gray-300 transition-colors duration-300 hover:text-cyan-400"
          >
            API Keys
          </button>
          <a
            href="https://fal.ai/dashboard/billing"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-black transition-colors hover:bg-cyan-400"
          >
            Top Up
            <ExternalLinkIcon />
          </a>
        </div>
      </header>

      <ApiKeysModal
        isOpen={isApiKeysModalOpen}
        onClose={() => setIsApiKeysModalOpen(false)}
      />
    </>
  );
}

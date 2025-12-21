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

const FolderIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path
      d="M14 5H2C1.44772 5 1 5.44772 1 6V12C1 12.5523 1.44772 13 2 13H14C14.5523 13 15 12.5523 15 12V6C15 5.44772 14.5523 5 14 5Z"
      fill="currentColor"
      fillOpacity="0.2"
    />
    <path
      d="M1 6V4C1 3.44772 1.44772 3 2 3H5.5L7.5 5H14C14.5523 5 15 5.44772 15 6V12C15 12.5523 14.5523 13 14 13H2C1.44772 13 1 12.5523 1 12V6Z"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

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
                className="text-base font-semibold text-white transition-colors duration-150 hover:text-pink-400"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/assets"
              className="hidden md:grid grid-flow-col items-center justify-center gap-1 pl-2 pr-3 py-1.5 rounded-lg border border-white/10 bg-white/5 backdrop-blur-sm text-white transition-all hover:bg-white/10 hover:border-white/20"
            >
              <div className="grid items-center justify-center size-6">
                <FolderIcon />
              </div>
              <span className="text-sm font-medium">Asset library</span>
            </Link>
          </nav>
        </div>

        {/* Right side - API Keys & Top Up */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsApiKeysModalOpen(true)}
            className="text-base font-semibold text-white transition-colors duration-150 hover:text-pink-400"
          >
            API Keys
          </button>
          <a
            href="https://fal.ai/dashboard/billing"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary-sm"
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

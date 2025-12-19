"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Icons - 24x24 to match reference design
const LogoIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="white"
    strokeWidth="2"
  >
    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
  </svg>
);

const ImageIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <rect
      x="3"
      y="3"
      width="18"
      height="18"
      rx="2"
      stroke="currentColor"
      strokeWidth="1.125"
    />
    <circle
      cx="8.5"
      cy="8.5"
      r="1.5"
      stroke="currentColor"
      strokeWidth="1.125"
    />
    <path
      d="M5.31 20.25L15.59 9.97C15.73 9.83 15.93 9.75 16.13 9.75C16.33 9.75 16.52 9.83 16.66 9.97L20.25 13.56"
      stroke="currentColor"
      strokeWidth="1.125"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const VideoIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <rect
      x="2.5"
      y="4.5"
      width="19"
      height="15"
      rx="2"
      stroke="currentColor"
      strokeWidth="1.125"
    />
    <path
      d="M10 8.5L15 12L10 15.5V8.5Z"
      stroke="currentColor"
      strokeWidth="1.125"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const WorkflowIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <rect
      x="2.25"
      y="6.75"
      width="19.5"
      height="12"
      rx="0.75"
      stroke="currentColor"
      strokeWidth="1.125"
    />
    <path d="M2.25 11.25H21.75" stroke="currentColor" strokeWidth="1.125" />
    <path
      d="M6.75 9.75V12.75"
      stroke="currentColor"
      strokeWidth="1.125"
      strokeLinecap="round"
    />
    <path
      d="M17.25 9.75V12.75"
      stroke="currentColor"
      strokeWidth="1.125"
      strokeLinecap="round"
    />
    <path
      d="M15.75 6.75V5.25C15.75 4.85 15.59 4.47 15.31 4.19C15.03 3.91 14.65 3.75 14.25 3.75H9.75C9.35 3.75 8.97 3.91 8.69 4.19C8.41 4.47 8.25 4.85 8.25 5.25V6.75"
      stroke="currentColor"
      strokeWidth="1.125"
      strokeLinecap="round"
    />
  </svg>
);

const CharactersIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <circle
      cx="12"
      cy="7.5"
      r="4.5"
      stroke="currentColor"
      strokeWidth="1.125"
    />
    <path
      d="M3.75 21V19.5C3.75 17.43 5.43 15.75 7.5 15.75H16.5C18.57 15.75 20.25 17.43 20.25 19.5V21"
      stroke="currentColor"
      strokeWidth="1.125"
      strokeLinecap="round"
    />
  </svg>
);

const ProductsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path
      d="M21 7.5L12 2.25L3 7.5V16.5L12 21.75L21 16.5V7.5Z"
      stroke="currentColor"
      strokeWidth="1.125"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M12 12V21.75" stroke="currentColor" strokeWidth="1.125" />
    <path d="M21 7.5L12 12L3 7.5" stroke="currentColor" strokeWidth="1.125" />
  </svg>
);

const PromptsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path
      d="M7.9 16.1L2.74 14.2C2.59 14.14 2.47 14.05 2.38 13.92C2.3 13.8 2.25 13.65 2.25 13.5C2.25 13.35 2.3 13.2 2.38 13.08C2.47 12.95 2.59 12.86 2.74 12.8L7.9 10.9L9.8 5.74C9.86 5.59 9.95 5.47 10.08 5.38C10.2 5.3 10.35 5.25 10.5 5.25C10.65 5.25 10.8 5.3 10.92 5.38C11.05 5.47 11.14 5.59 11.2 5.74L13.1 10.9L18.26 12.8C18.41 12.86 18.53 12.95 18.62 13.08C18.7 13.2 18.75 13.35 18.75 13.5C18.75 13.65 18.7 13.8 18.62 13.92C18.53 14.05 18.41 14.14 18.26 14.2L13.1 16.1L11.2 21.26C11.14 21.41 11.05 21.53 10.92 21.62C10.8 21.7 10.65 21.75 10.5 21.75C10.35 21.75 10.2 21.7 10.08 21.62C9.95 21.53 9.86 21.41 9.8 21.26L7.9 16.1Z"
      stroke="currentColor"
      strokeWidth="1.125"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M16.5 1.5V6"
      stroke="currentColor"
      strokeWidth="1.125"
      strokeLinecap="round"
    />
    <path
      d="M21 6.75V9.75"
      stroke="currentColor"
      strokeWidth="1.125"
      strokeLinecap="round"
    />
    <path
      d="M14.25 3.75H18.75"
      stroke="currentColor"
      strokeWidth="1.125"
      strokeLinecap="round"
    />
    <path
      d="M19.5 8.25H22.5"
      stroke="currentColor"
      strokeWidth="1.125"
      strokeLinecap="round"
    />
  </svg>
);

const HomeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path
      d="M3 9.75L12 3L21 9.75V19.5C21 19.9 20.84 20.28 20.56 20.56C20.28 20.84 19.9 21 19.5 21H4.5C4.1 21 3.72 20.84 3.44 20.56C3.16 20.28 3 19.9 3 19.5V9.75Z"
      stroke="currentColor"
      strokeWidth="1.125"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M9 21V12H15V21"
      stroke="currentColor"
      strokeWidth="1.125"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const CreditsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path
      d="M12 2V6M12 18V22M6 12H2M22 12H18M19.07 19.07L16.24 16.24M19.07 4.93L16.24 7.76M4.93 19.07L7.76 16.24M4.93 4.93L7.76 7.76"
      stroke="currentColor"
      strokeWidth="1.125"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

interface ToolbarItem {
  id: string;
  label: string;
  href: string;
  icon: React.ReactNode;
}

const toolbarItems: ToolbarItem[] = [
  { id: "home", label: "Home", href: "/", icon: <HomeIcon /> },
  { id: "image", label: "Image", href: "/image", icon: <ImageIcon /> },
  { id: "video", label: "Video", href: "/video", icon: <VideoIcon /> },
  {
    id: "workflow",
    label: "Workflow",
    href: "/workflow",
    icon: <WorkflowIcon />,
  },
  {
    id: "characters",
    label: "Characters",
    href: "/create-character",
    icon: <CharactersIcon />,
  },
  {
    id: "products",
    label: "Products",
    href: "/products",
    icon: <ProductsIcon />,
  },
  { id: "prompts", label: "Prompts", href: "/prompts", icon: <PromptsIcon /> },
];

export default function WorkflowToolbar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-14 flex-col border-r border-zinc-800 bg-zinc-900">
      {/* Logo Section */}
      <div className="flex flex-col items-center py-4">
        <Link
          href="/"
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400 to-cyan-600 transition-transform hover:scale-105"
        >
          <LogoIcon />
        </Link>
      </div>

      {/* Divider */}
      <div className="mx-2 border-t border-zinc-800" />

      {/* Navigation Icons */}
      <nav className="flex flex-1 flex-col items-center gap-2 py-3">
        {toolbarItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.id}
              href={item.href}
              className={`group relative flex h-9 w-9 items-center justify-center rounded-lg transition-colors ${
                isActive
                  ? "bg-cyan-400/15 text-cyan-400"
                  : "text-gray-500 hover:bg-zinc-800 hover:text-white"
              }`}
            >
              {item.icon}
              {/* Active indicator bar */}
              {isActive && (
                <span className="absolute left-0 h-6 w-0.5 rounded-r-full bg-cyan-400" />
              )}
              {/* Tooltip */}
              <span className="pointer-events-none absolute left-14 z-50 rounded-lg bg-zinc-800 px-3 py-2 text-sm whitespace-nowrap text-white opacity-0 shadow-xl transition-opacity group-hover:opacity-100">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Divider */}
      <div className="mx-2 border-t border-zinc-800" />

      {/* Bottom Section */}
      <div className="flex flex-col items-center py-3">
        <a
          href="https://fal.ai/dashboard/billing"
          target="_blank"
          rel="noopener noreferrer"
          className="group relative flex h-10 w-10 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-zinc-800 hover:text-cyan-400"
        >
          <CreditsIcon />
          <span className="pointer-events-none absolute left-14 z-50 rounded-lg bg-zinc-800 px-3 py-2 text-sm whitespace-nowrap text-white opacity-0 shadow-xl transition-opacity group-hover:opacity-100">
            Top Up Credits
          </span>
        </a>
      </div>
    </aside>
  );
}

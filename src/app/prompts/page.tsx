"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { prompts, type Prompt, type PromptCategory } from "@/lib/prompts";

function PromptsIcon() {
  return (
    <svg
      className="mb-4 size-6 text-white sm:mb-6 sm:size-7"
      aria-hidden="true"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M3 4.75C3 3.7835 3.7835 3 4.75 3H9.25C10.2165 3 11 3.7835 11 4.75V9.25C11 10.2165 10.2165 11 9.25 11H4.75C3.7835 11 3 10.2165 3 9.25V4.75Z"
        fill="currentColor"
      />
      <path
        d="M3 14.75C3 13.7835 3.7835 13 4.75 13H9.25C10.2165 13 11 13.7835 11 14.75V19.25C11 20.2165 10.2165 21 9.25 21H4.75C3.7835 21 3 20.2165 3 19.25V14.75Z"
        fill="currentColor"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M17 13C14.7909 13 13 14.7909 13 17C13 19.2091 14.7909 21 17 21C19.2091 21 21 19.2091 21 17C21 14.7909 19.2091 13 17 13ZM14.5 17C14.5 15.6193 15.6193 14.5 17 14.5C18.3807 14.5 19.5 15.6193 19.5 17C19.5 18.3807 18.3807 19.5 17 19.5C15.6193 19.5 14.5 18.3807 14.5 17Z"
        fill="currentColor"
      />
      <path
        d="M14.75 3C13.7835 3 13 3.7835 13 4.75V9.25C13 10.2165 13.7835 11 14.75 11H19.25C20.2165 11 21 10.2165 21 9.25V4.75C21 3.7835 20.2165 3 19.25 3H14.75Z"
        fill="currentColor"
      />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      className="size-5 shrink-0 text-gray-500"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M9.16634 3.83203C6.22082 3.83203 3.83301 6.21985 3.83301 9.16536C3.83301 12.1109 6.22082 14.4987 9.16634 14.4987C12.1119 14.4987 14.4997 12.1109 14.4997 9.16536C14.4997 6.21985 12.1119 3.83203 9.16634 3.83203ZM2.83301 9.16536C2.83301 5.66756 5.66854 2.83203 9.16634 2.83203C12.6641 2.83203 15.4997 5.66756 15.4997 9.16536C15.4997 10.7343 14.9292 12.17 13.9843 13.2763L18.2699 17.5618C18.4652 17.7571 18.4652 18.0737 18.2699 18.2689C18.0746 18.4642 17.758 18.4642 17.5628 18.2689L13.2772 13.9834C12.1709 14.9282 10.7353 15.4987 9.16634 15.4987C5.66854 15.4987 2.83301 12.6632 2.83301 9.16536Z"
        fill="currentColor"
      />
    </svg>
  );
}

interface Category {
  label: string;
  value: PromptCategory | "all";
}

const categories: Category[] = [
  { label: "All", value: "all" },
  { label: "Portrait", value: "portrait" },
  { label: "Realistic", value: "realistic" },
  { label: "Profile Photo", value: "profile" },
  { label: "Filters", value: "filters" },
  { label: "Enhanced", value: "enhanced" },
  { label: "Product", value: "product" },
];

function SearchInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="w-full lg:w-[280px]">
      <label className="relative flex h-11 w-full items-center gap-2 rounded-xl border border-transparent bg-[rgba(255,255,255,0.04)] px-3 py-3 transition-colors focus-within:border-white/20 focus-within:bg-white/10 sm:max-w-[320px]">
        <SearchIcon />
        <input
          type="text"
          placeholder="Search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-transparent text-sm text-white outline-none placeholder:text-gray-500"
        />
      </label>
    </div>
  );
}

function CategoryTabs({
  activeCategory,
  onCategoryChange,
}: {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}) {
  return (
    <div className="hide-scrollbar flex gap-1 overflow-x-auto rounded-xl bg-white/5 p-1">
      {categories.map((category) => (
        <button
          key={category.value}
          onClick={() => onCategoryChange(category.value)}
          className={`rounded-lg px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
            activeCategory === category.value
              ? "bg-zinc-700 text-white"
              : "text-gray-400 hover:text-white"
          }`}
        >
          {category.label}
        </button>
      ))}
    </div>
  );
}

function CopyIcon({ className }: { className?: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      className={className}
    >
      <rect
        x="9"
        y="9"
        width="13"
        height="13"
        rx="2"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M5 15H4C2.89543 15 2 14.1046 2 13V4C2 2.89543 2.89543 2 4 2H13C14.1046 2 15 2.89543 15 4V5"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      className={className}
    >
      <path
        d="M5 13L9 17L19 7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PromptCardComponent({ prompt }: { prompt: Prompt }) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  const handleUsePrompt = () => {
    const encodedPrompt = encodeURIComponent(prompt.prompt);
    router.push(`/image?prompt=${encodedPrompt}`);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(prompt.prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="group flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/50 transition-all duration-200 hover:border-zinc-700 hover:bg-zinc-800/50">
      <div className="relative aspect-square overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={prompt.image}
          alt={prompt.title}
          className="h-full w-full object-cover"
        />
      </div>
      <div className="flex flex-1 flex-col justify-between gap-4 p-4">
        <div className="flex flex-col gap-1">
          <h3 className="text-base font-semibold text-white">{prompt.title}</h3>
          <p className="line-clamp-2 text-sm text-gray-400">
            {prompt.description}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleUsePrompt}
            className="flex h-10 flex-1 items-center justify-center gap-2 rounded-lg bg-white font-medium text-black shadow-[0_4px_0_0_#a1a1aa] transition-all duration-150 hover:bg-zinc-100 hover:shadow-[0_4px_0_0_#8b8b94] active:translate-y-0.5 active:shadow-[0_2px_0_0_#a1a1aa]"
          >
            <span className="text-sm">Use Prompt</span>
          </button>
          <button
            onClick={handleCopy}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-black shadow-[0_4px_0_0_#a1a1aa] transition-all duration-150 hover:bg-zinc-100 hover:shadow-[0_4px_0_0_#8b8b94] active:translate-y-0.5 active:shadow-[0_2px_0_0_#a1a1aa]"
            title="Copy prompt"
          >
            {copied ? <CheckIcon /> : <CopyIcon />}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PromptsPage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPrompts = prompts.filter((prompt) => {
    const matchesCategory =
      activeCategory === "all" || prompt.category === activeCategory;
    const matchesSearch =
      prompt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prompt.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#0a0a0a]">
      <Header />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto flex max-w-[1280px] flex-col gap-8 px-6 pt-12 pb-8 md:px-10 md:pt-14">
          {/* Welcome Header */}
          <section className="flex flex-col">
            <PromptsIcon />
            <h2 className="font-heading mb-3 text-xl leading-none font-bold tracking-tight text-white uppercase sm:mb-4 sm:text-2xl lg:text-2xl">
              Prompt{" "}
              <span className="block text-cyan-400 sm:inline">Gallery</span>
            </h2>
            <p className="max-w-full text-sm text-gray-400">
              Pre-made prompts ready to go. Click one and hit generate.
            </p>
          </section>

          {/* Search and Filters */}
          <section className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <SearchInput value={searchQuery} onChange={setSearchQuery} />
            <CategoryTabs
              activeCategory={activeCategory}
              onCategoryChange={setActiveCategory}
            />
          </section>

          {/* Prompts Grid */}
          <section className="space-y-4">
            <div className="flex items-end justify-between gap-4">
              <div className="space-y-1">
                <h2 className="font-heading text-lg text-white uppercase">
                  Most Popular
                </h2>
                <p className="text-sm text-gray-400">
                  Most loved AI prompts by creators
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {filteredPrompts.map((prompt) => (
                <PromptCardComponent key={prompt.id} prompt={prompt} />
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

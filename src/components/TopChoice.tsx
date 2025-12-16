"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import {
  ReactCompareSlider,
  ReactCompareSliderImage,
} from "react-compare-slider";

interface ToolCard {
  title: string;
  description: string;
  image: string;
  imageAfter?: string;
  href: string;
  badge?: {
    text: string;
    variant: "unlimited" | "pro" | "new";
  };
}

const toolCards: ToolCard[] = [
  {
    title: "Sharpen Image",
    description: "Transform blurry photos into crisp images",
    image: "/images/sharpen-before.jpg",
    imageAfter: "/images/sharpen-after.jpg",
    href: "/tools/sharpen",
  },
  {
    title: "Upscale",
    description: "Enhance resolution up to 8x",
    image: "/images/upscale-before.jpg",
    imageAfter: "/images/upscale-after.jpg",
    href: "/tools/upscale",
    badge: { text: "PRO", variant: "pro" },
  },
  {
    title: "Background Remix",
    description: "Transform any background instantly",
    image: "/images/bg-remix-before.jpg",
    imageAfter: "/images/bg-remix-after.jpg",
    href: "/tools/background-remix",
  },
  {
    title: "Color Grade",
    description: "Professional cinematic color correction",
    image: "/images/color-before.jpg",
    imageAfter: "/images/color-after.jpg",
    href: "/tools/color-grade",
  },
  {
    title: "Portrait Enhance",
    description: "Turn selfies into professional portraits",
    image: "/images/portrait-before.jpg",
    imageAfter: "/images/portrait-after.jpg",
    href: "/tools/portrait-enhance",
    badge: { text: "NEW", variant: "new" },
  },
  {
    title: "Lighting Fix",
    description: "Fix poorly lit photos with AI",
    image: "/images/lighting-before.jpg",
    imageAfter: "/images/lighting-after.jpg",
    href: "/tools/lighting-fix",
  },
  {
    title: "Product Photo",
    description: "Create stunning product ad shots",
    image: "/images/product-before.jpg",
    imageAfter: "/images/product-after.jpg",
    href: "/tools/product-photo",
    badge: { text: "PRO", variant: "pro" },
  },
  {
    title: "Style Transfer",
    description: "Apply artistic styles to any image",
    image: "/images/style-before.jpg",
    imageAfter: "/images/style-after.jpg",
    href: "/tools/style-transfer",
  },
];

const badgeStyles = {
  unlimited: "bg-purple-600",
  pro: "bg-green-600",
  new: "bg-zinc-600",
};

function AnimatedCompareSlider({
  image,
  imageAfter,
  title,
}: {
  image: string;
  imageAfter: string;
  title: string;
}) {
  const [position, setPosition] = useState(() => Math.random() * 60 + 20); // Random start 20-80
  const [direction, setDirection] = useState(() =>
    Math.random() > 0.5 ? 1 : -1
  );
  const [speed] = useState(() => Math.random() * 0.3 + 0.15); // Random speed 0.15-0.45
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setPosition((prev) => {
        let next = prev + direction * speed;

        // Bounce at edges
        if (next >= 85) {
          setDirection(-1);
          next = 85;
        } else if (next <= 15) {
          setDirection(1);
          next = 15;
        }

        return next;
      });
    }, 16); // ~60fps

    return () => clearInterval(interval);
  }, [direction, speed, isPaused]);

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <ReactCompareSlider
        itemOne={
          <ReactCompareSliderImage
            src={image}
            alt={`${title} before`}
            style={{ objectFit: "cover", width: "100%", height: "100%" }}
          />
        }
        itemTwo={
          <ReactCompareSliderImage
            src={imageAfter}
            alt={`${title} after`}
            style={{ objectFit: "cover", width: "100%", height: "100%" }}
          />
        }
        handle={
          <div
            style={{
              width: 2,
              height: "100%",
              backgroundColor: "white",
              boxShadow: "0 0 4px rgba(0,0,0,0.5)",
            }}
          />
        }
        style={{ width: "100%", height: "100%" }}
        position={position}
        onlyHandleDraggable
      />
    </div>
  );
}

export default function TopChoice() {
  return (
    <section className="mt-8 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-2xl text-white">TOP CHOICE</h2>
          <p className="text-sm text-gray-400">
            Creator-recommended tools tailored for you
          </p>
        </div>
        <Link
          href="/tools"
          className="flex items-center gap-2 text-sm text-gray-300 transition-colors duration-300 hover:text-cyan-400"
        >
          See all
          <span>→</span>
        </Link>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-2">
        {toolCards.map((card) => (
          <Link
            key={card.title}
            href={card.href}
            className="group h-56 w-[17%] min-w-[160px] flex-shrink-0 overflow-hidden rounded-2xl border border-zinc-700/50 bg-zinc-900 transition-colors duration-300 hover:bg-zinc-800"
          >
            <div className="relative h-40 w-full overflow-hidden bg-zinc-800">
              {card.imageAfter ? (
                <AnimatedCompareSlider
                  image={card.image}
                  imageAfter={card.imageAfter}
                  title={card.title}
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={card.image}
                  alt={card.title}
                  className="h-full w-full object-cover"
                />
              )}
              {card.badge && (
                <span
                  className={`${badgeStyles[card.badge.variant]} absolute top-3 left-3 z-10 rounded px-2 py-0.5 text-[10px] font-medium text-white`}
                >
                  {card.badge.text}
                </span>
              )}
            </div>
            <div className="flex h-16 items-start justify-between gap-2 p-3">
              <div className="min-w-0 flex-1">
                <h4 className="truncate text-base font-medium text-white transition-colors duration-300 group-hover:text-cyan-400">
                  {card.title}
                </h4>
                <p className="truncate text-xs text-gray-400">
                  {card.description}
                </p>
              </div>
              <span className="flex-shrink-0 text-lg text-gray-400">→</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

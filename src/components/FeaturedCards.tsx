"use client";

import { useState, memo } from "react";
import Image from "next/image";
import Link from "next/link";

interface FeaturedCard {
  title: string;
  description: string;
  image: string;
  href: string;
  badge?: {
    text: string;
    color: string;
  };
}

const featuredCards: FeaturedCard[] = [
  {
    title: "VIDEO ADS",
    description: "Create scroll-stopping video ads that convert",
    image: "/images/video-ads.jpg",
    href: "/video-ads",
  },
  {
    title: "HORROR SHORTS",
    description: "Terrifying short-form content that keeps viewers hooked",
    image: "/images/horror-shorts.jpg",
    href: "/horror-shorts",
  },
  {
    title: "EDUCATIONAL",
    description: "Engaging explainers and tutorials that teach",
    image: "/images/educational.jpg",
    href: "/educational",
  },
  {
    title: "FUNNY SHORTS",
    description: "Comedy content that gets shares and laughs",
    image: "/images/funny-shorts.jpg",
    href: "/funny-shorts",
  },
  {
    title: "VIRAL SHORTS",
    description: "Trending formats optimized for maximum reach",
    image: "/images/viral-shorts.jpg",
    href: "/viral-shorts",
  },
  {
    title: "PERSONAL BRANDING",
    description: "Build your online presence with professional content",
    image: "/images/personal-branding.jpg",
    href: "/personal-branding",
  },
];

const FeaturedCard = memo(function FeaturedCard({
  card,
  priority = false,
}: {
  card: FeaturedCard;
  priority?: boolean;
}) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <Link href={card.href} className="group w-[38%] flex-shrink-0">
      <div className="relative aspect-[16/9] overflow-hidden rounded-2xl bg-black/30 backdrop-blur-md">
        {/* Skeleton */}
        <div
          className={`absolute inset-0 z-10 transition-opacity duration-300 ${
            isLoaded ? "pointer-events-none opacity-0" : "opacity-100"
          }`}
        >
          <div className="skeleton-loader size-full" />
        </div>

        <Image
          src={card.image}
          alt={card.title}
          fill
          sizes="(max-width: 768px) 38vw, 300px"
          className={`object-cover transition-opacity duration-300 ${
            isLoaded ? "opacity-100" : "opacity-0"
          }`}
          priority={priority}
          loading={priority ? "eager" : "lazy"}
          onLoad={() => setIsLoaded(true)}
          onError={() => setIsLoaded(true)}
        />
      </div>
      <div className="mt-2">
        <h4 className="font-heading text-sm text-white transition-colors duration-150 group-hover:text-pink-400">
          {card.title}
        </h4>
        <p className="text-xs text-zinc-300">{card.description}</p>
      </div>
    </Link>
  );
});

export default function FeaturedCards() {
  return (
    <section>
      <div className="hide-scrollbar flex gap-4 overflow-x-auto pb-2">
        {featuredCards.map((card, index) => (
          <FeaturedCard key={card.title} card={card} priority={index < 3} />
        ))}
      </div>
    </section>
  );
}

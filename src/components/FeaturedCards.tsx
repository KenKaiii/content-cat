"use client";

import { useState, memo } from "react";
import Image from "next/image";
import { toast } from "sonner";

interface FeaturedCard {
  title: string;
  description: string;
  image: string;
}

const featuredCards: FeaturedCard[] = [
  {
    title: "VIDEO ADS",
    description: "Create scroll-stopping video ads that convert",
    image: "/images/video-ads.jpg",
  },
  {
    title: "HORROR SHORTS",
    description: "Terrifying short-form content that keeps viewers hooked",
    image: "/images/horror-shorts.jpg",
  },
  {
    title: "EDUCATIONAL",
    description: "Engaging explainers and tutorials that teach",
    image: "/images/educational.jpg",
  },
  {
    title: "FUNNY SHORTS",
    description: "Comedy content that gets shares and laughs",
    image: "/images/funny-shorts.jpg",
  },
  {
    title: "VIRAL SHORTS",
    description: "Trending formats optimized for maximum reach",
    image: "/images/viral-shorts.jpg",
  },
  {
    title: "PERSONAL BRANDING",
    description: "Build your online presence with professional content",
    image: "/images/personal-branding.jpg",
  },
];

const FeaturedCardItem = memo(function FeaturedCardItem({
  card,
  priority = false,
}: {
  card: FeaturedCard;
  priority?: boolean;
}) {
  const [isLoaded, setIsLoaded] = useState(false);

  const handleClick = () => {
    toast.info("Coming soon", {
      description: `${card.title} will be available in a future update.`,
    });
  };

  return (
    <button
      onClick={handleClick}
      className="group w-[38%] flex-shrink-0 text-left"
    >
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
    </button>
  );
});

export default function FeaturedCards() {
  return (
    <section>
      <div className="hide-scrollbar flex gap-4 overflow-x-auto pb-2">
        {featuredCards.map((card, index) => (
          <FeaturedCardItem
            key={card.title}
            card={card}
            priority={index < 3}
          />
        ))}
      </div>
    </section>
  );
}

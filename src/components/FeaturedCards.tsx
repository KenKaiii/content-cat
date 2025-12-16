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

export default function FeaturedCards() {
  return (
    <section>
      <div className="flex gap-4 overflow-x-auto pb-2">
        {featuredCards.map((card) => (
          <Link
            key={card.title}
            href={card.href}
            className="group w-[38%] flex-shrink-0"
          >
            <div className="relative aspect-[16/9] overflow-hidden rounded-2xl bg-zinc-800">
              <Image
                src={card.image}
                alt={card.title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            <div className="mt-2">
              <h4 className="font-heading text-sm text-white transition-colors duration-300 group-hover:text-cyan-400">
                {card.title}
              </h4>
              <p className="text-xs text-gray-400">{card.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

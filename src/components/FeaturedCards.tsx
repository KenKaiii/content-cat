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
    title: "HOLIDAY SALES",
    description: "Up to 67% off all plans + 1 year unlimited image generations",
    image: "/images/holiday-sales.jpg",
    href: "/pricing",
  },
  {
    title: "INPAINT",
    description: "Brush to edit specific areas or transform entire images",
    image: "/images/inpaint.jpg",
    href: "/inpaint",
  },
  {
    title: "SHOTS",
    description: "One image becomes 9 shots. Pick and upscale favorites",
    image: "/images/shots.jpg",
    href: "/shots",
  },
  {
    title: "AI PORTRAITS",
    description: "Generate stunning AI portraits in seconds",
    image: "/images/ai-portraits.jpg",
    href: "/ai-portraits",
  },
  {
    title: "VIDEO GEN",
    description: "Create videos from text prompts with AI",
    image: "/images/video-gen.jpg",
    href: "/video-gen",
  },
  {
    title: "UPSCALER",
    description: "Enhance image resolution up to 8x",
    image: "/images/upscaler.jpg",
    href: "/upscaler",
  },
  {
    title: "STYLE MIX",
    description: "Blend multiple art styles into one image",
    image: "/images/style-mix.jpg",
    href: "/style-mix",
  },
  {
    title: "ANIMATE",
    description: "Bring still images to life with motion",
    image: "/images/animate.jpg",
    href: "/animate",
  },
];

export default function FeaturedCards() {
  return (
    <section>
      <div className="flex gap-4 overflow-x-auto pb-2">
        {featuredCards.map((card) => (
          <Link key={card.title} href={card.href} className="group w-[38%] flex-shrink-0">
            <div className="relative aspect-[16/9] overflow-hidden rounded-2xl bg-zinc-800">
            </div>
            <div className="mt-2">
              <h4 className="font-heading text-sm text-white transition-colors duration-300 group-hover:text-cyan-400">{card.title}</h4>
              <p className="text-xs text-gray-400">{card.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

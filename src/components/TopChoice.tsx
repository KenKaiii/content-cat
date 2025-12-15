import Link from "next/link";

interface ToolCard {
  title: string;
  description: string;
  image: string;
  href: string;
  badge?: {
    text: string;
    variant: "unlimited" | "pro" | "new";
  };
}

const toolCards: ToolCard[] = [
  {
    title: "Nano Banana Pro",
    description: "Best 4K image model ever",
    image: "/images/nano-banana.jpg",
    href: "/tools/nano-banana",
    badge: { text: "UNLIMITED", variant: "unlimited" },
  },
  {
    title: "Skin Enhancer",
    description: "Natural, realistic skin textures",
    image: "/images/skin-enhancer.jpg",
    href: "/tools/skin-enhancer",
    badge: { text: "PRO", variant: "pro" },
  },
  {
    title: "Kling 2.6",
    description: "Cinematic videos with audio",
    image: "/images/kling.jpg",
    href: "/tools/kling",
    badge: { text: "NEW", variant: "new" },
  },
  {
    title: "Face Swap",
    description: "The best instant AI face swap t...",
    image: "/images/face-swap.jpg",
    href: "/tools/face-swap",
  },
  {
    title: "Angles",
    description: "Generate any angle view for an...",
    image: "/images/angles.jpg",
    href: "/tools/angles",
  },
  {
    title: "Seedream 4.5",
    description: "Next-gen 4K image",
    image: "/images/seedream.jpg",
    href: "/tools/seedream",
  },
  {
    title: "Portrait Master",
    description: "Professional portrait editing",
    image: "/images/portrait-master.jpg",
    href: "/tools/portrait-master",
    badge: { text: "PRO", variant: "pro" },
  },
  {
    title: "Background Remix",
    description: "Transform any background",
    image: "/images/background-remix.jpg",
    href: "/tools/background-remix",
  },
  {
    title: "Style Transfer",
    description: "Apply artistic styles instantly",
    image: "/images/style-transfer.jpg",
    href: "/tools/style-transfer",
    badge: { text: "NEW", variant: "new" },
  },
  {
    title: "Video Upscale",
    description: "Enhance video resolution to 4K",
    image: "/images/video-upscale.jpg",
    href: "/tools/video-upscale",
  },
  {
    title: "Motion Blur",
    description: "Add cinematic motion effects",
    image: "/images/motion-blur.jpg",
    href: "/tools/motion-blur",
  },
  {
    title: "Color Grade",
    description: "Professional color correction",
    image: "/images/color-grade.jpg",
    href: "/tools/color-grade",
    badge: { text: "UNLIMITED", variant: "unlimited" },
  },
];

const badgeStyles = {
  unlimited: "bg-purple-600",
  pro: "bg-green-600",
  new: "bg-zinc-600",
};

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
              {card.badge && (
                <span
                  className={`${badgeStyles[card.badge.variant]} absolute left-3 top-3 rounded px-2 py-0.5 text-[10px] font-medium text-white`}
                >
                  {card.badge.text}
                </span>
              )}
            </div>
            <div className="flex h-16 items-start justify-between gap-2 p-3">
              <div className="min-w-0 flex-1">
                <h4 className="truncate text-base font-medium text-white transition-colors duration-300 group-hover:text-cyan-400">{card.title}</h4>
                <p className="truncate text-xs text-gray-400">{card.description}</p>
              </div>
              <span className="flex-shrink-0 text-lg text-gray-400">→</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

import Link from "next/link";

interface ActionCard {
  title: string;
  image: string;
  href: string;
}

const actionCards: ActionCard[] = [
  {
    title: "Create Image",
    image: "/images/create-image.jpg",
    href: "/create-image",
  },
  {
    title: "Create Video",
    image: "/images/create-video.jpg",
    href: "/create-video",
  },
  {
    title: "Edit Image",
    image: "/images/edit-image.jpg",
    href: "/edit-image",
  },
  {
    title: "Kling Video Edit",
    image: "/images/kling-video.jpg",
    href: "/kling-video-edit",
  },
  {
    title: "Upscale",
    image: "/images/upscale.jpg",
    href: "/upscale",
  },
];

export default function CreateSection() {
  return (
    <section className="flex-shrink-0">
      <div className="flex items-center gap-6 rounded-2xl bg-zinc-900 p-6">
        <div className="flex-shrink-0">
          <h2 className="font-heading text-2xl text-white">WHAT WILL YOU</h2>
          <h2 className="font-heading text-2xl text-lime-400">CREATE TODAY?</h2>
          <p className="mt-3 max-w-[180px] text-xs text-gray-400">
            Create authentic images and videos with natural texture and easy
            style
          </p>
          <button className="mt-4 flex items-center gap-2 rounded-full bg-lime-400 px-4 py-2 text-sm font-medium text-black">
            Explore all tools
            <span>→</span>
          </button>
        </div>
        <div className="flex flex-1 gap-3 overflow-hidden">
          {actionCards.map((card) => (
            <Link key={card.title} href={card.href} className="group flex-1">
              <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-zinc-800"></div>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-xs text-white">{card.title}</span>
                <span className="text-xs text-gray-400">→</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

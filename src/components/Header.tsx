import Link from "next/link";

const navItems = [
  { label: "Image", href: "/image" },
  { label: "Video", href: "/video" },
];

export default function Header() {
  return (
    <header className="flex items-center justify-between px-6 py-4">
      <div className="flex items-center gap-8">
        <Link href="/" className="font-heading text-xl text-white">
          Content Cat
        </Link>
        <nav className="flex items-center gap-6">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="text-base font-semibold text-gray-300 transition-colors duration-300 hover:text-cyan-400"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

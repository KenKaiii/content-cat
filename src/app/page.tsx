import Header from "@/components/Header";
import FeaturedCards from "@/components/FeaturedCards";
import TopChoice from "@/components/TopChoice";

export default function Home() {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#0a0a0a]">
      <Header />
      <main className="flex flex-1 flex-col gap-4 overflow-hidden px-6 py-4">
        <FeaturedCards />
        <TopChoice />
      </main>
    </div>
  );
}

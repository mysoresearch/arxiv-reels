import { getUnswiped } from "@/lib/db";
import PaperFeed from "@/components/PaperFeed";

export const dynamic = "force-dynamic";

export default function Home() {
  const papers = getUnswiped();

  return (
    <div className="flex flex-col h-screen max-h-screen overflow-hidden">
      {/* Header */}
      <header className="shrink-0 px-5 pt-5 pb-3">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              Diffusion Daily
            </h1>
            <p className="text-xs text-white/40 mt-0.5">arXiv · refreshed daily</p>
          </div>
          <span className="text-2xl">🌀</span>
        </div>
      </header>

      {/* Feed */}
      <main className="flex-1 overflow-hidden">
        <PaperFeed initialPapers={papers} />
      </main>
    </div>
  );
}

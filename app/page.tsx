import { getUnswiped, upsertPaper } from "@/lib/db";
import { fetchDiffusionPapers } from "@/lib/arxiv";
import PaperFeed from "@/components/PaperFeed";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export default async function Home() {
  let papers: Awaited<ReturnType<typeof getUnswiped>> = [];
  let dbError: string | null = null;

  if (!process.env.POSTGRES_URL) {
    dbError = "POSTGRES_URL is not set. Add a Vercel Postgres database in your project's Storage tab.";
  } else {
    try {
      papers = await getUnswiped();
      if (papers.length === 0) {
        const fetched = await fetchDiffusionPapers();
        for (const p of fetched) await upsertPaper(p);
        papers = await getUnswiped();
      }
    } catch (err) {
      dbError = err instanceof Error ? err.message : "Database error";
    }
  }

  return (
    <div className="flex flex-col h-screen max-h-screen overflow-hidden">
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

      <main className="flex-1 overflow-hidden">
        {dbError ? (
          <div className="flex items-center justify-center h-full px-6">
            <div className="max-w-sm text-center">
              <p className="text-white/60 text-sm mb-2">Setup required</p>
              <p className="text-white/40 text-xs">{dbError}</p>
            </div>
          </div>
        ) : (
          <PaperFeed initialPapers={papers} />
        )}
      </main>
    </div>
  );
}

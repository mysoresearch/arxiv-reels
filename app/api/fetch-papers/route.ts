import { NextResponse } from "next/server";
import { fetchDiffusionPapers } from "@/lib/arxiv";
import { upsertPaper } from "@/lib/db";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  }

  const papers = await fetchDiffusionPapers();
  for (const p of papers) {
    await upsertPaper(p);
  }

  return NextResponse.json({ fetched: papers.length });
}

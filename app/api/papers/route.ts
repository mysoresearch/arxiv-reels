import { NextResponse } from "next/server";
import { getUnswiped, getLiked } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tab = searchParams.get("tab");

  const papers = tab === "liked" ? await getLiked() : await getUnswiped();
  return NextResponse.json(papers);
}

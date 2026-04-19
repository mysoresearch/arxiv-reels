import { NextResponse } from "next/server";
import { sql } from "@vercel/postgres";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!process.env.POSTGRES_URL) {
    return NextResponse.json({ error: "POSTGRES_URL not set" });
  }

  try {
    const total = await sql`SELECT COUNT(*) AS count FROM papers`;
    const unswiped = await sql`SELECT COUNT(*) AS count FROM papers WHERE swiped = 0`;
    const sample = await sql`SELECT arxiv_id, title, swiped FROM papers LIMIT 3`;
    return NextResponse.json({
      postgres_url_set: true,
      total_papers: Number(total.rows[0].count),
      unswiped_papers: Number(unswiped.rows[0].count),
      sample: sample.rows,
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) });
  }
}

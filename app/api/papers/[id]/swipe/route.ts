import { NextResponse } from "next/server";
import { swipePaper } from "@/lib/db";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = parseInt(params.id, 10);
  if (isNaN(id)) return NextResponse.json({ error: "invalid id" }, { status: 400 });

  const body = await request.json();
  swipePaper(id, Boolean(body.liked));

  return NextResponse.json({ ok: true });
}

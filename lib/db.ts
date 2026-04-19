import { sql } from "@vercel/postgres";

export interface Paper {
  id: number;
  arxiv_id: string;
  title: string;
  abstract: string;
  authors: string;
  categories: string;
  published: string;
  url: string;
  fetched_at: string;
  swiped: number;
  liked: number | null;
}

async function ensureSchema(): Promise<void> {
  await sql`
    CREATE TABLE IF NOT EXISTS papers (
      id          SERIAL PRIMARY KEY,
      arxiv_id    TEXT    UNIQUE NOT NULL,
      title       TEXT    NOT NULL,
      abstract    TEXT    NOT NULL,
      authors     TEXT    NOT NULL,
      categories  TEXT    NOT NULL,
      published   TEXT    NOT NULL,
      url         TEXT    NOT NULL,
      fetched_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      swiped      INTEGER NOT NULL DEFAULT 0,
      liked       INTEGER
    )
  `;
}

export async function getUnswiped(limit = 200): Promise<Paper[]> {
  await ensureSchema();
  const { rows: latest } = await sql`
    SELECT published FROM papers ORDER BY published DESC LIMIT 1
  `;
  if (latest.length === 0) return [];
  const latestDate = (latest[0] as { published: string }).published;
  const { rows } = await sql<Paper>`
    SELECT * FROM papers WHERE swiped = 0 AND published = ${latestDate}
    ORDER BY id DESC LIMIT ${limit}
  `;
  return rows;
}

export async function swipePaper(id: number, liked: boolean): Promise<void> {
  const likedVal = liked ? 1 : 0;
  await sql`UPDATE papers SET swiped = 1, liked = ${likedVal} WHERE id = ${id}`;
}

export async function getLiked(): Promise<Paper[]> {
  await ensureSchema();
  const { rows } = await sql<Paper>`
    SELECT * FROM papers WHERE liked = 1 ORDER BY published DESC
  `;
  return rows;
}

export async function upsertPaper(
  paper: Omit<Paper, "id" | "fetched_at" | "swiped" | "liked">
): Promise<void> {
  await ensureSchema();
  await sql`
    INSERT INTO papers (arxiv_id, title, abstract, authors, categories, published, url)
    VALUES (${paper.arxiv_id}, ${paper.title}, ${paper.abstract}, ${paper.authors}, ${paper.categories}, ${paper.published}, ${paper.url})
    ON CONFLICT(arxiv_id) DO NOTHING
  `;
}

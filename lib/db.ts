import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const DB_PATH = process.env.DB_PATH ?? "./data/papers.db";

function getDb(): Database.Database {
  const resolved = path.resolve(DB_PATH);
  fs.mkdirSync(path.dirname(resolved), { recursive: true });
  const db = new Database(resolved);
  db.pragma("journal_mode = WAL");
  db.exec(`
    CREATE TABLE IF NOT EXISTS papers (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      arxiv_id    TEXT    UNIQUE NOT NULL,
      title       TEXT    NOT NULL,
      abstract    TEXT    NOT NULL,
      authors     TEXT    NOT NULL,
      categories  TEXT    NOT NULL,
      published   TEXT    NOT NULL,
      url         TEXT    NOT NULL,
      fetched_at  TEXT    NOT NULL DEFAULT (datetime('now')),
      swiped      INTEGER NOT NULL DEFAULT 0,
      liked       INTEGER
    );
  `);
  return db;
}

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

export function getUnswiped(limit = 50): Paper[] {
  const db = getDb();
  return db
    .prepare(
      "SELECT * FROM papers WHERE swiped = 0 ORDER BY published DESC LIMIT ?"
    )
    .all(limit) as Paper[];
}

export function swipePaper(id: number, liked: boolean): void {
  const db = getDb();
  db.prepare("UPDATE papers SET swiped = 1, liked = ? WHERE id = ?").run(
    liked ? 1 : 0,
    id
  );
}

export function getLiked(): Paper[] {
  const db = getDb();
  return db
    .prepare("SELECT * FROM papers WHERE liked = 1 ORDER BY published DESC")
    .all() as Paper[];
}

export function upsertPaper(paper: Omit<Paper, "id" | "fetched_at" | "swiped" | "liked">): void {
  const db = getDb();
  db.prepare(`
    INSERT INTO papers (arxiv_id, title, abstract, authors, categories, published, url)
    VALUES (@arxiv_id, @title, @abstract, @authors, @categories, @published, @url)
    ON CONFLICT(arxiv_id) DO NOTHING
  `).run(paper);
}

# Diffusion Daily

A Tinder-style swipe feed for the latest diffusion model papers from arXiv. Papers are fetched daily and stored locally in SQLite.

## Stack

- **Next.js 14** (App Router) — frontend + API routes
- **better-sqlite3** — local SQLite storage
- **Tailwind CSS** — styling
- **Vercel Cron** — daily fetch at 06:00 UTC

## Getting Started

```bash
npm install
cp .env.local.example .env.local   # edit if needed

# seed the DB on first run
curl http://localhost:3000/api/fetch-papers

npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## How It Works

| Route | What it does |
|---|---|
| `GET /api/fetch-papers` | Queries arXiv for new diffusion papers, upserts into SQLite |
| `GET /api/papers` | Returns unswiped papers |
| `POST /api/papers/[id]/swipe` | Marks a paper liked/skipped |

The daily cron job (`vercel.json`) calls `/api/fetch-papers` every morning. On Vercel, set `CRON_SECRET` and the route will require `Authorization: Bearer <secret>`.

## Deployment Notes

`better-sqlite3` uses native bindings. It works on Node.js servers and Vercel (x86_64). For edge/serverless environments, swap it for [Turso (LibSQL)](https://turso.tech/) using the same schema.

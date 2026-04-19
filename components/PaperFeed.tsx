"use client";

import { useState, useCallback, useEffect } from "react";
import type { Paper } from "@/lib/db";
import SwipeCard from "./SwipeCard";

interface Props {
  initialPapers: Paper[];
}

export default function PaperFeed({ initialPapers }: Props) {
  const [papers, setPapers] = useState<Paper[]>(initialPapers);
  const [index, setIndex] = useState(0);
  const [likedCount, setLikedCount] = useState(0);
  const [fetching, setFetching] = useState(false);
  const [tab, setTab] = useState<"feed" | "liked">("feed");
  const [likedPapers, setLikedPapers] = useState<Paper[]>([]);

  const remaining = papers.length - index;

  const handleSwipe = useCallback(
    async (id: number, liked: boolean) => {
      setIndex((i) => i + 1);
      if (liked) setLikedCount((c) => c + 1);
      await fetch(`/api/papers/${id}/swipe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ liked }),
      });
    },
    []
  );

  const triggerFetch = async () => {
    setFetching(true);
    try {
      await fetch("/api/fetch-papers");
      const res = await fetch("/api/papers");
      setPapers(await res.json());
      setIndex(0);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    if (tab === "liked") {
      fetch("/api/papers?tab=liked")
        .then((r) => r.json())
        .then(setLikedPapers);
    }
  }, [tab]);

  const visible = papers.slice(index, index + 3);

  return (
    <div className="flex flex-col h-full">
      {/* Tabs */}
      <div className="flex border-b border-border">
        <button
          onClick={() => setTab("feed")}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            tab === "feed"
              ? "text-accent border-b-2 border-accent"
              : "text-white/40 hover:text-white/60"
          }`}
        >
          Feed
          {remaining > 0 && (
            <span className="ml-2 text-xs bg-accent/20 text-accent px-1.5 py-0.5 rounded-full">
              {remaining}
            </span>
          )}
        </button>
        <button
          onClick={() => setTab("liked")}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            tab === "liked"
              ? "text-accent border-b-2 border-accent"
              : "text-white/40 hover:text-white/60"
          }`}
        >
          Liked
          {likedCount > 0 && (
            <span className="ml-2 text-xs bg-accent-green/20 text-accent-green px-1.5 py-0.5 rounded-full">
              +{likedCount}
            </span>
          )}
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 flex flex-col items-center">
        {tab === "feed" ? (
          <>
            {visible.length > 0 ? (
              <div className="card-stack w-full max-w-lg mx-auto">
                {[...visible].reverse().map((paper, i) => (
                  <SwipeCard
                    key={paper.id}
                    paper={paper}
                    stackIndex={visible.length - 1 - i}
                    onSwipe={handleSwipe}
                  />
                ))}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center">
                <p className="text-white/40 text-lg">
                  {papers.length === 0
                    ? "No papers yet — fetch to get started."
                    : "You've seen everything for today!"}
                </p>
                <button
                  onClick={triggerFetch}
                  disabled={fetching}
                  className="px-5 py-2.5 rounded-xl bg-accent text-white font-medium text-sm hover:bg-accent/80 disabled:opacity-50 transition-colors"
                >
                  {fetching ? "Fetching…" : "Fetch Latest Papers"}
                </button>
              </div>
            )}

            {visible.length > 0 && (
              <p className="mt-4 text-xs text-white/30">
                Swipe or use buttons · {remaining} remaining
              </p>
            )}
          </>
        ) : (
          <div className="w-full max-w-lg mx-auto space-y-3 overflow-y-auto pb-6">
            {likedPapers.length === 0 ? (
              <p className="text-center text-white/40 mt-12">No liked papers yet.</p>
            ) : (
              likedPapers.map((p) => (
                <a
                  key={p.id}
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block bg-card border border-border rounded-xl p-4 hover:border-accent/40 transition-colors"
                >
                  <p className="text-sm font-medium text-white/90 line-clamp-2">{p.title}</p>
                  <p className="text-xs text-white/40 mt-1">
                    {p.authors.split(", ").slice(0, 2).join(", ")} · {p.published}
                  </p>
                </a>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

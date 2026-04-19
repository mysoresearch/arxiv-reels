"use client";

import { useRef, useState, useCallback } from "react";
import type { Paper } from "@/lib/db";

interface Props {
  paper: Paper;
  stackIndex: number;
  onSwipe: (id: number, liked: boolean) => void;
}

const SWIPE_THRESHOLD = 100;

export default function SwipeCard({ paper, stackIndex, onSwipe }: Props) {
  const [offsetX, setOffsetX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const startXRef = useRef(0);
  const cardRef = useRef<HTMLDivElement>(null);

  const isTop = stackIndex === 0;

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (!isTop) return;
      setDragging(true);
      startXRef.current = e.clientX;
      cardRef.current?.setPointerCapture(e.pointerId);
    },
    [isTop]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging) return;
      setOffsetX(e.clientX - startXRef.current);
    },
    [dragging]
  );

  const handlePointerUp = useCallback(() => {
    if (!dragging) return;
    setDragging(false);
    if (Math.abs(offsetX) >= SWIPE_THRESHOLD) {
      onSwipe(paper.id, offsetX > 0);
    } else {
      setOffsetX(0);
    }
  }, [dragging, offsetX, onSwipe, paper.id]);

  const rotation = offsetX / 18;
  const likeOpacity = Math.min(Math.max(offsetX / SWIPE_THRESHOLD, 0), 1);
  const nopeOpacity = Math.min(Math.max(-offsetX / SWIPE_THRESHOLD, 0), 1);

  const scaleBack = 0.94 + stackIndex * 0 - stackIndex * 0.04;
  const yBack = stackIndex * 12;

  const style: React.CSSProperties = isTop
    ? {
        transform: `translateX(${offsetX}px) rotate(${rotation}deg)`,
        transition: dragging ? "none" : "transform 0.35s cubic-bezier(.25,.46,.45,.94)",
        zIndex: 10,
      }
    : {
        transform: `translateY(${yBack}px) scale(${scaleBack})`,
        transition: "transform 0.35s cubic-bezier(.25,.46,.45,.94)",
        zIndex: 10 - stackIndex,
        pointerEvents: "none",
      };

  const authors = paper.authors.split(", ");
  const displayAuthors =
    authors.length > 3 ? authors.slice(0, 3).join(", ") + " et al." : paper.authors;

  return (
    <div
      ref={cardRef}
      className="swipe-card rounded-2xl overflow-hidden"
      style={style}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      <div className="h-full bg-card border border-border rounded-2xl flex flex-col overflow-hidden shadow-2xl">
        {/* Header gradient */}
        <div className="h-2 bg-gradient-to-r from-purple-600 via-accent to-blue-500 shrink-0" />

        {/* Stamps */}
        {isTop && (
          <>
            <span className="stamp stamp-like" style={{ opacity: likeOpacity }}>
              Like
            </span>
            <span className="stamp stamp-nope" style={{ opacity: nopeOpacity }}>
              Nope
            </span>
          </>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-3">
          {/* Meta */}
          <div className="flex flex-wrap gap-2">
            {paper.categories.split(", ").slice(0, 3).map((cat) => (
              <span
                key={cat}
                className="text-xs px-2 py-0.5 rounded-full bg-accent/15 text-accent font-medium"
              >
                {cat}
              </span>
            ))}
            <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-white/50 ml-auto">
              {paper.published}
            </span>
          </div>

          {/* Title */}
          <h2 className="text-base font-semibold leading-snug text-white/90">
            {paper.title}
          </h2>

          {/* Authors */}
          <p className="text-xs text-white/45 font-medium">{displayAuthors}</p>

          {/* Abstract */}
          <div className="flex-1">
            <p
              className={`text-sm text-white/70 leading-relaxed ${
                expanded ? "" : "line-clamp-6"
              }`}
            >
              {paper.abstract}
            </p>
            {!expanded && paper.abstract.length > 300 && (
              <button
                className="text-xs text-accent mt-1 hover:underline"
                onClick={(e) => {
                  e.stopPropagation();
                  setExpanded(true);
                }}
              >
                Read more
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t border-border px-5 py-3 flex items-center justify-between bg-card">
          <a
            href={paper.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-accent hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            {paper.arxiv_id} ↗
          </a>
          {isTop && (
            <div className="flex gap-3">
              <button
                onClick={() => onSwipe(paper.id, false)}
                className="w-9 h-9 rounded-full border border-accent-red/40 text-accent-red flex items-center justify-center text-lg hover:bg-accent-red/10 transition-colors"
                title="Skip"
              >
                ✕
              </button>
              <button
                onClick={() => onSwipe(paper.id, true)}
                className="w-9 h-9 rounded-full border border-accent-green/40 text-accent-green flex items-center justify-center text-lg hover:bg-accent-green/10 transition-colors"
                title="Like"
              >
                ♥
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

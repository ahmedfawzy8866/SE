"use client";
/**
 * PropertyCard — used by ListingsGrid.
 * Click → opens PropertyDetail (passed via onSelect).
 */
import Image from "next/image";
import { BedDouble, Bath, Maximize, MapPin, Sparkles, Heart } from "lucide-react";
import type { Listing } from "@/lib/types";
import { fmtUSD, fmtArea, fmtScore } from "@/lib/format";
import { useState } from "react";

export function PropertyCard({ l, onSelect }: { l: Listing; onSelect: (l: Listing) => void }) {
  const [saved, setSaved] = useState(false);

  return (
    <article className="card overflow-hidden hover:shadow-pop transition-all duration-300 group cursor-pointer flex flex-col" onClick={() => onSelect(l)}>
      <div className="relative aspect-[4/3] overflow-hidden bg-navy-900/5">
        <Image
          src={l.img}
          alt={`${l.type} in ${l.compound}`}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 left-3 flex gap-1.5">
          {l.tag && <span className="badge-gold">{l.tag}</span>}
          <span className="badge-navy">{l.mode === "sale" ? "For Sale" : "For Rent"}</span>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); setSaved((v) => !v); }}
          className="absolute top-3 right-3 h-8 w-8 rounded-full glass flex items-center justify-center hover:bg-cream/20"
          aria-label="Save"
        >
          <Heart className={`h-4 w-4 ${saved ? "fill-red-500 text-red-500" : "text-cream"}`} />
        </button>
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
          <span className="badge bg-navy-950/80 text-cream">
            <Sparkles className="h-3 w-3 text-gold-300" />
            AI {fmtScore(l.aiScore)}
          </span>
          <span className="text-xs text-cream/80">{l.ago}</span>
        </div>
      </div>

      <div className="p-4 flex-1 flex flex-col">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gold-500">{l.code}</p>
            <h3 className="font-serif text-lg font-bold leading-tight mt-0.5">{l.type}</h3>
          </div>
          <div className="text-right">
            <p className="font-bold text-navy-900">{fmtUSD(l.usd)}</p>
            {l.mode === "rent" && <p className="text-xs text-muted">/month</p>}
          </div>
        </div>

        <p className="text-sm text-muted flex items-center gap-1 mt-1">
          <MapPin className="h-3.5 w-3.5" />
          {l.compound} · {l.zone}
        </p>

        <div className="flex items-center gap-3 mt-3 text-xs text-muted">
          <span className="flex items-center gap-1"><BedDouble className="h-3.5 w-3.5" /> {l.beds}</span>
          <span className="flex items-center gap-1"><Bath className="h-3.5 w-3.5" /> {l.bath}</span>
          <span className="flex items-center gap-1"><Maximize className="h-3.5 w-3.5" /> {fmtArea(l.area)}</span>
        </div>

        <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
          <span className="text-xs text-muted">{l.agent}</span>
          <span className="text-xs font-semibold text-navy-900 group-hover:text-gold-500 transition-colors">
            View details →
          </span>
        </div>
      </div>
    </article>
  );
}

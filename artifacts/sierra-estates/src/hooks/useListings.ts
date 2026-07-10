import { useEffect, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";
import { fetchListings } from "../lib/apiClient";
import type { ApiListing } from "../lib/apiClient";

export interface Property {
  id: string;
  title: string;
  titleAr?: string;
  compound: string;
  purpose: "for-sale" | "for-rent";
  propertyType: string;
  price: number;
  area: number;
  bedrooms: number;
  bathrooms: number;
  amenities: string[];
  images: string[];
  pfReferenceNumber?: string | null;
  ai_score?: number;
  currency?: string;
}

const LISTINGS_QUERY_KEY = ["listings"] as const;

function fromApiListing(l: ApiListing): Property {
  return {
    id: l.id,
    title: l.title,
    titleAr: l.titleAr,
    compound: l.compound,
    purpose: l.purpose,
    propertyType: l.propertyType,
    price: l.price,
    area: l.area,
    bedrooms: l.beds,
    bathrooms: l.baths,
    amenities: l.amenities,
    images: l.images?.length ? l.images : l.image ? [l.image] : [],
    pfReferenceNumber: l.pfReferenceNumber,
    ai_score: (l as any).ai_score ?? (l as any).aiScore,
    currency: (l as any).currency,
  };
}

// Raw Firestore documents mirror the backend's Unit schema field names
// (see backend/apps/sierra-estates-realty/lib/models/schema.ts) — same
// source data the /api/listings REST transform reads, just unflattened.
function fromFirestoreDoc(id: string, data: Record<string, any>): Property {
  return {
    id,
    title: data.title || "Untitled Property",
    titleAr: data.titleAr || undefined,
    compound: data.compound || data.location || data.city || "",
    purpose: data.monthlyRent ? "for-rent" : "for-sale",
    propertyType: data.propertyType || data.type || "apartment",
    price: data.price || 0,
    area: data.area || 0,
    bedrooms: data.bedrooms || 0,
    bathrooms: data.bathrooms || 0,
    amenities: data.amenities || [],
    images: data.images || [],
    pfReferenceNumber: data.pfReferenceNumber ?? null,
    ai_score: data.ai_score ?? data.aiScore,
    currency: data.currency,
  };
}

export function useProperties(mode: string, selCmps: string[], rooms: number | null, sort: string) {
  const queryClient = useQueryClient();

  const { data: rawListings, isLoading } = useQuery({
    queryKey: LISTINGS_QUERY_KEY,
    queryFn: async () => {
      const res = await fetchListings({ limit: 100 });
      return res.listings.map(fromApiListing);
    },
    refetchInterval: 60_000,
  });

  // Real-time layer: Firestore push updates win over the REST snapshot while
  // connected. On any listener error (e.g. permission-denied if rules
  // tighten), Firestore stops calling back and we silently keep relying on
  // the REST query + its refetchInterval poll.
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "listings"),
      (snapshot) => {
        const properties = snapshot.docs.map((doc) => fromFirestoreDoc(doc.id, doc.data()));
        queryClient.setQueryData(LISTINGS_QUERY_KEY, properties);
      },
      (error) => {
        console.warn("Realtime listings unavailable, falling back to polling:", error.message);
      },
    );
    return () => unsubscribe();
  }, [queryClient]);

  const { data, total } = useMemo(() => {
    let results = rawListings ? [...rawListings] : [];

    if (mode === "rent") results = results.filter((p) => p.purpose === "for-rent");
    else if (mode === "resale") results = results.filter((p) => p.purpose === "for-sale");

    if (rooms) results = results.filter((p) => p.bedrooms === rooms);

    if (selCmps.length > 0) {
      results = results.filter((p) => selCmps.some((c) => p.compound?.toLowerCase().includes(c.toLowerCase())));
    }

    if (sort === "priceLow") results.sort((a, b) => a.price - b.price);
    else if (sort === "priceHigh") results.sort((a, b) => b.price - a.price);
    else if (sort === "area") results.sort((a, b) => b.area - a.area);

    return { data: results, total: results.length };
  }, [rawListings, mode, selCmps, rooms, sort]);

  return { data, total, loading: isLoading && !rawListings };
}

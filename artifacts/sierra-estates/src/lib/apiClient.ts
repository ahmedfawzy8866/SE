import { customFetch } from "@workspace/api-client-react";

export interface ApiListing {
  id: string;
  title: string;
  titleAr?: string;
  price: number;
  compound: string;
  beds: number;
  baths: number;
  area: number;
  image?: string;
  images: string[];
  description?: string;
  propertyType: string;
  status: string;
  amenities: string[];
  purpose: "for-sale" | "for-rent";
  pfReferenceNumber: string | null;
}

interface ListingsResponse {
  success: boolean;
  listings: ApiListing[];
  count: number;
}

interface ListingResponse {
  success: boolean;
  listing: ApiListing;
}

export interface SubmitLeadPayload {
  name: string;
  email: string;
  phone?: string;
  message?: string;
  locale?: string;
}

interface SubmitLeadResponse {
  success: boolean;
  id: string;
}

export function fetchListings(params?: { limit?: number }): Promise<ListingsResponse> {
  const search = params?.limit ? `?limit=${params.limit}` : "";
  return customFetch<ListingsResponse>(`/api/listings${search}`);
}

export function fetchListingById(id: string): Promise<ListingResponse> {
  return customFetch<ListingResponse>(`/api/listings?id=${encodeURIComponent(id)}`);
}

export function submitLead(payload: SubmitLeadPayload): Promise<SubmitLeadResponse> {
  return customFetch<SubmitLeadResponse>("/api/leads", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/**
 * ════════════════════════════════════════════════════════════════════
 *  Sierra Estates — CLIENT PAGE (single page, route: /)
 * ════════════════════════════════════════════════════════════════════
 *  This is the ONE and only client-facing page in the repo. It composes
 *  every section the public site needs, all on a single route:
 *
 *    1. Hero + SearchBar          (above the fold)
 *    2. Featured ListingsGrid     (with inline search/filter)
 *    3. CompoundsMap              (52-compound Leaflet map)
 *    4. SmartMatch quiz           (4-question → top 3 results)
 *    5. ROICalculator             (yield + payback estimator)
 *    6. InquiryForm (Concierge)   (POST /api/inquiries)
 *    7. Footer
 *
 *  Auth + Toast providers wrap the whole app at the layout level.
 *  All data flows through lib/api-client → /api/* routes → Firestore
 *  (or seed fallback). No client-side Firebase SDK calls except for
 *  sign-in.
 */
import { useState } from "react";
import { AuthProvider } from "@/components/client/AuthModal";
import { Navbar } from "@/components/client/Navbar";
import { Hero } from "@/components/client/Hero";
import { ListingsGrid } from "@/components/client/ListingsGrid";
import { CompoundsMap } from "@/components/client/CompoundsMap";
import { SmartMatch } from "@/components/client/SmartMatch";
import { ROICalculator } from "@/components/client/ROICalculator";
import { InquiryForm } from "@/components/client/InquiryForm";
import { Footer } from "@/components/client/Footer";
import type { SearchFilters } from "@/components/client/SearchBar";

export default function ClientPage() {
  const [filters, setFilters] = useState<SearchFilters | undefined>(undefined);

  return (
    <AuthProvider>
      <Navbar />
      <main>
        {/* Section 1 — Hero + search */}
        <Hero onSearch={setFilters} />

        {/* Section 2 — Featured listings (scrolls to #listings) */}
        <ListingsGrid initialFilters={filters} />

        {/* Section 3 — Compounds map (52 markers) */}
        <CompoundsMap />

        {/* Section 4 — Smart Match quiz */}
        <SmartMatch />

        {/* Section 5 — ROI calculator */}
        <ROICalculator />

        {/* Section 6 — Concierge inquiry form */}
        <InquiryForm />
      </main>
      <Footer />
    </AuthProvider>
  );
}

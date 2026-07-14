'use client';

/**
 * Shared context for the single unified client page (app/client/HomePortal.tsx).
 *
 * The client site is one page composed of many migrated sections (featured
 * listings, full properties grid, compounds intelligence, virtual tour). Any
 * property card in any section can open the property-detail view in an overlay
 * modal instead of navigating to a separate route — this context carries the
 * `openProperty` handler down to those cards without prop-drilling.
 */
import React, { createContext, useContext } from 'react';

type ClientPageCtx = {
  openProperty: (id: string) => void;
  scrollTo: (id: string) => void;
};

const noop = () => {};
const Ctx = createContext<ClientPageCtx>({ openProperty: noop, scrollTo: noop });

export function ClientPageProvider({
  value,
  children,
}: {
  value: ClientPageCtx;
  children: React.ReactNode;
}) {
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useClientPage() {
  return useContext(Ctx);
}

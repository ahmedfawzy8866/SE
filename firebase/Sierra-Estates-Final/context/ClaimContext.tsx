import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

export interface ClaimData {
  name: string;
  phone: string;
  email?: string;
  message?: string;
  budget: string;
  preferredType: string;
  compound?: string;
  txType?: string;
}

interface ClaimContextType {
  claimData: ClaimData | null;
  hasClaimed: boolean;
  saveClaim: (data: ClaimData) => void;
  clearClaim: () => void;
}

const ClaimContext = createContext<ClaimContextType>({
  claimData: null,
  hasClaimed: false,
  saveClaim: () => {},
  clearClaim: () => {},
});

const STORAGE_KEY = "@sierra_estates_claim";

export function ClaimProvider({ children }: { children: React.ReactNode }) {
  const [claimData, setClaimData] = useState<ClaimData | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((val) => {
      if (val) setClaimData(JSON.parse(val));
    });
  }, []);

  const saveClaim = useCallback((data: ClaimData) => {
    setClaimData(data);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, []);

  const clearClaim = useCallback(() => {
    setClaimData(null);
    AsyncStorage.removeItem(STORAGE_KEY);
  }, []);

  return (
    <ClaimContext.Provider value={{ claimData, hasClaimed: !!claimData, saveClaim, clearClaim }}>
      {children}
    </ClaimContext.Provider>
  );
}

export function useClaim() {
  return useContext(ClaimContext);
}

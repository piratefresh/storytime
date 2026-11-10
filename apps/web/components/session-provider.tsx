"use client";

import { createContext, useContext } from "react";
import type { Session, User } from "@/lib/auth";

interface SessionProviderProps {
  user: User | null;
  session: Session | null;
}

const SessionContext = createContext<SessionProviderProps | null>(null);

export function SessionProvider({
  children,
  value,
}: {
  children: React.ReactNode;
  value: SessionProviderProps;
}) {
  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

export const useSession = () => {
  const sessionContext = useContext(SessionContext);

  if (!sessionContext) {
    throw new Error("useSession must be used within a SessionProvider");
  }

  return sessionContext;
};

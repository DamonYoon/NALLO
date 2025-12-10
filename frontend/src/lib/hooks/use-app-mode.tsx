"use client";

import React, { useState, useCallback, createContext, useContext, ReactNode } from "react";

/* ============================================
   Types
   ============================================ */

export type AppMode = "user" | "admin";

interface AppModeContextValue {
  mode: AppMode;
  isUserMode: boolean;
  isAdminMode: boolean;
  setMode: (mode: AppMode) => void;
  toggleMode: () => void;
  switchToUser: () => void;
  switchToAdmin: () => void;
}

/* ============================================
   Context
   ============================================ */

const AppModeContext = createContext<AppModeContextValue | null>(null);

/* ============================================
   Provider
   ============================================ */

interface AppModeProviderProps {
  children: ReactNode;
  defaultMode?: AppMode;
}

export function AppModeProvider({
  children,
  defaultMode = "user",
}: AppModeProviderProps) {
  const [mode, setModeState] = useState<AppMode>(defaultMode);

  const setMode = useCallback((newMode: AppMode) => {
    setModeState(newMode);
  }, []);

  const toggleMode = useCallback(() => {
    setModeState((prev) => (prev === "user" ? "admin" : "user"));
  }, []);

  const switchToUser = useCallback(() => {
    setModeState("user");
  }, []);

  const switchToAdmin = useCallback(() => {
    setModeState("admin");
  }, []);

  const value: AppModeContextValue = {
    mode,
    isUserMode: mode === "user",
    isAdminMode: mode === "admin",
    setMode,
    toggleMode,
    switchToUser,
    switchToAdmin,
  };

  return (
    <AppModeContext.Provider value={value}>{children}</AppModeContext.Provider>
  );
}

/* ============================================
   Hook
   ============================================ */

export function useAppMode(): AppModeContextValue {
  const context = useContext(AppModeContext);

  if (!context) {
    throw new Error("useAppMode must be used within an AppModeProvider");
  }

  return context;
}

/* ============================================
   Optional: Safe hook (doesn't throw)
   ============================================ */

export function useAppModeSafe(): AppModeContextValue | null {
  return useContext(AppModeContext);
}


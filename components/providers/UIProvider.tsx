"use client";

import { createContext, useContext, useState } from "react";

interface UIContextType {
  isDialogOpen: boolean;
  setDialogOpen: (open: boolean) => void;
}

const UIContext = createContext<UIContextType | null>(null);

export function UIProvider({ children }: { children: React.ReactNode }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <UIContext.Provider
      value={{
        isDialogOpen,
        setDialogOpen: setIsDialogOpen,
      }}
    >
      {children}
    </UIContext.Provider>
  );
}

export function useUI() {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error("useUI must be used within a UIProvider");
  }
  return context;
}

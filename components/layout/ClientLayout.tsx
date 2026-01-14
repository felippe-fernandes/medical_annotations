"use client";

import { BottomNav } from "@/components/layout/BottomNav";
import { useUI } from "@/components/providers/UIProvider";

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const { isDialogOpen } = useUI();

  return (
    <>
      {children}
      {!isDialogOpen && <BottomNav />}
    </>
  );
}

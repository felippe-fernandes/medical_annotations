"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 2, // Reduzido para 2 tentativas (total de 3 com a primeira)
            retryDelay: (attemptIndex) => Math.min(1000 * (attemptIndex + 1), 5000),
            staleTime: 5 * 60 * 1000, // 5 minutos
            refetchOnWindowFocus: false,
            networkMode: 'always', // Sempre tenta fazer a requisição
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

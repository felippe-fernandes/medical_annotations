import type { Metadata, Viewport } from "next";
import "./globals.css";
import "react-datepicker/dist/react-datepicker.css";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { UIProvider } from "@/components/providers/UIProvider";
import { ClientLayout } from "@/components/layout/ClientLayout";

export const metadata: Metadata = {
  title: "Anotações Médicas",
  description: "Sistema de anotações médicas para acompanhamento de pacientes",
  manifest: "/manifest.json",
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Med Notes",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0f172a",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="antialiased pb-16 md:pb-0">
        <QueryProvider>
          <UIProvider>
            <ClientLayout>{children}</ClientLayout>
          </UIProvider>
        </QueryProvider>
      </body>
    </html>
  );
}

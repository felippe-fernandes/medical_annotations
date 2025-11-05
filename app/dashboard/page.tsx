import { Logo } from "@/components/layout/Logo";
import { DashboardClient } from "@/components/dashboard/DashboardClient";

export default function DashboardPage() {
  return (
    <>
      <div className="max-w-6xl mx-auto p-4">
        {/* Header with Logo */}
        <div className="mb-6">
          <Logo />
          <p className="text-slate-400 mt-4">Visão geral do sistema de anotações médicas</p>
        </div>
      </div>
      <DashboardClient />
    </>
  );
}

import { PatientForm } from "@/components/patients/PatientForm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/layout/Logo";

export default function NewPatientPage() {
  return (
    <div className="min-h-screen bg-slate-900">
      <div className="max-w-2xl mx-auto p-4">
        {/* Logo */}
        <div className="mb-4">
          <Logo />
        </div>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link
            href="/patients"
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-2xl font-bold text-slate-100">Novo Paciente</h1>
        </div>

        {/* Form */}
        <div className="bg-slate-800 rounded-lg shadow p-6">
          <PatientForm />
        </div>
      </div>
    </div>
  );
}
